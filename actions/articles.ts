'use server';

import { articlesService } from '@/services/articles.service';

export async function getTopArticlesAction(limit: number = 10) {
  try {
    const response = await articlesService.getTopArticles(limit);
    return response;
  } catch (error) {
    console.error('Server Action Error (getTopArticles):', error);
    return { success: false, data: [], error: 'Failed to fetch articles' };
  }
}

export async function getArticleBySlugAction(slug: string) {
  try {
    const response = await articlesService.getArticleBySlug(slug);
    return response;
  } catch (error) {
    console.error('Server Action Error (getArticleBySlug):', error);
    return { success: false, error: 'Failed to fetch article' };
  }
}
