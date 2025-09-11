import React from 'react';

export const Alert = ({ children, className = '', variant = 'default', ...props }) => {
  const base = 'relative w-full rounded-lg border p-4 text-sm';
  const variants = {
    default: 'border-blue-200 bg-blue-50 text-blue-900',
    success: 'border-green-200 bg-green-50 text-green-900',
    destructive: 'border-red-200 bg-red-50 text-red-900',
    warning: 'border-yellow-200 bg-yellow-50 text-yellow-900',
    info: 'border-sky-200 bg-sky-50 text-sky-900'
  };

  const classes = `${base} ${variants[variant] || variants.default} ${className}`;

  return (
    <div className={classes} role="alert" {...props}>
      {children}
    </div>
  );
};

export const AlertDescription = ({ children, className = '', ...props }) => {
  return (
    <div className={`text-sm leading-relaxed ${className}`} {...props}>
      {children}
    </div>
  );
};