'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Image from 'next/image';
import axiosInstance from '@/lib/axiosInstance';
import { useAuthStore } from '@/store/authStore';
import { useAuthCheck } from '@/hooks/useAuthCheck';

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
  benefit?: string; // Agregado: Sustento de la pregunta
  options: AnswerOption[];
  orderNum: number;
  starsValue?: number;
}

interface Mission {
  id: string;
  name: string;
  orderNum?: number;
  level: {
    id: string;
    name: string;
    world: {
      id: string;
      name: string;
    };
  };
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [previousAnswers, setPreviousAnswers] = useState<Record<string, string>>({});
  const [previousAnswersCorrect, setPreviousAnswersCorrect] = useState<Record<string, boolean>>({});
  const [showResultModal, setShowResultModal] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [resultData, setResultData] = useState<{
    isCorrect: boolean;
    selectedOption: AnswerOption | null;
    correctOption: AnswerOption | null;
    starsEarned?: number;
    totalMissionStars?: number;
    questionBenefit?: string; // Agregado: Sustento de la pregunta
  } | null>(null);

  const token = useAuthStore((state) => state.token);

  const fetchData = useCallback(async () => {
    if (!missionId) {
      setError('ID de misión no encontrado.');
      setLoading(false);
      return;
    }

    try {
      setError(null);
      setLoading(true);

      // Obtener datos de la misión
      const missionRes = await axiosInstance.get(`/missions/${missionId}`);
      setMission(missionRes.data);

      // Obtener preguntas
      const questionsRes = await axiosInstance.get(`/questions/mission/${missionId}`);
      
      const sortedQuestions = (questionsRes.data || []).sort(
        (a: Question, b: Question) => a.orderNum - b.orderNum
      );
      setQuestions(sortedQuestions);

      // Obtener respuestas anteriores de esta misión específica
      const answersRes = await axiosInstance.get(`/progress/mission/${missionId}/answers`);
      const previousAnswersMap: Record<string, string> = {};
      const previousAnswersCorrectMap: Record<string, boolean> = {};
      
      (answersRes.data || []).forEach((answer: any) => {
        previousAnswersMap[answer.questionId] = answer.answerId;
        previousAnswersCorrectMap[answer.questionId] = answer.isCorrect || false;
      });
      setPreviousAnswers(previousAnswersMap);
      setPreviousAnswersCorrect(previousAnswersCorrectMap);

      // Inicializar respuestas con las anteriores
      const initialAnswers: Record<string, string | string[]> = {};
      sortedQuestions.forEach((q: Question) => {
        initialAnswers[q.id] = previousAnswersMap[q.id] || '';
      });
      setAnswers(initialAnswers);
    } catch (err: any) {
      console.error('Error completo:', {
        status: err.response?.status,
        statusText: err.response?.statusText,
        message: err.response?.data?.message,
        error: err.message,
        url: err.config?.url,
      });
      
      if (err.response?.status === 401) {
        setError('Sesión expirada. Por favor, inicia sesión nuevamente.');
      } else if (err.response?.status === 404) {
        setError('Las preguntas no fueron encontradas para esta misión.');
      } else {
        setError(err.response?.data?.message || err.message || 'Error al cargar las preguntas');
      }
    } finally {
      setLoading(false);
    }
  }, [missionId]);

  useEffect(() => {
    if (isHydrated && missionId) {
      fetchData();
    }
  }, [isHydrated, missionId, fetchData]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-500 to-green-500 p-8 pb-40 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white">Cargando preguntas...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-500 to-green-500 p-8 pb-40">
        <div className="max-w-md mx-auto">
          <p className="text-white text-center mb-4">❌ {error}</p>
          <button
            onClick={() => router.back()}
            className="mt-4 bg-white text-primary-600 px-6 py-2 rounded-lg font-bold hover:bg-gray-100 w-full" style={{ fontFamily: "'Blinker', sans-serif" }}
          >
            ← Volver
          </button>
        </div>
      </div>
    );
  }

  if (!mission) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-500 to-green-500 p-8 pb-40">
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

  if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-500 to-green-500 p-8 pb-40">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.back()}
                className="text-white text-4xl hover:opacity-80 transition"
              >
                <Image
                    src="/images/btn-back.png"
                    alt="Atrás"
                    width={50}
                    height={50}
                    className="h-auto"
                    priority
                  />
              </button>
              <div>
                <p className="text-white text-xs font-light mb-1">{mission.level.world.name}</p>
                <h1 className="text-2xl font-bold text-white">{mission.name}</h1>
              </div>
            </div>
            <button
              onClick={() => router.push('/game/setting')}
              className="bg-white text-primary-600 p-3 rounded-lg shadow-lg hover:shadow-2xl transition text-2xl"
            >
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

          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <p className="text-white/70 text-lg mb-6">No hay preguntas disponibles para esta misión</p>
            <button
              onClick={() => router.back()}
              className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 font-bold" style={{ fontFamily: "'Blinker', sans-serif" }}
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
    // No permitir cambiar respuesta si ya fue respondida
    if (!previousAnswers[questionId]) {
      setAnswers({
        ...answers,
        [questionId]: value
      });
    }
  };

  const handleSubmit = async () => {
    const currentQuestion = questions[currentQuestionIndex];
    
    // Si ya fue respondida, solo ir a la siguiente
    if (previousAnswers[currentQuestion.id]) {
      if (currentQuestionIndex === questions.length - 1) {
        // Última pregunta - redirigir al nivel
        router.push(`/game/levels/${mission!.level.id}`);
      } else {
        // Ir a la siguiente pregunta
        setCurrentQuestionIndex(currentQuestionIndex + 1);
      }
      return;
    }

    // Nueva respuesta - validar que haya seleccionado
    if (!hasAnswered) {
      alert('Por favor selecciona una respuesta');
      return;
    }

    try {
      const answerId = answers[currentQuestion.id] as string;
      const selectedOption = currentQuestion.options.find(opt => opt.id === answerId);

      // Mostrar velo de validación
      setIsValidating(true);

      // Enviar respuesta a la API
      const responseRes = await axiosInstance.post(
        `/progress/answer`,
        {
          questionId: currentQuestion.id,
          answerId,
        }
      );

      // Ocultar velo de validación después de recibir respuesta
      setIsValidating(false);

      const isCorrect = responseRes.data.isCorrect;
      
      // Debug: Log respuesta del API
      console.log('API Response checkAnswer:', responseRes.data);
      
      // Construir la opción correcta desde la respuesta de la API
      // Si el backend no devuelve los datos, intentamos obtenerlo del array local
      let correctOption: AnswerOption | null = null;
      
      if (responseRes.data.correctOptionId) {
        // Opción 1: Usar datos del API (si están disponibles)
        correctOption = {
          id: responseRes.data.correctOptionId,
          text: responseRes.data.correctOptionText,
          imageId: responseRes.data.correctOptionImageId,
          detail: responseRes.data.correctOptionDetail,
          orderNum: 0,
        };
      }
      
      // Opción 2: Si falta información, obtener del array local de opciones
      if (!correctOption || !correctOption.text) {
        const localCorrectOption = currentQuestion.options.find(opt => opt.isCorrect);
        if (localCorrectOption) {
          correctOption = localCorrectOption;
          console.log('Using local correct option:', localCorrectOption);
        }
      }
      
      console.log('Final correctOption:', correctOption);

      // Obtener estrellas de la misión
      const progressRes = await axiosInstance.get(`/progress/game-state`);
      const missionProgressArray = progressRes.data.missionProgress || [];
      const missionProgressForThis = missionProgressArray.find((mp: any) => mp.missionId === missionId);
      const starsEarned = missionProgressForThis?.starsEarned || 0;

      // Mostrar modal con resultado
      setResultData({
        isCorrect,
        selectedOption: selectedOption || null,
        correctOption,
        starsEarned: isCorrect ? currentQuestion.starsValue || 1 : 0,
        totalMissionStars: starsEarned,
        questionBenefit: responseRes.data.questionBenefit, // Agregado: Sustento de la pregunta
      });
      setShowResultModal(true);
      
      // Actualizar respuestas anteriores después de enviar
      setPreviousAnswers({
        ...previousAnswers,
        [currentQuestion.id]: answerId
      });
      setPreviousAnswersCorrect({
        ...previousAnswersCorrect,
        [currentQuestion.id]: isCorrect
      });

    } catch (err: any) {
      console.error('Error:', err);
      setIsValidating(false);
      alert('Error al guardar respuesta: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleCloseResultModal = () => {
    setShowResultModal(false);
    setResultData(null);
    
    // Ir a la siguiente pregunta o nivel
    if (currentQuestionIndex === questions.length - 1) {
      // Todas las preguntas completadas - Marcar misión como completada
      axiosInstance.post(`/progress/complete-mission`, { missionId })
        .catch(err => console.warn('Could not mark mission as completed:', err));
      router.push(`/game/levels/${mission!.level.id}`);
    } else {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  return (
    <div className="evaluation-page min-h-screen content-page p-8 pb-40">
      {/* Header */}
      <div className="fixed top-0 left-0 w-full pb-10 bg-gradient-to-b from-black/80 to-black/0 z-30">
        <div className="mission-header max-w-sm mx-auto flex px-4 pb-6 justify-between items-center">
          <button onClick={() => router.back()}>
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
            <span className="block text-lg">MISIÓN {mission?.orderNum}:</span>
            <div className="content-title font-black text-2xl leading-none">{mission?.name}</div>
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
        {/* Referecmia de pregunta */}
        <div className="question-reference uppercase text-black font-blinker leading-none text-xl font-black text-center mb-4">
          Selecciona <br/>
          el producto que brinda <br/>
          el beneficio
          <Image 
            src="/images/content-down.png"
            alt="Referencia de pregunta"
            width={20}
            height={20}
            className="h-auto mx-auto mt-4"
            priority
          />
        </div>
        
        {/* Contenedor de pregunta */}
        <div className="bg-white max-w-sm mx-auto rounded-3xl shadow-lg p-6 mb-4">
          
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
            className="text-xl font-black text-center text-gray-800 prose prose-sm max-w-none"
            dangerouslySetInnerHTML={{ __html: currentQuestion.content }}
            style={{ fontFamily: "'Blinker', sans-serif" }}
          />

        </div>

        {/* Opciones de respuesta - Grid 3 columnas */}
        <div className="max-w-sm mx-auto grid grid-cols-3 gap-4 mb-8">
          {currentQuestion.options.map((option) => (
            <button
              key={option.id}
              onClick={() => handleAnswerChange(currentQuestion.id, option.id)}
              disabled={!!previousAnswers[currentQuestion.id]}
              className={`relative p-2 rounded-xl border-2 transition-all cursor-pointer overflow-hidden group ${
                answers[currentQuestion.id] === option.id
                  ? 'bg-green-500 border-green-600 text-white shadow-lg'
                  : 'bg-white border-gray-200 text-gray-800 hover:border-gray-400 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed'
              }`}
            >
              {/* Radio button oculto */}
              <input
                type="radio"
                name={`question-${currentQuestion.id}`}
                value={option.id}
                checked={answers[currentQuestion.id] === option.id}
                onChange={() => {}}
                className="hidden"
                disabled={!!previousAnswers[currentQuestion.id]}
              />

              {/* Imagen de opción */}
              {option.imageId && getImageUrl(option.imageId) && (
                <img
                  src={getImageUrl(option.imageId) || ''}
                  alt={option.text}
                  className="w-full h-24 object-cover rounded-lg mb-3"
                />
              )}            

              {/* Texto de opción */}
              {!option.imageId && (
                <span className="block font-semibold text-center text-xs leading-tight">
                  {option.text}
                </span>
              )}

              {/* Checkmark visible al seleccionar */}
              {answers[currentQuestion.id] === option.id && (
                <div className="absolute top-2 right-2 bg-white rounded-full p-1">
                  <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </button>
          ))}
        </div>

        {/* Mensaje si ya fue respondida */}
        {previousAnswers[currentQuestion.id] && (
          <div className={`max-w-sm mx-auto px-4 py-3 rounded-lg mb-8 text-center font-semibold border-2 ${
            previousAnswersCorrect[currentQuestion.id]
              ? 'bg-green-100 border-green-400 text-green-800'
              : 'bg-red-100 border-red-400 text-red-800'
          }`} style={{ fontFamily: "'Blinker', sans-serif" }}>
            ✓ Pregunta respondida de forma {previousAnswersCorrect[currentQuestion.id] ? 'Correcta' : 'Incorrecta'}
          </div>
        )}
      </div>

      {/* Panel de control fijo en la base */}
      <div className="panel-control fixed bottom-0 left-0 right-0 z-40 flex justify-center items-center py-6 ">
        <div className="flex items-center justify-between" style={{ maxWidth: '120px' }}>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
              disabled={currentQuestionIndex === 0}
              className="text-black hover:opacity-75 font-bold disabled:opacity-50 disabled:cursor-not-allowed" style={{ fontFamily: "'Blinker', sans-serif" }}
            >
              <Image src="/images/content-arrow-left.png" alt="Anterior" width={50} height={50} className="inline-block mr-2" />
            </button>
            <button
              onClick={handleSubmit}
              disabled={!hasAnswered && !previousAnswers[currentQuestion.id]}
              className="text-black hover:opacity-75 font-bold disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ fontFamily: "'Blinker', sans-serif" }}
            >
              {isLastQuestion ? <Image src="/images/content-arrow-right.png" alt="Terminar" width={50} height={50} className="inline-block ml-2" /> : <Image src="/images/content-arrow-right.png" alt="Siguiente" width={50} height={50} className="inline-block ml-2" />}
            </button>
          </div>
        </div>
      </div>

      {/* Modal de Resultado */}
      {showResultModal && resultData && (
        <div className={`modal-result modal-result-${resultData.isCorrect ? 'correct' : 'incorrect'} fixed inset-0 bg-black/80 z-50 overflow-auto p-4`}>
          <div className="w-full relative">
            {/* Botón cerrar */}
            <button
              onClick={handleCloseResultModal}
              className="absolute top-2 right-0 text-gray-500 hover:text-gray-700 z-10"
            >
              <Image src="/images/icon-close.png" alt="Cerrar" width={48} height={48} />
            </button>

            {resultData.isCorrect ? (
              // Respuesta Correcta
              <div className="p-6 pt-12 text-center">
                <Image 
                  src="/images/icon-tick.png"
                  alt="X"
                  width={50}
                  height={50}
                  className="mx-auto mb-6"
                />
                
                <h2 className="text-5xl font-black mb-6 text-white" style={{ fontFamily: "'Blinker', sans-serif" }}>
                  ¡SIII!<br/>¡CORRECTO!
                </h2>

                <div className="bg-white mb-4 p-4 rounded-3xl max-w-xs mx-auto">
                  {/* Imagen del producto */}
                  {resultData.correctOption?.imageId && getImageUrl(resultData.correctOption.imageId) && (
                    <div className="mb-6">
                      <img
                        src={getImageUrl(resultData.correctOption.imageId) || ''}
                        alt="Producto correcto"
                        className="w-auto mx-auto h-48 object-cover rounded-lg"
                      />
                    </div>
                  )}

                  {/* Texto del producto */}
                  <p className="text-lg font-semibold text-gray-800">
                    {resultData.correctOption?.text}
                  </p>
                </div>

                {/* Bloque de estrellas ganadas */}
                <div className="question-score p-4 mb-6">
                  <div className="text-5xl font-b font-black text-white font-bowlby">
                    {resultData.totalMissionStars || 0}
                  </div>
                </div>
              </div>
            ) : (
              // Respuesta Incorrecta
              <div className="p-6">

                <Image 
                  src="/images/icon-cross.png"
                  alt="X"
                  width={50}
                  height={50}
                  className="mx-auto mb-6"
                />
                <h2 className="text-5xl font-black mb-6 text-white text-center" style={{ fontFamily: "'Blinker', sans-serif" }}>
                  ¡UPS! <br/>INCORRECTO
                </h2>

                {/* Tu respuesta */}
                <div className="bg-white rounded-3xl mb-4 p-4 text-center max-w-xs mx-auto">
                  {resultData.selectedOption?.imageId && getImageUrl(resultData.selectedOption.imageId) && (
                    <img
                      src={getImageUrl(resultData.selectedOption.imageId) || ''}
                      alt="Tu respuesta"
                      className="w-full h-48 object-cover rounded-lg mb-3"
                    />
                  )}
                  
                  <p className="text-gray-800 text-center font-semibold">
                    {resultData.selectedOption?.text}
                  </p>
                </div>

                <Image 
                  src="/images/content-down.png"
                  alt="Respuesta Correcta"
                  width={36}
                  height={36}
                  className="mx-auto object-cover rounded-lg mb-3"
                />

                {/* Respuesta Correcta */}
                <p className="text-3xl mb-4 leading-none uppercase text-white text-center mb-2 font-semibold font-blinker">
                  Respuesta <br/>Correcta
                </p>
                <div className="mb-6 bg-red-100 mx-auto max-w-sm rounded-xl bg-red-50">
                  <div className="grid grid-cols-[1fr_150px] gap-4">
                    <div className="text-left text-sm p-4 text-gray-800 ">
                      <p className="font-bold mb-2">
                        {resultData.correctOption?.text}
                      </p>
                      {/* Sustento/Referencia - Desde question.benefit */}
                      {resultData.questionBenefit && (
                        <div dangerouslySetInnerHTML={{ __html: resultData.questionBenefit }} />
                      )}
                    </div>
                    <div className="image ">
                      {resultData.correctOption?.imageId && getImageUrl(resultData.correctOption.imageId) && (
                        <div className="p-4 h-full bg-white rounded rounded-3xl ">
                          <img
                            src={getImageUrl(resultData.correctOption.imageId) || ''}
                            alt="Respuesta correcta"
                            className="w-full h-32 object-cover rounded-lg mb-3"
                          />
                        </div>
                      )}
                    </div>
                  </div>                  
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Velo de validación con spinner */}
      {isValidating && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-white border-t-green-500 mx-auto mb-4"></div>
            <p className="text-white text-lg font-bold" style={{ fontFamily: "'Blinker', sans-serif" }}>Validando respuesta...</p>
          </div>
        </div>
      )}
    </div>
  );
}

