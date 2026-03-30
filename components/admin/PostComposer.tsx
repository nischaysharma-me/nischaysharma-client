'use client';

import React, { useState, useEffect } from 'react';
import { Article } from '@/lib/types/article';
import { Post, PostPlatform } from '@/lib/types/post';
import { postsService } from '@/services/posts.service';
import { integrationsService } from '@/services/integrations.service';
import { auth } from '@/lib/firebase';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { Checkbox } from '@/components/ui/Checkbox';
import { toast } from 'sonner';
import PostPreview from './PostPreview';

interface PostComposerProps {
  articles: Article[];
  onClose: () => void;
  initialPost?: Post | null;
}

export default function PostComposer({ articles, onClose, initialPost }: PostComposerProps) {
  const [selectedArticleId, setSelectedArticleId] = useState(initialPost?.articleId || '');
  const [content, setContent] = useState(initialPost?.content || '');
  const [platforms, setPlatforms] = useState<('internal' | 'linkedin')[]>(
    initialPost?.platforms.map(p => p.name) || ['internal']
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateAI = async () => {
    if (!selectedArticleId) {
      toast.error('Please select an article first');
      return;
    }
    
    const article = articles.find(a => a.id === selectedArticleId);
    if (!article) return;

    try {
      setIsGenerating(true);
      const token = await auth.currentUser?.getIdToken();
      if (!token) return;

      const res = await integrationsService.generateAIPost({
        title: article.title,
        description: article.description,
        type: 'article'
      }, token);

      if (res.success) {
        setContent(res.data);
        toast.success('AI content generated!');
      }
    } catch (err) {
      toast.error('AI generation failed');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedArticleId || !content.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      setIsSubmitting(true);
      const token = await auth.currentUser?.getIdToken();
      if (!token) return;

      if (initialPost) {
        await postsService.update(initialPost.id, {
          articleId: selectedArticleId,
          content,
          // In a real app, updating platforms might be more complex
        }, token);
        toast.success('Post updated');
      } else {
        await postsService.create({
          articleId: selectedArticleId,
          content,
          platforms
        }, token);
        toast.success('Post created successfully');
      }
      onClose();
    } catch (err) {
      toast.error('Failed to save post');
    } finally {
      setIsSubmitting(false);
    }
  };

  const togglePlatform = (platform: 'internal' | 'linkedin') => {
    setPlatforms(prev => 
      prev.includes(platform) 
        ? prev.filter(p => p !== platform) 
        : [...prev, platform]
    );
  };

  const selectedArticle = articles.find(a => a.id === selectedArticleId);

  return (
    <div className="card card--padded">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h3 className="label">{initialPost ? 'Edit Post' : 'Compose New Post'}</h3>
        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', opacity: 0.5 }}>
          <i className="ph ph-x" style={{ fontSize: '1.25rem' }} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="auth__fields">
        <div className="organization__form-group">
          <label className="label">Linked Article</label>
          <Select
            value={selectedArticleId}
            onChange={(e) => setSelectedArticleId(e.target.value)}
            options={[
              { value: '', label: 'Select an article...' },
              ...articles.map(a => ({ value: a.id, label: a.title }))
            ]}
          />
        </div>

        <div className="organization__form-group" style={{ marginTop: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <label className="label">Post Content</label>
            <Button 
              type="button" 
              variant="secondary" 
              size="sm" 
              onClick={handleGenerateAI}
              loading={isGenerating}
              disabled={!selectedArticleId || isGenerating}
            >
              <i className="ph ph-sparkle" />
              AI Generate
            </Button>
          </div>
          <textarea 
            className="input" 
            placeholder="What would you like to share?"
            style={{ height: '150px', resize: 'vertical', padding: '0.75rem' }}
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
        </div>

        <div className="organization__form-group" style={{ marginTop: '1.5rem' }}>
          <label className="label">Publishing Platforms</label>
          <div style={{ display: 'flex', gap: '2rem', marginTop: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Checkbox 
                id="platform-internal" 
                checked={platforms.includes('internal')} 
                onCheckedChange={() => togglePlatform('internal')} 
              />
              <label htmlFor="platform-internal" style={{ fontSize: '0.875rem', cursor: 'pointer' }}>In-App Feed</label>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Checkbox 
                id="platform-linkedin" 
                checked={platforms.includes('linkedin')} 
                onCheckedChange={() => togglePlatform('linkedin')} 
              />
              <label htmlFor="platform-linkedin" style={{ fontSize: '0.875rem', cursor: 'pointer' }}>LinkedIn</label>
            </div>
          </div>
        </div>

        <div style={{ marginTop: '2rem' }}>
          <h4 className="label" style={{ fontSize: '0.7rem', opacity: 0.5, marginBottom: '1rem' }}>Cross-Platform Preview</h4>
          <PostPreview 
            content={content} 
            article={selectedArticle} 
            platforms={platforms}
          />
        </div>

        <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem' }}>
          <Button 
            type="submit" 
            variant="primary" 
            className="btn--full"
            loading={isSubmitting}
            disabled={isSubmitting}
          >
            {initialPost ? 'Update Post' : 'Create & Publish'}
          </Button>
          <Button 
            type="button" 
            variant="secondary" 
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
