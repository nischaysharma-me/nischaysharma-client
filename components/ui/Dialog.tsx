'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDialogStore } from '@/store/useDialogStore';
import { Button } from './Button';

export const Dialog: React.FC = () => {
  const { isOpen, options, closeDialog } = useDialogStore();

  if (!isOpen || !options) return null;

  const handleConfirm = () => {
    if (options.onConfirm) options.onConfirm();
    closeDialog();
  };

  const handleCancel = () => {
    if (options.onCancel) options.onCancel();
    closeDialog();
  };

  const getIcon = () => {
    switch (options.variant) {
      case 'danger': return <i className="ph ph-warning-circle text-error" style={{ fontSize: '2.5rem', color: '#ff4d4f' }} />;
      case 'warning': return <i className="ph ph-warning text-warning" style={{ fontSize: '2.5rem', color: '#faad14' }} />;
      case 'success': return <i className="ph ph-check-circle text-success" style={{ fontSize: '2.5rem', color: '#52c41a' }} />;
      default: return <i className="ph ph-info text-info" style={{ fontSize: '2.5rem', color: '#1890ff' }} />;
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleCancel}
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              backdropFilter: 'blur(4px)',
              zIndex: 9999,
            }}
          />
          <div
            style={{
              position: 'fixed',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 10000,
              pointerEvents: 'none',
              padding: '1.5rem',
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              style={{
                backgroundColor: 'var(--color-bg-primary, #fff)',
                borderRadius: '1.25rem',
                padding: '2.5rem',
                maxWidth: '450px',
                width: '100%',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                pointerEvents: 'auto',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
              }}
            >
              <div style={{ marginBottom: '1.5rem' }}>{getIcon()}</div>
              
              {options.title && (
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--color-text-primary)' }}>
                  {options.title}
                </h3>
              )}
              
              <p style={{ fontSize: '1rem', color: 'var(--color-text-secondary)', marginBottom: '2rem', lineHeight: 1.6 }}>
                {options.message}
              </p>

              <div style={{ display: 'flex', gap: '1rem', width: '100%', justifyContent: 'center' }}>
                {options.cancelLabel !== null && (
                  <Button variant="secondary" onClick={handleCancel} style={{ flex: 1 }}>
                    {options.cancelLabel || 'Cancel'}
                  </Button>
                )}
                <Button 
                  variant={options.variant === 'danger' ? 'primary' : 'primary'} 
                  onClick={handleConfirm} 
                  style={{ 
                    flex: 1,
                    backgroundColor: options.variant === 'danger' ? '#ff4d4f' : undefined,
                    borderColor: options.variant === 'danger' ? '#ff4d4f' : undefined,
                  }}
                >
                  {options.confirmLabel || 'Confirm'}
                </Button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};
