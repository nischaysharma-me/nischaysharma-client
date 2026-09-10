'use client';

import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { useBillboardOverlayStore } from '@/store/useBillboardOverlayStore';
import { useStackMenuStore } from '@/store/useStackMenuStore';
import { usePathname } from 'next/navigation';

const navLinks = [
  { label: 'Front Page', href: '/', sectionNum: 'Sec. 01' },
  { label: 'Stories & Essays', href: '/articles', sectionNum: 'Sec. 02' },
  { label: 'Feed & Dispatch', href: '/posts', sectionNum: 'Sec. 03' },
  { label: 'About & Bio', href: '/about', sectionNum: 'Sec. 04' },
  { label: 'Technical Docs', href: '/docs', sectionNum: 'Sec. 05' },
];

function getDestinationLabel(href: string) {
  if (!href || href === '/') return 'Front Page';
  if (href.startsWith('http')) return 'External';
  if (href.startsWith('/articles')) return 'Stories';
  if (href.startsWith('/posts')) return 'Feed';
  if (href.startsWith('/about')) return 'About';
  if (href.startsWith('/docs')) return 'Docs';
  return href.replace(/^\//, '');
}

export default function BillboardOverlay() {
  const { billboards, isOpen, setIsOpen, fetchBillboards } = useBillboardOverlayStore();
  const setStackOpen = useStackMenuStore(state => state.setIsOpen);
  const pathname = usePathname();
  const previousPathname = useRef(pathname);

  useEffect(() => {
    if (isOpen) {
      fetchBillboards();
    }
  }, [fetchBillboards, isOpen]);

  // Close overlay when pathname changes
  useEffect(() => {
    if (previousPathname.current !== pathname) {
      previousPathname.current = pathname;
      setIsOpen(false);
    }
  }, [pathname, setIsOpen]);

  const isRouteActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  const leadArticles = billboards.filter(b => b.layoutType === 'lead');
  const middleArticlesRaw = billboards.filter(b => b.layoutType === 'middle');
  const miniArticles = billboards.filter(b => b.layoutType === 'mini');

  // If no explicit lead, fall back to the first middle item as primary lead
  const primaryLead = leadArticles[0] || middleArticlesRaw[0];
  const secondaryLead = leadArticles[1];
  const remainingLeads = leadArticles.slice(2);
  const middleArticles = leadArticles[0]
    ? [...remainingLeads, ...middleArticlesRaw]
    : middleArticlesRaw.slice(1);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ y: '-100%', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '-100%', opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 120 }}
          className="billboard billboard--overlay"
          data-lenis-prevent
        >
          <div className="billboard__container">
            <header className="billboard__header">
              <div className="billboard__weather">
                <span>{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                <span className="billboard__location">Based in Delhi, IN</span>
              </div>
              <h1 className="billboard__title">The Daily Digital</h1>
              <div className="billboard__meta">
                <span>Vol. I — No. 001</span>
                <span>Edition: Broadsheet & Navigation</span>
                <span>Price: Free Access</span>
              </div>

              {/* Newspaper Section Navigation Bar */}
              <nav className="billboard__sections-bar" aria-label="Broadsheet Navigation Sections">
                <span className="billboard__sections-eyebrow">Sections:</span>
                <div className="billboard__sections-list">
                  {navLinks.map((link) => {
                    const active = isRouteActive(link.href);
                    return (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={() => setIsOpen(false)}
                        className={`billboard__section-link ${active ? 'is-active' : ''}`}
                      >
                        <span className="billboard__section-num">{link.sectionNum}</span>
                        <span className="billboard__section-name">{link.label}</span>
                        {active && <span className="billboard__section-active-bullet" aria-hidden="true">●</span>}
                      </Link>
                    );
                  })}
                  <button
                    type="button"
                    onClick={() => {
                      setIsOpen(false);
                      setStackOpen(true);
                    }}
                    className="billboard__section-link billboard__section-link--stack"
                    title="Open Curated Stack Dossier"
                  >
                    <i className="ph ph-stack" />
                    <span className="billboard__section-name">Dossier Archive</span>
                  </button>
                </div>
              </nav>
            </header>

            <div className="billboard__grid">
              {/* Lead Story / Twin Lead Column */}
              {primaryLead && (
                <div className="billboard__lead-column">
                  <article className="billboard__item billboard__item--lead">
                    <Link href={primaryLead.href} className="billboard__link" onClick={() => setIsOpen(false)}>
                      <div className="billboard__image-box" style={{ position: 'relative' }}>
                        {primaryLead.imageUrl ? (
                          <Image src={primaryLead.imageUrl} alt={primaryLead.headline} fill style={{ objectFit: 'cover' }} priority />
                        ) : (
                          <span className="billboard__placeholder">Featured Lead Story</span>
                        )}
                      </div>
                      <div className="billboard__content">
                        <div className="billboard__tag-row">
                          <span className="billboard__label">{primaryLead.label}</span>
                          <span className="billboard__destination-badge">
                            <span>{getDestinationLabel(primaryLead.href)}</span>
                            <i className="ph ph-arrow-up-right" />
                          </span>
                        </div>
                        <h2 className="billboard__headline">{primaryLead.headline}</h2>
                        <p className="billboard__summary">{primaryLead.summary}</p>
                      </div>
                    </Link>
                  </article>

                  {/* Secondary / Twin Lead Story */}
                  {secondaryLead && (
                    <article className="billboard__item billboard__item--sublead">
                      <Link href={secondaryLead.href} className="billboard__link" onClick={() => setIsOpen(false)}>
                        {secondaryLead.imageUrl && (
                          <div className="billboard__image-box billboard__image-box--small" style={{ position: 'relative' }}>
                            <Image src={secondaryLead.imageUrl} alt={secondaryLead.headline} fill style={{ objectFit: 'cover' }} />
                          </div>
                        )}
                        <div className="billboard__content">
                          <div className="billboard__tag-row">
                            <span className="billboard__label">{secondaryLead.label}</span>
                            <span className="billboard__destination-badge">
                              <span>{getDestinationLabel(secondaryLead.href)}</span>
                              <i className="ph ph-arrow-up-right" />
                            </span>
                          </div>
                          <h3 className="billboard__headline billboard__headline--sublead">{secondaryLead.headline}</h3>
                          {secondaryLead.summary && (
                            <p className="billboard__summary">{secondaryLead.summary}</p>
                          )}
                        </div>
                      </Link>
                    </article>
                  )}
                </div>
              )}

              {/* Middle Column */}
              <div className="billboard__middle-column">
                {middleArticles.map((item) => (
                  <article key={item.id} className="billboard__item">
                    <Link href={item.href} className="billboard__link" onClick={() => setIsOpen(false)}>
                      <div className="billboard__image-box billboard__image-box--small" style={{ position: 'relative' }}>
                        {item.imageUrl ? (
                          <Image src={item.imageUrl} alt={item.headline} fill style={{ objectFit: 'cover' }} />
                        ) : (
                          <span className="billboard__placeholder">{item.label}</span>
                        )}
                      </div>
                      <div className="billboard__content">
                        <div className="billboard__tag-row">
                          <span className="billboard__label">{item.label}</span>
                          <span className="billboard__destination-badge">
                            <span>{getDestinationLabel(item.href)}</span>
                            <i className="ph ph-arrow-up-right" />
                          </span>
                        </div>
                        <h2 className="billboard__headline">{item.headline}</h2>
                        <p className="billboard__summary">{item.summary}</p>
                      </div>
                    </Link>
                  </article>
                ))}
              </div>

              {/* Side Column */}
              <div className="billboard__side-column">
                <div className="billboard__section-title">Latest Updates</div>
                {miniArticles.map((item) => (
                  <article key={item.id} className="billboard__item billboard__item--mini">
                    <Link href={item.href} className="billboard__link" onClick={() => setIsOpen(false)}>
                      <div className="billboard__image-box billboard__image-box--thumb" style={{ position: 'relative' }}>
                        {item.imageUrl ? (
                          <Image src={item.imageUrl} alt={item.headline} fill style={{ objectFit: 'cover' }} />
                        ) : (
                          <span className="billboard__placeholder">Img</span>
                        )}
                      </div>
                      <div className="billboard__content">
                        <div className="billboard__tag-row">
                          <span className="billboard__label">{item.label}</span>
                          <span className="billboard__destination-badge billboard__destination-badge--mini">
                            <i className="ph ph-arrow-up-right" />
                          </span>
                        </div>
                        <h2 className="billboard__headline">{item.headline}</h2>
                      </div>
                    </Link>
                  </article>
                ))}
                
                {/* Front Page Directory Index replacing dummy ad */}
                <div className="billboard__directory">
                  <div className="billboard__directory-header">
                    <span className="billboard__directory-eyebrow">Front Page Index</span>
                    <h3 className="billboard__directory-title">Site Directory</h3>
                  </div>
                  <ul className="billboard__directory-list">
                    <li className="billboard__directory-item">
                      <Link href="/articles" onClick={() => setIsOpen(false)} className="billboard__directory-link">
                        <span className="billboard__directory-name">Stories & Essays</span>
                        <span className="billboard__directory-dots" />
                        <span className="billboard__directory-dest">/articles ↗</span>
                      </Link>
                    </li>
                    <li className="billboard__directory-item">
                      <Link href="/posts" onClick={() => setIsOpen(false)} className="billboard__directory-link">
                        <span className="billboard__directory-name">Feed & Dispatch</span>
                        <span className="billboard__directory-dots" />
                        <span className="billboard__directory-dest">/posts ↗</span>
                      </Link>
                    </li>
                    <li className="billboard__directory-item">
                      <button
                        type="button"
                        onClick={() => {
                          setIsOpen(false);
                          setStackOpen(true);
                        }}
                        className="billboard__directory-link billboard__directory-button"
                      >
                        <span className="billboard__directory-name">Dossier / Archive</span>
                        <span className="billboard__directory-dots" />
                        <span className="billboard__directory-dest">Stack ↗</span>
                      </button>
                    </li>
                    <li className="billboard__directory-item">
                      <Link href="/about" onClick={() => setIsOpen(false)} className="billboard__directory-link">
                        <span className="billboard__directory-name">About & Colophon</span>
                        <span className="billboard__directory-dots" />
                        <span className="billboard__directory-dest">/about ↗</span>
                      </Link>
                    </li>
                    <li className="billboard__directory-item">
                      <Link href="/docs" onClick={() => setIsOpen(false)} className="billboard__directory-link">
                        <span className="billboard__directory-name">Technical Docs</span>
                        <span className="billboard__directory-dots" />
                        <span className="billboard__directory-dest">/docs ↗</span>
                      </Link>
                    </li>
                  </ul>
                  <div className="billboard__directory-footer">
                    <span>Navigation Edition • Press ESC to close</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <footer className="billboard__footer">
            <div className="billboard__socials">
              <a href="https://www.instagram.com/nischay.me/" target="_blank" rel="me noopener noreferrer" className="billboard__social-link" title="Instagram">
                <i className="ph-fill ph-instagram-logo" />
              </a>
              <a href="https://www.linkedin.com/in/nischaysharma-me" target="_blank" rel="me noopener noreferrer" className="billboard__social-link" title="LinkedIn">
                <i className="ph-fill ph-linkedin-logo" />
              </a>
              <a href="https://www.threads.net/@nischay.me" target="_blank" rel="me noopener noreferrer" className="billboard__social-link" title="Threads">
                <i className="ph-fill ph-threads-logo" />
              </a>
              <a href="https://www.youtube.com/@Iamnischaysharma" target="_blank" rel="me noopener noreferrer" className="billboard__social-link" title="YouTube">
                <i className="ph-fill ph-youtube-logo" />
              </a>
              <a href="https://github.com/nischaysharma-me" target="_blank" rel="me noopener noreferrer" className="billboard__social-link" title="GitHub">
                <i className="ph-fill ph-github-logo" />
              </a>
            </div>
            <p className="billboard__copyright">© {new Date().getFullYear()} NISCHAY SHARMA. ALL RIGHTS RESERVED.</p>
          </footer>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
