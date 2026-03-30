'use client';

import React from 'react';
import { Post } from '@/lib/types/post';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { formatDate } from '@/lib/utils';

interface PostRowProps {
  post: Post;
  onPublish: (id: string, platforms: string[]) => void;
  onDelete: (id: string) => void;
}

export const PostRow = ({ post, onPublish, onDelete }: PostRowProps) => {
  const getStatusVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case 'published': return 'published';
      case 'draft': return 'draft';
      case 'failed': return 'review';
      default: return 'default';
    }
  };

  return (
    <div className="dashboard__recent-item">
      <div className="dashboard__recent-item-info">
        <div className="dashboard__recent-item-title" style={{ 
          maxWidth: '500px', 
          overflow: 'hidden', 
          textOverflow: 'ellipsis', 
          whiteSpace: 'nowrap' 
        }}>
          {post.content}
        </div>
        <div className="dashboard__recent-item-meta">
          <span>Created: {formatDate(post.createdAt)}</span>
          <span className="dot" />
          <span>Platforms: {Object.keys(post.platforms).join(', ')}</span>
        </div>
      </div>
      <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
        <Badge variant={getStatusVariant(post.status || 'draft')}>
          {post.status || 'draft'}
        </Badge>
        <div style={{ display: 'flex', gap: '0.4rem' }}>
          {post.status !== 'published' && (
            <Button 
              variant="ghost" 
              size="sm"
              title="Publish to App & LinkedIn"
              onClick={() => onPublish(post.id, ['app', 'linkedin'])}
              style={{ padding: '0.4rem', color: '#10b981' }}
            >
              <i className="ph ph-share-network" style={{ fontSize: '1.2rem' }} />
            </Button>
          )}
          <Button 
            variant="ghost" 
            size="sm"
            title="Delete"
            onClick={() => onDelete(post.id)}
            style={{ padding: '0.4rem', color: '#ef4444' }}
          >
            <i className="ph ph-trash" style={{ fontSize: '1.2rem' }} />
          </Button>
        </div>
      </div>
    </div>
  );
};

interface PostListProps {
  posts: Post[];
  onPublish: (id: string, platforms: string[]) => void;
  onDelete: (id: string) => void;
  onShowGenerator: () => void;
}

export const PostList = ({ posts, onPublish, onDelete, onShowGenerator }: PostListProps) => {
  if (posts.length === 0) {
    return (
      <div style={{ padding: '4rem 2rem', textAlign: 'center' }}>
        <p style={{ color: '#737373', marginBottom: '1.5rem' }}>No posts found.</p>
        <Button variant="secondary" onClick={onShowGenerator}>
          Generate your first social post
        </Button>
      </div>
    );
  }

  return (
    <div className="dashboard__recent-list">
      {posts.map((post) => (
        <PostRow 
          key={post.id} 
          post={post} 
          onPublish={onPublish} 
          onDelete={onDelete} 
        />
      ))}
    </div>
  );
};
