'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStackMenuStore } from '@/store/useStackMenuStore';
import { useStackStore } from '@/store/admin/useStackStore';
import Link from 'next/link';

interface Skill {
  name: string;
  value: number;
  color: string;
  icon: string;
}

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

  // Skill sets for About Me card
  const column1Skills: Skill[] = [
    { name: 'HTML/CSS', value: 75, color: 'linear-gradient(90deg, #f97316, #ea580c)', icon: 'ph-html5' },
    { name: 'React/React-Native', value: 85, color: 'linear-gradient(90deg, #06b6d4, #0891b2)', icon: 'ph-atom' },
    { name: 'Django', value: 60, color: 'linear-gradient(90deg, #10b981, #059669)', icon: 'ph-terminal' },
    { name: 'Bash', value: 45, color: 'linear-gradient(90deg, #64748b, #475569)', icon: 'ph-terminal-window' },
  ];

  const column2Skills: Skill[] = [
    { name: 'JavaScript', value: 90, color: 'linear-gradient(90deg, #eab308, #ca8a04)', icon: 'ph-code' },
    { name: 'TypeScript', value: 80, color: 'linear-gradient(90deg, #3b82f6, #2563eb)', icon: 'ph-file-ts' },
    { name: 'SASS', value: 70, color: 'linear-gradient(90deg, #ec4899, #db2777)', icon: 'ph-paint-brush' },
    { name: 'PHP', value: 50, color: 'linear-gradient(90deg, #8b5cf6, #7c3aed)', icon: 'ph-file-code' },
  ];

  const column3Skills: Skill[] = [
    { name: 'Python', value: 85, color: 'linear-gradient(90deg, #3b82f6, #eab308)', icon: 'ph-file-py' },
    { name: 'MongoDB', value: 75, color: 'linear-gradient(90deg, #22c55e, #16a34a)', icon: 'ph-database' },
    { name: 'C++', value: 80, color: 'linear-gradient(90deg, #2563eb, #1d4ed8)', icon: 'ph-cpu' },
    { name: 'Go', value: 60, color: 'linear-gradient(90deg, #06b6d4, #0891b2)', icon: 'ph-bird' },
  ];

  const renderCardContent = (item: any, isExpanded: boolean) => {
    const titleUpper = item.title.toUpperCase();

    // CARD 4: ABOUT ME CARD
    if (titleUpper.includes('ABOUT')) {
      if (isExpanded) {
        return (
          <div className="card-grid-two-cols">
            {/* Left side */}
            <div className="card-col-left" style={{ justifyContent: 'center' }}>
              <h2 className="card-title" style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>
                About Me
              </h2>
              <p style={{
                color: 'rgba(255, 255, 255, 0.8)',
                fontSize: '0.9rem',
                lineHeight: '1.5',
                marginBottom: '1.5rem',
                maxWidth: '95%'
              }}>
                My name is <strong style={{ color: '#fff' }}>Bhed Kumar Kushwaha</strong>, Software Engineer at Darwinbox. My interests include Full Stack Web Development, Data Science and Machine Learning. I have a diverse set of skills, ranging from design, to HTML + CSS + JavaScript, all the way to Python, Django, Go.
              </p>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#fff', margin: '1rem 0 0 0' }}>
                Skill Set
              </h3>
            </div>

            {/* Right side */}
            <div className="card-col-right" style={{ position: 'relative' }}>
              {/* Profile Pic at the top right */}
              <div style={{
                position: 'absolute',
                top: '-5px',
                right: '0px',
                width: '105px',
                height: '105px',
                borderRadius: '50%',
                overflow: 'hidden',
                border: '3px solid rgba(255, 255, 255, 0.2)',
                boxShadow: '0 10px 25px rgba(0,0,0,0.4)',
                zIndex: 10
              }}>
                <img 
                  src="https://storage.googleapis.com/nischaysharma-com.firebasestorage.app/users/XLkz85rGnXT1wD9S6cNuqQVvluE2/profile/profile_1776680697330.png"
                  alt="Bhed Kumar Kushwaha"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>

              {/* Skill set progress bars grid */}
              <div className="skills-grid" style={{ marginTop: '115px' }}>
                {/* Column 1 */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                  {column1Skills.map((s) => (
                    <div key={s.name} className="skill-item">
                      <div className="skill-header">
                        <i className={`ph ${s.icon}`} />
                        <span>{s.name}</span>
                      </div>
                      <div className="skill-track">
                        <div className="skill-fill" style={{ width: `${s.value}%`, background: s.color }} />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Column 2 */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                  {column2Skills.map((s) => (
                    <div key={s.name} className="skill-item">
                      <div className="skill-header">
                        <i className={`ph ${s.icon}`} />
                        <span>{s.name}</span>
                      </div>
                      <div className="skill-track">
                        <div className="skill-fill" style={{ width: `${s.value}%`, background: s.color }} />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Column 3 */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                  {column3Skills.map((s) => (
                    <div key={s.name} className="skill-item">
                      <div className="skill-header">
                        <i className={`ph ${s.icon}`} />
                        <span>{s.name}</span>
                      </div>
                      <div className="skill-track">
                        <div className="skill-fill" style={{ width: `${s.value}%`, background: s.color }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ alignSelf: 'flex-end', marginTop: '1.2rem', color: 'rgba(255, 255, 255, 0.4)', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.05em' }}>
                KINDLY SCROLL DOWN
              </div>
            </div>
          </div>
        );
      } else {
        // Normal View
        return (
          <div className="card-content-wrapper" style={{ background: 'linear-gradient(135deg, #312e81 0%, #1e1b4b 100%)', padding: '1.8rem' }}>
            <div className="flex-1 flex flex-col justify-between">
              <div>
                <h2 className="card-title" style={{ fontSize: '1.8rem', marginBottom: '0.4rem' }}>
                  About Me
                </h2>
                <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.75rem', lineHeight: '1.4', margin: '0 0 1rem 0' }}>
                  My name is Bhed Kumar Kushwaha, Software Engineer...
                </p>
                <h4 style={{ fontSize: '0.8rem', fontWeight: 600, color: '#fff', margin: '0 0 0.5rem 0' }}>
                  Skill Set
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxWidth: '85%' }}>
                  {column1Skills.slice(0, 4).map((s) => (
                    <div key={s.name} style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', color: 'rgba(255,255,255,0.8)' }}>
                        <span>{s.name}</span>
                      </div>
                      <div className="skill-track" style={{ height: '3px' }}>
                        <div className="skill-fill" style={{ width: `${s.value}%`, background: s.color }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );
      }
    }

    // CARD 3: ALUMNI CARD
    if (titleUpper.includes('ALUMNI')) {
      if (isExpanded) {
        return (
          <div className="card-grid-two-cols" style={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #0f172a 100%)' }}>
            <div className="card-col-left" style={{ justifyContent: 'center' }}>
              <h2 className="card-title" style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>
                Alumni
              </h2>
              <h3 style={{ fontSize: '1.2rem', color: 'rgba(255,255,255,0.7)', margin: '0 0 1rem 0', fontWeight: 400 }}>
                Welcome Back!
              </h3>
              <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem', lineHeight: '1.5' }}>
                Connecting former peers and current pathfinders. Discover and keep up with academic networks, portals, and student archives.
              </p>
            </div>
            <div className="card-col-right" style={{ justifyContent: 'center' }}>
              <div className="login-form-mockup">
                <h4>Welcome Back!</h4>
                <div className="form-group">
                  <label>Username</label>
                  <input type="text" placeholder="Enter Username" readOnly />
                </div>
                <div className="form-group">
                  <label>Password</label>
                  <input type="password" placeholder="Enter Password" readOnly />
                </div>
                <button className="login-btn">SIGN UP</button>
              </div>
            </div>
          </div>
        );
      } else {
        return (
          <div className="card-content-wrapper" style={{ background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', padding: '1.8rem' }}>
            <div className="flex-1 flex flex-col justify-between">
              <div>
                <span style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.15em', color: '#ff5e36', fontWeight: 700 }}>
                  Portal
                </span>
                <h2 className="card-title" style={{ fontSize: '1.8rem', marginTop: '0.5rem' }}>
                  Alumni
                </h2>
                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.75rem', marginTop: '0.4rem' }}>
                  Welcome Back!
                </p>
              </div>
            </div>
          </div>
        );
      }
    }

    // CARD 2: MY PORTFOLIO / COLOR GUESSING GAME CARD
    if (titleUpper.includes('PORTFOLIO')) {
      if (isExpanded) {
        return (
          <div className="card-grid-two-cols" style={{ background: 'linear-gradient(135deg, #2a1b4e 0%, #150f2e 100%)' }}>
            <div className="card-col-left" style={{ justifyContent: 'center' }}>
              <h2 className="card-title" style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>
                My Portfolio
              </h2>
              <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem', lineHeight: '1.5' }}>
                Explore interactive designs, production-grade applications, and front-end tools crafted with visual details.
              </p>
              <div style={{ marginTop: '1.5rem', borderLeft: '3px solid #ff5e36', paddingLeft: '1rem' }}>
                <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                  Featured Application
                </span>
                <h4 style={{ color: '#fff', margin: '0.2rem 0 0 0', fontSize: '1rem', fontWeight: 600 }}>
                  Color Guessing Game
                </h4>
              </div>
            </div>
            <div className="card-col-right" style={{ justifyContent: 'center' }}>
              <div className="game-mockup">
                <span style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.1em', textAlign: 'center' }}>
                  THE GREAT
                </span>
                <h4 className="rgb-title">RGB(92, 12, 70)</h4>
                <span style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.1em', textAlign: 'center' }}>
                  GUESSING GAME
                </span>
                <div className="color-swatches">
                  <div className="swatch" style={{ background: '#5c0c46' }} />
                  <div className="swatch" style={{ background: '#843112' }} />
                  <div className="swatch" style={{ background: '#257613' }} />
                  <div className="swatch" style={{ background: '#458fa3' }} />
                  <div className="swatch" style={{ background: '#123456' }} />
                  <div className="swatch" style={{ background: '#542283' }} />
                </div>
              </div>
            </div>
          </div>
        );
      } else {
        return (
          <div className="card-content-wrapper" style={{ background: 'linear-gradient(135deg, #1f1035 0%, #0b0515 100%)', padding: '1.8rem' }}>
            <div className="flex-1 flex flex-col justify-between">
              <div>
                <span style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.15em', color: 'rgba(255,255,255,0.4)', fontWeight: 700 }}>
                  Projects
                </span>
                <h2 className="card-title" style={{ fontSize: '1.8rem', marginTop: '0.5rem' }}>
                  My Portfolio
                </h2>
                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.75rem', marginTop: '0.4rem' }}>
                  Color Guessing Game
                </p>
              </div>
            </div>
          </div>
        );
      }
    }

    // CARD 1: CONTACT CARD / LET'S MAKE SOMETHING
    if (titleUpper.includes('LET\'S MAKE') || titleUpper.includes('SOMETHING')) {
      if (isExpanded) {
        return (
          <div className="card-grid-two-cols" style={{ background: 'linear-gradient(135deg, #111 0%, #1c1c1f 100%)' }}>
            <div className="card-col-left" style={{ justifyContent: 'center' }}>
              <span style={{ fontSize: '0.7rem', color: '#38bdf8', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.15em' }}>
                LET'S MAKE SOMETHING
              </span>
              <h2 className="card-title" style={{ fontSize: '2.5rem', margin: '0.5rem 0 1rem 0' }}>
                Need more information?
              </h2>
              <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem', lineHeight: '1.5' }}>
                I am always open to discussing new projects, creative ideas, or opportunities to be part of your visions.
              </p>
            </div>
            <div className="card-col-right" style={{ justifyContent: 'center', alignItems: 'flex-start', paddingLeft: '2rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div>
                  <h4 style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.4)', margin: '0 0 0.5rem 0' }}>
                    Get in touch
                  </h4>
                  <div style={{ display: 'flex', gap: '1rem', fontSize: '1.5rem', color: '#fff' }}>
                    <a href="https://github.com/kushwahaved" target="_blank" rel="noopener noreferrer" style={{ color: '#fff', textDecoration: 'none' }} className="hover:text-sky-400 transition-colors">
                      <i className="ph ph-github-logo" />
                    </a>
                    <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" style={{ color: '#fff', textDecoration: 'none' }} className="hover:text-sky-400 transition-colors">
                      <i className="ph ph-linkedin-logo" />
                    </a>
                  </div>
                </div>
                <div>
                  <h4 style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.4)', margin: '0 0 0.5rem 0' }}>
                    Reach me
                  </h4>
                  <a href="mailto:kushwaha.ved@gmail.com" style={{ fontSize: '1rem', color: '#38bdf8', fontWeight: 500, textDecoration: 'none' }} className="hover:underline">
                    kushwaha.ved@gmail.com
                  </a>
                </div>
              </div>
            </div>
          </div>
        );
      } else {
        return (
          <div className="card-content-wrapper" style={{ background: '#111111', padding: '1.8rem' }}>
            <div className="flex-1 flex flex-col justify-between">
              <div>
                <span style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.15em', color: 'rgba(255,255,255,0.4)', fontWeight: 700 }}>
                  Contact
                </span>
                <h2 className="card-title" style={{ fontSize: '1.8rem', marginTop: '0.5rem' }}>
                  LET'S MAKE SOMETHING
                </h2>
                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.75rem', marginTop: '0.4rem' }}>
                  Need more information
                </p>
              </div>
            </div>
          </div>
        );
      }
    }

    // CARD 5 (DEFAULT WELCOME CARD): "Hi, I'm Bhed," OR falls back to dynamic list
    return (
      <div className="card-content-wrapper relative overflow-hidden">
        {/* Full Bleed Background Image */}
        {item.imageUrl && (
          <div 
            className="absolute inset-0 transition-transform duration-1000 group-hover:scale-105"
            style={{ 
              backgroundImage: `url(${item.imageUrl})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              zIndex: 0
            }}
          />
        )}
        
        {/* Fallback Color if no image */}
        {!item.imageUrl && (
          <div className="absolute inset-0 z-0" style={{ background: item.color || '#0f172a' }} />
        )}

        {/* Scrim Overlay */}
        <div className="card-scrim" />
        
        <div className="absolute inset-0 p-10 flex flex-col justify-between z-10" style={{ boxSizing: 'border-box' }}>
          <div className="flex-1 flex flex-col justify-center" style={{ marginTop: '1.5rem' }}>
            <h1 className="card-title select-none" style={{ fontSize: '3rem', fontWeight: 600, leadingHeight: '1.1' }}>
              Hi,
              <br />
              I'm Bhed,
            </h1>
            <p className="font-sans mt-2 tracking-wide select-none" style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '1.2rem', margin: '0.5rem 0 0 0' }}>
              Welcome To My Portfolio
            </p>
          </div>
          <div className="flex justify-end items-end">
            <div style={{
              border: '1px solid #38bdf8',
              color: '#38bdf8',
              fontSize: '0.7rem',
              padding: '0.5rem 1rem',
              borderRadius: '9999px',
              fontWeight: 700,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              boxShadow: '0 4px 10px rgba(56, 189, 248, 0.2)',
              pointerEvents: 'none'
            }}>
              KINDLY SCROLL DOWN
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderContent = () => (
    <div className={`stack-menu__container ${isStatic ? 'stack-menu__container--static' : ''}`} onClick={(e) => e.stopPropagation()}>
      {activeItems.map((item, index) => {
        const total = activeItems.length;
        const centerIndex = (total - 1) / 2;
        const offset = index - centerIndex;
        
        // Horizontal parallel fan layout
        const isHovered = hoveredIndex === index;
        const isAnyHovered = hoveredIndex !== null;

        // Normal fanned arrangement math (Image 1 parallel deck)
        // Stacking from left (back) to right (front)
        const translateX = isExpandedCard(index) ? 0 : offset * 110; 
        const translateZ = isExpandedCard(index) ? 300 : index * 25; 
        const rotateX = isExpandedCard(index) ? 0 : 12; // tilted slightly backward
        const rotateY = isExpandedCard(index) ? 0 : -12; // angled slightly to the left
        const rotateZ = isExpandedCard(index) ? 0 : -1; // subtle roll
        
        // Dim and push back non-hovered items
        const opacity = isAnyHovered ? (isHovered ? 1 : 0.2) : 1;
        const scale = isHovered ? 1.25 : 1;

        function isExpandedCard(i: number) {
          return hoveredIndex === i;
        }

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
              zIndex: isHovered ? 1000 : 10 + index,
            }}
            onMouseEnter={() => setHoveredIndex(index)}
            onMouseLeave={() => setHoveredIndex(null)}
            whileTap={{ scale: 0.98 }}
            transition={{ 
              type: 'spring', 
              damping: 25, 
              stiffness: 140,
            }}
            className="stack-menu__item group"
            style={{ 
              padding: 0,
              textDecoration: 'none'
            }}
          >
            {item.linkType === 'external' ? (
              <a href={item.link} target="_blank" rel="noopener noreferrer" className="w-full h-full block no-underline" style={{ textDecoration: 'none' }}>
                {renderCardContent(item, isHovered)}
              </a>
            ) : (
              <Link href={item.link} className="w-full h-full block no-underline" style={{ textDecoration: 'none' }}>
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

