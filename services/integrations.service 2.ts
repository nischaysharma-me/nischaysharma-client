import { apiFetch } from './apiClient';

export interface Integration {
  id?: string;
  provider: string;
  config: any;
  status: 'active' | 'inactive';
  lastSync?: string;
  createdAt: string;
  updatedAt: string;
}

export const integrationsService = {
  /**
   * List all active integrations for the current user
   */
  listIntegrations: (token: string) => {
    return apiFetch<{ success: boolean; data: Integration[] }>('/integrations', {
      method: 'GET',
      token,
    });
  },

  /**
   * Update or Setup a third-party integration (e.g., github)
   */
  updateIntegration: (provider: string, config: any, token: string) => {
    return apiFetch<{ success: boolean; data: Integration }>(`/integrations/${provider}`, {
      method: 'PUT',
      token,
      body: config,
    });
  },

  /**
   * Manually trigger a sync for an integration
   */
  syncIntegration: (provider: string, token: string) => {
    return apiFetch<{ success: boolean; message: string }>(`/integrations/${provider}/sync`, {
      method: 'POST',
      token,
    });
  },

  /**
   * Remove an integration
   */
  removeIntegration: (provider: string, token: string) => {
    return apiFetch<{ success: boolean; message: string }>(`/integrations/${provider}`, {
      method: 'DELETE',
      token,
    });
  }
};
