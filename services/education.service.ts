import { apiFetch } from './apiClient';

export interface Education {
  id?: string;
  school: string;
  degree: string;
  fieldOfStudy: string;
  startDate: string;
  endDate: string;
  logo?: string;
  description?: string;
  order?: number;
  current?: boolean;
}

export const educationService = {
  list: (token: string) => 
    apiFetch<{ success: boolean; data: Education[] }>('/education', { 
      token 
    }),

  create: (data: Partial<Education>, token: string) => 
    apiFetch<{ success: boolean; data: Education }>('/education', { 
      method: 'POST', 
      body: data, 
      token 
    }),

  update: (id: string, data: Partial<Education>, token: string) => 
    apiFetch<{ success: boolean; data: Education }>(`/education/${id}`, { 
      method: 'PUT', 
      body: data, 
      token 
    }),

  delete: (id: string, token: string) => 
    apiFetch<{ success: boolean; message: string }>(`/education/${id}`, { 
      method: 'DELETE', 
      token 
    }),
};
