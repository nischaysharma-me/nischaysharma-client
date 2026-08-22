'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStackMenuStore } from '@/store/useStackMenuStore';
import { useStackStore } from '@/store/admin/useStackStore';
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

  const renderCardContent = (item: any, isExpanded: boolean) => {
    return (
      <AnimatePresence mode="wait">
        {isExpanded ? (
          <motion.div
            key="expanded"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="card-grid-two-cols"
            style={{ 
              background: item.color || 'linear-gradient(135deg, #111 0%, #1e1b4b 100%)',
              width: '100%',
              height: '100%',
              borderRadius: '1.5rem',
              overflow: 'hidden'
            }}
          >
            {/* Left side (dynamic text content) */}
            <div className="card-col-left" style={{ justifyContent: 'center' }}>
              <span className="card-copy__label">
                {item.linkType === 'external' ? 'External destination' : 'Site collection'}
              </span>
              <h2 className="card-title card-title--expanded">
                {item.title}
              </h2>
              {item.description && (
                <p className="card-expanded-description">
                  {item.description}
                </p>
              )}
              <span className="card-destination-cue">
                View destination
                <i className="ph ph-arrow-up-right" />
              </span>
            </div>

            {/* Right side (dynamic framed image/graphics) */}
            <div className="card-col-right" style={{ justifyContent: 'center' }}>
              {item.imageUrl ? (
                <div style={{
                  width: '100%',
                  maxWidth: '320px',
                  height: '240px',
                  borderRadius: '1.2rem',
                  overflow: 'hidden',
                  boxShadow: '0 20px 45px rgba(0,0,0,0.6)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  position: 'relative'
                }}>
                  <img 
                    src={item.imageUrl} 
                    alt={item.title} 
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                  />
                </div>
              ) : (
                <div style={{
                  width: '100%',
                  maxWidth: '320px',
                  height: '240px',
                  borderRadius: '1.2rem',
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'rgba(255, 255, 255, 0.3)',
                  fontSize: '0.8rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em'
                }}>
                  Interactive Preview
                </div>
              )}
              <div className="card-preview-label">
                Visual preview
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="normal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="card-content-wrapper"
            style={{ width: '100%', height: '100%', borderRadius: '1.5rem' }}
          >
            {/* Full Bleed Background Image */}
            {item.imageUrl && (
              <div
                className="card-background"
                style={{ 
                  backgroundImage: `url(${item.imageUrl})`,
                }}
              />
            )}
            
            {/* Fallback Color if no image */}
            {!item.imageUrl && (
              <div className="card-background card-background--fallback" style={{ background: item.color || '#0f172a' }} />
            )}

            {/* Gradient Scrim for readable text */}
            <div className="card-scrim" />
            
            <div className="card-copy">
              <div className="card-copy__inner">
                <span className="card-copy__label">
                  {item.linkType === 'external' ? 'External destination' : 'Site collection'}
                </span>
                <h2 className="card-title">
                  {item.title}
                </h2>
                {item.description && (
                  <p className="card-description">
                    {item.description}
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    );
  };

  const renderContent = () => (
    <div className={`stack-menu__container ${isStatic ? 'stack-menu__container--static' : ''}`} onClick={(e) => e.stopPropagation()}>
      {activeItems.map((item, index) => {
        const total = activeItems.length;
        const centerIndex = (total - 1) / 2;
        const offset = index - centerIndex;
        
        const isHovered = hoveredIndex === index;
        const isAnyHovered = hoveredIndex !== null;

        // Normal fanned spacing
        const spacing = total > 3 ? 110 : 160;
        
        // Calculate translateX with fanning and offset shifts
        let translateX = offset * spacing;
        if (isAnyHovered) {
          if (isHovered) {
            translateX = 0;
          } else {
            // Push non-hovered cards to left or right of the center hovered card
            if (index < hoveredIndex) {
              translateX = -450 + (index - (hoveredIndex - 1)) * 80;
            } else {
              translateX = 450 + (index - (hoveredIndex + 1)) * 80;
            }
          }
        }
        
        // Stacking order purely in 3D: larger index = higher translateZ (closer to screen)
        // Hovered card is brought to the absolute front (300px)
        const translateZ = isHovered ? 300 : index * 25; 
        
        // 3D rotations for the fanned look (parallel deck)
        const rotateX = isHovered ? 0 : 12; // tilt back
        const rotateY = isHovered ? 0 : -12; // tilt left
        const rotateZ = isHovered ? 0 : -1; // subtle roll
        
        // Focus state opacity and scaling
        const opacity = isAnyHovered ? (isHovered ? 1 : 0.25) : 1;
        const scale = isHovered ? 1.25 : 1;

        const cardWidth = isHovered ? '850px' : '420px';
        const cardHeight = isHovered ? '500px' : '280px';

        return (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, scale: 0.9, x: 0 }}
            animate={{ 
              opacity,
              scale,
              x: translateX,
              z: translateZ,
              rotateX,
              rotateY,
              rotateZ,
              width: cardWidth,
              height: cardHeight,
              // NO zIndex property is set here so browser depth sorting uses translateZ natively!
            }}
            onMouseEnter={() => setHoveredIndex(index)}
            onMouseLeave={() => setHoveredIndex(null)}
            whileTap={{ scale: 0.98 }}
            transition={{ 
              type: 'spring', 
              damping: 25, 
              stiffness: 140,
            }}
            className="stack-menu__item"
            style={{ 
              padding: 0,
              textDecoration: 'none'
            }}
          >
            {item.linkType === 'external' ? (
              <a href={item.link} target="_blank" rel="noopener noreferrer" className="stack-menu__link">
                {renderCardContent(item, isHovered)}
              </a>
            ) : (
              <Link href={item.link} className="stack-menu__link">
                {renderCardContent(item, isHovered)}
              </Link>
            )}
          </motion.div>
        );
      })}
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
