import React from 'react';

type BadgeVariant = 'published' | 'draft' | 'review' | 'success' | 'warning' | 'error' | 'info' | 'default';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

export const Badge = ({ children, variant = 'default', className = '', ...props }: BadgeProps) => {
  return (
    <span 
      className={`badge badge--${variant} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
};
