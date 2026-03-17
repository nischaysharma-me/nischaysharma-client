import React from 'react';
import HomeClient from '@/components/HomeClient';
import { getTopArticlesAction } from '@/actions/articles';
import { getPublicAdminAction } from '@/actions/users';

export const revalidate = 60; // ISR: Revalidate every 60 seconds

// This is a Server Component
export default async function Home() {
  const [articlesRes, profileRes] = await Promise.all([
    getTopArticlesAction(10),
    getPublicAdminAction()
  ]);

  const articles = ('data' in articlesRes && articlesRes.success) ? articlesRes.data : [];
  const profile = ('data' in profileRes && profileRes.success) ? profileRes.data : null;

  return <HomeClient articles={articles} profile={profile} />;
}
