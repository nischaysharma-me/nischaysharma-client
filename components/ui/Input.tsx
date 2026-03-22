import React, { useId } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  variant?: 'default' | 'glass' | 'minimal';
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  containerClassName?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ 
    label, 
    error, 
    variant = 'default', 
    leftIcon, 
    rightIcon, 
    className = '', 
    containerClassName = '',
    ...props 
  }, ref) => {
    const id = useId();
    const inputId = props.id || id;

    return (
      <div className={`form-group ${containerClassName}`}>
        {label && (
          <label htmlFor={inputId} className="label">
            {label}
            {props.required && <span className="label__required">*</span>}
          </label>
        )}
        <div className="input-wrapper">
          {leftIcon && <div className="input-icon input-icon--left">{leftIcon}</div>}
          <input
            id={inputId}
            ref={ref}
            className={`input ${variant !== 'default' ? `input--${variant}` : ''} ${
              leftIcon ? 'input--with-left-icon' : ''
            } ${rightIcon ? 'input--with-right-icon' : ''} ${
              error ? 'input--error' : ''
            } ${className}`}
            {...props}
          />
          {rightIcon && <div className="input-icon input-icon--right">{rightIcon}</div>}
        </div>
        {error && <p className="input-error-message">{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
