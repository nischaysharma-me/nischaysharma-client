import React from 'react';
import HomeClient from '@/components/HomeClient';
import { articlesService } from '@/services/articles.service';

// This is a Server Component by default in Next.js 13+ App Router
export default async function Home() {
  let articles = [];
  try {
    const response = await articlesService.getTopArticles(10);
    if (response.success) {
      articles = response.data;
    }
  } catch (err) {
    console.error('Error fetching articles on server:', err);
  }

  return <HomeClient articles={articles} />;
}
