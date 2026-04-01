'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Article } from '@/lib/types/article';
import { Button } from '@/components/ui/Button';

interface ArticlesIndexClientProps {
  initialArticles: Article[];
}

const ITEMS_PER_PAGE = 12;

const FeaturedCarousel = ({ articles }: { articles: Article[] }) => {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActive((prev) => (prev + 1) % articles.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [articles.length]);

  const getCoverImage = (article: Article) => {
    if (article.backgroundImage) return article.backgroundImage;
    if (!article.content) return '/architectural-concrete-monument.png';
    const match = article.content.match(/<img[^>]+src="([^">]+)"/);
    return match ? match[1] : '/architectural-concrete-monument.png';
  };

  return (
    <div className="articles-featured">
      <div className="articles-featured__carousel">
        {articles.map((article, i) => {
          let position = i - active;
          if (position < -1) position = position + articles.length;
          if (position > articles.length - 2) position = position - articles.length;

          // Only render visible or near-visible items for performance
          const isVisible = position >= -2 && position <= 2;
          if (!isVisible) return null;

          return (
            <motion.div
              key={article.id}
              initial={false}
              animate={{
                x: `${position * 60}%`,
                scale: position === 0 ? 1 : 0.8,
                zIndex: 10 - Math.abs(position),
                opacity: Math.abs(position) > 1 ? 0 : 1 - Math.abs(position) * 0.5,
                rotateY: position === 0 ? 0 : position > 0 ? -45 : 45,
              }}
              transition={{
                type: "spring",
                stiffness: 260,
                damping: 20
              }}
              className={`articles-featured__item ${position === 0 ? 'active' : ''}`}
              onClick={() => setActive(i)}
            >
              <div className="articles-featured__card">
                <div className="articles-featured__image-wrapper">
                  <Image 
                    src={getCoverImage(article)} 
                    alt={article.title}
                    fill
                    priority={i === active}
                    style={{ objectFit: 'cover' }}
                  />
                  <div className="articles-featured__overlay" />
                </div>
                
                <div className="articles-featured__content">
                  <span className="articles-featured__label">Journal Vol. 0{i + 1}</span>
                  <h2 className="articles-featured__title">{article.title}</h2>
                  <p className="articles-featured__description">{article.description}</p>
                  <Link href={`/articles/${article.slug}`} className="articles-featured__link">
                    Read Story
                    <i className="ph ph-arrow-right" />
                  </Link>
                </div>
              </div>
            </motion.div>
          );
        })}
        
        <div className="articles-featured__nav-dots">
          {articles.map((_, i) => (
            <button 
              key={i} 
              className={`articles-featured__dot-pill ${i === active ? 'active' : ''}`}
              onClick={() => setActive(i)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default function ArticlesIndexClient({ 
  initialArticles, 
}: ArticlesIndexClientProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const featuredArticles = useMemo(() => initialArticles.slice(0, 7), [initialArticles]);

  const allTags = useMemo(() => {
    const tags = new Set<string>();
    initialArticles.forEach(article => {
      article.tags?.forEach(tag => tags.add(tag));
    });
    return Array.from(tags).sort();
  }, [initialArticles]);

  const filteredArticles = useMemo(() => {
    return initialArticles.filter(article => {
      const matchesSearch = searchQuery === '' || 
        article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.description?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesTag = !selectedTag || article.tags?.includes(selectedTag);
      
      return matchesSearch && matchesTag;
    });
  }, [initialArticles, searchQuery, selectedTag]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedTag]);

  const totalPages = Math.ceil(filteredArticles.length / ITEMS_PER_PAGE);
  const paginatedArticles = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredArticles.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredArticles, currentPage]);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 600, behavior: 'smooth' });
  };

  const getCoverImage = (article: Article) => {
    if (article.backgroundImage) return article.backgroundImage;
    if (!article.content) return '/architectural-concrete-monument.png';
    const match = article.content.match(/<img[^>]+src="([^">]+)"/);
    return match ? match[1] : '/architectural-concrete-monument.png';
  };

  return (
    <div className="articles-index">
      {featuredArticles.length > 0 && (
        <FeaturedCarousel articles={featuredArticles} />
      )}

      <div className="articles-index__toolbar">
        <div className="articles-index__toolbar-container">
          <div className="articles-index__search-minimal">
            <i className="ph ph-magnifying-glass" />
            <input 
              type="text"
              placeholder="Search archives..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="articles-index__tag-scroller">
            <button 
              className={`articles-index__tag-pill ${!selectedTag ? 'active' : ''}`}
              onClick={() => setSelectedTag(null)}
            >
              All Topics
            </button>
            {allTags.map(tag => (
              <button 
                key={tag}
                className={`articles-index__tag-pill ${selectedTag === tag ? 'active' : ''}`}
                onClick={() => setSelectedTag(tag)}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      </div>

      <main className="articles-index__container">
        {paginatedArticles.length > 0 ? (
          <>
            <div className="articles-index__grid">
              {paginatedArticles.map((article) => (
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
                      <span>
                        {article.publishedAt 
                          ? new Date(article.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                          : 'Recent Story'
                        }
                      </span>
                    </div>
                    <h3 className="articles-index__card-title">{article.title}</h3>
                    <p className="articles-index__card-excerpt">
                      {article.description || "Read more about this curated story..."}
                    </p>
                  </div>
                </Link>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="articles-index__pagination">
                <Button 
                  variant="secondary" 
                  disabled={currentPage === 1}
                  onClick={() => handlePageChange(currentPage - 1)}
                >
                  Previous
                </Button>
                <div className="articles-index__page-info">
                  {currentPage} / {totalPages}
                </div>
                <Button 
                  variant="secondary" 
                  disabled={currentPage === totalPages}
                  onClick={() => handlePageChange(currentPage + 1)}
                >
                  Next
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="articles-index__empty">
            <i className="ph ph-detective" />
            <h3>No matches in the anthology</h3>
            <Button variant="secondary" onClick={() => { setSearchQuery(''); setSelectedTag(null); }}>
              Reset Filters
            </Button>
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
