'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { MdAdd, MdDownload } from 'react-icons/md';
import DataTable, { Column } from '@/app/components/DataTable';
import Pagination from '@/app/components/Pagination';
import SearchBar from '@/app/components/SearchBar';
import ImageSelector from '@/app/components/ImageSelector';
import ToggleSwitch from '@/app/components/ToggleSwitch';
import GoldenLevelImportModal from '@/app/components/GoldenLevelImportModal';
import { levelsApi, goldenLevelsApi, worldsApi, Level, World, GoldenLevelItem, GoldenLevelQuestion, GoldenLevelAnswerOption, CreateGoldenLevelItemDto, UpdateGoldenLevelItemDto, CreateGoldenLevelQuestionDto, UpdateGoldenLevelQuestionDto, CreateGoldenLevelAnswerOptionDto, UpdateGoldenLevelAnswerOptionDto } from '@/app/services/api';
import { useManagerAuth } from '@/app/hooks/useManagerAuth';
import { stripHtmlTags } from '@/app/utils/htmlUtils';

type TabType = 'items' | 'questions';

interface AnswerOption extends CreateGoldenLevelAnswerOptionDto {
  tempId?: string;
}

export default function GoldenLevelContentPage() {
  const router = useRouter();
  const params = useParams();
  const levelId = params.levelId as string;
  const fetchedRef = useRef(false);
  const { token, isLoading: authLoading } = useManagerAuth();

  // Estado general
  const [level, setLevel] = useState<Level | null>(null);
  const [world, setWorld] = useState<World | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<TabType>('items');

  // Estado para Items
  const [items, setItems] = useState<GoldenLevelItem[]>([]);
  const [currentPageItems, setCurrentPageItems] = useState(1);
  const [itemsPerPage] = useState(10);
  const [searchTermItems, setSearchTermItems] = useState('');
  const [showModalItem, setShowModalItem] = useState(false);
  const [editingItem, setEditingItem] = useState<GoldenLevelItem | null>(null);
  const [selectedImageId, setSelectedImageId] = useState<string>('');
  const [formDataItem, setFormDataItem] = useState<CreateGoldenLevelItemDto>({
    levelId: '',
    title: '',
    orderNum: 1,
  });

  // Estado para Preguntas
  const [questions, setQuestions] = useState<GoldenLevelQuestion[]>([]);
  const [currentPageQuestions, setCurrentPageQuestions] = useState(1);
  const [searchTermQuestions, setSearchTermQuestions] = useState('');
  const [showModalQuestion, setShowModalQuestion] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<GoldenLevelQuestion | null>(null);
  const [formDataQuestion, setFormDataQuestion] = useState<CreateGoldenLevelQuestionDto>({
    levelId: '',
    content: '',
    orderNum: 1,
  });

  // Estado para Opciones de respuesta
  const [currentAnswers, setCurrentAnswers] = useState<AnswerOption[]>([]);
  const [showAnswersModal, setShowAnswersModal] = useState(false);

  // Estado para Importación
  const [showImportModal, setShowImportModal] = useState(false);

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

      // Obtener items y preguntas
      const [itemsRes, questionsRes] = await Promise.all([
        goldenLevelsApi.getItems(levelId),
        goldenLevelsApi.getQuestions(levelId),
      ]);

      setItems(itemsRes.data);
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
  // FUNCIONES PARA ITEMS
  // ============================================================

  const handleCreateItem = () => {
    setEditingItem(null);
    setFormDataItem({
      levelId,
      title: '',
      orderNum: items.length + 1,
    });
    setSelectedImageId('');
    setShowModalItem(true);
    setError('');
  };

  const handleEditItem = (item: GoldenLevelItem) => {
    setEditingItem(item);
    setFormDataItem({
      levelId: item.levelId,
      title: item.title,
      detail: item.detail,
      orderNum: item.orderNum,
    });
    setSelectedImageId(item.detail || '');
    setShowModalItem(true);
    setError('');
  };

  const handleDeleteItem = async (item: GoldenLevelItem) => {
    if (!confirm(`¿Eliminar contenido "${item.title}"?`)) return;
    try {
      await goldenLevelsApi.deleteItem(item.id);
      setItems(items.filter(i => i.id !== item.id));
    } catch (err: any) {
      alert('Error: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleSubmitItem = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      if (editingItem) {
        // Para actualización, no enviar levelId
        const updateData: UpdateGoldenLevelItemDto = {
          title: formDataItem.title,
          detail: formDataItem.detail,
          orderNum: formDataItem.orderNum,
        };
        await goldenLevelsApi.updateItem(editingItem.id, updateData);
      } else {
        await goldenLevelsApi.createItem(formDataItem);
      }
      setShowModalItem(false);
      fetchedRef.current = false;
      fetchData();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al guardar');
    }
  };

  // ============================================================
  // FUNCIONES PARA PREGUNTAS
  // ============================================================

  const handleCreateQuestion = () => {
    setEditingQuestion(null);
    setFormDataQuestion({
      levelId,
      content: '',
      orderNum: questions.length + 1,
    });
    setShowModalQuestion(true);
    setCurrentAnswers([
      { tempId: '1', questionId: '', text: '', isCorrect: false, orderNum: 1 },
      { tempId: '2', questionId: '', text: '', isCorrect: false, orderNum: 2 },
    ]);
    setError('');
  };

  const handleEditQuestion = async (question: GoldenLevelQuestion) => {
    setEditingQuestion(question);
    setFormDataQuestion({
      levelId: question.levelId,
      content: question.content,
      orderNum: question.orderNum,
    });
    
    // Obtener respuestas
    try {
      const answersRes = await goldenLevelsApi.getAnswers(question.id);
      setCurrentAnswers(
        answersRes.data.map((ans, idx) => ({
          tempId: ans.id,
          questionId: ans.questionId,
          text: ans.text,
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

    setShowModalQuestion(true);
    setError('');
  };

  const handleDeleteQuestion = async (question: GoldenLevelQuestion) => {
    if (!confirm(`¿Eliminar pregunta?`)) return;
    try {
      await goldenLevelsApi.deleteQuestion(question.id);
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

  const handleSubmitQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formDataQuestion.content.trim()) {
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
        // Actualizar pregunta sin enviar levelId
        const updateData: UpdateGoldenLevelQuestionDto = {
          content: formDataQuestion.content,
          orderNum: formDataQuestion.orderNum,
        };
        await goldenLevelsApi.updateQuestion(editingQuestion.id, updateData);

        // Procesar respuestas
        const existingIds = new Set(currentAnswers.filter(a => !a.tempId?.startsWith('1') && !a.tempId?.startsWith('2')).map(a => a.tempId));
        const updatedIds = new Set<string>();

        for (const answer of validAnswers) {
          if (answer.tempId && answer.tempId.length > 10) {
            // Es un ID real, actualizar
            await goldenLevelsApi.updateAnswer(answer.tempId, {
              text: answer.text,
              isCorrect: answer.isCorrect,
              orderNum: answer.orderNum,
            });
            updatedIds.add(answer.tempId);
          } else {
            // Es nueva, crear
            await goldenLevelsApi.createAnswer({
              questionId: editingQuestion.id,
              text: answer.text,
              isCorrect: answer.isCorrect,
              orderNum: answer.orderNum,
            });
          }
        }

        // Eliminar opciones que fueron removidas
        existingIds.forEach(async (oldId) => {
          if (!updatedIds.has(oldId)) {
            await goldenLevelsApi.deleteAnswer(oldId);
          }
        });
      } else {
        // Crear nueva pregunta
        const newQuestion = await goldenLevelsApi.createQuestion(formDataQuestion);

        // Crear respuestas
        for (const answer of validAnswers) {
          await goldenLevelsApi.createAnswer({
            questionId: newQuestion.data.id,
            text: answer.text,
            isCorrect: answer.isCorrect,
            orderNum: answer.orderNum,
          });
        }
      }

      setShowModalQuestion(false);
      fetchedRef.current = false;
      fetchData();
    } catch (err: any) {
      console.error('Error saving question:', err);
      setError(err.response?.data?.message || 'Error al guardar la pregunta');
    }
  };

  // ============================================================
  // COLUMNAS PARA TABLAS
  // ============================================================

  const itemsColumns: Column<GoldenLevelItem>[] = [
    { 
      key: 'orderNum', 
      label: '#',
      width: '50px',
      render: (value) => <span className="font-semibold">{value}</span>
    },
    { 
      key: 'title', 
      label: 'Título',
      render: (value) => <div className="line-clamp-1 font-semibold">{value}</div>
    },
    { 
      key: 'detail', 
      label: 'Imagen',
      width: '120px',
      render: (value) => {
        if (!value) {
          return <div className="text-sm text-surface-500">Sin imagen</div>;
        }
        // Check if it looks like a URL or an image ID/path
        if (value.startsWith('http') || value.includes('/')) {
          return (
            <div className="w-24 h-24 rounded-lg overflow-hidden border border-surface-200">
              <img 
                src={value} 
                alt="Detalle" 
                className="w-full h-full object-cover"
              />
            </div>
          );
        }
        return <div className="text-sm text-surface-500">-</div>;
      }
    },
  ];

  const questionsColumns: Column<GoldenLevelQuestion>[] = [
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
        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${value ? 'bg-primary-100 text-primary-800' : 'bg-accent-100 text-accent-800'}`}>
          {value ? 'Activo' : 'Inactivo'}
        </span>
      )
    },
  ];

  const filteredItems = items.filter((item) =>
    item.title.toLowerCase().includes(searchTermItems.toLowerCase())
  );
  const paginatedItems = filteredItems.slice((currentPageItems - 1) * itemsPerPage, currentPageItems * itemsPerPage);

  const filteredQuestions = questions.filter((question) =>
    question.content.toLowerCase().includes(searchTermQuestions.toLowerCase())
  );
  const paginatedQuestions = filteredQuestions.slice((currentPageQuestions - 1) * itemsPerPage, currentPageQuestions * itemsPerPage);

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <div className="text-surface-600">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-4 flex-1">
          <button
            onClick={() => router.push(`/mundos/${world?.id}/niveles`)}
            className="text-surface-600 hover:text-surface-900 text-2xl"
          >
            ←
          </button>
          <div className="flex-1">
            <h1 className="text-4xl font-bold text-surface-800">✨ Nivel Dorado</h1>
            {world && level && (
              <p className="text-sm text-surface-600 mt-2">
                {world.name} / {level.name}
              </p>
            )}
            {error && (
              <div className="mt-2 p-2 bg-accent-50 border border-accent-200 text-accent-700 rounded text-sm">
                {error}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-surface-200">
        <button
          onClick={() => setActiveTab('items')}
          className={`px-6 py-3 font-semibold transition-colors ${
            activeTab === 'items'
              ? 'text-primary-600 border-b-2 border-primary-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          📚 Contenidos ({items.length})
        </button>
        <button
          onClick={() => setActiveTab('questions')}
          className={`px-6 py-3 font-semibold transition-colors ${
            activeTab === 'questions'
              ? 'text-primary-600 border-b-2 border-primary-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          ❓ Preguntas ({questions.length})
        </button>
      </div>

      {/* Items Tab */}
      {activeTab === 'items' && (
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="p-6 border-b border-surface-200 flex justify-between items-center">
            <SearchBar 
              value={searchTermItems} 
              onChange={(term) => { setSearchTermItems(term); setCurrentPageItems(1); }} 
              placeholder="Buscar contenido..." 
            />
            <div className="flex gap-2">
              <button 
                onClick={() => setShowImportModal(true)}
                className="bg-secondary-600 hover:bg-secondary-700 text-white px-6 py-2 rounded-lg inline-flex items-center gap-2"
              >
                <MdDownload size={20} />
                Importar
              </button>
              <button 
                onClick={handleCreateItem}
                className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2 rounded-lg inline-flex items-center gap-2"
              >
                <MdAdd size={20} />
                Nuevo Contenido
              </button>
            </div>
          </div>
          <DataTable 
            columns={itemsColumns} 
            data={paginatedItems} 
            loading={loading} 
            onEdit={handleEditItem} 
            onDelete={handleDeleteItem}
          />
          <Pagination 
            currentPage={currentPageItems} 
            totalPages={Math.ceil(filteredItems.length / itemsPerPage)} 
            totalItems={filteredItems.length} 
            itemsPerPage={itemsPerPage} 
            onPageChange={setCurrentPageItems} 
            onItemsPerPageChange={() => {}} 
          />
        </div>
      )}

      {/* Questions Tab */}
      {activeTab === 'questions' && (
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="p-6 border-b border-gray-200 flex justify-between items-center">
            <SearchBar 
              value={searchTermQuestions} 
              onChange={(term) => { setSearchTermQuestions(term); setCurrentPageQuestions(1); }} 
              placeholder="Buscar preguntas..." 
            />
            <div className="flex gap-2">
              <button 
                onClick={() => setShowImportModal(true)}
                className="bg-secondary-600 hover:bg-secondary-700 text-white px-6 py-2 rounded-lg inline-flex items-center gap-2"
              >
                <MdDownload size={20} />
                Importar
              </button>
              <button 
                onClick={handleCreateQuestion}
                className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2 rounded-lg inline-flex items-center gap-2"
              >
                <MdAdd size={20} />
                Nueva Pregunta
              </button>
            </div>
          </div>
          <DataTable 
            columns={questionsColumns} 
            data={paginatedQuestions} 
            loading={loading} 
            onEdit={handleEditQuestion} 
            onDelete={handleDeleteQuestion}
          />
          <Pagination 
            currentPage={currentPageQuestions} 
            totalPages={Math.ceil(filteredQuestions.length / itemsPerPage)} 
            totalItems={filteredQuestions.length} 
            itemsPerPage={itemsPerPage} 
            onPageChange={setCurrentPageQuestions} 
            onItemsPerPageChange={() => {}} 
          />
        </div>
      )}

      {/* Modal para Items */}
      {showModalItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-6 text-black">{editingItem ? 'Editar Contenido' : 'Nuevo Contenido'}</h2>
            <form onSubmit={handleSubmitItem} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-surface-700 mb-2">Título *</label>
                <input 
                  type="text" 
                  required 
                  value={formDataItem.title || ''} 
                  onChange={(e) => setFormDataItem({ ...formDataItem, title: e.target.value })} 
                  className="w-full px-3 py-2 border border-surface-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500" 
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-surface-700 mb-2">Imagen</label>
                <ImageSelector
                  selectedImageId={selectedImageId}
                  onImageSelect={(imageId) => {
                    setSelectedImageId(imageId);
                    setFormDataItem({ ...formDataItem, detail: imageId });
                  }}
                  label="Imagen del Contenido" 
                  className="h-80"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-surface-700 mb-2">Orden *</label>
                <input 
                  type="number" 
                  required 
                  min="1" 
                  value={formDataItem.orderNum || 1} 
                  onChange={(e) => setFormDataItem({ ...formDataItem, orderNum: parseInt(e.target.value) })} 
                  className="w-full px-3 py-2 border border-surface-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500" 
                />
              </div>

              {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">{error}</div>}

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModalItem(false)}
                  className="flex-1 px-4 py-2 border border-surface-300 rounded-md text-surface-700 hover:bg-surface-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
                >
                  {editingItem ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal para Preguntas */}
      {showModalQuestion && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-6 text-black">{editingQuestion ? 'Editar Pregunta' : 'Nueva Pregunta'}</h2>
            <form onSubmit={handleSubmitQuestion} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-surface-700 mb-2">Contenido *</label>
                <textarea
                  required
                  value={formDataQuestion.content}
                  onChange={(e) => setFormDataQuestion({ ...formDataQuestion, content: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-surface-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-surface-700 mb-2">Orden *</label>
                <input 
                  type="number" 
                  required 
                  min="1" 
                  value={formDataQuestion.orderNum} 
                  onChange={(e) => setFormDataQuestion({ ...formDataQuestion, orderNum: parseInt(e.target.value) })} 
                  className="w-full px-3 py-2 border border-surface-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500" 
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-4">
                  <label className="block text-sm font-medium text-gray-700">Opciones de Respuesta *</label>
                  <button
                    type="button"
                    onClick={handleAddAnswer}
                    className="bg-accent-500 hover:bg-accent-600 text-white px-4 py-2 rounded-lg text-sm font-medium"
                  >
                    + Agregar Opción
                  </button>
                </div>

                <div className="space-y-3">
                  {currentAnswers.map((answer, idx) => (
                    <div key={answer.tempId} className="p-3 border border-surface-300 rounded-lg space-y-2">
                      <div className="flex gap-2">
                        <textarea
                          value={answer.text}
                          onChange={(e) => handleUpdateAnswer(answer.tempId, 'text', e.target.value)}
                          placeholder="Texto de la opción"
                          rows={2}
                          className="flex-1 px-3 py-2 border border-surface-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
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
                    </div>
                  ))}
                </div>
              </div>

              {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">{error}</div>}

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModalQuestion(false)}
                  className="flex-1 px-4 py-2 border border-surface-300 rounded-md text-surface-700 hover:bg-surface-50"
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

      {/* Modal de Importación */}
      <GoldenLevelImportModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        levelId={levelId}
        onSuccess={() => {
          fetchedRef.current = false;
          fetchData();
        }}
      />
    </div>
  );
}
