import { apiFetch } from './apiClient';
import { Article, CreateArticleData, GenerateArticleData } from '@/lib/types/article';
import { ActionResponse } from '@/lib/types/common';

export const articlesService = {
  getTopArticles: async (limit: number = 10): Promise<ActionResponse<Article[]>> => {
    return apiFetch<ActionResponse<Article[]>>(`/articles?limit=${limit}&status=published`, {
      method: 'GET',
    });
  },

  publish: (id: string, token: string): Promise<ActionResponse<Article>> => {
    return apiFetch<ActionResponse<Article>>(`/articles/${id}/publish`, {
      method: 'POST',
      token,
    });
  },

  createArticle: (data: CreateArticleData, token: string): Promise<ActionResponse<Article>> => {
    return apiFetch<ActionResponse<Article>>('/articles', {
      method: 'POST',
      token,
      body: data,
    });
  },

  generateArticle: (data: GenerateArticleData, token: string): Promise<ActionResponse<any>> => {
    return apiFetch<ActionResponse<any>>('/articles/generate', {
      method: 'POST',
      token,
      body: data,
    });
  },

  listArticles: (options: { 
    status?: string; 
    search?: string; 
    tags?: string[]; 
    page?: number; 
    limit?: number; 
  } = {}, token?: string): Promise<ActionResponse<Article[]>> => {
    const queryParams = new URLSearchParams();
    if (options.status) queryParams.append('status', options.status);
    if (options.search) queryParams.append('search', options.search);
    if (options.page) queryParams.append('page', options.page.toString());
    if (options.limit) queryParams.append('limit', options.limit.toString());
    if (options.tags && options.tags.length > 0) {
      queryParams.append('tags', options.tags.join(','));
    }
    
    const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
    return apiFetch<ActionResponse<Article[]>>(`/articles${queryString}`, {
      method: 'GET',
      token,
    });
  },

  getArticleBySlug: (slug: string, token?: string): Promise<ActionResponse<Article>> => {
    return apiFetch<ActionResponse<Article>>(`/articles/${slug}`, {
      method: 'GET',
      token,
    });
  },

  getById: (id: string, token: string): Promise<ActionResponse<Article>> => {
    return apiFetch<ActionResponse<Article>>(`/articles/fetch/${id}`, {
      method: 'GET',
      token,
    });
  },

  updateArticle: (id: string, data: any, token: string): Promise<ActionResponse<Article>> => {
    return apiFetch<ActionResponse<Article>>(`/articles/${id}`, {
      method: 'PATCH',
      token,
      body: data,
    });
  },

  addReview: (id: string, data: { rating: number; comment: string }, token: string): Promise<ActionResponse<any>> => {
    return apiFetch<ActionResponse<any>>(`/articles/${id}/reviews`, {
      method: 'POST',
      token,
      body: data,
    });
  },

  deleteArticle: (id: string, token: string): Promise<ActionResponse<any>> => {
    return apiFetch<ActionResponse<any>>(`/articles/${id}`, {
      method: 'DELETE',
      token,
    });
  },

  deleteAllArticles: (token: string): Promise<ActionResponse<any>> => {
    return apiFetch<ActionResponse<any>>('/articles', {
      method: 'DELETE',
      token,
    });
  },

  regenerateBackgroundImage: (id: string, data: { prompt?: string }, token: string): Promise<ActionResponse<{ jobId: string; status: string }>> => {
    return apiFetch<ActionResponse<{ jobId: string; status: string }>>(`/articles/${id}/regenerate-background-image`, {
      method: 'POST',
      token,
      body: data,
    });
  }
};
