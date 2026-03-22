import React from 'react';

interface SkeletonProps {
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
  className?: string;
}

export const Skeleton = ({ variant = 'text', width, height, className = '' }: SkeletonProps) => {
  const styles: React.CSSProperties = {
    width: width,
    height: height,
  };

  return (
    <div 
      className={`skeleton skeleton--${variant} ${className}`} 
      style={styles}
    />
  );
};
