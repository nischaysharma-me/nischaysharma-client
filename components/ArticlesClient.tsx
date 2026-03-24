'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { auth } from '@/lib/firebase';
import { Article } from '@/lib/types/article';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ArticleGeneratorForm } from '@/components/admin/ArticleGeneratorForm';
import { ArticleList } from '@/components/admin/ArticleList';
import ArticlesLoading from '@/app/admin/articles/loading';
import { toast } from 'sonner';
import { useDialogStore } from '@/store/useDialogStore';
import { useArticlesStore } from '@/store/admin/useArticlesStore';

interface ArticlesClientProps {
  initialArticles: Article[];
}

export default function ArticlesClient({ initialArticles }: ArticlesClientProps) {
  const { 
    articles, 
    loading, 
    setArticles, 
    fetchArticles, 
    publishArticle 
  } = useArticlesStore();
  
  const [showGenerator, setShowGenerator] = useState(false);
  const { openDialog } = useDialogStore();

  // Hydrate store on mount
  useEffect(() => {
    if (initialArticles && articles.length === 0) {
      setArticles(initialArticles);
    }
  }, [initialArticles, articles.length, setArticles]);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        fetchArticles();
      }
    });
    return () => unsubscribe();
  }, [fetchArticles]);

  // Listen for real-time data refresh events (e.g. from RealtimeNotificationHandler)
  useEffect(() => {
    const handleRefresh = (event: Event) => {
      const customEvent = event as CustomEvent;
      const { type } = customEvent.detail || {};
      if (type === 'article-generation' || type === 'article') {
        console.log('ArticlesClient: Refreshing list due to event:', type);
        fetchArticles();
      }
    };

    window.addEventListener('tc:data-refresh', handleRefresh);
    return () => window.removeEventListener('tc:data-refresh', handleRefresh);
  }, [fetchArticles]);

  const handlePublish = async (id: string) => {
    openDialog({
      title: 'Publish Article',
      message: 'Are you sure you want to publish this article?',
      confirmLabel: 'Publish',
      onConfirm: async () => {
        const success = await publishArticle(id);
        if (success) {
          toast.success('Article published successfully');
        } else {
          toast.error('Failed to publish article');
        }
      }
    });
  };

  if (loading && articles.length === 0) {
    return <ArticlesLoading />;
  }

  return (
    <div className="articles-admin">
      <div className="dashboard__title">
        <h2>Content Management</h2>
        <p>Manage all your articles, drafts, and AI-powered publications.</p>
      </div>

      <div className="dashboard__grid-layout">
        <div className="dashboard__grid-main">
          {/* AI Generator Toggleable Section */}
          {showGenerator && (
            <div className="mb-8">
              <ArticleGeneratorForm 
                onSuccess={fetchArticles} 
                onClose={() => setShowGenerator(false)} 
              />
            </div>
          )}

          <Card className="dashboard__recent" padded={false}>
            <div className="dashboard__recent-header" style={{ padding: '1.5rem' }}>
              <h3>All Articles ({articles.length})</h3>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <Button 
                  variant="secondary" 
                  size="sm"
                  onClick={() => setShowGenerator(!showGenerator)}
                  leftIcon={<i className="ph ph-sparkle" />}
                >
                  AI
                </Button>
                <Link href="/admin/articles/create">
                  <Button 
                    variant="primary" 
                    size="sm"
                    leftIcon={<i className="ph ph-plus" />}
                  >
                    New Article
                  </Button>
                </Link>
              </div>
            </div>
            
            <ArticleList 
              articles={articles} 
              onPublish={handlePublish} 
              onShowGenerator={() => setShowGenerator(true)} 
            />
          </Card>
        </div>

        <div className="dashboard__grid-sidebar">
          <Card padded className="articles-admin__insight-card">
            <h3 className="label">Editorial Insights</h3>
            <p className="mt-4 text-sm" style={{ color: '#737373', lineHeight: '1.6' }}>
              Your current anthology consists of {articles.length} articles. 
              <br /><br />
              <strong>AI Automation:</strong> Use the generator to create high-quality technical drafts in seconds. Ensure you select the right depth for your audience.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
