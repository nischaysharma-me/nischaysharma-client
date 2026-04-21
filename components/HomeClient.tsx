'use client';

import React, { useState, useRef, useEffect } from 'react';
import AboutClient from '@/components/AboutClient';

interface FeaturedItem {
  id: string;
  type: 'article' | 'book';
  title: string;
  data: any;
}

const FeaturedSection = ({ 
  item, 
  index 
}: { 
  item: FeaturedItem, 
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

  const getCoverImage = (item: FeaturedItem) => {
    const { data, type } = item;
    if (type === 'article') {
      if (data.backgroundImage) return data.backgroundImage;
      if (!data.content) return '/architectural-concrete-monument.png';
      const match = data.content.match(/<img[^>]+src="([^">]+)"/);
      return match ? match[1] : '/architectural-concrete-monument.png';
    } else if (type === 'book') {
      return data.coverImage || '/architectural-concrete-monument.png';
    }
    return '/architectural-concrete-monument.png';
  };

  const getPreviewText = (item: FeaturedItem) => {
    const { data, type } = item;
    if (type === 'article') {
      return data.content
        ? data.content.replace(/<[^>]*>?/gm, ' ').trim().substring(0, 450) + '...'
        : 'Dive into this curated story by Nischay Sharma...';
    } else if (type === 'book') {
      return data.description || 'Explore this comprehensive collection of knowledge...';
    }
    return '';
  };

  const getLink = (item: FeaturedItem) => {
    const { data, type } = item;
    if (type === 'article') return `/articles/${data.slug}`;
    if (type === 'book') return `/books/${data.id}`;
    return '#';
  };

  const getLinkLabel = (item: FeaturedItem) => {
    return item.type === 'article' ? 'Open Journal' : 'Read Book';
  };

  return (
    <section 
      ref={sectionRef}
      className={`articles-parallax__section ${isVisible ? 'is-visible' : ''}`}
      style={{ zIndex: index + 10 }}
    >
      <div 
        className="articles-parallax__container"
        style={{ 
          backgroundImage: `url(${getCoverImage(item)})`
        }}
      />
      
      <div className="articles-parallax__content">
        <div className="articles-parallax__main-info">
          <span className="articles-parallax__eyebrow">
            {item.type === 'article' ? 'Curated Edition' : 'Digital Volume'} / Vol. 0{index + 1}
          </span>
          
          <h2 className="articles-parallax__title">
            {item.title || item.data.title}
          </h2>
          
          <p className="articles-parallax__description">
            {item.data.description || (item.type === 'article' ? "An immersive technical study designed for the modern reader." : "A curated collection of technical depth.")}
          </p>
        </div>

        <div className="articles-parallax__preview-col">
          <div className="articles-parallax__preview-text">
            {getPreviewText(item)}
          </div>
          
          <a href={getLink(item)} className="articles-parallax__link">
            {getLinkLabel(item)}
            <i className="ph ph-arrow-right" style={{ fontSize: '1.25rem' }} />
          </a>
        </div>
      </div>
    </section>
  );
};

export default function HomeClient({ profile, featured }: { profile: any; featured: FeaturedItem[] }) {
  return (
    <div className="landing-container">
      <div className="articles-parallax">
        {/* --- Hero Section --- */}
        <section className="landing" style={{ zIndex: 1, height: '100vh', position: 'relative', scrollSnapAlign: 'start' }}>
          <div className="landing__bg" />
          
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

        {/* --- Featured Items --- */}
        {featured && featured.length > 0 ? (
          featured.map((item, index) => (
            <FeaturedSection 
              key={item.id} 
              item={item} 
              index={index} 
            />
          ))
        ) : (
          <div className="flex h-screen items-center justify-center bg-black text-white/20 text-[10px] uppercase tracking-widest font-bold">
            The collection is currently empty
          </div>
        )}

        {/* --- Profile Section --- */}
        <section className="home-profile-section" style={{ zIndex: 100, position: 'relative', background: 'var(--color-bg-primary)' }}>
            <AboutClient profile={profile} />
        </section>
      </div>

      <style jsx global>{`
        .home-profile-section {
            scroll-snap-align: start;
        }
        .home-profile-section .landing-container {
            padding-top: 4rem;
            min-height: auto;
        }
      `}</style>
    </div>
  );
}
