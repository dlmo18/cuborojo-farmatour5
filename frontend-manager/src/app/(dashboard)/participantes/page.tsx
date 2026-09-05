'use client';

import { useState, useEffect, useRef } from 'react';
import DataTable, { Column } from '@/app/components/DataTable';
import Pagination from '@/app/components/Pagination';
import SearchBar from '@/app/components/SearchBar';
import ToggleSwitch from '@/app/components/ToggleSwitch';
import { participantsApi, groupsApi, Participant, Group, CreateParticipantDto, UpdateParticipantDto } from '@/app/services/api';

export default function ParticipantsPage() {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingParticipant, setEditingParticipant] = useState<Participant | null>(null);
  const [formData, setFormData] = useState<CreateParticipantDto | UpdateParticipantDto>({
    dni: '',
    fullName: '',
    email: '',
    groupId: '',
  });
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importing, setImporting] = useState(false);

  useEffect(() => {
    fetchParticipants();
    fetchGroups();
  }, [currentPage, itemsPerPage, searchTerm]);

  const fetchParticipants = async () => {
    try {
      setLoading(true);
      const response = await participantsApi.getAll({ page: currentPage, limit: itemsPerPage, search: searchTerm });
      setParticipants(response.data.data);
      setTotalPages(response.data.totalPages);
      setTotalItems(response.data.total);
    } catch (err: any) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchGroups = async () => {
    try {
      const response = await groupsApi.getAll({ limit: 1000 });
      setGroups(response.data.data);
    } catch (err) {
      console.error('Error al cargar grupos:', err);
    }
  };

  const handleCreate = () => {
    setEditingParticipant(null);
    setFormData({ dni: '', fullName: '', email: '', groupId: '' });
    setShowModal(true);
    setError('');
  };

  const handleEdit = (participant: Participant) => {
    setEditingParticipant(participant);
    setFormData({ dni: participant.dni, fullName: participant.fullName, email: participant.email, groupId: participant.groupId, isActive: participant.isActive });
    setShowModal(true);
    setError('');
  };

  const handleDelete = async (participant: Participant) => {
    if (!confirm(`¿Eliminar participante \"${participant.fullName}\"?`)) return;
    try {
      await participantsApi.delete(participant.id);
      fetchParticipants();
    } catch (err: any) {
      alert('Error: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      if (editingParticipant) {
        await participantsApi.update(editingParticipant.id, formData as UpdateParticipantDto);
      } else {
        await participantsApi.create(formData as CreateParticipantDto);
      }
      setShowModal(false);
      fetchParticipants();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al guardar');
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImporting(true);
    try {
      await participantsApi.import(file);
      alert('Participantes importados exitosamente');
      fetchParticipants();
    } catch (err: any) {
      alert('Error al importar: ' + (err.response?.data?.message || err.message));
    } finally {
      setImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const columns: Column<Participant>[] = [
    { key: 'dni', label: 'DNI' },
    { key: 'fullName', label: 'Nombre' },
    { key: 'email', label: 'Correo' },
    { key: 'group.name', label: 'Grupo', render: (_, item) => item.group?.name || '-' },
    { key: 'totalStars', label: 'Estrellas', render: (value) => `⭐ ${value}` },
    { key: 'isActive', label: 'Estado', render: (value) => <span className={`px-2 py-1 rounded-full text-xs font-semibold ${value ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{value ? 'Activo' : 'Inactivo'}</span> },
  ];

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold text-gray-800">👥 Participantes</h1>
        <div className="flex gap-3">
          <input ref={fileInputRef} type="file" accept=".csv,.xlsx,.xls" onChange={handleImport} className="hidden" />
          <button onClick={() => fileInputRef.current?.click()} disabled={importing} className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg inline-flex items-center gap-2">
            <span className="material-icons" style={{ fontSize: '20px' }}>upload</span>
            {importing ? 'Importando...' : 'Importar CSV/Excel'}
          </button>
          <button onClick={handleCreate} className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2 rounded-lg inline-flex items-center gap-2">
            <span className="material-icons" style={{ fontSize: '20px' }}>add</span>
            Nuevo Participante
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <SearchBar value={searchTerm} onChange={setSearchTerm} placeholder="Buscar por DNI, nombre o correo..." />
        </div>
        <DataTable columns={columns} data={participants} loading={loading} onEdit={handleEdit} onDelete={handleDelete} />
        <Pagination currentPage={currentPage} totalPages={totalPages} totalItems={totalItems} itemsPerPage={itemsPerPage} onPageChange={setCurrentPage} onItemsPerPageChange={setItemsPerPage} />
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-2xl font-bold mb-6 text-black">{editingParticipant ? 'Editar Participante' : 'Nuevo Participante'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">DNI *</label>
                <input type="text" required value={(formData as CreateParticipantDto).dni || ''} onChange={(e) => setFormData({ ...formData, dni: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nombre Completo *</label>
                <input type="text" required value={formData.fullName || ''} onChange={(e) => setFormData({ ...formData, fullName: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Correo</label>
                <input type="email" value={formData.email || ''} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Grupo</label>
                <select value={formData.groupId || ''} onChange={(e) => setFormData({ ...formData, groupId: e.target.value || undefined })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500">
                  <option value="">Sin grupo</option>
                  {groups.map(group => <option key={group.id} value={group.id}>{group.name}</option>)}
                </select>
              </div>
              {editingParticipant && (
                <ToggleSwitch
                  id="isActive"
                  checked={(formData as UpdateParticipantDto).isActive ?? true}
                  onChange={(checked) => setFormData({ ...formData, isActive: checked })}
                  label="Participante activo"
                />
              )}
              {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">{error}</div>}
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">Cancelar</button>
                <button type="submit" className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700">{editingParticipant ? 'Actualizar' : 'Crear'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
