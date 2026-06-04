import { apiFetch } from './apiClient';

export interface ExperienceRole {
  title: string;
  startDate: string;
  endDate: string;
  description: string;
  employmentType?: string;
}

export interface Experience {
  id?: string;
  company: string;
  location?: string;
  logo?: string;
  roles: ExperienceRole[];
  order?: number;
}

export const experienceService = {
  list: (token: string) => 
    apiFetch<{ success: boolean; data: Experience[] }>('/experience', { 
      token 
    }),

  create: (data: Partial<Experience>, token: string) => 
    apiFetch<{ success: boolean; data: Experience }>('/experience', { 
      method: 'POST', 
      body: data, 
      token 
    }),

  update: (id: string, data: Partial<Experience>, token: string) => 
    apiFetch<{ success: boolean; data: Experience }>(`/experience/${id}`, { 
      method: 'PUT', 
      body: data, 
      token 
    }),

  delete: (id: string, token: string) => 
    apiFetch<{ success: boolean; message: string }>(`/experience/${id}`, { 
      method: 'DELETE', 
      token 
    }),
};
