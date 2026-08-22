'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStackMenuStore } from '@/store/useStackMenuStore';
import { useStackStore } from '@/store/admin/useStackStore';
import type { StackItem } from '@/lib/types/stack';
import Link from 'next/link';

export default function StackMenu({ isStatic = false }: { isStatic?: boolean }) {
  const { isOpen, toggle } = useStackMenuStore();
  const { items, fetchItems } = useStackStore();
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  useEffect(() => {
    if (isOpen || isStatic) {
      fetchItems();
    }
  }, [isOpen, isStatic, fetchItems]);

  const activeItems = [...items]
    .filter(item => item.isActive)
    .sort((a, b) => a.order - b.order);

  const focusedIndex = hoveredIndex ?? Math.max(activeItems.length - 1, 0);
  const focusedItem = activeItems[focusedIndex];

  const renderCardContent = (item: StackItem, isExpanded: boolean, index: number) => {
    return (
      <div className={`stack-card ${isExpanded ? 'stack-card--active' : 'stack-card--compact'}`}>
        {item.imageUrl ? (
          <div className="stack-card__image" style={{ backgroundImage: `url(${item.imageUrl})` }} />
        ) : (
          <div className="stack-card__image stack-card__image--fallback" style={{ background: item.color || '#15151b' }} />
        )}

        <div className="stack-card__wash" />
        <div className="stack-card__grain" />

        <div className="stack-card__topline">
          <span>{String(index + 1).padStart(2, '0')}</span>
          <span>{item.linkType === 'external' ? 'External' : 'Collection'}</span>
        </div>

        <div className="stack-card__content">
          <span className="stack-card__eyebrow">Selected destination</span>
          <h2>{item.title}</h2>
          {item.description && <p>{item.description}</p>}
          <span className="stack-card__action">
            Open experience
            <i className="ph ph-arrow-up-right" />
          </span>
        </div>
      </div>
    );
  };

  const renderContent = () => (
    <div className={`stack-menu__container ${isStatic ? 'stack-menu__container--static' : ''}`} onClick={(e) => e.stopPropagation()}>
      {focusedItem?.imageUrl && (
        <motion.div
          key={focusedItem.id}
          className="stack-menu__ambient"
          style={{ backgroundImage: `url(${focusedItem.imageUrl})` }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.22 }}
          transition={{ duration: 0.6 }}
        />
      )}

      <div className="stack-menu__stage">
      {activeItems.map((item, index) => {
        const distance = index - focusedIndex;
        const isFocused = distance === 0;
        const depth = Math.abs(distance);
        const translateX = distance * 132;
        const translateY = depth * 14;

        return (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, scale: 0.94, x: 0 }}
            animate={{
              opacity: isFocused ? 1 : 0.76,
              scale: isFocused ? 1 : Math.max(0.88, 0.98 - depth * 0.025),
              x: translateX,
              y: translateY,
              z: isFocused ? 180 : -depth * 110,
              rotateX: 0,
              rotateY: 0,
              rotateZ: 0,
              width: isFocused ? 760 : 720,
              height: isFocused ? 480 : 450,
            }}
            onMouseEnter={() => setHoveredIndex(index)}
            whileTap={{ scale: 0.98 }}
            transition={{
              type: 'spring',
              damping: 28,
              stiffness: 170,
            }}
            className={`stack-menu__item ${isFocused ? 'is-focused' : ''}`}
            style={{
              padding: 0,
              textDecoration: 'none',
              zIndex: isFocused ? 100 : Math.max(1, 60 - depth),
            }}
          >
            {item.linkType === 'external' ? (
              <a href={item.link} target="_blank" rel="noopener noreferrer" className="stack-menu__link" aria-label={`Open ${item.title}`}>
                {renderCardContent(item, isFocused, index)}
              </a>
            ) : (
              <Link href={item.link} className="stack-menu__link" aria-label={`Open ${item.title}`}>
                {renderCardContent(item, isFocused, index)}
              </Link>
            )}
          </motion.div>
        );
      })}
      </div>
    </div>
  );

  if (isStatic) {
    return (
      <div className="stack-menu stack-menu--static">
        <div className="stack-menu__header-static">
          <span className="eyebrow">Discovery Stack</span>
          <h2>Explore The Archive</h2>
        </div>
        <div className="stack-menu__viewport">
           {renderContent()}
        </div>
      </div>
    );
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="stack-menu"
          onClick={toggle}
        >
          <button className="stack-menu__close" onClick={(e) => { e.stopPropagation(); toggle(); }}>
            <i className="ph ph-x" />
          </button>
          <div className="stack-menu__viewport">
            {renderContent()}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
