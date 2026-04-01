'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Post } from '@/lib/types/post';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Card } from '@/components/ui/Card';
import { postsService } from '@/services/posts.service';
import { auth } from '@/lib/firebase';
import { toast } from 'sonner';
import { useDialogStore } from '@/store/useDialogStore';
import Image from 'next/image';

interface PostEditClientProps {
  initialPost: Post;
}

export default function PostEditClient({ initialPost }: PostEditClientProps) {
  const router = useRouter();
  const [post, setPost] = useState<Post>(initialPost);
  const [content, setContent] = useState(initialPost.content);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const { openDialog } = useDialogStore();

  const handleSave = async () => {
    try {
      setSaving(true);
      const token = await auth.currentUser?.getIdToken();
      if (!token) throw new Error('Unauthorized');

      const response = await postsService.updatePost(post.id, { content }, token);
      if (response.success && response.data) {
        setPost(response.data);
        toast.success('Post updated successfully');
      }
    } catch (err: any) {
      toast.error('Error saving post: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async () => {
    openDialog({
      title: 'Publish Post',
      message: 'Are you sure you want to publish this post to App & LinkedIn?',
      confirmLabel: 'Publish',
      onConfirm: async () => {
        try {
          setPublishing(true);
          const token = await auth.currentUser?.getIdToken();
          if (!token) throw new Error('Unauthorized');

          const response = await postsService.publishPost(post.id, ['app', 'linkedin'], token);
          if (response.success && response.data) {
            setPost(response.data);
            toast.success('Post published successfully');
          }
        } catch (err: any) {
          toast.error('Error publishing post: ' + err.message);
        } finally {
          setPublishing(false);
        }
      }
    });
  };

  return (
    <div className="articles-admin">
      <div className="dashboard__title">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <i className="ph ph-arrow-left" />
          </Button>
          <h2>Edit Post</h2>
        </div>
        <p>Refine your social media content before publishing.</p>
      </div>

      <div className="dashboard__grid-layout">
        <div className="dashboard__grid-main">
          <Card padded>
            <div className="organization__form-group">
              <label className="label">Post Content</label>
              <textarea 
                className="input" 
                style={{ height: '300px', resize: 'vertical', padding: '1rem', marginTop: '0.5rem', width: '100%' }}
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />
            </div>

            {post.attachedMedia && post.attachedMedia.length > 0 && (
              <div className="mt-8">
                <label className="label">Attached Media</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem', marginTop: '0.5rem' }}>
                  {post.attachedMedia.map((url, idx) => (
                    <div key={idx} style={{ position: 'relative', aspectRatio: '16/9', borderRadius: '8px', overflow: 'hidden', border: '1px solid #e5e5e5' }}>
                      <Image 
                        src={url} 
                        alt="Post media" 
                        fill 
                        style={{ objectFit: 'cover' }} 
                        sizes="(max-width: 768px) 100vw, 300px"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-8" style={{ display: 'flex', gap: '1rem' }}>
              <Button onClick={handleSave} loading={saving} disabled={saving}>
                Save Changes
              </Button>
              {post.status !== 'published' && (
                <Button variant="primary" onClick={handlePublish} loading={publishing} disabled={publishing}>
                  Publish Now
                </Button>
              )}
            </div>
          </Card>
        </div>

        <div className="dashboard__grid-sidebar">
          <Card padded>
            <h3 className="label">Post Details</h3>
            <div className="mt-4 space-y-4 text-sm" style={{ color: '#737373' }}>
              <div>
                <strong>Status:</strong> {post.status}
              </div>
              <div>
                <strong>Created:</strong> {new Date(post.createdAt).toLocaleString()}
              </div>
              {post.articleId && (
                <div>
                  <strong>Linked Article:</strong> {post.articleId}
                </div>
              )}
              {post.bookId && (
                <div>
                  <strong>Linked Book:</strong> {post.bookId}
                </div>
              )}
            </div>
            <div className="mt-8">
              <Button variant="secondary" size="full" onClick={() => router.push(`/admin/posts/${post.id}/preview`)}>
                Live Preview
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
