'use server';

import { usersService } from '@/services/users.service';
import { ActionResponse } from '@/lib/types/common';

export async function getHomeDataAction(): Promise<ActionResponse> {
  try {
    return await usersService.getHomeData();
  } catch (error: any) {
    console.error('Server Action Error (getHomeData):', error);
    return { success: false, error: error.message || 'Failed to fetch home data' };
  }
}

export async function getPublicAdminAction(): Promise<ActionResponse> {
  try {
    return await usersService.getPublicAdmin();
  } catch (error: any) {
    console.error('Server Action Error (getPublicAdmin):', error);
    return { success: false, error: error.message || 'Failed to fetch admin profile' };
  }
}
