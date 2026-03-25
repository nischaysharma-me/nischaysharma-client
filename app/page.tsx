import React from 'react';
import HomeClient from '@/components/HomeClient';
import { getTopArticlesAction } from '@/lib/actions/articles';

export const revalidate = 60; // ISR: Revalidate every 60 seconds

// This is a Server Component
export default async function Home() {
  const response = await getTopArticlesAction(10);
  const articles = ('data' in response && response.success) ? response.data : [];

  return <HomeClient articles={articles} />;
}
