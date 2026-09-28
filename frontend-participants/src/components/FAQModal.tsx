'use client';

import { useState, useEffect } from 'react';
import { faqApi, FaqItem } from '@/services/api';

interface FAQModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function FAQModal({ isOpen, onClose }: FAQModalProps) {
  const [faqItems, setFaqItems] = useState<FaqItem[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadFaqItems();
    }
  }, [isOpen]);

  const loadFaqItems = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await faqApi.getPublic();
      setFaqItems(response.data);
    } catch (err) {
      console.error('Error cargando FAQ:', err);
      setError('No se pudo cargar las preguntas frecuentes. Por favor, intenta de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  const toggleExpanded = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black bg-opacity-60 z-40"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="setting-modal rounded-lg max-w-lg w-full pt-10 ">
            {/* Header */}
            <div className="sticky rounded-lg  top-0 px-8 pb-4 flex justify-between items-center">
                <h2 className="text-3xl font-bold text-black" style={{ fontFamily: "'Blinker', sans-serif" }}>
                    FAQ
                </h2>
                <button
                onClick={onClose}
                className="text-black hover:text-gray-200 text-3xl leading-none"
                >
                ✕
                </button>
            </div>
            <div className='pb-4 bg-[#fff3df] rounded-3xl px-4'>
                <div className="setting-modal-body max-h-[80vh] pb-4 overflow-y-auto">
                    {/* Content - Accordion */}
                    {isLoading ? (
                      <div className="px-6 py-4 text-center text-gray-700">
                        <p>Cargando preguntas frecuentes...</p>
                      </div>
                    ) : error ? (
                      <div className="px-6 py-4 text-center text-red-600">
                        <p>{error}</p>
                      </div>
                    ) : faqItems.length > 0 ? (
                      faqItems.map((item) => (
                        <div key={item.id} className="mb-2 border border-primary rounded-lg overflow-hidden">
                            <button
                            onClick={() => toggleExpanded(item.id)}
                            className="w-full bg-primary-200 hover:bg-primary-100 px-4 py-3 flex justify-between items-center text-left transition font-semibold text-gray-800"
                            >
                            <span>{item.title}</span>
                            <span className={`text-xl transition transform ${expandedId === item.id ? 'rotate-180' : ''}`}>
                                ▼
                            </span>
                            </button>
                            
                            {expandedId === item.id && (
                            <div className="bg-white px-4 py-3 border-t border-gray-300 text-gray-700 text-justify">
                                {item.detail}
                            </div>
                            )}
                        </div>
                      ))
                    ) : (
                      <div className="px-6 py-4 text-center text-gray-700">
                        <p>No hay preguntas frecuentes disponibles en este momento.</p>
                      </div>
                    )}

                    {/* Footer */}
                    <div className="px-6 py-4 flex justify-end">
                        <button
                        onClick={onClose}
                        className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-2 px-6 rounded-lg transition"
                        style={{ fontFamily: "'Blinker', sans-serif" }}
                        >
                        Cerrar
                        </button>
                    </div> 
                </div> 
            </div>
        </div>
      </div>
    </>
  );
}
