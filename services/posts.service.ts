import { apiFetch } from './apiClient';
import { ActionResponse } from '@/lib/types/common';
import { Post, PostInput, PostStatus } from '@/lib/types/post';

export const postsService = {
  listPublic: (options: { limit?: number; skip?: number } = {}): Promise<ActionResponse<Post[]>> => {
    const params = new URLSearchParams();
    params.set('limit', String(options.limit || 20));
    if (options.skip) params.set('skip', String(options.skip));
    return apiFetch<ActionResponse<Post[]>>(`/posts?${params.toString()}`, { method: 'GET' });
  },

  listMine: (token: string, status?: PostStatus): Promise<ActionResponse<Post[]>> => {
    const params = new URLSearchParams({ scope: 'mine', limit: '100' });
    if (status) params.set('status', status);
    return apiFetch<ActionResponse<Post[]>>(`/posts?${params.toString()}`, { method: 'GET', token });
  },

  getById: (id: string, token?: string): Promise<ActionResponse<Post>> =>
    apiFetch<ActionResponse<Post>>(`/posts/${id}`, { method: 'GET', token }),

  create: (data: PostInput, token: string): Promise<ActionResponse<Post>> =>
    apiFetch<ActionResponse<Post>>('/posts', { method: 'POST', token, body: data }),

  update: (id: string, data: Partial<PostInput>, token: string): Promise<ActionResponse<Post>> =>
    apiFetch<ActionResponse<Post>>(`/posts/${id}`, { method: 'PATCH', token, body: data }),

  publish: (id: string, token: string): Promise<ActionResponse<Post>> =>
    apiFetch<ActionResponse<Post>>(`/posts/${id}/publish`, { method: 'POST', token }),

  delete: (id: string, token: string): Promise<ActionResponse<never>> =>
    apiFetch<ActionResponse<never>>(`/posts/${id}`, { method: 'DELETE', token })
};
