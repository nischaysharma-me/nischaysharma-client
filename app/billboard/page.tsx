'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

const navArticles = [
  { id: 1, label: 'Home', headline: 'The Digital Architect: Building Scalable Futures', summary: 'A deep dive into the philosophy of Nischay Sharma and the engineering principles driving modern web excellence.', href: '/' },
  { id: 2, label: 'About', headline: 'From Code to Creation: The Full-Stack Journey', summary: 'Tracing the path of an engineer committed to solving complex problems with elegant code.', href: '/about' },
  { id: 3, label: 'Docs', headline: 'The Technical Blueprint: Comprehensive Guides', summary: 'Unveiling the internal documentation for architecture, schemas, and advanced system integrations.', href: '/docs' },
  { id: 4, label: 'Skills', headline: 'Mastering the Stack: Tools of the Trade in 2026', summary: 'Analyzing the current tech landscape from Next.js and React to advanced backend orchestration.', href: '/#skills' },
  { id: 5, label: 'Blogs', headline: 'Insights from the Frontier of Software Development', summary: 'Weekly editorials on emerging trends, leadership in tech, and the art of performance optimization.', href: '/#blogs' },
  { id: 6, label: 'Contact', headline: 'Connect for Your Next Grand Venture', summary: 'How to reach out for collaborations, project inquiries, or strategic technical consulting.', href: '/#contact' },
  { id: 7, label: 'Projects', headline: 'Portfolio Highlights: Engineering for Scale', summary: 'A showcase of high-performance applications built to handle millions of requests with zero downtime.', href: '/' },
  { id: 8, label: 'Services', headline: 'Expert Technical Solutions for Modern Business', summary: 'Custom software development, system audits, and architectural consulting tailored for growth.', href: '/about' },
];

export default function BillboardPage() {
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
          <article className="billboard__item billboard__item--lead">
            <Link href={navArticles[0].href} className="billboard__link">
              <div className="billboard__image-box">
                <span className="billboard__placeholder">Featured Image</span>
              </div>
              <div className="billboard__content">
                <span className="billboard__label">{navArticles[0].label}</span>
                <h2 className="billboard__headline">{navArticles[0].headline}</h2>
                <p className="billboard__summary">{navArticles[0].summary}</p>
              </div>
            </Link>
          </article>

          {/* Secondary Stories */}
          <div className="billboard__middle-column">
            {navArticles.slice(1, 3).map((item) => (
              <article key={item.id} className="billboard__item">
                <Link href={item.href} className="billboard__link">
                  <div className="billboard__content">
                    <span className="billboard__label">{item.label}</span>
                    <h2 className="billboard__headline">{item.headline}</h2>
                    <p className="billboard__summary">{item.summary}</p>
                  </div>
                </Link>
              </article>
            ))}
          </div>

          {/* Sidebar / Snippets */}
          <div className="billboard__side-column">
            {navArticles.slice(3).map((item) => (
              <article key={item.id} className="billboard__item billboard__item--mini">
                <Link href={item.href} className="billboard__link">
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
          {['Instagram', 'LinkedIn', 'Twitter'].map((social) => (
            <a key={social} href="#" className="billboard__social-link">
              {social}
            </a>
          ))}
        </div>
      </footer>
    </motion.div>
  );
}
