import { apiFetch } from './apiClient';

export interface Integration {
  connected: boolean;
  accountName?: string;
  username?: string;
  urn?: string;
  connectedAt?: string;
  updatedAt?: string;
}

export interface IntegrationsList {
  github?: Integration;
  linkedin?: Integration;
}

export const integrationsService = {
  /**
   * List all active integrations
   */
  list: (token: string) => {
    return apiFetch<{ success: boolean; data: IntegrationsList }>('/integrations', {
      method: 'GET',
      token,
    });
  },

  /**
   * Initiate OAuth flow for a provider
   */
  initiateAuth: (provider: 'github' | 'linkedin', token: string) => {
    return apiFetch<{ success: boolean; authUrl: string }>(`/integrations/${provider}/auth`, {
      method: 'GET',
      token,
    });
  },

  /**
   * Remove an integration
   */
  remove: (provider: 'github' | 'linkedin', token: string) => {
    return apiFetch<{ success: boolean; data: any }>(`/integrations/${provider}`, {
      method: 'DELETE',
      token,
    });
  },

  /**
   * Update integration configuration (e.g., Client ID, Secret)
   */
  updateConfig: (provider: 'github' | 'linkedin', config: { clientId?: string; clientSecret?: string; redirectUri?: string }, token: string) => {
    return apiFetch<{ success: boolean; data: any }>(`/integrations/${provider}`, {
      method: 'PUT',
      token,
      body: config,
    });
  },

  /**
   * Generate an AI-powered social media post
   */
  generateAIPost: (data: { title: string; description?: string; type: 'article' | 'book' }, token: string) => {
    return apiFetch<{ success: boolean; data: any }>('/integrations/ai-post', {
      method: 'POST',
      token,
      body: data
    });
  },

  /**
   * Sync deep stats from a provider
   */
  syncStats: (provider: 'github' | 'linkedin', token: string) => {
    return apiFetch<{ success: boolean; data: any }>(`/integrations/${provider}/sync`, {
      method: 'POST',
      token,
      body: { action: provider === 'github' ? 'get_stats' : 'sync_profile' }
    });
  },

  /**
   * Sync projects from GitHub
   */
  syncGitHubProjects: (token: string) => {
    return apiFetch<{ success: boolean; data: any[] }>('/integrations/github/sync', {
      method: 'POST',
      token,
      body: { action: 'get_repos' }
    });
  },

  /**
   * Share content to LinkedIn
   */
  shareToLinkedIn: (data: { text: string; url?: string; title?: string }, token: string) => {
    return apiFetch<{ success: boolean; data: any }>('/integrations/linkedin/sync', {
      method: 'POST',
      token,
      body: data
    });
  }
};
