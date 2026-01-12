import localforage from 'localforage';
import type { SyncQueueItem, PendingDiagnosis } from '@/types/api';

// Configure localforage instances
export const syncQueueStore = localforage.createInstance({
  name: 'swafarms',
  storeName: 'sync_queue',
});

export const pendingDiagnosisStore = localforage.createInstance({
  name: 'swafarms',
  storeName: 'pending_diagnosis',
});

export const cacheStore = localforage.createInstance({
  name: 'swafarms',
  storeName: 'api_cache',
});

// Sync Queue Management
export async function addToSyncQueue(item: Omit<SyncQueueItem, 'id' | 'createdAt' | 'retryCount'>): Promise<string> {
  const id = `sync_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const queueItem: SyncQueueItem = {
    ...item,
    id,
    createdAt: new Date().toISOString(),
    retryCount: 0,
  };
  await syncQueueStore.setItem(id, queueItem);
  return id;
}

export async function getSyncQueue(): Promise<SyncQueueItem[]> {
  const items: SyncQueueItem[] = [];
  await syncQueueStore.iterate((value: SyncQueueItem) => {
    items.push(value);
  });
  return items.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
}

export async function removeFromSyncQueue(id: string): Promise<void> {
  await syncQueueStore.removeItem(id);
}

export async function updateSyncQueueItem(id: string, updates: Partial<SyncQueueItem>): Promise<void> {
  const item = await syncQueueStore.getItem<SyncQueueItem>(id);
  if (item) {
    await syncQueueStore.setItem(id, { ...item, ...updates });
  }
}

export async function clearSyncQueue(): Promise<void> {
  await syncQueueStore.clear();
}

// Pending Diagnosis Management
export async function addPendingDiagnosis(imageBlob: Blob, plotId?: string): Promise<string> {
  const id = `diag_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const pending: PendingDiagnosis = {
    id,
    imageBlob,
    plotId,
    createdAt: new Date().toISOString(),
    status: 'pending',
  };
  await pendingDiagnosisStore.setItem(id, pending);
  return id;
}

export async function getPendingDiagnoses(): Promise<PendingDiagnosis[]> {
  const items: PendingDiagnosis[] = [];
  await pendingDiagnosisStore.iterate((value: PendingDiagnosis) => {
    items.push(value);
  });
  return items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function updatePendingDiagnosis(id: string, updates: Partial<PendingDiagnosis>): Promise<void> {
  const item = await pendingDiagnosisStore.getItem<PendingDiagnosis>(id);
  if (item) {
    await pendingDiagnosisStore.setItem(id, { ...item, ...updates });
  }
}

export async function removePendingDiagnosis(id: string): Promise<void> {
  await pendingDiagnosisStore.removeItem(id);
}

// API Cache Management
export async function setCacheItem<T>(key: string, data: T, ttlMs: number = 5 * 60 * 1000): Promise<void> {
  const cacheItem = {
    data,
    expiresAt: Date.now() + ttlMs,
    cachedAt: Date.now(),
  };
  await cacheStore.setItem(key, cacheItem);
}

export async function getCacheItem<T>(key: string): Promise<{ data: T; cachedAt: number } | null> {
  const item = await cacheStore.getItem<{ data: T; expiresAt: number; cachedAt: number }>(key);
  if (!item) return null;
  // Return even expired cache for offline use - let caller decide
  return { data: item.data, cachedAt: item.cachedAt };
}

export async function clearCache(): Promise<void> {
  await cacheStore.clear();
}

// Storage size estimation
export async function getStorageEstimate(): Promise<{ used: number; available: number }> {
  if ('storage' in navigator && 'estimate' in navigator.storage) {
    const estimate = await navigator.storage.estimate();
    return {
      used: estimate.usage || 0,
      available: estimate.quota || 0,
    };
  }
  return { used: 0, available: 0 };
}
