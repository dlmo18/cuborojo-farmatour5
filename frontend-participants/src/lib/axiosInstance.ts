import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '@/store/authStore';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

// Crear instancia de axios
const axiosInstance: AxiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 30000, // 30 segundos para la mayoría de peticiones
});

// Flag para evitar bucles infinitos de retry
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: AxiosError) => void;
}> = [];

const processQueue = (error: AxiosError | null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token || '');
    }
  });

  isRefreshing = false;
  failedQueue = [];
};

// Interceptor de request - agregar token y timeout dinámico
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Timeout más largo para endpoints pesados
    if (config.url?.includes('/detail') || config.url?.includes('/game-state')) {
      config.timeout = 60000; // 60 segundos para queries complejas
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor de response - detectar 401 y auto-login
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Si no es 401 o ya reintentó una vez, rechazar
    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    // Evitar bucles infinitos
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return axiosInstance(originalRequest);
        })
        .catch((err) => Promise.reject(err));
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      // Intentar refresh silencioso usando DNI guardado
      const refreshed = await useAuthStore.getState().refreshToken();

      if (refreshed) {
        const newToken = useAuthStore.getState().token;
        processQueue(null, newToken);

        // Reintentar solicitud original con nuevo token
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return axiosInstance(originalRequest);
      } else {
        // Refresh falló, rechazar
        const err = new Error('Token refresh failed');
        processQueue(error);
        return Promise.reject(error);
      }
    } catch (refreshError) {
      processQueue(error);
      return Promise.reject(refreshError);
    }
  }
);

export default axiosInstance;
