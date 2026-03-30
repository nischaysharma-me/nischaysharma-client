import React from 'react';
import ArticlesIndexClient from '@/components/ArticlesIndexClient';
import { articlesService } from '@/services/articles.service';
import { Article } from '@/lib/types/article';
import { Metadata } from 'next';

export const revalidate = 60; // ISR: Revalidate every 60 seconds

export const metadata: Metadata = {
  title: "The Digital Anthology | Nischay Sharma",
  description: "Browse the complete collection of technical insights, architectural studies, and digital narratives from Nischay Sharma.",
  alternates: {
    canonical: '/articles',
  },
  openGraph: {
    title: "The Digital Anthology | Nischay Sharma",
    description: "Browse the complete collection of technical insights, architectural studies, and digital narratives from Nischay Sharma.",
    url: "https://nischaysharma.com/articles",
    type: "website",
  }
};

export default async function ArticlesIndexPage() {
  let articles: Article[] = [];
  let pagination = undefined;

  try {
    // Try simple fetch first to ensure we get something if advanced params are not supported
    const response = await articlesService.getTopArticles(50);

    if (response.success && response.data) {
      articles = response.data;
      pagination = response.pagination;
    }
  } catch (err) {
    console.error('ArticlesIndexPage: Failed to fetch initial articles:', err);
  }

  return (
    <ArticlesIndexClient 
      initialArticles={articles} 
      initialPagination={pagination} 
    />
  );
}
