'use client';

import { useEffect, useState } from 'react';
import { mediaApi, MediaFile } from '@/app/services/api';
import MediaUploadZone from '@/app/components/MediaUploadZone';
import MediaCard from '@/app/components/MediaCard';

export default function BibliotecaPage() {
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage] = useState(12);

  // Filters
  const [filterType, setFilterType] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchInput, setSearchInput] = useState('');

  // Load media files
  const loadMediaFiles = async (page: number, type?: string, search?: string) => {
    try {
      setIsLoading(true);
      setError('');
      const response = await mediaApi.getAll({
        page,
        limit: itemsPerPage,
        type: type || undefined,
        search: search || undefined,
      });
      setMediaFiles(response.data.data);
      setTotalPages(response.data.page || 1);
      setTotalItems(response.data.total);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error cargando archivos';
      setError(errorMessage);
      console.error('Error loading media:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Load on mount and when filters change
  useEffect(() => {
    loadMediaFiles(1, filterType, searchQuery);
    setCurrentPage(1);
  }, [filterType, searchQuery]);

  // Load on page change
  useEffect(() => {
    loadMediaFiles(currentPage, filterType, searchQuery);
  }, [currentPage]);

  const handleUploadSuccess = async (uploadedFiles: MediaFile[]) => {
    setSuccessMessage(`${uploadedFiles.length} archivo(s) subido(s) correctamente`);
    setTimeout(() => setSuccessMessage(''), 3000);
    
    // Reload media list
    await loadMediaFiles(1, filterType, searchQuery);
  };

  const handleUploadError = (errorMessage: string) => {
    setError(errorMessage);
    setTimeout(() => setError(''), 5000);
  };

  const handleDelete = async (id: string) => {
    try {
      setIsDeletingId(id);
      await mediaApi.delete(id);
      setSuccessMessage('Archivo eliminado correctamente');
      setTimeout(() => setSuccessMessage(''), 3000);
      
      // Reload media list
      await loadMediaFiles(currentPage, filterType, searchQuery);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error eliminando archivo';
      setError(errorMessage);
      setTimeout(() => setError(''), 5000);
    } finally {
      setIsDeletingId(null);
    }
  };

  const handleCopyLink = (url: string) => {
    navigator.clipboard.writeText(url).then(() => {
      setSuccessMessage('Enlace copiado al portapapeles');
      setTimeout(() => setSuccessMessage(''), 3000);
    }).catch(() => {
      setError('Error al copiar el enlace');
      setTimeout(() => setError(''), 3000);
    });
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchQuery(searchInput);
  };

  const handleClearFilters = () => {
    setFilterType('');
    setSearchQuery('');
    setSearchInput('');
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">📚 Biblioteca de Medios</h1>
        <p className="text-gray-600">
          Gestiona tu biblioteca de imágenes, videos, audio y documentos. 
          Sube, organiza y comparte tus archivos de forma segura.
        </p>
      </div>

      {/* Messages */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
          ❌ {error}
        </div>
      )}
      
      {successMessage && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg">
          ✅ {successMessage}
        </div>
      )}

      {/* Upload Zone */}
      <div className="mb-8 bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">📤 Subir Archivos</h2>
        <MediaUploadZone 
          onUploadSuccess={handleUploadSuccess}
          onUploadError={handleUploadError}
          isLoading={isUploading}
        />
      </div>

      {/* Filters and Search */}
      <div className="mb-8 bg-white rounded-lg shadow-md p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          {/* Search */}
          <form onSubmit={handleSearch} className="md:col-span-2">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Buscar por nombre..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                type="submit"
                className="px-6 py-2 flex items-center gap-2 bg-red-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
              >
                <span className="material-icons">search</span> Buscar
              </button>
            </div>
          </form>

          {/* Filter by Type */}
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Todos los tipos</option>
            <option value="image">🖼️ Imágenes</option>
            <option value="video">🎬 Videos</option>
            <option value="audio">🔊 Audio</option>
            <option value="document">📄 Documentos</option>
          </select>
        </div>

        {/* Clear Filters */}
        {(filterType || searchQuery) && (
          <button
            onClick={handleClearFilters}
            className="text-sm text-blue-600 hover:text-blue-700 underline"
          >
            Limpiar filtros
          </button>
        )}
      </div>

      {/* Stats */}
      <div className="mb-8 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="text-sm text-gray-600">Total de archivos</div>
          <div className="text-2xl font-bold text-gray-800">{totalItems}</div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="text-sm text-gray-600">Página actual</div>
          <div className="text-2xl font-bold text-gray-800">{currentPage} de {totalPages}</div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="text-sm text-gray-600">Archivos en página</div>
          <div className="text-2xl font-bold text-gray-800">{mediaFiles.length}</div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="text-sm text-gray-600">Filtro activo</div>
          <div className="text-xl font-bold text-gray-800">
            {filterType ? (
              <>
                {filterType === 'image' && '🖼️ Imágenes'}
                {filterType === 'video' && '🎬 Videos'}
                {filterType === 'audio' && '🔊 Audio'}
                {filterType === 'document' && '📄 Documentos'}
              </>
            ) : (
              <span className="text-gray-400">Ninguno</span>
            )}
          </div>
        </div>
      </div>

      {/* Media Grid */}
      <div className="mb-8">
        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
            <p className="mt-4 text-gray-600">Cargando biblioteca...</p>
          </div>
        ) : mediaFiles.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <p className="text-xl text-gray-600 mb-2">📭 No hay archivos</p>
            <p className="text-gray-500">
              {searchQuery || filterType 
                ? 'No se encontraron archivos que coincidan con los filtros seleccionados.'
                : 'Comienza subiendo tus primeros archivos utilizando el área de carga superior.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {mediaFiles.map((item) => (
              <MediaCard
                key={item.id}
                item={item}
                onDelete={handleDelete}
                onCopyLink={handleCopyLink}
                isDeleting={isDeletingId === item.id}
              />
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && !isLoading && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            ← Anterior
          </button>

          <div className="flex gap-2">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }
              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`px-3 py-2 rounded-lg transition-colors ${
                    currentPage === pageNum
                      ? 'bg-blue-600 text-white'
                      : 'border border-gray-300 hover:bg-gray-100'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>

          <button
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Siguiente →
          </button>
        </div>
      )}
    </div>
  );
}

