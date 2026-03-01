import { apiFetch } from './apiClient';

export interface CreateArticleData {
  title: string;
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
  coverImage?: string;
  publishedAt: string;
  authorId: string;
}

export const articlesService = {
  getTopArticles: async (limit: number = 10): Promise<{ success: boolean, data: Article[] }> => {
    return apiFetch<{ success: boolean, data: Article[] }>(`/articles?limit=${limit}&status=published`, {
      method: 'GET',
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

  listArticles: (status?: string) => {
    const queryParams = new URLSearchParams();
    if (status) queryParams.append('status', status);
    
    const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
    return apiFetch<any>(`/articles${queryString}`, {
      method: 'GET',
    });
  },

  getArticleBySlug: (slug: string, token?: string) => {
    return apiFetch<any>(`/articles/${slug}`, {
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
