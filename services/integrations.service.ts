import { apiFetch } from './apiClient';

export interface Integration {
  connected: boolean;
  requiresReconnect?: boolean;
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

export type LinkedInPostFormat = 'text' | 'image' | 'document';

export interface LinkedInSlide {
  headline: string;
  body: string;
  altText?: string;
  imagePrompt?: string;
  imageUrl?: string;
  imageFile?: File;
  imagePreview?: string;
}

export interface LinkedInPostPlan {
  format: LinkedInPostFormat;
  commentary: string;
  text: string;
  slides: LinkedInSlide[];
  imageAltText?: string;
  hashtags?: string[];
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
  generateAIPost: (data: { title: string; description?: string; sourceContent?: string; type: 'article' | 'book' | 'post'; format: LinkedInPostFormat }, token: string) => {
    return apiFetch<{ success: boolean; data: LinkedInPostPlan }>('/integrations/ai-post', {
      method: 'POST',
      token,
      body: data
    });
  },

  /**
   * Generate and store a portrait image for a LinkedIn image post.
   */
  generateLinkedInImage: (data: {
    title: string;
    description?: string;
    type: 'article' | 'book' | 'post';
    purpose?: 'post' | 'slide';
    slideHeadline?: string;
    slideBody?: string;
    imagePrompt?: string;
    sourceContent?: string;
  }, token: string) => {
    return apiFetch<{ success: boolean; data: { url: string; mimeType: string } }>('/integrations/ai-post/image', {
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
   * Sync pinned repositories from GitHub
   */
  syncGitHubPinned: (token: string) => {
    return apiFetch<{ success: boolean; data: any[] }>('/integrations/github/sync', {
      method: 'POST',
      token,
      body: { action: 'get_pinned' }
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
  },

  publishLinkedInPost: (data: {
    commentary: string;
    format: LinkedInPostFormat;
    title: string;
    url?: string;
    altText?: string;
    generatedImageUrl?: string;
    slides?: LinkedInSlide[];
    media?: File;
  }, token: string) => {
    const body = new FormData();
    body.set('commentary', data.commentary);
    body.set('format', data.format);
    body.set('title', data.title);
    if (data.url) body.set('url', data.url);
    if (data.altText) body.set('altText', data.altText);
    if (data.generatedImageUrl) body.set('generatedImageUrl', data.generatedImageUrl);
    if (data.slides) {
      const imageIndexes: number[] = [];
      const serializableSlides = data.slides.map((slide, index) => {
        if (slide.imageFile) {
          body.append('slideImages', slide.imageFile);
          imageIndexes.push(index);
        }
        const { imageFile: _imageFile, imagePreview: _imagePreview, ...serializable } = slide;
        return serializable;
      });
      body.set('slides', JSON.stringify(serializableSlides));
      body.set('slideImageIndexes', JSON.stringify(imageIndexes));
    }
    if (data.media) body.set('media', data.media);

    return apiFetch<{ success: boolean; data: { id?: string } }>('/integrations/linkedin/post', {
      method: 'POST',
      token,
      body
    });
  }
};
