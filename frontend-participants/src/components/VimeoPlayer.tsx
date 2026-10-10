'use client';

import { useEffect, useRef, useState } from 'react';

interface VimeoPlayerProps {
  videoId: string; // ID del video de Vimeo
  onEnded?: () => void; // Callback cuando el video termina
  autoplay?: boolean; // Auto reproducir
  allowFullscreen?: boolean;
  controls?: boolean; // Mostrar controles de video
  title?: string;
  muted?: boolean;
}

declare global {
  interface Window {
    Vimeo: any;
  }
}

export default function VimeoPlayer({
  videoId,
  onEnded,
  autoplay = false,
  allowFullscreen = true,
  controls = true,
  title = 'Video de Vimeo',
  muted = false,
}: VimeoPlayerProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const playerRef = useRef<any>(null);
  const [isPlaying, setIsPlaying] = useState(autoplay);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Cargar el SDK de Vimeo Player
    if (window.Vimeo) {
      // El SDK ya está cargado
      if (iframeRef.current) {
        initializePlayer();
      }
    } else {
      const script = document.createElement('script');
      script.src = 'https://player.vimeo.com/api/player.js';
      script.async = true;
      
      script.onload = () => {
        if (iframeRef.current) {
          initializePlayer();
        }
      };

      document.body.appendChild(script);

      return () => {
        if (document.body.contains(script)) {
          document.body.removeChild(script);
        }
      };
    }
  }, [videoId]);

  const initializePlayer = () => {
    if (!iframeRef.current || !window.Vimeo) return;

    try {
      playerRef.current = new window.Vimeo.Player(iframeRef.current);
      
      // Configurar eventos
      playerRef.current.on('ended', () => {
        setIsPlaying(false);
        onEnded?.();
      });

      playerRef.current.on('play', () => {
        setIsPlaying(true);
      });

      playerRef.current.on('pause', () => {
        setIsPlaying(false);
      });

      playerRef.current.on('loaded', () => {
        setIsLoaded(true);
        // Auto reproducir si está configurado
        if (autoplay) {
          playerRef.current.play().catch((err: any) => {
            console.log('Autoplay blocked:', err);
          });
        }
      });
    } catch (err) {
      console.error('Error initializing Vimeo player:', err);
    }
  };

  const handlePlayPause = () => {
    if (playerRef.current) {
      if (isPlaying) {
        playerRef.current.pause();
      } else {
        playerRef.current.play();
      }
    }
  };

  const iframeUrl = `https://player.vimeo.com/video/${videoId}?h=${videoId}&autoplay=${autoplay ? 1 : 0}&muted=${muted ? 1 : 0}&byline=false&portrait=false`;

  return (
    <div className="w-full bg-white overflow-hidden">
      <div className="h-full" style={{ paddingBottom: '56.25%' }}>
        <iframe
          ref={iframeRef}
          src={iframeUrl}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
          }}
          frameBorder="0"
          title={title}
          allowFullScreen={allowFullscreen}
          allow="autoplay; encrypted-media"
        />
      </div>
    </div>
  );
}
