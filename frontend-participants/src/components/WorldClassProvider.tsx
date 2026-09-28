'use client';

import { useEffect } from 'react';
import { useWorldStore } from '@/store/worldStore';

/**
 * Componente que actualiza el className del body basado en el mundo actual
 * Agrega la clase "world-[slug]" al body para aplicar estilos específicos del mundo
 */
export function WorldClassProvider() {
  const currentWorld = useWorldStore((state) => state.currentWorld);

  useEffect(() => {
    const body = document.body;
    
    // Remover todas las clases world-* existentes
    const worldClasses = Array.from(body.classList).filter((cls) =>
      cls.startsWith('world-')
    );
    worldClasses.forEach((cls) => body.classList.remove(cls));

    // Agregar la nueva clase si hay un mundo actual con slug
    if (currentWorld?.slug) {
      body.classList.add(`world-${currentWorld.slug}`);
    }

    // Cleanup: remover clase al desmontar o cuando cambie el mundo
    return () => {
      if (currentWorld?.slug) {
        body.classList.remove(`world-${currentWorld.slug}`);
      }
    };
  }, [currentWorld?.slug]);

  return null;
}
