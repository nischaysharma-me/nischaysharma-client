import { apiFetch } from './apiClient';
import { Project, CreateProjectData } from '@/lib/types/project';
import { ActionResponse } from '@/lib/types/common';

export const projectsService = {
  list: (token?: string): Promise<ActionResponse<Project[]>> => {
    return apiFetch<ActionResponse<Project[]>>('/projects', {
      method: 'GET',
      token,
    });
  },

  create: (data: CreateProjectData, token: string): Promise<ActionResponse<Project>> => {
    return apiFetch<ActionResponse<Project>>('/projects', {
      method: 'POST',
      token,
      body: data,
    });
  },

  update: (id: string, data: Partial<Project>, token: string): Promise<ActionResponse<Project>> => {
    return apiFetch<ActionResponse<Project>>(`/projects/${id}`, {
      method: 'PATCH',
      token,
      body: data,
    });
  },

  delete: (id: string, token: string): Promise<ActionResponse<any>> => {
    return apiFetch<ActionResponse<any>>(`/projects/${id}`, {
      method: 'DELETE',
      token,
    });
  }
};
