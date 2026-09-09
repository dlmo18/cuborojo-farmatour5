import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';

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

// Flag para evitar múltiples redirecciones al login
let isRedirecting = false;

// Función para resetear el flag de redirección (se llama después de login)
export const resetAuthRedirectFlag = () => {
  isRedirecting = false;
};

// Interceptor para agregar token en cada petición
apiClient.interceptors.request.use(
  (config) => {
    // Solo agregar token si está disponible en localStorage
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('manager_auth_token');
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

// Interceptor para manejar errores de autenticación
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Solo manejar 401 si no estamos ya redirigiendo
    if (error.response?.status === 401 && !isRedirecting && typeof window !== 'undefined') {
      isRedirecting = true;
      
      // Limpiar datos de sesión
      try {
        localStorage.removeItem('manager_auth_token');
        localStorage.removeItem('manager_auth_user');
        localStorage.removeItem('manager_auth_timestamp');
      } catch (e) {
        console.error('Error limpiando localStorage:', e);
      }
      
      // Redirigir al login después de un pequeño delay
      setTimeout(() => {
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }, 100);
    }
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
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ============================================================
// USUARIOS DEL SISTEMA
// ============================================================

export interface SystemUser {
  id: string;
  username: string;
  email: string;
  fullName: string;
  role: 'manager' | 'reporter';
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserDto {
  username: string;
  email: string;
  password: string;
  fullName?: string;
  role: 'manager' | 'reporter';
}

export interface UpdateUserDto {
  email?: string;
  password?: string;
  fullName?: string;
  role?: 'manager' | 'reporter';
  isActive?: boolean;
}

export const usersApi = {
  getAll: (params?: PaginationParams) => 
    apiClient.get<PaginatedResponse<SystemUser>>('/users', { params }),
  
  getById: (id: string) => 
    apiClient.get<SystemUser>(`/users/${id}`),
  
  create: (data: CreateUserDto) => 
    apiClient.post<SystemUser>('/users', data),
  
  update: (id: string, data: UpdateUserDto) => 
    apiClient.put<SystemUser>(`/users/${id}`, data),
  
  delete: (id: string) => 
    apiClient.delete(`/users/${id}`),
};

// ============================================================
// GRUPOS
// ============================================================

export interface Group {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateGroupDto {
  name: string;
  description?: string;
}

export interface UpdateGroupDto {
  name?: string;
  description?: string;
}

export const groupsApi = {
  getAll: (params?: PaginationParams) => 
    apiClient.get<PaginatedResponse<Group>>('/groups', { params }),
  
  getById: (id: string) => 
    apiClient.get<Group>(`/groups/${id}`),
  
  create: (data: CreateGroupDto) => 
    apiClient.post<Group>('/groups', data),
  
  update: (id: string, data: UpdateGroupDto) => 
    apiClient.put<Group>(`/groups/${id}`, data),
  
  delete: (id: string) => 
    apiClient.delete(`/groups/${id}`),
};

// ============================================================
// PARTICIPANTES
// ============================================================

export interface Participant {
  id: string;
  dni: string;
  fullName: string;
  email?: string;
  groupId?: string;
  group?: Group;
  isActive: boolean;
  totalStars: number;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateParticipantDto {
  dni: string;
  fullName: string;
  email?: string;
  groupId?: string;
}

export interface UpdateParticipantDto {
  fullName?: string;
  email?: string;
  groupId?: string;
  isActive?: boolean;
}

export const participantsApi = {
  getAll: (params?: PaginationParams) => 
    apiClient.get<PaginatedResponse<Participant>>('/participants', { params }),
  
  getById: (id: string) => 
    apiClient.get<Participant>(`/participants/${id}`),
  
  create: (data: CreateParticipantDto) => 
    apiClient.post<Participant>('/participants', data),
  
  update: (id: string, data: UpdateParticipantDto) => 
    apiClient.put<Participant>(`/participants/${id}`, data),
  
  delete: (id: string) => 
    apiClient.delete(`/participants/${id}`),
  
  import: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return apiClient.post('/participants/import', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

// ============================================================
// MUNDOS
// ============================================================

export interface World {
  id: string;
  name: string;
  description?: string;
  imageId?: string;
  orderNum: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateWorldDto {
  name: string;
  description?: string;
  imageId?: string;
  orderNum: number;
}

export interface UpdateWorldDto {
  name?: string;
  description?: string;
  imageId?: string;
  orderNum?: number;
  isActive?: boolean;
}

export const worldsApi = {
  getAll: (params?: PaginationParams) => 
    apiClient.get<PaginatedResponse<World>>('/worlds', { params }),
  
  getById: (id: string) => 
    apiClient.get<World>(`/worlds/${id}`),
  
  create: (data: CreateWorldDto) => 
    apiClient.post<World>('/worlds', data),
  
  update: (id: string, data: UpdateWorldDto) => 
    apiClient.put<World>(`/worlds/${id}`, data),
  
  delete: (id: string) => 
    apiClient.delete(`/worlds/${id}`),
};

// ============================================================
// NIVELES
// ============================================================

export type LevelType = 'normal' | 'golden' | 'final';

export interface Level {
  id: string;
  worldId: string;
  name: string;
  description?: string;
  imageId?: string;
  orderNum: number;
  levelType: LevelType;
  isGolden: boolean;
  introVideoUrl?: string;
  introVideoId?: string;
  maxStars: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateLevelDto {
  worldId: string;
  name: string;
  description?: string;
  imageId?: string;
  orderNum: number;
  levelType?: LevelType;
  isGolden?: boolean;
  introVideoUrl?: string;
  introVideoId?: string;
}

export interface UpdateLevelDto {
  worldId?: string;
  name?: string;
  description?: string;
  imageId?: string;
  orderNum?: number;
  levelType?: LevelType;
  isGolden?: boolean;
  introVideoUrl?: string;
  introVideoId?: string;
  isActive?: boolean;
}

export interface LevelItem {
  id: string;
  levelId: string;
  title: string;
  detail?: string;
  benefits?: string;
  imageId?: string;
  thumbnailId?: string;
  orderNum: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateLevelItemDto {
  title: string;
  detail?: string;
  benefits?: string;
  imageId?: string;
  thumbnailId?: string;
  orderNum: number;
}

// Golden Level Interfaces
export interface GoldenLevelItem {
  id: string;
  levelId: string;
  title: string;
  detail?: string;
  orderNum: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateGoldenLevelItemDto {
  levelId: string;
  title: string;
  detail?: string;
  orderNum: number;
}

export interface UpdateGoldenLevelItemDto {
  title?: string;
  detail?: string;
  orderNum?: number;
}

export interface GoldenLevelQuestion {
  id: string;
  levelId: string;
  content: string;
  orderNum: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateGoldenLevelQuestionDto {
  levelId: string;
  content: string;
  orderNum: number;
}

export interface UpdateGoldenLevelQuestionDto {
  content?: string;
  orderNum?: number;
  isActive?: boolean;
}

export interface GoldenLevelAnswerOption {
  id: string;
  questionId: string;
  text: string;
  isCorrect: boolean;
  orderNum: number;
  createdAt: string;
}

export interface CreateGoldenLevelAnswerOptionDto {
  questionId: string;
  text: string;
  isCorrect: boolean;
  orderNum: number;
}

export interface UpdateGoldenLevelAnswerOptionDto {
  text?: string;
  isCorrect?: boolean;
  orderNum?: number;
}

// Final Level Interfaces
export interface FinalLevelQuestion {
  id: string;
  levelId: string;
  content: string;
  startVideoUrl?: string;
  startVideoId?: string;
  endVideoUrl?: string;
  endVideoId?: string;
  correctMessage?: string;
  incorrectMessage?: string;
  orderNum: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateFinalLevelQuestionDto {
  levelId: string;
  content: string;
  startVideoUrl?: string;
  startVideoId?: string;
  endVideoUrl?: string;
  endVideoId?: string;
  correctMessage?: string;
  incorrectMessage?: string;
  orderNum: number;
}

export interface UpdateFinalLevelQuestionDto {
  content?: string;
  startVideoUrl?: string;
  startVideoId?: string;
  endVideoUrl?: string;
  endVideoId?: string;
  correctMessage?: string;
  incorrectMessage?: string;
  orderNum?: number;
  isActive?: boolean;
}

export interface FinalLevelAnswerOption {
  id: string;
  questionId: string;
  text: string;
  imageId?: string;
  isCorrect: boolean;
  orderNum: number;
  createdAt: string;
}

export interface CreateFinalLevelAnswerOptionDto {
  questionId: string;
  text: string;
  imageId?: string;
  isCorrect: boolean;
  orderNum: number;
}

export interface UpdateFinalLevelAnswerOptionDto {
  text?: string;
  imageId?: string;
  isCorrect?: boolean;
  orderNum?: number;
}

export interface UpdateLevelItemDto {
  title?: string;
  detail?: string;
  benefits?: string;
  imageId?: string;
  thumbnailId?: string;
  orderNum?: number;
}

export const levelsApi = {
  getAll: (params?: PaginationParams) => 
    apiClient.get<PaginatedResponse<Level>>('/levels', { params }),
  
  getByWorld: (worldId: string) => 
    apiClient.get<Level[]>(`/levels/world/${worldId}`),
  
  getById: (id: string) => 
    apiClient.get<Level>(`/levels/${id}`),
  
  create: (data: CreateLevelDto) => 
    apiClient.post<Level>('/levels', data),
  
  update: (id: string, data: UpdateLevelDto) => 
    apiClient.put<Level>(`/levels/${id}`, data),
  
  delete: (id: string) => 
    apiClient.delete(`/levels/${id}`),

  // Items (Contenido)
  getItems: (levelId: string) =>
    apiClient.get<LevelItem[]>(`/levels/${levelId}/items`),

  createItem: (levelId: string, data: CreateLevelItemDto) =>
    apiClient.post<LevelItem>(`/levels/${levelId}/items`, data),

  updateItem: (itemId: string, data: UpdateLevelItemDto) =>
    apiClient.put<LevelItem>(`/levels/items/${itemId}`, data),

  deleteItem: (itemId: string) =>
    apiClient.delete(`/levels/items/${itemId}`),
};

// Golden Levels API
export const goldenLevelsApi = {
  // Items
  getItems: (levelId: string) => 
    apiClient.get<GoldenLevelItem[]>(`/levels/golden/${levelId}/items`),
  
  createItem: (data: CreateGoldenLevelItemDto) => 
    apiClient.post<GoldenLevelItem>('/levels/golden/items', data),
  
  updateItem: (id: string, data: UpdateGoldenLevelItemDto) => 
    apiClient.put<GoldenLevelItem>(`/levels/golden/items/${id}`, data),
  
  deleteItem: (id: string) => 
    apiClient.delete(`/levels/golden/items/${id}`),

  // Questions
  getQuestions: (levelId: string) => 
    apiClient.get<GoldenLevelQuestion[]>(`/levels/golden/${levelId}/questions`),
  
  createQuestion: (data: CreateGoldenLevelQuestionDto) => 
    apiClient.post<GoldenLevelQuestion>('/levels/golden/questions', data),
  
  updateQuestion: (id: string, data: UpdateGoldenLevelQuestionDto) => 
    apiClient.put<GoldenLevelQuestion>(`/levels/golden/questions/${id}`, data),
  
  deleteQuestion: (id: string) => 
    apiClient.delete(`/levels/golden/questions/${id}`),

  // Answer Options
  getAnswers: (questionId: string) => 
    apiClient.get<GoldenLevelAnswerOption[]>(`/levels/golden/questions/${questionId}/answers`),
  
  createAnswer: (data: CreateGoldenLevelAnswerOptionDto) => 
    apiClient.post<GoldenLevelAnswerOption>('/levels/golden/answers', data),
  
  updateAnswer: (id: string, data: UpdateGoldenLevelAnswerOptionDto) => 
    apiClient.put<GoldenLevelAnswerOption>(`/levels/golden/answers/${id}`, data),
  
  deleteAnswer: (id: string) => 
    apiClient.delete(`/levels/golden/answers/${id}`),

  // Full Content
  getContent: (levelId: string) => 
    apiClient.get<{ items: GoldenLevelItem[]; questions: GoldenLevelQuestion[] }>(`/levels/golden/${levelId}/content`),
};

// Final Levels API
export const finalLevelsApi = {
  // Questions
  getQuestions: (levelId: string) => 
    apiClient.get<FinalLevelQuestion[]>(`/levels/final/${levelId}/questions`),
  
  createQuestion: (data: CreateFinalLevelQuestionDto) => 
    apiClient.post<FinalLevelQuestion>('/levels/final/questions', data),
  
  updateQuestion: (id: string, data: UpdateFinalLevelQuestionDto) => 
    apiClient.put<FinalLevelQuestion>(`/levels/final/questions/${id}`, data),
  
  deleteQuestion: (id: string) => 
    apiClient.delete(`/levels/final/questions/${id}`),

  // Answer Options
  getAnswers: (questionId: string) => 
    apiClient.get<FinalLevelAnswerOption[]>(`/levels/final/questions/${questionId}/answers`),
  
  createAnswer: (data: CreateFinalLevelAnswerOptionDto) => 
    apiClient.post<FinalLevelAnswerOption>('/levels/final/answers', data),
  
  updateAnswer: (id: string, data: UpdateFinalLevelAnswerOptionDto) => 
    apiClient.put<FinalLevelAnswerOption>(`/levels/final/answers/${id}`, data),
  
  deleteAnswer: (id: string) => 
    apiClient.delete(`/levels/final/answers/${id}`),

  // Full Content
  getContent: (levelId: string) => 
    apiClient.get<{ questions: FinalLevelQuestion[] }>(`/levels/final/${levelId}/content`),
};

// ============================================================
// MISIONES
// ============================================================

export interface MissionItem {
  id: string;
  missionId: string;
  title: string;
  imageId?: string;
  thumbnailId?: string;
  benefits?: string;
  contentBadges?: any[];
  detail?: string;
  orderNum: number;
  createdAt: string;
  updatedAt: string;
}

export interface Mission {
  id: string;
  levelId: string;
  name: string;
  description?: string;
  imageId?: string;
  orderNum: number;
  maxStars: number;
  isActive: boolean;
  items?: MissionItem[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateMissionDto {
  levelId: string;
  name: string;
  description?: string;
  imageId?: string;
  orderNum: number;
  maxStars?: number;
}

export interface UpdateMissionDto {
  levelId?: string;
  name?: string;
  description?: string;
  imageId?: string;
  orderNum?: number;
  maxStars?: number;
  isActive?: boolean;
}

export interface CreateMissionItemDto {
  title: string;
  imageId?: string;
  thumbnailId?: string;
  benefits?: string;
  contentBadges?: any[];
  detail?: string;
  orderNum: number;
}

export interface UpdateMissionItemDto {
  title?: string;
  imageId?: string;
  thumbnailId?: string;
  benefits?: string;
  contentBadges?: any[];
  detail?: string;
  orderNum?: number;
}

export const missionsApi = {
  getAll: (params?: PaginationParams) => 
    apiClient.get<PaginatedResponse<Mission>>('/missions', { params }),
  
  getByLevel: (levelId: string) => 
    apiClient.get<Mission[]>(`/missions/level/${levelId}`),
  
  getById: (id: string) => 
    apiClient.get<Mission>(`/missions/${id}`),
  
  getDetail: (id: string) => 
    apiClient.get<Mission>(`/missions/${id}/detail`),
  
  getItems: (missionId: string) =>
    apiClient.get<MissionItem[]>(`/missions/${missionId}/items`),
  
  create: (data: CreateMissionDto) => 
    apiClient.post<Mission>('/missions', data),
  
  update: (id: string, data: UpdateMissionDto) => 
    apiClient.put<Mission>(`/missions/${id}`, data),
  
  delete: (id: string) => 
    apiClient.delete(`/missions/${id}`),
  
  // Items
  createItem: (missionId: string, data: CreateMissionItemDto) => 
    apiClient.post<MissionItem>(`/missions/${missionId}/items`, data),
  
  updateItem: (itemId: string, data: UpdateMissionItemDto) => 
    apiClient.put<MissionItem>(`/missions/items/${itemId}`, data),
  
  deleteItem: (itemId: string) => 
    apiClient.delete(`/missions/items/${itemId}`),
};

// ============================================================
// PREGUNTAS
// ============================================================

export interface AnswerOption {
  id: string;
  questionId: string;
  text: string;
  imageId?: string;
  isCorrect: boolean;
  detail?: string;
  orderNum: number;
  createdAt: string;
}

export interface Question {
  id: string;
  missionId: string;
  content: string;
  imageId?: string;
  orderNum: number;
  starsValue: number;
  isActive: boolean;
  options?: AnswerOption[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateQuestionDto {
  missionId: string;
  content: string;
  imageId?: string;
  orderNum: number;
  starsValue?: number;
}

export interface UpdateQuestionDto {
  content?: string;
  imageId?: string;
  orderNum?: number;
  starsValue?: number;
  isActive?: boolean;
}

export interface CreateAnswerOptionDto {
  text: string;
  imageId?: string;
  isCorrect: boolean;
  detail?: string;
  orderNum: number;
}

export interface UpdateAnswerOptionDto {
  text?: string;
  imageId?: string;
  isCorrect?: boolean;
  detail?: string;
  orderNum?: number;
}

export const questionsApi = {
  getByMission: (missionId: string) => 
    apiClient.get<Question[]>(`/questions/mission/${missionId}`),
  
  getByMissionAdmin: (missionId: string) => 
    apiClient.get<Question[]>(`/questions/mission/${missionId}/admin`),
  
  getById: (id: string) => 
    apiClient.get<Question>(`/questions/${id}`),
  
  create: (data: CreateQuestionDto) => 
    apiClient.post<Question>('/questions', data),
  
  update: (id: string, data: UpdateQuestionDto) => 
    apiClient.put<Question>(`/questions/${id}`, data),
  
  delete: (id: string) => 
    apiClient.delete(`/questions/${id}`),
  
  // Opciones
  createOption: (questionId: string, data: CreateAnswerOptionDto) => 
    apiClient.post<AnswerOption>(`/questions/${questionId}/options`, data),
  
  updateOption: (optionId: string, data: UpdateAnswerOptionDto) => 
    apiClient.put<AnswerOption>(`/questions/options/${optionId}`, data),
  
  deleteOption: (optionId: string) => 
    apiClient.delete(`/questions/options/${optionId}`),
};

// ============================================================
// BIBLIOTECA DE MEDIOS
// ============================================================

export interface MediaFile {
  id: string;
  name: string;
  type: 'image' | 'video' | 'audio' | 'document';
  url: string;
  fileSize?: number;
  mimeType?: string;
  width?: number;
  height?: number;
  duration?: number;
  tags?: string[];
  uploadedBy?: string;
  createdAt: string;
}

export const mediaApi = {
  getAll: (params?: { page?: number; limit?: number; type?: string; search?: string }) => 
    apiClient.get<PaginatedResponse<MediaFile>>('/media', { params }),
  
  getById: (id: string) => 
    apiClient.get<MediaFile>(`/media/${id}`),
  
  upload: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return apiClient.post<MediaFile>('/media/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  uploadMultiple: (files: File[]) => {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('files', file);
    });
    return apiClient.post<MediaFile[]>('/media/upload-multiple', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  
  delete: (id: string) => 
    apiClient.delete(`/media/${id}`),
};

// ============================================================
// CONFIGURACIÓN
// ============================================================

export interface SystemConfig {
  id: string;
  key: string;
  value: string;
  description?: string;
  updatedAt: string;
}

export const configApi = {
  getAll: () => 
    apiClient.get<SystemConfig[]>('/config'),
  
  update: (key: string, value: string) => 
    apiClient.put<SystemConfig>('/config', { key, value }),
};

// ============================================================
// REPORTES
// ============================================================

export const reportsApi = {
  top10Participants: () => 
    apiClient.get('/reports/top10-participants'),
  
  top10Groups: () => 
    apiClient.get('/reports/top10-groups'),
  
  participantSummary: (params?: PaginationParams) => 
    apiClient.get('/reports/participant-summary', { params }),
  
  worldCompletion: () => 
    apiClient.get('/reports/world-completion'),
  
  missionCompletion: () => 
    apiClient.get('/reports/mission-completion'),
  
  activity: (days: number = 7) => 
    apiClient.get('/reports/activity', { params: { days } }),
  
  groupLeaderboard: () => 
    apiClient.get('/reports/group-leaderboard'),
  
  participantDetail: (id: string) => 
    apiClient.get(`/reports/participant/${id}`),
};

export default apiClient;
