'use client';

import { useState, useEffect } from 'react';
import { howToPlayApi, HowToPlay } from '@/services/api';

interface HowToPlayModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function HowToPlayModal({ isOpen, onClose }: HowToPlayModalProps) {
  const [content, setContent] = useState<HowToPlay | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadContent();
    }
  }, [isOpen]);

  const loadContent = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await howToPlayApi.get();
      setContent(response.data);
    } catch (err) {
      console.error('Error cargando contenido:', err);
      setError('No se pudo cargar el contenido. Por favor, intenta de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black bg-opacity-60 z-40"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="setting-modal max-w-lg w-full py-10 ">
            {/* Header */}
            <div className="sticky top-0 px-8 pb-4 flex justify-between items-center">
                <h2 className="text-3xl font-bold text-black" style={{ fontFamily: "'Blinker', sans-serif" }}>
                ¿Cómo Jugar?
                </h2>
                <button
                onClick={onClose}
                className="text-black hover:text-gray-200 text-3xl leading-none"
                >
                ✕
                </button>
            </div>
            <div className='pb-4 bg-[#fff3df] rounded-3xl px-4'>
                <div className="setting-modal-body rounded-lg max-h-[80vh] pb-4 overflow-y-auto">

                    {/* Content */}
                    {isLoading ? (
                      <div className="p-6 text-center text-gray-700">
                        <p>Cargando contenido...</p>
                      </div>
                    ) : error ? (
                      <div className="p-6 text-center text-red-600">
                        <p>{error}</p>
                      </div>
                    ) : content?.content ? (
                      <div 
                        className="p-6 text-gray-700 space-y-4 prose prose-sm max-w-none"
                        dangerouslySetInnerHTML={{ __html: content.content }}
                      />
                    ) : (
                      <div className="p-6 text-center text-gray-700">
                        <p>No hay contenido disponible en este momento.</p>
                      </div>
                    )}

                    {/* Footer */}
                    <div className="px-6 py-4">
                        <button
                        onClick={onClose}
                        className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-2 px-6 rounded-lg transition"
                        style={{ fontFamily: "'Blinker', sans-serif" }}
                        >
                        Entendido
                        </button>
                    </div>
                </div> 
            </div>
        </div>
      </div>
    </>
  );
}
