import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'minimal' | 'danger' | 'outline';
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md',
  className = '', 
  loading = false,
  leftIcon,
  rightIcon,
  ...props 
}: ButtonProps) => {
  const sizeClass = size === 'full' ? 'btn--full' : `btn--${size}`;
  const variantClass = `btn--${variant}`;
  
  return (
    <button 
      className={`btn ${variantClass} ${sizeClass} ${className} ${loading ? 'btn--loading' : ''}`}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading ? (
        <span className="btn__content">
          <i className="ph ph-spinner animate-spin" style={{ opacity: 0.6 }} />
          {children}
        </span>
      ) : (
        <span className="btn__content">
          {leftIcon && <span className="btn__icon btn__icon--left">{leftIcon}</span>}
          {children}
          {rightIcon && <span className="btn__icon btn__icon--right">{rightIcon}</span>}
        </span>
      )}
    </button>
  );
};
