import React from 'react';
import PostsClient from '@/components/PostsClient';
import { listPostsAction } from '@/lib/actions/posts';

// This is a Server Component
export default async function AdminPostsPage() {
  const response = await listPostsAction();
  const posts = ('data' in response && response.success) ? response.data : [];

  return <PostsClient initialPosts={posts || []} />;
}
