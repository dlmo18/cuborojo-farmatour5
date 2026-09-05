'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { useAuthStore } from '@/store/authStore';
import { useAuthCheck } from '@/hooks/useAuthCheck';
import OptionsMenu from '@/components/OptionsMenu';
import BottomStats from '@/components/BottomStats';
import WorldStarsBar from '@/components/WorldStarsBar';

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
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);

  const fetchWorlds = useCallback(async () => {
    try {
      const res = await axios.get(`${API_URL}/worlds`);
      setWorlds(res.data.data || res.data);
    } catch (err) {
      console.error('Error fetching worlds:', err);
    }
  }, []);

  useEffect(() => {
    if (!isHydrated) return;
    fetchWorlds();
  }, [isHydrated, fetchWorlds]);

  const handleWorldClick = async (world: World) => {
    setSelectedWorld(world);
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
    <div className="min-h-screen bg-gradient-to-br from-purple-500 to-blue-500 p-8 pb-40">
      <div className="max-w-md mx-auto">
        {/* Header con botón de menú */}
        <div className="flex justify-between items-start mb-8">
          <h1 className="text-4xl font-bold text-white">🎮 Farmatour 5</h1>
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="bg-white text-purple-600 p-3 rounded-lg shadow-lg hover:shadow-2xl transition text-2xl"
          >
            ⚙️
          </button>
        </div>

        {/* Menú de opciones */}
        <OptionsMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />

        {!selectedWorld ? (
          <div>
            <h2 className="text-3xl text-center font-bold text-white mb-8">Selecciona un Mundo</h2>
            <div className="gap-6">
              {worlds.map((world) => (
                <button
                  key={world.id}
                  onClick={() => handleWorldClick(world)}
                  className="bg-white rounded-lg shadow-lg p-6 hover:shadow-2xl transition transform hover:scale-105 mb-5 block w-full"
                >
                  <div className="text-4xl mb-3">🌍</div>
                  <h3 className="text-2xl font-bold text-purple-600 mb-2">{world.name}</h3>
                  <p className="text-gray-600">{world.description}</p>
                </button>
              ))}
            </div>

            {/* BottomStats en vista principal */}
            {isHydrated && user && (
              <BottomStats
                totalStars={user.totalStars}
                userId={user.id}
                groupId={user.group?.id}
                token={token || ''}
              />
            )}
          </div>
        ) : (
          <div>
            <div className="flex justify-between items-center mb-8">
              <button
                onClick={() => { 
                  setSelectedWorld(null); 
                  setLevels([]); 
                  setLevelProgress({});
                  setWorldStars(0); 
                }}
                className="text-white text-4xl hover:opacity-80 transition"
              >
                ←
              </button>
              <h2 className="text-3xl font-bold text-white">{selectedWorld.name}</h2>
              <div className="w-10"></div>
            </div>
            <div className="text-center">
              {levels.map((level) => {
                const isLocked = level.isLocked;
                const isFinal = level.levelType === 'final';
                const isGolden = level.levelType === 'golden';
                
                let bgColor = 'bg-white';
                if (isGolden) bgColor = 'bg-yellow-400';
                if (isFinal) bgColor = 'bg-red-400';
                if (isLocked) bgColor = 'bg-gray-300';

                return (
                  <div
                    key={level.id}
                    className={`${bgColor} block w-full mb-4 rounded-lg shadow-lg p-6 ${
                      isLocked ? 'opacity-60' : ''
                    }`}
                  >
                    {isFinal && !isLocked && <div className="text-3xl mb-2">🏆 NIVEL FINAL</div>}
                    {isGolden && !isLocked && <div className="text-3xl mb-2">✨ NIVEL DORADO</div>}
                    {isLocked && <div className="text-3xl mb-2">🔒 BLOQUEADO</div>}
                    
                    <h3 className={`text-xl font-bold ${
                      isGolden ? 'text-yellow-700' : isFinal ? 'text-red-700' : 'text-purple-600'
                    } mb-2`}>
                      {level.name}
                    </h3>
                    <p className={`${isLocked ? 'text-gray-500' : 'text-gray-600'} mb-4`}>
                      {level.description}
                    </p>
                    
                    {isLocked ? (
                      <div className="text-gray-600 text-sm">
                        Completa el nivel anterior para desbloquear
                      </div>
                    ) : (
                      <button
                        onClick={() => router.push(`/game/levels/${level.id}`)}
                        className={`${
                          isGolden
                            ? 'bg-yellow-500 hover:bg-yellow-600'
                            : isFinal
                            ? 'bg-red-500 hover:bg-red-600'
                            : 'bg-purple-600 hover:bg-purple-700'
                        } text-white px-4 py-2 rounded-lg transition`}
                      >
                        {isFinal ? 'Jugar Nivel Final' : isGolden ? 'Jugar Nivel Dorado' : 'Jugar Nivel'}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            {/* WorldStarsBar en vista de detalle */}
            <WorldStarsBar worldStars={worldStars} />
          </div>
        )}
      </div>
    </div>
  );
}
