'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import DataTable, { Column, AdditionalOption } from '@/app/components/DataTable';
import Pagination from '@/app/components/Pagination';
import SearchBar from '@/app/components/SearchBar';
import RichTextEditor from '@/app/components/RichTextEditor';
import { levelsApi, missionsApi, worldsApi, Level, World, CreateLevelDto, UpdateLevelDto, LevelType } from '@/app/services/api';
import { useManagerAuth } from '@/app/hooks/useManagerAuth';
import { FontSize } from '@tiptap/extension-text-style';

export default function LevelsPage() {
  const router = useRouter();
  const params = useParams();
  const worldId = params.worldId as string;
  const fetchedRef = useRef(false);
  const { token, isLoading: authLoading } = useManagerAuth();

  const [world, setWorld] = useState<World | null>(null);
  const [worlds, setWorlds] = useState<World[]>([]);
  const [levels, setLevels] = useState<(Level & { missionCount?: number; worldData?: World })[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [itemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingLevel, setEditingLevel] = useState<Level | null>(null);
  const [formData, setFormData] = useState<CreateLevelDto | UpdateLevelDto>({
    worldId: '',
    name: '',
    orderNum: 1,
    levelType: 'normal',
  });
  const [error, setError] = useState('');

  const fetchWorlds = useCallback(async () => {
    try {
      const res = await worldsApi.getAll({ limit: 1000 });
      setWorlds(res.data.data || []);
    } catch (err) {
      console.error('Error fetching worlds:', err);
    }
  }, []);

  const fetchWorldAndLevels = useCallback(async () => {
    if (fetchedRef.current) return;
    
    try {
      setLoading(true);
      fetchedRef.current = true;
      
      // Si worldId es "all", mostrar todos los niveles
      if (worldId === 'all') {
        const levelsRes = await levelsApi.getAll({ limit: 1000 });
        const allLevels = levelsRes.data.data || [];
        
        // Obtener cantidad de misiones y mundo por nivel
        const levelsWithMissions = await Promise.all(
          allLevels.map(async (level) => {
            try {
              const [missionsRes, worldRes] = await Promise.all([
                missionsApi.getByLevel(level.id),
                worldsApi.getById(level.worldId)
              ]);
              return { 
                ...level, 
                missionCount: missionsRes.data.length,
                worldData: worldRes.data
              };
            } catch {
              return { 
                ...level, 
                missionCount: 0,
                worldData: undefined
              };
            }
          })
        );

        setWorld(null);
        setLevels(levelsWithMissions);
        setTotalPages(Math.ceil(levelsWithMissions.length / itemsPerPage));
      } else if (worldId) {
        // Cargar mundo en paralelo
        const worldRes = await worldsApi.getById(worldId);
        setWorld(worldRes.data);

        // Cargar niveles del mundo
        const levelsRes = await levelsApi.getByWorld(worldId);
        
        // Obtener cantidad de misiones por nivel
        const levelsWithMissions = await Promise.all(
          levelsRes.data.map(async (level) => {
            try {
              const missionsRes = await missionsApi.getByLevel(level.id);
              return { ...level, missionCount: missionsRes.data.length };
            } catch {
              return { ...level, missionCount: 0 };
            }
          })
        );

        setLevels(levelsWithMissions);
        setTotalPages(Math.ceil(levelsWithMissions.length / itemsPerPage));
      }
      setError('');
    } catch (err: any) {
      console.error('Error:', err);
      setError(err.response?.data?.message || 'Error al cargar los niveles');
    } finally {
      setLoading(false);
    }
  }, [worldId, itemsPerPage]);

  useEffect(() => {
    fetchWorlds();
  }, [fetchWorlds]);

  useEffect(() => {
    // Reset en cambio de worldId
    fetchedRef.current = false;
    setLevels([]);
    setWorld(null);
    
    // Solo hacer fetch si tenemos token y no está cargando la autenticación
    if (token && !authLoading) {
      fetchWorldAndLevels();
    }
  }, [worldId, fetchWorldAndLevels, token, authLoading]);

  const handleCreate = () => {
    setEditingLevel(null);
    setFormData({ 
      worldId, 
      name: '', 
      orderNum: (levels.length + 1),
      levelType: 'normal',
      description: '',
    });
    setShowModal(true);
    setError('');
  };

  const handleEdit = (level: Level) => {
    setEditingLevel(level);
    setFormData({ 
      worldId: level.worldId, 
      name: level.name, 
      description: level.description, 
      orderNum: level.orderNum,
      levelType: level.levelType,
      isActive: level.isActive,
      introVideoUrl: level.introVideoUrl,
      introVideoId: level.introVideoId,
    });
    setShowModal(true);
    setError('');
  };

  const handleDelete = async (level: Level) => {
    if (!confirm(`¿Eliminar nivel "${level.name}"?`)) return;
    try {
      await levelsApi.delete(level.id);
      fetchedRef.current = false;
      fetchWorldAndLevels();
    } catch (err: any) {
      alert('Error: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleViewMissions = (level: Level) => {
    router.push(`/niveles/${level.id}/misiones`);
  };

  const handleManageContent = (level: Level, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (level.levelType === 'golden') {
      router.push(`/niveles/${level.id}/contenido-dorado`);
    } else if (level.levelType === 'final') {
      router.push(`/niveles/${level.id}/contenido-final`);
    } else {
      // Nivel normal
      router.push(`/mundos/${worldId}/niveles/${level.id}/contenido`);
    }
  };

  const handleWorldChange = (selectedWorldId: string) => {
    router.push(`/mundos/${selectedWorldId}/niveles`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      if (editingLevel) {
        await levelsApi.update(editingLevel.id, formData as UpdateLevelDto);
      } else {
        await levelsApi.create(formData as CreateLevelDto);
      }
      setShowModal(false);
      fetchedRef.current = false;
      fetchWorldAndLevels();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al guardar');
    }
  };

  const currentLevelType = (formData as any).levelType || 'normal';

  const columns: Column<Level & { missionCount?: number; worldData?: World }>[] = [
    { 
      key: 'name', 
      label: 'Nombre',
      render: (value, item) => {
        const levelItem = item as Level & { worldData?: World };
        return (
          <div>
            {world ? (
              <div className="text-xs text-gray-500 font-normal">{world.name}</div>
            ) : (
              <div className="text-xs text-gray-500 font-normal">
                {levelItem.worldData?.name || 'Todos los mundos'}
              </div>
            )}
            <div className="font-medium">{item.orderNum}. {value}</div>
          </div>
        );
      }
    },
    { 
      key: 'levelType', 
      label: 'Tipo',
      width: '120px',
      render: (value: LevelType) => {
        const typeLabels = { normal: 'Normal', golden: 'Dorado', final: 'Final' };
        const typeColors = { 
          normal: 'bg-blue-100 text-blue-800',
          golden: 'bg-yellow-100 text-yellow-800',
          final: 'bg-purple-100 text-purple-800'
        };
        return (
          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${typeColors[value] || typeColors.normal}`}>
            {typeLabels[value] || 'Desconocido'}
          </span>
        );
      }
    },
    { 
      key: 'missionCount', 
      label: 'Misiones',
      width: '100px',
      render: (value, item) => {
        // Solo mostrar misiones para niveles normales
        if (item.levelType === 'normal') {
          return (
            <button
              onClick={() => handleViewMissions(item)}
              className="text-blue-600 hover:text-blue-900 font-semibold hover:underline"
            >
              {value || 0}
            </button>
          );
        }
        return <span className="text-gray-400">N/A</span>;
      }
    },
    { key: 'isActive', label: 'Estado', render: (value) => <span className={`px-2 py-1 rounded-full text-xs font-semibold ${value ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{value ? 'Activo' : 'Inactivo'}</span> },
  ];

  const additionalOptions: AdditionalOption<Level & { missionCount?: number; worldData?: World }>[] = [
    {
      label: 'Ver Misiones',
      icon: 'assignment',
      class: 'bg-green-100 text-green-700 hover:bg-green-200',
      title: 'Ver todas las misiones de este nivel',
      callback: (level) => handleViewMissions(level),
      condition: (level) => level.levelType === 'normal',
    },
    {
      label: 'Gestionar Contenido',
      icon: 'account_tree',
      class: 'bg-purple-100 text-purple-700 hover:bg-purple-200',
      title: 'Gestionar items y preguntas',
      callback: (level) => handleManageContent(level, new MouseEvent('click') as any),
      condition: (level) => level.levelType === 'golden' || level.levelType === 'final',
    },
  ];

  const filteredLevels = levels.filter((level) =>
    level.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const paginatedLevels = filteredLevels.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-4 flex-1">
          <button
            onClick={() => router.push('/mundos')}
            className="text-gray-600 hover:text-gray-900 text-2xl"
          >
            ←
          </button>
          <div className="flex-1">
            <h1 className="text-4xl font-bold text-gray-800"><span style={{fontSize: '2rem', width: '2rem'}} className="material-icons">lists</span> Niveles</h1>
            {error && (
              <div className="mt-2 p-2 bg-red-50 border border-red-200 text-red-700 rounded text-sm">
                {error}
              </div>
            )}
            {worlds.length > 0 && (
              <div className="mt-3 flex items-center gap-4">
                <label className="text-sm text-gray-600 block mb-2">Seleccionar Mundo:</label>
                <select
                  value={worldId}
                  onChange={(e) => handleWorldChange(e.target.value)}
                  className="world-select px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="all">Todos</option>
                  {worlds.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>
        <button onClick={handleCreate} className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2 rounded-lg inline-flex items-center gap-2">
          <span className="material-icons" style={{ fontSize: '20px' }}>add</span>
          Nuevo Nivel
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <SearchBar value={searchTerm} onChange={(term) => { setSearchTerm(term); setCurrentPage(1); }} placeholder="Buscar niveles..." />
        </div>
        <DataTable columns={columns} data={paginatedLevels} loading={loading} onEdit={handleEdit} onDelete={handleDelete} additionalOptions={additionalOptions} />
        <Pagination currentPage={currentPage} totalPages={Math.ceil(filteredLevels.length / itemsPerPage)} totalItems={filteredLevels.length} itemsPerPage={itemsPerPage} onPageChange={setCurrentPage} onItemsPerPageChange={() => {}} />
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl text-black font-bold mb-6">{editingLevel ? 'Editar Nivel' : 'Nuevo Nivel'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Tipo de Nivel */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Nivel *</label>
                <select
                  required
                  value={currentLevelType}
                  onChange={(e) => setFormData({ ...formData, levelType: e.target.value as LevelType })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="normal">Nivel Normal (con misiones)</option>
                  <option value="golden">Nivel Dorado (sin misiones, solo contenido)</option>
                  <option value="final">Nivel Final (solo preguntas)</option>
                </select>
                <p className="mt-1 text-xs text-gray-500">
                  {currentLevelType === 'normal' && 'Tiene misiones, items de contenido y preguntas'}
                  {currentLevelType === 'golden' && 'Solo items de contenido y preguntas (sin misiones)'}
                  {currentLevelType === 'final' && 'Solo preguntas con videos de inicio y cierre'}
                </p>
              </div>

              {/* Nombre */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nombre *</label>
                <input
                  type="text"
                  required
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              {/* Descripción - Mostrar para Normal y Golden */}
              {(currentLevelType === 'normal' || currentLevelType === 'golden') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Descripción</label>
                  <RichTextEditor
                    value={formData.description || ''}
                    onChange={(content) => setFormData({ ...formData, description: content })}
                    placeholder="Escribe la descripción del nivel con formato..."
                    minHeight="200px"
                  />
                </div>
              )}

              {/* Enlace de Video Introductorio - Solo para Final */}
              {currentLevelType === 'final' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Video Introductorio (URL Vimeo)</label>
                  <input
                    type="url"
                    value={(formData as any).introVideoUrl || ''}
                    onChange={(e) => setFormData({ ...formData, introVideoUrl: e.target.value })}
                    placeholder="https://vimeo.com/..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              )}

              {/* Orden */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Orden *</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={formData.orderNum || 1}
                  onChange={(e) => setFormData({ ...formData, orderNum: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              {/* Estado Activo */}
              {editingLevel && (
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={(formData as UpdateLevelDto).isActive ?? true}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">Nivel activo</label>
                </div>
              )}

              {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">{error}</div>}

              <div className="flex gap-3 pt-4">
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
                  {editingLevel ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
