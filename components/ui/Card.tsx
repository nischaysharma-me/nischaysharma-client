import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  padded?: boolean;
  variant?: 'default' | 'dark' | 'transparent';
}

export const Card = ({ children, padded = true, variant = 'default', className = '', ...props }: CardProps) => {
  return (
    <div 
      className={`card ${padded ? 'card--padded' : ''} card--${variant} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader = ({ children, className = '', ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={`card__header ${className}`} {...props}>
    {children}
  </div>
);

export const CardContent = ({ children, className = '', ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={`card__content ${className}`} {...props}>
    {children}
  </div>
);

export const CardFooter = ({ children, className = '', ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={`card__footer ${className}`} {...props}>
    {children}
  </div>
);
