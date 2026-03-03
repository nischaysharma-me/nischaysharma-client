'use client';

import React from 'react';

export default function OverviewPage() {
  return (
    <>
      <div className="dashboard__title">
        <h2>Platform Overview</h2>
        <p>Analytics and recent activity for TaughtCode.</p>
      </div>

      {/* Stats Grid */}
      <div className="dashboard__grid-stats">
        <div className="card card--padded">
          <div className="dashboard__stat">
            <span className="dashboard__stat-label">Total Views</span>
            <span className="dashboard__stat-value">48.2k</span>
            <div className="dashboard__stat-trend">
              <span>+12.5%</span> from last month
            </div>
          </div>
        </div>
        <div className="card card--padded">
          <div className="dashboard__stat">
            <span className="dashboard__stat-label">Subscribers</span>
            <span className="dashboard__stat-value">1,204</span>
            <div className="dashboard__stat-trend">
              <span>+42</span> new this week
            </div>
          </div>
        </div>
        <div className="card card--padded">
          <div className="dashboard__stat">
            <span className="dashboard__stat-label">Avg. Engagement</span>
            <span className="dashboard__stat-value">68%</span>
            <div className="dashboard__stat-trend">
              <span>+2.1%</span> from last month
            </div>
          </div>
        </div>
      </div>

      <div className="dashboard__grid-layout">
        
        {/* Recent Content */}
        <div className="card dashboard__recent">
          <div className="dashboard__recent-header">
            <h3>Recent Publications</h3>
            <button className="btn btn--ghost"><span>View All</span> &rarr;</button>
          </div>
          <div className="dashboard__recent-list">
            {[
              { title: 'The Future of AI Architecture', type: 'Technical Guide', date: 'Today', status: 'Published' },
              { title: 'Designing Minimalist Systems', type: 'Design Pattern', date: 'Yesterday', status: 'Draft' },
              { title: 'Quantum Computing 101', type: 'Deep Dive', date: 'Oct 24', status: 'Review' },
              { title: 'State Management in 2026', type: 'Tutorial', date: 'Oct 20', status: 'Published' },
            ].map((item, i) => (
              <div key={i} className="dashboard__recent-item">
                <div className="dashboard__recent-item-info">
                  <div className="dashboard__recent-item-title">{item.title}</div>
                  <div className="dashboard__recent-item-meta">
                    <span>{item.type}</span>
                    <span className="dot" />
                    <span>{item.date}</span>
                  </div>
                </div>
                <div>
                  <span className={`badge badge--${item.status.toLowerCase()}`}>
                    {item.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar Column */}
        <div className="dashboard__sidebar-col">
          
          <div className="card card--padded card--dark dashboard__ai-card">
            <h3>Generative AI</h3>
            <h4>Draft Content</h4>
            <p>Leverage the fine-tuned model to generate technical outlines and drafts.</p>
            <button className="btn btn--secondary btn--full">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
              <span>Open Generator</span>
            </button>
          </div>

          <div className="card dashboard__links-card">
            <div className="card--padded" style={{ paddingBottom: '0.5rem' }}>
              <h3>Quick Links</h3>
            </div>
            <div className="links" style={{ padding: '0 1rem 1rem 1rem' }}>
              <button className="links-item">
                User Management
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
              </button>
              <button className="links-item">
                API Credentials
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
              </button>
              <button className="links-item">
                System Logs
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
              </button>
            </div>
          </div>

        </div>

      </div>
    </>
  );
}
