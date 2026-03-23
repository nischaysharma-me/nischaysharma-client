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
    <aside className="docs-sidebar" data-lenis-prevent>
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
    </aside>
  );
}
