'use client';

import { useState, useEffect, useRef } from 'react';
import DataTable, { Column } from '@/app/components/DataTable';
import Pagination from '@/app/components/Pagination';
import SearchBar from '@/app/components/SearchBar';
import ToggleSwitch from '@/app/components/ToggleSwitch';
import { participantsApi, groupsApi, Participant, Group, CreateParticipantDto, UpdateParticipantDto } from '@/app/services/api';
import { downloadParticipantTemplate, getTemplateDescription } from '@/app/utils/participantTemplateGenerator';
import { parseCSVFile, validateImportRow, findOrCreateGroup, findParticipantByDNI, ImportResult, ImportRow } from '@/app/utils/participantImportProcessor';

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
  const [formData, setFormData] = useState<Partial<CreateParticipantDto> & { isActive?: boolean }>({
    dni: '',
    fullName: '',
    email: '',
    groupId: '',
  });
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importing, setImporting] = useState(false);
  const [showTemplateInfo, setShowTemplateInfo] = useState(false);
  const [showImportResults, setShowImportResults] = useState(false);
  const [importResults, setImportResults] = useState<ImportResult | null>(null);

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
    setFormData({ fullName: participant.fullName, email: participant.email, groupId: participant.groupId, isActive: participant.isActive });
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
        // Validar que el DNI no haya cambiado
        const dniValue = (formData as any).dni || '';
        if (dniValue && dniValue !== editingParticipant.dni) {
          setError('No se puede cambiar el DNI de un participante existente');
          return;
        }
        
        // No enviar DNI en actualización (el backend no lo acepta)
        const updateData: UpdateParticipantDto = {
          fullName: formData.fullName,
          email: formData.email,
          groupId: formData.groupId,
          isActive: formData.isActive,
        };
        await participantsApi.update(editingParticipant.id, updateData);
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
      // Parsear CSV
      const rows = await parseCSVFile(file);
      console.log(`Procesando ${rows.length} filas`);

      const results: ImportResult = {
        successful: 0,
        updated: 0,
        errors: [],
        groupsCreated: 0,
        groupsAssociated: 0,
      };

      // Actualizar grupos locales conforme se crean
      let localGroups = [...groups];

      // Procesar cada fila
      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        const rowNumber = i + 2; // +2 porque la fila 1 es header y empieza en 1

        // Validar
        const validation = validateImportRow(row, rowNumber);
        if (!validation.valid) {
          results.errors.push({
            row: rowNumber,
            dni: row.dni,
            fullName: row.fullName,
            error: validation.error || 'Error desconocido',
          });
          continue;
        }

        try {
          // Resolver GroupId (puede ser UUID o nombre)
          let resolvedGroupId: string | undefined = undefined;
          if (row.groupId && row.groupId.trim()) {
            const groupResult = await findOrCreateGroup(
              row.groupId,
              localGroups,
              async (name) => {
                const newGroup = await groupsApi.create({ name });
                localGroups.push(newGroup.data);
                results.groupsCreated++;
                return newGroup.data;
              }
            );

            if (groupResult.error) {
              results.errors.push({
                row: rowNumber,
                dni: row.dni,
                fullName: row.fullName,
                error: groupResult.error,
              });
              continue;
            }

            if (groupResult.groupId) {
              resolvedGroupId = groupResult.groupId;
              if (!groupResult.created) {
                results.groupsAssociated++;
              }
            }
          }

          // Buscar participante existente por DNI
          const existingParticipant = await findParticipantByDNI(
            row.dni,
            participantsApi.getAll
          );

          if (existingParticipant) {
            // Actualizar
            const updateData: UpdateParticipantDto = {
              fullName: row.fullName,
              email: row.email || existingParticipant.email,
              groupId: resolvedGroupId !== undefined ? resolvedGroupId : existingParticipant.groupId,
            };
            await participantsApi.update(existingParticipant.id, updateData);
            results.updated++;
          } else {
            // Crear
            const createData: CreateParticipantDto = {
              dni: row.dni,
              fullName: row.fullName,
              email: row.email,
              groupId: resolvedGroupId,
            };
            await participantsApi.create(createData);
            results.successful++;
          }
        } catch (error: any) {
          results.errors.push({
            row: rowNumber,
            dni: row.dni,
            fullName: row.fullName,
            error: error.response?.data?.message || error.message || 'Error desconocido',
          });
        }
      }

      // Mostrar resultados
      setImportResults(results);
      setShowImportResults(true);

      // Recargar participantes
      setTimeout(() => {
        fetchParticipants();
        fetchGroups();
      }, 500);
    } catch (err: any) {
      alert('Error al procesar el archivo: ' + (err.message || err));
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
          <button onClick={() => setShowTemplateInfo(true)} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg inline-flex items-center gap-2">
            <span className="material-icons" style={{ fontSize: '20px' }}>info</span>
            Ver Plantilla
          </button>
          <button onClick={() => downloadParticipantTemplate()} className="bg-yellow-600 hover:bg-yellow-700 text-white px-6 py-2 rounded-lg inline-flex items-center gap-2">
            <span className="material-icons" style={{ fontSize: '20px' }}>download</span>
            Descargar Plantilla
          </button>
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
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  DNI {!editingParticipant && '*'}
                </label>
                <input 
                  type="text" 
                  required={!editingParticipant}
                  value={(formData as CreateParticipantDto).dni || ''} 
                  onChange={(e) => !editingParticipant && setFormData({ ...formData, dni: e.target.value })}
                  disabled={!!editingParticipant}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${editingParticipant ? 'bg-gray-100 text-gray-600 cursor-not-allowed' : ''}`}
                />
                {editingParticipant && (
                  <p className="text-xs text-gray-500 mt-1">El DNI no puede ser modificado</p>
                )}
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

      {showTemplateInfo && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6 max-h-96 overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4 text-black">{getTemplateDescription().title}</h2>
            <p className="text-gray-600 mb-6">{getTemplateDescription().description}</p>
            
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3 text-gray-800">Columnas del archivo CSV:</h3>
              <div className="space-y-3">
                {getTemplateDescription().columns.map((column) => (
                  <div key={column.name} className="border-l-4 border-blue-500 pl-4">
                    <div className="flex items-center gap-2 mb-1">
                      <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono text-gray-800">{column.name}</code>
                      {column.required ? (
                        <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded">REQUERIDO</span>
                      ) : (
                        <span className="text-xs font-bold text-gray-500 bg-gray-100 px-2 py-1 rounded">OPCIONAL</span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">{column.description}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-blue-900 mb-2">📝 Ejemplo de contenido:</h3>
              <pre className="bg-white p-3 rounded border border-blue-200 text-xs overflow-x-auto text-gray-700">
{`dni,fullName,email,groupId
12345678,"Juan Pérez García",juan.perez@example.com,
87654321,"María González López",maria.gonzalez@example.com,
11223344,"Carlos Rodríguez Martínez",carlos.rodriguez@example.com,`}
              </pre>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-yellow-900 mb-2">⚠️ Notas importantes:</h3>
              <ul className="text-sm text-yellow-800 list-disc list-inside space-y-1">
                <li>El DNI debe ser único para cada participante</li>
                <li>El nombre completo y DNI son obligatorios</li>
                <li>El email y groupId son opcionales (dejar vacío si no se asignan)</li>
                <li>Los nombres con comas deben ir entre comillas dobles</li>
                <li>Guardar el archivo en formato CSV (comma-separated values)</li>
              </ul>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setShowTemplateInfo(false)} className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">Cerrar</button>
              <button onClick={() => { downloadParticipantTemplate(); setShowTemplateInfo(false); }} className="flex-1 px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 inline-flex items-center justify-center gap-2">
                <span className="material-icons" style={{ fontSize: '20px' }}>download</span>
                Descargar Plantilla
              </button>
            </div>
          </div>
        </div>
      )}

      {showImportResults && importResults && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6 max-h-96 overflow-y-auto">
            <h2 className="text-2xl font-bold mb-6 text-black">📊 Resumen de Importación</h2>

            {/* Estadísticas principales */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-green-600">{importResults.successful}</p>
                <p className="text-xs text-green-800">Creados</p>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-blue-600">{importResults.updated}</p>
                <p className="text-xs text-blue-800">Actualizados</p>
              </div>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-yellow-600">{importResults.groupsCreated}</p>
                <p className="text-xs text-yellow-800">Grupos Creados</p>
              </div>
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-purple-600">{importResults.groupsAssociated}</p>
                <p className="text-xs text-purple-800">Grupos Asociados</p>
              </div>
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-red-600">{importResults.errors.length}</p>
                <p className="text-xs text-red-800">Errores</p>
              </div>
            </div>

            {/* Resumen general */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-700">
                <strong>Total procesado:</strong> {importResults.successful + importResults.updated + importResults.errors.length} registros
              </p>
              <p className="text-sm text-gray-700 mt-2">
                <strong>Tasa de éxito:</strong>{' '}
                {Math.round(((importResults.successful + importResults.updated) / (importResults.successful + importResults.updated + importResults.errors.length)) * 100)}%
              </p>
            </div>

            {/* Errores si existen */}
            {importResults.errors.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <h3 className="font-semibold text-red-900 mb-3">⚠️ Errores encontrados ({importResults.errors.length}):</h3>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {importResults.errors.slice(0, 10).map((err, idx) => (
                    <div key={idx} className="bg-white border border-red-200 rounded p-2 text-xs">
                      <p className="font-semibold text-red-900">
                        Fila {err.row}: {err.dni} - {err.fullName}
                      </p>
                      <p className="text-red-700">{err.error}</p>
                    </div>
                  ))}
                  {importResults.errors.length > 10 && (
                    <p className="text-xs text-red-600 font-semibold">
                      ... y {importResults.errors.length - 10} errores más
                    </p>
                  )}
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowImportResults(false);
                  setImportResults(null);
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cerrar
              </button>
              <button
                onClick={() => {
                  setShowImportResults(false);
                  setImportResults(null);
                  fileInputRef.current?.click();
                }}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Importar Otro Archivo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
