'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';

export default function SettingsPage() {
  const [maintenance, setMaintenance] = useState(false);

  return (
    <div className="settings">
      <div className="dashboard__title">
        <h2>System Settings</h2>
        <p>Global configurations for your TaughtCode platform.</p>
      </div>

      <div className="dashboard__grid-layout">
        <div className="lg:col-span-2">
          <div className="card card--padded">
            <h3 className="label" style={{ marginBottom: '1.5rem' }}>Platform Preferences</h3>
            
            <div className="organization__form-group" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', border: '1px solid #eee', borderRadius: '1rem' }}>
              <div>
                <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>Maintenance Mode</div>
                <div style={{ fontSize: '0.75rem', color: '#737373' }}>Disable public access to your articles temporarily.</div>
              </div>
              <button 
                onClick={() => setMaintenance(!maintenance)}
                style={{ 
                  width: '40px', 
                  height: '20px', 
                  backgroundColor: maintenance ? '#111' : '#eee', 
                  borderRadius: '20px',
                  position: 'relative',
                  transition: 'background-color 0.3s'
                }}
              >
                <div style={{ 
                  width: '16px', 
                  height: '16px', 
                  backgroundColor: '#fff', 
                  borderRadius: '50%',
                  position: 'absolute',
                  top: '2px',
                  left: maintenance ? '22px' : '2px',
                  transition: 'left 0.3s'
                }} />
              </button>
            </div>

            <div className="organization__form-group" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', border: '1px solid #eee', borderRadius: '1rem', marginTop: '1rem' }}>
              <div>
                <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>AI Auto-Tagging</div>
                <div style={{ fontSize: '0.75rem', color: '#737373' }}>Automatically generate 20+ SEO tags for every article.</div>
              </div>
              <div style={{ fontSize: '0.625rem', fontWeight: 800, color: '#10b981', textTransform: 'uppercase' }}>Enabled</div>
            </div>
          </div>
        </div>

        <div className="dashboard__sidebar-col">
          <div className="card card--padded">
            <h3 className="label" style={{ marginBottom: '1rem' }}>Danger Zone</h3>
            <p style={{ fontSize: '0.75rem', color: '#737373', marginBottom: '1.5rem' }}>Irreversible actions that affect your entire platform.</p>
            <Button variant="secondary" className="btn--full" style={{ color: '#ff6b6b' }}>
              Reset Platform Data
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
