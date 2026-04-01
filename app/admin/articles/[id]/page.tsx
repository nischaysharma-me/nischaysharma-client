'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase';
import { articlesService } from '@/services/articles.service';
import { Article } from '@/lib/types/article';
import TiptapEditor from '@/components/editor/TiptapEditor';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import Image from 'next/image';
import ArticlesLoading from '@/app/admin/articles/loading';
import { toast } from 'sonner';
import { useDialogStore } from '@/store/useDialogStore';
import { integrationsService, IntegrationsList } from '@/services/integrations.service';
import { Interface } from 'readline';

export default function ArticleEditPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [generatingPost, setGeneratingPost] = useState(false);
  const [integrations, setIntegrations] = useState<IntegrationsList>({});
  const [error, setError] = useState('');
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [backgroundImage, setBackgroundImage] = useState('');
  const [linkedinPostText, setLinkedinPostText] = useState('');
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const { openDialog } = useDialogStore();

  useEffect(() => {
    fetchArticle();
    fetchIntegrations();
  }, [id]);

  const fetchIntegrations = async () => {
    try {
      const token = await auth.currentUser?.getIdToken();
      if (!token) return;
      const res = await integrationsService.list(token);
      if (res.success) setIntegrations(res.data);
    } catch (err) {
      console.error('Error fetching integrations:', err);
    }
  };

  const fetchArticle = async () => {
    try {
      setLoading(true);
      const token = await auth.currentUser?.getIdToken();
      if (!token) throw new Error('No authentication token');

      const response = await articlesService.getById(id, token);
      if (response.success && response.data) {
        setArticle(response.data);
        setTitle(response.data.title);
        setDescription(response.data.description);
        setContent(response.data.content);
        setBackgroundImage(response.data.backgroundImage || '');
        setLinkedinPostText(`🚀 Just published a new article: "${response.data.title}"\n\n${response.data.description || ''}\n\nRead more on TaughtCode.`);
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
        toast.success('Article updated successfully!');
      }
    } catch (err: any) {
      toast.error('Error saving article: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async () => {
    openDialog({
      title: 'Publish Article',
      message: 'Are you sure you want to publish this article? It will become visible on the public site.',
      confirmLabel: 'Publish',
      onConfirm: async () => {
        try {
          setPublishing(true);
          const token = await auth.currentUser?.getIdToken();
          if (!token) throw new Error('No authentication token');

          const response = await articlesService.publish(id, token);
          if (response.success && response.data) {
            setArticle(response.data);
            toast.success('Article published successfully!');
          }
        } catch (err: any) {
          toast.error('Error publishing article: ' + err.message);
        } finally {
          setPublishing(false);
        }
      }
    });
  };

  const handleShareToLinkedIn = async () => {
    if (!article) return;
    try {
      setSharing(true);
      const token = await auth.currentUser?.getIdToken();
      if (!token) throw new Error('No authentication token');

      const url = `${window.location.origin}/articles/${article.slug}`;

      const response = await integrationsService.shareToLinkedIn({
        text: linkedinPostText,
        url: url,
        title: title
      }, token);

      if (response.success) {
        toast.success('Successfully shared to LinkedIn!');
      }
    } catch (err: any) {
      toast.error('Failed to share to LinkedIn: ' + err.message);
    } finally {
      setSharing(false);
    }
  };

  const handleGenerateAIPost = async () => {
    try {
      setGeneratingPost(true);
      const token = await auth.currentUser?.getIdToken();
      if (!token) return;

      const response = await integrationsService.generateAIPost({
        title,
        description,
        type: 'article'
      }, token);

      if (response.success) {
        setLinkedinPostText(response.data.text);
        toast.success('AI post generated!');
      }
    } catch (err: any) {
      toast.error('AI generation failed: ' + err.message);
    } finally {
      setGeneratingPost(false);
    }
  };

  if (loading) return <ArticlesLoading />;
  if (!article) return <div className="error">Article not found</div>;

  return (
    <div className="article-edit">
      <div className="article-edit__header">
        <div className="dashboard__title">
          <h2>Edit Article</h2>
          <p>Modify your content, metadata, and visuals.</p>
        </div>
        <div className="dashboard__header-actions">
          <Button variant="secondary" onClick={() => setIsPreviewMode(!isPreviewMode)}>
            <i className="ph ph-eye" style={{ marginRight: '0.4rem' }} />
            <span>{isPreviewMode ? 'Editor' : 'Preview'}</span>
          </Button>
          <Button variant="secondary" onClick={() => router.back()}>
            <i className="ph ph-x" style={{ marginRight: '0.4rem' }} />
            <span>Cancel</span>
          </Button>
          <Button variant="primary" onClick={handleSave} disabled={saving}>
            <i className="ph ph-floppy-disk" style={{ marginRight: '0.4rem' }} />
            <span>Save</span>
          </Button>
          {article.status !== 'published' && (
            <Button variant="primary" onClick={handlePublish} disabled={publishing} style={{ background: '#10b981', border: 'none' }}>
              <i className="ph ph-paper-plane-tilt" style={{ marginRight: '0.4rem' }} />
              <span>Publish</span>
            </Button>
          )}
        </div>
      </div>

      <div className="dashboard__grid-layout">
        <div className="dashboard__grid-main">
          {isPreviewMode ? (
            <div className="card card--padded">
               <h1 className="articles-parallax__title" style={{ color: '#000', textAlign: 'left', marginBottom: '2rem' }}>{title}</h1>
               {backgroundImage && (
                 <div className="article-edit__preview-image">
                    <Image 
                        src={backgroundImage} 
                        alt="Cover" 
                        fill
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

        <div className="dashboard__grid-sidebar">
          {article.status === 'published' && (
            <div className="card card--padded">
              <h3 className="label" style={{ marginBottom: '1.5rem' }}>Social Distribution</h3>
              
              {!integrations.linkedin?.connected ? (
                <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', lineHeight: 1.4 }}>
                  Connect your LinkedIn account in <Link href="/admin/profile" style={{ textDecoration: 'underline' }}>Profile Settings</Link> to share your articles directly.
                </p>
              ) : (
                <div className="organization__form-group">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <label className="label" style={{ margin: 0 }}>LinkedIn Post Content</label>
                    <button 
                      onClick={handleGenerateAIPost} 
                      disabled={generatingPost}
                      style={{ background: 'none', border: 'none', color: 'var(--color-text-primary)', fontSize: '0.7rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                    >
                      {generatingPost ? <i className="ph ph-spinner animate-spin" /> : <i className="ph ph-sparkle" />}
                      Generate with AI
                    </button>
                  </div>
                  <textarea 
                    className="input" 
                    style={{ height: '120px', resize: 'vertical', padding: '0.75rem', fontSize: '0.8rem' }}
                    value={linkedinPostText}
                    onChange={(e) => setLinkedinPostText(e.target.value)}
                    placeholder="What would you like to say on LinkedIn?"
                  />
                  <Button 
                    variant="secondary" 
                    className="btn--full"
                    style={{ marginTop: '1rem', background: '#0077b5', color: '#fff', border: 'none' }}
                    onClick={handleShareToLinkedIn}
                    disabled={sharing}
                    loading={sharing}
                  >
                    <i className="ph ph-linkedin-logo" style={{ marginRight: '0.4rem' }} />
                    <span>Share to LinkedIn</span>
                  </Button>
                </div>
              )}
            </div>
          )}

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
                <div className="article-edit__sidebar-image">
                  <Image src={backgroundImage} alt="Preview" fill />
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
              <div>
                <span className={`badge badge--${article.status?.toLowerCase()}`} style={{ marginTop: '0.5rem' }}>
                  {article.status}
                </span>
              </div>
            </div>

            <div className="stat-group" style={{ marginTop: '1.5rem' }}>
              <span className="label">Slug</span>
              <div className="article-edit__slug-display">{article.slug}</div>
            </div>
          </div>

          <div className="card card--padded">
             <h3 className="label" style={{ marginBottom: '1rem' }}>Article Actions</h3>
             <Button variant="secondary" className="btn--full" style={{ color: '#ff6b6b' }}>
               <i className="ph ph-archive" style={{ marginRight: '0.4rem' }} />
               <span>Archive Article</span>
             </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
