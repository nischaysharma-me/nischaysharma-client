'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, useScroll, useTransform, useSpring, AnimatePresence } from 'framer-motion';
import Menu from '@/components/Menu';
import { Article } from '@/services/articles.service';
import { useStore } from '@/store/useStore';

const ArticleSection = ({ 
  article, 
  index, 
  containerRef 
}: { 
  article: Article, 
  index: number,
  containerRef: React.RefObject<HTMLDivElement | null>
}) => {
  const ref = useRef<HTMLDivElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: ref,
    container: containerRef,
    offset: ["start end", "end start"]
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  // Background Parallax & Scaling
  const scale = useTransform(smoothProgress, [0, 0.5, 1], [1.15, 1, 1.15]);
  const bgY = useTransform(smoothProgress, [0, 1], ["-10%", "10%"]);

  // Content Visibility
  const contentOpacity = useTransform(smoothProgress, [0.15, 0.4, 0.6, 0.85], [0, 1, 1, 0]);
  const contentY = useTransform(smoothProgress, [0.15, 0.5, 0.85], [80, 0, -80]);

  const getCoverImage = (article: Article) => {
    if (article.backgroundImage) return article.backgroundImage;
    if (!article.content) return '/architectural-concrete-monument.png';
    const match = article.content.match(/<img[^>]+src="([^">]+)"/);
    return match ? match[1] : '/architectural-concrete-monument.png';
  };

  const plainTextPreview = article.content
    ? article.content.replace(/<[^>]*>?/gm, ' ').trim().substring(0, 500) + '...'
    : 'Explore this curated piece by Nischay Sharma...';

  return (
    <section 
      ref={ref} 
      className="articles-parallax__section"
      style={{ zIndex: index + 10 }}
    >
      <motion.div 
        className="articles-parallax__container"
        style={{ 
          backgroundImage: `url(${getCoverImage(article)})`,
          scale,
          y: bgY
        }}
      />
      
      <motion.div 
        style={{ 
          opacity: contentOpacity, 
          y: contentY,
          pointerEvents: 'auto'
        }} 
        className="articles-parallax__content"
      >
        {/* Column 1: Title and Description */}
        <div className="articles-parallax__main-info">
          <span className="articles-parallax__eyebrow">
            Curated Edition / Vol. 0{index + 1}
          </span>
          
          <h2 className="articles-parallax__title">
            {article.title}
          </h2>
          
          <p className="articles-parallax__description">
            {article.description || "An immersive technical study designed for the modern reader."}
          </p>
        </div>

        {/* Column 2: Faded Preview and Button */}
        <div className="articles-parallax__preview-col">
          <div className="articles-parallax__preview-text">
            {plainTextPreview}
          </div>
          
          <div className="articles-parallax__footer">
            <a href={`/articles/${article.slug}`} className="articles-parallax__link">
              Open Magazine
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </a>
          </div>
        </div>
      </motion.div>
    </section>
  );
};

export default function HomeClient({ articles }: { articles: Article[] }) {
  const { isMenuOpen, toggleMenu } = useStore();
  const containerRef = useRef<HTMLDivElement>(null);

  // Fallback check to ensure content is visible if scroll container logic has issues
  // But primarily we fix the container reference.

  return (
    <div className="landing-container">
      <Menu isOpen={isMenuOpen} onClose={() => toggleMenu()} />
      
      <div ref={containerRef} className="articles-parallax">
        {/* --- Hero Section --- */}
        <section className="landing" style={{ zIndex: 1, height: '100vh', position: 'relative' }}>
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
               initial={{ opacity: 0, y: 30 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
            >
              <h1 className="landing__title">
                Digital<br />
                <span>Anthology</span>
              </h1>
              <p style={{ color: 'rgba(0,0,0,0.4)', marginTop: '2rem', fontSize: '0.75rem', fontWeight: 800, letterSpacing: '0.2em', textTransform: 'uppercase' }}>
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
        {articles && articles.length > 0 ? (
          articles.map((article, index) => (
            <ArticleSection 
              key={article.id} 
              article={article} 
              index={index} 
              containerRef={containerRef}
            />
          ))
        ) : (
          <div className="flex h-screen items-center justify-center bg-black text-white/20 text-[10px] uppercase tracking-widest font-bold">
            The collection is currently empty
          </div>
        )}
      </div>
    </div>
  );
}
