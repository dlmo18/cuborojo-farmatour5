'use client';

import { useEffect, useState } from 'react';
import { MdDelete, MdVisibility } from 'react-icons/md';
import { messagesApi, Message } from '@/app/services/api';

export default function MensajesPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Detail modal state
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);

  // Load messages
  const loadMessages = async (page: number = 1) => {
    try {
      setIsLoading(true);
      setError('');
      const response = await messagesApi.getAll({ page, limit: 10 });
      setMessages(response.data.data);
      setTotalPages(response.data.totalPages);
      setTotalItems(response.data.total);
      setCurrentPage(page);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error cargando mensajes';
      setError(errorMessage);
      console.error('Error loading messages:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadMessages(1);
  }, []);

  const handlePageChange = (page: number) => {
    loadMessages(page);
  };

  const handleViewDetail = (message: Message) => {
    setSelectedMessage(message);
    setShowDetailModal(true);
  };

  const handleCloseDetail = () => {
    setShowDetailModal(false);
    setSelectedMessage(null);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Está seguro de que desea eliminar este mensaje?')) {
      return;
    }

    try {
      setError('');
      await messagesApi.delete(id);
      setSuccessMessage('Mensaje eliminado correctamente');
      setTimeout(() => setSuccessMessage(''), 3000);
      await loadMessages(currentPage);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error eliminando mensaje';
      setError(errorMessage);
      setTimeout(() => setError(''), 5000);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-secondary-900 mb-2">
          💬 Mensajes
        </h1>
        <p className="text-surface-600">
          Total: {totalItems} mensajes
        </p>
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

      {/* Detail Modal */}
      {showDetailModal && selectedMessage && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full">
            <div className="bg-secondary-900 text-white px-6 py-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold">Detalle del Mensaje</h2>
              <button
                onClick={handleCloseDetail}
                className="text-2xl font-bold hover:bg-secondary-800 w-10 h-10 flex items-center justify-center rounded transition"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-secondary-900 mb-1">
                  Remitente
                </label>
                <p className="text-surface-700">{selectedMessage.fullName}</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-secondary-900 mb-1">
                  Correo Electrónico
                </label>
                <p className="text-surface-700 break-all">{selectedMessage.email}</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-secondary-900 mb-1">
                  Asunto
                </label>
                <p className="text-surface-700">{selectedMessage.subject}</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-secondary-900 mb-1">
                  Fecha
                </label>
                <p className="text-surface-700">{formatDate(selectedMessage.createdAt)}</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-secondary-900 mb-1">
                  Mensaje
                </label>
                <div className="bg-surface-50 rounded-lg p-4 border border-surface-200">
                  <p className="text-surface-700 whitespace-pre-wrap">{selectedMessage.message}</p>
                </div>
              </div>

              <div className="flex justify-end gap-4 pt-4 border-t">
                <button
                  onClick={handleCloseDetail}
                  className="px-4 py-2 bg-surface-200 text-surface-700 rounded-lg hover:bg-surface-300 transition font-semibold"
                >
                  Cerrar
                </button>
              </div>
            </div>
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
                  <th className="px-6 py-3 text-left text-sm font-semibold">Fecha</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Usuario</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Asunto</th>
                  <th className="px-6 py-3 text-center text-sm font-semibold">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {messages.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-surface-500">
                      No hay mensajes aún.
                    </td>
                  </tr>
                ) : (
                  messages.map((message) => (
                    <tr key={message.id} className="hover:bg-surface-50">
                      <td className="px-6 py-4 text-sm text-surface-700">
                        {formatDate(message.createdAt)}
                      </td>
                      <td className="px-6 py-4 text-sm text-surface-700">
                        <div>
                          <p className="font-semibold">{message.fullName}</p>
                          <p className="text-xs text-surface-500">{message.email}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-surface-700 truncate max-w-xs">
                        {message.subject}
                      </td>
                      <td className="px-6 py-4 flex justify-center gap-2">
                        <button
                          onClick={() => handleViewDetail(message)}
                          className="p-2 bg-primary-100 text-primary-600 rounded hover:bg-primary-200 transition"
                          title="Ver detalle"
                        >
                          <MdVisibility size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(message.id)}
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
