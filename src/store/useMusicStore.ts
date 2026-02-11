import { create } from 'zustand';

export interface MusicInfo {
  type: 'song';
  id: string;
  title: string;
  artist: string;
  album: string;
  cover: string;
  duration: number;
  quality: string[];
  provider?: 'netease' | 'qq' | 'kugou';
}

interface MusicState {
  musicInfo: MusicInfo | null;
  isLoading: boolean;
  error: string | null;
  setMusicInfo: (info: MusicInfo | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useMusicStore = create<MusicState>((set) => ({
  musicInfo: null,
  isLoading: false,
  error: null,
  setMusicInfo: (info) => set({ musicInfo: info, error: null }),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
}));
