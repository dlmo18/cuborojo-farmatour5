'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import axios from 'axios';
import { useAuthStore } from '@/store/authStore';
import { useAuthCheck } from '@/hooks/useAuthCheck';
import OptionsMenu from '@/components/OptionsMenu';

interface MissionItem {
  id: string;
  title: string;
  image: string;
  benefits: string;
  content: string;
  details: string;
  thumbnail: string;
  orderNum: number;
}

interface Mission {
  id: string;
  name: string;
  description: string;
  level: {
    id: string;
    name: string;
    world: {
      id: string;
      name: string;
    };
  };
  items: MissionItem[];
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export default function MissionInfoPage() {
  const { isHydrated } = useAuthCheck({ redirectTo: '/login' });
  const params = useParams();
  const router = useRouter();
  const missionId = params.missionId as string;

  const [mission, setMission] = useState<Mission | null>(null);
  const [currentItemIndex, setCurrentItemIndex] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const token = useAuthStore((state) => state.token);

  // Cargar misión con items
  const fetchMission = useCallback(async () => {
    if (!missionId) return;

    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/missions/${missionId}/detail`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMission(res.data);
      setCurrentItemIndex(0);
    } catch (err) {
      console.error('Error fetching mission:', err);
    } finally {
      setLoading(false);
    }
  }, [missionId, token]);

  useEffect(() => {
    if (!isHydrated || !missionId) return;
    fetchMission();
  }, [isHydrated, missionId, fetchMission]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-500 to-blue-500 p-8 pb-40 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    );
  }

  if (!mission) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-500 to-blue-500 p-8 pb-40">
        <div className="max-w-md mx-auto">
          <p className="text-white text-center">Misión no encontrada</p>
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

  const currentItem = mission.items && mission.items[currentItemIndex];
  const hasNextItem = currentItemIndex < (mission.items?.length || 0) - 1;
  const hasPrevItem = currentItemIndex > 0;

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
              <p className="text-white text-xs font-light mb-1">{mission.level.world.name}</p>
              <h1 className="text-2xl font-bold text-white">{mission.name}</h1>
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

        {/* Contenedor de información */}
        {currentItem ? (
          <div className="bg-white rounded-lg shadow-lg p-8">
            {/* Título */}
            <h2 className="text-2xl font-bold text-purple-600 mb-6">{currentItem.title}</h2>

            {/* Grid con imagen principal y contenido */}
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              {/* Contenido principal (2 columnas) */}
              <div className="md:col-span-2">
                {/* Imagen principal */}
                {currentItem.image && (
                  <div className="mb-6">
                    <img
                      src={currentItem.image}
                      alt={currentItem.title}
                      className="w-full rounded-lg shadow-md"
                    />
                  </div>
                )}

                {/* Beneficios */}
                {currentItem.benefits && (
                  <div className="mb-6">
                    <h3 className="text-lg font-bold text-gray-800 mb-2">Beneficios</h3>
                    <p className="text-gray-700">{currentItem.benefits}</p>
                  </div>
                )}

                {/* Contenido */}
                {currentItem.content && (
                  <div className="mb-6">
                    <h3 className="text-lg font-bold text-gray-800 mb-2">Contenido</h3>
                    <div className="flex flex-wrap gap-2">
                      {currentItem.content.split(',').map((badge, idx) => (
                        <span
                          key={idx}
                          className="bg-purple-200 text-purple-800 px-3 py-1 rounded-full text-sm font-semibold"
                        >
                          {badge.trim()}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Detalles */}
                {currentItem.details && (
                  <div className="mb-6">
                    <h3 className="text-lg font-bold text-gray-800 mb-2">Detalles</h3>
                    <p className="text-gray-700">{currentItem.details}</p>
                  </div>
                )}
              </div>

              {/* Miniatura (1 columna) */}
              {currentItem.thumbnail && (
                <div className="md:col-span-1">
                  <img
                    src={currentItem.thumbnail}
                    alt={`${currentItem.title} (miniatura)`}
                    className="w-full rounded-lg shadow-md sticky top-8"
                  />
                </div>
              )}
            </div>

            {/* Navegación y contador */}
            <div className="flex items-center justify-between pt-6 border-t border-gray-200">
              <button
                onClick={() => setCurrentItemIndex(currentItemIndex - 1)}
                disabled={!hasPrevItem}
                className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ← Anterior
              </button>

              <span className="text-gray-700 font-semibold">
                {currentItemIndex + 1}/{mission.items?.length || 0}
              </span>

              {hasNextItem ? (
                <button
                  onClick={() => setCurrentItemIndex(currentItemIndex + 1)}
                  className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700"
                >
                  Siguiente →
                </button>
              ) : (
                <button
                  onClick={() => router.push(`/game/missions/${missionId}/questions`)}
                  className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 font-bold"
                >
                  Ir a la evaluación →
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-lg p-6 text-center">
            <p className="text-gray-600">No hay información disponible para esta misión</p>
          </div>
        )}
      </div>
    </div>
  );
}
