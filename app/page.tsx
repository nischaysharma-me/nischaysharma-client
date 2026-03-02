import React from 'react';
import HomeClient from '@/components/HomeClient';
import { getTopArticlesAction } from '@/actions/articles';

// This is a Server Component
export default async function Home() {
  const response = await getTopArticlesAction(10);
  const articles = response.success ? response.data : [];

  return <HomeClient articles={articles} />;
}
