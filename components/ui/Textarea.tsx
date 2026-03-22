import React, { useId } from 'react';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  variant?: 'default' | 'glass' | 'minimal';
  containerClassName?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, variant = 'default', className = '', containerClassName = '', ...props }, ref) => {
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
        <textarea
          id={inputId}
          ref={ref}
          className={`input input--textarea ${variant !== 'default' ? `input--${variant}` : ''} ${
            error ? 'input--error' : ''
          } ${className}`}
          {...props}
        />
        {error && <p className="input-error-message">{error}</p>}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';
