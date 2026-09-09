'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
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
import { motion, AnimatePresence } from 'framer-motion';
import MarkdownView from '@/components/ui/MarkdownView';
import { usersService } from '@/services/users.service';
import { useImageCrop } from '@/components/image/ImageCropProvider';

export default function ArticleEditPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [isRegeneratingBackground, setIsRegeneratingBackground] = useState(false);
  const [isUploadingBackground, setIsUploadingBackground] = useState(false);
  const backgroundInputRef = useRef<HTMLInputElement>(null);
  const [regenerationJobId, setRegenerationJobId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [backgroundImage, setBackgroundImage] = useState('');
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const { openDialog } = useDialogStore();
  const { cropImageUrl } = useImageCrop();

  useEffect(() => {
    fetchArticle();
  }, [id]);

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

  const handleRegenerateBackgroundImage = async () => {
    try {
      setIsRegeneratingBackground(true);
      const token = await auth.currentUser?.getIdToken();
      if (!token) throw new Error('No authentication token');

      const response = await articlesService.regenerateBackgroundImage(id, {}, token);

      if (response.success) {
        if (response.data) {
          setRegenerationJobId(response.data.jobId);
        }
        toast.info('Background image generation started. This may take a few moments.');
        // The new background image URL will be automatically updated when the job completes
      }
    } catch (error: any) {
      toast.error('Failed to start background image generation: ' + error.message);
      console.error('Background image generation error:', error);
    } finally {
      setIsRegeneratingBackground(false);
    }
  };

  const handleBackgroundUpload = async (file?: File) => {
    if (!file) return;
    try {
      setIsUploadingBackground(true);
      const token = await auth.currentUser?.getIdToken();
      if (!token) throw new Error('No authentication token');
      const response = await usersService.uploadAsset(file, 'articles', token);
      if (!response.success || !response.url) throw new Error('Upload failed');
      setBackgroundImage(response.url);
      toast.success('Cropped article background uploaded');
    } catch (uploadError) {
      toast.error(`Background upload failed: ${(uploadError as Error).message}`);
    } finally {
      setIsUploadingBackground(false);
      if (backgroundInputRef.current) backgroundInputRef.current.value = '';
    }
  };

  const cropCurrentBackground = async () => {
    if (!backgroundImage) return;
    try {
      const cropped = await cropImageUrl(backgroundImage, { aspect: 16 / 9, label: 'article background', maxWidth: 2200 });
      if (cropped) await handleBackgroundUpload(cropped);
    } catch (cropError) {
      toast.error(`Unable to crop current image: ${(cropError as Error).message}`);
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
          <Button variant="primary" onClick={handleSave} disabled={saving} loading={saving}>
            <i className="ph ph-floppy-disk" style={{ marginRight: '0.4rem' }} />
            <span>Save</span>
          </Button>
          {article.status !== 'published' && (
            <Button 
              variant="primary" 
              onClick={handlePublish} 
              disabled={publishing} 
              loading={publishing}
              style={{ background: '#10b981', border: 'none' }}
            >
              <i className="ph ph-paper-plane-tilt" style={{ marginRight: '0.4rem' }} />
              <span>Publish</span>
            </Button>
          )}
        </div>
      </div>

      <div className={`dashboard__grid-layout ${isSidebarCollapsed ? 'dashboard__grid-layout--sidebar-collapsed' : ''}`}>
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
               <MarkdownView content={content} className="tiptap-content" />
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
                  isCompact={!isSidebarCollapsed}
                />
              </div>
            </div>
          )}
        </div>

        <motion.div 
          className={`dashboard__grid-sidebar ${isSidebarCollapsed ? 'dashboard__grid-sidebar--collapsed' : ''}`}
          animate={{ 
            width: isSidebarCollapsed ? 48 : 380,
          }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        >
          <button 
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className={`sidebar-collapse-btn ${isSidebarCollapsed ? 'sidebar-collapse-btn--collapsed' : ''}`}
            title={isSidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            <i className={`ph ph-caret-double-${isSidebarCollapsed ? 'left' : 'right'}`} />
          </button>

          <AnimatePresence mode="wait">
            {isSidebarCollapsed ? (
              <motion.div
                key="collapsed-indicators"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="sidebar-collapsed-indicators"
              >
                <i className="ph ph-share-network" title="Social Distribution" />
                <i className="ph ph-magnifying-glass" title="Visuals & SEO" />
                <i className="ph ph-dots-three-circle" title="Article Actions" />
              </motion.div>
            ) : (
              <motion.div
                key="sidebar-content"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
                style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}
              >
                {article.status === 'published' && (
                  <div className="card card--padded">
                    <h3 className="label" style={{ marginBottom: '1.5rem' }}>Social Distribution</h3>
                    
                    <Link className="linkedin-launcher" href={`/admin/articles/${id}/post/linkedin`}>
                      <span className="linkedin-launcher__icon"><i className="ph ph-linkedin-logo" /></span>
                      <span><strong>Create LinkedIn post</strong><small>Open the dedicated publishing studio</small></span>
                      <i className="ph ph-arrow-right" />
                    </Link>
                  </div>
                )}

                <div className="card card--padded">
                  <h3 className="label" style={{ marginBottom: '1.5rem' }}>Visuals & SEO</h3>
                  
                  <div className="organization__form-group">
                    <label className="label">Background Image URL</label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.5rem' }}>
                      <Input 
                        value={backgroundImage} 
                        onChange={(e) => setBackgroundImage(e.target.value)}
                        placeholder="https://..."
                        style={{ flex: '1 1 180px', minWidth: 0 }}
                      />
                      <button 
                        onClick={handleRegenerateBackgroundImage} 
                        disabled={isRegeneratingBackground}
                        style={{ 
                          background: 'none', 
                          border: '1px solid var(--color-border)', 
                          borderRadius: 'var(--border-radius)',
                          color: 'var(--color-text-primary)', 
                          fontSize: '0.8rem', 
                          fontWeight: 600, 
                          cursor: 'pointer', 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '0.3rem',
                          padding: '0 0.75rem',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {isRegeneratingBackground ? <i className="ph ph-spinner animate-spin" /> : <i className="ph ph-sparkle" />}
                        <span>Generate</span>
                      </button>
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={() => backgroundInputRef.current?.click()}
                        loading={isUploadingBackground}
                      >
                        Upload
                      </Button>
                      {backgroundImage && (
                        <Button type="button" variant="secondary" size="sm" onClick={cropCurrentBackground} disabled={isUploadingBackground}>
                          Crop
                        </Button>
                      )}
                      <input
                        ref={backgroundInputRef}
                        type="file"
                        hidden
                        accept="image/*"
                        data-crop-aspect="16/9"
                        data-crop-label="article background"
                        data-crop-max-width="2200"
                        onChange={(event) => handleBackgroundUpload(event.target.files?.[0])}
                      />
                    </div>
                    {backgroundImage && (
                      <div className="article-edit__sidebar-image">
                        <Image src={backgroundImage} alt="Preview" fill />
                      </div>
                    )}
                  </div>

                  <div className="organization__form-group" style={{ marginTop: '2rem' }}>
                    <label className="label">Description</label>
                    <TiptapEditor 
                      content={description} 
                      onChange={setDescription} 
                      isCompact={true}
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
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}
