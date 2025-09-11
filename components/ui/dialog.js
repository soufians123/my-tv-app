import React, { createContext, useContext, useState, useEffect } from 'react';

const DialogContext = createContext();

export const Dialog = ({ children, open, onOpenChange }) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const isOpen = open !== undefined ? open : internalOpen;
  
  const handleOpenChange = (newOpen) => {
    if (open === undefined) {
      setInternalOpen(newOpen);
    }
    if (onOpenChange) {
      onOpenChange(newOpen);
    }
  };
  
  return (
    <DialogContext.Provider value={{ open: isOpen, onOpenChange: handleOpenChange }}>
      {children}
    </DialogContext.Provider>
  );
};

export const DialogTrigger = ({ children, asChild = false, ...props }) => {
  const context = useContext(DialogContext);
  
  if (asChild) {
    return React.cloneElement(children, {
      onClick: () => context?.onOpenChange(true),
      ...props
    });
  }
  
  return (
    <button 
      onClick={() => context?.onOpenChange(true)}
      {...props}
    >
      {children}
    </button>
  );
};

export const DialogContent = ({ children, className = '', ...props }) => {
  const context = useContext(DialogContext);
  
  useEffect(() => {
    if (context?.open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [context?.open]);
  
  if (!context?.open) return null;
  
  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm bg-black/50"
        onClick={() => context?.onOpenChange(false)}
      />
      
      {/* Dialog */}
      <div className="fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 sm:rounded-lg bg-white border-gray-200">
        <div 
          className={`${className}`}
          {...props}
        >
          {children}
        </div>
      </div>
    </>
  );
};

export const DialogHeader = ({ children, className = '', ...props }) => {
  return (
    <div 
      className={`flex flex-col space-y-1.5 text-center sm:text-left ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export const DialogTitle = ({ children, className = '', ...props }) => {
  return (
    <h2 
      className={`text-lg font-semibold leading-none tracking-tight ${className}`}
      {...props}
    >
      {children}
    </h2>
  );
};