'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { DocSection } from '@/services/docs.service';

interface DocsSidebarProps {
  navigation: DocSection[];
}

export default function DocsSidebar({ navigation }: DocsSidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="docs-sidebar">
      <div className="docs-sidebar__inner">
        {navigation.map((section) => (
          <div key={section.section} className="docs-sidebar__section">
            <h4 className="docs-sidebar__label">{section.section}</h4>
            <ul className="docs-sidebar__list">
              {section.items.map((item) => {
                // Backend path is like /docs/guides/quick-start
                // We want frontend path to be /docs/guides/quick-start
                const isActive = pathname === item.path;
                
                return (
                  <li key={item.path} className="docs-sidebar__item">
                    <Link 
                      href={item.path}
                      className={`docs-sidebar__link ${isActive ? 'is-active' : ''}`}
                    >
                      {item.name}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>

      <style jsx>{`
        .docs-sidebar {
          width: 280px;
          height: calc(100vh - 80px);
          position: sticky;
          top: 80px;
          border-right: 1px solid #eee;
          padding: 2rem 1.5rem;
          overflow-y: auto;
          background: #fff;
        }

        .docs-sidebar__section {
          margin-bottom: 2.5rem;
        }

        .docs-sidebar__label {
          font-size: 0.65rem;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.15em;
          color: #a3a3a3;
          margin-bottom: 1rem;
        }

        .docs-sidebar__list {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .docs-sidebar__link {
          font-size: 0.875rem;
          color: #555;
          text-decoration: none;
          transition: all 0.2s ease;
          display: block;
          padding: 0.25rem 0;
        }

        .docs-sidebar__link:hover {
          color: #000;
          transform: translateX(4px);
        }

        .docs-sidebar__link.is-active {
          color: #000;
          font-weight: 700;
          border-right: 2px solid #000;
        }

        @media (max-width: 768px) {
          .docs-sidebar {
            display: none; // TODO: Implement mobile menu
          }
        }
      `}</style>
    </aside>
  );
}
