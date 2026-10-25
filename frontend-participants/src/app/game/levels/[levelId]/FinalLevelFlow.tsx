'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import MediaPlayer from '@/components/MediaPlayer';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

const getImageUrl = (imageId?: string) => {
  if (!imageId) return null;
  return `${API_URL}/media/serve/${imageId}`;
};

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

interface Level {
  id: string;
  name: string;
  introVideoUrl?: string;
  introVideoId?: string;
  world: {
    id: string;
    name: string;
  };
}

interface FinalLevelFlowProps {
  level: Level;
  finalQuestions: FinalLevelQuestion[];
  finalStage: 'intro' | 'introVideo' | 'questionOrder' | 'questionVideo' | 'questionModal' | 'questionOptions' | 'results';
  currentFinalQuestionIndex: number;
  finalAnswers: Record<string, string>;
  previousFinalAnswers: Record<string, string>;
  totalFinalStars: number;
  isVideoFinished: boolean;
  isQuestionVideoFinished: boolean;
  isFinalValidating: boolean;
  showFinalValidationPanel: boolean;
  lastFinalAnswerCorrect: boolean;
  finalCompleted: boolean;
  onStageChange: (stage: 'intro' | 'introVideo' | 'questionOrder' | 'questionVideo' | 'questionModal' | 'questionOptions' | 'results') => void;
  onQuestionIndexChange: (index: number) => void;
  onAnswerChange: (questionId: string, answerId: string) => void;
  onAnswerSubmit: () => Promise<void>;
  onValidationPanelContinue: () => void;
  onVideoFinished: () => void;
  onQuestionVideoFinished: () => void;
}

export default function FinalLevelFlow({
  level,
  finalQuestions,
  finalStage,
  currentFinalQuestionIndex,
  finalAnswers,
  previousFinalAnswers,
  totalFinalStars,
  isVideoFinished,
  isQuestionVideoFinished,
  isFinalValidating,
  showFinalValidationPanel,
  lastFinalAnswerCorrect,
  finalCompleted,
  onStageChange,
  onQuestionIndexChange,
  onAnswerChange,
  onAnswerSubmit,
  onValidationPanelContinue,
  onVideoFinished,
  onQuestionVideoFinished,
}: FinalLevelFlowProps) {
  const router = useRouter();

  const getCurrentFinalQuestion = (): FinalLevelQuestion | null => {
    return finalQuestions[currentFinalQuestionIndex] || null;
  };

  const getCorrectOption = (question: FinalLevelQuestion): FinalLevelAnswerOption | null => {
    return question.options?.find(opt => opt.isCorrect) || null;
  };

  const handleReturnToWorld = () => {
    router.push(`/game/worlds/${level?.world.id}`);
  };

  return (
    <div className="min-h-screen final-level-page">
      {finalStage === 'intro' && (
        <div className="min-h-screen  flex items-end justify-center px-4">
          <div className="fixed top-0 left-0 w-full pb-10 bg-gradient-to-b from-black/80 to-black/0 z-20">
            <div className="final-header max-w-sm mx-auto flex px-4 pb-6 justify-between items-center">
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

          <div className="max-w-sm text-center font-black pb-10">
            <h1 className="text-5xl uppercase font-black text-turquoise-600 " style={{ fontFamily: "'Blinker', sans-serif" }}>
              ¡Llego el momento de aplicar lo aprendido!
            </h1>
            <p className="text-white text-lg mb-4">
              Es hora de demostrar tus habilidades y completar el nivel final con éxito.
            </p>
            <button
              onClick={() => onStageChange('introVideo')}
               className="button-continue text-3xl uppercase"
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
              <button onClick={() => onStageChange('intro')}>
                <Image
                  src="/images/btn-back.png"
                  alt="Atrás"
                  width={50}
                  height={50}
                  className="h-auto"
                  priority
                />
              </button>
              <div className="flex-1">
                {/* Botón Continuar centrado en la parte superior cuando video termina */}
                {isVideoFinished || finalCompleted ? (
                  <button
                    onClick={() => {
                      onQuestionIndexChange(0);
                      onVideoFinished();
                      onStageChange('questionOrder');
                    }}
                    className="bg-white text-purple-600 px-8 py-4 rounded-lg font-bold text-2xl hover:bg-gray-100 transition shadow-lg"
                    style={{ fontFamily: "'Blinker', sans-serif" }}
                  >
                    Continuar
                  </button>
                ) : null}
              </div>
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
          <div className="max-w-sm m-auto w-full h-full flex items-center justify-center bg-black rounded-lg overflow-hidden">
            <MediaPlayer
              videoSource={level.introVideoId || level.introVideoUrl || ''}
              onEnded={() => onVideoFinished()}
              autoplay={true}
              controls={true}
            />
          </div>
        </div>
      )}

      {finalStage === 'questionOrder' && getCurrentFinalQuestion() && (
        <div className="min-h-screen bg-gradient-to-br from-purple-600 via-purple-500 to-pink-600 p-8 pb-40 flex flex-col items-center justify-center">
          <div className="fixed top-0 left-0 w-full pb-10 bg-gradient-to-b from-black/80 to-black/0 z-20">
            <div className="mission-header max-w-sm mx-auto flex px-4 pb-6 justify-between items-center">
              <button onClick={() => onStageChange('introVideo')}>
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
              onClick={() => onStageChange('questionVideo')}
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
              <button onClick={() => onStageChange('questionOrder')}>
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
                  onQuestionVideoFinished();
                  onStageChange('questionModal');
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
              <button onClick={() => onStageChange('questionVideo')}>
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
                  onClick={() => onStageChange('questionOptions')}
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
              <button onClick={() => onStageChange('questionModal')}>
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
                    onClick={() => onAnswerChange(getCurrentFinalQuestion()!.id, option.id)}
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
              onClick={onAnswerSubmit}
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
                  onClick={onValidationPanelContinue}
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
    </div>
  );
}
