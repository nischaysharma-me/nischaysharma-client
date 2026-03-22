'use server';

import { articlesService } from '@/services/articles.service';
import { GenerateArticleData, CreateArticleData } from '@/lib/types/article';
import { ActionResponse } from '@/lib/types/common';
import { revalidatePath } from 'next/cache';

export async function getTopArticlesAction(limit: number = 10): Promise<ActionResponse> {
  try {
    return await articlesService.getTopArticles(limit);
  } catch (error: any) {
    console.error('Server Action Error (getTopArticles):', error);
    return { success: false, error: error.message || 'Failed to fetch articles' };
  }
}

export async function getArticleBySlugAction(slug: string): Promise<ActionResponse> {
  try {
    return await articlesService.getArticleBySlug(slug);
  } catch (error: any) {
    console.error('Server Action Error (getArticleBySlug):', error);
    return { success: false, error: error.message || 'Failed to fetch article' };
  }
}

export async function generateArticleAction(data: GenerateArticleData, token: string): Promise<ActionResponse> {
  try {
    const response = await articlesService.generateArticle(data, token);
    if (response.success) {
      revalidatePath('/admin/articles');
    }
    return response;
  } catch (error: any) {
    console.error('Server Action Error (generateArticle):', error);
    return { success: false, error: error.message || 'Failed to generate article' };
  }
}

export async function publishArticleAction(id: string, token: string): Promise<ActionResponse> {
  try {
    const response = await articlesService.publish(id, token);
    if (response.success && response.data) {
      revalidatePath('/admin/articles');
      revalidatePath(`/articles/${response.data.slug}`);
    }
    return response;
  } catch (error: any) {
    console.error('Server Action Error (publishArticle):', error);
    return { success: false, error: error.message || 'Failed to publish article' };
  }
}

export async function listArticlesAction(status?: string, token?: string): Promise<ActionResponse> {
  try {
    return await articlesService.listArticles(status, token);
  } catch (error: any) {
    console.error('Server Action Error (listArticles):', error);
    return { success: false, error: error.message || 'Failed to list articles' };
  }
}

export async function updateArticleAction(id: string, data: any, token: string): Promise<ActionResponse> {
  try {
    const response = await articlesService.updateArticle(id, data, token);
    if (response.success) {
      revalidatePath('/admin/articles');
      revalidatePath(`/admin/articles/${id}`);
    }
    return response;
  } catch (error: any) {
    console.error('Server Action Error (updateArticle):', error);
    return { success: false, error: error.message || 'Failed to update article' };
  }
}
