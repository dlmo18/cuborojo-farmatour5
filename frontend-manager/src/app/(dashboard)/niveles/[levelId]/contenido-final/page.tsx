'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import DataTable, { Column } from '@/app/components/DataTable';
import Pagination from '@/app/components/Pagination';
import SearchBar from '@/app/components/SearchBar';
import { RichTextEditor } from '@/app/components/RichTextEditor';
import ImageSelector from '@/app/components/ImageSelector';
import ToggleSwitch from '@/app/components/ToggleSwitch';
import { levelsApi, finalLevelsApi, worldsApi, Level, World, FinalLevelQuestion, FinalLevelAnswerOption, CreateFinalLevelQuestionDto, UpdateFinalLevelQuestionDto, CreateFinalLevelAnswerOptionDto, UpdateFinalLevelAnswerOptionDto } from '@/app/services/api';
import { useManagerAuth } from '@/app/hooks/useManagerAuth';
import { stripHtmlTags } from '@/app/utils/htmlUtils';

interface AnswerOption extends CreateFinalLevelAnswerOptionDto {
  tempId?: string;
}

export default function FinalLevelContentPage() {
  const router = useRouter();
  const params = useParams();
  const levelId = params.levelId as string;
  const fetchedRef = useRef(false);
  const { token, isLoading: authLoading } = useManagerAuth();

  // Estado general
  const [level, setLevel] = useState<Level | null>(null);
  const [world, setWorld] = useState<World | null>(null);
  const [questions, setQuestions] = useState<FinalLevelQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');

  // Estado para modal
  const [showModal, setShowModal] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<FinalLevelQuestion | null>(null);
  const [formData, setFormData] = useState<CreateFinalLevelQuestionDto>({
    levelId: '',
    content: '',
    orderNum: 1,
  });

  // Estado para respuestas
  const [currentAnswers, setCurrentAnswers] = useState<AnswerOption[]>([]);

  const fetchData = useCallback(async () => {
    if (fetchedRef.current) return;
    
    try {
      setLoading(true);
      fetchedRef.current = true;
      
      const [levelRes] = await Promise.all([
        levelsApi.getById(levelId),
      ]);

      setLevel(levelRes.data);

      // Obtener mundo
      const worldRes = await worldsApi.getById(levelRes.data.worldId);
      setWorld(worldRes.data);

      // Obtener preguntas
      const questionsRes = await finalLevelsApi.getQuestions(levelId);
      setQuestions(questionsRes.data);

      setError('');
    } catch (err: any) {
      console.error('Error fetching data:', err);
      setError(err.response?.data?.message || 'Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  }, [levelId]);

  useEffect(() => {
    if (token && !authLoading) {
      fetchData();
    }
  }, [fetchData, token, authLoading]);

  // ============================================================
  // FUNCIONES PARA PREGUNTAS
  // ============================================================

  const handleCreate = () => {
    setEditingQuestion(null);
    setFormData({
      levelId,
      content: '',
      orderNum: questions.length + 1,
      startVideoUrl: '',
      endVideoUrl: '',
      correctMessage: '',
      incorrectMessage: '',
    });
    setCurrentAnswers([
      { tempId: '1', questionId: '', text: '', isCorrect: false, orderNum: 1 },
      { tempId: '2', questionId: '', text: '', isCorrect: false, orderNum: 2 },
    ]);
    setShowModal(true);
    setError('');
  };

  const handleEdit = async (question: FinalLevelQuestion) => {
    setEditingQuestion(question);
    setFormData({
      levelId: question.levelId,
      content: question.content,
      orderNum: question.orderNum,
      startVideoUrl: question.startVideoUrl,
      endVideoUrl: question.endVideoUrl,
      correctMessage: question.correctMessage,
      incorrectMessage: question.incorrectMessage,
    });
    
    // Obtener respuestas
    try {
      const answersRes = await finalLevelsApi.getAnswers(question.id);
      setCurrentAnswers(
        answersRes.data.map((ans) => ({
          tempId: ans.id,
          questionId: ans.questionId,
          text: ans.text,
          imageId: ans.imageId,
          isCorrect: ans.isCorrect,
          orderNum: ans.orderNum,
        }))
      );
    } catch (err) {
      setCurrentAnswers([
        { tempId: '1', questionId: question.id, text: '', isCorrect: false, orderNum: 1 },
        { tempId: '2', questionId: question.id, text: '', isCorrect: false, orderNum: 2 },
      ]);
    }

    setShowModal(true);
    setError('');
  };

  const handleDelete = async (question: FinalLevelQuestion) => {
    if (!confirm(`¿Eliminar pregunta?`)) return;
    try {
      await finalLevelsApi.deleteQuestion(question.id);
      setQuestions(questions.filter(q => q.id !== question.id));
    } catch (err: any) {
      alert('Error: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleAddAnswer = () => {
    const newId = Math.random().toString(36).substr(2, 9);
    setCurrentAnswers([
      ...currentAnswers,
      {
        tempId: newId,
        questionId: editingQuestion?.id || '',
        text: '',
        isCorrect: false,
        orderNum: currentAnswers.length + 1,
      },
    ]);
  };

  const handleRemoveAnswer = (tempId: string | undefined) => {
    if (currentAnswers.length <= 2) {
      alert('Debe haber al menos 2 opciones de respuesta');
      return;
    }
    setCurrentAnswers(currentAnswers.filter((a) => a.tempId !== tempId));
  };

  const handleUpdateAnswer = (tempId: string | undefined, key: string, value: any) => {
    setCurrentAnswers(
      currentAnswers.map((a) =>
        a.tempId === tempId ? { ...a, [key]: value } : a
      )
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.content.trim()) {
      setError('El contenido de la pregunta es requerido');
      return;
    }

    const validAnswers = currentAnswers.filter((a) => a.text.trim());
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
      if (editingQuestion) {
        // Actualizar pregunta
        await finalLevelsApi.updateQuestion(editingQuestion.id, formData as UpdateFinalLevelQuestionDto);

        // Procesar respuestas
        const existingIds = new Set(currentAnswers.filter(a => !a.tempId?.startsWith('1') && !a.tempId?.startsWith('2')).map(a => a.tempId));
        const updatedIds = new Set<string>();

        for (const answer of validAnswers) {
          if (answer.tempId && answer.tempId.length > 10) {
            // Es un ID real, actualizar
            await finalLevelsApi.updateAnswer(answer.tempId, {
              text: answer.text,
              imageId: answer.imageId,
              isCorrect: answer.isCorrect,
              orderNum: answer.orderNum,
            });
            updatedIds.add(answer.tempId);
          } else {
            // Es nueva, crear
            await finalLevelsApi.createAnswer({
              questionId: editingQuestion.id,
              text: answer.text,
              imageId: answer.imageId,
              isCorrect: answer.isCorrect,
              orderNum: answer.orderNum,
            });
          }
        }

        // Eliminar opciones que fueron removidas
        existingIds.forEach(async (oldId) => {
          if (!updatedIds.has(oldId)) {
            await finalLevelsApi.deleteAnswer(oldId);
          }
        });
      } else {
        // Crear nueva pregunta
        const newQuestion = await finalLevelsApi.createQuestion(formData);

        // Crear respuestas
        for (const answer of validAnswers) {
          await finalLevelsApi.createAnswer({
            questionId: newQuestion.data.id,
            text: answer.text,
            imageId: answer.imageId,
            isCorrect: answer.isCorrect,
            orderNum: answer.orderNum,
          });
        }
      }

      setShowModal(false);
      fetchedRef.current = false;
      fetchData();
    } catch (err: any) {
      console.error('Error saving question:', err);
      setError(err.response?.data?.message || 'Error al guardar la pregunta');
    }
  };

  const columns: Column<FinalLevelQuestion>[] = [
    { 
      key: 'orderNum', 
      label: '#',
      width: '50px',
      render: (value) => <span className="font-semibold">{value}</span>
    },
    { 
      key: 'content', 
      label: 'Pregunta',
      render: (value) => <div className="line-clamp-2">{stripHtmlTags(value, 100)}</div>
    },
    { 
      key: 'isActive', 
      label: 'Estado',
      width: '100px',
      render: (value) => (
        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${value ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {value ? 'Activo' : 'Inactivo'}
        </span>
      )
    },
  ];

  const filteredQuestions = questions.filter((question) =>
    question.content.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const paginatedQuestions = filteredQuestions.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <div className="text-gray-600">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-4 flex-1">
          <button
            onClick={() => router.push(`/mundos/${world?.id}/niveles`)}
            className="text-gray-600 hover:text-gray-900 text-2xl"
          >
            ←
          </button>
          <div className="flex-1">
            <h1 className="text-4xl font-bold text-gray-800">🎬 Nivel Final</h1>
            {world && level && (
              <p className="text-sm text-gray-600 mt-2">
                {world.name} / {level.name}
              </p>
            )}
            {error && (
              <div className="mt-2 p-2 bg-red-50 border border-red-200 text-red-700 rounded text-sm">
                {error}
              </div>
            )}
          </div>
        </div>
        <button 
          onClick={handleCreate}
          className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2 rounded-lg inline-flex items-center gap-2"
        >
          <span className="material-icons" style={{ fontSize: '20px' }}>add</span>
          Nueva Pregunta
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <SearchBar 
            value={searchTerm} 
            onChange={(term) => { setSearchTerm(term); setCurrentPage(1); }} 
            placeholder="Buscar preguntas..." 
          />
        </div>
        <DataTable 
          columns={columns} 
          data={paginatedQuestions} 
          loading={loading} 
          onEdit={handleEdit} 
          onDelete={handleDelete}
        />
        <Pagination 
          currentPage={currentPage} 
          totalPages={Math.ceil(filteredQuestions.length / itemsPerPage)} 
          totalItems={filteredQuestions.length} 
          itemsPerPage={itemsPerPage} 
          onPageChange={setCurrentPage} 
          onItemsPerPageChange={() => {}} 
        />
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-3xl w-full p-6 max-h-[95vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-6 text-black">{editingQuestion ? 'Editar Pregunta' : 'Nueva Pregunta'}</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Contenido */}
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

              {/* Videos */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    🎬 Video de Inicio (URL Vimeo)
                  </label>
                  <input 
                    type="url" 
                    value={formData.startVideoUrl || ''} 
                    onChange={(e) => setFormData({ ...formData, startVideoUrl: e.target.value })} 
                    placeholder="https://vimeo.com/..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500" 
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    🎬 Video de Cierre (URL Vimeo)
                  </label>
                  <input 
                    type="url" 
                    value={formData.endVideoUrl || ''} 
                    onChange={(e) => setFormData({ ...formData, endVideoUrl: e.target.value })} 
                    placeholder="https://vimeo.com/..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500" 
                  />
                </div>
              </div>

              {/* Mensajes */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ✅ Mensaje para Respuesta Correcta
                  </label>
                  <RichTextEditor 
                    value={formData.correctMessage || ''} 
                    onChange={(content) => setFormData({ ...formData, correctMessage: content })}
                    minHeight="150px"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ❌ Mensaje para Respuesta Incorrecta
                  </label>
                  <RichTextEditor 
                    value={formData.incorrectMessage || ''} 
                    onChange={(content) => setFormData({ ...formData, incorrectMessage: content })}
                    minHeight="150px"
                  />
                </div>
              </div>

              {/* Orden */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Orden *</label>
                  <input 
                    type="number" 
                    required 
                    min="1" 
                    value={formData.orderNum} 
                    onChange={(e) => setFormData({ ...formData, orderNum: parseInt(e.target.value) })} 
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500" 
                  />
                </div>
              </div>

              {/* Opciones de respuesta */}
              <div>
                <div className="flex justify-between items-center mb-4">
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
                  {currentAnswers.map((answer, idx) => (
                    <div key={answer.tempId} className="p-4 border border-gray-300 rounded-lg space-y-3">
                      <div className="flex gap-2">
                        <textarea
                          value={answer.text}
                          onChange={(e) => handleUpdateAnswer(answer.tempId, 'text', e.target.value)}
                          placeholder="Texto de la opción"
                          rows={2}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                        <div className="flex flex-col gap-2">
                          <ToggleSwitch
                            id={`isCorrect-${answer.tempId}`}
                            checked={answer.isCorrect}
                            onChange={(checked) => handleUpdateAnswer(answer.tempId, 'isCorrect', checked)}
                            label="Correcta"
                          />
                          {currentAnswers.length > 2 && (
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

              {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">{error}</div>}

              <div className="flex gap-3 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
                >
                  {editingQuestion ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
