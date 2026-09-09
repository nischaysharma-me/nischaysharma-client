import React from 'react';
import ArticlesIndexClient from '@/components/ArticlesIndexClient';
import { articlesService } from '@/services/articles.service';
import { Article } from '@/lib/types/article';
import { Metadata } from 'next';
import StructuredData from '@/components/seo/StructuredData';
import { PERSON_ID, SITE_URL } from '@/lib/seo/identity';

export const revalidate = 60; // ISR: Revalidate every 60 seconds

export const metadata: Metadata = {
  title: "The Digital Anthology: Essays & Writing | Nischay Sharma",
  description: "Browse the complete collection of technical insights, architectural studies, and digital narratives from Nischay Sharma.",
  keywords: ["Nischay Sharma", "Nishchay Sharma", "Nischay", "Nishchay", "Edvanta", "Thoughtjumper", "Thought Jumper", "TaughtCode", "Software Engineering", "Minimalist Portfolio", "Technical Writing"],
  alternates: {
    canonical: '/articles',
  },
  openGraph: {
    title: "The Digital Anthology: Essays & Writing | Nischay Sharma",
    description: "Browse the complete collection of technical insights, architectural studies, and digital narratives from Nischay Sharma.",
    url: "https://nischaysharma.com/articles",
    type: "website",
  }
};

export default async function ArticlesIndexPage() {
  let articles: Article[] = [];
  let pagination = undefined;

  try {
    // Fetch a larger set for frontend-side filtering and search
    const response = await articlesService.getTopArticles(200);

    if (response.success && response.data) {
      articles = response.data;
      pagination = response.pagination;
    }
  } catch (err) {
    console.error('ArticlesIndexPage: Failed to fetch initial articles:', err);
  }

  return (
    <>
      <StructuredData data={{
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        '@id': `${SITE_URL}/articles#collection`,
        url: `${SITE_URL}/articles`,
        name: 'Articles by Nischay Sharma',
        author: { '@id': PERSON_ID },
        mainEntity: {
          '@type': 'ItemList',
          itemListElement: articles.map((article, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            url: `${SITE_URL}/articles/${article.slug}`,
            name: article.title,
          })),
        },
      }} />
      <ArticlesIndexClient initialArticles={articles} />
    </>
  );
}
