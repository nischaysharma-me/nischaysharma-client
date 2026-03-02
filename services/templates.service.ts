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

  listTemplates: () => {
    return apiFetch<any>('/articles/templates', {
      method: 'GET',
    });
  }
};
