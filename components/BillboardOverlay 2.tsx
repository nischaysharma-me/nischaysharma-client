'use client';

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { useBillboardOverlayStore } from '@/store/useBillboardOverlayStore';
import { usePathname } from 'next/navigation';

const navLinks = [
  { label: 'Home', href: '/' },
  { label: 'Stories', href: '/articles' },
  { label: 'About', href: '/about' },
  { label: 'Docs', href: '/docs' },
];

export default function BillboardOverlay() {
  const { billboards, isOpen, toggle, setIsOpen } = useBillboardOverlayStore();
  const pathname = usePathname();

  // Close overlay when pathname changes
  useEffect(() => {
    setIsOpen(false);
  }, [pathname, setIsOpen]);

  const leadArticle = billboards.find(b => b.layoutType === 'lead');
  const middleArticles = billboards.filter(b => b.layoutType === 'middle');
  const miniArticles = billboards.filter(b => b.layoutType === 'mini');

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
                <span>Edition: Premium</span>
                <span>Price: Free</span>
              </div>
            </header>

            <div className="billboard__grid">
              {/* Lead Story */}
              {leadArticle && (
                <article className="billboard__item billboard__item--lead">
                  <Link href={leadArticle.href} className="billboard__link">
                    <div className="billboard__image-box" style={{ position: 'relative' }}>
                      {leadArticle.imageUrl ? (
                        <Image src={leadArticle.imageUrl} alt={leadArticle.headline} fill style={{ objectFit: 'cover' }} priority />
                      ) : (
                        <span className="billboard__placeholder">Featured Image</span>
                      )}
                    </div>
                    <div className="billboard__content">
                      <span className="billboard__label">{leadArticle.label}</span>
                      <h2 className="billboard__headline">{leadArticle.headline}</h2>
                      <p className="billboard__summary">{leadArticle.summary}</p>
                    </div>
                  </Link>
                </article>
              )}

              {/* Middle Column */}
              <div className="billboard__middle-column">
                {middleArticles.map((item) => (
                  <article key={item.id} className="billboard__item">
                    <Link href={item.href} className="billboard__link">
                      <div className="billboard__image-box billboard__image-box--small" style={{ position: 'relative' }}>
                        {item.imageUrl ? (
                          <Image src={item.imageUrl} alt={item.headline} fill style={{ objectFit: 'cover' }} />
                        ) : (
                          <span className="billboard__placeholder">{item.label}</span>
                        )}
                      </div>
                      <div className="billboard__content">
                        <span className="billboard__label">{item.label}</span>
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
                    <Link href={item.href} className="billboard__link">
                      <div className="billboard__image-box billboard__image-box--thumb" style={{ position: 'relative' }}>
                        {item.imageUrl ? (
                          <Image src={item.imageUrl} alt={item.headline} fill style={{ objectFit: 'cover' }} />
                        ) : (
                          <span className="billboard__placeholder">Img</span>
                        )}
                      </div>
                      <div className="billboard__content">
                        <span className="billboard__label">{item.label}</span>
                        <h2 className="billboard__headline">{item.headline}</h2>
                      </div>
                    </Link>
                  </article>
                ))}
                
                <div className="billboard__ad">
                  <span>ADVERTISEMENT: BUILD YOUR FUTURE WITH CLEAN CODE</span>
                </div>
              </div>
            </div>
          </div>

          <footer className="billboard__footer">
            <div className="billboard__socials">
              <a href="https://instagram.com/nishuns" target="_blank" rel="noopener noreferrer" className="billboard__social-link" title="Instagram">
                <i className="ph-fill ph-instagram-logo" />
              </a>
              <a href="https://linkedin.com/in/nischaysharma" target="_blank" rel="noopener noreferrer" className="billboard__social-link" title="LinkedIn">
                <i className="ph-fill ph-linkedin-logo" />
              </a>
              <a href="https://twitter.com/nishuns" target="_blank" rel="noopener noreferrer" className="billboard__social-link" title="Twitter">
                <i className="ph-fill ph-twitter-logo" />
              </a>
              <a href="https://github.com/nishuns" target="_blank" rel="noopener noreferrer" className="billboard__social-link" title="GitHub">
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
