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
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export default function WorldsPage() {
  const router = useRouter();
  const { isHydrated } = useAuthCheck({ redirectTo: '/login' });
  const [worlds, setWorlds] = useState<World[]>([]);
  const [selectedWorld, setSelectedWorld] = useState<World | null>(null);
  const [levels, setLevels] = useState<Level[]>([]);
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
      const res = await axios.get(`${API_URL}/levels/world/${world.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Ordenar niveles: primero golden, luego por orderNum
      const sorted = res.data.sort((a: Level, b: Level) => {
        if (a.isGolden && !b.isGolden) return -1;
        if (!a.isGolden && b.isGolden) return 1;
        return a.orderNum - b.orderNum;
      });
      setLevels(sorted);

      // Calcular estrellas del mundo
      try {
        const progressRes = await axios.get(`${API_URL}/progress/state`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const missions = progressRes.data.missions || [];
        let totalStars = 0;
        
        // Obtener missions de cada nivel para saber qué missions pertenecen al mundo
        const levelIds = sorted.map((level: Level) => level.id);
        for (const levelId of levelIds) {
          const levelRes = await axios.get(`${API_URL}/levels/${levelId}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const levelMissions = levelRes.data.missions || [];
          levelMissions.forEach((mission: any) => {
            const missionProgress = missions.find((m: any) => m.missionId === mission.id);
            if (missionProgress) {
              totalStars += missionProgress.starsEarned || 0;
            }
          });
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
                onClick={() => { setSelectedWorld(null); setLevels([]); setWorldStars(0); }}
                className="text-white text-4xl hover:opacity-80 transition"
              >
                ←
              </button>
              <h2 className="text-3xl font-bold text-white">{selectedWorld.name}</h2>
              <div className="w-10"></div>
            </div>
            <div className="text-center">
              {levels.map((level) => (
                <div key={level.id} className={ (level.isGolden ? "bg-yellow-400 " : "bg-white ") + " block w-full mb-4 rounded-lg shadow-lg p-6"}>
                  {level.isGolden && <div className="text-3xl mb-2">✨ NIVEL DORADO</div>}
                  <h3 className="text-xl font-bold text-purple-600 mb-2">{level.name}</h3>
                  <p className="text-gray-600 mb-4">{level.description}</p>
                  <button
                    onClick={() => router.push(`/game/levels/${level.id}`)}
                    className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700"
                  >
                    Jugar Nivel
                  </button>
                </div>
              ))}
            </div>

            {/* WorldStarsBar en vista de detalle */}
            <WorldStarsBar worldStars={worldStars} />
          </div>
        )}
      </div>
    </div>
  );
}
