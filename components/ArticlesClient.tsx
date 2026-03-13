'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { auth } from '@/lib/firebase';
import { articlesService, Article } from '@/services/articles.service';
import { templatesService } from '@/services/templates.service';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import ArticlesLoading from '@/app/admin/articles/loading';
import { toast } from 'sonner';
import { useDialogStore } from '@/store/useDialogStore';

interface ArticlesClientProps {
  initialArticles: Article[];
}

export default function ArticlesClient({ initialArticles }: ArticlesClientProps) {
  const [articles, setArticles] = useState<Article[]>(initialArticles);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [showGenerator, setShowGenerator] = useState(false);
  const [templates, setTemplates] = useState<any[]>([]);
  
  // Generator form states
  const [topic, setTopic] = useState('');
  const [instructions, setInstructions] = useState('');
  const [templateId, setTemplateId] = useState('');
  const [depth, setDepth] = useState('standard');
  const [error, setError] = useState('');
  const { openDialog } = useDialogStore();

  useEffect(() => {
    if (showGenerator) {
      fetchTemplates();
    }
  }, [showGenerator]);

  useEffect(() => {
    // Fetch all user articles on mount to ensure drafts are visible
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        fetchArticles();
      }
    });
    return () => unsubscribe();
  }, []);

  const fetchTemplates = async () => {
    try {
      const response = await templatesService.listTemplates();
      if (response.success) {
        setTemplates(response.data);
      }
    } catch (err) {
      console.error('Error fetching templates:', err);
    }
  };

  const fetchArticles = async () => {
    try {
      setLoading(true);
      const token = await auth.currentUser?.getIdToken();
      if (!token) return;

      const response = await articlesService.listArticles(undefined, token);
      if (response.success) {
        setArticles(response.data);
      }
    } catch (err: any) {
      console.error('Error fetching articles:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setGenerating(true);
      setError('');
      const token = await auth.currentUser?.getIdToken();
      if (!token) throw new Error('No authentication token');

      const response = await articlesService.generateArticle({
        topic,
        instructions,
        templateId: templateId || undefined,
        depth
      }, token);

      if (response.success) {
        toast.success('AI generation started!', {
          description: 'Draft will appear shortly.'
        });
        setShowGenerator(false);
        setTopic('');
        setInstructions('');
        fetchArticles();
      } else {
        setError(response.error || 'Failed to start generation');
      }
    } catch (err: any) {
      toast.error('Error: ' + err.message);
    } finally {
      setGenerating(false);
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

  const handlePublish = async (id: string) => {
    openDialog({
      title: 'Publish Article',
      message: 'Are you sure you want to publish this article?',
      confirmLabel: 'Publish',
      onConfirm: async () => {
        try {
          const token = await auth.currentUser?.getIdToken();
          if (!token) return;
          await articlesService.publish(id, token);
          toast.success('Article published successfully');
          fetchArticles();
        } catch (err: any) {
          toast.error('Error publishing article: ' + err.message);
        }
      }
    });
  };

  if (loading) {
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
            <div className="card card--padded articles-admin__generator-card">
              <div className="articles-admin__generator-header">
                <h3>AI Article Generator</h3>
                <button onClick={() => setShowGenerator(false)} className="close-btn">
                  <i className="ph ph-x" style={{ fontSize: '1rem' }} />
                </button>
              </div>
              
              <form onSubmit={handleGenerate} className="auth__fields">
                <div className="organization__form-group">
                  <label className="label">Primary Topic</label>
                  <Input 
                    placeholder="e.g. The impact of Web3 on modern finance" 
                    value={topic} 
                    onChange={(e) => setTopic(e.target.value)} 
                    required
                  />
                </div>

                <div className="organization__form-group" style={{ marginTop: '1.5rem' }}>
                  <label className="label">Custom Instructions</label>
                  <textarea 
                    className="input" 
                    placeholder="Specific points to cover, or preferred tone..." 
                    style={{ height: '80px', resize: 'none', padding: '0.75rem' }}
                    value={instructions}
                    onChange={(e) => setInstructions(e.target.value)}
                  />
                </div>

                <div className="articles-admin__form-row">
                  <div className="organization__form-group">
                    <label className="label">Editorial Template</label>
                    <select 
                      value={templateId} 
                      onChange={(e) => setTemplateId(e.target.value)}
                      className="input"
                      style={{ background: '#fff' }}
                    >
                      <option value="">No Template</option>
                      {templates.map(t => (
                        <option key={t.id} value={t.id}>{t.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="organization__form-group">
                    <label className="label">Content Depth</label>
                    <select 
                      value={depth} 
                      onChange={(e) => setDepth(e.target.value)}
                      className="input"
                      style={{ background: '#fff' }}
                    >
                      <option value="brief">Brief</option>
                      <option value="standard">Standard</option>
                      <option value="deep-dive">Deep-Dive</option>
                    </select>
                  </div>
                </div>

                {error && <p className="auth__error" style={{ marginTop: '1rem' }}>{error}</p>}

                <div className="organization__actions" style={{ marginTop: '2rem', display: 'flex', gap: '1rem', flexDirection: 'column' }}>
                  <Button type="submit" variant="primary" className="btn--full" disabled={generating} loading={generating}>
                    <span>Start AI Generation</span>
                  </Button>
                </div>
              </form>
            </div>
          )}

          <div className="card dashboard__recent">
            <div className="dashboard__recent-header">
              <h3>All Articles ({articles.length})</h3>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <Button 
                  variant="secondary" 
                  style={{ padding: '0.5rem 1rem', height: 'auto' }}
                  onClick={() => setShowGenerator(!showGenerator)}
                >
                  <i className="ph ph-sparkle" />
                  <span>AI</span>
                </Button>
                <Link href="/admin/articles/create">
                  <Button variant="primary" style={{ padding: '0.5rem 1rem', height: 'auto' }}>
                    <i className="ph ph-plus" />
                    <span>New Article</span>
                  </Button>
                </Link>
              </div>
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
                    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                      <span className={`badge ${getStatusClass(article.status || 'draft')}`}>
                        {article.status || 'draft'}
                      </span>
                      <div style={{ display: 'flex', gap: '0.4rem' }}>
                        <Link href={`/admin/articles/${article.id}`}>
                          <button className="btn btn--ghost" style={{ padding: '0.4rem' }} title="Edit">
                            <i className="ph ph-pencil-line" style={{ fontSize: '1.2rem' }} />
                          </button>
                        </Link>
                        {article.status !== 'published' && (
                          <button 
                            className="btn btn--ghost" 
                            style={{ padding: '0.4rem', color: '#10b981' }} 
                            title="Publish"
                            onClick={() => handlePublish(article.id)}
                          >
                            <i className="ph ph-check-circle" style={{ fontSize: '1.2rem' }} />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ padding: '4rem 2rem', textAlign: 'center' }}>
                  <p style={{ color: '#737373', marginBottom: '1.5rem' }}>No articles found.</p>
                  <Button variant="secondary" onClick={() => setShowGenerator(true)}><span>Create your first article</span></Button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="dashboard__grid-sidebar">
          <div className="card card--padded articles-admin__insight-card">
            <h3 className="label">Editorial Insights</h3>
            <p>
              Your current anthology consists of {articles.length} articles. 
              <br /><br />
              <strong>AI Automation:</strong> Use the generator to create high-quality technical drafts in seconds. Ensure you select the right depth for your audience.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
