'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { questionsApi, missionsApi, levelsApi, worldsApi, Question, Mission, Level, World, CreateQuestionDto } from '@/app/services/api';
import { useManagerAuth } from '@/app/hooks/useManagerAuth';

interface AnswerOption {
  id?: string;
  text: string;
  isCorrect: boolean;
  detail?: string;
  orderNum: number;
  imageId?: string;
  tempId?: string;
}

export default function EditQuestionPage() {
  const router = useRouter();
  const params = useParams();
  const levelId = params.levelId as string;
  const missionId = params.missionId as string;
  const questionId = params.questionId as string;
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

  const [answers, setAnswers] = useState<AnswerOption[]>([]);

  const fetchData = useCallback(async () => {
    if (fetchedRef.current) return;
    
    try {
      setLoading(true);
      fetchedRef.current = true;
      
      const [missionRes, levelRes, questionRes] = await Promise.all([
        missionsApi.getById(missionId),
        levelsApi.getById(levelId),
        questionsApi.getById(questionId),
      ]);

      setMission(missionRes.data);
      setLevel(levelRes.data);

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
          q.options.map((opt) => ({
            id: opt.id,
            text: opt.text,
            isCorrect: opt.isCorrect,
            orderNum: opt.orderNum,
            detail: opt.detail,
            imageId: opt.imageId,
            tempId: opt.id,
          }))
        );
      }

      const worldRes = await worldsApi.getById(levelRes.data.worldId);
      setWorld(worldRes.data);

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
    const newTempId = Math.random().toString(36).substr(2, 9);
    setAnswers([
      ...answers,
      {
        tempId: newTempId,
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

      // Actualizar pregunta
      await questionsApi.update(questionId, formData);

      // Procesar opciones: actualizar existentes, crear nuevas, eliminar eliminadas
      const existingIds = new Set(question?.options?.map((o) => o.id) || []);
      const updatedIds = new Set<string>();

      for (const answer of validAnswers) {
        if (answer.id) {
          // Opción existente - actualizar
          await questionsApi.updateOption(answer.id, {
            text: answer.text,
            isCorrect: answer.isCorrect,
            detail: answer.detail,
            orderNum: answer.orderNum,
            imageId: answer.imageId,
          });
          updatedIds.add(answer.id);
        } else {
          // Opción nueva - crear
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
        if (!updatedIds.has(oldId)) {
          await questionsApi.deleteOption(oldId);
        }
      });

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
        <div className="text-gray-600">Cargando pregunta...</div>
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
          <h1 className="text-4xl font-bold text-gray-800">✏️ Editar Pregunta</h1>
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
        {/* Contenido de la pregunta */}
        <div>
          <label className="block text-lg font-semibold text-gray-700 mb-3">
            Contenido de la Pregunta *
          </label>
          <textarea
            required
            value={formData.content}
            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            rows={3}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
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

        {/* Opciones de respuesta */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <label className="block text-lg font-semibold text-gray-700">
              Opciones de Respuesta *
            </label>
            <button
              type="button"
              onClick={handleAddAnswer}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium"
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
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={answer.isCorrect}
                        onChange={(e) => handleUpdateAnswer(answer.tempId, 'isCorrect', e.target.checked)}
                        className="w-5 h-5 rounded"
                      />
                      <span className="text-sm font-medium text-gray-700">Correcta</span>
                    </label>

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
            {saving ? 'Guardando...' : 'Actualizar Pregunta'}
          </button>
        </div>
      </form>
    </div>
  );
}
