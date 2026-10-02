'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import axiosInstance from '@/lib/axiosInstance';
import Image from 'next/image';
import { useAuthStore } from '@/store/authStore';
import { useAuthCheck } from '@/hooks/useAuthCheck';
import WorldStarsBar from '@/components/WorldStarsBar';
import MissionCard from '@/components/MissionCard';

interface Mission {
  id: string;
  name: string;
  description: string;
  orderNum: number;
  order_number?: number;
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
  const [loading, setLoading] = useState(true);
  const [worldStars, setWorldStars] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);

  // Función para refrescar el progreso
  const refreshProgress = useCallback(async (missionsData: Mission[]) => {
    try {
      const progressRes = await axiosInstance.get(`/progress/game-state`);

      if (progressRes.data?.missionProgress && Array.isArray(progressRes.data.missionProgress)) {
        const progressMap: Record<string, MissionProgress> = {};
        let totalWorldStars = 0;
        progressRes.data.missionProgress.forEach((p: MissionProgress) => {
          progressMap[p.missionId] = p;
          if (missionsData.some((m: Mission) => m.id === p.missionId)) {
            totalWorldStars += p.starsEarned || 0;
          }
        });
        setMissionProgress(progressMap);
        setWorldStars(totalWorldStars);
      } else {
        setMissionProgress({});
        setWorldStars(0);
      }
    } catch (progressErr) {
      console.warn('Error fetching progress, continuing without it');
      setMissionProgress({});
      setWorldStars(0);
    }
  }, []);

  useEffect(() => {
    if (!isHydrated || !levelId) return;

    // Si no hay token después de hidratación, redirigir a login
    if (!token) {
      router.push('/login');
      return;
    }

    const fetchData = async () => {
      try {
        setError(null);
        setLoading(true);

        // Obtener nivel
        const levelRes = await axiosInstance.get(`/levels/${levelId}`);
        setLevel(levelRes.data);

        // Obtener misiones del nivel
        let sortedMissions: Mission[] = [];
        try {
          const missionsRes = await axiosInstance.get(`/missions/level/${levelId}`);
          sortedMissions = (missionsRes.data || []).sort(
            (a: Mission, b: Mission) => a.orderNum - b.orderNum
          );
          setMissions(sortedMissions);
        } catch (missionErr) {
          console.warn('No missions found for level:', levelId);
          setMissions([]);
        }

        // Obtener progreso del usuario
        await refreshProgress(sortedMissions);

        setLoading(false);
      } catch (err: any) {
        console.error('Error fetching level data:', err);
        
        // Manejar errores específicos
        if (err.response?.status === 401) {
          setError('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.');
          // El interceptor y useAuthCheck manejarán la redirección
        } else if (err.response?.status === 404) {
          setError('Nivel no encontrado');
        } else if (err.response?.status === 403) {
          setError('No tienes permiso para acceder a este nivel');
        } else {
          setError(err?.response?.data?.message || 'Error al cargar el nivel');
        }
        setLoading(false);
      }
    };

    fetchData();
  }, [isHydrated, levelId, token, router, refreshProgress]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-forest-700 via-primary-700 to-secondary-800 px-8 pb-40 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white">Cargando nivel...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-forest-700 via-primary-700 to-secondary-800 px-8 pb-40">
        <div className="max-w-md mx-auto pt-24">
          <p className="text-white text-center mb-4">❌ {error}</p>
          <button
            onClick={() => router.back()}
            className="mt-4 bg-primary-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-primary-700 w-full"
            style={{ fontFamily: "'Blinker', sans-serif" }}
          >
            ← Volver
          </button>
        </div>
      </div>
    );
  }

  if (!level) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-forest-700 via-primary-700 to-secondary-800 px-8 pb-40">
        <div className="max-w-md mx-auto pt-24">
          <p className="text-white text-center">Nivel no encontrado</p>
          <button
            onClick={() => router.back()}
            className="mt-4 bg-primary-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-primary-700"
            style={{ fontFamily: "'Blinker', sans-serif" }}
          >
            ← Volver
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen mission-page">
      <div className="max-w-sm mx-auto">

        {/* Header simple (sin clase .header, solo en mundos) */}
        <div className="fixed top-0 left-0 w-full pb-10 bg-gradient-to-b from-black/80 to-black/0">
          <div className="mission-header max-w-sm mx-auto flex px-4 justify-between items-center">
            <button onClick={() => router.push(`/game/worlds/${level.world.id}`)}>
              <Image
                src="/images/btn-back.png"
                alt="Atrás"
                width={50}
                height={50}
                className="h-auto"
                priority
              />
            </button>
            <h1 className="text-3xl font-bold text-white text-center flex-1 leading-none" style={{ fontFamily: "'Blinker', sans-serif" }}>
              <span className="block text-lg">NIVEL</span>
              <div className="level-title uppercase font-black text-2xl leading-none">{level.name}</div>
            </h1>
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

        {/* Lista de misiones - en orden inverso */}
        <div className="space-y-3 pt-36">
          {missions.length === 0 ? (
            <div className="bg-white rounded-lg shadow-lg p-6 text-center">
              <p className="text-gray-600">No hay misiones en este nivel</p>
            </div>
          ) : (
            [...missions].reverse().map((mission) => {
              const progress = missionProgress[mission.id];
              const isCompleted = progress?.isCompleted || false;
              const starsEarned = progress?.starsEarned || 0;
              
              // Una misión está habilitada si es la primera (orderNum = 1) o si la misión anterior está completada
              const isFirstMission = mission.orderNum === 1;
              const prevMission = missions.find(m => m.orderNum === mission.orderNum - 1);
              const prevMissionProgress = prevMission ? missionProgress[prevMission.id] : null;
              const prevHasProgress = prevMissionProgress && (prevMissionProgress.isCompleted || prevMissionProgress.starsEarned > 0);
              const isUnlocked: boolean = isFirstMission || !!prevHasProgress;

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
    </div>
  );
}
