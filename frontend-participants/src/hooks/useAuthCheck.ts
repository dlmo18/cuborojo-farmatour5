'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';

/**
 * Hook para verificar autenticación de forma segura
 * Espera a que el cliente esté hidratado antes de verificar
 */
export function useAuthCheck(options?: { redirectTo?: string }) {
  const router = useRouter();
  const [isHydrated, setIsHydrated] = useState(false);
  const authCheckedRef = useRef(false);
  
  // Leer token solo después de hidratación
  const token = useAuthStore((state) => state.token);

  // Primera renderización: esperar hidratación
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // Segunda efecto: verificar auth después de hidratación
  useEffect(() => {
    if (!isHydrated) return;
    if (authCheckedRef.current) return;
    authCheckedRef.current = true;

    // Releer el token del store después de hidratación
    const currentToken = useAuthStore.getState().token;
    if (!currentToken && options?.redirectTo) {
      router.push(options.redirectTo);
    }
  }, [isHydrated, options, router]);

  return { isHydrated };
}
