import React, { useId } from 'react';

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, error, className = '', ...props }, ref) => {
    const id = useId();
    const checkboxId = props.id || id;

    return (
      <div className="form-group-checkbox">
        <div className="checkbox-wrapper">
          <input
            type="checkbox"
            id={checkboxId}
            ref={ref}
            className={`checkbox ${error ? 'checkbox--error' : ''} ${className}`}
            {...props}
          />
          {label && (
            <label htmlFor={checkboxId} className="checkbox-label">
              {label}
            </label>
          )}
        </div>
        {error && <p className="input-error-message">{error}</p>}
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox';
