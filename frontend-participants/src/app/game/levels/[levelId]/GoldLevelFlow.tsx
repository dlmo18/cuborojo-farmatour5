'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { MdCheckCircle, MdCancel } from "react-icons/md";

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

const getImageUrl = (imageId?: string) => {
  if (!imageId) return null;
  const mediaId = imageId.match(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i)?.[0];
  if (mediaId) return `${API_URL}/media/serve/${mediaId}`;
  if (/^https?:\/\//i.test(imageId)) return imageId;
  return `${API_URL}/media/serve/${imageId}`;
};

interface GoldenLevelItem {
  id: string;
  levelId: string;
  title: string;
  detail: string;
  imageId?: string;
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

interface Level {
  id: string;
  name: string;
  imageId?: string;
  world: {
    id: string;
    name: string;
  };
}

interface GoldLevelFlowProps {
  level: Level;
  goldenItems: GoldenLevelItem[];
  goldenQuestions: GoldenLevelQuestion[];
  goldenStage: 'intro' | 'imageIntro' | 'items' | 'testPrep' | 'questions' | 'results';
  currentItemIndex: number;
  currentQuestionIndex: number;
  goldenAnswers: Record<string, string>;
  previousAnswers: Record<string, string>;
  totalGoldenStars: number;
  isValidating: boolean;
  goldenCompleted: boolean;
  showValidationPanel: boolean;
  lastAnswerCorrect: boolean;
  onStageChange: (stage: 'intro' | 'imageIntro' | 'items' | 'testPrep' | 'questions' | 'results') => void;
  onItemIndexChange: (index: number) => void;
  onQuestionIndexChange: (index: number) => void;
  onAnswerChange: (questionId: string, answerId: string) => void;
  onAnswerSubmit: () => Promise<void>;
  onValidationPanelContinue: () => void;
}

export default function GoldLevelFlow({
  level,
  goldenItems,
  goldenQuestions,
  goldenStage,
  currentItemIndex,
  currentQuestionIndex,
  goldenAnswers,
  previousAnswers,
  totalGoldenStars,
  isValidating,
  goldenCompleted,
  showValidationPanel,
  lastAnswerCorrect,
  onStageChange,
  onItemIndexChange,
  onQuestionIndexChange,
  onAnswerChange,
  onAnswerSubmit,
  onValidationPanelContinue,
}: GoldLevelFlowProps) {
  const router = useRouter();

  const getResultMessage = () => {
    if (totalGoldenStars === 0) return 'Sigue Practicando';
    if (totalGoldenStars === 2) return '¡Buen Avance!';
    if (totalGoldenStars === 4) return '¡Buen desempeño!';
    if (totalGoldenStars === 6) return '¡Nivel Dorado Conquistado!';
    return '¡Nivel Dorado Conquistado!';
  };

  const getResultMessage2 = () => {
    if (totalGoldenStars === 0) return 'Esta vez no completaste correctamente los conceptos, pero puedes repasar ' + level?.world.name;
    if (totalGoldenStars === 2) return 'Completaste correctamente los 1 de 3 conceptos de ' + level?.world.name;
    if (totalGoldenStars === 4) return 'Completaste correctamente los 2 de 3 conceptos de ' + level?.world.name;
    if (totalGoldenStars === 6) return 'Completaste correctamente los 3 conceptos de ' + level?.world.name;
    return 'Completaste correctamente los 3 conceptos de ' + level?.world.name;
  };

  const handleReturnToWorld = () => {
    router.push(`/game/worlds/${level?.world.id}`);
  };

  return (
    <div className="min-h-screen gold-level-page">
      {goldenStage === 'intro' && (
        <div className="intro min-h-screen  flex items-end justify-center px-4">
          <div className="fixed top-0 left-0 w-full pb-10 bg-gradient-to-b from-black/80 to-black/0 z-20">
            <div className="gold-header max-w-sm mx-auto flex px-4 pb-6 justify-between items-center">
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

          <div className="max-w-xs text-center text-white font-black uppercase pb-24">
            <h1 className="text-5xl   mb-8" style={{ fontFamily: "'Blinker', sans-serif" }}>
              ¡Bienvenido al Nivel Dorado!
            </h1>
            <button
              onClick={() => onStageChange('imageIntro')}
              className="button-continue text-3xl uppercase"
              style={{ fontFamily: "'Blinker', sans-serif" }}
            >
              Comenzar
            </button>
            <div className="text-lg pt-6 ">
              recuerda: en este nivel tus estrellas se multiplican x2
            </div>
          </div>
        </div>
      )}

      {goldenStage === 'imageIntro' && level?.imageId && (
        <div className="content min-h-screen">
          <div className="fixed top-0 left-0 w-full z-10 pb-10 bg-gradient-to-b from-black to-transparent">
            <div className="gold-header  max-w-sm mx-auto flex px-4 pb-6 justify-between items-center">
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

          <div className="max-w-md mx-auto">
            <div className="w-full">
              {getImageUrl(level.imageId) && (
                <img
                  src={getImageUrl(level.imageId) || ''}
                  alt="Introducción"
                  className="w-full h-auto object-cover"
                />
              )}
            </div>
          </div>

          <div className="fixed bottom-0 left-0 right-0 z-20 flex justify-center items-center py-6 bg-gradient-to-t from-black to-transparent">
            <div className="flex gap-8">
              <button
                onClick={() => {}}
                disabled={true}
                className="text-black hover:opacity-75 font-bold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Image src="/images/content-arrow-left.png" alt="Anterior" width={50} height={50} className="inline-block" />
              </button>
              <button
                onClick={() => onStageChange('items')}
                className="text-black hover:opacity-75 font-bold"
              >
                <Image src="/images/content-arrow-right.png" alt="Siguiente" width={50} height={50} className="inline-block" />
              </button>
            </div>
          </div>
        </div>
      )}

      {goldenStage === 'items' && goldenItems.length > 0 && (
        <div className="content min-h-screen">
          <div className="fixed top-0 left-0 w-full z-10 pb-10 bg-gradient-to-b from-black to-transparent">
            <div className="gold-header  max-w-sm mx-auto flex px-4 pb-6 justify-between items-center">
              <button onClick={() => onStageChange('imageIntro')}>
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

          <div className="max-w-md mx-auto">
            {goldenItems[currentItemIndex] && getImageUrl(goldenItems[currentItemIndex].imageId || goldenItems[currentItemIndex].detail) && (
              <div className="w-full">
                <img
                  src={getImageUrl(goldenItems[currentItemIndex].imageId || goldenItems[currentItemIndex].detail) || ''}
                  alt={goldenItems[currentItemIndex].title}
                  className="w-full h-auto object-cover"
                />
              </div>
            )}
          </div>

          <div className="fixed bottom-0 left-0 right-0 z-20 flex justify-center items-center py-6 bg-gradient-to-t from-black to-transparent">
            <div className="flex gap-8">
              <button
                onClick={() => onItemIndexChange(Math.max(0, currentItemIndex - 1))}
                disabled={currentItemIndex === 0}
                className="text-black hover:opacity-75 font-bold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Image src="/images/content-arrow-left.png" alt="Anterior" width={50} height={50} className="inline-block" />
              </button>
              <button
                onClick={() => {
                  if (currentItemIndex < goldenItems.length - 1) {
                    onItemIndexChange(currentItemIndex + 1);
                  } else if (!goldenCompleted) {
                    onStageChange('testPrep');
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
        <div className="intro-test min-h-screen">
          <div className="fixed top-0 left-0 w-full z-10 pb-10 bg-gradient-to-b from-black to-transparent">
            <div className="gold-header  max-w-sm mx-auto flex px-4 pb-6 justify-between items-center">
              <button onClick={() => onStageChange('items')}>
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

          <div className="exam-init-view max-w-sm h-screen m-auto flex items-center justify-center text-center">
            <div>
              <Image
                src="/images/gold-test-inicio.png"
                alt="Test Inicio"
                width={200}
                height={100}
                className="h-auto max-w-sm w-full m-auto"
                layout="intrinsic"
                objectFit="cover"
                priority
              />
              <div className="max-w-xs m-auto mb-4">
                <h2 className="text-5xl text-green-900 uppercase font-black mb-4" style={{ fontFamily: "'Blinker', sans-serif" }}>
                  Pon a prueba <br />{level.name}
                </h2>
                <div className=" text-lg">
                  <p className='text-black mb-2'>
                    Completa correctamente los conceptos.
                  </p>
                  <p className='font-bold text-green-900'>
                    ¡Recuerda que cada respuesta correcta vale 2 estrellas!
                  </p>
                </div>
              </div>
              
              {goldenCompleted ? (
                <div className="bg-white rounded-lg p-6 mb-8">
                  <p className="text-gray-800 font-bold text-lg" style={{ fontFamily: "'Blinker', sans-serif" }}>
                    ✓ Este nivel ya fue completado
                  </p>
                </div>
              ) : null}
              {!goldenCompleted && (
                <button
                  onClick={() => {
                    onQuestionIndexChange(0);
                    onStageChange('questions');
                  }}
                  className={`button-continue text-3xl uppercase font-black text-white`}
                  style={{ fontFamily: "'Blinker', sans-serif" }}
                >
                  Iniciar
                </button>
              )}  
            </div>
          </div>
        </div>
      )}

      {goldenStage === 'questions' && goldenQuestions.length > 0 && (
        <div className="evaluation-page min-h-screen p-8 pb-40">
           <div className="fixed top-0 left-0 w-full z-10 pb-10 bg-gradient-to-b from-black to-transparent">
            <div className="gold-header max-w-sm mx-auto flex px-4 pb-6 justify-between items-center">
              <button onClick={() => onStageChange('testPrep')}>
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

          <div className="max-w-4xl mx-auto pt-24 pb-16">
            {goldenQuestions[currentQuestionIndex] && (
              <>
                <div className='text-3xl text-center uppercase font-black mb-8 text-yellow-300'>
                  {goldenQuestions[currentQuestionIndex].title}
                </div>
                <div className='bg-white rounded-3xl shadow-lg p-6 mb-4'>
                  <div className="question-reference max-w-xs m-auto p-1 text-white font-blinker leading-none text-xl font-black text-center mb-4 bg-green-800 rounded-xl">
                    Definición Incompleta:
                  </div>
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
                    className="text-2xl font-black text-center text-gray-800 prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ __html: goldenQuestions[currentQuestionIndex].content }}
                    style={{ fontFamily: "'Blinker', sans-serif" }}
                  />
                </div>

                <div className="max-w-sm mx-auto grid grid-cols-2 gap-4 mb-8">
                  {goldenQuestions[currentQuestionIndex].options?.map((option) => {
                    const isSelected = goldenAnswers[goldenQuestions[currentQuestionIndex].id] === option.id;
                    const isCorrect = option.isCorrect;
                    const isAnswered = !!previousAnswers[goldenQuestions[currentQuestionIndex].id];
                    const isIncorrectSelected = isSelected && isAnswered && !isCorrect;
                    
                    return (
                      <button
                        key={option.id}
                        onClick={() => onAnswerChange(goldenQuestions[currentQuestionIndex].id, option.id)}
                        disabled={!!previousAnswers[goldenQuestions[currentQuestionIndex].id]}
                        className={`relative p-3 rounded-xl transition-all cursor-pointer overflow-hidden group ${
                          isIncorrectSelected
                            ? 'bg-red-500 text-white shadow-lg'
                            : isSelected && isAnswered && isCorrect
                            ? 'bg-green-500 text-white shadow-lg'
                            : isSelected
                            ? 'bg-green-500 text-white shadow-lg'
                            : 'bg-green-200 text-green-900 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed'
                        }`}
                      >
                        <input
                          type="radio"
                          name={`question-${goldenQuestions[currentQuestionIndex].id}`}
                          value={option.id}
                          checked={isSelected}
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
                          <span className="block font-black text-center text-md leading-tight">
                            {option.text}
                          </span>
                        )}

                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </div>

          {!previousAnswers[goldenQuestions[currentQuestionIndex]?.id] && !goldenAnswers[goldenQuestions[currentQuestionIndex]?.id] && (
            <div className="image-dialog fixed -bottom-8 left-0 right-0 z-40 flex justify-center items-center pb-6">
              <Image 
                src={`/images/gold-dialog-${(currentQuestionIndex % 3) + 1}.png`}
                width={300}
                height={100}
                alt="Gold Dialog"
                className="block m-auto w-full max-w-sm"
              />
            </div>
          )}
          
          {!previousAnswers[goldenQuestions[currentQuestionIndex]?.id] && goldenAnswers[goldenQuestions[currentQuestionIndex]?.id] && (
            <div className="panel-control fixed bottom-0 left-0 right-0 z-40 flex justify-center items-center py-6 bg-gradient-to-t from-black to-transparent">
              <button
                onClick={() => {
                  onAnswerSubmit();
                }}
                className="button-continue text-3xl uppercase font-black text-white"
                style={{ fontFamily: "'Blinker', sans-serif" }}
              >
                Responder
              </button>
            </div>
          )}
          

          {isValidating && (
            <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center">
              <div className="text-center">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-white border-t-gold-500 mx-auto mb-4"></div>
                <p className="text-white text-lg font-bold" style={{ fontFamily: "'Blinker', sans-serif" }}>Validando respuesta...</p>
              </div>
            </div>
          )}

          {(showValidationPanel || !!previousAnswers[goldenQuestions[currentQuestionIndex]?.id]) && (() => {
            const currentQuestion = goldenQuestions[currentQuestionIndex];
            const selectedAnswerId = previousAnswers[currentQuestion?.id];
            const selectedOption = currentQuestion?.options?.find(opt => opt.id === selectedAnswerId);
            const isAnsweredCorrectly = selectedOption?.isCorrect ?? false;
            
            // Use lastAnswerCorrect if currently validating, otherwise use the calculated value
            const answerIsCorrect = showValidationPanel ? lastAnswerCorrect : isAnsweredCorrectly;
            
            return (
              <div className={`panel-validation fixed bottom-0 left-0 right-0 z-50 flex justify-center items-center ${answerIsCorrect ? 'correct' : 'incorrect'}`}>
                <div className="max-w-xs w-full mx-4 text-center">
                  <div className="text-center mb-2">
                    {answerIsCorrect ? (
                      <>
                        <h2 className="text-2xl flex gap-2 pb-3 items-center justify-center font-bold text-white" style={{ fontFamily: "'Blinker', sans-serif" }}>
                          <MdCheckCircle className="text-2xl" />
                          ¡BUEN TRABAJO!
                        </h2>
                      </>
                    ) : (
                      <>
                        <h2 className="text-2xl flex gap-2 items-center justify-center font-bold" style={{ fontFamily: "'Blinker', sans-serif" }}>
                          <MdCancel className="text-2xl" />
                          ¡UPS, ESO NO ES CORRECTO!
                        </h2>
                        <p className="mb-2 text-white font-semibold">
                          Respuesta correcta: <span className="font-bold">{goldenQuestions[currentQuestionIndex]?.options?.find(opt => opt.isCorrect)?.text}</span>
                        </p>
                      </>
                    )}
                  </div>
                <button
                  onClick={() => {
                    onValidationPanelContinue();
                    if (currentQuestionIndex < goldenQuestions.length - 1) {
                      onQuestionIndexChange(currentQuestionIndex + 1);
                    } else {
                      onStageChange('results');
                    }
                  }}
                  className="button-continue text-3xl uppercase font-black text-white"
                  style={{ fontFamily: "'Blinker', sans-serif" }}
                >
                  Continuar
                </button>
              </div>
            </div>
            );
          })()}

        </div>
      )}

      {goldenStage === 'results' && (
        <div className="min-h-screen results flex items-center justify-center px-4 pb-40">
          <Image 
            onClick={handleReturnToWorld}
            src="/images/icon-close.png"
            alt="Resultado"
            className="cursor-pointer fixed top-4 right-4"
            width={50}
            height={50}
          />
          
          <div className="max-w-sm text-center">
            <h1 className="text-5xl font-black uppercase text-green-800 mb-2" style={{ fontFamily: "'Blinker', sans-serif" }}>
              {getResultMessage()}
            </h1>
            <p className="mb-4 text-black font-bold m-auto max-w-xs">
              {getResultMessage2()}
            </p>

            <div className="result-dialog p-8 mb-8">
              <p className="text-5xl font-black text-right text-white mb-4 font-bowlby">
                {totalGoldenStars}
              </p>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
