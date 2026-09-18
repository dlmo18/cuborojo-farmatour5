import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { useSoundSettings } from '@/hooks/useSoundSettings';

interface OptionsMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function OptionsMenu({ isOpen, onClose }: OptionsMenuProps) {
  const router = useRouter();
  const { logout } = useAuthStore();
  const { backgroundSound, effectSound, toggleBackgroundSound, toggleEffectSound } = useSoundSettings();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay oscuro */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={onClose}
      />

      {/* Modal de opciones */}
      <div className="fixed top-20 right-8 bg-white rounded-lg shadow-2xl p-6 w-80 z-50">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-primary-600" style={{ fontFamily: "'Blinker', sans-serif" }}>Opciones</h2>
          <button
            onClick={onClose}
            className="text-white/60 hover:text-white/80 text-2xl" 
          >
            ✕
          </button>
        </div>

        {/* Opciones de sonido */}
        <div className="space-y-4 mb-6">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🔊</span>
              <span className="font-semibold text-white/90">Sonido de Fondo</span>
            </div>
            <button
              onClick={toggleBackgroundSound}
              className={`relative w-12 h-6 rounded-full transition ${
                backgroundSound ? 'bg-primary-500' : 'bg-secondary-300'
              }`}
            >
              <div
                className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition transform ${
                  backgroundSound ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🎵</span>
              <span className="font-semibold text-white/90">Sonido de Efecto</span>
            </div>
            <button
              onClick={toggleEffectSound}
              className={`relative w-12 h-6 rounded-full transition ${
                effectSound ? 'bg-primary-500' : 'bg-secondary-300'
              }`}
            >
              <div
                className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition transform ${
                  effectSound ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-200 my-4" />

        {/* Cerrar sesión */}
        <button
          onClick={handleLogout}
          className="w-full bg-secondary-600 hover:bg-secondary-700 text-white font-bold py-2 px-4 rounded-lg transition" style={{ fontFamily: "'Blinker', sans-serif" }}
        >
          Cerrar Sesión
        </button>
      </div>
    </>
  );
}
