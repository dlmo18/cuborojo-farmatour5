'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useManagerAuth } from './hooks/useManagerAuth';

export default function Home() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useManagerAuth();
  const [isMounted, setIsMounted] = useState(false);

  // Asegurar que se ejecute solo en cliente
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Redirigir cuando la autenticación está lista
  useEffect(() => {
    if (!isMounted || isLoading) return;

    if (isAuthenticated) {
      // Si está autenticado, ir al dashboard
      router.push('/dashboard');
    } else {
      // Si no está autenticado, ir al login
      router.push('/login');
    }
  }, [isMounted, isLoading, isAuthenticated, router]);

  // Mostrar pantalla de carga mientras se verifica autenticación
  return (
    <main className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 to-gray-800">
      <div className="text-center text-white">
        <div className="animate-pulse">
          <h1 className="text-4xl font-bold mb-4">⚙️ Farmatour 5</h1>
          <p className="text-xl text-gray-300">Panel de Administración</p>
          <p className="text-sm text-gray-400 mt-2">Verificando sesión...</p>
          <div className="mt-8">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-white border-r-transparent"></div>
          </div>
        </div>
      </div>
    </main>
  );
}
