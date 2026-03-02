import React from 'react';
import ArticlesClient from '@/components/ArticlesClient';
import { getTopArticlesAction } from '@/actions/articles';

// This is a Server Component
export default async function ArticlesPage() {
  const response = await getTopArticlesAction(100); // Fetch all for admin
  const articles = ('data' in response && response.success) ? response.data : [];

  return <ArticlesClient initialArticles={articles} />;
}
