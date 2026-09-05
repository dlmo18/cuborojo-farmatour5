'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import DataTable, { Column } from '@/app/components/DataTable';
import Pagination from '@/app/components/Pagination';
import SearchBar from '@/app/components/SearchBar';
import MediaPreviewModal from '@/app/components/MediaPreviewModal';
import { questionsApi, missionsApi, levelsApi, worldsApi, mediaApi, Question, Mission, Level, World, MediaFile } from '@/app/services/api';
import { useManagerAuth } from '@/app/hooks/useManagerAuth';
import { stripHtmlTags } from '@/app/utils/htmlUtils';

export default function MissionQuestionsPage() {
  const router = useRouter();
  const params = useParams();
  const levelId = params.levelId as string;
  const missionId = params.missionId as string;
  const fetchedRef = useRef(false);
  const { token, isLoading: authLoading } = useManagerAuth();

  const [mission, setMission] = useState<Mission | null>(null);
  const [level, setLevel] = useState<Level | null>(null);
  const [world, setWorld] = useState<World | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');
  const [previewImage, setPreviewImage] = useState<MediaFile | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  const handleOpenImagePreview = async (imageId?: string) => {
    if (!imageId) return;
    try {
      const response = await mediaApi.getById(imageId);
      setPreviewImage(response.data);
      setShowPreview(true);
    } catch (err) {
      console.error('Error loading image:', err);
    }
  };

  const fetchData = useCallback(async () => {
    if (fetchedRef.current) return;
    
    try {
      setLoading(true);
      fetchedRef.current = true;
      
      // Obtener datos en paralelo
      const [missionRes, levelRes] = await Promise.all([
        missionsApi.getById(missionId),
        levelsApi.getById(levelId),
      ]);

      setMission(missionRes.data);
      setLevel(levelRes.data);

      // Obtener mundo
      const worldRes = await worldsApi.getById(levelRes.data.worldId);
      setWorld(worldRes.data);

      // Obtener preguntas
      const questionsRes = await questionsApi.getByMissionAdmin(missionId);
      setQuestions(questionsRes.data);

      setError('');
    } catch (err: any) {
      console.error('Error fetching data:', err);
      setError(err.response?.data?.message || 'Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  }, [missionId, levelId]);

  useEffect(() => {
    if (token && !authLoading) {
      fetchData();
    }
  }, [fetchData, token, authLoading]);

  const handleDelete = async (question: Question) => {
    if (!confirm(`¿Eliminar pregunta "${question.content.substring(0, 50)}..."?`)) return;
    try {
      await questionsApi.delete(question.id);
      fetchedRef.current = false;
      setQuestions(questions.filter(q => q.id !== question.id));
    } catch (err: any) {
      alert('Error: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleEdit = (question: Question) => {
    router.push(`/niveles/${levelId}/misiones/${missionId}/preguntas/${question.id}/editar`);
  };

  const columns: Column<Question>[] = [
    { 
      key: 'orderNum', 
      label: '#',
      width: '50px',
      render: (value) => <span className="font-semibold">{value}</span>
    },
    { 
      key: 'content', 
      label: 'Pregunta',
      render: (value, item: any) => (
        <div className="flex items-center gap-2">
          {item.imageId && (
            <button
              onClick={() => handleOpenImagePreview(item.imageId)}
              className="flex-shrink-0 w-8 h-8 rounded border border-gray-200 hover:border-blue-400 transition-colors"
              title="Ver imagen"
            >
              <img
                src={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/media/${item.imageId}`}
                alt="pregunta"
                className="w-full h-full object-cover rounded"
                onError={(e) => {
                  e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"%3E%3Crect x="3" y="3" width="18" height="18" rx="2"/%3E%3Ccircle cx="8.5" cy="8.5" r="1.5"/%3E%3Cpath d="M21 15l-5-5L5 21"/%3E%3C/svg%3E';
                }}
              />
            </button>
          )}
          <div className="line-clamp-2">{stripHtmlTags(value, 100)}</div>
        </div>
      )
    },
    { 
      key: 'starsValue', 
      label: 'Estrellas',
      width: '100px',
      render: (value) => (
        <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-sm font-semibold">
          ⭐ {value}
        </span>
      )
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

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-4 flex-1">
          <button
            onClick={() => router.push(`/niveles/${levelId}/misiones`)}
            className="text-gray-600 hover:text-gray-900 text-2xl"
          >
            ←
          </button>
          <div className="flex-1">
            <h1 className="text-4xl font-bold text-gray-800">❓ Preguntas</h1>
            {mission && level && world && (
              <p className="text-sm text-gray-600 mt-2">
                {world.name} / {level.name} / {mission.name}
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
          onClick={() => router.push(`/niveles/${levelId}/misiones/${missionId}/preguntas/crear`)}
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

      {previewImage && (
        <MediaPreviewModal
          item={previewImage}
          isOpen={showPreview}
          onClose={() => setShowPreview(false)}
        />
      )}
    </div>
  );
}
