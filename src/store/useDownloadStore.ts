import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface DownloadHistoryItem {
  id: string; // unique download id
  songId: string;
  title: string;
  artist: string;
  cover: string;
  timestamp: number;
  filePath?: string;
  quality: string;
}

interface DownloadState {
  history: DownloadHistoryItem[];
  addToHistory: (item: DownloadHistoryItem) => void;
  removeFromHistory: (id: string) => void;
  clearHistory: () => void;
}

export const useDownloadStore = create<DownloadState>()(
  persist(
    (set) => ({
      history: [],
      addToHistory: (item) =>
        set((state) => ({
          history: [item, ...state.history],
        })),
      removeFromHistory: (id) =>
        set((state) => ({
          history: state.history.filter((item) => item.id !== id),
        })),
      clearHistory: () => set({ history: [] }),
    }),
    {
      name: 'download-history',
    }
  )
);
