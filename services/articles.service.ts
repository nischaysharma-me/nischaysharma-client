import { apiFetch } from './apiClient';

export interface CreateArticleData {
  title: string;
  description: string;
  content: string;
  tags?: string[];
  status?: string;
  access?: string;
}

export interface GenerateArticleData {
  topic: string;
  depth: string;
  instructions: string;
  templateId?: string;
}

export interface Article {
  id: string;
  title: string;
  description: string;
  content: string;
  slug: string;
  backgroundImage?: string;
  imagesAttached?: string[];
  publishedAt: string;
  authorId: string;
  status: string;
}

export const articlesService = {
  getTopArticles: async (limit: number = 10): Promise<{ success: boolean, data: Article[] }> => {
    return apiFetch<{ success: boolean, data: Article[] }>(`/articles?limit=${limit}&status=published`, {
      method: 'GET',
    });
  },

  publish: (id: string, token: string) => {
    return apiFetch<{ success: boolean; data: Article }>(`/articles/${id}/publish`, {
      method: 'POST',
      token,
    });
  },
  createArticle: (data: CreateArticleData, token: string) => {
    return apiFetch<any>('/articles', {
      method: 'POST',
      token,
      body: data,
    });
  },

  generateArticle: (data: GenerateArticleData, token: string) => {
    return apiFetch<any>('/articles/generate', {
      method: 'POST',
      token,
      body: data,
    });
  },

  listArticles: (status?: string, token?: string) => {
    const queryParams = new URLSearchParams();
    if (status) queryParams.append('status', status);
    
    const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
    return apiFetch<{ success: boolean, data: Article[] }>(`/articles${queryString}`, {
      method: 'GET',
      token,
    });
  },

  getArticleBySlug: (slug: string, token?: string) => {
    return apiFetch<{ success: boolean, data: Article }>(`/articles/${slug}`, {
      method: 'GET',
      token,
    });
  },

  getById: (id: string, token: string) => {
    return apiFetch<{ success: boolean, data: Article }>(`/articles/fetch/${id}`, {
      method: 'GET',
      token,
    });
  },

  updateArticle: (id: string, data: any, token: string) => {
    return apiFetch<any>(`/articles/${id}`, {
      method: 'PATCH',
      token,
      body: data,
    });
  },

  publishArticle: (id: string, token: string) => {
    return apiFetch<any>(`/articles/${id}/publish`, {
      method: 'POST',
      token,
    });
  },

  addReview: (id: string, data: { rating: number; comment: string }, token: string) => {
    return apiFetch<any>(`/articles/${id}/reviews`, {
      method: 'POST',
      token,
      body: data,
    });
  }
};
