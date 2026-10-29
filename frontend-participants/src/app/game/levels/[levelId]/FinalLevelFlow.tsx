'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import MediaPlayer from '@/components/MediaPlayer';
import { MdClose, MdCheckCircle, MdErrorOutline } from 'react-icons/md';

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

interface Level {
  id: string;
  name: string;
  description: string;
  imageId?: string;
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
  finalStage: 'intro' | 'introVideo' | 'questionOrder' | 'questionVideo' | 'questionModal' | 'questionOptions' | 'questionEndVideo' | 'results';
  currentFinalQuestionIndex: number;
  finalAnswers: Record<string, string>;
  previousFinalAnswers: Record<string, string>;
  totalFinalStars: number;
  finalCorrectAnswersCount: number;
  isVideoFinished: boolean;
  isQuestionVideoFinished: boolean;
  isFinalValidating: boolean;
  showFinalValidationPanel: boolean;
  lastFinalAnswerCorrect: boolean;
  onStageChange: (stage: 'intro' | 'introVideo' | 'questionOrder' | 'questionVideo' | 'questionModal' | 'questionOptions' | 'questionEndVideo' | 'results') => void;
  onQuestionIndexChange: (index: number) => void;
  onAnswerChange: (questionId: string, answerId: string) => void;
  onAnswerSubmit: () => Promise<void>;
  onValidationPanelContinue: () => void;
  onVideoFinished: () => void;
  onVideoPlaybackReset: () => void;
  onQuestionVideoFinished: () => void;
  onQuestionVideoPlaybackReset: () => void;
}

export default function FinalLevelFlow({
  level,
  finalQuestions,
  finalStage,
  currentFinalQuestionIndex,
  finalAnswers,
  previousFinalAnswers,
  totalFinalStars,
  finalCorrectAnswersCount,
  isVideoFinished,
  isQuestionVideoFinished,
  isFinalValidating,
  showFinalValidationPanel,
  lastFinalAnswerCorrect,
  onStageChange,
  onQuestionIndexChange,
  onAnswerChange,
  onAnswerSubmit,
  onValidationPanelContinue,
  onVideoFinished,
  onVideoPlaybackReset,
  onQuestionVideoFinished,
  onQuestionVideoPlaybackReset,
}: FinalLevelFlowProps) {
  const router = useRouter();
  const [readyVideos, setReadyVideos] = useState<Set<string>>(() => new Set());
  const [introVideoPlaybackKey, setIntroVideoPlaybackKey] = useState(0);
  const [questionVideoPlaybackKey, setQuestionVideoPlaybackKey] = useState(0);
  const [questionEndVideoPlaybackKey, setQuestionEndVideoPlaybackKey] = useState(0);
  const [isQuestionEndVideoFinished, setIsQuestionEndVideoFinished] = useState(false);

  const preloadVideoSources = useMemo(() => {
    const sources = [
      level.introVideoId || level.introVideoUrl,
      ...finalQuestions.flatMap(question => [
        question.startVideoId || question.startVideoUrl,
        question.endVideoId || question.endVideoUrl,
      ]),
    ];

    return Array.from(new Set(sources.filter((source): source is string => Boolean(source))));
  }, [finalQuestions, level.introVideoId, level.introVideoUrl]);
  const isPreloadComplete = preloadVideoSources.every(source => readyVideos.has(source));

  const markVideoReady = (source: string) => {
    setReadyVideos(previous => new Set(previous).add(source));
  };

  const markVideoLoadError = (source: string, error: unknown) => {
    console.error(`No se pudo precargar el video: ${source}`, error);
    markVideoReady(source);
  };

  const getCurrentFinalQuestion = (): FinalLevelQuestion | null => {
    return finalQuestions[currentFinalQuestionIndex] || null;
  };

  const getCorrectOption = (question: FinalLevelQuestion): FinalLevelAnswerOption | null => {
    return question.options?.find(opt => opt.isCorrect) || null;
  };

  const handleValidationPanelContinue = () => {
    const currentQuestion = getCurrentFinalQuestion();
    if (currentQuestion?.endVideoId || currentQuestion?.endVideoUrl) {
      setIsQuestionEndVideoFinished(false);
      onStageChange('questionEndVideo');
      return;
    }

    onValidationPanelContinue();
  };

  const handleAnswerSubmit = () => {
    const currentQuestion = getCurrentFinalQuestion();
    if (currentQuestion && previousFinalAnswers[currentQuestion.id]) {
      handleValidationPanelContinue();
      return;
    }

    void onAnswerSubmit();
  };

  const handleReturnToWorld = () => {
    router.push(`/game/worlds/${level?.world.id}`);
  };
  const levelBackgroundUrl = getImageUrl(level.imageId);

  const finalResults = finalCorrectAnswersCount === 3
    ? {
        title: '¡Atención experta!',
        message: 'Tu recomendación ya está en modo experto. El mostrador tiembla, el bienestar ya pidió turno contigo.',
        text: 'Lograste identificar correctamente las 3 necesidades del cliente y recomendar los productos más adecuados del Mundo Wellness.',
      }
    : finalCorrectAnswersCount === 2
      ? {
          title: '¡Bien hecho!!',
          message: 'Acertaste 2 de 3 recomendaciones.',
          text: 'Vas por buen camino y ya recomendar productos de acuerdo a la necesidad del Mundo Wellness. ¡Sigue así!',
        }
      : finalCorrectAnswersCount === 1
        ? {
            title: '¡Buen avance!',
            message: 'Acertaste 1 recomendación. ',
            text: 'Recuerda repasar cada producto y practicar para lograr una recomendación cada vez más experta.',
          }
        : {
            title: 'Creo que no prestaste atención.',
            message: 'EstrelEsta vez no acertaste las recomendaciones.',
            text: 'No pasa nada: hasta los expertos empezaron confundiendo fórmulas con suplementos. El conocimiento se entrena.',
          };

  return (
    <div
      className="final-level-page min-h-screen max-w-md m-auto"
      style={levelBackgroundUrl ? { backgroundImage: `url("${levelBackgroundUrl}")` } : undefined}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none fixed -left-[9999px] top-0 h-px w-px overflow-hidden opacity-0"
      >
        {preloadVideoSources.map(source => (
          <MediaPlayer
            key={source}
            videoSource={source}
            autoplay={false}
            controls={false}
            preload="auto"
            onReady={() => markVideoReady(source)}
            onLoadError={error => markVideoLoadError(source, error)}
          />
        ))}
      </div>

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
              <div></div>
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

          <div className="max-w-sm text-center text-white font-black pb-10">
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
              <button
                onClick={() => {
                  onVideoPlaybackReset();
                  onStageChange('intro');
                }}
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
              <div className="flex-1" />
              <button onClick={() => router.push(`/game/worlds/${level?.world.id}`)} className="btn-menu text-2xl">
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
          <div className="m-auto w-full h-screen flex items-center justify-center bg-black rounded-lg overflow-hidden">
            <MediaPlayer
              key={introVideoPlaybackKey}
              videoSource={level.introVideoId || level.introVideoUrl || ''}
              onEnded={() => onVideoFinished()}
              autoplay={true}
              controls={true}
            />
          </div>

          {isVideoFinished && (
            <div className="fixed inset-0 z-10 flex items-center justify-center bg-black/30 ">
                  <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="question-video-finished-title"
                className="w-full bg-white bg-opacity-30 p-8 max-w-md m-auto"
              >
                <div className="flex flex-col gap-4">
                  <button
                    onClick={() => {
                      onVideoPlaybackReset();
                      setIntroVideoPlaybackKey(key => key + 1);
                    }}
                    className="w-full rounded-2xl bg-gray-200 px-6 py-3 font-bold text-gray-800 transition hover:bg-gray-300"
                    style={{ fontFamily: "'Blinker', sans-serif" }}
                  >
                    Repetir video
                  </button>
                  <button
                    onClick={() => {
                      onQuestionIndexChange(0);
                      onVideoFinished();
                      onStageChange('questionOrder');
                    }}
                    className="w-full rounded-2xl bg-[#079c82] px-6 py-3 font-bold text-white transition hover:opacity-90"
                    style={{ fontFamily: "'Blinker', sans-serif" }}
                  >
                    Continuar
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {finalStage === 'questionOrder' && getCurrentFinalQuestion() && (
        <div className="final-question-intro min-h-screen p-8 pt-20 px-0 flex flex-col items-center justify-center">
          <div className="fixed top-0 left-0 w-full pb-10  z-20">
            <div className="final-header pt-7 max-w-sm mx-auto flex px-4 pb-6 justify-between items-center">
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
              <div></div>
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

          <div className="title w-full mx-auto flex-1 flex flex-col items-center justify-center">
            <div className="text-5xl text-center uppercase text-gray-600 font-black font-blinker" >
              Pedido
              <span className="block text-[#079c82] text-[16rem] font-black font-bowlby leading-none" >
                {currentFinalQuestionIndex + 1}
              </span>
            </div>
            <button
              onClick={() => onStageChange('questionVideo')}
              className={`button-intro button-continue text-3xl uppercase font-black text-white ${isPreloadComplete ? '' : 'hidden'}`}
              style={{ fontFamily: "'Blinker', sans-serif" }}
            >
              Continuar
            </button>
          </div>
        </div>
      )}

      {(finalStage === 'questionVideo' || finalStage === 'questionModal') && (getCurrentFinalQuestion()?.startVideoId || getCurrentFinalQuestion()?.startVideoUrl) ? (
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
          <div className="flex-1 flex items-center justify-center">
            <div className="m-auto w-full h-screen flex items-center justify-center bg-black rounded-lg overflow-hidden">
              <MediaPlayer
                key={`${getCurrentFinalQuestion()?.id}-${questionVideoPlaybackKey}`}
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

      {finalStage === 'questionEndVideo' && (getCurrentFinalQuestion()?.endVideoId || getCurrentFinalQuestion()?.endVideoUrl) ? (
        <div className="final-question-video min-h-screen bg-black flex flex-col">
          <div className="flex-1 flex items-center justify-center">
            <div className="m-auto w-full h-screen flex items-center justify-center bg-black rounded-lg overflow-hidden">
              <MediaPlayer
                key={`${getCurrentFinalQuestion()?.id}-end-${questionEndVideoPlaybackKey}`}
                videoSource={getCurrentFinalQuestion()?.endVideoId || getCurrentFinalQuestion()?.endVideoUrl || ''}
                onEnded={() => setIsQuestionEndVideoFinished(true)}
                autoplay={true}
                controls={true}
              />
            </div>
          </div>

          {isQuestionEndVideoFinished && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
              <div className="w-full bg-white/30 p-8 max-w-md m-auto">
                <div
                  role="dialog"
                  aria-modal="true"
                  aria-labelledby="question-end-video-title"
                  className="max-w-xs m-auto"
                >
                  <div className="flex flex-col gap-4">
                    <button
                      onClick={() => {
                        setIsQuestionEndVideoFinished(false);
                        setQuestionEndVideoPlaybackKey(key => key + 1);
                      }}
                      className="w-full rounded-2xl bg-gray-200 px-6 py-3 font-bold text-gray-800 transition hover:bg-gray-300"
                      style={{ fontFamily: "'Blinker', sans-serif" }}
                    >
                      Repetir video
                    </button>
                    <button
                      onClick={onValidationPanelContinue}
                      className="w-full rounded-2xl bg-[#079c82] px-6 py-3 font-bold text-white transition-colors hover:bg-[#079c82]/90"
                      style={{ fontFamily: "'Blinker', sans-serif" }}
                    >
                      Continuar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : null}

      {finalStage === 'questionModal' && isQuestionVideoFinished && getCurrentFinalQuestion() && (
        <div className="fixed inset-0 z-10 flex items-center justify-center bg-black/30 ">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="question-video-finished-title"
            className="w-full bg-white bg-opacity-30 p-8 max-w-md m-auto"
          >
            <div className="max-w-xs m-auto">
              <div
                id="question-video-finished-title"
                className="mb-6 text-center text-4xl leading-none uppercase font-black text-white prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: getCurrentFinalQuestion()!.content }}
                style={{ fontFamily: "'Blinker', sans-serif" }}
              />
              <div className="flex flex-col gap-4">
                <button
                  onClick={() => {
                    onQuestionVideoPlaybackReset();
                    setQuestionVideoPlaybackKey(key => key + 1);
                    onStageChange('questionVideo');
                  }}
                  className="w-full rounded-2xl bg-gray-200 px-6 py-3 font-bold text-gray-800 transition hover:bg-gray-300"
                  style={{ fontFamily: "'Blinker', sans-serif" }}
                >
                  Repetir video
                </button>
                <button
                  onClick={() => onStageChange('questionOptions')}
                  className="w-full rounded-2xl bg-[#079c82] px-6 py-3 font-bold text-white transition-colors hover:bg-[#079c82]/90"
                  style={{ fontFamily: "'Blinker', sans-serif" }}
                >
                  Responder
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {finalStage === 'questionOptions' && getCurrentFinalQuestion() && (
        <div className="final-question-answer min-h-screen  flex flex-col">
          {/* Header con botones de navegación */}
          <div className=" fixed top-0 left-0 w-full z-40 pb-4">
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
              <h2 className="text-3xl max-w-xs m-auto font-black text-[#079c82] uppercase mb-8 text-center" style={{ fontFamily: "'Blinker', sans-serif" }}>
                Selecciona tu mejor recomendación
              </h2>

              <div className="grid grid-cols-2 gap-4 w-full mb-12">
                {getCurrentFinalQuestion()?.options?.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => onAnswerChange(getCurrentFinalQuestion()!.id, option.id)}
                    disabled={!!previousFinalAnswers[getCurrentFinalQuestion()!.id]}
                    className={`p-2 rounded-xl border-2 transition-all cursor-pointer ${
                      finalAnswers[getCurrentFinalQuestion()!.id] === option.id
                        ? 'bg-[#079c82] border-green-600 text-white shadow-lg'
                        : 'bg-[#eefffd] border-gray-200 text-gray-600 hover:border-gray-400 hover:shadow-md disabled:bg-[#079c82]/50 disabled:cursor-not-allowed'
                    }`}
                  >
                    <div className="bg-white relative rounded-lg overflow-hidden mb-2">
                      {finalAnswers[getCurrentFinalQuestion()!.id] === option.id && (
                        <div className="absolute top-1 right-1 text-[#079c82]">
                          <MdCheckCircle size={36} />
                        </div>
                      )}
                      {option.imageId && getImageUrl(option.imageId) && (
                        <img
                          src={getImageUrl(option.imageId) || ''}
                          alt={option.text}
                          className="w-full h-32 object-contain rounded-lg mb-1"
                        />
                      )}
                    </div>
                    <span className="block font-black text-sm font-blinker text-center uppercase">{option.text}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Botón Responder en la parte inferior */}
          <div className="fixed bottom-0 left-0 right-0 z-20 flex justify-center items-center py-6 pb-10">
            <button
              onClick={handleAnswerSubmit}
              disabled={!getCurrentFinalQuestion() || (!finalAnswers[getCurrentFinalQuestion()!.id] && !previousFinalAnswers[getCurrentFinalQuestion()!.id])}
              className={`button-answer button-continue text-3xl uppercase font-black text-white`}
              style={{ fontFamily: "'Blinker', sans-serif" }}
            >
              {finalAnswers[getCurrentFinalQuestion()!.id] ? (
                <span>Siguiente</span>
              ) : <span>Responder</span>}
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
            <div className="validation-block bg-green-500 h-screen fixed bottom-0 left-0 right-0 z-30 flex justify-center items-center py-6">
              <div className="h-full w-full mx-4 p-8">
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
                        ¡Casi!
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
                  onClick={handleValidationPanelContinue}
                  className="w-full bg-[#079c82] hover:bg-[#079c82]/90 text-white font-bold py-3 px-6 rounded-2xl transition-colors"
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
        <div className="final-results h-screen px-4 pt-30">
          <div className="fixed top-0 left-0 w-full z-20">
            <div className="final-header pt-7 max-w-sm mx-auto flex px-4 pb-6 justify-between items-center">
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
              <div />
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

          <div className="max-w-sm text-center pt-24">
            <h1 className="final-results-title text-5xl uppercase font-black text-[#079c82] mb-2" style={{ fontFamily: "'Blinker', sans-serif" }}>
              {finalResults.title}
            </h1>

            <div className="result-modal">
              <p className="text-5xl font-black mb-4 font-bowlby pl-10">
                {totalFinalStars}
              </p>
            </div>

            <p className="final-results-message uppercase text-2xl font-black font-blinker text-[#606060]">
              {finalResults.message}
            </p>

            <p className="final-results-text text-xl text-[#606060] mb-4">
              {finalResults.text}
            </p>

            <button
              onClick={handleReturnToWorld}
              className="button-continue text-3xl uppercase font-black text-white"
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
