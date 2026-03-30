'use client';

import React from 'react';
import Image from 'next/image';
import { Post } from '@/lib/types/post';
import { formatDate } from '@/lib/utils';

interface PublicPostsClientProps {
  initialPosts: Post[];
}

export default function PublicPostsClient({ initialPosts }: PublicPostsClientProps) {
  // Only show published posts
  const publishedPosts = initialPosts.filter(p => p.status === 'published');

  return (
    <div className="posts-page">
      <header className="posts-page__header">
        <h1 className="posts-page__title">The Social Stream</h1>
        <p className="posts-page__subtitle">Bite-sized technical thoughts and updates from the digital frontier.</p>
      </header>

      <main className="posts-page__container">
        {publishedPosts.length > 0 ? (
          <div className="posts-page__feed">
            {publishedPosts.map((post) => (
              <article key={post.id} className="post-card">
                <div className="post-card__header">
                  <div className="post-card__meta">
                    <span className="post-card__date">{formatDate(post.createdAt)}</span>
                    {post.tags && post.tags.length > 0 && (
                      <div className="post-card__tags">
                        {post.tags.map(tag => (
                          <span key={tag} className="post-card__tag">#{tag}</span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="post-card__content">
                  <p>{post.content}</p>
                </div>

                {post.attachedMedia && post.attachedMedia.length > 0 && (
                  <div className="post-card__media">
                    {post.attachedMedia.map((url, idx) => (
                      <div key={idx} className="post-card__image-container">
                        <Image 
                          src={url} 
                          alt="Post media" 
                          fill
                          className="post-card__image"
                        />
                      </div>
                    ))}
                  </div>
                )}

                <div className="post-card__footer">
                  <div className="post-card__platforms">
                    {post.platforms.linkedin?.status === 'published' && (
                      <a 
                        href={`https://www.linkedin.com/feed/update/${post.platforms.linkedin.postId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="post-card__platform-link"
                      >
                        <i className="ph ph-linkedin-logo" />
                        View on LinkedIn
                      </a>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="posts-page__empty">
            <i className="ph ph-wind" />
            <h3>No posts shared yet</h3>
            <p>Check back soon for new updates.</p>
          </div>
        )}
      </main>

      <footer className="posts-page__footer">
        <p>© {new Date().getFullYear()} NISCHAY SHARMA. ALL RIGHTS RESERVED.</p>
      </footer>

      <style jsx>{`
        .posts-page {
          min-height: 100vh;
          padding: 8rem 2rem 4rem;
          background: #fafafa;
        }
        .posts-page__header {
          max-width: 800px;
          margin: 0 auto 4rem;
          text-align: center;
        }
        .posts-page__title {
          font-family: var(--font-playfair);
          font-size: 3.5rem;
          margin-bottom: 1rem;
          color: #171717;
        }
        .posts-page__subtitle {
          font-size: 1.1rem;
          color: #737373;
        }
        .posts-page__container {
          max-width: 700px;
          margin: 0 auto;
        }
        .posts-page__feed {
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }
        .post-card {
          background: #fff;
          border: 1px solid #e5e5e5;
          border-radius: 12px;
          padding: 2rem;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .post-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 30px rgba(0,0,0,0.05);
        }
        .post-card__meta {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
          font-size: 0.85rem;
          color: #a3a3a3;
        }
        .post-card__content {
          font-size: 1.1rem;
          line-height: 1.6;
          color: #262626;
          white-space: pre-wrap;
        }
        .post-card__media {
          margin-top: 1.5rem;
          border-radius: 8px;
          overflow: hidden;
          display: grid;
          gap: 0.5rem;
        }
        .post-card__image-container {
          position: relative;
          aspect-ratio: 16/9;
          width: 100%;
        }
        .post-card__image {
          object-fit: cover;
        }
        .post-card__footer {
          margin-top: 1.5rem;
          padding-top: 1.5rem;
          border-top: 1px solid #f5f5f5;
        }
        .post-card__platform-link {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          color: #0077b5;
          text-decoration: none;
          font-size: 0.9rem;
          font-weight: 500;
        }
        .posts-page__empty {
          text-align: center;
          padding: 4rem;
          color: #a3a3a3;
        }
        .posts-page__empty i {
          font-size: 3rem;
          margin-bottom: 1rem;
        }
        .posts-page__footer {
          margin-top: 6rem;
          text-align: center;
          font-size: 0.8rem;
          color: #a3a3a3;
          letter-spacing: 0.05em;
        }
      `}</style>
    </div>
  );
}
