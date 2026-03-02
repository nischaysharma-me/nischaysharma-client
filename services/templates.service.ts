import { apiFetch } from './apiClient';

export interface GenerateTemplateData {
  description: string;
  category: string;
}

export const templatesService = {
  getTemplateConfig: () => {
    return apiFetch<any>('/articles/templates/config', {
      method: 'GET',
    });
  },

  generateTemplate: (data: GenerateTemplateData, token: string) => {
    return apiFetch<any>('/articles/templates/generate', {
      method: 'POST',
      token,
      body: data,
    });
  },

  updateTemplate: (id: string, data: any, token: string) => {
    return apiFetch<any>(`/articles/templates/${id}`, {
      method: 'PATCH',
      token,
      body: data,
    });
  },

  deleteTemplate: (id: string, token: string) => {
    return apiFetch<any>(`/articles/templates/${id}`, {
      method: 'DELETE',
      token,
    });
  },

  listTemplates: () => {
    return apiFetch<any>('/articles/templates', {
      method: 'GET',
    });
  }
};
