import { create } from 'zustand';

interface CurrentWorld {
  id: string;
  name: string;
  slug?: string;
}

interface WorldStore {
  currentWorld: CurrentWorld | null;
  setCurrentWorld: (world: CurrentWorld | null) => void;
  setWorldBySlug: (slug: string) => void;
  clearCurrentWorld: () => void;
}

// Función para obtener mundo actual de localStorage
const getInitialWorld = () => {
  if (typeof window === 'undefined') return null;
  try {
    const worldData = localStorage.getItem('currentWorld');
    return worldData ? JSON.parse(worldData) : null;
  } catch (err) {
    console.error('Error reading currentWorld from localStorage:', err);
    return null;
  }
};

export const useWorldStore = create<WorldStore>((set) => ({
  currentWorld: getInitialWorld(),

  setCurrentWorld: (world: CurrentWorld | null) => {
    set({ currentWorld: world });
    if (typeof window !== 'undefined') {
      if (world) {
        localStorage.setItem('currentWorld', JSON.stringify(world));
      } else {
        localStorage.removeItem('currentWorld');
      }
    }
  },

  setWorldBySlug: (slug: string) => {
    set((state) => {
      if (state.currentWorld?.slug === slug) {
        return state;
      }
      return {
        currentWorld: state.currentWorld ? { ...state.currentWorld, slug } : null,
      };
    });
  },

  clearCurrentWorld: () => {
    set({ currentWorld: null });
    if (typeof window !== 'undefined') {
      localStorage.removeItem('currentWorld');
    }
  },
}));
