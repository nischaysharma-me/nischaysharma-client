import { apiFetch } from './apiClient';
import { StackItem, CreateStackItemData } from '@/lib/types/stack';
import { ActionResponse } from '@/lib/types/common';

export const stackService = {
  listStackItems: async (): Promise<ActionResponse<StackItem[]>> => {
    return apiFetch<ActionResponse<StackItem[]>>('/stack', {
      method: 'GET',
    });
  },

  createStackItem: async (data: CreateStackItemData, token: string): Promise<ActionResponse<StackItem>> => {
    return apiFetch<ActionResponse<StackItem>>('/stack', {
      method: 'POST',
      token,
      body: data,
    });
  },

  updateStackItem: async (id: string, data: Partial<CreateStackItemData>, token: string): Promise<ActionResponse<StackItem>> => {
    return apiFetch<ActionResponse<StackItem>>(`/stack/${id}`, {
      method: 'PATCH',
      token,
      body: data,
    });
  },

  deleteStackItem: async (id: string, token: string): Promise<ActionResponse<any>> => {
    return apiFetch<ActionResponse<any>>(`/stack/${id}`, {
      method: 'DELETE',
      token,
    });
  },

  generateStackItemImage: async (id: string, prompt: string, token: string): Promise<ActionResponse<any>> => {
    return apiFetch<ActionResponse<any>>(`/stack/${id}/generate-image`, {
      method: 'POST',
      token,
      body: { prompt },
    });
  }
};
