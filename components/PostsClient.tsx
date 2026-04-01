'use client';

import React, { useState, useEffect } from 'react';
import { auth } from '@/lib/firebase';
import { Post } from '@/lib/types/post';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { PostGeneratorForm } from '@/components/admin/PostGeneratorForm';
import { PostList } from '@/components/admin/PostList';
import { toast } from 'sonner';
import { useDialogStore } from '@/store/useDialogStore';
import { usePostsStore } from '@/store/admin/usePostsStore';

interface PostsClientProps {
  initialPosts: Post[];
}

export default function PostsClient({ initialPosts }: PostsClientProps) {
  const { 
    posts, 
    loading, 
    setPosts, 
    fetchPosts, 
    publishPost,
    deletePost
  } = usePostsStore();
  
  const [showGenerator, setShowGenerator] = useState(false);
  const { openDialog } = useDialogStore();

  // Hydrate store on mount
  useEffect(() => {
    if (initialPosts && initialPosts.length > 0 && posts.length === 0) {
      setPosts(initialPosts);
    }
  }, [initialPosts, posts.length, setPosts]);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        fetchPosts();
      }
    });
    return () => unsubscribe();
  }, [fetchPosts]);

  const handlePublish = async (id: string, platforms: string[]) => {
    openDialog({
      title: 'Publish Post',
      message: `Are you sure you want to publish this post to ${platforms.join(' & ')}?`,
      confirmLabel: 'Publish',
      onConfirm: async () => {
        const success = await publishPost(id, platforms);
        if (success) {
          toast.success('Post published successfully');
        } else {
          toast.error('Failed to publish post');
        }
      }
    });
  };

  const handleDelete = async (id: string) => {
    openDialog({
      title: 'Delete Post',
      message: 'Are you sure you want to delete this post? This action cannot be undone.',
      confirmLabel: 'Delete',
      variant: 'danger',
      onConfirm: async () => {
        const success = await deletePost(id);
        if (success) {
          toast.success('Post deleted successfully');
        } else {
          toast.error('Failed to delete post');
        }
      }
    });
  };

  return (
    <div className="articles-admin">
      <div className="dashboard__title">
        <h2>Post Management</h2>
        <p>Manage and syndicate your social media content across platforms.</p>
      </div>

      <div className="dashboard__grid-layout">
        <div className="dashboard__grid-main">
          {showGenerator && (
            <div className="mb-8">
              <PostGeneratorForm 
                onSuccess={fetchPosts} 
                onClose={() => setShowGenerator(false)} 
              />
            </div>
          )}

          <Card className="dashboard__recent" padded={false}>
            <div className="dashboard__recent-header" style={{ padding: '1.5rem' }}>
              <h3>All Posts ({posts.length})</h3>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <Button 
                  variant="secondary" 
                  size="sm"
                  onClick={() => setShowGenerator(!showGenerator)}
                  leftIcon={<i className="ph ph-sparkle" />}
                >
                  AI Generator
                </Button>
              </div>
            </div>
            
            <PostList 
              posts={posts} 
              onPublish={handlePublish} 
              onDelete={handleDelete}
              onShowGenerator={() => setShowGenerator(true)} 
            />
          </Card>
        </div>

        <div className="dashboard__grid-sidebar">
          <Card padded className="articles-admin__insight-card">
            <h3 className="label">Syndication Insights</h3>
            <p className="mt-4 text-sm" style={{ color: '#737373', lineHeight: '1.6' }}>
              Your social reach currently spans {posts.filter(p => p.status === 'published').length} active posts. 
              <br /><br />
              <strong>AI Strategy:</strong> Each post generated is optimized for professional engagement. Link your articles and books to drive traffic back to your portfolio.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
