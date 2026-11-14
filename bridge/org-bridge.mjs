#!/usr/bin/env node
/**
 * ForceCraft Org Bridge
 * ---------------------
 * A tiny local companion that lets the study app run *real* SOQL queries and
 * anonymous Apex against YOUR OWN Salesforce Developer Edition org, using the
 * official Salesforce CLI (`sf`). Zero npm dependencies.
 *
 * Setup (once):
 *   npm install -g @salesforce/cli
 *   sf org login web --alias forcecraft
 * Run:
 *   npm run org-bridge                      # uses alias "forcecraft"
 *   FORCECRAFT_ORG=myOrg npm run org-bridge  # use another alias / username
 *
 * Safety:
 *   - Listens on 127.0.0.1 only (never exposed to the network).
 *   - Only accepts requests whose Origin is the ForceCraft app (localhost:5188).
 *   - Anonymous Apex really executes in your org. Use a Developer Edition or
 *     scratch org, never production.
 */
import http from 'node:http';
import { execFile } from 'node:child_process';
import { writeFile, rm, mkdtemp } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const PORT = Number(process.env.FORCECRAFT_BRIDGE_PORT || 5199);
const ORG = process.env.FORCECRAFT_ORG || 'forcecraft';
const SF_BIN = process.env.FORCECRAFT_SF_BIN || 'sf';
const ALLOWED_ORIGINS = new Set(['http://localhost:5188', 'http://127.0.0.1:5188']);
const MAX_BODY = 100_000;
const TIMEOUT_MS = 90_000;

function runSf(args) {
  return new Promise((resolve) => {
    execFile(SF_BIN, [...args, '--json'], { timeout: TIMEOUT_MS, maxBuffer: 20 * 1024 * 1024 }, (error, stdout, stderr) => {
      if (error && error.code === 'ENOENT') {
        resolve({ ok: false, error: 'SF_CLI_MISSING', message: '没有找到 Salesforce CLI（sf）。请先运行 npm install -g @salesforce/cli' });
        return;
      }
      try {
        const json = JSON.parse(stdout || '{}');
        if (json.status === 0) resolve({ ok: true, result: json.result });
        else resolve({ ok: false, error: json.name || 'SF_ERROR', message: json.message || stderr || 'sf command failed' });
      } catch {
        resolve({ ok: false, error: 'SF_OUTPUT', message: (stderr || stdout || String(error || '')).slice(0, 2000) });
      }
    });
  });
}

let statusCache = { at: 0, value: null };
async function orgStatus() {
  if (statusCache.value && Date.now() - statusCache.at < 30_000) return statusCache.value;
  const res = await runSf(['org', 'display', '--target-org', ORG]);
  const value = res.ok
    ? {
        ok: true,
        org: {
          alias: res.result.alias || ORG,
          username: res.result.username,
          instanceUrl: res.result.instanceUrl,
          connectedStatus: res.result.connectedStatus,
        },
      }
    : { ...res, alias: ORG };
  statusCache = { at: Date.now(), value };
  return value;
}

async function runSoql(query) {
  const res = await runSf(['data', 'query', '--query', query, '--target-org', ORG]);
  if (!res.ok) return res;
  const records = (res.result.records || []).map(({ attributes, ...rest }) => rest);
  return { ok: true, totalSize: res.result.totalSize, done: res.result.done, records };
}

async function runApex(code) {
  const dir = await mkdtemp(join(tmpdir(), 'forcecraft-apex-'));
  const file = join(dir, 'snippet.apex');
  try {
    await writeFile(file, code, 'utf8');
    const res = await runSf(['apex', 'run', '--file', file, '--target-org', ORG]);
    if (!res.ok) return res;
    const r = res.result;
    const debugLines = String(r.logs || '')
      .split('\n')
      .filter((l) => l.includes('|USER_DEBUG|'))
      .map((l) => l.split('|').slice(4).join('|'));
    const limitLines = String(r.logs || '')
      .split('\n')
      .filter((l) => /Number of (SOQL queries|DML statements|query rows)|Maximum CPU time|Maximum heap size/.test(l))
      .map((l) => l.trim());
    return {
      ok: true,
      compiled: r.compiled,
      success: r.success,
      compileProblem: r.compileProblem || null,
      exceptionMessage: r.exceptionMessage || null,
      exceptionStackTrace: r.exceptionStackTrace || null,
      line: r.line,
      column: r.column,
      debugLines,
      limitLines,
    };
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
}

function send(res, origin, status, body) {
  const headers = { 'Content-Type': 'application/json; charset=utf-8', Vary: 'Origin' };
  if (origin && ALLOWED_ORIGINS.has(origin)) {
    headers['Access-Control-Allow-Origin'] = origin;
    headers['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS';
    headers['Access-Control-Allow-Headers'] = 'Content-Type';
  }
  res.writeHead(status, headers);
  res.end(body === undefined ? '' : JSON.stringify(body));
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks = [];
    req.on('data', (c) => {
      size += c.length;
      if (size > MAX_BODY) {
        reject(new Error('BODY_TOO_LARGE'));
        req.destroy();
      } else chunks.push(c);
    });
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    req.on('error', reject);
  });
}

const server = http.createServer(async (req, res) => {
  const origin = req.headers.origin;
  // Browsers always send Origin on cross-origin requests; reject anything not from the app.
  if (!origin || !ALLOWED_ORIGINS.has(origin)) return send(res, null, 403, { ok: false, error: 'FORBIDDEN_ORIGIN' });
  if (req.method === 'OPTIONS') return send(res, origin, 204);

  try {
    if (req.method === 'GET' && req.url === '/status') return send(res, origin, 200, await orgStatus());

    if (req.method === 'POST' && (req.url === '/soql' || req.url === '/apex')) {
      const payload = JSON.parse(await readBody(req));
      if (req.url === '/soql') {
        const query = String(payload.query || '').trim();
        if (!/^select\s/i.test(query)) return send(res, origin, 400, { ok: false, error: 'BAD_QUERY', message: '只支持 SELECT 查询' });
        return send(res, origin, 200, await runSoql(query));
      }
      const code = String(payload.code || '');
      if (!code.trim()) return send(res, origin, 400, { ok: false, error: 'EMPTY_CODE' });
      return send(res, origin, 200, await runApex(code));
    }
    return send(res, origin, 404, { ok: false, error: 'NOT_FOUND' });
  } catch (err) {
    return send(res, origin, 500, { ok: false, error: 'BRIDGE_ERROR', message: String(err && err.message ? err.message : err) });
  }
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`ForceCraft Org Bridge 已启动：http://127.0.0.1:${PORT}  (org: ${ORG})`);
  console.log('保持这个窗口打开；在 ForceCraft 编程实验室的「我的 Org」页里使用。按 Ctrl+C 退出。');
});
