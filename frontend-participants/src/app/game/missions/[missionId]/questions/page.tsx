'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import axios from 'axios';
import { useAuthStore } from '@/store/authStore';
import { useAuthCheck } from '@/hooks/useAuthCheck';
import OptionsMenu from '@/components/OptionsMenu';

interface AnswerOption {
  id: string;
  text: string;
  imageId?: string;
  isCorrect?: boolean;
  detail?: string;
  orderNum: number;
}

interface Question {
  id: string;
  content: string;
  imageId?: string;
  options: AnswerOption[];
  orderNum: number;
  starsValue?: number;
}

interface Mission {
  id: string;
  name: string;
  level: {
    id: string;
    name: string;
    world: {
      id: string;
      name: string;
    };
  };
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

const getImageUrl = (imageId?: string) => {
  if (!imageId) return null;
  return `${API_URL}/media/serve/${imageId}`;
};

export default function MissionQuestionsPage() {
  const { isHydrated } = useAuthCheck({ redirectTo: '/login' });
  const params = useParams();
  const router = useRouter();
  const missionId = params.missionId as string;

  const [mission, setMission] = useState<Mission | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});

  const token = useAuthStore((state) => state.token);

  const fetchData = useCallback(async () => {
    if (!missionId || !token) return;

    try {
      setError(null);
      setLoading(true);

      // Obtener datos de la misión
      const missionRes = await axios.get(`${API_URL}/missions/${missionId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMission(missionRes.data);

      // Obtener preguntas
      const questionsRes = await axios.get(`${API_URL}/questions/mission/${missionId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      const sortedQuestions = (questionsRes.data || []).sort(
        (a: Question, b: Question) => a.orderNum - b.orderNum
      );
      setQuestions(sortedQuestions);

      // Inicializar respuestas
      const initialAnswers: Record<string, string | string[]> = {};
      sortedQuestions.forEach((q: Question) => {
        initialAnswers[q.id] = '';
      });
      setAnswers(initialAnswers);
    } catch (err: any) {
      console.error('Error fetching data:', err);
      setError(err.response?.data?.message || 'Error al cargar las preguntas');
    } finally {
      setLoading(false);
    }
  }, [missionId, token]);

  useEffect(() => {
    if (isHydrated && missionId && token) {
      fetchData();
    }
  }, [isHydrated, missionId, token, fetchData]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-500 to-blue-500 p-8 pb-40 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white">Cargando preguntas...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-500 to-blue-500 p-8 pb-40">
        <div className="max-w-md mx-auto">
          <p className="text-white text-center mb-4">❌ {error}</p>
          <button
            onClick={() => router.back()}
            className="mt-4 bg-white text-purple-600 px-6 py-2 rounded-lg font-bold hover:bg-gray-100 w-full"
          >
            ← Volver
          </button>
        </div>
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

  if (questions.length === 0) {
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

          <OptionsMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />

          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <p className="text-gray-600 text-lg mb-6">No hay preguntas disponibles para esta misión</p>
            <button
              onClick={() => router.back()}
              className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 font-bold"
            >
              ← Volver al contenido
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === questions.length - 1;
  const hasAnswered = answers[currentQuestion.id] && answers[currentQuestion.id] !== '';

  const handleAnswerChange = (questionId: string, value: string) => {
    setAnswers({
      ...answers,
      [questionId]: value
    });
  };

  const handleSubmit = async () => {
    if (!hasAnswered) {
      alert('Por favor selecciona una respuesta');
      return;
    }

    try {
      const answerId = answers[currentQuestion.id] as string;

      await axios.post(
        `${API_URL}/progress/answer`,
        {
          questionId: currentQuestion.id,
          answerId,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (isLastQuestion) {
        // Todas las preguntas completadas
        router.push(`/game/levels/${mission.level.id}`);
      } else {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
      }
    } catch (err: any) {
      alert('Error al guardar respuesta: ' + (err.response?.data?.message || err.message));
    }
  };

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

        {/* Contenedor de pregunta */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          {/* Número de pregunta */}
          <div className="text-center mb-8">
            <span className="inline-block bg-purple-100 text-purple-800 px-4 py-2 rounded-full text-sm font-bold">
              Pregunta {currentQuestionIndex + 1} de {questions.length}
            </span>
          </div>

          {/* Imagen de la pregunta */}
          {currentQuestion.imageId && getImageUrl(currentQuestion.imageId) && (
            <div className="mb-6 flex justify-center">
              <img
                src={getImageUrl(currentQuestion.imageId) || ''}
                alt="Pregunta"
                className="max-w-full h-auto max-h-64 rounded-lg"
              />
            </div>
          )}

          {/* Contenido de la pregunta (HTML) */}
          <div 
            className="text-lg text-gray-800 mb-8 prose prose-sm max-w-none"
            dangerouslySetInnerHTML={{ __html: currentQuestion.content }}
          />

          {/* Opciones de respuesta */}
          <div className="space-y-4 mb-8">
            {currentQuestion.options.map((option) => (
              <label
                key={option.id}
                className="flex items-start p-4 border-2 border-gray-200 rounded-lg hover:border-purple-400 cursor-pointer transition"
              >
                <input
                  type="radio"
                  name={`question-${currentQuestion.id}`}
                  value={option.id}
                  checked={answers[currentQuestion.id] === option.id}
                  onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                  className="w-5 h-5 text-purple-600 cursor-pointer mt-1 flex-shrink-0"
                />
                <div className="ml-4 flex-1">
                  {option.imageId && getImageUrl(option.imageId) && (
                    <img
                      src={getImageUrl(option.imageId) || ''}
                      alt={option.text}
                      className="w-full h-auto max-h-32 rounded-lg mb-2"
                    />
                  )}
                  <span className="text-gray-700 font-medium block">{option.text}</span>
                </div>
              </label>
            ))}
          </div>

          {/* Navegación */}
          <div className="flex items-center justify-between pt-6 border-t border-gray-200">
            <button
              onClick={() => setCurrentQuestionIndex(currentQuestionIndex - 1)}
              disabled={currentQuestionIndex === 0}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ← Anterior
            </button>

            <span className="text-gray-700 font-semibold">
              {currentQuestionIndex + 1}/{questions.length}
            </span>

            <button
              onClick={handleSubmit}
              disabled={!hasAnswered}
              className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-bold"
            >
              {isLastQuestion ? '✓ Terminar' : 'Siguiente →'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
