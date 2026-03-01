import { apiFetch } from './apiClient';

export interface ClientPermission {
  key: string;
  label: string;
  description: string;
}

export interface ClientApp {
  id?: string;
  name: string;
  url: string;
  permissions: string[];
  status: 'active' | 'inactive';
  createdAt?: string;
  updatedAt?: string;
}

export const clientAppsService = {
  list: (token: string) => {
    return apiFetch<{ success: boolean; data: ClientApp[] }>('/clients', {
      method: 'GET',
      token,
    });
  },

  getById: (id: string, token: string) => {
    return apiFetch<{ success: boolean; data: ClientApp }>(`/clients/${id}`, {
      method: 'GET',
      token,
    });
  },

  create: (data: Partial<ClientApp>, token: string) => {
    return apiFetch<{ success: boolean; data: ClientApp }>('/clients', {
      method: 'POST',
      token,
      body: data,
    });
  },

  update: (id: string, data: Partial<ClientApp>, token: string) => {
    return apiFetch<{ success: boolean; data: ClientApp }>(`/clients/${id}`, {
      method: 'PATCH',
      token,
      body: data,
    });
  },

  delete: (id: string, token: string) => {
    return apiFetch<{ success: boolean; message: string }>(`/clients/${id}`, {
      method: 'DELETE',
      token,
    });
  },

  getAvailablePermissions: () => {
    return apiFetch<{ success: boolean; data: ClientPermission[] }>('/clients/permissions', {
      method: 'GET',
    });
  }
};
