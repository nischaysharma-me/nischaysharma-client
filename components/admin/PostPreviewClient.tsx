'use client';

import React from 'react';
import Image from 'next/image';
import { Post } from '@/lib/types/post';
import { Button } from '@/components/ui/Button';
import { useRouter } from 'next/navigation';

interface PostPreviewClientProps {
  initialPost: Post;
}

export default function PostPreviewClient({ initialPost }: PostPreviewClientProps) {
  const router = useRouter();

  return (
    <div className="articles-admin">
      <div className="dashboard__title">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <i className="ph ph-arrow-left" />
          </Button>
          <h2>Post Preview</h2>
        </div>
        <p>Preview how your post will look in the Social Stream and on LinkedIn.</p>
      </div>

      <div className="dashboard__grid-layout" style={{ gridTemplateColumns: '1fr 1fr' }}>
        {/* In-App Preview */}
        <div className="preview-section">
          <h3 className="label mb-4">In-App Stream Preview</h3>
          <div className="post-card" style={{ maxWidth: '500px', margin: '0 auto', background: '#fff', padding: '2rem', borderRadius: '12px', border: '1px solid #e5e5e5' }}>
            <div className="post-card__content">
              <p style={{ fontSize: '1.1rem', lineHeight: '1.6', color: '#262626', whiteSpace: 'pre-wrap' }}>
                {initialPost.content}
              </p>
            </div>
            {initialPost.attachedMedia && initialPost.attachedMedia.length > 0 && (
              <div className="post-card__media" style={{ marginTop: '1.5rem', display: 'grid', gap: '0.5rem' }}>
                {initialPost.attachedMedia.map((url, idx) => (
                  <div key={idx} style={{ position: 'relative', aspectRatio: '16/9', borderRadius: '8px', overflow: 'hidden' }}>
                    <Image 
                      src={url} 
                      alt="Post media" 
                      fill 
                      style={{ objectFit: 'cover' }} 
                      sizes="(max-width: 768px) 100vw, 500px"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* LinkedIn Preview Simulation */}
        <div className="preview-section">
          <h3 className="label mb-4">LinkedIn Simulation</h3>
          <div style={{ maxWidth: '552px', margin: '0 auto', background: '#fff', border: '1px solid #e0e0e0', borderRadius: '8px' }}>
            <div style={{ padding: '12px 16px', display: 'flex', gap: '8px' }}>
              <div style={{ width: '48px', height: '48px', background: '#eee', borderRadius: '50%' }} />
              <div>
                <div style={{ fontSize: '14px', fontWeight: 600 }}>Nischay Sharma</div>
                <div style={{ fontSize: '12px', color: 'rgba(0,0,0,0.6)' }}>Lead Developer & Architect</div>
                <div style={{ fontSize: '12px', color: 'rgba(0,0,0,0.6)' }}>1m • <i className="ph ph-globe" /></div>
              </div>
            </div>
            <div style={{ padding: '4px 16px 12px', fontSize: '14px', color: 'rgba(0,0,0,0.9)', lineHeight: 1.4 }}>
              {initialPost.content}
            </div>
            {initialPost.attachedMedia && initialPost.attachedMedia.length > 0 && (
              <div style={{ position: 'relative', height: '288px', background: '#f3f6f8', borderTop: '1px solid #e0e0e0' }}>
                <Image 
                  src={initialPost.attachedMedia[0]} 
                  alt="LinkedIn media" 
                  fill 
                  style={{ objectFit: 'cover' }} 
                  sizes="(max-width: 768px) 100vw, 552px"
                />
              </div>
            )}
            <div style={{ borderTop: '1px solid #e0e0e0', padding: '4px 8px', display: 'flex' }}>
              <div style={{ padding: '10px', fontSize: '14px', fontWeight: 600, color: 'rgba(0,0,0,0.6)', display: 'flex', gap: '4px' }}>
                <i className="ph ph-thumbs-up" /> Like
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
