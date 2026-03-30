import { apiFetch } from './apiClient';
import { Post, CreatePostData, GeneratePostData } from '@/lib/types/post';
import { ActionResponse } from '@/lib/types/common';

export const postsService = {
  listPosts: async (options: { 
    page?: number; 
    limit?: number; 
  } = {}, token?: string): Promise<ActionResponse<Post[]>> => {
    const queryParams = new URLSearchParams();
    if (options.page) queryParams.append('page', options.page.toString());
    if (options.limit) queryParams.append('limit', options.limit.toString());
    
    const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
    return apiFetch<ActionResponse<Post[]>>(`/posts${queryString}`, {
      method: 'GET',
      token,
    });
  },

  createPost: (data: CreatePostData, token: string): Promise<ActionResponse<Post>> => {
    return apiFetch<ActionResponse<Post>>('/posts', {
      method: 'POST',
      token,
      body: data,
    });
  },

  generatePost: (data: GeneratePostData, token: string): Promise<ActionResponse<Post>> => {
    return apiFetch<ActionResponse<Post>>('/posts/generate', {
      method: 'POST',
      token,
      body: data,
    });
  },

  publishPost: (postId: string, targetPlatforms: string[], token: string): Promise<ActionResponse<Post>> => {
    return apiFetch<ActionResponse<Post>>(`/posts/${postId}/publish`, {
      method: 'POST',
      token,
      body: { targetPlatforms },
    });
  },

  deletePost: (postId: string, token: string): Promise<ActionResponse<any>> => {
    return apiFetch<ActionResponse<any>>(`/posts/${postId}`, {
      method: 'DELETE',
      token,
    });
  }
};
