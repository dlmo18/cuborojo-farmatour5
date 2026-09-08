import { useState, useEffect } from 'react';
import axios from 'axios';

interface CountdownTimerProps {
  onTimeExpired?: () => void;
}

export default function CountdownTimer({ onTimeExpired }: CountdownTimerProps) {
  const [countdownTime, setCountdownTime] = useState<string | null>(null);
  const [isExpired, setIsExpired] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

  // Cargar la configuración del contador desde el backend
  useEffect(() => {
    const fetchCountdownConfig = async () => {
      try {
        const res = await axios.get(`${API_URL}/config`);
        const configs = res.data || [];
        const countdownConfig = configs.find((c: any) => c.key === 'countdown_datetime');
        
        if (countdownConfig?.value) {
          setCountdownTime(countdownConfig.value);
        }
      } catch (err) {
        console.error('Error fetching countdown config:', err);
      }
    };

    fetchCountdownConfig();
  }, []);

  // Actualizar el contador cada segundo
  useEffect(() => {
    if (!countdownTime) return;

    const interval = setInterval(() => {
      const targetDate = new Date(countdownTime).getTime();
      const now = new Date().getTime();
      const remaining = targetDate - now;

      if (remaining <= 0) {
        setIsExpired(true);
        setTimeRemaining(0);
        clearInterval(interval);
      } else {
        setTimeRemaining(remaining);
        setIsExpired(false);
      }
    }, 1000);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [countdownTime]);

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);

    if (hours > 0) {
      return `${hours} ${hours === 1 ? 'hora' : 'horas'} ${minutes} ${minutes === 1 ? 'minuto' : 'minutos'}`;
    }
    return `${minutes} ${minutes === 1 ? 'minuto' : 'minutos'}`;
  };

  return (
    <>
      {/* Contador regresivo */}
      <div className="flex items-center gap-3">
        <span className="text-2xl">⏱️</span>
        <div className="text-white font-bold text-lg">
          {countdownTime ? formatTime(timeRemaining) : '--'}
        </div>
        <button
          onClick={() => isExpired && setShowModal(true)}
          disabled={!isExpired}
          className={`text-2xl transition ${
            isExpired ? 'cursor-pointer opacity-100' : 'opacity-50 cursor-not-allowed'
          }`}
        >
          🎁
        </button>
      </div>

      {/* Modal cuando la cuenta llega a cero */}
      {showModal && (
        <>
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => setShowModal(false)}
          />
          <div className="fixed inset-0 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-2xl p-8 max-w-md w-full mx-4">
              <div className="text-center">
                <div className="text-6xl mb-4">🎉</div>
                <h2 className="text-2xl font-bold text-purple-600 mb-3">¡Evento Especial!</h2>
                <p className="text-gray-700 mb-6">
                  Se ha completado la cuenta atrás. ¡Algo especial te espera!
                </p>
                <button
                  onClick={() => setShowModal(false)}
                  className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-6 rounded-lg transition"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
