'use client';

import React from 'react';
import Link from 'next/link';
import { Article } from '@/lib/types/article';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { formatDate } from '@/lib/utils';

interface ArticleRowProps {
  article: Article;
  onPublish: (id: string) => void;
}

export const ArticleRow = ({ article, onPublish }: ArticleRowProps) => {
  const getStatusVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case 'published': return 'published';
      case 'draft': return 'draft';
      case 'archived': return 'review';
      default: return 'default';
    }
  };

  return (
    <div className="dashboard__recent-item">
      <div className="dashboard__recent-item-info">
        <div className="dashboard__recent-item-title">{article.title}</div>
        <div className="dashboard__recent-item-meta">
          <span>Published: {article.publishedAt ? formatDate(article.publishedAt) : 'N/A'}</span>
          <span className="dot" />
          <span>Slug: {article.slug}</span>
        </div>
      </div>
      <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
        <Badge variant={getStatusVariant(article.status || 'draft')}>
          {article.status || 'draft'}
        </Badge>
        <div style={{ display: 'flex', gap: '0.4rem' }}>
          <Link href={`/admin/articles/${article.id}`}>
            <Button variant="ghost" size="sm" title="Edit" style={{ padding: '0.4rem' }}>
              <i className="ph ph-pencil-line" style={{ fontSize: '1.2rem' }} />
            </Button>
          </Link>
          {article.status !== 'published' && (
            <Button 
              variant="ghost" 
              size="sm"
              title="Publish"
              onClick={() => onPublish(article.id)}
              style={{ padding: '0.4rem', color: '#10b981' }}
            >
              <i className="ph ph-check-circle" style={{ fontSize: '1.2rem' }} />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

interface ArticleListProps {
  articles: Article[];
  onPublish: (id: string) => void;
  onShowGenerator: () => void;
}

export const ArticleList = ({ articles, onPublish, onShowGenerator }: ArticleListProps) => {
  if (articles.length === 0) {
    return (
      <div style={{ padding: '4rem 2rem', textAlign: 'center' }}>
        <p style={{ color: '#737373', marginBottom: '1.5rem' }}>No articles found.</p>
        <Button variant="secondary" onClick={onShowGenerator}>
          Create your first article
        </Button>
      </div>
    );
  }

  return (
    <div className="dashboard__recent-list">
      {articles.map((article) => (
        <ArticleRow key={article.id} article={article} onPublish={onPublish} />
      ))}
    </div>
  );
};
