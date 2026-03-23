'use server';

import { billboardService } from '@/services/billboard.service';
import { CreateBillboardData, UpdateBillboardData } from '@/lib/types/billboard';
import { ActionResponse } from '@/lib/types/common';
import { revalidatePath } from 'next/cache';

export async function listBillboardsAction(token?: string, isActive?: boolean): Promise<ActionResponse> {
  try {
    return await billboardService.listBillboards(token, isActive);
  } catch (error: any) {
    console.error('Server Action Error (listBillboards):', error);
    return { success: false, error: error.message || 'Failed to fetch billboards' };
  }
}

export async function createBillboardAction(data: CreateBillboardData, token: string): Promise<ActionResponse> {
  try {
    const response = await billboardService.createBillboard(data, token);
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

export async function updateBillboardAction(id: string, data: UpdateBillboardData, token: string): Promise<ActionResponse> {
  try {
    const response = await billboardService.updateBillboard(id, data, token);
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
    const response = await billboardService.deleteBillboard(id, token);
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
    const response = await billboardService.generateImage(id, token, prompt);
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
