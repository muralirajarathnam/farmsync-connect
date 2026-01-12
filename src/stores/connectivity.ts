import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ConnectivityState {
  isOnline: boolean;
  lastSyncTime: string | null;
  pendingSyncCount: number;
  setOnline: (online: boolean) => void;
  setLastSyncTime: (time: string) => void;
  setPendingSyncCount: (count: number) => void;
}

export const useConnectivityStore = create<ConnectivityState>()(
  persist(
    (set) => ({
      isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
      lastSyncTime: null,
      pendingSyncCount: 0,
      setOnline: (online) => set({ isOnline: online }),
      setLastSyncTime: (time) => set({ lastSyncTime: time }),
      setPendingSyncCount: (count) => set({ pendingSyncCount: count }),
    }),
    {
      name: 'swafarms-connectivity',
    }
  )
);

// Initialize online/offline listeners
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    useConnectivityStore.getState().setOnline(true);
  });
  window.addEventListener('offline', () => {
    useConnectivityStore.getState().setOnline(false);
  });
}
