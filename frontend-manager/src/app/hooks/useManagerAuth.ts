/**
 * Hook centralizado para autenticación del Panel de Administración
 * 
 * Características:
 * - Almacenamiento separado de sesión del admin (usa prefijo 'manager_')
 * - Aislamiento total de sesión de participantes
 * - Métodos para login, logout y verificación de sesión
 * - Sincronización entre pestañas
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { resetAuthRedirectFlag } from '@/app/services/api';

// Usar prefijo 'manager_' para todas las claves en localStorage
// Esto garantiza que NO se cruzen con 'admin_' ni 'participant_'
const STORAGE_KEY_TOKEN = 'manager_auth_token';
const STORAGE_KEY_USER = 'manager_auth_user';
const STORAGE_KEY_TIMESTAMP = 'manager_auth_timestamp';

export interface AdminUser {
  id: string;
  username: string;
  email: string;
  role: 'manager' | 'reporter';
  name?: string;
}

interface UseManagerAuthReturn {
  isAuthenticated: boolean;
  user: AdminUser | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  clearError: () => void;
  isSessionValid: () => boolean;
}

/**
 * Hook para gestionar autenticación del admin/reporter
 * Garantiza aislamiento total de sesión con otros frontends
 */
export function useManagerAuth(): UseManagerAuthReturn {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<AdminUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

  /**
   * Cargar sesión desde localStorage en cliente
   * Solo se ejecuta en el navegador para evitar problemas de SSR
   */
  useEffect(() => {
    const loadSessionFromStorage = () => {
      if (typeof window !== 'undefined') {
        const storedToken = localStorage.getItem(STORAGE_KEY_TOKEN);
        const storedUserJson = localStorage.getItem(STORAGE_KEY_USER);

        if (storedToken && storedUserJson) {
          try {
            const storedUser = JSON.parse(storedUserJson);
            setToken(storedToken);
            setUser(storedUser);
            setIsAuthenticated(true);
            // Resetear el flag de redirección cuando se carga una sesión válida
            resetAuthRedirectFlag();
          } catch (err) {
            console.error('Error al parsear usuario guardado:', err);
            localStorage.removeItem(STORAGE_KEY_TOKEN);
            localStorage.removeItem(STORAGE_KEY_USER);
            localStorage.removeItem(STORAGE_KEY_TIMESTAMP);
          }
        }
      }
      setIsLoading(false);
    };

    loadSessionFromStorage();

    // Escuchar cambios de sesión desde otras pestañas
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY_TOKEN) {
        if (e.newValue === null) {
          // Sesión cerrada en otra pestaña
          setIsAuthenticated(false);
          setUser(null);
          setToken(null);
        } else {
          // Sesión iniciada en otra pestaña
          const storedUserJson = localStorage.getItem(STORAGE_KEY_USER);
          if (storedUserJson) {
            try {
              const storedUser = JSON.parse(storedUserJson);
              setToken(e.newValue);
              setUser(storedUser);
              setIsAuthenticated(true);
              // Resetear el flag de redirección cuando se carga una sesión válida
              resetAuthRedirectFlag();
            } catch (err) {
              console.error('Error al sincronizar sesión:', err);
            }
          }
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  /**
   * Verificar si la sesión actual es válida
   * Puede incluir validación de expiración si es necesario
   */
  const isSessionValid = useCallback((): boolean => {
    if (!token || !user) return false;

    // Aquí se puede agregar validación de expiración del token si es necesario
    // const timestamp = localStorage.getItem(STORAGE_KEY_TIMESTAMP);
    // const age = Date.now() - (timestamp ? parseInt(timestamp) : 0);
    // const maxAge = 8 * 60 * 60 * 1000; // 8 horas para admin
    // return age < maxAge;

    return true;
  }, [token, user]);

  /**
   * Realizar login
   */
  const login = useCallback(
    async (username: string, password: string): Promise<boolean> => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await axios.post(`${API_URL}/auth/admin/login`, {
          username,
          password,
        });

        const { access_token, user: userData } = response.data;

        if (!access_token || !userData) {
          setError('Respuesta inválida del servidor');
          setIsLoading(false);
          return false;
        }

        // Guardar en localStorage con prefijo 'manager_'
        localStorage.setItem(STORAGE_KEY_TOKEN, access_token);
        localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(userData));
        localStorage.setItem(STORAGE_KEY_TIMESTAMP, Date.now().toString());

        // Actualizar estado
        setToken(access_token);
        setUser(userData);
        setIsAuthenticated(true);
        setIsLoading(false);

        // Resetear el flag de redirección cuando se hace login exitoso
        resetAuthRedirectFlag();

        return true;
      } catch (err: any) {
        const errorMsg =
          err.response?.data?.message || 'Error al autenticarse. Verifica tus credenciales.';
        setError(errorMsg);
        setIsLoading(false);
        return false;
      }
    },
    [API_URL]
  );

  /**
   * Realizar logout
   */
  const logout = useCallback(() => {
    // Limpiar localStorage
    localStorage.removeItem(STORAGE_KEY_TOKEN);
    localStorage.removeItem(STORAGE_KEY_USER);
    localStorage.removeItem(STORAGE_KEY_TIMESTAMP);

    // Actualizar estado
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
    setError(null);
  }, []);

  /**
   * Limpiar mensaje de error
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    isAuthenticated,
    user,
    token,
    isLoading,
    error,
    login,
    logout,
    clearError,
    isSessionValid,
  };
}
