import { NextRequest, NextResponse } from 'next/server';

// Middleware para proteger rutas que requieren autenticación
export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Rutas públicas que no requieren autenticación
  const publicRoutes = ['/login', '/api'];
  
  // Verificar si es una ruta pública
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));
  
  if (isPublicRoute) {
    return NextResponse.next();
  }

  // Rutas protegidas: verificar si hay token
  // Nota: Verificamos el token en cookies o localStorage
  // En NextJS 13+ con App Router, es mejor usar cookies en el servidor
  
  // Obtener token de cookies
  const token = request.cookies.get('token')?.value || request.cookies.get('auth_token')?.value;

  // Si no hay token y está intentando acceder a ruta protegida (/game), redirigir a login
  if (!token && pathname.startsWith('/game')) {
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

// Configurar qué rutas el middleware debe procesar
export const config = {
  matcher: [
    /*
     * Match todas las rutas de request EXCEPTO las siguientes:
     * - _next/static (archivos estáticos)
     * - _next/image (archivos de optimización de imagen)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
