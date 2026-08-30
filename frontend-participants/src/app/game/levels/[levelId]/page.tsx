'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import axios from 'axios';
import { useAuthStore } from '@/store/authStore';
import { useAuthCheck } from '@/hooks/useAuthCheck';
import OptionsMenu from '@/components/OptionsMenu';
import WorldStarsBar from '@/components/WorldStarsBar';
import MissionCard from '@/components/MissionCard';

interface Mission {
  id: string;
  name: string;
  description: string;
  orderNum: number;
  maxStars: number;
  isActive: boolean;
}

interface Level {
  id: string;
  name: string;
  description: string;
  world: {
    id: string;
    name: string;
  };
}

interface MissionProgress {
  missionId: string;
  starsEarned: number;
  isCompleted: boolean;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export default function LevelMissionsPage() {
  const { isHydrated } = useAuthCheck({ redirectTo: '/login' });
  const params = useParams();
  const router = useRouter();
  const levelId = params.levelId as string;

  const [level, setLevel] = useState<Level | null>(null);
  const [missions, setMissions] = useState<Mission[]>([]);
  const [missionProgress, setMissionProgress] = useState<Record<string, MissionProgress>>({});
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [worldStars, setWorldStars] = useState(0);

  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);

  // Cargar misiones y nivel
  const fetchData = useCallback(async () => {
    if (!levelId || !user) return;

    try {
      setLoading(true);

      // Obtener nivel
      const levelRes = await axios.get(`${API_URL}/levels/${levelId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setLevel(levelRes.data);

      // Obtener misiones del nivel
      const missionsRes = await axios.get(`${API_URL}/missions/level/${levelId}`);
      const sortedMissions = missionsRes.data.sort(
        (a: Mission, b: Mission) => a.orderNum - b.orderNum
      );
      setMissions(sortedMissions);

      // Obtener progreso del usuario
      const progressRes = await axios.get(`${API_URL}/progress/state`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (progressRes.data?.missionProgress) {
        const progressMap: Record<string, MissionProgress> = {};
        let totalWorldStars = 0;
        progressRes.data.missionProgress.forEach((p: MissionProgress) => {
          progressMap[p.missionId] = p;
          // Si la misión pertenece a este nivel, sumar las estrellas
          if (missionsRes.data.some((m: Mission) => m.id === p.missionId)) {
            totalWorldStars += p.starsEarned || 0;
          }
        });
        setMissionProgress(progressMap);
        setWorldStars(totalWorldStars);
      }
    } catch (err) {
      console.error('Error fetching level data:', err);
    } finally {
      setLoading(false);
    }
  }, [levelId, user, token]);

  useEffect(() => {
    if (!isHydrated || !levelId) return;
    fetchData();
  }, [isHydrated, levelId, fetchData]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-500 to-blue-500 p-8 pb-40 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    );
  }

  if (!level) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-500 to-blue-500 p-8 pb-40">
        <div className="max-w-md mx-auto">
          <p className="text-white text-center">Nivel no encontrado</p>
          <button
            onClick={() => router.back()}
            className="mt-4 bg-white text-purple-600 px-6 py-2 rounded-lg font-bold hover:bg-gray-100"
          >
            ← Volver
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-500 to-blue-500 p-8 pb-40">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="text-white text-4xl hover:opacity-80 transition"
            >
              ←
            </button>
            <div>
              <p className="text-white text-sm font-light mb-1">{level.world.name}</p>
              <h1 className="text-4xl font-bold text-white">{level.name}</h1>
            </div>
          </div>
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="bg-white text-purple-600 p-3 rounded-lg shadow-lg hover:shadow-2xl transition text-2xl"
          >
            ⚙️
          </button>
        </div>

        {/* Menú de opciones */}
        <OptionsMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />

        {/* Descripción del nivel */}
        {level.description && (
          <p className="text-white text-center mb-8">{level.description}</p>
        )}

        {/* Lista de misiones */}
        <div className="space-y-4">
          {missions.length === 0 ? (
            <div className="bg-white rounded-lg shadow-lg p-6 text-center">
              <p className="text-gray-600">No hay misiones en este nivel</p>
            </div>
          ) : (
            missions.map((mission, index) => {
              const progress = missionProgress[mission.id];
              const isCompleted = progress?.isCompleted || false;
              const starsEarned = progress?.starsEarned || 0;
              const isFirstMission = index === 0;
              const previousCompleted =
                index === 0 || missionProgress[missions[index - 1].id]?.isCompleted;
              const isUnlocked = isFirstMission || previousCompleted;

              return (
                <MissionCard
                  key={mission.id}
                  mission={mission}
                  isCompleted={isCompleted}
                  starsEarned={starsEarned}
                  isUnlocked={isUnlocked}
                  onMissionClick={() => router.push(`/game/missions/${mission.id}`)}
                />
              );
            })
          )}
        </div>
      </div>

      {/* Barra inferior con estrellas del mundo */}
      <WorldStarsBar worldStars={worldStars} />
    </div>
  );
}
