'use client';

import { useAuthCheck } from '@/hooks/useAuthCheck';

export default function GameLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  useAuthCheck({ redirectTo: '/login' });

  return <>{children}</>;
}
