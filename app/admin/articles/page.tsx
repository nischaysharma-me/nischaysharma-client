'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { auth } from '@/lib/firebase';
import { articlesService, Article } from '@/services/articles.service';
import { Button } from '@/components/ui/Button';

export default function ArticlesPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    try {
      setLoading(true);
      const token = await auth.currentUser?.getIdToken();
      if (!token) throw new Error('No authentication token');

      const response = await articlesService.listArticles(undefined, token);
      if (response.success) {
        setArticles(response.data);
      }
    } catch (err: any) {
      console.error('Error fetching articles:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusClass = (status: string) => {
    switch (status.toLowerCase()) {
      case 'published': return 'badge--published';
      case 'draft': return 'badge--draft';
      case 'archived': return 'badge--review';
      default: return '';
    }
  };

  if (loading) {
    return <div className="loading">Loading articles...</div>;
  }

  const handlePublish = async (id: string) => {
    if (!confirm('Publish this article?')) return;
    try {
      const token = await auth.currentUser?.getIdToken();
      if (!token) return;
      await articlesService.publish(id, token);
      fetchArticles();
    } catch (err: any) {
      alert('Error: ' + err.message);
    }
  };

  return (
    <div className="articles-admin">
      <div className="dashboard__title">
        <h2>Content Management</h2>
        <p>Manage all your articles, drafts, and publications.</p>
      </div>

      <div className="card dashboard__recent">
        <div className="dashboard__recent-header">
          <h3>All Articles ({articles.length})</h3>
          <Button variant="primary" style={{ padding: '0.5rem 1rem', height: 'auto' }}>
            + New Article
          </Button>
        </div>
        
        <div className="dashboard__recent-list">
          {articles.length > 0 ? (
            articles.map((article) => (
              <div key={article.id} className="dashboard__recent-item">
                <div className="dashboard__recent-item-info">
                  <div className="dashboard__recent-item-title">{article.title}</div>
                  <div className="dashboard__recent-item-meta">
                    <span>Published: {article.publishedAt ? new Date(article.publishedAt).toLocaleDateString() : 'N/A'}</span>
                    <span className="dot" />
                    <span>Slug: {article.slug}</span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  <span className={`badge ${getStatusClass(article.status || 'draft')}`}>
                    {article.status || 'draft'}
                  </span>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <Link href={`/admin/articles/${article.id}`}>
                      <button className="btn btn--ghost" style={{ padding: '0.4rem' }} title="Edit">
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ width: '1rem' }}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                      </button>
                    </Link>
                    {article.status !== 'published' && (
                      <button 
                        className="btn btn--ghost" 
                        style={{ padding: '0.4rem', color: '#10b981' }} 
                        title="Publish"
                        onClick={() => handlePublish(article.id)}
                      >
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ width: '1rem' }}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                      </button>
                    )}
                    <button className="btn btn--ghost" style={{ padding: '0.4rem' }} title="Preview">
                      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ width: '1rem' }}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div style={{ padding: '4rem 2rem', textAlign: 'center' }}>
              <p style={{ color: '#737373', marginBottom: '1.5rem' }}>No articles found.</p>
              <Button variant="secondary">Create your first article</Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
