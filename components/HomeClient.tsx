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
            <i className="ph ph-arrow-right" style={{ fontSize: '1.25rem' }} />
          </a>
        </div>
      </div>
    </section>
  );
};

export default function HomeClient({ 
  articles, 
  profile 
}: { 
  articles: Article[], 
  profile?: any 
}) {
  const { isMenuOpen, toggleMenu } = useStore();

  return (
    <div className="landing-container">
      <Menu isOpen={isMenuOpen} onClose={() => toggleMenu()} profile={profile} />
      
      <div className="articles-parallax">
        {/* --- Hero Section --- */}
        <section className="landing" style={{ zIndex: 1, height: '100vh', position: 'relative', scrollSnapAlign: 'start' }}>
          <div className="landing__bg" />
          <header className="landing__header">
            <div className="landing__brand">NISCHAY SHARMA</div>
            <div className="landing__logo">
              <i className="ph ph-stack" style={{ fontSize: '1.5rem' }} />
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
                Curated by {profile?.displayName || 'Nischay Sharma'}
              </p>
            </div>
          </section>
          
          <footer className="landing__footer">
            <div className="landing__scroll-text">
              Begin Journey
            </div>
          </footer>
        </section>

        {/* --- About Section --- */}
        {profile && (
          <section id="about" className="landing-section" style={{ background: '#fff', padding: '10rem 2rem', position: 'relative', zIndex: 2 }}>
            <div className="landing-section__container" style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem', alignItems: 'center' }}>
              <div className="landing-section__image">
                <div style={{ 
                  aspectRatio: '3/4', 
                  background: profile.photoURL ? `url(${profile.photoURL}) center/cover` : '#eee',
                  borderRadius: '0.5rem',
                  boxShadow: '0 40px 100px rgba(0,0,0,0.1)'
                }} />
              </div>
              <div className="landing-section__content">
                <span style={{ fontSize: '0.65rem', fontWeight: 800, letterSpacing: '0.3em', textTransform: 'uppercase', opacity: 0.3, marginBottom: '1.5rem', display: 'block' }}>
                  The Curator
                </span>
                <h2 style={{ fontSize: '4rem', fontFamily: 'var(--font-playfair)', fontWeight: 600, lineHeight: 1.1, marginBottom: '2rem' }}>
                  {profile.displayName}
                </h2>
                <div style={{ fontSize: '1.1rem', lineHeight: 1.8, color: '#444', marginBottom: '3rem' }}>
                  {profile.bio || "Crafting digital experiences at the intersection of design and technology. This anthology represents a lifelong pursuit of knowledge, shared through structured technical discourse."}
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                  <div>
                    <h4 style={{ fontSize: '0.75rem', fontWeight: 800, marginBottom: '0.75rem' }}>OCCUPATION</h4>
                    <p style={{ fontSize: '0.875rem', opacity: 0.6 }}>{profile.occupation || "Independent Developer"}</p>
                  </div>
                  <div>
                    <h4 style={{ fontSize: '0.75rem', fontWeight: 800, marginBottom: '0.75rem' }}>WRITING STYLE</h4>
                    <p style={{ fontSize: '0.875rem', opacity: 0.6, textTransform: 'capitalize' }}>{profile.writingStyle || "Technical"}</p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* --- Skills Section --- */}
        {profile && profile.skills && profile.skills.length > 0 && (
          <section id="skills" className="landing-section" style={{ background: '#000', color: '#fff', padding: '10rem 2rem', position: 'relative', zIndex: 3 }}>
             <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                <div style={{ textAlign: 'center', marginBottom: '6rem' }}>
                  <h2 style={{ fontSize: '3rem', fontFamily: 'var(--font-playfair)', fontWeight: 400, marginBottom: '1rem' }}>Technical Arsenal</h2>
                  <p style={{ opacity: 0.4, fontSize: '0.75rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Core competencies & technologies</p>
                </div>
                
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'center' }}>
                  {profile.skills.map((skill: string) => (
                    <div key={skill} style={{ 
                      padding: '1.5rem 3rem', 
                      border: '1px solid rgba(255,255,255,0.1)', 
                      borderRadius: '4rem',
                      fontSize: '1.25rem',
                      fontWeight: 500,
                      letterSpacing: '-0.02em',
                      transition: 'background 0.3s ease'
                    }}>
                      {skill}
                    </div>
                  ))}
                </div>
             </div>
          </section>
        )}

        {/* --- Articles --- */}
        <div id="blogs">
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
    </div>
  );
}
