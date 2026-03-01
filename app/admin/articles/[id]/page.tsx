'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase';
import { articlesService, Article } from '@/services/articles.service';
import TiptapEditor from '@/components/editor/TiptapEditor';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export default function ArticleEditPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    fetchArticle();
  }, [id]);

  const fetchArticle = async () => {
    try {
      setLoading(true);
      const token = await auth.currentUser?.getIdToken();
      if (!token) throw new Error('No authentication token');

      const response = await articlesService.getById(id, token);
      if (response.success) {
        setArticle(response.data);
        setTitle(response.data.title);
        setDescription(response.data.description);
        setContent(response.data.content);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const token = await auth.currentUser?.getIdToken();
      if (!token) throw new Error('No authentication token');

      const response = await articlesService.updateArticle(id, {
        title,
        description,
        content
      }, token);

      if (response.success) {
        alert('Article updated successfully!');
      }
    } catch (err: any) {
      alert('Error saving article: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="loading">Loading article editor...</div>;
  if (!article) return <div className="error">Article not found</div>;

  return (
    <div className="article-edit">
      <div className="dashboard__header" style={{ position: 'static', background: 'transparent', padding: '0', marginBottom: '2rem' }}>
        <div className="dashboard__title">
          <h2>Edit Article</h2>
          <p>Modify your content, metadata, and visuals.</p>
        </div>
        <div className="dashboard__header-actions">
          <Button variant="secondary" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>

      <div className="dashboard__grid-layout">
        <div className="lg:col-span-2">
          <div className="card card--padded">
            <div className="organization__form-group">
              <label className="label">Article Title</label>
              <Input 
                value={title} 
                onChange={(e) => setTitle(e.target.value)}
                style={{ fontSize: '1.25rem', fontWeight: '700' }}
              />
            </div>
            
            <div className="organization__form-group" style={{ marginTop: '2rem' }}>
              <label className="label">Content Editor</label>
              <TiptapEditor 
                content={content} 
                onChange={setContent} 
              />
            </div>
          </div>
        </div>

        <div className="dashboard__sidebar-col">
          <div className="card card--padded">
            <h3 className="label" style={{ marginBottom: '1.5rem' }}>Metadata</h3>
            
            <div className="organization__form-group">
              <label className="label">Description</label>
              <textarea 
                className="input" 
                style={{ height: '120px', resize: 'none', padding: '0.75rem' }}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className="stat-group" style={{ marginTop: '2rem' }}>
              <span className="label">Status</span>
              <span className={`badge badge--${article.status?.toLowerCase()}`} style={{ marginTop: '0.5rem' }}>
                {article.status}
              </span>
            </div>

            <div className="stat-group" style={{ marginTop: '1.5rem' }}>
              <span className="label">Slug</span>
              <p className="description" style={{ fontFamily: 'monospace' }}>{article.slug}</p>
            </div>
          </div>

          <div className="card card--padded">
             <h3 className="label" style={{ marginBottom: '1rem' }}>Article Actions</h3>
             <Button variant="secondary" className="btn--full" style={{ marginBottom: '1rem' }}>
               Preview Article
             </Button>
             <Button variant="secondary" className="btn--full" style={{ color: '#ff6b6b' }}>
               Archive Article
             </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
