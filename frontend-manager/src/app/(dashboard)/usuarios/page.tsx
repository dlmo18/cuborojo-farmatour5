'use client';

import { useState, useEffect } from 'react';
import DataTable, { Column } from '@/app/components/DataTable';
import Pagination from '@/app/components/Pagination';
import SearchBar from '@/app/components/SearchBar';
import { usersApi, SystemUser, CreateUserDto, UpdateUserDto } from '@/app/services/api';

export default function UsersPage() {
  const [users, setUsers] = useState<SystemUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<SystemUser | null>(null);
  const [formData, setFormData] = useState<CreateUserDto | UpdateUserDto>({
    username: '',
    email: '',
    password: '',
    fullName: '',
    role: 'reporter',
  });
  const [error, setError] = useState('');

  useEffect(() => {
    fetchUsers();
  }, [currentPage, itemsPerPage, searchTerm]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await usersApi.getAll({
        page: currentPage,
        limit: itemsPerPage,
        search: searchTerm,
      });
      setUsers(response.data.data);
      setTotalPages(response.data.totalPages);
      setTotalItems(response.data.total);
    } catch (err: any) {
      console.error('Error al cargar usuarios:', err);
      setError('Error al cargar los usuarios');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingUser(null);
    setFormData({
      username: '',
      email: '',
      password: '',
      fullName: '',
      role: 'reporter',
    });
    setShowModal(true);
    setError('');
  };

  const handleEdit = (user: SystemUser) => {
    setEditingUser(user);
    setFormData({
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      isActive: user.isActive,
    });
    setShowModal(true);
    setError('');
  };

  const handleDelete = async (user: SystemUser) => {
    if (!confirm(`¿Estás seguro de eliminar el usuario "${user.username}"?`)) {
      return;
    }

    try {
      await usersApi.delete(user.id);
      fetchUsers();
    } catch (err: any) {
      alert('Error al eliminar el usuario: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      if (editingUser) {
        await usersApi.update(editingUser.id, formData as UpdateUserDto);
      } else {
        await usersApi.create(formData as CreateUserDto);
      }
      setShowModal(false);
      fetchUsers();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al guardar el usuario');
    }
  };

  const columns: Column<SystemUser>[] = [
    { key: 'username', label: 'Usuario' },
    { key: 'email', label: 'Correo' },
    { key: 'fullName', label: 'Nombre Completo' },
    {
      key: 'role',
      label: 'Rol',
      render: (value) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-semibold ${
            value === 'manager'
              ? 'bg-purple-100 text-purple-800'
              : 'bg-blue-100 text-blue-800'
          }`}
        >
          {value === 'manager' ? 'Administrador' : 'Reportero'}
        </span>
      ),
    },
    {
      key: 'isActive',
      label: 'Estado',
      render: (value) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-semibold ${
            value ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}
        >
          {value ? 'Activo' : 'Inactivo'}
        </span>
      ),
    },
  ];

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold text-gray-800">👤 Usuarios del Sistema</h1>
        <button
          onClick={handleCreate}
          className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2 rounded-lg inline-flex items-center gap-2 transition-colors"
        >
          <span className="material-icons" style={{ fontSize: '20px' }}>add</span>
          Nuevo Usuario
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Barra de búsqueda */}
        <div className="p-6 border-b border-gray-200">
          <SearchBar
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Buscar por usuario, correo o nombre..."
          />
        </div>

        {/* Tabla */}
        <DataTable
          columns={columns}
          data={users}
          loading={loading}
          onEdit={handleEdit}
          onDelete={handleDelete}
          emptyMessage="No se encontraron usuarios"
        />

        {/* Paginación */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
          onItemsPerPageChange={setItemsPerPage}
        />
      </div>

      {/* Modal de crear/editar */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-2xl font-bold mb-6 text-black">
              {editingUser ? 'Editar Usuario' : 'Nuevo Usuario'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              {!editingUser && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Usuario *
                  </label>
                  <input
                    type="text"
                    required
                    value={(formData as CreateUserDto).username || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, username: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Correo *
                </label>
                <input
                  type="email"
                  required
                  value={formData.email || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre Completo
                </label>
                <input
                  type="text"
                  value={formData.fullName || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, fullName: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contraseña {!editingUser && '*'}
                </label>
                <input
                  type="password"
                  required={!editingUser}
                  value={formData.password || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  placeholder={editingUser ? 'Dejar en blanco para no cambiar' : ''}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rol *
                </label>
                <select
                  required
                  value={formData.role || 'reporter'}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      role: e.target.value as 'manager' | 'reporter',
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="reporter">Reportero</option>
                  <option value="manager">Administrador</option>
                </select>
              </div>

              {editingUser && (
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={(formData as UpdateUserDto).isActive ?? true}
                    onChange={(e) =>
                      setFormData({ ...formData, isActive: e.target.checked })
                    }
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
                    Usuario activo
                  </label>
                </div>
              )}

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                  {error}
                </div>
              )}

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
                  {editingUser ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
