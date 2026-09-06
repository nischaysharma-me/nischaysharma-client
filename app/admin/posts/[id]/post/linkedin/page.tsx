'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { auth } from '@/lib/firebase';
import { Post } from '@/lib/types/post';
import { postsService } from '@/services/posts.service';
import { integrationsService, IntegrationsList } from '@/services/integrations.service';
import LinkedInComposer from '@/components/admin/LinkedInComposer';

export default function LinkedInPostPage() {
  const { id } = useParams() as { id: string };
  const [post, setPost] = useState<Post | null>(null);
  const [integrations, setIntegrations] = useState<IntegrationsList>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => auth.onAuthStateChanged(async (user) => {
    if (!user) return;
    try {
      const token = await user.getIdToken();
      const [postResponse, integrationResponse] = await Promise.all([
        postsService.getById(id, token),
        integrationsService.list(token)
      ]);
      if (!postResponse.data) throw new Error('Post not found');
      setPost(postResponse.data);
      if (integrationResponse.success) setIntegrations(integrationResponse.data || {});
    } catch (loadError) {
      setError((loadError as Error).message);
    } finally {
      setLoading(false);
    }
  }), [id]);

  if (loading) return <div className="posts-admin__empty">Loading LinkedIn studio…</div>;
  if (!post) return <div className="card card--padded"><h2>LinkedIn studio unavailable</h2><p>{error}</p><Link href="/admin/posts">Back to posts</Link></div>;

  return (
    <div className="linkedin-post-page">
      <nav className="linkedin-post-page__breadcrumb" aria-label="Breadcrumb">
        <Link href={`/admin/posts/${post.id}`}>{post.title}</Link>
        <i className="ph ph-caret-right" /><span>Post</span>
        <i className="ph ph-caret-right" /><strong>LinkedIn</strong>
      </nav>
      <LinkedInComposer
        mode="page"
        backHref={`/admin/posts/${post.id}`}
        connected={Boolean(integrations.linkedin?.connected)}
        title={post.title}
        description={post.content.slice(0, 1000)}
        sourceContent={post.content}
        type="post"
        sourcePath={`/posts#post-${post.id}`}
        initialImageUrl={post.imageUrl}
      />
    </div>
  );
}
