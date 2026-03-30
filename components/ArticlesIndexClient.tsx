'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Article } from '@/lib/types/article';
import { articlesService } from '@/services/articles.service';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Pagination as PaginationType } from '@/lib/types/common';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

interface ArticlesIndexClientProps {
  initialArticles: Article[];
  initialPagination?: PaginationType;
}

export default function ArticlesIndexClient({ 
  initialArticles, 
  initialPagination 
}: ArticlesIndexClientProps) {
  const [articles, setArticles] = useState<Article[]>(initialArticles);
  const [pagination, setPagination] = useState<PaginationType | undefined>(initialPagination);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [page, setPage] = useState(1);

  const fetchFilteredArticles = useCallback(async (currentPage: number, search: string, tags: string[]) => {
    try {
      setLoading(true);
      const response = await articlesService.listArticles({
        status: 'published',
        search: search || undefined,
        tags: tags.length > 0 ? tags : undefined,
        page: currentPage,
        limit: 12
      });

      if (response.success && response.data) {
        setArticles(response.data);
        setPagination(response.pagination);
      }
    } catch (err) {
      console.error('Error filtering articles:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Debounced search effect
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery !== '') {
        setPage(1);
        fetchFilteredArticles(1, searchQuery, selectedTags);
      } else if (articles !== initialArticles) {
        // Reset if search cleared and not on initial
        setPage(1);
        fetchFilteredArticles(1, '', selectedTags);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery, selectedTags, fetchFilteredArticles, initialArticles, articles]);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    fetchFilteredArticles(newPage, searchQuery, selectedTags);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getCoverImage = (article: Article) => {
    if (article.backgroundImage) return article.backgroundImage;
    if (!article.content) return '/architectural-concrete-monument.png';
    const match = article.content.match(/<img[^>]+src="([^">]+)"/);
    return match ? match[1] : '/architectural-concrete-monument.png';
  };

  return (
    <div className="articles-index">
      <header className="articles-index__header">
        <div className="articles-index__header-content">
          <h1 className="articles-index__title">The Digital Anthology</h1>
          <p className="articles-index__subtitle">
            A curated collection of technical insights, architectural studies, and digital narratives.
          </p>
          
          <div className="articles-index__controls">
            <div className="articles-index__search-wrapper">
              <i className="ph ph-magnifying-glass articles-index__search-icon" />
              <input 
                type="text"
                placeholder="Search stories..."
                className="articles-index__search-input"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>
      </header>

      <main className="articles-index__container">
        {loading ? (
          <div className="articles-index__loading">
            <LoadingSpinner size="lg" />
            <p>Scanning the archives...</p>
          </div>
        ) : articles.length > 0 ? (
          <>
            <div className="articles-index__grid">
              {articles.map((article) => (
                <Link 
                  href={`/articles/${article.slug}`} 
                  key={article.id}
                  className="articles-index__card"
                >
                  <div className="articles-index__card-image">
                    <Image 
                      src={getCoverImage(article)} 
                      alt={article.title}
                      fill
                      style={{ objectFit: 'cover' }}
                    />
                  </div>
                  <div className="articles-index__card-content">
                    <div className="articles-index__card-meta">
                      <span>{new Date(article.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      {article.tags && article.tags.length > 0 && (
                        <>
                          <span className="dot" />
                          <span>{article.tags[0]}</span>
                        </>
                      )}
                    </div>
                    <h3 className="articles-index__card-title">{article.title}</h3>
                    <p className="articles-index__card-excerpt">
                      {article.description || "Read more about this curated story..."}
                    </p>
                  </div>
                </Link>
              ))}
            </div>

            {pagination && pagination.pages > 1 && (
              <div className="articles-index__pagination">
                <Button 
                  variant="secondary" 
                  disabled={page === 1}
                  onClick={() => handlePageChange(page - 1)}
                >
                  Previous
                </Button>
                <div className="articles-index__page-info">
                  Page {page} of {pagination.pages}
                </div>
                <Button 
                  variant="secondary" 
                  disabled={page === pagination.pages}
                  onClick={() => handlePageChange(page + 1)}
                >
                  Next
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="articles-index__empty">
            <i className="ph ph-detective" style={{ fontSize: '3rem', opacity: 0.2 }} />
            <h3>No stories found</h3>
            <p>Try adjusting your search criteria to find what you&apos;re looking for.</p>
            <Button variant="secondary" onClick={() => setSearchQuery('')}>Clear Search</Button>
          </div>
        )}
      </main>

      <footer className="articles-index__footer">
        <div className="articles-index__footer-content">
          <p>© {new Date().getFullYear()} NISCHAY SHARMA. ALL RIGHTS RESERVED.</p>
        </div>
      </footer>
    </div>
  );
}
