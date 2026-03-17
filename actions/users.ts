'use server';

import { usersService } from '@/services/users.service';

export async function getMeAction(token: string) {
  try {
    return await usersService.getMe(token);
  } catch (error) {
    console.error('Server Action Error (getMe):', error);
    return { success: false, error: 'Failed to fetch profile' };
  }
}

export async function getPublicAdminAction() {
  try {
    return await usersService.getPublicAdmin();
  } catch (error) {
    console.error('Server Action Error (getPublicAdmin):', error);
    return { success: false, error: 'Failed to fetch admin profile' };
  }
}

export async function getUserByIdAction(id: string, token: string) {
  try {
    return await usersService.getUserById(id, token);
  } catch (error) {
    console.error('Server Action Error (getUserById):', error);
    return { success: false, error: 'Failed to fetch user' };
  }
}
