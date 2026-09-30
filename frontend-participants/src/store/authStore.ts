import { create } from 'zustand';

interface User {
  id: string;
  fullName: string;
  dni: string;
  email?: string;
  totalStars: number;
  group: { id: string; name: string } | null;
}

interface AuthStore {
  user: User | null;
  token: string | null;
  dni: string | null;
  isLoading: boolean;
  error: string | null;
  login: (dni: string) => Promise<boolean>;
  logout: () => void;
  setUser: (user: User) => void;
  refreshToken: () => Promise<boolean>;
}

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  (process.env.NODE_ENV === 'production'
    ? 'https://farmatour5-api.cuborojo.pe/api'
    : 'http://localhost:3001/api');

// Función para obtener DNI de localStorage de forma segura
const getInitialDni = () => {
  if (typeof window === 'undefined') return null;
  try {
    return localStorage.getItem('dni');
  } catch (err) {
    console.error('Error reading dni from localStorage:', err);
    return null;
  }
};

// Función para obtener token y usuario de localStorage de forma segura
const getInitialToken = () => {
  if (typeof window === 'undefined') return null;
  try {
    return localStorage.getItem('token');
  } catch (err) {
    console.error('Error reading token from localStorage:', err);
    return null;
  }
};

const getInitialUser = () => {
  if (typeof window === 'undefined') return null;
  try {
    const userData = localStorage.getItem('user');
    return userData ? JSON.parse(userData) : null;
  } catch (err) {
    console.error('Error reading user from localStorage:', err);
    return null;
  }
};

export const useAuthStore = create<AuthStore>((set) => ({
  user: getInitialUser(),
  token: getInitialToken(),
  dni: getInitialDni(),
  isLoading: false,
  error: null,

  login: async (dni: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(`${API_URL}/auth/participant/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dni }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al iniciar sesión');
      }

      const { access_token, participant } = await response.json();
      localStorage.setItem('token', access_token);
      localStorage.setItem('user', JSON.stringify(participant));
      localStorage.setItem('dni', dni);
      set({ token: access_token, user: participant, dni, isLoading: false });
      return true;
    } catch (err: any) {
      const errorMsg = err.message || 'Error al iniciar sesión. Verifica tu DNI.';
      set({ error: errorMsg, isLoading: false });
      return false;
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('dni');
    set({ user: null, token: null, dni: null });
  },

  setUser: (user: User) => {
    localStorage.setItem('user', JSON.stringify(user));
    set({ user });
  },

  refreshToken: async () => {
    const dni = localStorage.getItem('dni');
    if (!dni) {
      console.warn('No DNI found for token refresh');
      return false;
    }

    try {
      const response = await fetch(`${API_URL}/auth/participant/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dni }),
      });

      if (!response.ok) {
        throw new Error('Token refresh failed');
      }

      const { access_token, participant } = await response.json();
      localStorage.setItem('token', access_token);
      localStorage.setItem('user', JSON.stringify(participant));
      set({ token: access_token, user: participant });
      return true;
    } catch (err: any) {
      console.error('Error refreshing token:', err);
      // Si falla el refresh, logout automático
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('dni');
      set({ user: null, token: null, dni: null });
      return false;
    }
  },
}));
