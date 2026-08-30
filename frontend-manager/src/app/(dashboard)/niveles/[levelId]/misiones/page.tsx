'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import DataTable, { Column, AdditionalOption } from '@/app/components/DataTable';
import Pagination from '@/app/components/Pagination';
import SearchBar from '@/app/components/SearchBar';
import { missionsApi, questionsApi, levelsApi, worldsApi, Mission, Level, World, CreateMissionDto, UpdateMissionDto } from '@/app/services/api';
import { useManagerAuth } from '@/app/hooks/useManagerAuth';

export default function MissionsPage() {
  const router = useRouter();
  const params = useParams();
  const levelId = params.levelId as string;
  const fetchedRef = useRef(false);
  const { token, isLoading: authLoading } = useManagerAuth();

  const [level, setLevel] = useState<Level | null>(null);
  const [world, setWorld] = useState<World | null>(null);
  const [levels, setLevels] = useState<(Level & { worldData?: World })[]>([]);
  const [missions, setMissions] = useState<(Mission & { questionCount?: number; itemCount?: number; levelData?: Level; worldData?: World })[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [itemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingMission, setEditingMission] = useState<Mission | null>(null);
  const [formData, setFormData] = useState<CreateMissionDto | UpdateMissionDto>({ levelId: '', name: '', orderNum: 1 });
  const [error, setError] = useState('');

  const fetchLevelAndMissions = useCallback(async () => {
    if (fetchedRef.current) return;
    
    try {
      setLoading(true);
      fetchedRef.current = true;
      
      // Si levelId es "all", mostrar todas las misiones
      if (levelId === 'all') {
        const missionsRes = await missionsApi.getAll({ limit: 1000 });
        const allMissions = missionsRes.data.data || [];
        
        // Obtener cantidad de preguntas, items, nivel y mundo por misión
        const missionsWithQuestions = await Promise.all(
          allMissions.map(async (mission) => {
            try {
              const [questionsRes, levelRes, itemsRes] = await Promise.all([
                questionsApi.getByMissionAdmin(mission.id),
                levelsApi.getById(mission.levelId),
                missionsApi.getItems(mission.id)
              ]);
              const worldRes = await worldsApi.getById(levelRes.data.worldId);
              return { 
                ...mission, 
                questionCount: questionsRes.data.length,
                itemCount: itemsRes.data.length,
                levelData: levelRes.data,
                worldData: worldRes.data
              };
            } catch {
              return { 
                ...mission, 
                questionCount: 0,
                itemCount: 0,
                levelData: undefined,
                worldData: undefined
              };
            }
          })
        );

        setLevel(null);
        setWorld(null);
        setMissions(missionsWithQuestions);
        setTotalPages(Math.ceil(missionsWithQuestions.length / itemsPerPage));
      } else if (levelId) {
        // Hacer peticiones en paralelo
        const [levelRes, missionsRes] = await Promise.all([
          levelsApi.getById(levelId),
          missionsApi.getByLevel(levelId)
        ]);

        setLevel(levelRes.data);

        // Obtener mundo del nivel
        const worldRes = await worldsApi.getById(levelRes.data.worldId);
        setWorld(worldRes.data);

        // Obtener todos los niveles del mundo
        const levelsRes = await levelsApi.getByWorld(levelRes.data.worldId);
        const levelsWithWorld = levelsRes.data.map(l => ({ ...l, worldData: worldRes.data }));
        setLevels(levelsWithWorld);
        
        // Obtener cantidad de preguntas e items por misión
        const missionsWithQuestions = await Promise.all(
          missionsRes.data.map(async (mission) => {
            try {
              const [questionsRes, itemsRes] = await Promise.all([
                questionsApi.getByMissionAdmin(mission.id),
                missionsApi.getItems(mission.id)
              ]);
              return { ...mission, questionCount: questionsRes.data.length, itemCount: itemsRes.data.length };
            } catch {
              return { ...mission, questionCount: 0, itemCount: 0 };
            }
          })
        );

        setMissions(missionsWithQuestions);
        setTotalPages(Math.ceil(missionsWithQuestions.length / itemsPerPage));
      }
      setError('');
    } catch (err: any) {
      console.error('Error fetching missions:', err);
              
      setError(err.response?.data?.message || 'Error al cargar las misiones');
    } finally {
      setLoading(false);
    }
  }, [levelId, itemsPerPage]);

  useEffect(() => {
    // Reset en cambio de levelId
    fetchedRef.current = false;
    setMissions([]);
    setLevel(null);
    setWorld(null);
    setLevels([]);
    
    // Solo hacer fetch si tenemos token y no está cargando la autenticación
    if (token && !authLoading) {
      fetchLevelAndMissions();
    }
  }, [levelId, fetchLevelAndMissions, token, authLoading]);

  const handleCreate = () => {
    setEditingMission(null);
    setFormData({ levelId, name: '', orderNum: (missions.length + 1) });
    setShowModal(true);
    setError('');
  };

  const handleEdit = (mission: Mission) => {
    setEditingMission(mission);
    setFormData({ 
      levelId: mission.levelId, 
      name: mission.name, 
      description: mission.description, 
      orderNum: mission.orderNum,
      isActive: mission.isActive 
    });
    setShowModal(true);
    setError('');
  };

  const handleDelete = async (mission: Mission) => {
    if (!confirm(`¿Eliminar misión "${mission.name}"?`)) return;
    try {
      await missionsApi.delete(mission.id);
      fetchedRef.current = false;
      fetchLevelAndMissions();
    } catch (err: any) {
      alert('Error: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleLevelChange = (selectedLevelId: string) => {
    router.push(`/niveles/${selectedLevelId}/misiones`);
  };

  const handleCreateQuestion = (mission: Mission, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    router.push(`/niveles/${levelId}/misiones/${mission.id}/preguntas`);
  };

  const handleManageContent = (mission: Mission, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    router.push(`/niveles/${levelId}/misiones/${mission.id}/contenido`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      if (editingMission) {
        await missionsApi.update(editingMission.id, formData as UpdateMissionDto);
      } else {
        await missionsApi.create(formData as CreateMissionDto);
      }
      setShowModal(false);
      fetchedRef.current = false;
      fetchLevelAndMissions();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al guardar');
    }
  };

  const columns: Column<Mission & { questionCount?: number; itemCount?: number; levelData?: Level; worldData?: World }>[] = [
    { 
      key: 'name', 
      label: 'Nombre',
      render: (value, item) => {
        const missionItem = item as Mission & { levelData?: Level; worldData?: World };
        return (
          <div>
            {level ? (
              <div className="text-xs text-gray-500 font-normal">{world?.name} / {level.name}</div>
            ) : (
              <div className="text-xs text-gray-500 font-normal">
                {missionItem.worldData?.name && missionItem.levelData?.name
                  ? `${missionItem.worldData.name} / ${missionItem.levelData.name}`
                  : 'Todos los niveles'}
              </div>
            )}
            <div className="font-medium">{item.orderNum}. {value}</div>
          </div>
        );
      }
    },
    { 
      key: 'itemCount', 
      label: 'Contenidos',
      width: '100px',
      render: (value) => (
        <span className="text-orange-600 font-semibold">
          {value || 0}
        </span>
      )
    },
    { 
      key: 'questionCount', 
      label: 'Preguntas',
      width: '100px',
      render: (value) => (
        <span className="text-blue-600 font-semibold">
          {value || 0}
        </span>
      )
    },
    { key: 'isActive', label: 'Estado', render: (value) => <span className={`px-2 py-1 rounded-full text-xs font-semibold ${value ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{value ? 'Activo' : 'Inactivo'}</span> },
  ];

  const additionalOptions: AdditionalOption<Mission & { questionCount?: number; itemCount?: number; levelData?: Level; worldData?: World }>[] = [
    {
      label: 'Gestionar Contenido',
      icon: 'folder_open',
      class: 'bg-orange-100 text-orange-700 hover:bg-orange-200',
      title: 'Gestionar items de contenido',
      callback: (mission) => handleManageContent(mission, new MouseEvent('click') as any),
    },
    {
      label: 'Ver Preguntas',
      icon: 'quiz',
      class: 'bg-blue-100 text-blue-700 hover:bg-blue-200',
      title: 'Ver todas las preguntas de esta misión',
      callback: (mission) => handleCreateQuestion(mission, new MouseEvent('click') as any),
    },
  ];

  const filteredMissions = missions.filter((mission) =>
    mission.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const paginatedMissions = filteredMissions.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-4 flex-1">
          <button
            onClick={() => {
              if (levelId && levelId !== 'all' && level?.worldId) {
                router.push(`/mundos/${level.worldId}/niveles`);
              } else {
                router.push(`/mundos/all/niveles`);
              }
            }}
            className="text-gray-600 hover:text-gray-900 text-2xl"
          >
            ←
          </button>
          <div className="flex-1">
            <h1 className="text-4xl font-bold text-gray-800">🎯 Misiones</h1>
            {error && (
              <div className="mt-2 p-2 bg-red-50 border border-red-200 text-red-700 rounded text-sm">
                {error}
              </div>
            )}
            {levels.length > 0 && (
              <div className="mt-3">
                <label className="text-sm text-gray-600 block mb-2">Seleccionar Nivel:</label>
                <select
                  value={levelId}
                  onChange={(e) => handleLevelChange(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="all">Todos</option>
                  {levels.map((l) => (
                    <option key={l.id} value={l.id}>
                      {world?.name && `${world.name} / `}{l.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>
        <button onClick={handleCreate} className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2 rounded-lg inline-flex items-center gap-2">
          <span className="material-icons" style={{ fontSize: '20px' }}>add</span>
          Nueva Misión
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <SearchBar value={searchTerm} onChange={(term) => { setSearchTerm(term); setCurrentPage(1); }} placeholder="Buscar misiones..." />
        </div>
        <DataTable columns={columns} data={paginatedMissions} loading={loading} onEdit={handleEdit} onDelete={handleDelete} additionalOptions={additionalOptions} />
        <Pagination currentPage={currentPage} totalPages={Math.ceil(filteredMissions.length / itemsPerPage)} totalItems={filteredMissions.length} itemsPerPage={itemsPerPage} onPageChange={setCurrentPage} onItemsPerPageChange={() => {}} />
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-2xl font-bold mb-6">{editingMission ? 'Editar Misión' : 'Nueva Misión'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nombre *</label>
                <input type="text" required value={formData.name || ''} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Descripción</label>
                <textarea value={formData.description || ''} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Orden *</label>
                <input type="number" required min="1" value={formData.orderNum || 1} onChange={(e) => setFormData({ ...formData, orderNum: parseInt(e.target.value) })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500" />
              </div>
              {editingMission && (
                <div className="flex items-center">
                  <input type="checkbox" id="isActive" checked={(formData as UpdateMissionDto).isActive ?? true} onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })} className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded" />
                  <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">Misión activa</label>
                </div>
              )}
              {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">{error}</div>}
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">Cancelar</button>
                <button type="submit" className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700">{editingMission ? 'Actualizar' : 'Crear'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
