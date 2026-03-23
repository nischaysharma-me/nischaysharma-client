import { apiFetch } from './apiClient';
import { Billboard, CreateBillboardData, UpdateBillboardData } from '@/lib/types/billboard';
import { ActionResponse } from '@/lib/types/common';

export const billboardService = {
  listBillboards: async (token?: string, isActive?: boolean): Promise<ActionResponse<Billboard[]>> => {
    const queryParams = new URLSearchParams();
    if (isActive !== undefined) queryParams.append('isActive', String(isActive));
    const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
    
    return apiFetch<ActionResponse<Billboard[]>>(`/billboards${queryString}`, {
      method: 'GET',
      token,
    });
  },

  createBillboard: (data: CreateBillboardData, token: string): Promise<ActionResponse<Billboard>> => {
    return apiFetch<ActionResponse<Billboard>>('/billboards', {
      method: 'POST',
      token,
      body: data,
    });
  },

  updateBillboard: (id: string, data: UpdateBillboardData, token: string): Promise<ActionResponse<Billboard>> => {
    return apiFetch<ActionResponse<Billboard>>(`/billboards/${id}`, {
      method: 'PATCH',
      token,
      body: data,
    });
  },

  deleteBillboard: (id: string, token: string): Promise<ActionResponse<any>> => {
    return apiFetch<ActionResponse<any>>(`/billboards/${id}`, {
      method: 'DELETE',
      token,
    });
  },

  generateImage: (id: string, token: string, prompt?: string): Promise<ActionResponse<Billboard>> => {
    return apiFetch<ActionResponse<Billboard>>(`/billboards/${id}/generate-image`, {
      method: 'POST',
      token,
      body: { prompt },
    });
  }
};
