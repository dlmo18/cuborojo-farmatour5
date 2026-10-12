'use client';

import { useAuthCheck } from '@/hooks/useAuthCheck';
import { useAuthStore } from '@/store/authStore';

export default function GameLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isHydrated } = useAuthCheck({ redirectTo: '/login' });
  const token = useAuthStore((state) => state.token);

  // Evitar renderizar contenido antes de verificar autenticación
  if (!isHydrated || !token) {
    return null; // No renderizar nada hasta que se verifique la autenticación
  }

  return <>{children}</>;
}
