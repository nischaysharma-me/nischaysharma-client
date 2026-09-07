'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { auth } from '@/lib/firebase';
import { Post } from '@/lib/types/post';
import { postsService } from '@/services/posts.service';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { toast } from 'sonner';
import { useDialogStore } from '@/store/useDialogStore';
import { useRouter } from 'next/navigation';
import AIPostGenerator from '@/components/admin/AIPostGenerator';

export default function PostsAdminClient() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [showGenerator, setShowGenerator] = useState(false);
  const { openDialog } = useDialogStore();
  const router = useRouter();

  const loadPosts = useCallback(async () => {
    try {
      const token = await auth.currentUser?.getIdToken();
      if (!token) return;
      const response = await postsService.listMine(token);
      setPosts(response.data || []);
    } catch (error) {
      toast.error(`Could not load posts: ${(error as Error).message}`);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => auth.onAuthStateChanged((user) => user && loadPosts()), [loadPosts]);

  const publishPost = (post: Post) => openDialog({
    title: 'Publish post',
    message: 'Publish this post to the public feed?',
    confirmLabel: 'Publish',
    onConfirm: async () => {
      try {
        setProcessingId(post.id);
        const token = await auth.currentUser?.getIdToken();
        if (!token) throw new Error('No authentication token');
        const response = await postsService.publish(post.id, token);
        if (response.data) setPosts((current) => current.map((item) => item.id === post.id ? response.data! : item));
        toast.success('Post published');
      } catch (error) {
        toast.error((error as Error).message);
      } finally {
        setProcessingId(null);
      }
    }
  });

  const deletePost = (post: Post) => openDialog({
    title: 'Delete post',
    message: `Delete “${post.title}”? This cannot be undone.`,
    confirmLabel: 'Delete',
    onConfirm: async () => {
      try {
        setProcessingId(post.id);
        const token = await auth.currentUser?.getIdToken();
        if (!token) throw new Error('No authentication token');
        await postsService.delete(post.id, token);
        setPosts((current) => current.filter((item) => item.id !== post.id));
        toast.success('Post deleted');
      } catch (error) {
        toast.error((error as Error).message);
      } finally {
        setProcessingId(null);
      }
    }
  });

  return (
    <div className="posts-admin">
      <div className="dashboard__title posts-admin__title">
        <div>
          <h2>Posts</h2>
          <p>Create short-form updates for your site and distribute them to LinkedIn.</p>
        </div>
        <div className="posts-admin__title-actions">
          <Button variant="secondary" size="sm" onClick={() => setShowGenerator((visible) => !visible)} leftIcon={<i className="ph ph-sparkle" />}>AI generate</Button>
          <Link className="btn btn--primary btn--sm" href="/admin/posts/create"><i className="ph ph-plus" /> New post</Link>
        </div>
      </div>

      {showGenerator && (
        <AIPostGenerator
          onClose={() => setShowGenerator(false)}
          onGenerated={(post) => {
            setPosts((current) => [post, ...current]);
            router.push(`/admin/posts/${post.id}`);
          }}
        />
      )}

      <Card className="posts-admin__list" padded={false}>
        <div className="posts-admin__list-heading">
          <strong>All posts</strong><span>{posts.length}</span>
        </div>
        {loading && <div className="posts-admin__empty">Loading posts…</div>}
        {!loading && !posts.length && (
          <div className="posts-admin__empty">
            <i className="ph ph-note-pencil" />
            <h3>Your post feed is empty</h3>
            <p>Create a quick update, publish it here, then adapt it for LinkedIn.</p>
          </div>
        )}
        {posts.map((post) => (
          <article className={`posts-admin__row ${processingId === post.id ? 'is-processing' : ''}`} key={post.id}>
            <div className="posts-admin__row-content">
              <div><Badge variant={post.status === 'published' ? 'published' : post.status === 'draft' ? 'draft' : 'review'}>{post.status}</Badge></div>
              <h3>{post.title}</h3>
              <p>{post.content}</p>
              <small>{post.tags?.map((tag) => `#${tag.replace(/^#/, '')}`).join(' ') || 'No tags'}</small>
            </div>
            {post.imageUrl && <img className="posts-admin__thumb" src={post.imageUrl} alt="" />}
            <div className="posts-admin__actions">
              <Link className="btn btn--ghost btn--sm" href={`/admin/posts/${post.id}`} title="Edit post"><i className="ph ph-pencil-line" /></Link>
              <Link className="btn btn--ghost btn--sm posts-admin__linkedin" href={`/admin/posts/${post.id}/post/linkedin`} title="Create LinkedIn post"><i className="ph ph-linkedin-logo" /></Link>
              {post.status !== 'published' && <Button variant="ghost" size="sm" onClick={() => publishPost(post)} title="Publish post"><i className="ph ph-paper-plane-tilt" /></Button>}
              <Button variant="ghost" size="sm" onClick={() => deletePost(post)} title="Delete post"><i className="ph ph-trash" /></Button>
            </div>
          </article>
        ))}
      </Card>
    </div>
  );
}
