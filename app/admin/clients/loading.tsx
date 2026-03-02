'use client';

import React from 'react';
import { motion } from 'framer-motion';

export default function ClientsLoading() {
  return (
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
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1, repeat: Infinity, repeatType: "reverse" }}
        style={{ 
          width: '50px', 
          height: '50px', 
          backgroundColor: '#111', 
          borderRadius: '50%' 
        }}
      />
      <div style={{ color: '#111', fontSize: '10px', fontWeight: 800, letterSpacing: '0.4em', textTransform: 'uppercase', opacity: 0.3 }}>
        Synchronizing Clients
      </div>
    </div>
  );
}
