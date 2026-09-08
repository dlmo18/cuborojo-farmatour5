'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import DataTable, { Column } from '@/app/components/DataTable';
import Pagination from '@/app/components/Pagination';
import SearchBar from '@/app/components/SearchBar';
import { RichTextEditor } from '@/app/components/RichTextEditor';
import ImageSelector from '@/app/components/ImageSelector';
import MediaPreviewModal from '@/app/components/MediaPreviewModal';
import { missionsApi, levelsApi, worldsApi, mediaApi, Mission, MissionItem, Level, World, CreateMissionItemDto, UpdateMissionItemDto, MediaFile } from '@/app/services/api';
import { useManagerAuth } from '@/app/hooks/useManagerAuth';
import { stripHtmlTags } from '@/app/utils/htmlUtils';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

const getImageUrl = (imageId: string) => {
  if (!imageId) return '';
  return `${API_URL}/media/serve/${imageId}`;
};

export default function MissionContentPage() {
  const router = useRouter();
  const params = useParams();
  const levelId = params.levelId as string;
  const missionId = params.missionId as string;
  const fetchedRef = useRef(false);
  const { token, isLoading: authLoading } = useManagerAuth();

  const [mission, setMission] = useState<Mission | null>(null);
  const [level, setLevel] = useState<Level | null>(null);
  const [world, setWorld] = useState<World | null>(null);
  const [items, setItems] = useState<MissionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<MissionItem | null>(null);
  const [formData, setFormData] = useState<CreateMissionItemDto>({
    title: '',
    orderNum: 1,
  });
  const [previewImage, setPreviewImage] = useState<MediaFile | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [newBadge, setNewBadge] = useState('');

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

      // Obtener items de contenido
      const itemsRes = await missionsApi.getItems(missionId);
      setItems(itemsRes.data);

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

  const handleCreate = () => {
    setEditingItem(null);
    setFormData({
      title: '',
      orderNum: items.length + 1,
      contentBadges: [],
    });
    setNewBadge('');
    setShowModal(true);
    setError('');
  };

  const handleEdit = (item: MissionItem) => {
    setEditingItem(item);
    setFormData({
      title: item.title,
      imageId: item.imageId,
      thumbnailId: item.thumbnailId,
      benefits: item.benefits,
      detail: item.detail,
      contentBadges: item.contentBadges || [],
      orderNum: item.orderNum,
    });
    setNewBadge('');
    setShowModal(true);
    setError('');
  };

  const handleDelete = async (item: MissionItem) => {
    if (!confirm(`¿Eliminar contenido "${item.title}"?`)) return;
    try {
      await missionsApi.deleteItem(item.id);
      setItems(items.filter(i => i.id !== item.id));
    } catch (err: any) {
      alert('Error: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      if (editingItem) {
        await missionsApi.updateItem(editingItem.id, formData as UpdateMissionItemDto);
      } else {
        await missionsApi.createItem(missionId, formData);
      }
      setShowModal(false);
      fetchedRef.current = false;
      fetchData();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al guardar');
    }
  };

  const columns: Column<MissionItem>[] = [
    { 
      key: 'orderNum', 
      label: '#',
      width: '50px',
      render: (value) => <span className="font-semibold">{value}</span>
    },
    { 
      key: 'title', 
      label: 'Título',
      render: (value, item: any) => (
        <div className="flex items-center gap-2">
          {item.imageId && (
            <button
              onClick={() => handleOpenImagePreview(item.imageId)}
              className="flex-shrink-0 w-8 h-8 rounded border border-gray-200 hover:border-blue-400 transition-colors"
              title="Ver imagen"
            >
              <img
                src={getImageUrl(item.imageId)}
                alt={value}
                className="w-full h-full object-cover rounded"
                onError={(e) => {
                  e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"%3E%3Crect x="3" y="3" width="18" height="18" rx="2"/%3E%3Ccircle cx="8.5" cy="8.5" r="1.5"/%3E%3Cpath d="M21 15l-5-5L5 21"/%3E%3C/svg%3E';
                }}
              />
            </button>
          )}
          <div className="line-clamp-1 font-semibold">{value}</div>
        </div>
      )
    },
    { 
      key: 'benefits', 
      label: 'Beneficios',
      render: (value) => <div style={{width: '250px'}}><div className="whitespace-break-spaces text-sm text-gray-600 line-clamp-2">{stripHtmlTags(value, 200)}</div></div>
    },
    { 
      key: 'detail', 
      label: 'Detalle',
      render: (value) => <div style={{width: '250px'}}><div className="whitespace-break-spaces min-w-md text-sm text-gray-600 line-clamp-1">{stripHtmlTags(value, 200)}</div></div>
    },
    { 
      key: 'contentBadges', 
      label: 'Etiquetas',
      render: (value: any) => (
        <div className="flex flex-wrap gap-1">
          {value && value.length > 0 ? (
            value.slice(0, 3).map((badge: string, idx: number) => (
              <span key={idx} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">
                {badge}
              </span>
            ))
          ) : (
            <span className="text-gray-400 text-sm">-</span>
          )}
          {value && value.length > 3 && (
            <span className="text-gray-500 text-xs">+{value.length - 3}</span>
          )}
        </div>
      )
    },
  ];

  const filteredItems = items.filter((item) =>
    item.title.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const paginatedItems = filteredItems.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

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
            <h1 className="text-4xl font-bold text-gray-800">📚 Contenido de Misión</h1>
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
          onClick={handleCreate}
          className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2 rounded-lg inline-flex items-center gap-2"
        >
          <span className="material-icons" style={{ fontSize: '20px' }}>add</span>
          Nuevo Contenido
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <SearchBar 
            value={searchTerm} 
            onChange={(term) => { setSearchTerm(term); setCurrentPage(1); }} 
            placeholder="Buscar contenido..." 
          />
        </div>
        <DataTable 
          columns={columns} 
          data={paginatedItems} 
          loading={loading} 
          onEdit={handleEdit} 
          onDelete={handleDelete}
        />
        <Pagination 
          currentPage={currentPage} 
          totalPages={Math.ceil(filteredItems.length / itemsPerPage)} 
          totalItems={filteredItems.length} 
          itemsPerPage={itemsPerPage} 
          onPageChange={setCurrentPage} 
          onItemsPerPageChange={() => {}} 
        />
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-6 text-black">{editingItem ? 'Editar Contenido' : 'Nuevo Contenido'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Título *</label>
                <input 
                  type="text" 
                  required 
                  value={formData.title || ''} 
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })} 
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500" 
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Beneficios</label>
                <RichTextEditor 
                  value={formData.benefits || ''} 
                  onChange={(content) => setFormData({ ...formData, benefits: content })}
                  minHeight="200px"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Detalle</label>
                <RichTextEditor 
                  value={formData.detail || ''} 
                  onChange={(content) => setFormData({ ...formData, detail: content })}
                  minHeight="250px"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Imagen</label>
                <ImageSelector
                  selectedImageId={formData.imageId}
                  onImageSelect={(imageId) => setFormData({ ...formData, imageId })}
                  label="Seleccionar imagen para este contenido"
                />
              </div>

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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Etiquetas (Badges)</label>
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      placeholder="Ej: Vitamina A, Complejo B..."
                      value={newBadge} 
                      onChange={(e) => setNewBadge(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          if (newBadge.trim()) {
                            setFormData({
                              ...formData,
                              contentBadges: [...(formData.contentBadges || []), newBadge.trim()]
                            });
                            setNewBadge('');
                          }
                        }
                      }}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500" 
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (newBadge.trim()) {
                          setFormData({
                            ...formData,
                            contentBadges: [...(formData.contentBadges || []), newBadge.trim()]
                          });
                          setNewBadge('');
                        }
                      }}
                      className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium"
                    >
                      +
                    </button>
                  </div>
                  
                  {formData.contentBadges && formData.contentBadges.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {formData.contentBadges.map((badge, idx) => (
                        <div
                          key={idx}
                          className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2"
                        >
                          {badge}
                          <button
                            type="button"
                            onClick={() => {
                              setFormData({
                                ...formData,
                                contentBadges: formData.contentBadges!.filter((_, i) => i !== idx)
                              });
                            }}
                            className="text-blue-600 hover:text-blue-800 font-bold"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

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
                  {editingItem ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
