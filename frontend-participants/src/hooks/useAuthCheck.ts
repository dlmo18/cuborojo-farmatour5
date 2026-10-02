'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';

/**
 * Hook para verificar autenticación de forma segura
 * Espera a que el cliente esté hidratado antes de verificar
 * Redirije al login si la sesión expira o falla la autenticación
 */
export function useAuthCheck(options?: { redirectTo?: string }) {
  const router = useRouter();
  const [isHydrated, setIsHydrated] = useState(false);
  const authCheckedRef = useRef(false);
  const authFailureListenerRef = useRef(false);
  
  // Suscribirse a cambios del token
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

  // Tercer efecto: escuchar cambios en el token
  // Si el token se vuelve null después de estar presente, redirigir
  useEffect(() => {
    if (!isHydrated) return;
    if (!token && options?.redirectTo) {
      // Token se limpió (logout o fallo de auth)
      router.push(options.redirectTo);
    }
  }, [token, isHydrated, options, router]);

  // Cuarto efecto: escuchar evento global de fallo de autenticación
  useEffect(() => {
    if (!isHydrated || authFailureListenerRef.current) return;
    authFailureListenerRef.current = true;

    const handleAuthFailed = (event: Event) => {
      const customEvent = event as CustomEvent;
      console.warn('Authentication failed:', customEvent.detail);
      
      if (options?.redirectTo) {
        router.push(options.redirectTo);
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('auth-failed', handleAuthFailed);
      
      return () => {
        window.removeEventListener('auth-failed', handleAuthFailed);
      };
    }
  }, [isHydrated, options, router]);

  return { isHydrated };
}
