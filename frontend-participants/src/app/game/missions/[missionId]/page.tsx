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
  variantes?: string[];
  detail: string;
  thumbnailId: string;
  orderNum: number;
  missionId: string;
  contenido?: string[]; // content_budget JSONB array
  createdAt: string;
  updatedAt: string;
}

interface Mission {
  id: string;
  name: string;
  description: string;
  order_number?: number; // order_num from database
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

  const token = useAuthStore((state) => state.token);

  // Cargar misión con items
  const fetchMission = useCallback(async () => {
    if (!missionId) return;

    try {
      setLoading(true);
      const res = await axiosInstance.get(`/missions/${missionId}/detail`);
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
      <div className="min-h-screen bg-gradient-to-br from-forest-700 via-primary-700 to-secondary-800 px-8 pb-40">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    );
  }

  if (!mission) {
    return (
      <div className="min-h-screen content-page p-8 pb-40">
        <div className="max-w-md mx-auto">
          <p className="text-white text-center">Misión no encontrada</p>
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
    setShowConfirmation(true);
  };

  const handleConfirmEvaluation = () => {
    setShowConfirmation(false);
    router.push(`/game/missions/${missionId}/questions`);
  };

  const handleCancelEvaluation = () => {
    setShowConfirmation(false);
  };

  return (
    <div className="min-h-screen content-page p-8 pb-40">
      {/* Modal de Confirmación */}
      {showConfirmation && (
        <div className="modal-evaluation-start fixed inset-0 bg-black/70 flex flex-col z-50 p-4">
          {/* Header del Modal */}
          <div className="pb-10 bg-gradient-to-b from-black/80 to-black/0">
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
                <span className="block text-lg">MISIÓN {mission.order_number}</span>
                <div className="content-title font-black text-2xl leading-none">{mission.name}</div>
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
          <div className="flex-1 flex items-center justify-center">
            <div className="bg-white rounded-lg shadow-xl max-w-sm w-full p-8 text-center">
              <h2 className="text-2xl font-bold text-gray-800 mb-4" style={{ fontFamily: "'Blinker', sans-serif" }}>
                ¿Ya estás listo para la evaluación?
              </h2>
              <p className="text-gray-600 mb-8">
                Asegúrate de haber revisado toda la información de la misión antes de continuar.
              </p>
              <button
                onClick={handleConfirmEvaluation}
                className="w-full bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 font-bold transition"
                style={{ fontFamily: "'Blinker', sans-serif" }}
              >
                Continuar
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-2xl mx-auto pt-[120px]">
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
              <span className="block text-lg">MISIÓN {mission.order_number}</span>
              <div className="content-title font-black text-2xl leading-none">{mission.name}</div>
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
                  <div className="text-black text-center text-lg font-black leading-relaxed prose prose-sm max-w-none">
                    <div dangerouslySetInnerHTML={{ __html: currentItem.benefits }} />
                  </div>
                </div>
              )}
            </div>
            
            {/* variantBadges */}
            <div className="panel-variant">
              <h3 className="panel-subtitle text-lg font-bold mb-3 uppercase" style={{ fontFamily: "'Blinker', sans-serif" }}>Contiene:</h3>
              {currentItem.variantBadges && currentItem.variantBadges.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-6">
                  {currentItem.variantBadges.map((badge, idx) => (
                    <span
                      key={idx}
                      className="bg-primary-600 text-white px-3 py-1 rounded-xl text-sm font-semibold"
                    >
                      {badge}
                    </span>
                  ))}
                </div>
              )}
            </div>
            
             {/* contentBadges */}
            <div className="panel-content">
              <h3 className="panel-subtitle text-lg font-bold mb-3 uppercase" style={{ fontFamily: "'Blinker', sans-serif" }}>Detalles:</h3>
              <div className="bg-white rounded-2xl">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-l rounded-xl bg-white p-4">
                      {currentItem.content && currentItem.contentBadges.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-6">
                          {currentItem.contentBadges.map((badge, idx) => (
                            <div
                              key={idx}
                              className="text-sm"
                            >
                              {badge}
                            </div>
                          ))}
                        </div>
                      )}
                  </div>
                  <div className="col-r rounded-xl bg-white p-4">
                      {currentItem.imageId && (
                          <Image
                            src={getImageUrl(currentItem.imageId)}
                            alt={currentItem.title}
                            width={250}
                            height={250}
                            className="block m-auto"
                            onError={(e) => (e.currentTarget.style.display = 'none')}
                          />
                      )}
                  </div>
                </div>
              </div>
            </div>

            {/* Navegación y contador */}
            <div className="mx-auto flex items-center justify-between pt-6" style={{ maxWidth: '120px' }}>
              <button
                onClick={() => setCurrentItemIndex(currentItemIndex - 1)}
                disabled={!hasPrevItem}
                className="text-black hover:opacity-75 font-bold disabled:opacity-50 disabled:cursor-not-allowed" style={{ fontFamily: "'Blinker', sans-serif" }}
              >
                <Image src="/images/content-arrow-left.png" alt="Anterior" width={50} height={50} className="inline-block mr-2" />
              </button>

              {hasNextItem ? (
                <button
                  onClick={() => setCurrentItemIndex(currentItemIndex + 1)}
                  className="text-black hover:opacity-75 font-bold" style={{ fontFamily: "'Blinker', sans-serif" }}
                >
                 <Image src="/images/content-arrow-right.png" alt="Siguiente" width={50} height={50} className="inline-block ml-2" />
                </button>
              ) : (
                <button
                  onClick={handleStartEvaluation}
                  className="text-black hover:opacity-75 font-bold"
                  style={{ fontFamily: "'Blinker', sans-serif" }}
                >
                  <Image src="/images/content-arrow-right.png" alt="Ir a Evaluacion" width={50} height={50} className="inline-block ml-2" />
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-lg p-6 text-center">
            <p className="text-white/70">No hay información disponible para esta misión</p>
          </div>
        )}
      </div>
    </div>
  );
}
