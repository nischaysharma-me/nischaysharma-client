'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useNotificationStore, Notification } from '@/store/useNotificationStore';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';

export default function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const { notifications, unreadCount, markAsRead, markAllAsRead, clearAll } = useNotificationStore();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
    if (!isOpen && unreadCount > 0) {
      // Optional: mark all as read when opening? 
      // User might prefer manual marking or marking individual items.
    }
  };

  const getIcon = (status: string) => {
    switch (status) {
      case 'completed': return <i className="ph ph-check-circle" />;
      case 'failed': return <i className="ph ph-warning-circle" />;
      case 'processing': return <i className="ph ph-spinner animate-spin" />;
      case 'queued': return <i className="ph ph-clock" />;
      default: return <i className="ph ph-bell" />;
    }
  };

  return (
    <div className="notification-center" ref={dropdownRef}>
      <button 
        className={`notification-center__bell ${unreadCount > 0 ? 'notification-center__bell--active' : ''}`}
        onClick={toggleDropdown}
        title="Notifications"
      >
        <i className="ph ph-bell" style={{ fontSize: '1.5rem' }} />
        {unreadCount > 0 && (
          <span className="notification-center__badge">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="notification-center__dropdown"
          >
            <div className="notification-center__header">
              <h3>Notifications</h3>
              <div className="notification-center__actions">
                {notifications.length > 0 && (
                  <>
                    <button onClick={markAllAsRead}>Mark all read</button>
                    <button onClick={clearAll}>Clear all</button>
                  </>
                )}
              </div>
            </div>

            <div className="notification-center__list" data-lenis-prevent>
              {notifications.length > 0 ? (
                notifications.map((notif) => (
                  <div 
                    key={notif.id} 
                    className={`notification-center__item ${!notif.read ? 'notification-center__item--unread' : ''}`}
                    onClick={() => markAsRead(notif.id)}
                  >
                    <div className={`notification-center__item-icon ${notif.status}`}>
                      {getIcon(notif.status)}
                    </div>
                    <div className="notification-center__item-content">
                      <div className="notification-center__item-title">{notif.message}</div>
                      <div className="notification-center__item-meta">
                        <span>{formatDistanceToNow(notif.timestamp, { addSuffix: true })}</span>
                        {!notif.read && <span style={{ color: 'var(--color-primary)', fontWeight: 800, fontSize: '0.6rem' }}>NEW</span>}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="notification-center__empty">
                  <i className="ph ph-bell-slash" />
                  <p>All caught up!</p>
                </div>
              )}
            </div>

            {notifications.length > 0 && (
              <div className="notification-center__footer">
                <button onClick={clearAll} style={{ background: 'none', border: 'none', fontSize: '0.75rem', cursor: 'pointer', opacity: 0.5 }}>
                  Clear History
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
