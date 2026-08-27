/**
 * Offline Media & Audio Storage Engine using browser IndexedDB
 * Persists full binary video and MP3 blobs for true offline playback
 */

const DB_NAME = 'VideoHubOfflineDB';
const DB_VERSION = 1;
const STORE_DOWNLOADS = 'offline_downloads';
const STORE_AUDIOS = 'converted_audios';

let dbInstance: IDBDatabase | null = null;

function getDB(): Promise<IDBDatabase> {
  if (dbInstance) return Promise.resolve(dbInstance);

  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      reject(new Error('IndexedDB is not supported in this environment'));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_DOWNLOADS)) {
        db.createObjectStore(STORE_DOWNLOADS, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(STORE_AUDIOS)) {
        db.createObjectStore(STORE_AUDIOS, { keyPath: 'id' });
      }
    };

    request.onsuccess = (event) => {
      dbInstance = (event.target as IDBOpenDBRequest).result;
      resolve(dbInstance);
    };

    request.onerror = (event) => {
      reject((event.target as IDBOpenDBRequest).error);
    };
  });
}

// Memory cache for active Blob URLs so they don't get recreated excessively
const blobUrlCache = new Map<string, string>();

export async function saveOfflineMediaBlob(id: string, blob: Blob, metadata: any = {}): Promise<void> {
  try {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_DOWNLOADS, 'readwrite');
      const store = tx.objectStore(STORE_DOWNLOADS);
      const record = {
        id,
        blob,
        size: blob.size,
        type: blob.type || 'video/mp4',
        savedAt: new Date().toISOString(),
        ...metadata
      };
      const req = store.put(record);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('Failed to save media to IndexedDB:', err);
  }
}

export async function getOfflineMediaBlob(id: string): Promise<Blob | null> {
  try {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_DOWNLOADS, 'readonly');
      const store = tx.objectStore(STORE_DOWNLOADS);
      const req = store.get(id);
      req.onsuccess = () => {
        if (req.result && req.result.blob) {
          resolve(req.result.blob);
        } else {
          resolve(null);
        }
      };
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('Failed to load media from IndexedDB:', err);
    return null;
  }
}

export async function getOfflineMediaBlobUrl(id: string): Promise<string | null> {
  if (blobUrlCache.has(id)) {
    return blobUrlCache.get(id)!;
  }
  const blob = await getOfflineMediaBlob(id);
  if (blob) {
    const url = URL.createObjectURL(blob);
    blobUrlCache.set(id, url);
    return url;
  }
  return null;
}

export async function deleteOfflineMediaBlob(id: string): Promise<void> {
  try {
    if (blobUrlCache.has(id)) {
      URL.revokeObjectURL(blobUrlCache.get(id)!);
      blobUrlCache.delete(id);
    }
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_DOWNLOADS, 'readwrite');
      const store = tx.objectStore(STORE_DOWNLOADS);
      const req = store.delete(id);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('Failed to delete media from IndexedDB:', err);
  }
}

export async function saveConvertedAudioBlob(id: string, blob: Blob, metadata: any = {}): Promise<void> {
  try {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_AUDIOS, 'readwrite');
      const store = tx.objectStore(STORE_AUDIOS);
      const record = {
        id,
        blob,
        size: blob.size,
        type: blob.type || 'audio/mp3',
        savedAt: new Date().toISOString(),
        ...metadata
      };
      const req = store.put(record);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('Failed to save audio to IndexedDB:', err);
  }
}

export async function getConvertedAudioBlob(id: string): Promise<Blob | null> {
  try {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_AUDIOS, 'readonly');
      const store = tx.objectStore(STORE_AUDIOS);
      const req = store.get(id);
      req.onsuccess = () => {
        if (req.result && req.result.blob) {
          resolve(req.result.blob);
        } else {
          resolve(null);
        }
      };
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('Failed to load audio from IndexedDB:', err);
    return null;
  }
}

export async function deleteConvertedAudioBlob(id: string): Promise<void> {
  try {
    if (blobUrlCache.has(`audio_${id}`)) {
      URL.revokeObjectURL(blobUrlCache.get(`audio_${id}`)!);
      blobUrlCache.delete(`audio_${id}`);
    }
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_AUDIOS, 'readwrite');
      const store = tx.objectStore(STORE_AUDIOS);
      const req = store.delete(id);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('Failed to delete audio from IndexedDB:', err);
  }
}
