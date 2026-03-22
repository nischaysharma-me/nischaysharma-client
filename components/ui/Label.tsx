import React from 'react';

interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean;
}

export const Label = ({ children, required, className = '', ...props }: LabelProps) => {
  return (
    <label className={`label ${className}`} {...props}>
      {children}
      {required && <span className="label__required">*</span>}
    </label>
  );
};
