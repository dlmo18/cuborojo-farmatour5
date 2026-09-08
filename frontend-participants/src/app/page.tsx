'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';

export default function Home() {
  const router = useRouter();
  const { token } = useAuthStore();

  useEffect(() => {
    // Si el usuario ya está autenticado, redirigir a mundos
    if (token) {
      router.push('/game/worlds');
    } else {
      // Si no está autenticado, redirigir al login
      router.push('/login');
    }
  }, [token, router]);

  // Mostrar pantalla de carga mientras redirige
  return (
    <main className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-600 to-blue-600">
      <div className="text-center text-white">
        <div className="animate-pulse mb-4">
          <h1 className="text-5xl font-bold mb-4">🎮 Farmatour 5</h1>
          <p className="text-xl">Cargando...</p>
        </div>
      </div>
    </main>
  );
}
