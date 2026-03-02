'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { auth } from '@/lib/firebase';
import { articlesService, Article } from '@/services/articles.service';
import { templatesService } from '@/services/templates.service';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import ArticlesLoading from '@/app/admin/articles/loading';

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

  useEffect(() => {
    if (showGenerator) {
      fetchTemplates();
    }
  }, [showGenerator]);

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
        alert('AI generation started! Draft will appear shortly.');
        setShowGenerator(false);
        setTopic('');
        setInstructions('');
        fetchArticles();
      } else {
        setError(response.error || 'Failed to start generation');
      }
    } catch (err: any) {
      setError(err.message);
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
        <div className="lg:col-span-2">
          {/* AI Generator Toggleable Section */}
          {showGenerator && (
            <div className="card card--padded" style={{ marginBottom: '2.5rem', border: '1px solid #111' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3 className="dashboard__recent-item-title">AI Article Generator</h3>
                <button onClick={() => setShowGenerator(false)} style={{ fontSize: '0.7rem', fontWeight: 800, opacity: 0.4 }}>CLOSE</button>
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

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1.5rem' }}>
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

                <div className="organization__actions" style={{ marginTop: '2rem' }}>
                  <Button type="submit" variant="primary" className="btn--full" disabled={generating}>
                    {generating ? 'Engine Processing...' : 'Start AI Generation'}
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
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ width: '0.8rem', marginRight: '0.4rem' }}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                  AI Generate
                </Button>
                <Link href="/admin/articles/create">
                  <Button variant="primary" style={{ padding: '0.5rem 1rem', height: 'auto' }}>
                    + New Article
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

        <div className="dashboard__sidebar-col">
          <div className="card card--padded">
            <h3 className="label" style={{ marginBottom: '1.5rem', display: 'block', fontSize: '0.625rem', fontWeight: 700, color: '#a3a3a3', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Editorial Insights</h3>
            <p style={{ fontSize: '0.875rem', lineHeight: 1.6, color: '#737373' }}>
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
