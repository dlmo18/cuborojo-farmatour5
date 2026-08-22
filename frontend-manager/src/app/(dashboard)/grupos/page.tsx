'use client';

import { useState, useEffect } from 'react';
import DataTable, { Column } from '@/app/components/DataTable';
import Pagination from '@/app/components/Pagination';
import SearchBar from '@/app/components/SearchBar';
import { groupsApi, Group, CreateGroupDto, UpdateGroupDto } from '@/app/services/api';

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

  useEffect(() => {
    fetchGroups();
  }, [currentPage, itemsPerPage, searchTerm]);

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
      isActive: group.isActive,
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
        await groupsApi.update(editingGroup.id, formData as UpdateGroupDto);
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
    { key: 'name', label: 'Nombre' },
    { key: 'description', label: 'Descripción' },
    {
      key: 'isActive',
      label: 'Estado',
      render: (value) => (
        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
          value ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {value ? 'Activo' : 'Inactivo'}
        </span>
      ),
    },
  ];

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold text-gray-800">📁 Grupos</h1>
        <button onClick={handleCreate} className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2 rounded-lg inline-flex items-center gap-2">
          <span className="material-icons" style={{ fontSize: '20px' }}>add</span>
          Nuevo Grupo
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <SearchBar value={searchTerm} onChange={setSearchTerm} placeholder="Buscar grupos..." />
        </div>

        <DataTable columns={columns} data={groups} loading={loading} onEdit={handleEdit} onDelete={handleDelete} />
        <Pagination currentPage={currentPage} totalPages={totalPages} totalItems={totalItems} itemsPerPage={itemsPerPage} onPageChange={setCurrentPage} onItemsPerPageChange={setItemsPerPage} />
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-2xl font-bold mb-6">{editingGroup ? 'Editar Grupo' : 'Nuevo Grupo'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nombre *</label>
                <input type="text" required value={formData.name || ''} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Descripción</label>
                <textarea value={formData.description || ''} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500" />
              </div>

              {editingGroup && (
                <div className="flex items-center">
                  <input type="checkbox" id="isActive" checked={(formData as UpdateGroupDto).isActive ?? true} onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })} className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded" />
                  <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">Grupo activo</label>
                </div>
              )}

              {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">{error}</div>}

              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">Cancelar</button>
                <button type="submit" className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700">{editingGroup ? 'Actualizar' : 'Crear'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
