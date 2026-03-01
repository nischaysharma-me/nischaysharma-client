'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import Menu from '@/components/Menu';
import { articlesService, Article } from '@/services/articles.service';

const ArticleSection = ({ article, index }: { article: Article, index: number }) => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });

  const y = useTransform(scrollYProgress, [0, 1], [-100, 100]);
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [1.1, 1, 1.1]);

  // Fallback to extract first image from content if coverImage is missing
  const getCoverImage = (article: Article) => {
    if (article.coverImage) return article.coverImage;
    const match = article.content.match(/<img[^>]+src="([^">]+)"/);
    return match ? match[1] : '/architectural-concrete-monument.png';
  };

  return (
    <section ref={ref} className="articles-parallax__section">
      <motion.div style={{ scale }} className="articles-parallax__bg">
        <img src={getCoverImage(article)} alt={article.title} />
      </motion.div>
      
      <motion.div style={{ opacity, y }} className="articles-parallax__content">
        <h2 className="articles-parallax__title">{article.title}</h2>
        <p className="articles-parallax__description">{article.description}</p>
        <a href={`/articles/${article.slug}`} className="articles-parallax__link">
          Read Story
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
        </a>
      </motion.div>
    </section>
  );
};

export default function Home() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const response = await articlesService.getTopArticles(10);
        if (response.success) {
          setArticles(response.data);
        }
      } catch (err) {
        console.error('Error fetching articles:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchArticles();
  }, []);

  return (
    <div className="landing-container">
      <Menu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
      
      <div ref={containerRef} className="articles-parallax">
        {/* --- Hero Section --- */}
        <section className="landing">
          <div className="landing__bg" />
          <header className="landing__header">
            <div className="landing__brand">NISCHAY</div>
            <div className="landing__logo">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 12v-4" />
                <path d="M12 12l-2-2" />
                <path d="M12 12l2-2" />
                <path d="M8 18h8" />
              </svg>
            </div>
            <button onClick={() => setIsMenuOpen(true)} className="landing__menu-btn">
              + Menu
            </button>
          </header>
          <section className="landing__hero">
            <h1 className="landing__title">
              For Downtime<br />
              &amp; Inspiration
            </h1>
          </section>
          <footer className="landing__footer">
            <div className="landing__scroll-text">
              Scroll to read magazine
            </div>
          </footer>
        </section>

        {/* --- Articles Section --- */}
        {!loading && articles.map((article, index) => (
          <ArticleSection key={article.id} article={article} index={index} />
        ))}
      </div>
    </div>
  );
}
