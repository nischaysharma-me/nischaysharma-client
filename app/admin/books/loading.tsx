'use client';

import React from 'react';
import { motion } from 'framer-motion';

export default function BooksLoading() {
  return (
    <div className="dashboard__loading">
      <div 
        style={{ 
          width: '100%', 
          height: '60vh', 
          display: 'flex', 
          flexDirection: 'column',
          alignItems: 'center', 
          justifyContent: 'center',
          gap: '2rem' 
        }}
      >
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 2,
            ease: "easeInOut",
            times: [0, 0.5, 1],
            repeat: Infinity,
          }}
          style={{ 
            width: '40px', 
            height: '40px', 
            border: '2px solid var(--color-text-primary)',
            borderRadius: '4px'
          }}
        />
        <div style={{ color: 'var(--color-text-primary)', fontSize: '10px', fontWeight: 800, letterSpacing: '0.4em', textTransform: 'uppercase', opacity: 0.3 }}>
          Loading Library
        </div>
      </div>
    </div>
  );
}
