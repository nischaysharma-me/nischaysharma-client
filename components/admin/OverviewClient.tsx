'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { auth } from '@/lib/firebase';
import { articlesService } from '@/services/articles.service';
import { booksService } from '@/services/books.service';
import { eventsService, TCodeEvent } from '@/services/events.service';
import { format, subDays, startOfToday, isSameDay, parseISO } from 'date-fns';
import AdminLoading from '@/app/admin/loading';
import Link from 'next/link';
import ActivityHeatmap from '../ui/ActivityHeatmap';

export default function OverviewClient() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    articles: 0,
    books: 0,
    totalEvents: 0
  });
  const [events, setEvents] = useState<TCodeEvent[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = await auth.currentUser?.getIdToken();
      if (!token) return;

      const [articlesRes, booksRes, eventsRes] = await Promise.all([
        articlesService.listArticles(undefined, token),
        booksService.getUserBooks(token),
        eventsService.listEvents(token)
      ]);

      setStats({
        articles: (articlesRes.success && articlesRes.data) ? articlesRes.data.length : 0,
        books: (booksRes.success && booksRes.data) ? booksRes.data.length : 0,
        totalEvents: (eventsRes.success && eventsRes.data) ? eventsRes.data.length : 0
      });

      if (eventsRes.success && eventsRes.data) {
        setEvents(eventsRes.data);
      }
    } catch (err) {
      console.error('Error fetching overview data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Heatmap Data Preparation
  const heatmapData = useMemo(() => {
    const days = 100; // Show last 100 days for better fit
    const result = [];
    const today = startOfToday();

    for (let i = days; i >= 0; i--) {
      const date = subDays(today, i);
      const count = events.filter(e => isSameDay(parseISO(e.receivedAt), date)).length;
      result.push({ date, count });
    }
    return result;
  }, [events]);

  if (loading) return <AdminLoading />;

  return (
    <div className="overview">
      <div className="dashboard__title">
        <h2>Platform Overview</h2>
        <p>Real-time analytics and activity timeline for TaughtCode.</p>
      </div>

      {/* Stats Grid */}
      <div className="dashboard__grid-stats">
        <div className="card card--padded">
          <div className="dashboard__stat">
            <span className="dashboard__stat-label">Total Articles</span>
            <span className="dashboard__stat-value">{stats.articles}</span>
            <div className="dashboard__stat-trend">
              <span>MANUSCRIPTS</span>
            </div>
          </div>
        </div>
        <div className="card card--padded">
          <div className="dashboard__stat">
            <span className="dashboard__stat-label">Threaded Books</span>
            <span className="dashboard__stat-value">{stats.books}</span>
            <div className="dashboard__stat-trend">
              <span>COLLECTIONS</span>
            </div>
          </div>
        </div>
        <div className="card card--padded">
          <div className="dashboard__stat">
            <span className="dashboard__stat-label">Total Events</span>
            <span className="dashboard__stat-value">{stats.totalEvents}</span>
            <div className="dashboard__stat-trend">
              <span>CONFIRMED UPDATES</span>
            </div>
          </div>
        </div>
      </div>

      {/* Activity Heatmap */}
      <div className="card card--padded" style={{ marginBottom: '2rem' }}>
        <ActivityHeatmap 
          data={heatmapData} 
          title="Platform Activity Monitor"
          limitDays={100}
        />
      </div>

      <div className="dashboard__grid-layout">
        
        {/* Activity Timeline */}
        <div className="card dashboard__recent">
          <div className="dashboard__recent-header">
            <h3>Event Timeline</h3>
          </div>
          <div className="dashboard__recent-list" style={{ padding: '2rem' }}>
            {events.length > 0 ? (
              <div className="timeline">
                {events.slice(0, 10).map((event, i) => (
                  <div key={event.id || i} className="timeline__item">
                    <div className="timeline__indicator">
                      <div className={`timeline__dot ${event.type.includes('failed') ? 'timeline__dot--error' : 'timeline__dot--success'}`} />
                      {i !== events.slice(0, 10).length - 1 && <div className="timeline__line" />}
                    </div>
                    <div className="timeline__content">
                      <div className="timeline__title">{event.type.replace(/:/g, ' ')}</div>
                      <div className="timeline__meta">
                        {format(parseISO(event.receivedAt), 'HH:mm')} • {event.source}
                        {event.deviceId && ` • Device ID: ${event.deviceId.slice(0, 8)}...`}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '2rem', color: '#a3a3a3', fontSize: '0.875rem' }}>
                No events recorded yet.
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Column */}
        <div className="dashboard__sidebar-col">
          
          <div className="card card--padded card--dark dashboard__ai-card">
            <h3>Generative AI</h3>
            <h4>Intelligence Center</h4>
            <p>Monitor your background jobs and AI interactions in real-time.</p>
            <Link href="/admin/threads">
              <button className="btn btn--secondary btn--full">
                <i className="ph ph-chat-circle-dots" style={{ marginRight: '0.4rem' }} />
                <span>Open AI Threads</span>
              </button>
            </Link>
          </div>

          <div className="card dashboard__links-card">
            <div className="card--padded" style={{ paddingBottom: '0.5rem' }}>
              <h3>Quick Actions</h3>
            </div>
            <div className="links" style={{ padding: '0 1rem 1rem 1rem' }}>
              <Link href="/admin/articles/create" style={{ textDecoration: 'none' }}>
                <button className="links-item">
                  New Article
                  <i className="ph ph-plus" />
                </button>
              </Link>
              <Link href="/admin/books" style={{ textDecoration: 'none' }}>
                <button className="links-item">
                  Manage Books
                  <i className="ph ph-book" />
                </button>
              </Link>
              <Link href="/admin/settings" style={{ textDecoration: 'none' }}>
                <button className="links-item">
                  System Settings
                  <i className="ph ph-gear" />
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .timeline {
          display: flex;
          flex-direction: column;
          gap: 0;
        }
        .timeline__item {
          display: flex;
          gap: 1.5rem;
          min-height: 80px;
        }
        .timeline__indicator {
          display: flex;
          flex-direction: column;
          align-items: center;
          width: 12px;
        }
        .timeline__dot {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: #eee;
          z-index: 1;
        }
        .timeline__dot--success { background: #111; }
        .timeline__dot--error { background: #ff4757; }
        .timeline__line {
          width: 2px;
          flex: 1;
          background: #eee;
          margin: 4px 0;
        }
        .timeline__title {
          font-size: 0.875rem;
          font-weight: 700;
          text-transform: capitalize;
          margin-bottom: 0.25rem;
        }
        .timeline__meta {
          font-size: 0.7rem;
          color: #a3a3a3;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
      `}</style>
    </div>
  );
}
