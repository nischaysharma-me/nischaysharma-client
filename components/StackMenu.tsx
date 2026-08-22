'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useStackMenuStore } from '@/store/useStackMenuStore';
import { useStackStore } from '@/store/admin/useStackStore';
import Link from 'next/link';

export default function StackMenu({ isStatic = false }: { isStatic?: boolean }) {
  const router = useRouter();
  const { isOpen, toggle, setIsOpen } = useStackMenuStore();
  const { items, fetchItems } = useStackStore();
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen || isStatic) {
      fetchItems();
    }
  }, [isOpen, isStatic, fetchItems]);

  const activeItems = [...items]
    .filter(item => item.isActive)
    .sort((a, b) => a.order - b.order);

  // Keep selected index within bounds when items list changes
  useEffect(() => {
    if (activeItems.length > 0 && selectedIndex >= activeItems.length) {
      setSelectedIndex(0);
    }
  }, [activeItems.length, selectedIndex]);

  const selectedItem = activeItems[selectedIndex] || activeItems[0] || null;

  // Keyboard navigation for overlay mode
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!isOpen && !isStatic) return;

    if (e.key === 'Escape' && !isStatic) {
      e.preventDefault();
      setIsOpen(false);
      return;
    }

    if (activeItems.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % activeItems.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + activeItems.length) % activeItems.length);
    } else if (e.key === 'Enter') {
      if (selectedItem) {
        e.preventDefault();
        if (selectedItem.linkType === 'external') {
          window.open(selectedItem.link, '_blank', 'noopener,noreferrer');
        } else {
          if (!isStatic) setIsOpen(false);
          router.push(selectedItem.link);
        }
      }
    }
  }, [isOpen, isStatic, activeItems.length, selectedItem, router, setIsOpen]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const renderSplitContent = () => {
    if (activeItems.length === 0) {
      return (
        <div className="stack-dossier__empty">
          <i className="ph ph-stack-overflow" />
          <p>No resources currently active in the archive.</p>
        </div>
      );
    }

    return (
      <div className="stack-dossier" onClick={(e) => e.stopPropagation()}>
        {/* Left Column: Numbered Editorial Index */}
        <div className="stack-dossier__index-col" ref={listRef}>
          <div className="stack-dossier__col-header">
            <span className="stack-dossier__col-eyebrow">Index Catalog</span>
            <span className="stack-dossier__col-count">{activeItems.length} Entries</span>
          </div>

          <div className="stack-dossier__list" role="tablist">
            {activeItems.map((item, index) => {
              const isSelected = selectedIndex === index;
              const formattedNumber = String(index + 1).padStart(2, '0');

              return (
                <div
                  key={item.id}
                  role="tab"
                  aria-selected={isSelected}
                  tabIndex={0}
                  className={`stack-dossier__item ${isSelected ? 'is-selected' : ''}`}
                  onMouseEnter={() => setSelectedIndex(index)}
                  onClick={() => {
                    setSelectedIndex(index);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      setSelectedIndex(index);
                    }
                  }}
                >
                  {isSelected && (
                    <motion.div
                      layoutId={`active-pill-${isStatic ? 'static' : 'modal'}`}
                      className="stack-dossier__item-highlight"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}

                  <div className="stack-dossier__item-content">
                    <div className="stack-dossier__item-left">
                      <span className="stack-dossier__item-num">{formattedNumber}</span>
                      <div className="stack-dossier__item-titles">
                        <span className="stack-dossier__item-title">{item.title}</span>
                        {item.description && (
                          <span className="stack-dossier__item-subtitle">
                            {item.description}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="stack-dossier__item-right">
                      <span className={`stack-dossier__item-badge stack-dossier__item-badge--${item.linkType || 'internal'}`}>
                        {item.linkType === 'external' ? 'External' : 'Collection'}
                      </span>
                      <i className={`ph ${isSelected ? 'ph-arrow-right' : 'ph-caret-right'} stack-dossier__item-icon`} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Visual Spotlight Stage */}
        <div className="stack-dossier__stage-col">
          <AnimatePresence mode="wait">
            {selectedItem && (
              <motion.div
                key={selectedItem.id}
                initial={{ opacity: 0, y: 12, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -12, scale: 0.98 }}
                transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                className="stack-dossier__stage-card"
              >
                {/* Ambient glow in background matching accent color */}
                <div
                  className="stack-dossier__stage-glow"
                  style={{
                    backgroundColor: selectedItem.color || 'rgba(59, 130, 246, 0.4)'
                  }}
                />

                {/* Preview Image / Visual Frame */}
                <div className="stack-dossier__stage-frame">
                  {selectedItem.imageUrl ? (
                    <img
                      src={selectedItem.imageUrl}
                      alt={selectedItem.title}
                      className="stack-dossier__stage-img"
                    />
                  ) : (
                    <div
                      className="stack-dossier__stage-fallback"
                      style={{
                        background: `linear-gradient(135deg, ${selectedItem.color || '#1e293b'} 0%, #0a0a0f 100%)`
                      }}
                    >
                      <i className={`ph ${selectedItem.icon || 'ph-planet'} text-5xl`} />
                      <span>{selectedItem.title}</span>
                    </div>
                  )}

                  <div className="stack-dossier__stage-frame-overlay">
                    <span className="stack-dossier__stage-tag">
                      {selectedItem.linkType === 'external' ? 'External Destination' : 'Site Collection'}
                    </span>
                    <span className="stack-dossier__stage-index-tag">
                      {String(selectedIndex + 1).padStart(2, '0')} / {String(activeItems.length).padStart(2, '0')}
                    </span>
                  </div>
                </div>

                {/* Metadata & Narrative */}
                <div className="stack-dossier__stage-info">
                  <h3 className="stack-dossier__stage-title">{selectedItem.title}</h3>
                  {selectedItem.description && (
                    <p className="stack-dossier__stage-desc">{selectedItem.description}</p>
                  )}

                  <div className="stack-dossier__stage-actions">
                    {selectedItem.linkType === 'external' ? (
                      <a
                        href={selectedItem.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="stack-dossier__cta"
                        onClick={() => !isStatic && setIsOpen(false)}
                      >
                        <span>Visit External Site</span>
                        <i className="ph ph-arrow-up-right" />
                      </a>
                    ) : (
                      <Link
                        href={selectedItem.link}
                        className="stack-dossier__cta"
                        onClick={() => !isStatic && setIsOpen(false)}
                      >
                        <span>Explore Collection</span>
                        <i className="ph ph-arrow-right" />
                      </Link>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Keyboard hints footer (in modal mode) */}
          {!isStatic && (
            <div className="stack-dossier__keyboard-hints">
              <span><kbd>↑</kbd> <kbd>↓</kbd> Navigate</span>
              <span><kbd>↵</kbd> Open</span>
              <span><kbd>Esc</kbd> Close</span>
            </div>
          )}
        </div>
      </div>
    );
  };

  if (isStatic) {
    return (
      <div className="stack-menu stack-menu--static">
        <div className="stack-menu__header-static">
          <span className="eyebrow">Curated Index</span>
          <h2>The Discovery Archive</h2>
          <p className="stack-menu__subhead">Curated direct conduits into digital tools, volumes, and technical work.</p>
        </div>
        <div className="stack-menu__viewport-static">
          {renderSplitContent()}
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
          transition={{ duration: 0.2 }}
          className="stack-menu stack-menu--overlay"
          onClick={() => setIsOpen(false)}
        >
          <div className="stack-menu__overlay-header" onClick={(e) => e.stopPropagation()}>
            <div className="stack-menu__overlay-branding">
              <span className="eyebrow">Dossier // Index</span>
              <h2>Curated Resources</h2>
            </div>
            <button
              className="stack-menu__close-btn"
              onClick={() => setIsOpen(false)}
              aria-label="Close Stack Menu"
            >
              <i className="ph ph-x" />
              <span>ESC</span>
            </button>
          </div>

          <div className="stack-menu__viewport-modal">
            {renderSplitContent()}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
