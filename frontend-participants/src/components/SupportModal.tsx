import { useState } from 'react';
import { useAuthStore } from '@/store/authStore';

interface SupportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SupportModal({ isOpen, onClose }: SupportModalProps) {
  const [formData, setFormData] = useState({
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const user = useAuthStore((state) => state.user);
  const username = user?.fullName || 'Usuario';

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simular envío del formulario
    setTimeout(() => {
      console.log('Formulario enviado:', {
        username,
        ...formData
      });
      setFormData({ subject: '', message: '' });
      setIsSubmitting(false);
      alert('Tu mensaje ha sido enviado correctamente. Gracias por contactarnos.');
      onClose();
    }, 1000);
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
        <div className="setting-modal rounded-lg max-w-lg w-full pt-10 ">
            {/* Header */}
            <div className="sticky rounded-lg  top-0 px-8 pb-4 flex justify-between items-center">
                <h2 className="text-3xl font-bold text-black" style={{ fontFamily: "'Blinker', sans-serif" }}>
                    Asistencia
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
                    {/* Content - Form */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Usuario */}
                        <div>
                            <label className="block text-gray-700 font-semibold mb-2">
                            Nombre de Usuario
                            </label>
                            <input
                            type="text"
                            value={username}
                            disabled
                            className="w-full px-4 py-2 bg-gray-100 text-gray-600 rounded-lg border border-gray-300 cursor-not-allowed"
                            />
                        </div>

                        {/* Asunto */}
                        <div>
                            <label className="block text-gray-700 font-semibold mb-2">
                            Asunto
                            </label>
                            <input
                            type="text"
                            name="subject"
                            value={formData.subject}
                            onChange={handleInputChange}
                            placeholder="Describe el asunto de tu consulta"
                            required
                            className="w-full text-black px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                            />
                        </div>

                        {/* Mensaje */}
                        <div>
                            <label className="block text-black text-gray-700 font-semibold mb-2">
                            Mensaje
                            </label>
                            <textarea
                            name="message"
                            value={formData.message}
                            onChange={handleInputChange}
                            placeholder="Cuéntanos más detalles de tu consulta"
                            required
                            rows={5}
                            className="w-full text-black px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                            />
                        </div>

                        {/* Botones */}
                        <div className="flex gap-3 justify-end pt-4">
                            <button
                            type="button"
                            onClick={onClose}
                            className=" text-black bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-6 rounded-lg transition"
                            style={{ fontFamily: "'Blinker', sans-serif" }}
                            >
                            Cancelar
                            </button>
                            <button
                            type="submit"
                            disabled={isSubmitting || !formData.subject || !formData.message}
                            className="bg-primary-600 hover:bg-primary-700 disabled:bg-gray-400 text-white font-bold py-2 px-6 rounded-lg transition"
                            style={{ fontFamily: "'Blinker', sans-serif" }}
                            >
                            {isSubmitting ? 'Enviando...' : 'Enviar'}
                            </button>
                        </div>
                    </form>   

                </div> 
            </div>
        </div>
      </div>

    </>
  );
}
