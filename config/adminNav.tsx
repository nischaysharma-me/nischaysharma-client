import React from 'react';

export interface NavItem {
  name: string;
  icon: React.ReactNode;
  href: string;
}

export const primaryNavItems: NavItem[] = [
  { 
    name: 'Overview', 
    href: '/admin',
    icon: <i className="ph ph-squares-four" />
  },
  { 
    name: 'Profile', 
    href: '/admin/profile',
    icon: <i className="ph ph-user" />
  },
  { 
    name: 'Organization', 
    href: '/admin/organization',
    icon: <i className="ph ph-buildings" />
  },
  { 
    name: 'API Clients', 
    href: '/admin/clients',
    icon: <i className="ph ph-code" />
  },
  { 
    name: 'Templates', 
    href: '/admin/templates',
    icon: <i className="ph ph-layout" />
  },
  { 
    name: 'Articles', 
    href: '/admin/articles',
    icon: <i className="ph ph-article" />
  },
  { 
    name: 'Threads', 
    href: '/admin/threads',
    icon: <i className="ph ph-chat-circle-dots" />
  },
];

export const secondaryNavItems: NavItem[] = [
  { 
    name: 'Settings', 
    href: '/admin/settings',
    icon: <i className="ph ph-gear" />
  },
];
