'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Textarea';

interface MermaidDialogProps {
  isOpen: boolean;
  initialCode?: string;
  onClose: () => void;
  onSave: (code: string) => void;
}

export const MermaidDialog: React.FC<MermaidDialogProps> = ({
  isOpen,
  initialCode = 'graph TD\n  A --> B',
  onClose,
  onSave,
}) => {
  const [code, setCode] = useState(initialCode);

  useEffect(() => {
    if (isOpen) {
      setCode(initialCode);
    }
  }, [isOpen, initialCode]);

  const handleSave = () => {
    onSave(code);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.7)',
              backdropFilter: 'blur(8px)',
              zIndex: 10000,
            }}
          />
          <div
            style={{
              position: 'fixed',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 10001,
              padding: '1.5rem',
              pointerEvents: 'none',
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              style={{
                backgroundColor: '#1e1e1e',
                borderRadius: '1rem',
                width: '100%',
                maxWidth: '600px',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                pointerEvents: 'auto',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                border: '1px solid #333',
              }}
            >
              <div style={{ padding: '1.5rem', borderBottom: '1px solid #333', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 600, color: '#fff' }}>
                  Mermaid Diagram Editor
                </h3>
                <button 
                  onClick={onClose}
                  style={{ background: 'transparent', border: 'none', color: '#888', cursor: 'pointer', fontSize: '1.5rem' }}
                >
                  <i className="ph ph-x" />
                </button>
              </div>

              <div style={{ padding: '1.5rem', flex: 1 }}>
                <div style={{ marginBottom: '0.5rem', fontSize: '0.875rem', color: '#aaa' }}>
                  Enter your Mermaid code below:
                </div>
                <Textarea
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="graph TD..."
                  style={{
                    minHeight: '300px',
                    fontFamily: 'monospace',
                    fontSize: '0.9rem',
                    backgroundColor: '#0d0d0d',
                    color: '#e0e0e0',
                    border: '1px solid #444',
                    borderRadius: '0.5rem',
                    padding: '1rem',
                    width: '100%',
                  }}
                />
                <div style={{ marginTop: '1rem', fontSize: '0.75rem', color: '#666' }}>
                  Tip: Use <code>graph TD</code>, <code>sequenceDiagram</code>, <code>gantt</code>, etc.
                </div>
              </div>

              <div style={{ padding: '1rem 1.5rem', backgroundColor: '#252525', borderTop: '1px solid #333', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                <Button variant="secondary" onClick={onClose} style={{ backgroundColor: 'transparent', border: '1px solid #444', color: '#fff' }}>
                  Cancel
                </Button>
                <Button variant="primary" onClick={handleSave} style={{ backgroundColor: '#fff', color: '#000' }}>
                  Save Diagram
                </Button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};
