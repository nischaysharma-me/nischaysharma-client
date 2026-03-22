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

  listArticles: (status?: string, token?: string): Promise<ActionResponse<Article[]>> => {
    const queryParams = new URLSearchParams();
    if (status) queryParams.append('status', status);
    
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
  }
};
