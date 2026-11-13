/**
 * Optional "auto-sync to a local file" backup using the File System Access API
 * (Chromium only). The chosen file handle is kept in IndexedDB so it survives
 * reloads; writing requires the user to have granted readwrite permission in
 * this session, otherwise we surface a "resume sync" action (user gesture).
 */

const DB_NAME = 'forcecraft-backup';
const STORE = 'handles';
const KEY = 'backup-file';

type PermissionMode = { mode: 'readwrite' };
interface PermissionedHandle extends FileSystemFileHandle {
  queryPermission?: (d: PermissionMode) => Promise<PermissionState>;
  requestPermission?: (d: PermissionMode) => Promise<PermissionState>;
}

type SaveFilePicker = (options: {
  suggestedName: string;
  types: { description: string; accept: Record<string, string[]> }[];
}) => Promise<FileSystemFileHandle>;

export type FileSyncStatus = 'unsupported' | 'off' | 'active' | 'needs-permission';

export function supportsFileSync(): boolean {
  return typeof window !== 'undefined' && 'showSaveFilePicker' in window;
}

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(STORE);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function idb<T>(mode: IDBTransactionMode, run: (store: IDBObjectStore) => IDBRequest): Promise<T> {
  const db = await openDb();
  return new Promise<T>((resolve, reject) => {
    const req = run(db.transaction(STORE, mode).objectStore(STORE));
    req.onsuccess = () => resolve(req.result as T);
    req.onerror = () => reject(req.error);
  });
}

export async function loadSavedHandle(): Promise<PermissionedHandle | null> {
  if (!supportsFileSync()) return null;
  try {
    return (await idb<PermissionedHandle | undefined>('readonly', (s) => s.get(KEY))) ?? null;
  } catch {
    return null;
  }
}

export async function forgetHandle(): Promise<void> {
  await idb('readwrite', (s) => s.delete(KEY));
}

export async function chooseBackupFile(): Promise<PermissionedHandle | null> {
  if (!supportsFileSync()) return null;
  const picker = (window as unknown as { showSaveFilePicker: SaveFilePicker }).showSaveFilePicker;
  try {
    const handle = (await picker({
      suggestedName: 'forcecraft-backup.json',
      types: [{ description: 'ForceCraft 学习档案', accept: { 'application/json': ['.json'] } }],
    })) as PermissionedHandle;
    await idb('readwrite', (s) => s.put(handle, KEY));
    return handle;
  } catch {
    return null; // user cancelled
  }
}

export async function getPermission(handle: PermissionedHandle, request: boolean): Promise<boolean> {
  const desc: PermissionMode = { mode: 'readwrite' };
  if (!handle.queryPermission) return true;
  if ((await handle.queryPermission(desc)) === 'granted') return true;
  if (!request || !handle.requestPermission) return false;
  return (await handle.requestPermission(desc)) === 'granted';
}

export async function writeBackup(handle: FileSystemFileHandle, json: string): Promise<void> {
  const writable = await handle.createWritable();
  await writable.write(json);
  await writable.close();
}

/** Ask the browser not to evict localStorage/IndexedDB under storage pressure. */
export async function requestPersistentStorage(): Promise<void> {
  try {
    if (navigator.storage?.persist && !(await navigator.storage.persisted())) {
      await navigator.storage.persist();
    }
  } catch {
    /* best effort */
  }
}
