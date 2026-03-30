import React from 'react';
import PublicPostsClient from '@/components/PublicPostsClient';
import { postsService } from '@/services/posts.service';
import { Metadata } from 'next';

export const revalidate = 60; // ISR: Revalidate every 60 seconds

export const metadata: Metadata = {
  title: "The Social Stream | Nischay Sharma",
  description: "Bite-sized technical thoughts and updates from the digital frontier.",
  alternates: {
    canonical: '/posts',
  },
};

export default async function PostsPage() {
  let posts = [];

  try {
    const response = await postsService.listPosts({ limit: 50 });
    if (response.success && response.data) {
      posts = response.data;
    }
  } catch (err) {
    console.error('PostsPage: Failed to fetch posts:', err);
  }

  return <PublicPostsClient initialPosts={posts} />;
}
