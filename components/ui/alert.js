import React from 'react';

export const Alert = ({ 
  children, 
  className = '', 
  variant = 'default',
  ...props 
}) => {
  const baseClasses = 'relative w-full rounded-lg border p-4';
  
  const variants = {
    default: 'bg-background text-foreground border-border',
    destructive: 'border-destructive/50 text-destructive dark:border-destructive [&>svg]:text-destructive',
    success: 'border-green-500/50 text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-950/50',
    warning: 'border-yellow-500/50 text-yellow-700 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-950/50',
    info: 'border-blue-500/50 text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50'
  };
  
  return (
    <div 
      className={`${baseClasses} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export const AlertDescription = ({ children, className = '', ...props }) => {
  return (
    <div className={`text-sm [&_p]:leading-relaxed ${className}`} {...props}>
      {children}
    </div>
  );
};

export const AlertTitle = ({ children, className = '', ...props }) => {
  return (
    <h5 className={`mb-1 font-medium leading-none tracking-tight ${className}`} {...props}>
      {children}
    </h5>
  );
};