'use client';

import { useState } from 'react';
import { MdList, MdVisibility, MdLink, MdOpenInNew, MdDelete } from 'react-icons/md';
import { MediaFile } from '@/app/services/api';
import MediaPreviewModal from './MediaPreviewModal';

interface MediaCardProps {
  item: MediaFile;
  onDelete: (id: string) => void;
  onCopyLink: (url: string) => void;
  isDeleting?: boolean;
}

const getFileTypeIcon = (type: string, mimeType?: string): JSX.Element => {
  if (type === 'image') {
    return <span className="text-4xl">🖼️</span>;
  } else if (type === 'video') {
    return <span className="text-4xl">🎬</span>;
  } else if (type === 'audio') {
    return <span className="text-4xl">🔊</span>;
  } else if (type === 'document') {
    if (mimeType?.includes('pdf')) return <span className="text-4xl">📄</span>;
    if (mimeType?.includes('word') || mimeType?.includes('document')) return <span className="text-4xl"><MdList size={40} /></span>;
    if (mimeType?.includes('sheet') || mimeType?.includes('excel')) return <span className="text-4xl">📊</span>;
    if (mimeType?.includes('presentation') || mimeType?.includes('powerpoint')) return <span className="text-4xl">📽️</span>;
    return <span className="text-4xl">📎</span>;
  }
  return <span className="text-4xl">📁</span>;
};

const formatFileSize = (bytes?: number): string => {
  if (!bytes) return '';
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(2)} KB`;
  const mb = kb / 1024;
  return `${mb.toFixed(2)} MB`;
};

interface TooltipState {
  [key: string]: boolean;
}

export default function MediaCard({ 
  item, 
  onDelete, 
  onCopyLink,
  isDeleting = false 
}: MediaCardProps) {
  const [showPreview, setShowPreview] = useState(false);
  const [tooltips, setTooltips] = useState<TooltipState>({});

  const handleDelete = async () => {
    if (confirm('¿Estás seguro de que deseas eliminar este archivo?')) {
      onDelete(item.id);
    }
  };

  const handleCopyLink = () => {
    onCopyLink(item.url);
  };

  const handleOpenInNewTab = () => {
    window.open(item.url, '_blank');
  };

  const toggleTooltip = (key: string) => {
    setTooltips(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const hideAllTooltips = () => {
    setTooltips({});
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
        {/* Thumbnail */}
        <div className="relative h-48 bg-surface-100 flex items-center justify-center group overflow-hidden">
          {item.type === 'image' ? (
            <button
              onClick={() => setShowPreview(true)}
              className="w-full h-full overflow-hidden cursor-pointer"
            >
              <img
                src={item.url}
                alt={item.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
                <span className="text-white text-opacity-0 group-hover:text-opacity-100 transition-all font-semibold">
                  Previsualizar
                </span>
              </div>
            </button>
          ) : (
            <button
              onClick={() => setShowPreview(true)}
              className="flex flex-col items-center gap-2 hover:scale-110 transition-transform"
            >
              {getFileTypeIcon(item.type, item.mimeType)}
            </button>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="font-semibold text-secondary-800 truncate mb-2 text-sm">
            {item.name}
          </h3>
          
          <div className="flex items-center justify-between mb-3">
            <span className="inline-block bg-primary-100 text-primary-800 text-xs px-2 py-1 rounded capitalize">
              {item.type}
            </span>
            {item.fileSize && (
              <span className="text-xs text-surface-500">
                {formatFileSize(item.fileSize)}
              </span>
            )}
          </div>

          <p className="text-xs text-surface-500 mb-4">
            {new Date(item.createdAt).toLocaleDateString('es-ES')}
          </p>

          {/* Action Icons */}
          <div className="flex gap-2 justify-center relative" onMouseLeave={hideAllTooltips}>
            {/* Preview Button */}
            <div className="relative group">
              <button
                onClick={() => setShowPreview(true)}
                title="Ver / Previsualizar"
                className="p-2 rounded-lg bg-surface-100 text-surface-700 hover:bg-primary-100 hover:text-primary-600 transition-colors"
              >
                <MdVisibility size={20} />
              </button>
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity">
                Previsualizar
              </div>
            </div>

            {/* Copy Link Button */}
            <div className="relative group">
              <button
                onClick={handleCopyLink}
                title="Copiar enlace"
                className="p-2 rounded-lg bg-surface-100 text-surface-700 hover:bg-primary-100 hover:text-primary-600 transition-colors"
              >
                <MdLink size={20} />
              </button>
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity">
                Copiar enlace
              </div>
            </div>

            {/* Open in New Tab Button */}
            <div className="relative group">
              <button
                onClick={handleOpenInNewTab}
                title="Abrir en nueva ventana"
                className="p-2 rounded-lg bg-surface-100 text-surface-700 hover:bg-primary-100 hover:text-primary-600 transition-colors"
              >
                <MdOpenInNew size={20} />
              </button>
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity">
                Abrir en nueva ventana
              </div>
            </div>

            {/* Delete Button */}
            <div className="relative group">
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                title="Eliminar"
                className="p-2 rounded-lg bg-surface-100 text-surface-700 hover:bg-accent-100 hover:text-accent-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <MdDelete size={20} />
              </button>
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity">
                Eliminar
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      <MediaPreviewModal
        item={item}
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
      />
    </>
  );
}
