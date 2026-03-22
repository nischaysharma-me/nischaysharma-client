import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const LoadingSpinner = ({ size = 'md', className = '' }: LoadingSpinnerProps) => {
  const sizeMap = {
    sm: '1rem',
    md: '1.5rem',
    lg: '2.5rem'
  };

  return (
    <div className={`spinner-container ${className}`} style={{ display: 'inline-flex' }}>
      <i 
        className="ph ph-spinner animate-spin" 
        style={{ fontSize: sizeMap[size], opacity: 0.7 }} 
      />
    </div>
  );
};
