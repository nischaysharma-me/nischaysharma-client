'use client';

import React from 'react';
import { motion } from 'framer-motion';

export default function Loading() {
  return (
    <div 
      style={{ 
        position: 'fixed', 
        inset: 0, 
        zIndex: 999, 
        backgroundColor: '#000', 
        display: 'flex', 
        flexDirection: 'column',
        alignItems: 'center', 
        justifyContent: 'center',
        gap: '2rem'
      }}
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1, repeat: Infinity, repeatType: "reverse" }}
        style={{ 
          width: '60px', 
          height: '60px', 
          backgroundColor: '#fff', 
          borderRadius: '50%' 
        }}
      />
      <div style={{ color: '#fff', fontSize: '10px', fontWeight: 800, letterSpacing: '0.5em', textTransform: 'uppercase' }}>
        Synchronizing Anthology
      </div>
    </div>
  );
}
