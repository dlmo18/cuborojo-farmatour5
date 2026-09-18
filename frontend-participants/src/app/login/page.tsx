'use client';

import { useAuthStore } from '@/store/authStore';
import { useAuthCheck } from '@/hooks/useAuthCheck';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import Image from 'next/image';

export default function LoginPage() {
  const [dni, setDni] = useState('');
  const router = useRouter();
  const { login, isLoading, error } = useAuthStore();
  const token = useAuthStore((state) => state.token);
  const { isHydrated } = useAuthCheck();

  // Si ya está autenticado, redirigir a mundos
  useEffect(() => {
    if (!isHydrated) return;
    if (token) {
      router.push('/game/worlds');
    }
  }, [isHydrated, token, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await login(dni);
    // Solo redirigir si el login fue exitoso
    if (success) {
      router.push('/game/worlds');
    }
  };

  return (
    <div className="min-h-screen w-full relative flex items-center justify-center overflow-hidden">
      {/* Fondo responsivo */}
      <div className="absolute inset-0 w-full h-full">
        <Image
          src="/images/login-bg.jpeg"
          alt="Fondo Farmatour 5"
          fill
          priority
          className="object-cover w-full h-full"
          quality={90}
        />
        {/* Overlay oscuro para mejorar legibilidad - Adaptado a colores Farmatour */}
        <div className="absolute inset-0 bg-black/20"></div>
      </div>

      {/* Contenedor del login */}
      <div className="relative z-10 w-full max-w-md px-4 flex flex-col items-center">
        {/* Logo */}
        <div className="relative w-full h-[300px]">
          <Image
            src="/images/logo.png"
            alt="Logo Farmatour 5"
            fill
            className="object-contain"
            priority
          />
        </div>
        {/* Mensaje de error */}
        <div className="h-32 pt-12">
          {error && (
            <div className="text-orange-200 text-2xl w-[300px] md:text-base text-center font-bold px-4 bg-red-600/80 rounded py-2" style={{ fontFamily: "'Blinker', sans-serif" }}>
              {error}
            </div>
          )}
        </div>
        {/* Modal del Login */}
        <div className="relative w-full">
          {/* Fondo del modal */}
          <Image
            src="/images/login-modal.png"
            alt="Modal"
            width={400}
            height={300}
            className="w-full h-auto"
            priority
          />
          
          {/* Contenido del modal (posicionado absolutamente) */}
          <div className="absolute inset-0 flex flex-col items-center justify-start px-8 pt-10">
            {/* Título - Colores Farmatour 5 */}
            <h2
              className="text-3xl font-black text-center mb-2 mt-4 text-white drop-shadow-lg"
              style={{ fontFamily: "'Blinker', sans-serif" }}
            >
              INGRESA TU DNI
            </h2>

            <form onSubmit={handleSubmit} className="w-full space-y-6 login-modal">
              {/* Input con fondo */}
              <div className="relative w-[230px] h-[70px]  m-auto">
                <Image
                  src="/images/login-input.png"
                  alt="Input background"
                  fill
                  className="object-cover"
                />
                <input
                  type="text"
                  value={dni}
                  onChange={(e) => setDni(e.target.value.replace(/\D/g, ''))}
                  placeholder="********"
                  maxLength={8}
                  disabled={isLoading}
                  autoFocus
                  className="login-input absolute inset-0 w-full h-full px-8 text-black text-center text-3xl font-bold bg-transparent focus:outline-none placeholder-gray-400 placeholder:opacity-50"
                  style={{ fontFamily: "'Blinker', sans-serif" }}
                />
              </div>

              {/* Botón con fondo */}
              <div className="relative w-full h-16 flex items-center justify-start" style={{'marginTop': '1rem'}}>
                <button
                  type="submit"
                  disabled={isLoading || !dni || dni.length !== 8}
                  className="login-button absolute inset-0 w-[230px] h-[80px]  m-auto flex items-center justify-center focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed transition-transform hover:scale-105 active:scale-95"
                >
                  {/* Fondo del botón */}
                  <Image
                    src="/images/login-button.png"
                    alt="Button"
                    fill
                    className="object-cover"
                  />

                  <span
                    className="absolute text-3xl font-black text-white z-10 drop-shadow-lg top-4"
                    style={{ fontFamily: "'Blinker', sans-serif" }}
                  >
                    INGRESAR
                  </span>
                </button>
              </div>
              {/* Mensaje de contacto */}
              <div className="login-contact mt-8 w-[250px] m-auto text-center text-white text-xs drop-shadow-lg" style={{ textShadow: '1px 1px 3px rgba(0,0,0,0.6)' }}>
                <p className="font-semibold" style={{ fontFamily: "'Blinker', sans-serif" }}>
                  Si tienes problemas para acceder envía un correo a
                </p>
                <p className="font-bold text-yellow-100" style={{ fontFamily: "'Blinker', sans-serif" }}>
                  universidadcorporativa@farmaciasfarmatour.com
                </p>
                <p style={{ fontFamily: "'Blinker', sans-serif" }}>
                  con tus datos de colaborador.
                </p>
              </div>
            </form>
          </div>
        </div>

        
        <div className="copyright mt-12 pb-8 text-center text-white/80 text-xs drop-shadow-lg" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.6)' }}>
          Copyright &copy; {new Date().getFullYear()} CUBOROJO. Farmacias Peruanas
        </div>
      </div>
    </div>
  );
}
