'use client';

import React, { useState, useRef } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import Menu from '@/components/Menu';
import { Article } from '@/services/articles.service';
import { useStore } from '@/store/useStore';

const ArticleSection = ({ article, index }: { article: Article, index: number }) => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });

  // Use a simpler spring for snappier feedback
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  // Background Parallax
  const yOffset = useTransform(smoothProgress, [0, 1], ["0%", "30%"]);
  const scale = useTransform(smoothProgress, [0, 0.5, 1], [1.1, 1, 1.1]);
  
  // Content visibility: simplified to ensure it shows up reliably
  const contentOpacity = useTransform(smoothProgress, [0.1, 0.35, 0.65, 0.9], [0, 1, 1, 0]);
  const contentY = useTransform(smoothProgress, [0.1, 0.5, 0.9], [40, 0, -40]);

  const getCoverImage = (article: Article) => {
    if (article.backgroundImage) return article.backgroundImage;
    const match = article.content.match(/<img[^>]+src="([^">]+)"/);
    return match ? match[1] : '/architectural-concrete-monument.png';
  };

  const plainTextPreview = article.content
    ? article.content.replace(/<[^>]*>?/gm, ' ').trim().substring(0, 400) + '...'
    : 'Explore this curated piece by Nischay Sharma...';

  return (
    <section 
      ref={ref} 
      className="articles-parallax__section"
      style={{ zIndex: index + 10 }}
    >
      <motion.div style={{ y: yOffset, scale }} className="articles-parallax__bg">
        <img src={getCoverImage(article)} alt={article.title} />
      </motion.div>
      
      <motion.div 
        style={{ opacity: contentOpacity, y: contentY }} 
        className="articles-parallax__content"
      >
        <div className="articles-parallax__main-info">
          <span className="articles-parallax__eyebrow">
            Curated Perspective / Volume 0{index + 1}
          </span>
          
          <h2 className="articles-parallax__title">
            {article.title}
          </h2>
          
          <p className="articles-parallax__description">
            {article.description || "A technical deep-dive into the evolving digital landscape."}
          </p>

          <div className="articles-parallax__footer">
            <a href={`/articles/${article.slug}`} className="articles-parallax__link">
              Read Magazine
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </a>
          </div>
        </div>

        <div className="articles-parallax__preview-col">
          <div className="articles-parallax__preview-text">
            {plainTextPreview}
          </div>
        </div>
      </motion.div>
    </section>
  );
};

export default function HomeClient({ articles }: { articles: Article[] }) {
  const { isMenuOpen, toggleMenu, setIsMenuOpen } = useStore();

  return (
    <div className="landing-container">
      <Menu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
      
      <div className="articles-parallax">
        {/* --- Modern Hero Section --- */}
        <section className="landing" style={{ zIndex: 1 }}>
          <div className="landing__bg" />
          <header className="landing__header">
            <div className="landing__brand">NISCHAY SHARMA</div>
            <div className="landing__logo">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
              </svg>
            </div>
            <button onClick={toggleMenu} className="landing__menu-btn">
              Menu
            </button>
          </header>
          
          <section className="landing__hero">
            <motion.div
               initial={{ opacity: 0, y: 40 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
            >
              <h1 className="landing__title">
                Digital<br />
                <span>Anthology</span>
              </h1>
              <p style={{ color: 'rgba(0,0,0,0.4)', marginTop: '2rem', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase' }}>
                Curated by Nischay Sharma
              </p>
            </motion.div>
          </section>
          
          <footer className="landing__footer">
            <div className="landing__scroll-text">
              Begin Journey
            </div>
          </footer>
        </section>

        {/* --- Parallax Articles --- */}
        {articles.length > 0 ? (
          articles.map((article, index) => (
            <ArticleSection key={article.id} article={article} index={index} />
          ))
        ) : (
          <div className="flex h-screen items-center justify-center bg-black text-white/30 text-[10px] uppercase tracking-widest">
            The collection is currently empty
          </div>
        )}
      </div>
    </div>
  );
}
