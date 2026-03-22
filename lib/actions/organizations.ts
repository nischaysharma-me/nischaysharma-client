'use server';

import { organizationsService } from '@/services/organizations.service';

export async function getAllOrganizationsAction(token: string) {
  try {
    return await organizationsService.list(token);
  } catch (error) {
    console.error('Server Action Error (getAllOrganizations):', error);
    return { success: false, error: 'Failed to fetch organizations' };
  }
}

export async function createOrganizationAction(data: { name: string; description?: string }, token: string) {
  try {
    return await organizationsService.create(data, token);
  } catch (error) {
    console.error('Server Action Error (createOrganization):', error);
    return { success: false, error: 'Failed to create organization' };
  }
}

export async function updateOrganizationAction(id: string, data: any, token: string) {
  try {
    return await organizationsService.update(id, data, token);
  } catch (error) {
    console.error('Server Action Error (updateOrganization):', error);
    return { success: false, error: 'Failed to update organization' };
  }
}
