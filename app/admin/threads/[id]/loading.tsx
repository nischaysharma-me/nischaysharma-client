'use client';

import React from 'react';
import { motion } from 'framer-motion';

export default function ThreadLoading() {
  return (
    <main className="threads-admin__chat-area">
      <div 
        style={{ 
          width: '100%', 
          height: '100%', 
          display: 'flex', 
          flexDirection: 'column',
          alignItems: 'center', 
          justifyContent: 'center',
          gap: '2rem',
          background: 'var(--color-bg-primary)'
        }}
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1, repeat: Infinity, repeatType: "reverse" }}
          style={{ 
            width: '40px', 
            height: '40px', 
            backgroundColor: 'var(--color-text-primary)', 
            borderRadius: '50%' 
          }}
        />
        <div style={{ color: 'var(--color-text-primary)', fontSize: '10px', fontWeight: 800, letterSpacing: '0.4em', textTransform: 'uppercase', opacity: 0.3 }}>
          Loading Conversation
        </div>
      </div>
    </main>
  );
}
