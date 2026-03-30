'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { Card } from '@/components/ui/Card';
import { articlesService } from '@/services/articles.service';
import { booksService } from '@/services/books.service';
import { usePostsStore } from '@/store/admin/usePostsStore';
import { auth } from '@/lib/firebase';
import { toast } from 'sonner';

interface PostGeneratorFormProps {
  onSuccess: () => void;
  onClose: () => void;
}

export const PostGeneratorForm = ({ onSuccess, onClose }: PostGeneratorFormProps) => {
  const { generatePost } = usePostsStore();
  const [generating, setGenerating] = useState(false);
  const [articles, setArticles] = useState<any[]>([]);
  const [books, setBooks] = useState<any[]>([]);
  
  // Form states
  const [articleId, setArticleId] = useState('');
  const [bookId, setBookId] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    try {
      const token = await auth.currentUser?.getIdToken();
      if (!token) return;

      const [articlesRes, booksRes] = await Promise.all([
        articlesService.listArticles({ limit: 100 }, token),
        booksService.getUserBooks(token)
      ]);
      
      if (articlesRes.success) setArticles(articlesRes.data || []);
      if (booksRes.success) setBooks(booksRes.data || []);
    } catch (err) {
      console.error('Error fetching content:', err);
    }
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!articleId && !bookId) {
      setError('Please select an article or book');
      return;
    }

    try {
      setGenerating(true);
      setError('');

      const success = await generatePost({
        articleId: articleId || undefined,
        bookId: bookId || undefined
      });

      if (success) {
        toast.success('Social post generated!', {
          description: 'A new draft has been created.'
        });
        onSuccess();
        onClose();
      } else {
        setError('Failed to generate post');
      }
    } catch (err: any) {
      toast.error('Error: ' + err.message);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <Card padded className="articles-admin__generator-card">
      <div className="articles-admin__generator-header">
        <h3>AI Social Post Generator</h3>
        <button onClick={onClose} className="close-btn">
          <i className="ph ph-x" style={{ fontSize: '1rem' }} />
        </button>
      </div>
      
      <form onSubmit={handleGenerate}>
        <div className="articles-admin__form-row mt-4">
          <Select 
            label="Source Article"
            value={articleId} 
            name="articleId"
            onChange={(e) => {
              setArticleId(e.target.value);
              if (e.target.value) setBookId('');
            }}
            containerClassName="flex-1"
          >
            <option value="">Select Article</option>
            {articles.map(a => (
              <option key={a.id} value={a.id}>{a.title}</option>
            ))}
          </Select>
          
          <div style={{ display: 'flex', alignItems: 'center', padding: '0 1rem', marginTop: '1.5rem' }}>OR</div>

          <Select 
            label="Source Book"
            value={bookId} 
            name="bookId"
            onChange={(e) => {
              setBookId(e.target.value);
              if (e.target.value) setArticleId('');
            }}
            containerClassName="flex-1"
          >
            <option value="">Select Book</option>
            {books.map(b => (
              <option key={b.id} value={b.id}>{b.title}</option>
            ))}
          </Select>
        </div>

        {error && <p className="input-error-message mt-4">{error}</p>}

        <div className="mt-8">
          <Button type="submit" variant="primary" size="full" loading={generating}>
            Generate Post Draft
          </Button>
        </div>
      </form>
    </Card>
  );
};
