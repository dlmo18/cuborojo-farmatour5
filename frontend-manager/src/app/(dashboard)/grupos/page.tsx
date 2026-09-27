'use client';

import { useState, useEffect } from 'react';
import { MdAdd } from 'react-icons/md';
import DataTable, { Column } from '@/app/components/DataTable';
import Pagination from '@/app/components/Pagination';
import SearchBar from '@/app/components/SearchBar';
import ImageSelector from '@/app/components/ImageSelector';
import ToggleSwitch from '@/app/components/ToggleSwitch';
import MediaPreviewModal from '@/app/components/MediaPreviewModal';
import { groupsApi, Group, CreateGroupDto, UpdateGroupDto, mediaApi, MediaFile } from '@/app/services/api';

export default function GroupsPage() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingGroup, setEditingGroup] = useState<Group | null>(null);
  const [formData, setFormData] = useState<CreateGroupDto | UpdateGroupDto>({
    name: '',
    description: '',
  });
  const [error, setError] = useState('');
  const [previewImage, setPreviewImage] = useState<MediaFile | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    fetchGroups();
  }, [currentPage, itemsPerPage, searchTerm]);

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

  const fetchGroups = async () => {
    try {
      setLoading(true);
      const response = await groupsApi.getAll({
        page: currentPage,
        limit: itemsPerPage,
        search: searchTerm,
      });
      setGroups(response.data.data);
      setTotalPages(response.data.totalPages);
      setTotalItems(response.data.total);
    } catch (err: any) {
      console.error('Error al cargar grupos:', err);
      setError('Error al cargar los grupos');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingGroup(null);
    setFormData({ name: '', description: '' });
    setShowModal(true);
    setError('');
  };

  const handleEdit = (group: Group) => {
    setEditingGroup(group);
    setFormData({
      name: group.name,
      description: group.description,
      imageId: group.imageId,
    });
    setShowModal(true);
    setError('');
  };

  const handleDelete = async (group: Group) => {
    if (!confirm(`¿Estás seguro de eliminar el grupo "${group.name}"?`)) return;

    try {
      await groupsApi.delete(group.id);
      fetchGroups();
    } catch (err: any) {
      alert('Error al eliminar: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      if (editingGroup) {
        const updateData: UpdateGroupDto = {
          name: formData.name,
          description: formData.description,
          imageId: (formData as any).imageId,
        };
        await groupsApi.update(editingGroup.id, updateData);
      } else {
        await groupsApi.create(formData as CreateGroupDto);
      }
      setShowModal(false);
      fetchGroups();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al guardar');
    }
  };

  const columns: Column<Group>[] = [
    { 
      key: 'name', 
      label: 'Nombre',
      render: (value, item) => (
        <div className="flex items-center gap-3">
          {item.imageId && (
            <button
              onClick={() => handleOpenImagePreview(item.imageId)}
              className="flex-shrink-0 w-6 h-6 rounded overflow-hidden border border-gray-200 hover:border-blue-400 transition-colors"
              title="Ver imagen"
            >
              <img
                src={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/media/serve/${item.imageId}`}
                alt={value}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%2248%22 height=%2248%22%3E%3Crect fill=%22%23f0f0f0%22 width=%2248%22 height=%2248%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 text-anchor=%22middle%22 dy=%22.3em%22 font-size=%2224%22%3E🖼️%3C/text%3E%3C/svg%3E';
                }}
              />
            </button>
          )}
          <div>
            <div className="font-medium">{value}</div>
          </div>
        </div>
      )
    },
    { key: 'description', label: 'Descripción' },
    {
      key: 'isActive',
      label: 'Estado',
      render: (value) => (
        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
          value ? 'bg-primary-100 text-primary-800' : 'bg-accent-100 text-accent-800'
        }`}>
          {value ? 'Activo' : 'Inactivo'}
        </span>
      ),
    },
  ];

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold text-secondary-800">📁 Grupos</h1>
        <button onClick={handleCreate} className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2 rounded-lg inline-flex items-center gap-2">
          <MdAdd size={20} />
          Nuevo Grupo
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="p-6 border-b border-surface-200">
          <SearchBar value={searchTerm} onChange={setSearchTerm} placeholder="Buscar grupos..." />
        </div>

        <DataTable columns={columns} data={groups} loading={loading} onEdit={handleEdit} onDelete={handleDelete} />
        <Pagination currentPage={currentPage} totalPages={totalPages} totalItems={totalItems} itemsPerPage={itemsPerPage} onPageChange={setCurrentPage} onItemsPerPageChange={setItemsPerPage} />
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-xl w-full p-6">
            <h2 className="text-2xl font-bold mb-6 text-black">{editingGroup ? 'Editar Grupo' : 'Nuevo Grupo'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">Nombre *</label>
                <input type="text" required value={formData.name || ''} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full px-3 py-2 border border-surface-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500" />
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">Descripción</label>
                <textarea value={formData.description || ''} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={3} className="w-full px-3 py-2 border border-surface-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500" />
              </div>

              <div>
                <ImageSelector
                  selectedImageId={(formData as any).imageId}
                  onImageSelect={(imageId) => setFormData({ ...formData, imageId })}
                  label="Imagen del Grupo"
                  required={false}
                />
              </div>

              {editingGroup && (
                <div className="bg-accent-50 border border-accent-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-yellow-800 font-semibold text-sm">Estado del grupo:</span>
                    <span className={`px-2 py-1 rounded text-xs font-bold ${editingGroup.isActive ? 'bg-primary-100 text-primary-800' : 'bg-accent-100 text-accent-800'}`}>
                      {editingGroup.isActive ? 'Activo' : 'Inactivo'}
                    </span>
                  </div>
                  <p className="text-xs text-yellow-700">El estado del grupo no puede ser modificado desde aquí. Contacta al administrador si necesitas cambiar el estado.</p>
                </div>
              )}

              {error && <div className="bg-accent-50 border border-accent-200 text-accent-700 px-4 py-3 rounded">{error}</div>}

              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-2 border border-surface-300 rounded-md text-surface-700 hover:bg-surface-50">Cancelar</button>
                <button type="submit" className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700">{editingGroup ? 'Actualizar' : 'Crear'}</button>
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
