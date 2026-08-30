'use client';

import { MediaFile } from '@/app/services/api';

interface MediaPreviewModalProps {
  item: MediaFile;
  isOpen: boolean;
  onClose: () => void;
}

export default function MediaPreviewModal({ 
  item, 
  isOpen, 
  onClose 
}: MediaPreviewModalProps) {
  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      onClick={handleBackdropClick}
      className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
    >
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold text-gray-800 truncate">
            {item.name}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-6 flex flex-col items-center justify-center">
          {item.type === 'image' && (
            <img
              src={item.url}
              alt={item.name}
              className="max-w-full max-h-[60vh] object-contain rounded"
            />
          )}

          {item.type === 'video' && (
            <video
              src={item.url}
              controls
              className="max-w-full max-h-[60vh] rounded"
            />
          )}

          {item.type === 'audio' && (
            <div className="w-full max-w-md">
              <audio
                src={item.url}
                controls
                className="w-full"
              />
            </div>
          )}

          {item.type === 'document' && (
            <div className="text-center">
              <div className="text-6xl mb-4">
                {item.mimeType?.includes('pdf') && '📄'}
                {item.mimeType?.includes('word') && '<span className="material-icons">lists</span>'}
                {item.mimeType?.includes('sheet') && '📊'}
                {item.mimeType?.includes('presentation') && '📽️'}
                {!item.mimeType?.includes('pdf') && 
                 !item.mimeType?.includes('word') && 
                 !item.mimeType?.includes('sheet') && 
                 !item.mimeType?.includes('presentation') && '📎'}
              </div>
              <p className="text-gray-600 mb-4">Documento: {item.name}</p>
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              >
                📥 Descargar
              </a>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t p-6 bg-gray-50">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-gray-500">Tipo</p>
              <p className="font-semibold text-gray-800 capitalize">{item.type}</p>
            </div>
            {item.fileSize && (
              <div>
                <p className="text-gray-500">Tamaño</p>
                <p className="font-semibold text-gray-800">
                  {(item.fileSize / (1024 * 1024)).toFixed(2)} MB
                </p>
              </div>
            )}
            {item.mimeType && (
              <div>
                <p className="text-gray-500">MIME Type</p>
                <p className="font-semibold text-gray-800 text-xs">{item.mimeType}</p>
              </div>
            )}
            <div>
              <p className="text-gray-500">Subido</p>
              <p className="font-semibold text-gray-800">
                {new Date(item.createdAt).toLocaleDateString('es-ES')}
              </p>
            </div>
          </div>

          <div className="mt-6 flex gap-3">
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-center"
            >
              🔗 Abrir en nueva ventana
            </a>
            <button
              onClick={() => {
                navigator.clipboard.writeText(item.url);
                alert('Enlace copiado al portapapeles');
              }}
              className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors"
            >
              <span className="material-icons">lists</span> Copiar enlace
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
