'use client';

import React, { useState, useRef, useEffect } from 'react';
import Menu from '@/components/Menu';
import { Article } from '@/services/articles.service';
import { useStore } from '@/store/useStore';

const ArticleSection = ({ 
  article, 
  index 
}: { 
  article: Article, 
  index: number 
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { 
        threshold: 0.5,
        rootMargin: "0px" 
      }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const getCoverImage = (article: Article) => {
    if (article.backgroundImage) return article.backgroundImage;
    if (!article.content) return '/architectural-concrete-monument.png';
    const match = article.content.match(/<img[^>]+src="([^">]+)"/);
    return match ? match[1] : '/architectural-concrete-monument.png';
  };

  const plainTextPreview = article.content
    ? article.content.replace(/<[^>]*>?/gm, ' ').trim().substring(0, 450) + '...'
    : 'Dive into this curated story by Nischay Sharma...';

  return (
    <section 
      ref={sectionRef}
      className={`articles-parallax__section ${isVisible ? 'is-visible' : ''}`}
      style={{ zIndex: index + 10 }}
    >
      <div 
        className="articles-parallax__container"
        style={{ 
          backgroundImage: `url(${getCoverImage(article)})`
        }}
      />
      
      <div className="articles-parallax__content">
        {/* Centered Content Block */}
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

        <div className="articles-parallax__preview-col">
          <div className="articles-parallax__preview-text">
            {plainTextPreview}
          </div>
          
          <a href={`/articles/${article.slug}`} className="articles-parallax__link">
            Open Journal
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </a>
        </div>
      </div>
    </section>
  );
};

export default function HomeClient({ articles }: { articles: Article[] }) {
  const { isMenuOpen, toggleMenu } = useStore();

  return (
    <div className="landing-container">
      <Menu isOpen={isMenuOpen} onClose={() => toggleMenu()} />
      
      <div className="articles-parallax">
        {/* --- Hero Section --- */}
        <section className="landing" style={{ zIndex: 1, height: '100vh', position: 'relative', scrollSnapAlign: 'start' }}>
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
            <div className="landing__hero-wrapper">
              <h1 className="landing__title">
                Digital<br />
                <span>Anthology</span>
              </h1>
              <p style={{ color: 'rgba(0,0,0,0.4)', marginTop: '2rem', fontSize: '0.75rem', fontWeight: 800, letterSpacing: '0.2em', textTransform: 'uppercase' }}>
                Curated by Nischay Sharma
              </p>
            </div>
          </section>
          
          <footer className="landing__footer">
            <div className="landing__scroll-text">
              Begin Journey
            </div>
          </footer>
        </section>

        {/* --- Articles --- */}
        {articles && articles.length > 0 ? (
          articles.map((article, index) => (
            <ArticleSection 
              key={article.id} 
              article={article} 
              index={index} 
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
