/** Client for the optional local ForceCraft Org Bridge (bridge/org-bridge.mjs). */

export const BRIDGE_URL = 'http://127.0.0.1:5199';

export interface OrgInfo {
  alias: string;
  username: string;
  instanceUrl: string;
  connectedStatus: string;
}

export type BridgeStatus =
  | { state: 'offline' }
  | { state: 'error'; error: string; message: string }
  | { state: 'connected'; org: OrgInfo };

export interface SoqlResult {
  ok: true;
  totalSize: number;
  done: boolean;
  records: Record<string, unknown>[];
}

export interface ApexResult {
  ok: true;
  compiled: boolean;
  success: boolean;
  compileProblem: string | null;
  exceptionMessage: string | null;
  exceptionStackTrace: string | null;
  line?: number;
  column?: number;
  debugLines: string[];
  limitLines: string[];
}

export interface BridgeError {
  ok: false;
  error: string;
  message?: string;
}

// Modern Web Guidance (local-network-access): declare the loopback target explicitly.
// Older Chromium builds use a different IPAddressSpace enum and throw a TypeError for
// 'loopback'; since this page is itself served from loopback the hint is optional, so
// retry without it.
async function bridgeFetch(url: string, init: RequestInit): Promise<Response> {
  try {
    return await fetch(url, { ...init, mode: 'cors', targetAddressSpace: 'loopback' } as RequestInit);
  } catch (err) {
    if (err instanceof TypeError && /targetAddressSpace|IPAddressSpace/.test(err.message)) {
      return fetch(url, { ...init, mode: 'cors' });
    }
    throw err;
  }
}

export async function getBridgeStatus(): Promise<BridgeStatus> {
  try {
    const res = await bridgeFetch(`${BRIDGE_URL}/status`, { signal: AbortSignal.timeout(20_000) });
    const body = await res.json();
    if (body.ok) return { state: 'connected', org: body.org };
    return { state: 'error', error: body.error, message: body.message ?? '' };
  } catch {
    return { state: 'offline' };
  }
}

async function post<T>(path: string, payload: unknown): Promise<T | BridgeError> {
  try {
    const res = await bridgeFetch(`${BRIDGE_URL}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(100_000),
    });
    return (await res.json()) as T | BridgeError;
  } catch (err) {
    return { ok: false, error: 'BRIDGE_OFFLINE', message: String(err) };
  }
}

export const runOrgSoql = (query: string) => post<SoqlResult>('/soql', { query });
export const runOrgApex = (code: string) => post<ApexResult>('/apex', { code });

/** Flattens nested relationship objects (Account: { Name }) into "Account.Name" columns. */
export function flattenRecord(record: Record<string, unknown>, prefix = ''): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [key, value] of Object.entries(record)) {
    if (key === 'attributes') continue;
    const col = prefix ? `${prefix}.${key}` : key;
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      const nested = value as Record<string, unknown>;
      if (Array.isArray(nested.records)) out[col] = `${nested.records.length} 条子记录`;
      else Object.assign(out, flattenRecord(nested, col));
    } else {
      out[col] = value === null || value === undefined ? '' : String(value);
    }
  }
  return out;
}
