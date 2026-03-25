import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { articlesService } from '@/services/articles.service';
import { Article } from '@/lib/types/article';
import { Metadata } from 'next';

export const revalidate = 60; // ISR: Revalidate every 60 seconds

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  try {
    const response = await articlesService.getArticleBySlug(slug);
    if (response.success && response.data) {
      const article = response.data;
      return {
        title: article.title,
        description: article.description || `Read ${article.title} on Nischay Sharma's digital anthology.`,
        openGraph: {
          title: article.title,
          description: article.description || `Read ${article.title} on Nischay Sharma's digital anthology.`,
          type: 'article',
          publishedTime: article.publishedAt,
          authors: ['Nischay Sharma'],
          images: [
            {
              url: article.backgroundImage || '/architectural-concrete-monument.png',
              alt: article.title,
            },
          ],
        },
        twitter: {
          card: 'summary_large_image',
          title: article.title,
          description: article.description || `Read ${article.title} on Nischay Sharma's digital anthology.`,
          images: [article.backgroundImage || '/architectural-concrete-monument.png'],
        },
        alternates: {
          canonical: `/articles/${slug}`,
        },
      };
    }
  } catch (err) {
    console.error('Error generating metadata:', err);
  }

  return {
    title: 'Article Not Found',
  };
}

export default async function PublicArticleView({ params }: PageProps) {
  const { slug } = await params;
  let article: Article | null = null;
  let error = '';

  try {
    const response = await articlesService.getArticleBySlug(slug);
    if (response.success && response.data) {
      article = response.data;
    } else {
      error = 'Article not found';
    }
  } catch (err) {
    const errorObj = err as Error;
    console.error('Error fetching article:', err);
    error = errorObj.message || 'Failed to load article';
  }

  if (error || !article) {
    return (
      <div className="article-view" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '2rem', height: '100vh' }}>
        <h2 className="article-view__title" style={{ color: '#000' }}>{error || 'Article not found'}</h2>
        <Link href="/" className="article-view__back-btn">
          Back to Stories
        </Link>
      </div>
    );
  }

  const getCoverImage = (article: Article) => {
    if (article?.backgroundImage) return article.backgroundImage;
    const match = article?.content.match(/<img[^>]+src="([^">]+)"/);
    return match ? match[1] : '/architectural-concrete-monument.png';
  };

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": article.title,
    "description": article.description,
    "image": getCoverImage(article),
    "datePublished": article.publishedAt,
    "dateModified": article.publishedAt,
    "author": {
      "@type": "Person",
      "name": "Nischay Sharma",
      "url": "https://nischaysharma.com"
    },
    "publisher": {
      "@type": "Organization",
      "name": "TaughtCode",
      "logo": {
        "@type": "ImageObject",
        "url": "https://nischaysharma.com/logo.png"
      }
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="article-view">
        <header className="article-view__hero">
          <Image 
            src={getCoverImage(article)} 
            alt={article.title} 
            fill
            style={{ objectFit: 'cover' }}
            priority
          />
          <div className="article-view__hero-content">
            <h1 className="article-view__title">{article.title}</h1>
            <div className="article-view__meta">
              <span>By Nischay Sharma</span>
              <span className="dot" />
              <span>{new Date(article.publishedAt || '').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
            </div>
          </div>
        </header>

        <main className="article-view__main">
          {article.description && (
            <p className="article-view__description">{article.description}</p>
          )}
          
          <div 
            className="article-view__content" 
            dangerouslySetInnerHTML={{ __html: article.content }} 
          />

          <footer className="article-view__footer">
            <Link href="/" className="article-view__back-btn">
              <i className="ph ph-caret-left" style={{ fontSize: '1.25rem' }} />
              Explore More Stories
            </Link>
          </footer>
        </main>
      </div>
    </>
  );
}
