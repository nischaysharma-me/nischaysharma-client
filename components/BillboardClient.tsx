'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { Billboard } from '@/lib/types/billboard';

interface BillboardClientProps {
  billboards: Billboard[];
}

export default function BillboardClient({ billboards }: BillboardClientProps) {
  const leadArticle = billboards.find(b => b.layoutType === 'lead');
  const middleArticles = billboards.filter(b => b.layoutType === 'middle');
  const miniArticles = billboards.filter(b => b.layoutType === 'mini');

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="billboard"
      data-lenis-prevent
    >
      <div className="billboard__container">
        <header className="billboard__header">
          <div className="billboard__weather">
            <span>Location: Global</span>
            <span>Weather: High Performance</span>
          </div>
          <h1 className="billboard__title">The Daily Digital</h1>
          <div className="billboard__meta">
            <span>Vol. I — No. 001</span>
            <span>{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
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
        <p className="billboard__copyright">© {new Date().getFullYear()} NISCHAY SHARMA. ALL RIGHTS RESERVED.</p>
      </footer>
    </motion.div>
  );
}
