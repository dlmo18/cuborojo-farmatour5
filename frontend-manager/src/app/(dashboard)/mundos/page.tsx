'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DataTable, { Column, AdditionalOption } from '@/app/components/DataTable';
import Pagination from '@/app/components/Pagination';
import SearchBar from '@/app/components/SearchBar';
import { worldsApi, levelsApi, World, CreateWorldDto, UpdateWorldDto, Level } from '@/app/services/api';
import { useManagerAuth } from '@/app/hooks/useManagerAuth';

export default function WorldsPage() {
  const router = useRouter();
  const { token, isLoading: authLoading } = useManagerAuth();
  const [worlds, setWorlds] = useState<(World & { levelCount?: number })[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingWorld, setEditingWorld] = useState<World | null>(null);
  const [formData, setFormData] = useState<CreateWorldDto | UpdateWorldDto>({ name: '', description: '', orderNum: 1 });
  const [error, setError] = useState('');

  useEffect(() => { 
    // Solo fetch si tenemos token y no está cargando la autenticación
    if (token && !authLoading) {
      fetchWorlds(); 
    }
  }, [currentPage, itemsPerPage, searchTerm, token, authLoading]);

  const fetchWorlds = async () => {
    try {
      setLoading(true);
      const response = await worldsApi.getAll({ page: currentPage, limit: itemsPerPage, search: searchTerm });
      
      // Obtener cantidad de niveles por mundo
      const worldsWithLevels = await Promise.all(
        response.data.data.map(async (world) => {
          try {
            const levelsRes = await levelsApi.getByWorld(world.id);
            return { ...world, levelCount: levelsRes.data.length };
          } catch {
            return { ...world, levelCount: 0 };
          }
        })
      );
      
      setWorlds(worldsWithLevels);
      setTotalPages(response.data.totalPages);
      setTotalItems(response.data.total);
    } catch (err: any) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingWorld(null);
    setFormData({ name: '', description: '', orderNum: (worlds.length + 1) });
    setShowModal(true);
    setError('');
  };

  const handleEdit = (world: World) => {
    setEditingWorld(world);
    setFormData({ name: world.name, description: world.description, orderNum: world.orderNum, imageId: world.imageId, isActive: world.isActive });
    setShowModal(true);
    setError('');
  };

  const handleDelete = async (world: World) => {
    if (!confirm(`¿Eliminar mundo "${world.name}"?`)) return;
    try {
      await worldsApi.delete(world.id);
      fetchWorlds();
    } catch (err: any) {
      alert('Error: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleViewLevels = (world: World) => {
    router.push(`/mundos/${world.id}/niveles`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      if (editingWorld) {
        await worldsApi.update(editingWorld.id, formData as UpdateWorldDto);
      } else {
        await worldsApi.create(formData as CreateWorldDto);
      }
      setShowModal(false);
      fetchWorlds();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al guardar');
    }
  };

  const columns: Column<World & { levelCount?: number }>[] = [
    { 
      key: 'name', 
      label: 'Nombre',
      render: (value, item) => (
        <div>
          <div className="font-medium">{item.orderNum}. {value}</div>
        </div>
      )
    },
    { 
      key: 'description', 
      label: 'Descripción',
      render: (value, item) => (
        <div className='whitespace-break-spaces'>
          <div className="text-gray-600">{item.description}</div>
        </div>
      )
    },
    { 
      key: 'levelCount', 
      label: 'Niveles',
      width: '100px',
      render: (value, item) => (
        <button
          onClick={() => handleViewLevels(item)}
          className="text-blue-600 hover:text-blue-900 font-semibold hover:underline"
        >
          {value || 0}
        </button>
      )
    },
    { key: 'isActive', label: 'Estado', render: (value) => <span className={`px-2 py-1 rounded-full text-xs font-semibold ${value ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{value ? 'Activo' : 'Inactivo'}</span> },
  ];

  const additionalOptions: AdditionalOption<World & { levelCount?: number }>[] = [
    {
      label: 'Ver Niveles',
      icon: 'layers',
      class: 'bg-blue-100 text-blue-700 hover:bg-blue-200',
      title: 'Ver todos los niveles de este mundo',
      callback: (world) => handleViewLevels(world),
    },
  ];

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold text-gray-800"><span style={{fontSize: '2rem', width: '2rem'}} className="material-icons">public</span> Mundos</h1>
        <button onClick={handleCreate} className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2 rounded-lg inline-flex items-center gap-2">
          <span className="material-icons" style={{ fontSize: '20px' }}>add</span>
          Nuevo Mundo
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <SearchBar value={searchTerm} onChange={setSearchTerm} placeholder="Buscar mundos..." />
        </div>
        <DataTable columns={columns} data={worlds} loading={loading} onEdit={handleEdit} onDelete={handleDelete} additionalOptions={additionalOptions} />
        <Pagination currentPage={currentPage} totalPages={totalPages} totalItems={totalItems} itemsPerPage={itemsPerPage} onPageChange={setCurrentPage} onItemsPerPageChange={setItemsPerPage} />
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-2xl font-bold mb-6">{editingWorld ? 'Editar Mundo' : 'Nuevo Mundo'}</h2>
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
              <div className="bg-blue-50 border border-blue-200 p-3 rounded">
                <p className="text-sm text-blue-800">💡 Para subir imágenes, usa la sección Biblioteca de Medios</p>
              </div>
              {editingWorld && (
                <div className="flex items-center">
                  <input type="checkbox" id="isActive" checked={(formData as UpdateWorldDto).isActive ?? true} onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })} className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded" />
                  <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">Mundo activo</label>
                </div>
              )}
              {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">{error}</div>}
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">Cancelar</button>
                <button type="submit" className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700">{editingWorld ? 'Actualizar' : 'Crear'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
