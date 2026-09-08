import { create } from 'zustand';
import axios from 'axios';

interface User {
  id: string;
  fullName: string;
  dni: string;
  totalStars: number;
  group: { id: string; name: string } | null;
}

interface AuthStore {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  login: (dni: string) => Promise<boolean>;
  logout: () => void;
  setUser: (user: User) => void;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

// Función para obtener token de localStorage de forma segura
const getInitialToken = () => {
  if (typeof window === 'undefined') return null;
  try {
    return localStorage.getItem('token');
  } catch (err) {
    console.error('Error reading token from localStorage:', err);
    return null;
  }
};

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  token: getInitialToken(),
  isLoading: false,
  error: null,

  login: async (dni: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.post(`${API_URL}/auth/participant/login`, { dni });
      const { access_token, participant } = response.data;
      localStorage.setItem('token', access_token);
      set({ token: access_token, user: participant, isLoading: false });
      return true;
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Error al iniciar sesión. Verifica tu DNI.';
      set({ error: errorMsg, isLoading: false });
      return false;
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    set({ user: null, token: null });
  },

  setUser: (user: User) => set({ user }),
}));
