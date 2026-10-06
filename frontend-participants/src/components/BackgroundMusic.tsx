'use client';

import { useEffect, useRef } from 'react';
import { useMusicStore } from '@/store/musicStore';

export default function BackgroundMusic() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const { isPlaying, volume } = useMusicStore();

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.play().catch((err) => {
        console.error('Error playing background music:', err);
      });
    } else {
      audio.pause();
    }
  }, [isPlaying]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  return (
    <audio
      ref={audioRef}
      src="/music-background.mp3"
      loop
      preload="auto"
      style={{ display: 'none' }}
    />
  );
}
