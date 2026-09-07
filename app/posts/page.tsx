import { Metadata } from 'next';
import PostsFeedClient from '@/components/PostsFeedClient';
import { postsService } from '@/services/posts.service';

export const metadata: Metadata = {
  title: 'Posts | Nischay Sharma',
  description: 'Short-form notes, ideas, and updates from Nischay Sharma.'
};

export const dynamic = 'force-dynamic';

export default async function PostsPage() {
  try {
    const response = await postsService.listPublic({ limit: 20 });
    return <PostsFeedClient initialPosts={response.data || []} />;
  } catch {
    return <PostsFeedClient initialPosts={[]} />;
  }
}
