'use client';

import React from 'react';
import Menu from '@/components/Menu';
import { useStore } from '@/store/useStore';
import Link from 'next/link';

export default function AboutPage() {
  const { isMenuOpen, toggleMenu } = useStore();

  return (
    <div className="landing-container">
      <Menu isOpen={isMenuOpen} onClose={() => toggleMenu()} />
      
      <header className="landing__header" style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100 }}>
        <Link href="/" className="landing__brand" style={{ textDecoration: 'none', color: 'inherit' }}>NISCHAY SHARMA</Link>
        <div className="landing__logo">
          <i className="ph ph-stack" style={{ fontSize: '1.5rem' }} />
        </div>
        <button onClick={toggleMenu} className="landing__menu-btn">
          Menu
        </button>
      </header>

      <main className="about-view" style={{ paddingTop: '10vh', minHeight: '100vh', background: '#fff' }}>
        <section className="about-hero" style={{ padding: '4rem 2rem', maxWidth: '1200px', margin: '0 auto' }}>
          <div className="about-hero__content">
            <span className="articles-parallax__eyebrow" style={{ color: '#a3a3a3', marginBottom: '1rem', display: 'block' }}>
              The Architect
            </span>
            <h1 style={{ fontSize: 'clamp(3rem, 10vw, 6rem)', fontWeight: 800, lineHeight: 0.9, letterSpacing: '-0.02em', margin: '0 0 4rem 0' }}>
              Nischay<br />
              Sharma.
            </h1>
            
            <div className="about-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '4rem' }}>
              <div className="about-text">
                <p style={{ fontSize: '1.25rem', lineHeight: 1.6, color: '#333', marginBottom: '2rem' }}>
                  I am a lead developer specializing in building scalable backend systems, architecting cloud-native applications, and creating intuitive developer experiences.
                </p>
                <p style={{ fontSize: '1.1rem', lineHeight: 1.6, color: '#666' }}>
                  My passion lies in bridging the gap between complex engineering and clear, accessible education. Through TaughtCode, I aim to provide robust tools and platforms that empower developers to learn and build faster.
                </p>
              </div>
              
              <div className="about-stats" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                <div style={{ borderTop: '1px solid #eee', paddingTop: '1.5rem' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.5 }}>Current Focus</span>
                  <p style={{ marginTop: '0.5rem', fontWeight: 700 }}>AI Orchestration & Smart Backends</p>
                </div>
                <div style={{ borderTop: '1px solid #eee', paddingTop: '1.5rem' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.5 }}>Location</span>
                  <p style={{ marginTop: '0.5rem', fontWeight: 700 }}>Earth, Distributed</p>
                </div>
                <div style={{ borderTop: '1px solid #eee', paddingTop: '1.5rem' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.5 }}>Platform</span>
                  <p style={{ marginTop: '0.5rem', fontWeight: 700 }}>TaughtCode Server v1.1.1</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="about-vision" style={{ padding: '8rem 2rem', background: '#000', color: '#fff' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <h2 style={{ fontSize: 'clamp(2rem, 5vw, 4rem)', fontWeight: 800, marginBottom: '4rem', letterSpacing: '-0.02em' }}>The Vision</h2>
            <div style={{ maxWidth: '800px' }}>
              <p style={{ fontSize: '1.5rem', lineHeight: 1.4, opacity: 0.8, marginBottom: '2rem' }}>
                TaughtCode aims to become the standard for "Smart Backend" architectures—where infrastructure doesn't just store data, but actively participates in the value creation process through intelligent automation and orchestration.
              </p>
            </div>
          </div>
        </section>

        <section className="about-footer" style={{ padding: '4rem 2rem', borderTop: '1px solid #eee' }}>
           <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: '1200px', margin: '0 auto' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, opacity: 0.4 }}>© 2026 NISCHAY SHARMA</div>
              <div style={{ display: 'flex', gap: '2rem' }}>
                <a href="https://github.com/nishuns" target="_blank" style={{ fontSize: '0.75rem', fontWeight: 800, color: '#000', textDecoration: 'none' }}>GITHUB</a>
                <a href="#" style={{ fontSize: '0.75rem', fontWeight: 800, color: '#000', textDecoration: 'none' }}>LINKEDIN</a>
                <a href="#" style={{ fontSize: '0.75rem', fontWeight: 800, color: '#000', textDecoration: 'none' }}>INSTAGRAM</a>
              </div>
           </div>
        </section>
      </main>

      <style jsx global>{`
        .about-view {
          font-family: var(--font-sans, sans-serif);
        }
      `}</style>
    </div>
  );
}
