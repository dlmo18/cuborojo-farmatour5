'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import Image from 'next/image';

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
    <main className="flex items-center justify-center min-h-screen bg-gradient-to-br from-forest-700 via-primary-700 to-secondary-800">
      <div className="text-center text-white">
        <div className="animate-pulse mb-8">
          {/* Logo Farmatour 5 */}
          <div className="relative w-96 h-48 mx-auto mb-6">
            <Image
              src="/images/logo.png"
              alt="Farmatour 5"
              fill
              className="object-contain"
              priority
            />
          </div>
          <p className="text-xl font-semibold drop-shadow-lg" style={{ fontFamily: "'Blinker', sans-serif" }}>
            Cargando...
          </p>
        </div>
      </div>
    </main>
  );
}
