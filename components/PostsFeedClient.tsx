'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Post } from '@/lib/types/post';
import { postsService } from '@/services/posts.service';

const PAGE_SIZE = 20;

function formatPostDate(value?: string | null) {
  if (!value) return 'Just now';
  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(new Date(value));
}

function PostCard({ post }: { post: Post }) {
  return (
    <article className="posts-feed__card" id={`post-${post.id}`}>
      <header className="posts-feed__card-header">
        <span className="posts-feed__avatar">NS</span>
        <div>
          <strong>Nischay Sharma</strong>
          <span>{formatPostDate(post.publishedAt || post.createdAt)}</span>
        </div>
        <i className="ph ph-dots-three" aria-hidden="true" />
      </header>

      <div className="posts-feed__body">
        <h2>{post.title}</h2>
        <p>{post.content}</p>
      </div>

      {post.imageUrl && (
        <figure className="posts-feed__media">
          <img src={post.imageUrl} alt={post.imageAltText || post.title} loading="lazy" />
        </figure>
      )}

      {post.tags?.length > 0 && (
        <footer className="posts-feed__tags">
          {post.tags.map((tag) => <span key={tag}>#{tag.replace(/^#/, '')}</span>)}
        </footer>
      )}
    </article>
  );
}

export default function PostsFeedClient({ initialPosts }: { initialPosts: Post[] }) {
  const [posts, setPosts] = useState(initialPosts);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(initialPosts.length === PAGE_SIZE);
  const sentinel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const target = sentinel.current;
    if (!target || !hasMore) return;

    const observer = new IntersectionObserver(async ([entry]) => {
      if (!entry.isIntersecting || loading) return;
      setLoading(true);
      try {
        const response = await postsService.listPublic({ limit: PAGE_SIZE, skip: posts.length });
        const next = response.data || [];
        setPosts((current) => [...current, ...next.filter((post) => !current.some((item) => item.id === post.id))]);
        setHasMore(next.length === PAGE_SIZE);
      } catch {
        setHasMore(false);
      } finally {
        setLoading(false);
      }
    }, { rootMargin: '400px' });

    observer.observe(target);
    return () => observer.disconnect();
  }, [hasMore, loading, posts.length]);

  return (
    <main className="posts-feed">
      <header className="posts-feed__intro">
        <span>Short-form notes</span>
        <h1>Posts</h1>
        <p>Ideas, observations, and things worth sharing—without the long read.</p>
      </header>

      <section className="posts-feed__stream" aria-label="Latest posts">
        {posts.map((post) => <PostCard post={post} key={post.id} />)}
        {!posts.length && <div className="posts-feed__empty">No posts have been published yet.</div>}
        <div className="posts-feed__sentinel" ref={sentinel} aria-hidden="true">
          {loading && <i className="ph ph-spinner linkedin-spin" />}
        </div>
      </section>
    </main>
  );
}
