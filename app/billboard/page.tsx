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

const socialArticles = [
  { id: 9, label: 'LinkedIn', headline: 'Professional Network: Strategy & Leadership', summary: 'Connecting with industry leaders and sharing insights on technical management and system design.', href: 'https://linkedin.com' },
  { id: 10, label: 'Twitter', headline: 'Real-time Tech: The Bleeding Edge of Code', summary: 'Quick thoughts on the latest releases in the JavaScript ecosystem and architectural patterns.', href: 'https://twitter.com' },
  { id: 11, label: 'Instagram', headline: 'Visual Journal: Life Behind the Terminal', summary: 'A curated look at the inspiration, workspace, and lifestyle of a modern software architect.', href: 'https://instagram.com' },
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
                <span className="billboard__placeholder">Image {navArticles[0].id}</span>
              </div>
              <div className="billboard__content">
                <span className="billboard__label">{navArticles[0].label}</span>
                <h2 className="billboard__headline">{navArticles[0].headline}</h2>
                <p className="billboard__summary">{navArticles[0].summary}</p>
              </div>
            </Link>
          </article>

          {/* Middle Column */}
          <div className="billboard__middle-column">
            {navArticles.slice(1, 4).map((item) => (
              <article key={item.id} className="billboard__item">
                <Link href={item.href} className="billboard__link">
                  <div className="billboard__image-box billboard__image-box--small">
                    <span className="billboard__placeholder">Image {item.id}</span>
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

          {/* Side Column (Now including Social Media as cards) */}
          <div className="billboard__side-column">
            <div className="billboard__section-title">Latest Updates</div>
            {navArticles.slice(4).map((item) => (
              <article key={item.id} className="billboard__item billboard__item--mini">
                <Link href={item.href} className="billboard__link">
                  <div className="billboard__image-box billboard__image-box--thumb">
                    <span className="billboard__placeholder">Img {item.id}</span>
                  </div>
                  <div className="billboard__content">
                    <span className="billboard__label">{item.label}</span>
                    <h2 className="billboard__headline">{item.headline}</h2>
                  </div>
                </Link>
              </article>
            ))}

            <div className="billboard__section-title">Follow the Story</div>
            {socialArticles.map((item) => (
              <article key={item.id} className="billboard__item billboard__item--mini">
                <a href={item.href} target="_blank" rel="noopener noreferrer" className="billboard__link">
                  <div className="billboard__image-box billboard__image-box--thumb">
                    <span className="billboard__placeholder">Img {item.id}</span>
                  </div>
                  <div className="billboard__content">
                    <span className="billboard__label">{item.label}</span>
                    <h2 className="billboard__headline">{item.headline}</h2>
                  </div>
                </a>
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
