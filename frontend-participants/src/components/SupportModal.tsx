'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { messagesApi, CreateMessageDto } from '@/services/api';

interface SupportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type AlertType = 'success' | 'error' | null;

export default function SupportModal({ isOpen, onClose }: SupportModalProps) {
  const [formData, setFormData] = useState({
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [alert, setAlert] = useState<{ type: AlertType; message: string }>({
    type: null,
    message: ''
  });

  const user = useAuthStore((state) => state.user);
  const username = user?.fullName || 'Usuario';

  // Inicializar email cuando el modal se abre
  useEffect(() => {
    if (isOpen && user?.email) {
      setFormData(prev => ({
        ...prev,
        email: user.email || ''
      }));
    }
  }, [isOpen, user?.email]);

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
    setAlert({ type: null, message: '' });

    try {
      // Validar que los datos requeridos existan
      if (!username) {
        throw new Error('Datos de usuario incompletos');
      }

      if (!formData.email) {
        throw new Error('Email requerido');
      }

      const messageData: CreateMessageDto = {
        fullName: username,
        email: formData.email,
        subject: formData.subject,
        message: formData.message
      };

      // Enviar a la API
      await messagesApi.create(messageData);

      // Mostrar mensaje de éxito
      setAlert({
        type: 'success',
        message: '✓ Tu mensaje ha sido enviado correctamente. Gracias por contactarnos.'
      });

      // Limpiar formulario
      setFormData({ email: formData.email, subject: '', message: '' });

      // Cerrar el modal después de 2 segundos
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (error) {
      console.error('Error enviando mensaje:', error);
      
      let errorMessage = '❌ Error al enviar el mensaje. Por favor, intenta de nuevo.';
      
      if (error instanceof Error) {
        if (error.message.includes('Email requerido')) {
          errorMessage = '❌ Por favor, ingresa un email válido.';
        } else if (error.message.includes('Datos de usuario')) {
          errorMessage = '❌ No se pudo obtener tus datos de usuario. Por favor, recarga la página.';
        } else if (error.message.includes('Network') || error.message.includes('request failed')) {
          errorMessage = '❌ Error de conexión. Verifica tu conexión a internet.';
        }
      }

      setAlert({
        type: 'error',
        message: errorMessage
      });
    } finally {
      setIsSubmitting(false);
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
                    {/* Alert Messages */}
                    {alert.type && (
                      <div className={`mx-6 mb-4 p-4 rounded-lg text-sm font-semibold ${
                        alert.type === 'success'
                          ? 'bg-green-100 text-green-800 border border-green-300'
                          : 'bg-red-100 text-red-800 border border-red-300'
                      }`}>
                        {alert.message}
                      </div>
                    )}

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

                        {/* Email */}
                        <div>
                            <label className="block text-gray-700 font-semibold mb-2">
                            Email *
                            </label>
                            <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            placeholder="tu@email.com"
                            required
                            disabled={isSubmitting}
                            className="w-full px-4 py-2 text-black border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                            />
                        </div>

                        {/* Asunto */}
                        <div>
                            <label className="block text-gray-700 font-semibold mb-2">
                            Asunto *
                            </label>
                            <input
                            type="text"
                            name="subject"
                            value={formData.subject}
                            onChange={handleInputChange}
                            placeholder="Describe el asunto de tu consulta"
                            required
                            disabled={isSubmitting}
                            className="w-full text-black px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                            />
                        </div>

                        {/* Mensaje */}
                        <div>
                            <label className="block text-black text-gray-700 font-semibold mb-2">
                            Mensaje *
                            </label>
                            <textarea
                            name="message"
                            value={formData.message}
                            onChange={handleInputChange}
                            placeholder="Cuéntanos más detalles de tu consulta"
                            required
                            rows={5}
                            disabled={isSubmitting}
                            className="w-full text-black px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none disabled:bg-gray-100 disabled:cursor-not-allowed"
                            />
                        </div>

                        {/* Botones */}
                        <div className="flex gap-3 justify-end pt-4">
                            <button
                            type="button"
                            onClick={onClose}
                            disabled={isSubmitting}
                            className="text-black bg-gray-300 hover:bg-gray-400 disabled:bg-gray-200 disabled:cursor-not-allowed text-gray-800 font-bold py-2 px-6 rounded-lg transition"
                            style={{ fontFamily: "'Blinker', sans-serif" }}
                            >
                            Cancelar
                            </button>
                            <button
                            type="submit"
                            disabled={isSubmitting || !formData.subject || !formData.message || !formData.email}
                            className="bg-primary-600 hover:bg-primary-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-bold py-2 px-6 rounded-lg transition"
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
