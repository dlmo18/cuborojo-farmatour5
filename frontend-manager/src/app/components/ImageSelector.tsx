'use client';

import { useState, useEffect, useRef } from 'react';
import { mediaApi, MediaFile } from '@/app/services/api';

interface ImageSelectorProps {
  selectedImageId?: string;
  onImageSelect: (imageId: string, imageUrl?: string) => void;
  label?: string;
  required?: boolean;
}

export default function ImageSelector({
  selectedImageId,
  onImageSelect,
  label = 'Imagen',
  required = false,
}: ImageSelectorProps) {
  const [showModal, setShowModal] = useState(false);
  const [images, setImages] = useState<MediaFile[]>([]);
  const [selectedImage, setSelectedImage] = useState<MediaFile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragActive, setIsDragActive] = useState(false);

  // Load images
  const loadImages = async (page: number = 1, search?: string) => {
    try {
      setIsLoading(true);
      setError('');
      const response = await mediaApi.getAll({
        page,
        limit: 12,
        type: 'image',
        search: search || undefined,
      });
      setImages(response.data.data);
      setTotalPages(response.data.page || 1);
    } catch (err) {
      setError('Error cargando imágenes');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Load initial image if selectedImageId is provided
  useEffect(() => {
    if (selectedImageId && !selectedImage) {
      loadSelectedImage();
    }
  }, [selectedImageId, selectedImage]);

  const loadSelectedImage = async () => {
    try {
      if (selectedImageId) {
        const response = await mediaApi.getById(selectedImageId);
        setSelectedImage(response.data);
      }
    } catch (err) {
      console.error('Error loading selected image:', err);
    }
  };

  // Load images when modal opens
  useEffect(() => {
    if (showModal) {
      loadImages(1);
    }
  }, [showModal]);

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
    loadImages(1, value);
  };

  const handleImageSelect = (image: MediaFile) => {
    setSelectedImage(image);
    onImageSelect(image.id, image.url);
    setShowModal(false);
  };

  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragActive(true);
    } else if (e.type === 'dragleave') {
      setIsDragActive(false);
    }
  };

  const processFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    try {
      setIsUploading(true);
      setError('');
      const fileArray = Array.from(files);

      if (fileArray.length === 1) {
        const response = await mediaApi.upload(fileArray[0]);
        const newImage = response.data;
        setSelectedImage(newImage);
        onImageSelect(newImage.id, newImage.url);
        setShowModal(false);
      } else {
        const response = await mediaApi.uploadMultiple(fileArray);
        // Select the first uploaded image
        if (response.data && response.data.length > 0) {
          const firstImage = response.data[0];
          setSelectedImage(firstImage);
          onImageSelect(firstImage.id, firstImage.url);
          setShowModal(false);
        }
      }

      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err) {
      setError('Error al subir imagen');
      console.error(err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    processFiles(e.dataTransfer.files);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    processFiles(e.target.files);
  };

  const handleRemoveImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedImage(null);
    onImageSelect('');
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label} {required && '*'}
      </label>

      {/* Selected Image Preview */}
      <div
        onClick={() => setShowModal(true)}
        className="relative w-full h-40 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 hover:border-gray-400 cursor-pointer flex items-center justify-center group overflow-hidden transition-all"
      >
        {selectedImage ? (
          <>
            <img
              src={selectedImage.url}
              alt={selectedImage.name}
              className="w-full h-full object-cover group-hover:opacity-75 transition-opacity"
            />
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all flex items-center justify-center">
              <button
                type="button"
                onClick={handleRemoveImage}
                className="bg-red-600 text-white px-3 py-1 rounded text-sm font-semibold hover:bg-red-700 transition-colors"
              >
                Cambiar
              </button>
            </div>
          </>
        ) : (
          <div className="text-center">
            <span className="material-icons text-4xl text-gray-400 mb-2">image</span>
            <p className="text-gray-600 font-semibold">Haz clic para seleccionar imagen</p>
            <p className="text-sm text-gray-500">o arrastra una imagen aquí</p>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-800">Seleccionar Imagen</h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <span className="material-icons">close</span>
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded">
                  {error}
                </div>
              )}

              {/* Upload Zone */}
              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                className={`relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors mb-6 ${
                  isDragActive
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-300 bg-gray-50 hover:border-gray-400'
                } ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  onChange={handleFileChange}
                  className="hidden"
                  disabled={isUploading}
                  accept="image/*"
                />

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="text-blue-600 hover:text-blue-700 font-semibold underline disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isUploading ? 'Subiendo...' : 'Haz clic aquí para subir una imagen'}
                </button>

                <p className="text-gray-600 mt-2">o arrastra y suelta una imagen en esta área</p>
              </div>

              {/* Search */}
              <div className="mb-6">
                <input
                  type="text"
                  placeholder="Buscar por nombre..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Loading */}
              {isLoading && (
                <div className="flex justify-center items-center h-32">
                  <span className="text-gray-500">Cargando imágenes...</span>
                </div>
              )}

              {/* Image Grid */}
              {!isLoading && (
                <>
                  {images.length > 0 ? (
                    <div className="grid grid-cols-3 gap-4 mb-4">
                      {images.map((image) => (
                        <button
                          key={image.id}
                          onClick={() => handleImageSelect(image)}
                          type="button"
                          className={`relative h-32 rounded-lg overflow-hidden border-2 transition-all hover:border-blue-500 ${
                            selectedImage?.id === image.id
                              ? 'border-blue-600 ring-2 ring-blue-400'
                              : 'border-gray-200'
                          }`}
                        >
                          <img
                            src={image.url}
                            alt={image.name}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-20 transition-all flex items-center justify-center">
                            {selectedImage?.id === image.id && (
                              <span className="material-icons text-white text-4xl">check_circle</span>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <span className="material-icons text-4xl text-gray-400 mb-2">image_not_supported</span>
                      <p className="text-gray-600">No hay imágenes disponibles</p>
                    </div>
                  )}

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex justify-center gap-2 mt-6">
                      <button
                        type="button"
                        onClick={() => {
                          setCurrentPage((p) => Math.max(1, p - 1));
                          loadImages(Math.max(1, currentPage - 1), searchTerm);
                        }}
                        disabled={currentPage === 1}
                        className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50"
                      >
                        Anterior
                      </button>
                      <span className="px-3 py-1 text-sm">
                        {currentPage} de {totalPages}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setCurrentPage((p) => Math.min(totalPages, p + 1));
                          loadImages(Math.min(totalPages, currentPage + 1), searchTerm);
                        }}
                        disabled={currentPage === totalPages}
                        className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50"
                      >
                        Siguiente
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-gray-200 p-6 flex justify-end">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 font-semibold"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
