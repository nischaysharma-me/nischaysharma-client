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
  onToggleFavorite: (id: string, current: boolean) => void;
  onDelete: (id: string) => void;
  isProcessing: boolean;
}

export const ArticleRow = ({ article, onPublish, onToggleFavorite, onDelete, isProcessing }: ArticleRowProps) => {
  const getStatusVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case 'published': return 'published';
      case 'draft': return 'draft';
      case 'archived': return 'review';
      default: return 'default';
    }
  };

  return (
    <div className={`dashboard__recent-item ${isProcessing ? 'is-processing' : ''}`} style={{ opacity: isProcessing ? 0.8 : 1 }}>
      <div className="dashboard__recent-item-info">
        <div className="dashboard__recent-item-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span>{article.title}</span>
          {article.isFavorite && (
            <i className="ph-fill ph-star" style={{ color: '#f59e0b', fontSize: '1rem' }} />
          )}
        </div>
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
          <Button
            variant="ghost"
            size="sm"
            loading={isProcessing}
            disabled={isProcessing}
            title={article.isFavorite ? "Remove from Favorites" : "Mark as Favorite"}
            onClick={() => onToggleFavorite(article.id, !!article.isFavorite)}
            style={{
              width: '2.5rem',
              height: '2.5rem',
              padding: '0',
              color: article.isFavorite ? '#f59e0b' : '#737373'
            }}
          >
            <i className={`${article.isFavorite ? 'ph-fill' : 'ph'} ph-star`} style={{ fontSize: '1.25rem' }} />
          </Button>

          <Link href={`/admin/articles/${article.id}`}>
            <Button variant="ghost" size="sm" disabled={isProcessing} title="Edit" style={{ width: '2.5rem', height: '2.5rem', padding: '0' }}>
              <i className="ph ph-pencil-line" style={{ fontSize: '1.25rem' }} />
            </Button>
          </Link>

          {article.status !== 'published' && (
            <Button
              variant="ghost"
              size="sm"
              disabled={isProcessing}
              title="Publish"
              onClick={() => onPublish(article.id)}
              style={{ width: '2.5rem', height: '2.5rem', padding: '0', color: '#10b981' }}
            >
              <i className="ph ph-check-circle" style={{ fontSize: '1.25rem' }} />
            </Button>
          )}

          <Button
            variant="ghost"
            size="sm"
            disabled={isProcessing}
            title="Delete"
            onClick={() => onDelete(article.id)}
            style={{ width: '2.5rem', height: '2.5rem', padding: '0', color: '#ef4444' }}
          >
            <i className="ph ph-trash" style={{ fontSize: '1.25rem' }} />
          </Button>
        </div>
      </div>
    </div>
  );
};

interface ArticleListProps {
  articles: Article[];
  onPublish: (id: string) => void;
  onToggleFavorite: (id: string, current: boolean) => void;
  onDelete: (id: string) => void;
  onShowGenerator: () => void;
  processingId: string | null;
}

export const ArticleList = ({ articles, onPublish, onToggleFavorite, onDelete, onShowGenerator, processingId }: ArticleListProps) => {
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
        <ArticleRow
          key={article.id}
          article={article}
          onPublish={onPublish}
          onToggleFavorite={onToggleFavorite}
          onDelete={onDelete}
          isProcessing={article.id === processingId}
        />
      ))}
    </div>
  );
};
