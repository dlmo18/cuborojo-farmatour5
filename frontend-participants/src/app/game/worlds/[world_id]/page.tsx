'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import axiosInstance from '@/lib/axiosInstance';
import { useAuthStore } from '@/store/authStore';
import { useWorldStore } from '@/store/worldStore';
import { useAuthCheck } from '@/hooks/useAuthCheck';
import WorldStarsBar from '@/components/WorldStarsBar';
import Image from 'next/image';
import { FaCheck } from "react-icons/fa";

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

export default function WorldLevelsPage() {
  const router = useRouter();
  const params = useParams();
  const { isHydrated } = useAuthCheck({ redirectTo: '/login' });
  const world_id = params.world_id as string;
  
  const [world, setWorld] = useState<World | null>(null);
  const [levels, setLevels] = useState<Level[]>([]);
  const [levelProgress, setLevelProgress] = useState<Record<string, LevelProgress>>({});
  const [worldStars, setWorldStars] = useState(0);
  const [loading, setLoading] = useState(true);
  
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);
  const setCurrentWorld = useWorldStore((state) => state.setCurrentWorld);

  // Fetch world data and levels
  useEffect(() => {
    if (!isHydrated || !world_id || !token) return;

    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch world info
        const worldRes = await axiosInstance.get(`/worlds/${world_id}`);
        const worldData = worldRes.data;
        setWorld(worldData);
        
        // Set current world for styling
        setCurrentWorld({
          id: worldData.id,
          name: worldData.name,
          slug: (worldData as any).slug,
        });

        // Fetch all levels for this world
        const levelsRes = await axiosInstance.get(`/levels/world/${world_id}`);
        const allLevels = levelsRes.data;

        // Fetch level progress for the current user
        let progressMap: Record<string, LevelProgress> = {};
        try {
          const progressRes = await axiosInstance.get(`/progress/game-state`);
          if (progressRes.data.levelProgress) {
            progressRes.data.levelProgress.forEach((lp: LevelProgress) => {
              progressMap[lp.levelId] = lp;
            });
          }
          setLevelProgress(progressMap);
        } catch (err) {
          console.error('Error fetching level progress:', err);
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
        console.error('Error fetching world data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isHydrated, world_id, token, setCurrentWorld]);

  const handleBackClick = () => {
    router.push('/game/worlds');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center level-page">
        <div>Cargando niveles...</div>
      </div>
    );
  }

  if (!world) {
    return (
      <div className="min-h-screen flex items-center justify-center level-page">
        <div>Mundo no encontrado</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen level-page">
      <div className="max-w-sm mx-auto">
        {/* Header with back button */}
        <div className="fixed z-10 w-full left-0">
          <div className="level-header flex justify-between items-center mb-8">
            <button
              onClick={handleBackClick}
              className="text-4xl hover:opacity-80 transition"
            >
              <Image
                src="/images/btn-back.png"
                alt="Atrás"
                width={50}
                height={50}
                className="h-auto"
                priority
              />
            </button>
            <h2 className="text-3xl pt-4 font-bold text-black text-center uppercase leading-none" style={{ fontFamily: "'Blinker', sans-serif" }}>
              <span className="block text-xl">MUNDO</span>
              <div className="title font-black">{world.name}</div>
            </h2>
            <button onClick={() => router.push('/game/setting')} className="btn-menu text-2xl">
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

        {/* Levels grid */}
        <div className="text-center pt-36">
          {levels.map((level) => {
            const isLocked = level.isLocked;
            const isFinal = level.levelType === 'final';
            const isGolden = level.levelType === 'golden';
            const progress = levelProgress[level.id];
            const starsEarned = progress?.starsEarned || 0;
            const isCompleted = progress?.isCompleted || false;
            
            let bgColor = 'item-normal';
            if (isGolden) bgColor = 'item-golden';
            if (isFinal) bgColor = 'item-final';
            if (isLocked) bgColor = 'item-locked';

            return (
              <div
                key={level.id}
                className={`level-item relative ${bgColor} block m-auto font-bold p-2 px-3 ${
                  isLocked ? 'opacity-60' : 'cursor-pointer'
                }`}
                onClick={() => isLocked ? null : router.push(`/game/levels/${level.id}`)}
              >
                <div className={`absolute top-2 left-3 stars text-left ${starsEarned > 0 ? '' : 'opacity-0'}`}>
                  <Image 
                    src="/images/icon-star.png"
                    alt="Stars"
                    width={20}
                    height={20}
                    className="inline-block align-middle mr-1"
                    priority
                  />
                  0{starsEarned}
                </div>
                <div className={`absolute top-2 right-3 stars text-right ${isCompleted ? '' : 'opacity-0'}`}>
                  <span className="inline-block align-middle"><FaCheck /></span>
                </div>
                <h3 className="text-lg h-[60px] flex items-center justify-center text-white leading-none" style={{ fontFamily: "'Blinker', sans-serif" }}>
                  <span>{level.name}</span>
                </h3>
              </div>
            );
          })}
        </div>

        {/* WorldStarsBar */}
        <WorldStarsBar worldStars={worldStars} />
      </div>
    </div>
  );
}
