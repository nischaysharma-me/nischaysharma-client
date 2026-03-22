import React, { useId } from 'react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  variant?: 'default' | 'glass' | 'minimal';
  containerClassName?: string;
  options?: { value: string; label: string }[];
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, variant = 'default', options, className = '', containerClassName = '', children, ...props }, ref) => {
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
        <select
          id={inputId}
          ref={ref}
          className={`input select ${variant !== 'default' ? `input--${variant}` : ''} ${
            error ? 'input--error' : ''
          } ${className}`}
          {...props}
        >
          {options ? options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          )) : children}
        </select>
        {error && <p className="input-error-message">{error}</p>}
      </div>
    );
  }
);

Select.displayName = 'Select';
