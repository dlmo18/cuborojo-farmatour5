'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useManagerAuth } from '@/app/hooks/useManagerAuth';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { isAuthenticated, logout, user, isLoading } = useManagerAuth();
  const [isMounted, setIsMounted] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Asegurar que se ejecuta solo en cliente
  useEffect(() => {
    setIsMounted(true);
    // Cargar preferencia del sidebar desde localStorage
    const savedSidebarState = localStorage.getItem('sidebarOpen');
    if (savedSidebarState !== null) {
      setSidebarOpen(JSON.parse(savedSidebarState));
    }
  }, []);

  // Proteger rutas: si no está autenticado, redirigir a login
  useEffect(() => {
    if (!isMounted || isLoading) return;

    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isMounted, isLoading, isAuthenticated, router]);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const toggleSidebar = () => {
    const newState = !sidebarOpen;
    setSidebarOpen(newState);
    localStorage.setItem('sidebarOpen', JSON.stringify(newState));
  };

  if (!isMounted || isLoading || !isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-gray-900 border-r-transparent"></div>
          <p className="mt-4 text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside
        className={`sidemenu bg-gray-900 text-white p-6 flex flex-col transition-all duration-300 ${
          sidebarOpen ? 'w-64' : '-ml-64'
        } overflow-hidden`}
      >
        <div>
          <h1 className="text-2xl font-bold mb-2">⚙️ Farmatour 5</h1>
          <p className="text-xs text-gray-400 mb-8">Panel de Administración</p>
          {user && (
            <div className="mb-6 p-3 bg-gray-800 rounded-lg text-xs">
              <p className="font-semibold truncate">{user.username}</p>
              <p className="text-gray-400 text-xs capitalize">{user.role === 'manager' ? 'Administrador' : 'Reportero'}</p>
            </div>
          )}
        </div>

        <nav className="space-y-2 flex-1">
          <Link
            href="/dashboard"
            className="block px-4 py-2 hover:bg-gray-800 rounded transition"
          >
            📊 Dashboard
          </Link>
          <Link
            href="/usuarios"
            className="block px-4 py-2 hover:bg-gray-800 rounded transition"
          >
            👤 Usuarios del Sistema
          </Link>
          <Link
            href="/participantes"
            className="block px-4 py-2 hover:bg-gray-800 rounded transition"
          >
            👥 Participantes
          </Link>
          <Link
            href="/grupos"
            className="block px-4 py-2 hover:bg-gray-800 rounded transition"
          >
            📁 Grupos
          </Link>
          <Link
            href="/mundos"
            className="block px-4 py-2 hover:bg-gray-800 rounded transition"
          >
            🌍 Mundos
          </Link>
          <Link
            href="/biblioteca"
            className="block px-4 py-2 hover:bg-gray-800 rounded transition"
          >
            📚 Biblioteca de Medios
          </Link>
          <Link
            href="/reporteria"
            className="block px-4 py-2 hover:bg-gray-800 rounded transition"
          >
            📈 Reportería
          </Link>
          <Link
            href="/configuracion"
            className="block px-4 py-2 hover:bg-gray-800 rounded transition"
          >
            ⚙️ Configuración
          </Link>
        </nav>

        <button
          onClick={handleLogout}
          className="w-full text-left text-white px-4 py-2 bg-red-600 hover:bg-red-700 rounded transition font-semibold"
        >
          <span className="material-icons align-middle">logout</span> Cerrar Sesión
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto flex flex-col">
        {/* Toggle Button */}
        <button
          onClick={toggleSidebar}
          style={{ width: '40px' }}
          className="fixed flex overflow-hidden items-center top-4 left-3 z-40 p-2 bg-gray-900  rounded-lg hover:bg-gray-800 transition"
          title={sidebarOpen ? 'Ocultar menú' : 'Mostrar menú'}
        >
          {sidebarOpen ? (<span className='text-white material-icons'>menu_open</span>) : (<span className='material-icons text-white'>menu_closed</span>)}
        </button>

        {/* Content */}
        <div className="pt-12">
          {children}
        </div>
      </main>
    </div>
  );
}
