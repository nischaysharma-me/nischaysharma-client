'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function SplashLoader() {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Hide loader after a short delay to ensure hydration is complete
    // and to give the user a chance to see the "Synchronizing" state
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 2000); // 2 seconds delay

    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div 
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          style={{ 
            position: 'fixed', 
            inset: 0, 
            zIndex: 9999, 
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
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            style={{ 
              color: '#fff', 
              fontSize: '10px', 
              fontWeight: 800, 
              letterSpacing: '0.5em', 
              textTransform: 'uppercase' 
            }}
          >
            Synchronizing Anthology
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
