import axiosInstance from '@/lib/axiosInstance';

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  (process.env.NODE_ENV === 'production'
    ? 'https://farmatour5-api.cuborojo.pe/api'
    : 'http://localhost:3011/api');

// Usar la instancia de axios configurada con interceptores
const apiClient = axiosInstance;

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
