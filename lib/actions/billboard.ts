'use server';

import { apiFetch } from '@/services/apiClient';
import { ActionResponse } from '@/lib/types/common';
import { revalidatePath } from 'next/cache';

export async function listBillboardsAction(token?: string, isActive?: boolean): Promise<ActionResponse> {
  try {
    const queryParams = new URLSearchParams();
    if (isActive !== undefined) queryParams.append('isActive', String(isActive));
    const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
    
    return await apiFetch<ActionResponse>(`/billboards${queryString}`, {
      method: 'GET',
      token,
    });
  } catch (error: any) {
    console.error('Server Action Error (listBillboards):', error);
    return { success: false, error: error.message || 'Failed to fetch billboards' };
  }
}

export async function createBillboardAction(formData: FormData, token: string): Promise<ActionResponse> {
  try {
    const response = await apiFetch<ActionResponse>('/billboards', {
      method: 'POST',
      token,
      body: formData, // Sending multipart/form-data
    });
    if (response.success) {
      revalidatePath('/admin/billboard');
      revalidatePath('/billboard');
    }
    return response;
  } catch (error: any) {
    console.error('Server Action Error (createBillboard):', error);
    return { success: false, error: error.message || 'Failed to create billboard item' };
  }
}

export async function updateBillboardAction(id: string, formData: FormData, token: string): Promise<ActionResponse> {
  try {
    const response = await apiFetch<ActionResponse>(`/billboards/${id}`, {
      method: 'PATCH',
      token,
      body: formData, // Sending multipart/form-data
    });
    if (response.success) {
      revalidatePath('/admin/billboard');
      revalidatePath('/billboard');
    }
    return response;
  } catch (error: any) {
    console.error('Server Action Error (updateBillboard):', error);
    return { success: false, error: error.message || 'Failed to update billboard item' };
  }
}

export async function deleteBillboardAction(id: string, token: string): Promise<ActionResponse> {
  try {
    const response = await apiFetch<ActionResponse>(`/billboards/${id}`, {
      method: 'DELETE',
      token,
    });
    if (response.success) {
      revalidatePath('/admin/billboard');
      revalidatePath('/billboard');
    }
    return response;
  } catch (error: any) {
    console.error('Server Action Error (deleteBillboard):', error);
    return { success: false, error: error.message || 'Failed to delete billboard item' };
  }
}

export async function generateBillboardImageAction(id: string, token: string, prompt?: string): Promise<ActionResponse> {
  try {
    const response = await apiFetch<ActionResponse>(`/billboards/${id}/generate-image`, {
      method: 'POST',
      token,
      body: { prompt },
    });
    if (response.success) {
      revalidatePath('/admin/billboard');
      revalidatePath('/billboard');
    }
    return response;
  } catch (error: any) {
    console.error('Server Action Error (generateBillboardImage):', error);
    return { success: false, error: error.message || 'Failed to generate image' };
  }
}
