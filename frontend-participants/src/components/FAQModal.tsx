import { useState } from 'react';

interface FAQModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const faqItems = [
  {
    id: 1,
    question: '¿Cuál es el objetivo del juego?',
    answer: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.'
  },
  {
    id: 2,
    question: '¿Cómo puedo ganar más estrellas?',
    answer: 'Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore.'
  },
  {
    id: 3,
    question: '¿Qué son los mundos?',
    answer: 'Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium.'
  },
  {
    id: 4,
    question: '¿Cómo desbloqueo nuevos niveles?',
    answer: 'Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt.'
  },
  {
    id: 5,
    question: '¿Puedo jugar con mis amigos?',
    answer: 'Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem.'
  }
];

export default function FAQModal({ isOpen, onClose }: FAQModalProps) {
  const [expandedId, setExpandedId] = useState<number | null>(null);

  if (!isOpen) return null;

  const toggleExpanded = (id: number) => {
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
                    Preguntas Frecuentes
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
                    {faqItems.map((item) => (
                    <div key={item.id} className="mb-2 border border-primary rounded-lg overflow-hidden">
                        <button
                        onClick={() => toggleExpanded(item.id)}
                        className="w-full bg-primary-200 hover:bg-primary-100 px-4 py-3 flex justify-between items-center text-left transition font-semibold text-gray-800"
                        >
                        <span>{item.question}</span>
                        <span className={`text-xl transition transform ${expandedId === item.id ? 'rotate-180' : ''}`}>
                            ▼
                        </span>
                        </button>
                        
                        {expandedId === item.id && (
                        <div className="bg-white px-4 py-3 border-t border-gray-300 text-gray-700 text-justify">
                            {item.answer}
                        </div>
                        )}
                    </div>
                    ))}   

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
