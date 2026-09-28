import axios, { AxiosInstance } from 'axios';

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  (process.env.NODE_ENV === 'production'
    ? 'https://farmatour5-api.cuborojo.pe/api'
    : 'http://localhost:3001/api');

// Crear instancia de axios con configuración base
const apiClient: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar token en cada petición
apiClient.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('auth_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ============================================================
// TIPOS
// ============================================================

export interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ============================================================
// COMO JUGAR (HOW TO PLAY)
// ============================================================

export interface HowToPlay {
  id: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export const howToPlayApi = {
  get: () => 
    apiClient.get<HowToPlay>('/how-to-play'),
};

// ============================================================
// PREGUNTAS FRECUENTES (FAQ)
// ============================================================

export interface FaqItem {
  id: string;
  title: string;
  detail: string;
  orderNum: number;
  createdAt: string;
  updatedAt: string;
}

export const faqApi = {
  getPublic: () => 
    apiClient.get<FaqItem[]>('/faq/public'),
};

// ============================================================
// MENSAJES (MESSAGES)
// ============================================================

export interface CreateMessageDto {
  fullName: string;
  email: string;
  subject: string;
  message: string;
}

export interface MessageResponse {
  id: string;
  fullName: string;
  email: string;
  subject: string;
  message: string;
  createdAt: string;
}

export const messagesApi = {
  create: (data: CreateMessageDto) => 
    apiClient.post<MessageResponse>('/messages', data),
};

export default apiClient;
