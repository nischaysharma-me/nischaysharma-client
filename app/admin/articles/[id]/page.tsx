'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase';
import { articlesService, Article } from '@/services/articles.service';
import TiptapEditor from '@/components/editor/TiptapEditor';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import Image from 'next/image';
import ArticlesLoading from '@/app/admin/articles/loading';

export default function ArticleEditPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState('');
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [backgroundImage, setBackgroundImage] = useState('');
  const [isPreviewMode, setIsPreviewMode] = useState(false);

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
        setBackgroundImage(response.data.backgroundImage || '');
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
        content,
        backgroundImage
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

  const handlePublish = async () => {
    if (!confirm('Are you sure you want to publish this article? It will become visible on the public site.')) return;
    
    try {
      setPublishing(true);
      const token = await auth.currentUser?.getIdToken();
      if (!token) throw new Error('No authentication token');

      const response = await articlesService.publish(id, token);
      if (response.success) {
        setArticle(response.data);
        alert('Article published successfully!');
      }
    } catch (err: any) {
      alert('Error publishing article: ' + err.message);
    } finally {
      setPublishing(false);
    }
  };

  if (loading) return <ArticlesLoading />;
  if (!article) return <div className="error">Article not found</div>;

  return (
    <div className="article-edit">
      <div className="dashboard__header" style={{ position: 'static', background: 'transparent', padding: '0', marginBottom: '2rem' }}>
        <div className="dashboard__title">
          <h2>Edit Article</h2>
          <p>Modify your content, metadata, and visuals.</p>
        </div>
        <div className="dashboard__header-actions">
          <Button variant="secondary" onClick={() => setIsPreviewMode(!isPreviewMode)}>
            {isPreviewMode ? 'Back to Editor' : 'Preview Content'}
          </Button>
          <Button variant="secondary" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
          {article.status !== 'published' && (
            <Button variant="primary" onClick={handlePublish} disabled={publishing} style={{ background: '#10b981', border: 'none' }}>
              {publishing ? 'Publishing...' : 'Publish'}
            </Button>
          )}
        </div>
      </div>

      <div className="dashboard__grid-layout">
        <div className="lg:col-span-2">
          {isPreviewMode ? (
            <div className="card card--padded">
               <h1 className="articles-parallax__title" style={{ color: '#000', textAlign: 'left', marginBottom: '2rem' }}>{title}</h1>
               {backgroundImage && (
                 <div style={{ position: 'relative', width: '100%', height: '300px', marginBottom: '2rem' }}>
                    <Image 
                        src={backgroundImage} 
                        alt="Cover" 
                        fill
                        style={{ objectFit: 'cover', borderRadius: '1rem' }} 
                    />
                 </div>
               )}
               <div className="tiptap-content" dangerouslySetInnerHTML={{ __html: content }} />
            </div>
          ) : (
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
          )}
        </div>

        <div className="dashboard__sidebar-col">
          <div className="card card--padded">
            <h3 className="label" style={{ marginBottom: '1.5rem' }}>Visuals & SEO</h3>
            
            <div className="organization__form-group">
              <label className="label">Background Image URL</label>
              <Input 
                value={backgroundImage} 
                onChange={(e) => setBackgroundImage(e.target.value)}
                placeholder="https://..."
              />
              {backgroundImage && (
                <div style={{ marginTop: '1rem', borderRadius: '0.5rem', overflow: 'hidden', border: '1px solid #eee', position: 'relative', width: '100%', height: '120px' }}>
                  <Image src={backgroundImage} alt="Preview" fill style={{ objectFit: 'cover' }} />
                </div>
              )}
            </div>

            <div className="organization__form-group" style={{ marginTop: '2rem' }}>
              <label className="label">Description</label>
              <textarea 
                className="input" 
                style={{ height: '100px', resize: 'none', padding: '0.75rem' }}
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
              <p className="description" style={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>{article.slug}</p>
            </div>
          </div>

          <div className="card card--padded">
             <h3 className="label" style={{ marginBottom: '1rem' }}>Article Actions</h3>
             <Button variant="secondary" className="btn--full" style={{ color: '#ff6b6b' }}>
               Archive Article
             </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
