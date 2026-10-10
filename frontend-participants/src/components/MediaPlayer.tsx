'use client';

import { useEffect, useRef, useState } from 'react';

interface MediaPlayerProps {
  videoSource: string; // URL MP4, URL Vimeo o ID de Vimeo
  onEnded?: () => void;
  autoplay?: boolean;
  allowFullscreen?: boolean;
  controls?: boolean;
  title?: string;
  muted?: boolean;
}

declare global {
  interface Window {
    Vimeo: any;
  }
}

/**
 * Componente versátil para reproducir videos MP4 o de Vimeo
 * Detecta automáticamente el tipo de fuente y renderiza el player apropiado
 */
export default function MediaPlayer({
  videoSource,
  onEnded,
  autoplay = false,
  allowFullscreen = true,
  controls = true,
  title = 'Video',
  muted = false,
}: MediaPlayerProps) {
  const htmlVideoRef = useRef<HTMLVideoElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const playerRef = useRef<any>(null);
  const [isVimeo, setIsVimeo] = useState(false);
  const [isMp4, setIsMp4] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Determinar tipo de fuente
  useEffect(() => {
    if (!videoSource) return;

    if (videoSource.includes('vimeo.com') || videoSource.match(/^\d+$/)) {
      setIsVimeo(true);
      setIsMp4(false);
    } else if (videoSource.includes('.mp4') || videoSource.startsWith('/videos/')) {
      setIsMp4(true);
      setIsVimeo(false);
    }
  }, [videoSource]);

  // Inicializar Vimeo Player
  useEffect(() => {
    if (!isVimeo) return;

    const vimeoId = videoSource.match(/^\d+$/) 
      ? videoSource 
      : videoSource.match(/(?:https?:\/\/)?(?:www\.)?(?:player\.)?vimeo\.com\/(?:video\/)?(\d+)/)?.[1];

    if (!vimeoId) return;

    if (window.Vimeo) {
      if (iframeRef.current) {
        initializeVimeoPlayer(vimeoId);
      }
    } else {
      const script = document.createElement('script');
      script.src = 'https://player.vimeo.com/api/player.js';
      script.async = true;
      
      script.onload = () => {
        if (iframeRef.current) {
          initializeVimeoPlayer(vimeoId);
        }
      };

      document.body.appendChild(script);

      return () => {
        if (document.body.contains(script)) {
          document.body.removeChild(script);
        }
      };
    }
  }, [isVimeo, videoSource]);

  const initializeVimeoPlayer = (vimeoId: string) => {
    if (!iframeRef.current || !window.Vimeo) return;

    try {
      playerRef.current = new window.Vimeo.Player(iframeRef.current);
      
      playerRef.current.on('ended', () => {
        onEnded?.();
      });

      playerRef.current.on('loaded', () => {
        setIsLoaded(true);
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

  // Manejo de video MP4
  const handleVideoEnded = () => {
    onEnded?.();
  };

  const handleVideoLoadedMetadata = () => {
    setIsLoaded(true);
    if (autoplay && htmlVideoRef.current) {
      htmlVideoRef.current.play().catch(err => {
        console.log('Autoplay blocked:', err);
      });
    }
  };

  // Renderizar player MP4
  if (isMp4) {
    return (
      <div className="w-full h-full bg-black overflow-hidden">
        <video
          ref={htmlVideoRef}
          className="w-full h-full object-contain"
          src={videoSource}
          controls={controls}
          autoPlay={autoplay}
          muted={muted}
          controlsList="nodownload"
          onEnded={handleVideoEnded}
          onLoadedMetadata={handleVideoLoadedMetadata}
          title={title}
          onContextMenu={(e) => e.preventDefault()}
        />
      </div>
    );
  }

  // Renderizar player Vimeo
  if (isVimeo) {
    const vimeoId = videoSource.match(/^\d+$/) 
      ? videoSource 
      : videoSource.match(/(?:https?:\/\/)?(?:www\.)?(?:player\.)?vimeo\.com\/(?:video\/)?(\d+)/)?.[1];

    const iframeUrl = `https://player.vimeo.com/video/${vimeoId}?h=${vimeoId}&autoplay=${autoplay ? 1 : 0}&muted=${muted ? 1 : 0}&byline=false&portrait=false`;

    return (
      <div className="w-full bg-white overflow-hidden">
        <div style={{ paddingBottom: '56.25%', position: 'relative' }}>
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

  return null;
}
