'use client';

import React, { useState, useEffect } from 'react';
import { auth } from '@/lib/firebase';
import { Post } from '@/lib/types/post';
import { postsService } from '@/services/posts.service';
import { articlesService } from '@/services/articles.service';
import { Article } from '@/lib/types/article';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import AdminLoading from '@/app/admin/loading';
import { toast } from 'sonner';
import PostComposer from './PostComposer';

export default function PostsClient() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [showComposer, setShowComposer] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = await auth.currentUser?.getIdToken();
      if (!token) return;

      const [postsRes, articlesRes] = await Promise.all([
        postsService.list(token),
        articlesService.listArticles({ status: 'published' }, token)
      ]);

      if (postsRes.success) setPosts(postsRes.data || []);
      if (articlesRes.success) setArticles(articlesRes.data || []);
    } catch (err) {
      console.error('Error fetching posts data:', err);
      toast.error('Failed to load posts');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this post?')) return;
    try {
      const token = await auth.currentUser?.getIdToken();
      if (!token) return;
      const res = await postsService.delete(id, token);
      if (res.success) {
        setPosts(posts.filter(p => p.id !== id));
        toast.success('Post deleted');
      }
    } catch (err) {
      toast.error('Failed to delete post');
    }
  };

  if (loading) return <AdminLoading />;

  return (
    <div className="posts-admin">
      <div className="dashboard__title">
        <h2>Multi-Platform Posts</h2>
        <p>Synchronize your articles with LinkedIn and in-app feeds.</p>
      </div>

      <div className="dashboard__grid-layout">
        <div className="lg:col-span-2">
          {showComposer ? (
            <PostComposer 
              articles={articles} 
              onClose={() => {
                setShowComposer(false);
                setEditingPost(null);
                fetchData();
              }}
              initialPost={editingPost}
            />
          ) : (
            <Card className="dashboard__recent">
              <div className="dashboard__recent-header">
                <h3>All Posts ({posts.length})</h3>
                <Button variant="primary" size="sm" onClick={() => setShowComposer(true)}>
                  Create Post
                </Button>
              </div>
              <div className="dashboard__recent-list">
                {posts.length > 0 ? (
                  posts.map((post) => (
                    <div key={post.id} className="dashboard__recent-item">
                      <div className="dashboard__recent-item-info">
                        <div className="dashboard__recent-item-title" style={{ fontSize: '0.875rem' }}>
                          {post.content.substring(0, 100)}...
                        </div>
                        <div className="dashboard__recent-item-meta" style={{ marginTop: '0.5rem' }}>
                          <Badge variant={post.status === 'published_all' ? 'success' : 'secondary'}>
                            {post.status.replace('_', ' ')}
                          </Badge>
                          <span className="dot" />
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            {post.platforms.map(p => (
                              <span key={p.name} title={p.status} style={{ opacity: p.status === 'published' ? 1 : 0.4 }}>
                                <i className={`ph ph-${p.name === 'linkedin' ? 'linkedin-logo' : 'house'}`} />
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <Button variant="secondary" size="sm" onClick={() => {
                          setEditingPost(post);
                          setShowComposer(true);
                        }}>
                          Edit
                        </Button>
                        <Button variant="secondary" size="sm" onClick={() => handleDelete(post.id)}>
                          <i className="ph ph-trash" style={{ color: '#ff4d4f' }} />
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div style={{ padding: '4rem 2rem', textAlign: 'center', color: '#737373' }}>
                    No posts found. Create your first cross-platform update.
                  </div>
                )}
              </div>
            </Card>
          )}
        </div>

        <div className="dashboard__sidebar-col">
          <Card padded>
            <h3 className="label">Post Strategy</h3>
            <p style={{ fontSize: '0.75rem', color: '#737373', lineHeight: 1.5, marginTop: '1rem' }}>
              Connect your LinkedIn account in <strong>Profile Settings</strong> to enable cross-platform publishing. 
              <br/><br/>
              Internal posts will appear in the upcoming <strong>Social Feed</strong> on your public site.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
