import { apiFetch } from './apiClient';

export type ResumeSection = 'basics' | 'summary' | 'skills' | 'experience' | 'education' | 'projects' | 'socialLinks';

export interface ResumePreview {
  basics: { displayName?: string; email?: string; occupation?: string };
  summary: string;
  skills: string[];
  expertise: string[];
  experience: Array<{
    company: string;
    location: string;
    roles: Array<{ title: string; startDate: string; endDate: string; description: string; employmentType: string }>;
  }>;
  education: Array<{ school: string; degree: string; fieldOfStudy: string; startDate: string; endDate: string; description: string }>;
  projects: Array<{ title: string; description: string; link: string; skills: string[] }>;
  socialLinks: { linkedin?: string; github?: string; twitter?: string; website?: string };
}

export interface ResumeImportPayload {
  profile?: Record<string, unknown>;
  experience?: ResumePreview['experience'];
  education?: ResumePreview['education'];
  projects?: ResumePreview['projects'];
}

export const usersService = {
  getMe: (token: string) => {
    return apiFetch<any>('/users/me', {
      method: 'GET',
      token,
    });
  },

  getPublicAdmin: () => {
    return apiFetch<any>('/users/public/admin', {
      method: 'GET',
    });
  },

  getHomeData: () => {
    return apiFetch<any>('/users/public/home', {
      method: 'GET',
      next: { revalidate: 60, tags: ['home-data'] },
    });
  },

  updateMe: (data: { displayName?: string; bio?: string }, token: string) => {
    return apiFetch<any>('/users/me', {
      method: 'PATCH',
      token,
      body: data,
    });
  },

  listUsers: (token: string) => {
    return apiFetch<any>('/users', {
      method: 'GET',
      token,
    });
  },

  getUserById: (id: string, token: string) => {
    return apiFetch<any>(`/users/${id}`, {
      method: 'GET',
      token,
    });
  },

  /**
   * Deactivate user account (Soft delete)
   */
  deactivateUser: (id: string, token: string) => {
    return apiFetch<{ success: boolean; message: string }>(`/users/${id}/deactivate`, {
      method: 'PATCH',
      token,
    });
  },

  /**
   * Disable user account (Admin only)
   */
  disableUser: (id: string, token: string) => {
    return apiFetch<{ success: boolean; message: string }>(`/users/${id}/disable`, {
      method: 'PATCH',
      token,
    });
  },

  /**
   * Activate user account (Admin only)
   */
  activateUser: (id: string, token: string) => {
    return apiFetch<{ success: boolean; message: string }>(`/users/${id}/activate`, {
      method: 'PATCH',
      token,
    });
  },

  /**
   * Update profile picture
   */
  updateProfilePicture: (file: File, token: string) => {
    const formData = new FormData();
    formData.append('file', file);
    return apiFetch<any>('/users/me/photo', {
      method: 'PATCH',
      token,
      body: formData,
    });
  },

  /**
   * Update cover photo
   */
  updateCoverPhoto: (file: File, token: string) => {
    const formData = new FormData();
    formData.append('file', file);
    return apiFetch<any>('/users/me/cover', {
      method: 'PATCH',
      token,
      body: formData,
    });
  },

  /**
   * Add asset to gallery
   */
  addGalleryAsset: (file: File, metadata: { title?: string; description?: string }, token: string) => {
    const formData = new FormData();
    formData.append('file', file);
    if (metadata.title) formData.append('title', metadata.title);
    if (metadata.description) formData.append('description', metadata.description);
    return apiFetch<any>('/users/me/gallery', {
      method: 'POST',
      token,
      body: formData,
    });
  },

  /**
   * Delete asset from gallery
   */
  deleteGalleryAsset: (assetUrl: string, token: string) => {
    return apiFetch<any>('/users/me/gallery', {
      method: 'DELETE',
      token,
      body: { assetUrl },
    });
  },

  uploadAsset: (file: File, folder: string, token: string) => {
    const formData = new FormData();
    formData.append('file', file);
    return apiFetch<{ success: boolean; url: string }>(`/users/assets?folder=${folder}`, {
      method: 'POST',
      token,
      body: formData,
    });
  },

  previewResume: (file: File, sections: ResumeSection[], token: string) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('sections', JSON.stringify(sections));
    return apiFetch<{ success: boolean; data: { sections: ResumeSection[]; data: ResumePreview } }>('/users/me/resume/preview', {
      method: 'POST',
      token,
      body: formData,
    });
  },

  applyResumeImport: (data: ResumeImportPayload, token: string) =>
    apiFetch<{ success: boolean; data: { profileUpdated: boolean; created: Record<string, number>; skipped: Record<string, number> } }>('/users/me/resume/apply', {
      method: 'POST',
      token,
      body: data,
    }),
};
