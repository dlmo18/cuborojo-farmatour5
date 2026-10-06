import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface MusicStore {
  isPlaying: boolean;
  volume: number;
  toggleMusic: () => void;
  setVolume: (volume: number) => void;
  setIsPlaying: (isPlaying: boolean) => void;
}

export const useMusicStore = create<MusicStore>()(
  persist(
    (set, get) => ({
      isPlaying: true,
      volume: 0.3,
      toggleMusic: () => {
        const current = get().isPlaying;
        set({ isPlaying: !current });
      },
      setVolume: (volume: number) => {
        set({ volume: Math.max(0, Math.min(1, volume)) });
      },
      setIsPlaying: (isPlaying: boolean) => {
        set({ isPlaying });
      },
    }),
    {
      name: 'music-store',
      version: 1,
    }
  )
);
