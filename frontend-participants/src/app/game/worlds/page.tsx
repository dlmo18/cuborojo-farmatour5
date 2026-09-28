'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { useAuthCheck } from '@/hooks/useAuthCheck';
import BottomStats from '@/components/BottomStats';
import Image from 'next/image';

interface World {
  id: string;
  name: string;
  description: string;
  orderNum: number;
  imageId?: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export default function WorldsPage() {
  const router = useRouter();
  const { isHydrated } = useAuthCheck({ redirectTo: '/login' });
  const [worlds, setWorlds] = useState<World[]>([]);

  const fetchWorlds = useCallback(async () => {
    try {
      const res = await axios.get(`${API_URL}/worlds`);
      const reversedWorlds = res.data.data?.reverse();
      setWorlds(reversedWorlds || res.data);
    } catch (err) {
      console.error('Error fetching worlds:', err);
    }
  }, []);

  // Función para obtener la URL de la imagen de un mundo
  const getWorldImageUrl = (imageId?: string): string => {
    if (!imageId) return '/images/world-default.png';
    return `${API_URL}/media/serve/${imageId}`;
  };

  useEffect(() => {
    if (!isHydrated) return;
    fetchWorlds();
  }, [isHydrated, fetchWorlds]);

  return (
    <div className="min-h-screen world-page">
      <div className="max-w-md mx-auto">
        {/* Header con botón de menú */}
        <div className="header fixed top-0 left-0 w-full py-4 pb-10 bg-gradient-to-b from-black/80 to-black/0">
          <div className="max-w-md mx-auto flex px-4 justify-between items-center">
            <button onClick={() => router.push('/game')}>
              <Image
                src="/images/btn-back.png"
                alt="Atrás"
                width={50}
                height={50}
                className="h-auto"
                priority
              />
            </button>
            <h1 className="text-4xl font-bold text-white" style={{ fontFamily: "'Blinker', sans-serif" }}>
              <Image
                src="/images/logo-header.png"
                alt="Farmatour 5"
                width={160}
                height={80}
                className="header-logo object-contain"
                priority
              />
            </h1>
            <button
              onClick={() => router.push('/game/setting')}
              className="rounded-lg shadow-lg hover:shadow-2xl transition text-2xl"
            >
              <Image
                src="/images/btn-menu.png"
                alt="Menú"
                width={50}
                height={50}
                className="h-auto"
                priority
              />
            </button>
          </div>
        </div>

        {/* Worlds list */}
        <div className="gap-6">
          <div className="world-top">
            <Image
              src="/images/world-top.jpg"
              alt="Mundo Superior"
              width={160}
              height={80}
              className="w-full h-auto"
              priority
            />
          </div>
          {worlds.map((world, index) => (
            <button
              key={world.id}
              onClick={() => router.push(`/game/worlds/${world.id}`)}
              className="block w-full"
            >
              <Image
                src={getWorldImageUrl(world.imageId)}
                alt={world.name}
                width={320}
                height={160}
                className="w-full h-auto"
                priority={index === 0}
                placeholder="blur"
                blurDataURL="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMjAiIGhlaWdodD0iMTYwIj48cmVjdCB3aWR0aD0iMzIwIiBoZWlnaHQ9IjE2MCIgZmlsbD0iI2Q1ZDdjZiIvPjwvc3ZnPg=="
              />
            </button>
          ))}
          {!worlds.length && (
            <Image
              src="/images/world-default.jpg"
              alt="No hay mundos disponibles"
              width={320}
              height={160}
              className="w-full h-auto"
              placeholder="blur"
              blurDataURL="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMjAiIGhlaWdodD0iMTYwIj48cmVjdCB3aWR0aD0iMzIwIiBoZWlnaHQ9IjE2MCIgZmlsbD0iI2Q1ZDdjZiIvPjwvc3ZnPg=="
            />
          )}
          <div className="world-footer">
            <Image
              src="/images/world-footer.jpg"
              alt="Mundo Inferior"
              width={160}
              height={80}
              className="w-full h-auto"
              priority
            />
          </div>
        </div>
      </div>

      {/* BottomStats */}
      <BottomStats />
    </div>
  );
}
