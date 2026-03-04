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
          <i className="ph ph-spinner animate-spin" style={{ opacity: 0.6 }} />
          {children}
        </span>
      ) : children}
    </button>
  );
};
