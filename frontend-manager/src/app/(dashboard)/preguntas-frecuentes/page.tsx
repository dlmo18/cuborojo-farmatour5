'use client';

import { useEffect, useState } from 'react';
import { MdEdit, MdDelete, MdAdd } from 'react-icons/md';
import { faqApi, FaqItem } from '@/app/services/api';
import DataTable from '@/app/components/DataTable';

interface FaqFormData {
  id?: string;
  title: string;
  detail: string;
  orderNum: number;
}

export default function PreguntasFrecuentesPage() {
  const [items, setItems] = useState<FaqItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Form state
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<FaqFormData>({
    title: '',
    detail: '',
    orderNum: 0,
  });

  // Load FAQ items
  const loadItems = async (page: number = 1) => {
    try {
      setIsLoading(true);
      setError('');
      const response = await faqApi.getAll({ page, limit: 10 });
      setItems(response.data.data);
      setTotalPages(response.data.totalPages);
      setTotalItems(response.data.total);
      setCurrentPage(page);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error cargando preguntas';
      setError(errorMessage);
      console.error('Error loading items:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadItems(1);
  }, []);

  const handlePageChange = (page: number) => {
    loadItems(page);
  };

  const handleOpenForm = (item?: FaqItem) => {
    if (item) {
      setEditingId(item.id);
      setFormData({
        id: item.id,
        title: item.title,
        detail: item.detail,
        orderNum: item.orderNum,
      });
    } else {
      setEditingId(null);
      setFormData({
        title: '',
        detail: '',
        orderNum: items.length + 1,
      });
    }
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({
      title: '',
      detail: '',
      orderNum: 0,
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'orderNum' ? parseInt(value) : value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim() || !formData.detail.trim()) {
      setError('Todos los campos son requeridos');
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');

      if (editingId) {
        await faqApi.update(editingId, {
          title: formData.title,
          detail: formData.detail,
          orderNum: formData.orderNum,
        });
        setSuccessMessage('Pregunta actualizada correctamente');
      } else {
        await faqApi.create({
          title: formData.title,
          detail: formData.detail,
          orderNum: formData.orderNum,
        });
        setSuccessMessage('Pregunta agregada correctamente');
      }

      setTimeout(() => setSuccessMessage(''), 3000);
      handleCloseForm();
      await loadItems(currentPage);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error guardando pregunta';
      setError(errorMessage);
      setTimeout(() => setError(''), 5000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Está seguro de que desea eliminar esta pregunta?')) {
      return;
    }

    try {
      setError('');
      await faqApi.delete(id);
      setSuccessMessage('Pregunta eliminada correctamente');
      setTimeout(() => setSuccessMessage(''), 3000);
      await loadItems(currentPage);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error eliminando pregunta';
      setError(errorMessage);
      setTimeout(() => setError(''), 5000);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold text-secondary-900 mb-2">
            ❓ FAQ
          </h1>
          <p className="text-surface-600">
            Total: {totalItems} preguntas
          </p>
        </div>
        <button
          onClick={() => handleOpenForm()}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition font-semibold"
        >
          <MdAdd size={20} /> Agregar Pregunta
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-accent-100 border border-accent-300 rounded-lg">
          <p className="text-accent-800 font-semibold">⚠️ Error</p>
          <p className="text-accent-700 text-sm">{error}</p>
        </div>
      )}

      {/* Success Message */}
      {successMessage && (
        <div className="mb-6 p-4 bg-primary-100 border border-primary-300 rounded-lg">
          <p className="text-primary-800 font-semibold">✅ Éxito</p>
          <p className="text-primary-700 text-sm">{successMessage}</p>
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full mx-4 p-6">
            <h2 className="text-2xl font-bold text-secondary-900 mb-4">
              {editingId ? 'Editar Pregunta' : 'Agregar Pregunta'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-secondary-900 mb-2">
                  Título
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Ej: ¿Cómo puedo ganar más estrellas?"
                  className="w-full px-4 py-2 border border-surface-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-secondary-900 mb-2">
                  Detalle
                </label>
                <textarea
                  name="detail"
                  value={formData.detail}
                  onChange={handleInputChange}
                  placeholder="Ingresa la respuesta detallada..."
                  rows={4}
                  className="w-full px-4 py-2 border border-surface-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-secondary-900 mb-2">
                  Orden
                </label>
                <input
                  type="number"
                  name="orderNum"
                  value={formData.orderNum}
                  onChange={handleInputChange}
                  min="1"
                  className="w-full px-4 py-2 border border-surface-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div className="flex justify-end gap-4 pt-4">
                <button
                  type="button"
                  onClick={handleCloseForm}
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-surface-200 text-surface-700 rounded-lg hover:bg-surface-300 disabled:opacity-50 transition font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 transition font-semibold"
                >
                  {isSubmitting ? 'Guardando...' : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-secondary-900 border-r-transparent"></div>
            <p className="mt-4 text-surface-600">Cargando...</p>
          </div>
        </div>
      )}

      {/* Table */}
      {!isLoading && (
        <>
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-secondary-900 text-white">
                  <th className="px-6 py-3 text-left text-sm font-semibold">Orden</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Título</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {items.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-6 py-8 text-center text-surface-500">
                      No hay preguntas frecuentes aún. ¡Agrega la primera!
                    </td>
                  </tr>
                ) : (
                  items.map((item) => (
                    <tr key={item.id} className="hover:bg-surface-50">
                      <td className="px-6 py-4 text-sm text-surface-700">{item.orderNum}</td>
                      <td className="px-6 py-4 text-sm text-surface-700">{item.title}</td>
                      <td className="px-6 py-4 flex gap-2">
                        <button
                          onClick={() => handleOpenForm(item)}
                          className="p-2 bg-primary-100 text-primary-600 rounded hover:bg-primary-200 transition"
                          title="Editar"
                        >
                          <MdEdit size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="p-2 bg-accent-100 text-accent-600 rounded hover:bg-accent-200 transition"
                          title="Eliminar"
                        >
                          <MdDelete size={18} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-6 flex justify-center gap-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`px-4 py-2 rounded transition ${
                    currentPage === page
                      ? 'bg-primary-600 text-white font-semibold'
                      : 'bg-surface-200 text-surface-700 hover:bg-surface-300'
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
