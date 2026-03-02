'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase';
import { articlesService } from '@/services/articles.service';
import TiptapEditor from '@/components/editor/TiptapEditor';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import ArticlesLoading from '@/app/admin/articles/loading';

export default function CreateArticlePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [content, setContent] = useState('');

  const handleCreate = async () => {
    if (!title || !content) {
      alert('Title and Content are required');
      return;
    }

    try {
      setLoading(true);
      const token = await auth.currentUser?.getIdToken();
      if (!token) throw new Error('No authentication token');

      const response = await articlesService.createArticle({
        title,
        description,
        content,
        status: 'draft',
        access: 'free'
      }, token);

      if (response.success) {
        router.push('/admin/articles');
      }
    } catch (err: any) {
      alert('Error creating article: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="article-create">
      <div className="dashboard__header" style={{ position: 'static', background: 'transparent', padding: '0', marginBottom: '2rem' }}>
        <div className="dashboard__title">
          <h2>Create New Draft</h2>
          <p>Begin your next masterpiece.</p>
        </div>
        <div className="dashboard__header-actions">
          <Button variant="secondary" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleCreate} disabled={loading}>
            {loading ? 'Creating...' : 'Create Draft'}
          </Button>
        </div>
      </div>

      <div className="card card--padded">
        <div className="organization__form-group">
          <label className="label">Article Title</label>
          <Input 
            placeholder="Enter a captivating title..." 
            value={title} 
            onChange={(e) => setTitle(e.target.value)}
            style={{ fontSize: '1.25rem', fontWeight: '700' }}
          />
        </div>

        <div className="organization__form-group" style={{ marginTop: '2rem' }}>
          <label className="label">Short Description</label>
          <textarea 
            className="input" 
            placeholder="What is this article about?"
            style={{ height: '80px', resize: 'none', padding: '0.75rem' }}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        
        <div className="organization__form-group" style={{ marginTop: '2rem' }}>
          <label className="label">Content Editor</label>
          <TiptapEditor 
            content={content} 
            onChange={setContent} 
          />
        </div>
      </div>
    </div>
  );
}
