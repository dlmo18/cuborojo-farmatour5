'use client';

import { useRef, useState } from 'react';
import { mediaApi } from '@/app/services/api';

interface MediaUploadZoneProps {
  onUploadSuccess: (files: any[]) => void;
  onUploadError: (error: string) => void;
  isLoading?: boolean;
}

export default function MediaUploadZone({ 
  onUploadSuccess, 
  onUploadError,
  isLoading = false 
}: MediaUploadZoneProps) {
  const [isDragActive, setIsDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      setUploadProgress(0);
      const fileArray = Array.from(files);
      
      if (fileArray.length === 1) {
        const response = await mediaApi.upload(fileArray[0]);
        onUploadSuccess([response.data]);
      } else {
        const response = await mediaApi.uploadMultiple(fileArray);
        onUploadSuccess(response.data);
      }
      
      setUploadProgress(0);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al subir archivos';
      onUploadError(errorMessage);
      setUploadProgress(0);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    processFiles(e.dataTransfer.files);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    processFiles(e.target.files);
  };

  return (
    <div
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
      className={`relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
        isDragActive
          ? 'border-primary-500 bg-primary-50'
          : 'border-surface-300 bg-surface-50 hover:border-surface-400'
      } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      <input
        ref={fileInputRef}
        type="file"
        multiple
        onChange={handleChange}
        className="hidden"
        disabled={isLoading}
        accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip"
      />
      
      <button
        onClick={() => fileInputRef.current?.click()}
        disabled={isLoading}
        className="text-primary-600 hover:text-primary-700 font-semibold underline disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Haz clic aquí para seleccionar archivos
      </button>
      
      <p className="text-surface-600 mt-2">o arrastra y suelta archivos en esta área</p>
      
      <p className="text-sm text-surface-500 mt-4">
        Formatos soportados: Imágenes (JPG, PNG, GIF, WebP), Videos (MP4, WebM), 
        Audio (MP3, WAV), Documentos (PDF, Word, Excel, PowerPoint)
      </p>
      
      <p className="text-xs text-surface-400 mt-2">
        Tamaño máximo por archivo: 10 MB
      </p>

      {uploadProgress > 0 && uploadProgress < 100 && (
        <div className="mt-4">
          <div className="w-full bg-surface-200 rounded-full h-2">
            <div
              className="bg-primary-600 h-2 rounded-full transition-all"
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>
          <p className="text-sm text-surface-600 mt-2">{uploadProgress}%</p>
        </div>
      )}
    </div>
  );
}
