'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import axiosInstance from '@/lib/axiosInstance';
import Image from 'next/image';
import { useAuthStore } from '@/store/authStore';
import { useAuthCheck } from '@/hooks/useAuthCheck';

interface MissionItem {
  id: string;
  title: string;
  imageId: string;
  benefits: string;
  variantBadges?: string[];
  contentBadges?: string[];
  detail: string;
  thumbnailId: string;
  orderNum: number;
  missionId: string;
  createdAt: string;
  updatedAt: string;
}

interface Mission {
  id: string;
  name: string;
  description: string;
  orderNum?: number; // order_num from database
  level: {
    id: string;
    name: string;
    world: {
      id: string;
      name: string;
    };
  };
  items: MissionItem[];
  completed?: boolean;
  evaluationTaken?: boolean;
}

interface MissionProgress {
  id: string;
  participantId: string;
  missionId: string;
  starsEarned: number;
  isCompleted: boolean;
  startedAt: string;
  completedAt: string | null;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

// Construir URL de imagen desde imageId
const getImageUrl = (imageId: string) => {
  if (!imageId) return '';
  return `${API_URL}/media/serve/${imageId}`;
};

export default function MissionInfoPage() {
  const { isHydrated } = useAuthCheck({ redirectTo: '/login' });
  const params = useParams();
  const router = useRouter();
  const missionId = params.missionId as string;

  const [mission, setMission] = useState<Mission | null>(null);
  const [currentItemIndex, setCurrentItemIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [missionCompleted, setMissionCompleted] = useState(false);

  const token = useAuthStore((state) => state.token);

  // Cargar misión con items
  const fetchMission = useCallback(async () => {
    if (!missionId) return;

    try {
      setLoading(true);
      setError(null);
      const res = await axiosInstance.get(`/missions/${missionId}/detail`);
      console.log('Mission data received:', res.data);
      console.log('Mission orderNum:', res.data?.orderNum);
      setMission(res.data);
      setCurrentItemIndex(0);

      // Obtener progreso para verificar si la evaluación ya fue completada
      try {
        const progressRes = await axiosInstance.get(`/progress/game-state`);
        if (progressRes.data?.missionProgress && Array.isArray(progressRes.data.missionProgress)) {
          const missionProgress = progressRes.data.missionProgress.find(
            (p: MissionProgress) => p.missionId === missionId
          );
          setMissionCompleted(missionProgress?.isCompleted || false);
        }
      } catch (progressErr) {
        console.warn('Could not fetch progress');
        setMissionCompleted(false);
      }
    } catch (err: any) {
      console.error('Error fetching mission:', err);
      
      // Manejar errores específicos
      if (err.response?.status === 401) {
        setError('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.');
        // El interceptor y useAuthCheck manejarán la redirección
      } else if (err.response?.status === 404) {
        setError('Misión no encontrada');
      } else if (err.response?.status === 403) {
        setError('No tienes permiso para acceder a esta misión');
      } else {
        setError('Error al cargar la misión. Por favor, intenta nuevamente.');
      }
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
      <div className="min-h-screen bg-gradient-to-br from-forest-700 via-primary-700 to-secondary-800 px-8 pb-40 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white text-lg font-bold" style={{ fontFamily: "'Blinker', sans-serif" }}>Cargando misión...</p>
        </div>
      </div>
    );
  }

  if (!mission) {
    return (
      <div className="min-h-screen content-page p-8 pb-40">
        <div className="max-w-md mx-auto">
          <p className="text-white text-center">
            {error || 'Misión no encontrada'}
          </p>
          <button
            onClick={() => router.back()}
            className="mt-4 bg-white text-primary-600 px-6 py-2 rounded-lg font-bold hover:bg-gray-100" style={{ fontFamily: "'Blinker', sans-serif" }}
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

  // Manejar confirmación de evaluación
  const handleStartEvaluation = () => {
    if (!missionCompleted) {
      setShowConfirmation(true);
    }
  };

  const handleConfirmEvaluation = () => {
    setShowConfirmation(false);
    router.push(`/game/missions/${missionId}/questions`);
  };

  const handleCancelEvaluation = () => {
    setShowConfirmation(false);
  };

  // Scroll al top y cambiar índice
  const handleNavigateItem = (newIndex: number) => {
    setCurrentItemIndex(newIndex);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen content-page p-8 pb-40">
      {/* Modal de Confirmación */}
      {showConfirmation && !missionCompleted && (
        <div className="modal-evaluation-start fixed inset-0 bg-black/70 flex flex-col z-50">
          {/* Header del Modal */}
          <div className="pb-10">
            <div className="mission-header max-w-sm mx-auto flex px-4 pb-6 justify-between items-center">
              <button onClick={handleCancelEvaluation}>
                <Image
                  src="/images/btn-back.png"
                  alt="Atrás"
                  width={50}
                  height={50}
                  className="h-auto"
                  priority
                />
              </button>
              <h1 className="text-3xl font-bold text-white text-center flex-1 leading-none uppercase" style={{ fontFamily: "'Blinker', sans-serif" }}>
                <span className="block text-lg">MISIÓN {mission?.orderNum || '?'}:</span>
                <div className="content-title px-2 font-black text-2xl leading-none">{mission.name}</div>
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

          {/* Contenido del Modal */}
          <div className="flex-1 flex items-end justify-center">
            <div className="max-w-sm w-full p-8 text-center uppercase text-white" style={{ fontFamily: "'Bowlby One SC', sans-serif" }} >
              <h2 className="text-[5rem] mb-4" >
                ¡WOW!
              </h2>
              <p className="text-green-600 mb-8 text-2xl">
                ¡llegaste al final de la misión!
              </p>
              <p className="mb-8 text-xl">
                ¿estás preparado para tu evaluación?
              </p>
              <button
                onClick={handleConfirmEvaluation}
                className="w-full bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 font-bold transition"
              >
                Continuar
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-2xl mx-auto pt-[120px] pb-16">
        {/* Header */}
        <div className="fixed top-0 left-0 w-full pb-10 bg-gradient-to-b from-black/80 to-black/0">
          <div className="mission-header max-w-sm mx-auto flex px-4 pb-6 justify-between items-center">
            <button onClick={() => router.back()} >
              <Image
                src="/images/btn-back.png"
                alt="Atrás"
                width={50}
                height={50}
                className="h-auto"
                priority
              />
            </button>
            <h1 className="text-3xl font-bold text-white text-center flex-1 leading-none uppercase" style={{ fontFamily: "'Blinker', sans-serif" }}>
              <span className="block text-lg">MISIÓN {mission?.orderNum || '?'}:</span>
              <div className="content-title px-2 font-black text-2xl leading-none">{mission.name}</div>
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

        {/* Contenedor de información */}
        {currentItem ? (
          <div className="panel-block max-w-sm mx-auto text-black">
            <div className="panel-top p-4 rounded-2xl bg-[#fff3df]">
              {/* Título */}
              <h2 className="panel-title rounded-2xl p-4 text-center bg-green-600 text-white text-3xl uppercase font-bold mb-4" style={{ fontFamily: "'Blinker', sans-serif" }}>{currentItem.title}</h2>
              
              {/* Imagen principal */}
              {currentItem.imageId && (
                <div className="mb-8">
                  <img
                    src={getImageUrl(currentItem.imageId)}
                    alt={currentItem.title}
                    className="w-auto h-[250px] block m-auto rounded-lg shadow-md"
                    onError={(e) => (e.currentTarget.style.display = 'none')}
                  />
                </div>
              )}
            </div>
            
            {/* Beneficios (texto enriquecido - HTML) */}
            <div className="panel-benefit">
              {currentItem.benefits && (
                <div className="overflow-y-scroll h-[180px]">
                  <div className="text-primary-600 text-center text-lg pr-2 font-black leading-relaxed prose prose-sm max-w-none">
                    <div dangerouslySetInnerHTML={{ __html: currentItem.benefits }} />
                  </div>
                </div>
              )}
            </div>
            
            {/* variantBadges */}
            <div className="panel-variant">
              <h3 className="panel-subtitle text-xl font-black mb-3 uppercase" style={{ fontFamily: "'Blinker', sans-serif" }}>Variantes:</h3>
              {currentItem.variantBadges && currentItem.variantBadges.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-6">
                  {currentItem.variantBadges.map((badge, idx) => (
                    <span
                      key={idx}
                      className="bg-primary-600 text-white px-3 py-1 rounded-xl text-sm font-bold uppercase"
                    >
                      {badge}
                    </span>
                  ))}
                </div>
              )}
            </div>
            
             {/* contentBadges */}
            <div className="panel-content">
              <h3 className="panel-subtitle text-xl font-black mb-3 uppercase" style={{ fontFamily: "'Blinker', sans-serif" }}>Detalles:</h3>
              <div className="bg-[#f3f7f4] ml-5 rounded-2xl">
                <div className="grid grid-cols-[1fr_150px] gap-4">
                  <div className="col-l rounded-xl p-4">
                      {currentItem.contentBadges && currentItem.contentBadges.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-6">
                          {currentItem.contentBadges.map((badge, idx) => {
                            const parts = badge.split(':');
                            return (
                              <div
                                key={idx}
                                className="text-xs bull-ls relative"
                              >
                                <div className="bull"></div>
                                {parts.length > 1 ? (
                                  <>
                                    <span className="font-bold block">{parts[0]}:</span>
                                    {parts.slice(1).join(':')}
                                  </>
                                ) : (
                                  badge
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                  </div>
                  <div className="col-r rounded-xl bg-white p-4 flex items-center justify-center  ">
                      {currentItem.imageId && (
                          <Image
                            src={getImageUrl(currentItem.imageId)}
                            alt={currentItem.title}
                            width={200}
                            height={200}
                            className="block m-auto"
                            onError={(e) => (e.currentTarget.style.display = 'none')}
                          />
                      )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-lg p-6 text-center">
            <p className="text-white/70">No hay información disponible para esta misión</p>
          </div>
        )}
      </div>

      {/* Navegación y contador - Fijo en la base */}
      {currentItem && (
        <div className="panel-control fixed bottom-0 left-0 right-0 z-40 flex justify-center items-center py-6 bg-gradient-to-t from-green-500 to-transparent">
          <div className="flex items-center justify-between" style={{ maxWidth: '120px' }}>
            <button
              onClick={() => handleNavigateItem(currentItemIndex - 1)}
              disabled={!hasPrevItem}
              className="text-black hover:opacity-75 font-bold disabled:opacity-50 disabled:cursor-not-allowed" style={{ fontFamily: "'Blinker', sans-serif" }}
            >
              <Image src="/images/content-arrow-left.png" alt="Anterior" width={50} height={50} className="inline-block mr-2" />
            </button>

            {hasNextItem ? (
              <button
                onClick={() => handleNavigateItem(currentItemIndex + 1)}
                className="text-black hover:opacity-75 font-bold" style={{ fontFamily: "'Blinker', sans-serif" }}
              >
               <Image src="/images/content-arrow-right.png" alt="Siguiente" width={50} height={50} className="inline-block ml-2" />
              </button>
            ) : (
              <button
                onClick={handleStartEvaluation}
                disabled={missionCompleted}
                className="text-black hover:opacity-75 font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ fontFamily: "'Blinker', sans-serif" }}
              >
                <Image src="/images/content-arrow-right.png" alt="Ir a Evaluacion" width={50} height={50} className="inline-block ml-2" />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
