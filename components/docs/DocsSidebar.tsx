'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { DocSection } from '@/services/docs.service';
import { motion, AnimatePresence } from 'framer-motion';

interface DocsSidebarProps {
  navigation: DocSection[];
}

export default function DocsSidebar({ navigation }: DocsSidebarProps) {
  const pathname = usePathname();
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});

  // Auto-expand section containing the active path
  useEffect(() => {
    if (Array.isArray(navigation)) {
      const activeSection = navigation.find(section => 
        section.items.some(item => item.path === pathname)
      );
      if (activeSection) {
        setExpandedSections(prev => ({
          ...prev,
          [activeSection.section]: true
        }));
      }
    }
  }, [pathname, navigation]);

  const toggleSection = (sectionName: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionName]: !prev[sectionName]
    }));
  };

  return (
    <aside className="docs-sidebar">
      <div className="docs-sidebar__inner">
        {Array.isArray(navigation) && navigation.map((section) => {
          const isExpanded = !!expandedSections[section.section];
          
          return (
            <div key={section.section} className="docs-sidebar__section">
              <button 
                className="docs-sidebar__section-header"
                onClick={() => toggleSection(section.section)}
              >
                <span className="docs-sidebar__label">{section.section}</span>
                <i className={`ph ph-caret-right docs-sidebar__caret ${isExpanded ? 'is-expanded' : ''}`} />
              </button>

              <AnimatePresence initial={false}>
                {isExpanded && (
                  <motion.ul 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2, ease: 'easeInOut' }}
                    className="docs-sidebar__list"
                  >
                    {section.items.map((item) => {
                      const isActive = pathname === item.path;
                      
                      return (
                        <li key={item.path} className="docs-sidebar__item">
                          <Link 
                            href={item.path}
                            className={`docs-sidebar__link ${isActive ? 'is-active' : ''}`}
                          >
                            <span className="docs-sidebar__bullet" />
                            {item.name}
                          </Link>
                        </li>
                      );
                    })}
                  </motion.ul>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      <style jsx>{`
        .docs-sidebar {
          width: 260px;
          height: calc(100vh - 100px);
          position: sticky;
          top: 100px;
          padding: 0 1.5rem 4rem 0;
          overflow-y: auto;
        }

        .docs-sidebar__section {
          margin-bottom: 0.5rem;
        }

        .docs-sidebar__section-header {
          width: 100%;
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.75rem 0;
          background: none;
          border: none;
          cursor: pointer;
          text-align: left;
        }

        .docs-sidebar__label {
          font-size: 0.7rem;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.15em;
          color: #111;
          transition: opacity 0.2s ease;
        }

        .docs-sidebar__section-header:hover .docs-sidebar__label {
          opacity: 0.6;
        }

        .docs-sidebar__caret {
          font-size: 0.75rem;
          color: #ccc;
          transition: transform 0.2s ease;
        }

        .docs-sidebar__caret.is-expanded {
          transform: rotate(90deg);
          color: #000;
        }

        .docs-sidebar__list {
          list-style: none;
          padding: 0.5rem 0 1rem 0.75rem;
          margin: 0;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          border-left: 1px solid #f0f0f0;
          margin-left: 4px;
        }

        .docs-sidebar__item {
          position: relative;
        }

        .docs-sidebar__link {
          font-size: 0.8rem;
          color: #888;
          text-decoration: none;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.5rem 0;
          line-height: 1.4;
        }

        .docs-sidebar__bullet {
          width: 6px;
          height: 1px;
          background: #e5e5e5;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .docs-sidebar__link:hover {
          color: #000;
          transform: translateX(2px);
        }

        .docs-sidebar__link:hover .docs-sidebar__bullet {
          width: 14px;
          background: #000;
        }

        .docs-sidebar__link.is-active {
          color: #000;
          font-weight: 700;
        }

        .docs-sidebar__link.is-active .docs-sidebar__bullet {
          width: 20px;
          background: #000;
        }

        @media (max-width: 768px) {
          .docs-sidebar {
            width: 100%;
            height: auto;
            position: relative;
            top: 0;
            padding: 2rem 0;
            border-right: none;
            border-bottom: 1px solid #eee;
            margin-bottom: 2rem;
          }
        }
      `}</style>
    </aside>
  );
}
