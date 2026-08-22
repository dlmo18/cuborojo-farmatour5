import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

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
    const token = localStorage.getItem('manager_auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
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
    if (error.response?.status === 401) {
      // Token inválido o expirado
      localStorage.removeItem('manager_auth_token');
      localStorage.removeItem('manager_auth_user');
      window.location.href = '/login';
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
  isActive?: boolean;
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
  dni?: string;
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

export interface Level {
  id: string;
  worldId: string;
  name: string;
  description?: string;
  imageId?: string;
  orderNum: number;
  isGolden: boolean;
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
  isGolden?: boolean;
}

export interface UpdateLevelDto {
  worldId?: string;
  name?: string;
  description?: string;
  imageId?: string;
  orderNum?: number;
  isGolden?: boolean;
  isActive?: boolean;
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
  getAll: (params?: PaginationParams) => 
    apiClient.get<PaginatedResponse<MediaFile>>('/media', { params }),
  
  getById: (id: string) => 
    apiClient.get<MediaFile>(`/media/${id}`),
  
  upload: (file: File, type: 'image' | 'video' | 'audio' | 'document', tags?: string[]) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);
    if (tags && tags.length > 0) {
      formData.append('tags', JSON.stringify(tags));
    }
    return apiClient.post<MediaFile>('/media/upload', formData, {
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
