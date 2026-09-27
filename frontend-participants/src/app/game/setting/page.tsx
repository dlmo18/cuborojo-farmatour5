'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAuthStore } from '@/store/authStore';
import { useAuthCheck } from '@/hooks/useAuthCheck';
import HowToPlayModal from '@/components/HowToPlayModal';
import FAQModal from '@/components/FAQModal';
import SupportModal from '@/components/SupportModal';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export default function SettingPage() {
  const router = useRouter();
  const { isHydrated } = useAuthCheck({ redirectTo: '/login' });
  const { logout, user } = useAuthStore();
  const token = useAuthStore((state) => state.token);

  const [isHowToPlayOpen, setIsHowToPlayOpen] = useState(false);
  const [isFAQOpen, setIsFAQOpen] = useState(false);
  const [isSupportOpen, setIsSupportOpen] = useState(false);
  const [groupImageUrl, setGroupImageUrl] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isHydrated) return;

    if (!token) {
      router.push('/login');
      return;
    }

    const loadGroupImage = async () => {
      try {
        // El usuario ya está en el store (recuperado de localStorage)
        if (user?.group?.id) {
          const groupRes = await axios.get(`${API_URL}/groups/${user.group.id}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          if (groupRes.data?.imageId) {
            const imageUrl = `${API_URL}/media/serve/${groupRes.data.imageId}`;
            setGroupImageUrl(imageUrl);
          }
        }
      } catch (err) {
        console.error('Error fetching group image:', err);
      } finally {
        setLoading(false);
      }
    };

    loadGroupImage();
  }, [isHydrated, token, user, router]);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const handleBack = () => {
    router.back();
  };

  const handleClose = () => {
    router.push('/game/worlds');
  };

  if (!isHydrated || loading) {
    return (
      <div className="min-h-screen bg-gray-300 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white">Cargando configuración...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-setting min-h-screen bg-gray-300 overflow-x-hidden">
      {/* Contenedor principal centrado */}
      <div className="max-w-md mx-auto relative">
        {/* Header con botones */}
        <div className="fixed top-0 left-0 right-0 z-30 max-w-md mx-auto px-4 pt-4 flex justify-between items-center">
          <button
            onClick={handleBack}
            className="hover:opacity-80 transition"
            aria-label="Regresar"
          >
            <Image
              src="/images/btn-back.png"
              alt="Regresar"
              width={50}
              height={50}
              className="h-auto"
              priority
            />
          </button>
          <button
            onClick={handleClose}
            className="hover:opacity-80 transition"
            aria-label="Cerrar"
          >
            <Image
              src="/images/btn-close.png"
              alt="Cerrar"
              width={50}
              height={50}
              className="h-auto"
              priority
            />
          </button>
        </div>

        {/* Hero Banner */}
        <div className="relative h-96 w-full ">
          <Image
            src="/images/setting-bg.jpg"
            alt="Setting Background"
            fill
            className="object-cover"
            priority
          />
        </div>

        {/* Panel de opciones */}
        <div className="panel relative -mt-36 z-10 pb-8">
          {/* Logo overlay - centrado en el hero */}
          <div className="absolute w-full ">
            <Image
              src="/images/logo.png"
              alt="Farmatour 5"
              width={280}
              height={160}
              className="drop-shadow-lg block m-auto -mt-24"
              priority
            />
          </div>  
          <div className=" pt-16">
            <div className="controls px-6">

                {/* ¿Cómo Jugar? */}
                <button
                onClick={() => setIsHowToPlayOpen(true)}
                className="block m-auto setting-button text-white font-bold pt-1 pb-4 px-6 mb-4 flex items-center justify-center"
                style={{ fontFamily: "'Blinker', sans-serif" }}
                >
                <span className="text-2xl leading-6 uppercase">¿Cómo Jugar?</span>
                </button>

                {/* Preguntas Frecuentes */}
                <button
                onClick={() => setIsFAQOpen(true)}
                className="block m-auto setting-button text-white font-bold pt-1 pb-4 px-6 mb-4 flex items-center justify-center"
                style={{ fontFamily: "'Blinker', sans-serif" }}
                >
                <span className="text-2xl leading-6 uppercase">Preguntas Frecuentes</span>
                </button>

                {/* Asistencia */}
                <button
                onClick={() => setIsSupportOpen(true)}
                className="block m-auto setting-button text-white font-bold pt-1 pb-4 px-6 mb-4 flex items-center justify-center"
                style={{ fontFamily: "'Blinker', sans-serif" }}
                >
                <span className="text-2xl leading-6 uppercase">Asistencia</span>
                </button>

                {/* Cerrar Sesión */}
                <button
                onClick={handleLogout}
                className="w-full uppercase text-2xl text-gray-900 hover:text-gray-600 font-bold py-4 px-6 transition "
                style={{ fontFamily: "'Blinker', sans-serif" }}
                >
                Cerrar Sesión
                </button>
                
                {/* Logo del Grupo */}
                {groupImageUrl && (
                <div className="flex flex-col items-center">
                    <div className="relative w-48 h-16 mb-16 flex items-center justify-center bg-white rounded-lg overflow-hidden">
                    <Image
                        src={groupImageUrl}
                        alt={user?.group?.name || 'Grupo'}
                        fill
                        className="object-contain p-2"
                    />
                    </div>
                </div>
                )}
            </div>

            </div>
        </div>
      </div>

      {/* Modales */}
      <HowToPlayModal isOpen={isHowToPlayOpen} onClose={() => setIsHowToPlayOpen(false)} />
      <FAQModal isOpen={isFAQOpen} onClose={() => setIsFAQOpen(false)} />
      <SupportModal isOpen={isSupportOpen} onClose={() => setIsSupportOpen(false)} />
    </div>
  );
}
