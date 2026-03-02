import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'minimal';
  loading?: boolean;
}

export const Button = ({ 
  children, 
  variant = 'primary', 
  className = '', 
  loading = false,
  ...props 
}: ButtonProps) => {
  return (
    <button 
      className={`btn btn--${variant} ${className} ${loading ? 'btn--loading' : ''}`}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading ? (
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}>
          <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" style={{ opacity: 0.6 }}>
            <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
          </svg>
          {children}
        </span>
      ) : children}
    </button>
  );
};
