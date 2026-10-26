'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import axiosInstance from '@/lib/axiosInstance';
import { useAuthStore } from '@/store/authStore';
import { useAuthCheck } from '@/hooks/useAuthCheck';
import MissionsFlow from './MissionsFlow';
import GoldLevelFlow from './GoldLevelFlow';
import FinalLevelFlow from './FinalLevelFlow';

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
  title: string;
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
  endVideoUrl?: string;
  endVideoId?: string;
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

interface FinalLevelAnswer {
  questionId: string;
  answerId: string;
  isCorrect: boolean;
  starsEarned: number;
}

interface MissionProgress {
  missionId: string;
  starsEarned: number;
  isCompleted: boolean;
}

export default function LevelMissionsPage() {
  const { isHydrated } = useAuthCheck({ redirectTo: '/login' });
  const params = useParams();
  const router = useRouter();
  const levelId = params.levelId as string;

  const [level, setLevel] = useState<Level | null>(null);
  const [missions, setMissions] = useState<Mission[]>([]);
  const [missionProgress, setMissionProgress] = useState<Record<string, MissionProgress>>({});
  const [loading, setLoading] = useState(true);
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
  const [finalStage, setFinalStage] = useState<'intro' | 'introVideo' | 'questionOrder' | 'questionVideo' | 'questionModal' | 'questionOptions' | 'questionEndVideo' | 'results'>('intro');
  const [finalQuestions, setFinalQuestions] = useState<FinalLevelQuestion[]>([]);
  const [currentFinalQuestionIndex, setCurrentFinalQuestionIndex] = useState(0);
  const [finalAnswers, setFinalAnswers] = useState<Record<string, string>>({});
  const [previousFinalAnswers, setPreviousFinalAnswers] = useState<Record<string, string>>({});
  const [totalFinalStars, setTotalFinalStars] = useState(0);
  const [finalCorrectAnswersCount, setFinalCorrectAnswersCount] = useState(0);
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
        progressRes.data.missionProgress.forEach((p: MissionProgress) => {
          progressMap[p.missionId] = p;
        });
        setMissionProgress(progressMap);
      } else {
        setMissionProgress({});
      }
    } catch (progressErr) {
      console.warn('Error fetching progress, continuing without it');
      setMissionProgress({});
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

      const answersRes = await axiosInstance.get<FinalLevelAnswer[]>(
        `/progress/final-level/${levelId}/answers`
      );
      const savedAnswers = answersRes.data || [];
      const savedAnswersByQuestion = Object.fromEntries(
        savedAnswers.map(answer => [answer.questionId, answer.answerId])
      );

      setPreviousFinalAnswers(savedAnswersByQuestion);
      setFinalAnswers(savedAnswersByQuestion);
      setFinalCorrectAnswersCount(savedAnswers.filter(answer => answer.isCorrect).length);
      setFinalQuestions(questionsWithOptions);

      // Verificar si el nivel está completado
      try {
        const progressRes = await axiosInstance.get(`/progress/game-state`);
        const finalProgress = progressRes.data?.finalLevelProgress?.[levelId];
        setFinalCorrectAnswersCount(finalProgress?.correctAnswersCount || 0);
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
        
        if (err.response?.status === 401) {
          setError('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.');
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
    
    if (previousAnswers[currentQuestion.id]) {
      setLastAnswerCorrect(true);
      setShowValidationPanel(true);
      return;
    }

    if (!goldenAnswers[currentQuestion.id]) {
      alert('Por favor selecciona una respuesta');
      return;
    }

    try {
      const answerId = goldenAnswers[currentQuestion.id];
      setIsValidating(true);

      const responseRes = await axiosInstance.post(
        `/progress/answer/golden`,
        {
          questionId: currentQuestion.id,
          answerId,
        }
      );

      setIsValidating(false);

      const isCorrect = responseRes.data.isCorrect;
      
      setPreviousAnswers({
        ...previousAnswers,
        [currentQuestion.id]: answerId
      });

      if (isCorrect) {
        setTotalGoldenStars(totalGoldenStars + 2);
      }

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
    
    if (currentQuestionIndex === goldenQuestions.length - 1) {
      setGoldenStage('results');
    } else {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
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
    
    if (previousFinalAnswers[currentQuestion.id]) {
      handleFinalValidationPanelContinue();
      return;
    }

    if (!finalAnswers[currentQuestion.id]) {
      alert('Por favor selecciona una respuesta');
      return;
    }

    try {
      const answerId = finalAnswers[currentQuestion.id];
      setIsFinalValidating(true);

      const responseRes = await axiosInstance.post(
        `/progress/answer/final`,
        {
          questionId: currentQuestion.id,
          answerId,
        }
      );

      setIsFinalValidating(false);

      const isCorrect = responseRes.data.isCorrect;
      
      setPreviousFinalAnswers({
        ...previousFinalAnswers,
        [currentQuestion.id]: answerId
      });

      if (isCorrect) {
        setTotalFinalStars(totalFinalStars + 1);
        setFinalCorrectAnswersCount(count => count + 1);
      }

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
    
    if (currentFinalQuestionIndex === finalQuestions.length - 1) {
      const starsEarned = finalCorrectAnswersCount === 3
        ? 10
        : finalCorrectAnswersCount === 2
          ? 5
          : finalCorrectAnswersCount === 1
            ? 3
            : 0;
      setTotalFinalStars(starsEarned);
      setFinalStage('results');
    } else {
      setCurrentFinalQuestionIndex(currentFinalQuestionIndex + 1);
      setIsQuestionVideoFinished(false);
      setFinalStage('questionOrder');
    }
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

  const handleFinalStageChange = (stage: 'intro' | 'introVideo' | 'questionOrder' | 'questionVideo' | 'questionModal' | 'questionOptions' | 'questionEndVideo' | 'results') => {
    setFinalStage(stage);
  };

  const handleGoldenStageChange = (stage: 'intro' | 'imageIntro' | 'items' | 'testPrep' | 'questions' | 'results') => {
    setGoldenStage(stage);
  };

  const handleVideoFinished = () => {
    setIsVideoFinished(true);
  };

  const handleVideoPlaybackReset = () => {
    setIsVideoFinished(false);
  };

  const handleQuestionVideoFinished = () => {
    setIsQuestionVideoFinished(true);
  };

  const handleQuestionVideoPlaybackReset = () => {
    setIsQuestionVideoFinished(false);
  };

  return (
    <>
      {isFinalLevel() ? (
        <FinalLevelFlow
          level={level}
          finalQuestions={finalQuestions}
          finalStage={finalStage}
          currentFinalQuestionIndex={currentFinalQuestionIndex}
          finalAnswers={finalAnswers}
          previousFinalAnswers={previousFinalAnswers}
          totalFinalStars={totalFinalStars}
          finalCorrectAnswersCount={finalCorrectAnswersCount}
          isVideoFinished={isVideoFinished}
          isQuestionVideoFinished={isQuestionVideoFinished}
          isFinalValidating={isFinalValidating}
          showFinalValidationPanel={showFinalValidationPanel}
          lastFinalAnswerCorrect={lastFinalAnswerCorrect}
          onStageChange={handleFinalStageChange}
          onQuestionIndexChange={setCurrentFinalQuestionIndex}
          onAnswerChange={handleFinalAnswerChange}
          onAnswerSubmit={handleFinalAnswerSubmit}
          onValidationPanelContinue={handleFinalValidationPanelContinue}
          onVideoFinished={handleVideoFinished}
          onVideoPlaybackReset={handleVideoPlaybackReset}
          onQuestionVideoFinished={handleQuestionVideoFinished}
          onQuestionVideoPlaybackReset={handleQuestionVideoPlaybackReset}
        />
      ) : isGoldenLevel() ? (
        <GoldLevelFlow
          level={level}
          goldenItems={goldenItems}
          goldenQuestions={goldenQuestions}
          goldenStage={goldenStage}
          currentItemIndex={currentItemIndex}
          currentQuestionIndex={currentQuestionIndex}
          goldenAnswers={goldenAnswers}
          previousAnswers={previousAnswers}
          totalGoldenStars={totalGoldenStars}
          isValidating={isValidating}
          goldenCompleted={goldenCompleted}
          showValidationPanel={showValidationPanel}
          lastAnswerCorrect={lastAnswerCorrect}
          onStageChange={handleGoldenStageChange}
          onItemIndexChange={setCurrentItemIndex}
          onQuestionIndexChange={setCurrentQuestionIndex}
          onAnswerChange={handleGoldenAnswerChange}
          onAnswerSubmit={handleGoldenAnswerSubmit}
          onValidationPanelContinue={handleValidationPanelContinue}
        />
      ) : (
        <MissionsFlow
          level={level}
          missions={missions}
          missionProgress={missionProgress}
        />
      )}
    </>
  );
}
