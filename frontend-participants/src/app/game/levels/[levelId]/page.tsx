'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import axiosInstance from '@/lib/axiosInstance';
import Image from 'next/image';
import { useAuthStore } from '@/store/authStore';
import { useAuthCheck } from '@/hooks/useAuthCheck';
import WorldStarsBar from '@/components/WorldStarsBar';
import MissionCard from '@/components/MissionCard';
import MediaPlayer from '@/components/MediaPlayer';

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
  levelType?: 'normal' | 'golden' | 'final';
  isGolden?: boolean;
  imageId?: string;
  introVideoUrl?: string;
  introVideoId?: string;
  world: {
    id: string;
    name: string;
  };
}

interface GoldenLevelItem {
  id: string;
  levelId: string;
  title: string;
  detail: string;
  orderNum: number;
}

interface GoldenLevelQuestion {
  id: string;
  levelId: string;
  content: string;
  imageId?: string;
  benefit?: string;
  options: GoldenLevelAnswerOption[];
  orderNum: number;
  starsValue?: number;
}

interface GoldenLevelAnswerOption {
  id: string;
  questionId: string;
  text: string;
  imageId?: string;
  isCorrect?: boolean;
  detail?: string;
  orderNum: number;
}

interface FinalLevelQuestion {
  id: string;
  levelId: string;
  content: string;
  startVideoUrl?: string;
  startVideoId?: string;
  correctMessage?: string;
  incorrectMessage?: string;
  orderNum: number;
  options: FinalLevelAnswerOption[];
}

interface FinalLevelAnswerOption {
  id: string;
  questionId: string;
  text: string;
  imageId?: string;
  isCorrect: boolean;
  orderNum: number;
}

interface MissionProgress {
  missionId: string;
  starsEarned: number;
  isCompleted: boolean;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

const getImageUrl = (imageId?: string) => {
  if (!imageId) return null;
  return `${API_URL}/media/serve/${imageId}`;
};

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

  // Golden level states
  const [goldenStage, setGoldenStage] = useState<'intro' | 'imageIntro' | 'items' | 'testPrep' | 'questions' | 'results'>('intro');
  const [goldenItems, setGoldenItems] = useState<GoldenLevelItem[]>([]);
  const [goldenQuestions, setGoldenQuestions] = useState<GoldenLevelQuestion[]>([]);
  const [currentItemIndex, setCurrentItemIndex] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [goldenAnswers, setGoldenAnswers] = useState<Record<string, string>>({});
  const [previousAnswers, setPreviousAnswers] = useState<Record<string, string>>({});
  const [totalGoldenStars, setTotalGoldenStars] = useState(0);
  const [isValidating, setIsValidating] = useState(false);
  const [goldenCompleted, setGoldenCompleted] = useState(false);
  const [showValidationPanel, setShowValidationPanel] = useState(false);
  const [lastAnswerCorrect, setLastAnswerCorrect] = useState(false);

  // Final level states
  const [finalStage, setFinalStage] = useState<'intro' | 'introVideo' | 'questionOrder' | 'questionVideo' | 'questionModal' | 'questionOptions' | 'results'>('intro');
  const [finalQuestions, setFinalQuestions] = useState<FinalLevelQuestion[]>([]);
  const [currentFinalQuestionIndex, setCurrentFinalQuestionIndex] = useState(0);
  const [finalAnswers, setFinalAnswers] = useState<Record<string, string>>({});
  const [previousFinalAnswers, setPreviousFinalAnswers] = useState<Record<string, string>>({});
  const [totalFinalStars, setTotalFinalStars] = useState(0);
  const [isVideoFinished, setIsVideoFinished] = useState(false);
  const [isQuestionVideoFinished, setIsQuestionVideoFinished] = useState(false);
  const [isFinalValidating, setIsFinalValidating] = useState(false);
  const [showFinalValidationPanel, setShowFinalValidationPanel] = useState(false);
  const [lastFinalAnswerCorrect, setLastFinalAnswerCorrect] = useState(false);
  const [finalCompleted, setFinalCompleted] = useState(false);

  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);

  const isGoldenLevel = () => level?.levelType === 'golden' || level?.isGolden;
  const isFinalLevel = () => level?.levelType === 'final';

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

  const fetchGoldenLevel = useCallback(async () => {
    try {
      // Obtener items del nivel dorado
      const itemsRes = await axiosInstance.get(`/levels/golden/${levelId}/items`);
      const sortedItems = (itemsRes.data || []).sort((a: GoldenLevelItem, b: GoldenLevelItem) => a.orderNum - b.orderNum);
      setGoldenItems(sortedItems);

      // Obtener preguntas del nivel dorado
      const questionsRes = await axiosInstance.get(`/levels/golden/${levelId}/questions`);
      const sortedQuestions = (questionsRes.data || []).sort((a: GoldenLevelQuestion, b: GoldenLevelQuestion) => a.orderNum - b.orderNum);
      setGoldenQuestions(sortedQuestions);

      // Obtener respuestas anteriores
      const answersRes = await axiosInstance.get(`/progress/golden-level/${levelId}/answers`);
      const previousAnswersMap: Record<string, string> = {};
      
      (answersRes.data || []).forEach((answer: any) => {
        previousAnswersMap[answer.questionId] = answer.answerId;
      });
      setPreviousAnswers(previousAnswersMap);

      // Inicializar respuestas con las anteriores
      const initialAnswers: Record<string, string> = {};
      sortedQuestions.forEach((q: GoldenLevelQuestion) => {
        initialAnswers[q.id] = previousAnswersMap[q.id] || '';
      });
      setGoldenAnswers(initialAnswers);

      // Verificar si el nivel está completado
      try {
        const progressRes = await axiosInstance.get(`/progress/game-state`);
        const goldenProgress = progressRes.data?.goldenLevelProgress?.[levelId];
        if (goldenProgress?.isCompleted) {
          setGoldenCompleted(true);
          setTotalGoldenStars(goldenProgress.starsEarned || 0);
          // Si ya está completado, ir directamente a items para navegar el contenido
          setGoldenStage('items');
        }
      } catch (progressErr) {
        console.warn('Could not fetch golden level progress');
      }
    } catch (err: any) {
      console.error('Error fetching golden level:', err);
      setError(err.response?.data?.message || 'Error al cargar contenido dorado');
    }
  }, [levelId]);
  const fetchFinalLevel = useCallback(async () => {
    try {
      // Obtener preguntas del nivel final
      const questionsRes = await axiosInstance.get(`/levels/final/${levelId}/questions`);
      const sortedQuestions = (questionsRes.data || []).sort((a: FinalLevelQuestion, b: FinalLevelQuestion) => a.orderNum - b.orderNum);
      
      // Obtener opciones de respuesta para cada pregunta
      const questionsWithOptions = await Promise.all(
        sortedQuestions.map(async (question: FinalLevelQuestion) => {
          try {
            const optionsRes = await axiosInstance.get(`/levels/final/questions/${question.id}/answers`);
            const sortedOptions = (optionsRes.data || []).sort((a: FinalLevelAnswerOption, b: FinalLevelAnswerOption) => a.orderNum - b.orderNum);
            return { ...question, options: sortedOptions };
          } catch (optErr) {
            console.warn('Error fetching options for question', question.id);
            return { ...question, options: [] };
          }
        })
      );

      setFinalQuestions(questionsWithOptions);

      // Verificar si el nivel está completado
      try {
        const progressRes = await axiosInstance.get(`/progress/game-state`);
        const finalProgress = progressRes.data?.finalLevelProgress?.[levelId];
        if (finalProgress?.isCompleted) {
          setFinalCompleted(true);
          setTotalFinalStars(finalProgress.starsEarned || 0);
        }
      } catch (progressErr) {
        console.warn('Could not fetch final level progress');
      }
    } catch (err: any) {
      console.error('Error fetching final level:', err);
      setError(err.response?.data?.message || 'Error al cargar nivel final');
    }
  }, [levelId]);
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

        // Si es nivel dorado, cargar contenido dorado
        if (levelRes.data?.levelType === 'golden' || levelRes.data?.isGolden) {
          await fetchGoldenLevel();
        } else if (levelRes.data?.levelType === 'final') {
          // Si es nivel final, cargar contenido final
          await fetchFinalLevel();
        } else {
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
        }

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
  }, [isHydrated, levelId, token, router, refreshProgress, fetchGoldenLevel, fetchFinalLevel]);

  // Golden Level Handlers
  const handleGoldenAnswerChange = (questionId: string, answerId: string) => {
    if (!previousAnswers[questionId]) {
      setGoldenAnswers({
        ...goldenAnswers,
        [questionId]: answerId
      });
    }
  };

  const handleGoldenAnswerSubmit = async () => {
    const currentQuestion = goldenQuestions[currentQuestionIndex];
    
    // Si ya fue respondida, solo mostrar el panel de validación
    if (previousAnswers[currentQuestion.id]) {
      setLastAnswerCorrect(true); // Las preguntas respondidas se consideran correctas
      setShowValidationPanel(true);
      return;
    }

    // Nueva respuesta - validar que haya seleccionado
    if (!goldenAnswers[currentQuestion.id]) {
      alert('Por favor selecciona una respuesta');
      return;
    }

    try {
      const answerId = goldenAnswers[currentQuestion.id];
      setIsValidating(true);

      // Enviar respuesta a la API
      const responseRes = await axiosInstance.post(
        `/progress/answer/golden`,
        {
          questionId: currentQuestion.id,
          answerId,
        }
      );

      setIsValidating(false);

      const isCorrect = responseRes.data.isCorrect;
      
      // Actualizar respuestas anteriores
      setPreviousAnswers({
        ...previousAnswers,
        [currentQuestion.id]: answerId
      });

      // Actualizar estrellas totales
      if (isCorrect) {
        setTotalGoldenStars(totalGoldenStars + 2);
      }

      // Mostrar panel de validación
      setLastAnswerCorrect(isCorrect);
      setShowValidationPanel(true);
    } catch (err: any) {
      console.error('Error:', err);
      setIsValidating(false);
      alert('Error al guardar respuesta: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleValidationPanelContinue = () => {
    setShowValidationPanel(false);
    
    // Ir a la siguiente pregunta o resultados
    if (currentQuestionIndex === goldenQuestions.length - 1) {
      // Última pregunta - ir a resultados
      setGoldenStage('results');
    } else {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const getResultMessage = () => {
    if (totalGoldenStars === 0) return 'Sigue Practicando';
    if (totalGoldenStars === 2) return 'Buen Avance';
    if (totalGoldenStars === 4) return 'Buen desempeño';
    if (totalGoldenStars === 6) return 'Nivel Dorado Conquistado';
    return 'Nivel Dorado Conquistado';
  };

  const handleReturnToWorld = () => {
    router.push(`/game/worlds/${level?.world.id}`);
  };

  // Final Level Handlers
  const handleFinalAnswerChange = (questionId: string, answerId: string) => {
    if (!previousFinalAnswers[questionId]) {
      setFinalAnswers({
        ...finalAnswers,
        [questionId]: answerId
      });
    }
  };

  const handleFinalAnswerSubmit = async () => {
    const currentQuestion = finalQuestions[currentFinalQuestionIndex];
    
    // Si ya fue respondida, solo mostrar el panel de validación
    if (previousFinalAnswers[currentQuestion.id]) {
      setLastFinalAnswerCorrect(true);
      setShowFinalValidationPanel(true);
      return;
    }

    // Nueva respuesta - validar que haya seleccionado
    if (!finalAnswers[currentQuestion.id]) {
      alert('Por favor selecciona una respuesta');
      return;
    }

    try {
      const answerId = finalAnswers[currentQuestion.id];
      setIsFinalValidating(true);

      // Enviar respuesta a la API
      const responseRes = await axiosInstance.post(
        `/progress/answer/final`,
        {
          questionId: currentQuestion.id,
          answerId,
        }
      );

      setIsFinalValidating(false);

      const isCorrect = responseRes.data.isCorrect;
      
      // Actualizar respuestas anteriores
      setPreviousFinalAnswers({
        ...previousFinalAnswers,
        [currentQuestion.id]: answerId
      });

      // Actualizar estrellas totales (1 por respuesta correcta)
      if (isCorrect) {
        setTotalFinalStars(totalFinalStars + 1);
      }

      // Mostrar panel de validación
      setLastFinalAnswerCorrect(isCorrect);
      setShowFinalValidationPanel(true);
    } catch (err: any) {
      console.error('Error:', err);
      setIsFinalValidating(false);
      alert('Error al guardar respuesta: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleFinalValidationPanelContinue = () => {
    setShowFinalValidationPanel(false);
    
    // Ir a la siguiente pregunta o resultados
    if (currentFinalQuestionIndex === finalQuestions.length - 1) {
      // Última pregunta - ir a resultados
      setFinalStage('results');
    } else {
      setCurrentFinalQuestionIndex(currentFinalQuestionIndex + 1);
      setIsQuestionVideoFinished(false);
      setFinalStage('questionOrder');
    }
  };

  const getCurrentFinalQuestion = (): FinalLevelQuestion | null => {
    return finalQuestions[currentFinalQuestionIndex] || null;
  };

  const getCorrectOption = (question: FinalLevelQuestion): FinalLevelAnswerOption | null => {
    return question.options?.find(opt => opt.isCorrect) || null;
  };

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
      {isFinalLevel() ? (
        // FINAL LEVEL FLOW
        <>
          {finalStage === 'intro' && (
            <div className="min-h-screen bg-gradient-to-br from-purple-600 via-purple-500 to-pink-600 flex items-center justify-center px-4">
              <div className="fixed top-0 left-0 w-full pb-10 bg-gradient-to-b from-black/80 to-black/0 z-20">
                <div className="mission-header max-w-sm mx-auto flex px-4 pb-6 justify-between items-center">
                  <button onClick={() => router.push(`/game/worlds/${level?.world.id}`)}>
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
                    <div className="level-title uppercase font-black text-2xl leading-none">{level?.name}</div>
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

              <div className="max-w-sm text-center">
                <h1 className="text-5xl font-black text-white mb-8" style={{ fontFamily: "'Blinker', sans-serif" }}>
                  Llego el momento de aplicar lo aprendido
                </h1>
                <button
                  onClick={() => setFinalStage('introVideo')}
                  className="bg-white text-purple-600 px-8 py-4 rounded-lg font-bold text-2xl hover:bg-gray-100 transition"
                  style={{ fontFamily: "'Blinker', sans-serif" }}
                >
                  Empezar
                </button>
              </div>
            </div>
          )}

          {finalStage === 'introVideo' && (level?.introVideoId || level?.introVideoUrl) && (
            <div className="min-h-screen bg-black flex flex-col">
              {/* Header con botones de navegación */}
              <div className="fixed top-0 left-0 w-full z-30">
                <div className="max-w-sm mx-auto flex px-4 py-4 justify-between items-center">
                  <button onClick={() => setFinalStage('intro')}>
                    <Image
                      src="/images/btn-back.png"
                      alt="Atrás"
                      width={50}
                      height={50}
                      className="h-auto"
                      priority
                    />
                  </button>
                  <div className="flex-1"></div>
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

              {/* Video centrado - ocupa toda la altura disponible */}
              <div className="flex-1 flex items-center justify-center px-4 pt-20 pb-20">
                <div className="max-w-sm w-full h-full flex items-center justify-center bg-black rounded-lg overflow-hidden">
                  <MediaPlayer
                    videoSource={level.introVideoId || level.introVideoUrl || ''}
                    onEnded={() => setIsVideoFinished(true)}
                    autoplay={true}
                    controls={true}
                  />
                </div>
              </div>

              {/* Botón Continuar centrado en la parte superior cuando video termina */}
              {isVideoFinished || finalCompleted ? (
                <div className="fixed top-0 left-0 right-0 z-40 flex justify-center items-center pt-24">
                  <button
                    onClick={() => {
                      setCurrentFinalQuestionIndex(0);
                      setIsVideoFinished(false);
                      setFinalStage('questionOrder');
                    }}
                    className="bg-white text-purple-600 px-8 py-4 rounded-lg font-bold text-2xl hover:bg-gray-100 transition shadow-lg"
                    style={{ fontFamily: "'Blinker', sans-serif" }}
                  >
                    Continuar
                  </button>
                </div>
              ) : null}
            </div>
          )}

          {finalStage === 'questionOrder' && getCurrentFinalQuestion() && (
            <div className="min-h-screen bg-gradient-to-br from-purple-600 via-purple-500 to-pink-600 p-8 pb-40 flex flex-col items-center justify-center">
              <div className="fixed top-0 left-0 w-full pb-10 bg-gradient-to-b from-black/80 to-black/0 z-20">
                <div className="mission-header max-w-sm mx-auto flex px-4 pb-6 justify-between items-center">
                  <button onClick={() => setFinalStage('introVideo')}>
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
                    <div className="level-title uppercase font-black text-2xl leading-none">{level?.name}</div>
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

              <div className="max-w-sm mx-auto flex-1 flex flex-col items-center justify-center">
                <h1 className="text-5xl font-black text-white mb-8" style={{ fontFamily: "'Blinker', sans-serif" }}>
                  Pedido {currentFinalQuestionIndex + 1}
                </h1>
              </div>

              <div className="fixed bottom-0 left-0 right-0 z-20 flex justify-center items-center py-6">
                <button
                  onClick={() => setFinalStage('questionVideo')}
                  className="bg-white text-purple-600 px-8 py-4 rounded-lg font-bold text-2xl hover:bg-gray-100 transition"
                  style={{ fontFamily: "'Blinker', sans-serif" }}
                >
                  Continuar
                </button>
              </div>
            </div>
          )}

          {finalStage === 'questionVideo' && (getCurrentFinalQuestion()?.startVideoId || getCurrentFinalQuestion()?.startVideoUrl) ? (
            <div className="final-question-video min-h-screen bg-black flex flex-col">
              {/* Header con botones de navegación */}
              <div className="fixed top-0 left-0 w-full z-30">
                <div className="max-w-sm mx-auto flex px-4 py-4 justify-between items-center">
                  <button onClick={() => setFinalStage('questionOrder')}>
                    <Image
                      src="/images/btn-back.png"
                      alt="Atrás"
                      width={50}
                      height={50}
                      className="h-auto"
                      priority
                    />
                  </button>
                  <div className="flex-1"></div>
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

              {/* Video centrado - ocupa toda la altura disponible */}
              <div className="flex-1 flex items-center justify-center px-4 pt-20 pb-20">
                <div className="max-w-sm w-full h-full flex items-center justify-center bg-black rounded-lg overflow-hidden">
                  <MediaPlayer
                    videoSource={getCurrentFinalQuestion()?.startVideoId || getCurrentFinalQuestion()?.startVideoUrl || ''}
                    onEnded={() => {
                      setIsQuestionVideoFinished(false);
                      setFinalStage('questionModal');
                    }}
                    autoplay={true}
                    controls={true}
                  />
                </div>
              </div>
            </div>
          ) : null}

          {finalStage === 'questionModal' && getCurrentFinalQuestion() && (
            <div className="min-h-screen bg-gradient-to-br from-purple-600 via-purple-500 to-pink-600 p-8 pb-40 flex flex-col items-center justify-center">
              <div className="fixed top-0 left-0 w-full pb-10 bg-gradient-to-b from-black/80 to-black/0 z-20">
                <div className="mission-header max-w-sm mx-auto flex px-4 pb-6 justify-between items-center">
                  <button onClick={() => setFinalStage('questionVideo')}>
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
                    <div className="level-title uppercase font-black text-2xl leading-none">{level?.name}</div>
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

              <div className="max-w-sm mx-auto flex-1 flex flex-col items-center justify-center">
                <div className="fixed bottom-0 left-0 right-0 z-40 flex justify-center items-center py-6">
                  <div className="max-w-xs w-full mx-4 bg-white rounded-3xl shadow-2xl p-8">
                    <div className="text-center mb-6">
                      <div 
                        className="text-lg font-bold text-gray-800 prose prose-sm max-w-none mb-6"
                        dangerouslySetInnerHTML={{ __html: getCurrentFinalQuestion()!.content }}
                        style={{ fontFamily: "'Blinker', sans-serif" }}
                      />
                    </div>
                    <button
                      onClick={() => setFinalStage('questionOptions')}
                      className="w-full bg-purple-500 hover:bg-purple-600 text-white font-bold py-3 px-6 rounded-2xl transition-colors"
                      style={{ fontFamily: "'Blinker', sans-serif" }}
                    >
                      Continuar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {finalStage === 'questionOptions' && getCurrentFinalQuestion() && (
            <div className="min-h-screen bg-gradient-to-br from-purple-600 via-purple-500 to-pink-600 flex flex-col">
              {/* Header con botones de navegación */}
              <div className="fixed top-0 left-0 w-full z-40 bg-gradient-to-b from-black/60 to-black/0 pb-4">
                <div className="max-w-sm mx-auto flex px-4 py-4 justify-between items-center">
                  <button onClick={() => setFinalStage('questionModal')}>
                    <Image
                      src="/images/btn-back.png"
                      alt="Atrás"
                      width={50}
                      height={50}
                      className="h-auto"
                      priority
                    />
                  </button>
                  <div className="flex-1"></div>
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

              {/* Contenido scrolleable con opciones */}
              <div className="flex-1 overflow-y-auto pt-24 pb-32 px-4 flex flex-col items-center justify-start">
                <div className="max-w-sm w-full">
                  <h2 className="text-3xl font-black text-white mb-8 text-center" style={{ fontFamily: "'Blinker', sans-serif" }}>
                    Selecciona tu mejor recomendación
                  </h2>

                  <div className="grid grid-cols-1 gap-4 w-full mb-12">
                    {getCurrentFinalQuestion()?.options?.map((option) => (
                      <button
                        key={option.id}
                        onClick={() => handleFinalAnswerChange(getCurrentFinalQuestion()!.id, option.id)}
                        disabled={!!previousFinalAnswers[getCurrentFinalQuestion()!.id]}
                        className={`p-4 rounded-xl border-2 transition-all cursor-pointer ${
                          finalAnswers[getCurrentFinalQuestion()!.id] === option.id
                            ? 'bg-green-500 border-green-600 text-white shadow-lg'
                            : 'bg-white border-gray-200 text-gray-800 hover:border-gray-400 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed'
                        }`}
                      >
                        {option.imageId && getImageUrl(option.imageId) && (
                          <img
                            src={getImageUrl(option.imageId) || ''}
                            alt={option.text}
                            className="w-full h-32 object-cover rounded-lg mb-3"
                          />
                        )}
                        <span className="block font-semibold text-center">{option.text}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Botón Responder en la parte inferior */}
              <div className="fixed bottom-0 left-0 right-0 z-40 flex justify-center items-center py-6 bg-gradient-to-t from-purple-600 via-purple-500 to-transparent">
                <button
                  onClick={handleFinalAnswerSubmit}
                  disabled={!getCurrentFinalQuestion() || (!finalAnswers[getCurrentFinalQuestion()!.id] && !previousFinalAnswers[getCurrentFinalQuestion()!.id])}
                  className={`px-8 py-4 rounded-lg font-bold text-2xl transition ${
                    getCurrentFinalQuestion() && (finalAnswers[getCurrentFinalQuestion()!.id] || previousFinalAnswers[getCurrentFinalQuestion()!.id])
                      ? 'bg-white text-purple-600 hover:bg-gray-100'
                      : 'bg-gray-400 text-gray-600 cursor-not-allowed opacity-50'
                  }`}
                  style={{ fontFamily: "'Blinker', sans-serif" }}
                >
                  Responder
                </button>
              </div>

              {isFinalValidating && (
                <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-4 border-white border-t-purple-500 mx-auto mb-4"></div>
                    <p className="text-white text-lg font-bold" style={{ fontFamily: "'Blinker', sans-serif" }}>Validando respuesta...</p>
                  </div>
                </div>
              )}

              {showFinalValidationPanel && (
                <div className="fixed bottom-0 left-0 right-0 z-50 flex justify-center items-center py-6">
                  <div className="max-w-md w-full mx-4 bg-white rounded-3xl shadow-2xl p-8">
                    <div className="text-center mb-6">
                      {lastFinalAnswerCorrect ? (
                        <>
                          <h2 className="text-3xl font-black text-green-600 mb-6" style={{ fontFamily: "'Blinker', sans-serif" }}>
                            Bien hecho
                          </h2>
                          <p className="text-gray-700 font-semibold mb-6">
                            {getCurrentFinalQuestion()?.correctMessage}
                          </p>
                        </>
                      ) : (
                        <>
                          <h2 className="text-3xl font-black text-orange-500 mb-6" style={{ fontFamily: "'Blinker', sans-serif" }}>
                            Casi
                          </h2>
                          <p className="text-gray-700 font-semibold mb-6">
                            {getCurrentFinalQuestion()?.incorrectMessage}
                          </p>
                        </>
                      )}

                      {getCorrectOption(getCurrentFinalQuestion()!) && (
                        <div className="bg-gray-100 rounded-lg p-4 mb-6">
                          {getCorrectOption(getCurrentFinalQuestion()!)?.imageId && getImageUrl(getCorrectOption(getCurrentFinalQuestion()!)?.imageId) && (
                            <img
                              src={getImageUrl(getCorrectOption(getCurrentFinalQuestion()!)?.imageId) || ''}
                              alt="Opción correcta"
                              className="w-full h-32 object-cover rounded-lg mb-3"
                            />
                          )}
                          <p className="font-semibold text-gray-800">
                            {getCorrectOption(getCurrentFinalQuestion()!)?.text}
                          </p>
                        </div>
                      )}
                    </div>
                    <button
                      onClick={handleFinalValidationPanelContinue}
                      className="w-full bg-purple-500 hover:bg-purple-600 text-white font-bold py-3 px-6 rounded-2xl transition-colors"
                      style={{ fontFamily: "'Blinker', sans-serif" }}
                    >
                      Continuar
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {finalStage === 'results' && (
            <div className="min-h-screen bg-gradient-to-br from-purple-600 via-purple-500 to-pink-600 flex items-center justify-center px-4 pb-40">
              <div className="fixed top-0 left-0 w-full pb-10 bg-gradient-to-b from-black/80 to-black/0 z-20">
                <div className="mission-header max-w-sm mx-auto flex px-4 pb-6 justify-between items-center">
                  <div />
                  <h1 className="text-3xl font-bold text-white text-center flex-1 leading-none" style={{ fontFamily: "'Blinker', sans-serif" }}>
                    <span className="block text-lg">NIVEL</span>
                    <div className="level-title uppercase font-black text-2xl leading-none">{level?.name}</div>
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

              <div className="max-w-sm text-center">
                <h1 className="text-5xl font-black text-white mb-8" style={{ fontFamily: "'Blinker', sans-serif" }}>
                  Felicidades
                </h1>

                <div className="bg-white rounded-3xl p-8 mb-8">
                  <p className="text-6xl font-black text-purple-600 mb-4 font-bowlby">
                    {totalFinalStars} ⭐
                  </p>
                  <p className="text-gray-700 font-semibold">
                    Estrellas ganadas
                  </p>
                </div>

                <button
                  onClick={handleReturnToWorld}
                  className="bg-white text-purple-600 px-8 py-4 rounded-lg font-bold text-2xl hover:bg-gray-100 transition w-full"
                  style={{ fontFamily: "'Blinker', sans-serif" }}
                >
                  Finalizar
                </button>
              </div>
            </div>
          )}
        </>
      ) : isGoldenLevel() ? (
        // GOLDEN LEVEL FLOW
        <>
          {goldenStage === 'intro' && (
            <div className="min-h-screen bg-gradient-to-br from-gold-600 via-gold-500 to-gold-700 flex items-center justify-center px-4">
              <div className="fixed top-0 left-0 w-full pb-10 bg-gradient-to-b from-black/80 to-black/0 z-20">
                <div className="mission-header max-w-sm mx-auto flex px-4 pb-6 justify-between items-center">
                  <button onClick={() => router.push(`/game/worlds/${level?.world.id}`)}>
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
                    <div className="level-title uppercase font-black text-2xl leading-none">{level?.name}</div>
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

              <div className="max-w-sm text-center">
                <h1 className="text-5xl font-black text-white mb-8" style={{ fontFamily: "'Blinker', sans-serif" }}>
                  ¡Bienvenido al Nivel Dorado!
                </h1>
                <button
                  onClick={() => setGoldenStage('imageIntro')}
                  className="bg-white text-gold-600 px-8 py-4 rounded-lg font-bold text-2xl hover:bg-gray-100 transition"
                  style={{ fontFamily: "'Blinker', sans-serif" }}
                >
                  Comenzar
                </button>
              </div>
            </div>
          )}

          {goldenStage === 'imageIntro' && level?.imageId && (
            <div className="min-h-screen bg-gradient-to-br from-gold-600 via-gold-500 to-gold-700 p-8 pb-40 flex flex-col items-center justify-center">
              <div className="fixed top-0 left-0 w-full pb-10 bg-gradient-to-b from-black/80 to-black/0 z-20">
                <div className="mission-header max-w-sm mx-auto flex px-4 pb-6 justify-between items-center">
                  <button onClick={() => setGoldenStage('intro')}>
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

              <div className="max-w-sm mx-auto pt-28 flex-1 flex flex-col items-center justify-center">
                <div className="bg-white rounded-3xl shadow-lg p-6 mb-8 w-full">
                  {getImageUrl(level.imageId) && (
                    <img
                      src={getImageUrl(level.imageId) || ''}
                      alt="Introducción"
                      className="w-full h-64 object-cover rounded-lg"
                    />
                  )}
                </div>
              </div>

              <div className="fixed bottom-0 left-0 right-0 z-20 flex justify-center items-center py-6">
                <div className="flex gap-8">
                  <button
                    onClick={() => {}}
                    disabled={true}
                    className="text-black hover:opacity-75 font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Image src="/images/content-arrow-left.png" alt="Anterior" width={50} height={50} className="inline-block" />
                  </button>
                  <button
                    onClick={() => setGoldenStage('items')}
                    className="text-black hover:opacity-75 font-bold"
                  >
                    <Image src="/images/content-arrow-right.png" alt="Siguiente" width={50} height={50} className="inline-block" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {goldenStage === 'items' && goldenItems.length > 0 && (
            <div className="min-h-screen bg-gradient-to-br from-gold-600 via-gold-500 to-gold-700 p-8 pb-40">
              <div className="fixed top-0 left-0 w-full pb-10 bg-gradient-to-b from-black/80 to-black/0 z-20">
                <div className="mission-header max-w-sm mx-auto flex px-4 pb-6 justify-between items-center">
                  <button onClick={() => setGoldenStage('imageIntro')}>
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

              <div className="max-w-sm mx-auto pt-28 flex-1 flex flex-col items-center justify-center">
                {goldenItems[currentItemIndex] && getImageUrl(goldenItems[currentItemIndex].detail) && (
                  <div className="bg-white rounded-3xl shadow-lg p-6 mb-8 w-full">
                    <img
                      src={goldenItems[currentItemIndex].detail}
                      alt={goldenItems[currentItemIndex].title}
                      className="w-full h-64 object-cover rounded-lg mb-4"
                    />
                    <h2 className="text-xl font-bold text-center text-gray-800">
                      {goldenItems[currentItemIndex].title}
                    </h2>
                  </div>
                )}
              </div>

              <div className="fixed bottom-0 left-0 right-0 z-20 flex justify-center items-center py-6">
                <div className="flex gap-8">
                  <button
                    onClick={() => setCurrentItemIndex(Math.max(0, currentItemIndex - 1))}
                    disabled={currentItemIndex === 0}
                    className="text-black hover:opacity-75 font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Image src="/images/content-arrow-left.png" alt="Anterior" width={50} height={50} className="inline-block" />
                  </button>
                  <button
                    onClick={() => {
                      if (currentItemIndex < goldenItems.length - 1) {
                        setCurrentItemIndex(currentItemIndex + 1);
                      } else if (!goldenCompleted) {
                        // Solo avanza a testPrep si el nivel no está completado
                        setGoldenStage('testPrep');
                      }
                    }}
                    disabled={goldenCompleted && currentItemIndex >= goldenItems.length - 1}
                    className="text-black hover:opacity-75 font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Image src="/images/content-arrow-right.png" alt="Siguiente" width={50} height={50} className="inline-block" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {goldenStage === 'testPrep' && (
            <div className="min-h-screen bg-gradient-to-br from-gold-600 via-gold-500 to-gold-700 p-8 pb-40 flex flex-col items-center justify-center">
              <div className="fixed top-0 left-0 w-full pb-10 bg-gradient-to-b from-black/80 to-black/0 z-20">
                <div className="mission-header max-w-sm mx-auto flex px-4 pb-6 justify-between items-center">
                  <button onClick={() => setGoldenStage('items')}>
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

              <div className="exam-init-view max-w-sm text-center">
                <h2 className="text-5xl font-black text-white mb-8" style={{ fontFamily: "'Blinker', sans-serif" }}>
                  Pon a prueba tus<br />conocimientos
                </h2>
                {goldenCompleted ? (
                  <div className="bg-white rounded-lg p-6 mb-8">
                    <p className="text-gray-800 font-bold text-lg" style={{ fontFamily: "'Blinker', sans-serif" }}>
                      ✓ Este nivel ya fue completado
                    </p>
                  </div>
                ) : null}
                <button
                  onClick={() => {
                    setCurrentQuestionIndex(0);
                    setGoldenStage('questions');
                  }}
                  disabled={goldenCompleted}
                  className={`px-8 py-4 rounded-lg font-bold text-2xl transition ${
                    goldenCompleted
                      ? 'bg-gray-400 text-gray-600 cursor-not-allowed opacity-50'
                      : 'bg-white text-gold-600 hover:bg-gray-100'
                  }`}
                  style={{ fontFamily: "'Blinker', sans-serif" }}
                >
                  {goldenCompleted ? 'Completado' : 'Iniciar'}
                </button>
              </div>
            </div>
          )}

          {goldenStage === 'questions' && goldenQuestions.length > 0 && (
            <div className="evaluation-page min-h-screen content-page p-8 pb-40">
              <div className="fixed top-0 left-0 w-full pb-10 bg-gradient-to-b from-black/80 to-black/0 z-30">
                <div className="mission-header max-w-sm mx-auto flex px-4 pb-6 justify-between items-center">
                  <button onClick={() => setGoldenStage('testPrep')}>
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
                    <span className="block text-lg">NIVEL DORADO</span>
                    <div className="content-title font-black text-2xl leading-none">{level.name}</div>
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

              <div className="max-w-4xl mx-auto pt-[160px] pb-16">
                {goldenQuestions[currentQuestionIndex] && (
                  <>
                    <div className="question-reference uppercase text-black font-blinker leading-none text-xl font-black text-center mb-4">
                      Selecciona la<br />respuesta correcta
                      <Image 
                        src="/images/content-down.png"
                        alt="Referencia de pregunta"
                        width={20}
                        height={20}
                        className="h-auto mx-auto mt-4"
                        priority
                      />
                    </div>

                    <div className="bg-white max-w-sm mx-auto rounded-3xl shadow-lg p-6 mb-4">
                      {goldenQuestions[currentQuestionIndex].imageId && getImageUrl(goldenQuestions[currentQuestionIndex].imageId) && (
                        <div className="mb-6 flex justify-center">
                          <img
                            src={getImageUrl(goldenQuestions[currentQuestionIndex].imageId) || ''}
                            alt="Pregunta"
                            className="max-w-full h-auto max-h-64 rounded-lg"
                          />
                        </div>
                      )}

                      <div 
                        className="text-xl font-black text-center text-gray-800 prose prose-sm max-w-none"
                        dangerouslySetInnerHTML={{ __html: goldenQuestions[currentQuestionIndex].content }}
                        style={{ fontFamily: "'Blinker', sans-serif" }}
                      />
                    </div>

                    <div className="max-w-sm mx-auto grid grid-cols-3 gap-4 mb-8">
                      {goldenQuestions[currentQuestionIndex].options?.map((option) => (
                        <button
                          key={option.id}
                          onClick={() => handleGoldenAnswerChange(goldenQuestions[currentQuestionIndex].id, option.id)}
                          disabled={!!previousAnswers[goldenQuestions[currentQuestionIndex].id]}
                          className={`relative p-2 rounded-xl border-2 transition-all cursor-pointer overflow-hidden group ${
                            goldenAnswers[goldenQuestions[currentQuestionIndex].id] === option.id
                              ? 'bg-green-500 border-green-600 text-white shadow-lg'
                              : 'bg-white border-gray-200 text-gray-800 hover:border-gray-400 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed'
                          }`}
                        >
                          <input
                            type="radio"
                            name={`question-${goldenQuestions[currentQuestionIndex].id}`}
                            value={option.id}
                            checked={goldenAnswers[goldenQuestions[currentQuestionIndex].id] === option.id}
                            onChange={() => {}}
                            className="hidden"
                            disabled={!!previousAnswers[goldenQuestions[currentQuestionIndex].id]}
                          />

                          {option.imageId && getImageUrl(option.imageId) && (
                            <img
                              src={getImageUrl(option.imageId) || ''}
                              alt={option.text}
                              className="w-full h-24 object-cover rounded-lg mb-3"
                            />
                          )}            

                          {!option.imageId && (
                            <span className="block font-semibold text-center text-xs leading-tight">
                              {option.text}
                            </span>
                          )}

                          {goldenAnswers[goldenQuestions[currentQuestionIndex].id] === option.id && (
                            <div className="absolute top-2 right-2 bg-white rounded-full p-1">
                              <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            </div>
                          )}
                        </button>
                      ))}
                    </div>

                    {previousAnswers[goldenQuestions[currentQuestionIndex].id] && (
                      <div className="max-w-sm mx-auto px-4 py-3 rounded-lg mb-8 text-center font-semibold border-2 bg-green-100 border-green-400 text-green-800" style={{ fontFamily: "'Blinker', sans-serif" }}>
                        ✓ Pregunta respondida
                      </div>
                    )}
                  </>
                )}
              </div>

              <div className="panel-control fixed bottom-0 left-0 right-0 z-40 flex justify-center items-center py-6">
                <div className="flex items-center justify-between" style={{ maxWidth: '120px' }}>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
                      disabled={currentQuestionIndex === 0}
                      className="text-black hover:opacity-75 font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Image src="/images/content-arrow-left.png" alt="Anterior" width={50} height={50} className="inline-block mr-2" />
                    </button>
                    <button
                      onClick={handleGoldenAnswerSubmit}
                      disabled={!goldenAnswers[goldenQuestions[currentQuestionIndex]?.id] && !previousAnswers[goldenQuestions[currentQuestionIndex]?.id]}
                      className="text-black hover:opacity-75 font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Image src="/images/content-arrow-right.png" alt="Siguiente" width={50} height={50} className="inline-block ml-2" />
                    </button>
                  </div>
                </div>
              </div>

              {isValidating && (
                <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-4 border-white border-t-gold-500 mx-auto mb-4"></div>
                    <p className="text-white text-lg font-bold" style={{ fontFamily: "'Blinker', sans-serif" }}>Validando respuesta...</p>
                  </div>
                </div>
              )}

              {showValidationPanel && (
                <div className="fixed bottom-0 left-0 right-0 z-50 flex justify-center items-center py-6">
                  <div className="max-w-xs w-full mx-4 bg-white rounded-3xl shadow-2xl p-8">
                    <div className="text-center mb-6">
                      {lastAnswerCorrect ? (
                        <>
                          <div className="text-6xl mb-4">✓</div>
                          <h2 className="text-2xl font-bold text-green-600" style={{ fontFamily: "'Blinker', sans-serif" }}>
                            ¡Respuesta Correcta!
                          </h2>
                        </>
                      ) : (
                        <>
                          <div className="text-6xl mb-4">✗</div>
                          <h2 className="text-2xl font-bold text-red-600" style={{ fontFamily: "'Blinker', sans-serif" }}>
                            Respuesta Incorrecta
                          </h2>
                        </>
                      )}
                    </div>
                    <button
                      onClick={handleValidationPanelContinue}
                      className="w-full bg-gold-500 hover:bg-gold-600 text-white font-bold py-3 px-6 rounded-2xl transition-colors"
                      style={{ fontFamily: "'Blinker', sans-serif" }}
                    >
                      Continuar
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {goldenStage === 'results' && (
            <div className="min-h-screen bg-gradient-to-br from-gold-600 via-gold-500 to-gold-700 flex items-center justify-center px-4 pb-40">
              <div className="max-w-sm text-center">
                <div className="mb-8">
                  <Image 
                    src="/images/icon-tick.png"
                    alt="Completado"
                    width={60}
                    height={60}
                    className="mx-auto mb-6"
                  />
                </div>

                <h1 className="text-4xl font-black text-white mb-6" style={{ fontFamily: "'Blinker', sans-serif" }}>
                  {getResultMessage()}
                </h1>

                <div className="bg-white rounded-3xl p-8 mb-8">
                  <p className="text-5xl font-black text-gold-600 mb-4 font-bowlby">
                    {totalGoldenStars} ⭐
                  </p>
                  <p className="text-gray-700 font-semibold">
                    Estrellas ganadas
                  </p>
                </div>

                <button
                  onClick={handleReturnToWorld}
                  className="bg-white text-gold-600 px-8 py-4 rounded-lg font-bold text-2xl hover:bg-gray-100 transition w-full"
                  style={{ fontFamily: "'Blinker', sans-serif" }}
                >
                  Continuar
                </button>
              </div>
            </div>
          )}
        </>
      ) : (
        // NORMAL LEVEL FLOW (MISSIONS)
        <div className="max-w-sm mx-auto">
          <div className="fixed top-0 left-0 w-full pb-10 bg-gradient-to-b from-black/80 to-black/0">
            <div className="mission-header max-w-sm mx-auto flex px-4 justify-between items-center">
              <button onClick={() => router.push(`/game/worlds/${level?.world.id}`)}>
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
                <div className="level-title uppercase font-black text-2xl leading-none">{level?.name}</div>
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
      )}
    </div>
  );
}
