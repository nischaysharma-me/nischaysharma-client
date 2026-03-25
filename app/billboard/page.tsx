'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { listBillboardsAction } from '@/lib/actions/billboard';
import { Billboard } from '@/lib/types/billboard';

export default function BillboardPage() {
  const [billboards, setBillboards] = useState<Billboard[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const response = await listBillboardsAction(undefined, true);
      if (response.success) {
        setBillboards(response.data);
      }
      setLoading(false);
    }
    loadData();
  }, []);

  if (loading) return (
    <div className="billboard" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ fontFamily: 'var(--font-playfair)', fontStyle: 'italic', fontSize: '1.5rem' }}>Loading The Daily Digital...</p>
    </div>
  );

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
                <div className="billboard__image-box">
                  {leadArticle.imageUrl ? (
                    <img src={leadArticle.imageUrl} alt={leadArticle.headline} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
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
                  <div className="billboard__image-box billboard__image-box--small">
                    {item.imageUrl ? (
                      <img src={item.imageUrl} alt={item.headline} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
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
                  <div className="billboard__image-box billboard__image-box--thumb">
                    {item.imageUrl ? (
                      <img src={item.imageUrl} alt={item.headline} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
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
