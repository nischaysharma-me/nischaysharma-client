import React from 'react';
import HomeClient from '@/components/HomeClient';
import { getTopArticlesAction } from '@/lib/actions/articles';
import { Metadata } from 'next';

export const revalidate = 60; // ISR: Revalidate every 60 seconds

export const metadata: Metadata = {
  title: "Nischay Sharma - For Downtime & Inspiration",
  description: "Minimalist portfolio and magazine for Nischay Sharma. Explore technical stories, documentation, and curated collections.",
  alternates: {
    canonical: '/',
  },
};

// This is a Server Component
export default async function Home() {
  const response = await getTopArticlesAction(10);
  const articles = ('data' in response && response.success) ? response.data : [];

  return <HomeClient articles={articles} />;
}
