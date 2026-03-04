import { apiFetch } from './apiClient';

export const jobsService = {
  /**
   * Queue a new background job
   */
  createJob: (type: string, data: any, token: string) => {
    return apiFetch<{ success: boolean; data: any }>('/jobs', {
      method: 'POST',
      token,
      body: { type, data },
    });
  },

  /**
   * Get the current status and progress of a job
   */
  getJobStatus: (id: string, token: string) => {
    return apiFetch<any>(`/jobs/${id}`, {
      method: 'GET',
      token,
    });
  }
};
