'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { useAuthStore } from '@/store/authStore';
import { useWorldStore } from '@/store/worldStore';
import { useAuthCheck } from '@/hooks/useAuthCheck';
import BottomStats from '@/components/BottomStats';
import WorldStarsBar from '@/components/WorldStarsBar';
import Image from 'next/image';

interface World {
  id: string;
  name: string;
  description: string;
  orderNum: number;
  imageId?: string;
}

interface Level {
  id: string;
  name: string;
  description: string;
  orderNum: number;
  isGolden: boolean;
  isActive: boolean;
  missions?: any[];
  levelType?: 'normal' | 'golden' | 'final';
  isLocked?: boolean;
}

interface LevelProgress {
  levelId: string;
  isCompleted: boolean;
  starsEarned: number;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export default function WorldsPage() {
  const router = useRouter();
  const { isHydrated } = useAuthCheck({ redirectTo: '/login' });
  const [worlds, setWorlds] = useState<World[]>([]);
  const [selectedWorld, setSelectedWorld] = useState<World | null>(null);
  const [levels, setLevels] = useState<Level[]>([]);
  const [levelProgress, setLevelProgress] = useState<Record<string, LevelProgress>>({});
  const [worldStars, setWorldStars] = useState(0);
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);
  const setCurrentWorld = useWorldStore((state) => state.setCurrentWorld);

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

  const handleWorldClick = async (world: World) => {
    setSelectedWorld(world);
    // Establecer el mundo actual con su slug para aplicar estilos
    setCurrentWorld({
      id: world.id,
      name: world.name,
      slug: (world as any).slug,
    });
    try {
      // Fetch all levels for this world
      const res = await axios.get(`${API_URL}/levels/world/${world.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const allLevels = res.data;

      // Fetch level progress for the current user
      let progressMap: Record<string, LevelProgress> = {};
      try {
        const progressRes = await axios.get(`${API_URL}/progress/game-state`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (progressRes.data.levelProgress) {
          progressRes.data.levelProgress.forEach((lp: LevelProgress) => {
            progressMap[lp.levelId] = lp;
          });
        }
        setLevelProgress(progressMap);
      } catch (err) {
        console.error('Error fetching level progress:', err);
        // Continue without progress data
      }

      // Separate levels by type
      const normalLevels = allLevels.filter((l: Level) => l.levelType === 'normal' || (!l.levelType && !l.isGolden));
      const goldenLevel = allLevels.find((l: Level) => l.levelType === 'golden' || l.isGolden);
      const finalLevel = allLevels.find((l: Level) => l.levelType === 'final');

      // Sort normal levels by orderNum
      normalLevels.sort((a: Level, b: Level) => a.orderNum - b.orderNum);

      // Determine which levels are locked
      const levelsWithLockStatus = normalLevels.map((level: Level, index: number) => {
        let isLocked = false;
        
        // First normal level is always unlocked
        if (index === 0) {
          isLocked = false;
        } else {
          // Subsequent levels are unlocked only if previous level is completed
          const previousLevel = normalLevels[index - 1];
          const previousProgress = progressMap[previousLevel.id];
          isLocked = !previousProgress || !previousProgress.isCompleted;
        }

        return { ...level, isLocked };
      });

      // Golden level is unlocked if all normal levels are completed
      let goldenLocked = true;
      if (goldenLevel) {
        goldenLocked = levelsWithLockStatus.some((l: Level) => l.isLocked);
      }

      // Final level is unlocked if all normal and golden levels are completed
      let finalLocked = true;
      if (finalLevel) {
        finalLocked = goldenLocked || levelsWithLockStatus.some((l: Level) => l.isLocked);
      }

      // Build final sorted list: final on top, then golden, then normal levels (reversed for bottom-to-top display)
      const sortedLevels = [
        ...(finalLevel ? [{ ...finalLevel, isLocked: finalLocked, levelType: finalLevel.levelType || 'final' }] : []),
        ...(goldenLevel ? [{ ...goldenLevel, isLocked: goldenLocked, levelType: goldenLevel.levelType || 'golden' }] : []),
        ...levelsWithLockStatus.reverse(), // Normal levels bottom to top
      ];

      setLevels(sortedLevels);

      // Calculate world stars
      try {
        let totalStars = 0;
        levelsWithLockStatus.forEach((level: Level) => {
          const progress = progressMap[level.id];
          if (progress) {
            totalStars += progress.starsEarned || 0;
          }
        });
        // Add golden level stars if completed
        if (goldenLevel && !goldenLocked) {
          const goldenProgress = progressMap[goldenLevel.id];
          if (goldenProgress) {
            totalStars += goldenProgress.starsEarned || 0;
          }
        }
        // Add final level stars if completed
        if (finalLevel && !finalLocked) {
          const finalProgress = progressMap[finalLevel.id];
          if (finalProgress) {
            totalStars += finalProgress.starsEarned || 0;
          }
        }
        setWorldStars(totalStars);
      } catch (err) {
        console.error('Error calculating world stars:', err);
        setWorldStars(0);
      }
    } catch (err) {
      console.error('Error fetching levels:', err);
    }
  };

  return (
    <div className={`min-h-screen ${!selectedWorld ? 'world-page' : 'level-page' }`}>
      <div className="max-w-md mx-auto ">

        {/* Header con botón de menú */}
        {!selectedWorld && (
          <div className="header fixed top-0 left-0 w-full py-4 pb-10 bg-gradient-to-b from-black/80 to-black/0">
              <div className="max-w-md mx-auto flex px-4 justify-between items-center ">
                <button>
                  <Image
                      src="/images/btn-back.png"
                      alt="Atras"
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
        )}

        {!selectedWorld ? (
          <div>
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
                  onClick={() => handleWorldClick(world)}
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
        ) : (
          <div>
            <div className="fixed z-10 w-full left-0 ">
              <div className="level-header flex justify-between items-center mb-8">
                <button
                  onClick={() => { 
                    setSelectedWorld(null); 
                    setLevels([]); 
                    setLevelProgress({});
                    setWorldStars(0); 
                  }}
                  className="text-4xl hover:opacity-80 transition"
                >
                  <Image
                    src="/images/btn-back.png"
                    alt="Atrás"
                    width={50}
                    height={50}
                    className="w-full h-auto"
                    priority
                  />
                </button>
                <h2 className="text-3xl pt-4 font-bold text-black text-center uppercase leading-none" style={{ fontFamily: "'Blinker', sans-serif" }}>
                  <span className="block text-xl">MUNDO</span>
                  <div className="level-title font-black">{selectedWorld.name}</div>
                </h2>
                <button onClick={() => router.push('/game/setting')} className="btn-menu text-2xl">
                  <Image
                    src="/images/btn-menu.png"
                    alt="Menú"
                    width={50}
                    height={50}
                    className="w-full h-auto"
                    priority
                  />
                </button>
              </div>
            </div>
            
            <div className="text-center pt-36">
              {levels.map((level) => {
                const isLocked = level.isLocked;
                const isFinal = level.levelType === 'final';
                const isGolden = level.levelType === 'golden';
                
                let bgColor = 'item-normal';
                if (isGolden) bgColor = 'item-golden';
                if (isFinal) bgColor = 'item-final';
                if (isLocked) bgColor = 'item-locked';

                return (
                  <div
                    key={level.id}
                    className={`${bgColor} block w-full mb-4 rounded-lg shadow-lg p-6 ${
                      isLocked ? 'opacity-60' : ''
                    }`}

                    onClick={() => isLocked ? null : router.push(`/game/levels/${level.id}`)}
                  >
                    {isFinal && !isLocked && <div className="text-3xl mb-2">🏆 NIVEL FINAL</div>}
                    {isGolden && !isLocked && <div className="text-3xl mb-2">✨ NIVEL DORADO</div>}
                    {isLocked && <div className="text-3xl mb-2">🔒 BLOQUEADO</div>}
                    
                    <h3 className={`text-xl font-bold text-white`} style={{ fontFamily: "'Blinker', sans-serif" }}>
                      {level.name}
                    </h3>
                  </div>
                );
              })}
            </div>

            {/* WorldStarsBar en vista de detalle */}
            <WorldStarsBar worldStars={worldStars} />
          </div>
        )}
      </div>

      {/* BottomStats siempre visible */}
      {!selectedWorld && (
        <BottomStats />
      )}
    </div>
  );
}
