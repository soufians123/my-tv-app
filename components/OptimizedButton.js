import { memo, forwardRef } from 'react'
import LoadingSpinner from './LoadingSpinner'

const OptimizedButton = memo(forwardRef(({ 
  children,
  variant = 'primary',
  size = 'medium',
  loading = false,
  disabled = false,
  fullWidth = false,
  leftIcon,
  rightIcon,
  className = '',
  onClick,
  type = 'button',
  ...props 
}, ref) => {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-95'
  
  const variantClasses = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 shadow-lg hover:shadow-xl',
    secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500 shadow-md hover:shadow-lg',
    success: 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500 shadow-lg hover:shadow-xl',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 shadow-lg hover:shadow-xl',
    warning: 'bg-yellow-600 text-white hover:bg-yellow-700 focus:ring-yellow-500 shadow-lg hover:shadow-xl',
    outline: 'border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white focus:ring-blue-500',
    ghost: 'text-blue-600 hover:bg-blue-50 focus:ring-blue-500',
    gradient: 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 focus:ring-blue-500 shadow-lg hover:shadow-xl'
  }
  
  const sizeClasses = {
    small: 'px-3 py-1.5 text-sm',
    medium: 'px-4 py-2 text-base',
    large: 'px-6 py-3 text-lg',
    xl: 'px-8 py-4 text-xl'
  }
  
  const widthClass = fullWidth ? 'w-full' : ''
  
  const buttonClasses = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${widthClass} ${className}`
  
  const isDisabled = disabled || loading
  
  return (
    <button
      ref={ref}
      type={type}
      className={buttonClasses}
      disabled={isDisabled}
      onClick={onClick}
      {...props}
    >
      {loading ? (
        <>
          <LoadingSpinner size="small" color="white" className="ml-2" />
          <span>جاري التحميل...</span>
        </>
      ) : (
        <>
          {leftIcon && (
            <span className="ml-2">
              {leftIcon}
            </span>
          )}
          {children}
          {rightIcon && (
            <span className="mr-2">
              {rightIcon}
            </span>
          )}
        </>
      )}
    </button>
  )
}))

OptimizedButton.displayName = 'OptimizedButton'

export default OptimizedButton

// Icon Button Component
export const IconButton = memo(forwardRef(({ 
  icon,
  variant = 'ghost',
  size = 'medium',
  loading = false,
  disabled = false,
  className = '',
  'aria-label': ariaLabel,
  ...props 
}, ref) => {
  const baseClasses = 'inline-flex items-center justify-center rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-95'
  
  const variantClasses = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 shadow-lg hover:shadow-xl',
    secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500 shadow-md hover:shadow-lg',
    ghost: 'text-gray-600 hover:bg-gray-100 focus:ring-gray-500',
    danger: 'text-red-600 hover:bg-red-50 focus:ring-red-500'
  }
  
  const sizeClasses = {
    small: 'w-8 h-8 p-1',
    medium: 'w-10 h-10 p-2',
    large: 'w-12 h-12 p-3'
  }
  
  const buttonClasses = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`
  
  return (
    <button
      ref={ref}
      type="button"
      className={buttonClasses}
      disabled={disabled || loading}
      aria-label={ariaLabel}
      {...props}
    >
      {loading ? (
        <LoadingSpinner size="small" />
      ) : (
        icon
      )}
    </button>
  )
}))

IconButton.displayName = 'IconButton'

// Button Group Component
export const ButtonGroup = memo(({ 
  children,
  orientation = 'horizontal',
  className = '' 
}) => {
  const orientationClasses = {
    horizontal: 'flex flex-row',
    vertical: 'flex flex-col'
  }
  
  return (
    <div className={`${orientationClasses[orientation]} ${className}`}>
      {children}
    </div>
  )
})

ButtonGroup.displayName = 'ButtonGroup'

// Floating Action Button
export const FloatingActionButton = memo(({ 
  icon,
  onClick,
  className = '',
  position = 'bottom-right',
  ...props 
}) => {
  const positionClasses = {
    'bottom-right': 'fixed bottom-6 right-6',
    'bottom-left': 'fixed bottom-6 left-6',
    'top-right': 'fixed top-20 right-6',
    'top-left': 'fixed top-20 left-6'
  }
  
  return (
    <button
      className={`${positionClasses[position]} w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg hover:shadow-xl hover:bg-blue-700 transition-all duration-300 transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 z-50 ${className}`}
      onClick={onClick}
      {...props}
    >
      {icon}
    </button>
  )
})

FloatingActionButton.displayName = 'FloatingActionButton'