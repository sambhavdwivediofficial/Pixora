/**
 * Pixora IndexedDB Service
 * All file storage goes through IndexedDB — zero filesystem usage.
 */

const DB_NAME = 'PixoraDB';
const DB_VERSION = 1;
const STORE_NAME = 'images';

let _db = null;

function openDB() {
  if (_db) return Promise.resolve(_db);

  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);

    req.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'key' });
      }
    };

    req.onsuccess = (e) => {
      _db = e.target.result;
      resolve(_db);
    };

    req.onerror = (e) => reject(e.target.error);
  });
}

export async function idbSet(key, value) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const req = store.put({ key, value });
    req.onsuccess = () => resolve(true);
    req.onerror = (e) => reject(e.target.error);
  });
}

export async function idbGet(key) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const req = store.get(key);
    req.onsuccess = (e) => resolve(e.target.result?.value ?? null);
    req.onerror = (e) => reject(e.target.error);
  });
}

export async function idbDelete(key) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const req = store.delete(key);
    req.onsuccess = () => resolve(true);
    req.onerror = (e) => reject(e.target.error);
  });
}

export async function idbClearAll() {
  if (_db) {
    _db.close();
    _db = null;
  }
  return new Promise((resolve, reject) => {
    const req = indexedDB.deleteDatabase(DB_NAME);
    req.onsuccess = () => resolve(true);
    req.onerror = (e) => reject(e.target.error);
    req.onblocked = () => resolve(true); // proceed even if blocked
  });
}

/** Store an ArrayBuffer or Blob under a key */
export async function storeFile(key, data) {
  let buffer;
  if (data instanceof Blob) {
    buffer = await data.arrayBuffer();
  } else if (data instanceof ArrayBuffer) {
    buffer = data;
  } else {
    throw new Error('storeFile: data must be Blob or ArrayBuffer');
  }
  await idbSet(key, buffer);
}

/** Retrieve stored file as Blob */
export async function retrieveFile(key, mimeType = 'application/octet-stream') {
  const buffer = await idbGet(key);
  if (!buffer) return null;
  return new Blob([buffer], { type: mimeType });
}