'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import ImageSelector from '@/app/components/ImageSelector';
import ToggleSwitch from '@/app/components/ToggleSwitch';
import { RichTextEditor } from '@/app/components/RichTextEditor';
import { questionsApi, missionsApi, levelsApi, worldsApi, mediaApi, Question, Mission, Level, World, CreateQuestionDto, CreateAnswerOptionDto } from '@/app/services/api';
import { useManagerAuth } from '@/app/hooks/useManagerAuth';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

const getImageUrl = (imageId?: string) => {
  if (!imageId) return null;
  return `${API_URL}/media/serve/${imageId}`;
};

interface AnswerOption extends CreateAnswerOptionDto {
  tempId?: string;
}

export default function CreateQuestionPage() {
  const router = useRouter();
  const params = useParams();
  const levelId = params.levelId as string;
  const missionId = params.missionId as string;
  const questionId = (params.questionId as string) || null;
  const fetchedRef = useRef(false);
  const { token, isLoading: authLoading } = useManagerAuth();

  const [mission, setMission] = useState<Mission | null>(null);
  const [level, setLevel] = useState<Level | null>(null);
  const [world, setWorld] = useState<World | null>(null);
  const [question, setQuestion] = useState<Question | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState<CreateQuestionDto>({
    missionId,
    content: '',
    orderNum: 1,
    starsValue: 1,
  });

  const [answers, setAnswers] = useState<AnswerOption[]>([
    { tempId: '1', text: '', isCorrect: false, orderNum: 1 },
    { tempId: '2', text: '', isCorrect: false, orderNum: 2 },
  ]);

  const fetchData = useCallback(async () => {
    if (fetchedRef.current) return;
    
    try {
      setLoading(true);
      fetchedRef.current = true;
      
      const [missionRes, levelRes] = await Promise.all([
        missionsApi.getById(missionId),
        levelsApi.getById(levelId),
      ]);

      setMission(missionRes.data);
      setLevel(levelRes.data);

      const worldRes = await worldsApi.getById(levelRes.data.worldId);
      setWorld(worldRes.data);

      if (questionId) {
        const questionRes = await questionsApi.getById(questionId);
        const q = questionRes.data;
        setQuestion(q);
        setFormData({
          missionId,
          content: q.content,
          orderNum: q.orderNum,
          starsValue: q.starsValue,
          imageId: q.imageId,
        });
        if (q.options) {
          setAnswers(
            q.options.map((opt, idx) => ({
              tempId: opt.id,
              text: opt.text,
              isCorrect: opt.isCorrect,
              orderNum: opt.orderNum,
              detail: opt.detail,
              imageId: opt.imageId,
            }))
          );
        }
      }

      setError('');
    } catch (err: any) {
      console.error('Error fetching data:', err);
      setError(err.response?.data?.message || 'Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  }, [missionId, levelId, questionId]);

  useEffect(() => {
    if (token && !authLoading) {
      fetchData();
    }
  }, [fetchData, token, authLoading]);

  const handleAddAnswer = () => {
    const newId = Math.random().toString(36).substr(2, 9);
    setAnswers([
      ...answers,
      {
        tempId: newId,
        text: '',
        isCorrect: false,
        orderNum: answers.length + 1,
      },
    ]);
  };

  const handleRemoveAnswer = (tempId: string | undefined) => {
    if (answers.length <= 2) {
      alert('Debe haber al menos 2 opciones de respuesta');
      return;
    }
    setAnswers(answers.filter((a) => a.tempId !== tempId));
  };

  const handleUpdateAnswer = (tempId: string | undefined, key: string, value: any) => {
    setAnswers(
      answers.map((a) =>
        a.tempId === tempId ? { ...a, [key]: value } : a
      )
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validaciones
    if (!formData.content.trim()) {
      setError('El contenido de la pregunta es requerido');
      return;
    }

    const validAnswers = answers.filter((a) => a.text.trim());
    if (validAnswers.length < 2) {
      setError('Debe haber al menos 2 opciones de respuesta');
      return;
    }

    const hasCorrect = validAnswers.some((a) => a.isCorrect);
    if (!hasCorrect) {
      setError('Debe marcar al menos una opción como correcta');
      return;
    }

    try {
      setSaving(true);

      if (question && questionId) {
        // Actualizar pregunta existente
        await questionsApi.update(questionId, formData);

        // Actualizar opciones: eliminar las que no están y actualizar/crear las existentes
        const existingIds = new Set(question.options?.map((o) => o.id) || []);
        const newAnswerIds = new Set<string>();

        for (const answer of validAnswers) {
          if (answer.tempId?.startsWith('http')) {
            // Es un ID real, actualizar
            await questionsApi.updateOption(answer.tempId, {
              text: answer.text,
              isCorrect: answer.isCorrect,
              detail: answer.detail,
              orderNum: answer.orderNum,
              imageId: answer.imageId,
            });
            newAnswerIds.add(answer.tempId);
          } else {
            // Es nueva, crear
            await questionsApi.createOption(questionId, {
              text: answer.text,
              isCorrect: answer.isCorrect,
              detail: answer.detail,
              orderNum: answer.orderNum,
              imageId: answer.imageId,
            });
          }
        }

        // Eliminar opciones que fueron removidas
        existingIds.forEach(async (oldId) => {
          if (!newAnswerIds.has(oldId)) {
            await questionsApi.deleteOption(oldId);
          }
        });
      } else {
        // Crear nueva pregunta
        const newQuestion = await questionsApi.create(formData);

        // Crear opciones de respuesta
        for (const answer of validAnswers) {
          await questionsApi.createOption(newQuestion.data.id, {
            text: answer.text,
            isCorrect: answer.isCorrect,
            detail: answer.detail,
            orderNum: answer.orderNum,
            imageId: answer.imageId,
          });
        }
      }

      router.push(`/niveles/${levelId}/misiones/${missionId}/preguntas`);
    } catch (err: any) {
      console.error('Error saving question:', err);
      setError(err.response?.data?.message || 'Error al guardar la pregunta');
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <div className="text-gray-600">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => router.push(`/niveles/${levelId}/misiones/${missionId}/preguntas`)}
          className="text-gray-600 hover:text-gray-900 text-2xl"
        >
          ←
        </button>
        <div className="flex-1">
          <h1 className="text-4xl font-bold text-gray-800">
            {question ? '✏️ Editar Pregunta' : '➕ Nueva Pregunta'}
          </h1>
          {mission && level && world && (
            <p className="text-sm text-gray-600 mt-2">
              {world.name} / {level.name} / {mission.name}
            </p>
          )}
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-lg p-8 space-y-8">
        {/* Contenido de la pregunta - WYSIWYG */}
        <div>
          <label className="block text-lg font-semibold text-gray-700 mb-3">
            Contenido de la Pregunta * (Formato Enriquecido)
          </label>
          <RichTextEditor
            value={formData.content}
            onChange={(content) => setFormData({ ...formData, content })}
            placeholder="Escribe el contenido de la pregunta con formato enriquecido..."
            minHeight="200px"
          />
        </div>

        {/* Valor de estrellas y orden */}
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-lg font-semibold text-gray-700 mb-3">
              ⭐ Valor de Estrellas (Puntos)
            </label>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="1"
                max="10"
                value={formData.starsValue || 1}
                onChange={(e) => setFormData({ ...formData, starsValue: parseInt(e.target.value) })}
                className="flex-1"
              />
              <span className="text-2xl font-bold text-yellow-500 w-12 text-center">
                {formData.starsValue || 1}
              </span>
            </div>
          </div>

          <div>
            <label className="block text-lg font-semibold text-gray-700 mb-3">
              Orden de Aparición
            </label>
            <input
              type="number"
              min="1"
              value={formData.orderNum}
              onChange={(e) => setFormData({ ...formData, orderNum: parseInt(e.target.value) })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>

        {/* Imagen de la pregunta */}
        <div>
          <label className="block text-lg font-semibold text-gray-700 mb-3">
            🖼️ Imagen de la Pregunta (opcional)
          </label>
          <ImageSelector
            selectedImageId={formData.imageId}
            onImageSelect={(imageId) => setFormData({ ...formData, imageId })}
            label="Seleccionar imagen para esta pregunta"
          />
          {formData.imageId && getImageUrl(formData.imageId) && (
            <div className="mt-4">
              <img
                src={getImageUrl(formData.imageId) || ''}
                alt="Preview"
                className="w-full h-auto max-h-64 rounded-lg border border-gray-200"
              />
            </div>
          )}
        </div>

        {/* Opciones de respuesta */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <label className="block text-lg font-semibold text-gray-700">
              Opciones de Respuesta *
            </label>
            <button
              type="button"
              onClick={handleAddAnswer}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium"
            >
              + Agregar Opción
            </button>
          </div>

          <div className="space-y-4">
            {answers.map((answer, idx) => (
              <div key={answer.tempId} className="p-4 border border-gray-300 rounded-lg space-y-3">
                <div className="flex items-start gap-4">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Opción {idx + 1}
                    </label>
                    <textarea
                      value={answer.text}
                      onChange={(e) => handleUpdateAnswer(answer.tempId, 'text', e.target.value)}
                      placeholder="Texto de la opción"
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <ToggleSwitch
                      id={`isCorrect-${answer.tempId}`}
                      checked={answer.isCorrect}
                      onChange={(checked) => handleUpdateAnswer(answer.tempId, 'isCorrect', checked)}
                      label="Opción Correcta"
                    />

                    {answers.length > 2 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveAnswer(answer.tempId)}
                        className="text-red-600 hover:text-red-700 text-sm font-medium"
                      >
                        Eliminar
                      </button>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Explicación (opcional)
                  </label>
                  <textarea
                    value={answer.detail || ''}
                    onChange={(e) => handleUpdateAnswer(answer.tempId, 'detail', e.target.value)}
                    placeholder="Explicación detallada de por qué esta opción es correcta o incorrecta"
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Imagen de la Opción (opcional)
                  </label>
                  <ImageSelector
                    selectedImageId={answer.imageId}
                    onImageSelect={(imageId) => handleUpdateAnswer(answer.tempId, 'imageId', imageId)}
                    label="Seleccionar imagen para esta opción"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Botones de acción */}
        <div className="flex gap-3 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={() => router.push(`/niveles/${levelId}/misiones/${missionId}/preguntas`)}
            className="flex-1 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={saving}
            className="flex-1 px-6 py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 disabled:opacity-50"
          >
            {saving ? 'Guardando...' : question ? 'Actualizar Pregunta' : 'Crear Pregunta'}
          </button>
        </div>
      </form>
    </div>
  );
}
