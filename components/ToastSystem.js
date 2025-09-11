import { useState, useEffect, createContext, useContext } from 'react'
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react'

// Toast Context
const ToastContext = createContext()

// Toast Types
const TOAST_TYPES = {
  success: {
    icon: CheckCircle,
    className: 'toast-success',
    bgColor: 'from-success-500 to-success-600',
    iconColor: 'text-success-600'
  },
  error: {
    icon: AlertCircle,
    className: 'toast-error',
    bgColor: 'from-error-500 to-error-600',
    iconColor: 'text-error-600'
  },
  warning: {
    icon: AlertTriangle,
    className: 'toast-warning',
    bgColor: 'from-warning-500 to-warning-600',
    iconColor: 'text-warning-600'
  },
  info: {
    icon: Info,
    className: 'toast-info',
    bgColor: 'from-primary-500 to-primary-600',
    iconColor: 'text-primary-600'
  }
}

// Toast Component
const Toast = ({ toast, onRemove }) => {
  const [isVisible, setIsVisible] = useState(false)
  const [isRemoving, setIsRemoving] = useState(false)
  const toastType = TOAST_TYPES[toast.type] || TOAST_TYPES.info
  const Icon = toastType.icon

  useEffect(() => {
    // Animate in
    const timer = setTimeout(() => setIsVisible(true), 50)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (toast.duration && toast.duration > 0) {
      const timer = setTimeout(() => {
        handleRemove()
      }, toast.duration)
      return () => clearTimeout(timer)
    }
  }, [toast.duration])

  const handleRemove = () => {
    setIsRemoving(true)
    setTimeout(() => {
      onRemove(toast.id)
    }, 300)
  }

  return (
    <div
      className={`
        fixed top-4 right-4 z-50 max-w-sm w-full mx-4 sm:mx-0
        transform transition-all duration-300 ease-out
        ${
          isVisible && !isRemoving
            ? 'translate-x-0 opacity-100 scale-100'
            : isRemoving
            ? 'translate-x-full opacity-0 scale-95'
            : 'translate-x-full opacity-0 scale-95'
        }
      `}
      style={{ top: `${4 + toast.index * 80}px` }}
    >
      <div className={`
        relative overflow-hidden rounded-2xl shadow-strong backdrop-blur-sm border
        bg-white/95 border-gray-200/50
        hover:shadow-glow transition-all duration-300
        animate-bounce-in
      `}>
        {/* Gradient Border */}
        <div className={`absolute inset-0 bg-gradient-to-r ${toastType.bgColor} opacity-10 rounded-2xl`} />
        
        {/* Progress Bar */}
        {toast.duration && toast.duration > 0 && (
          <div className="absolute top-0 left-0 right-0 h-1 bg-gray-200/50 overflow-hidden">
            <div 
              className={`h-full bg-gradient-to-r ${toastType.bgColor} animate-progress`}
              style={{
                animation: `progress ${toast.duration}ms linear forwards`
              }}
            />
          </div>
        )}

        <div className="relative p-4">
          <div className="flex items-start gap-3">
            {/* Icon */}
            <div className={`flex-shrink-0 p-2 rounded-xl bg-gradient-to-r ${toastType.bgColor} bg-opacity-10`}>
              <Icon className={`w-5 h-5 ${toastType.iconColor}`} />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              {toast.title && (
                <h4 className="text-sm font-semibold text-gray-900 mb-1 leading-tight">
                  {toast.title}
                </h4>
              )}
              <p className="text-sm text-gray-700 leading-relaxed">
                {toast.message}
              </p>
              {toast.action && (
                <button
                  onClick={toast.action.onClick}
                  className={`
                    mt-2 text-xs font-medium px-3 py-1 rounded-lg
                    bg-gradient-to-r ${toastType.bgColor} text-white
                    hover:shadow-medium transition-all duration-200
                    transform hover:scale-105 active:scale-95
                  `}
                >
                  {toast.action.label}
                </button>
              )}
            </div>

            {/* Close Button */}
            <button
              onClick={handleRemove}
              className="
                flex-shrink-0 p-1 rounded-lg text-gray-400 hover:text-gray-600
                hover:bg-gray-100 transition-all duration-200
                transform hover:scale-110 active:scale-95
              "
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// Toast Container
const ToastContainer = ({ toasts, onRemove }) => {
  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {toasts.map((toast, index) => (
        <Toast
          key={toast.id}
          toast={{ ...toast, index }}
          onRemove={onRemove}
        />
      ))}
    </div>
  )
}

// Toast Provider
export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([])

  const addToast = (toast) => {
    const id = Date.now() + Math.random()
    const newToast = {
      id,
      type: 'info',
      duration: 5000,
      ...toast
    }
    
    setToasts(prev => [...prev, newToast])
    return id
  }

  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }

  const clearAllToasts = () => {
    setToasts([])
  }

  // Toast methods
  const showToast = (message, type = 'info', options = {}) => {
    addToast({ ...options, message, type })
  }

  const toast = {
    success: (message, options = {}) => addToast({ ...options, message, type: 'success' }),
    error: (message, options = {}) => addToast({ ...options, message, type: 'error' }),
    warning: (message, options = {}) => addToast({ ...options, message, type: 'warning' }),
    info: (message, options = {}) => addToast({ ...options, message, type: 'info' }),
    custom: (options) => addToast(options),
    remove: removeToast,
    clear: clearAllToasts,
    showToast
  }

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  )
}

// Hook to use toast
export const useToast = () => {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}

// CSS Animations (to be added to globals.css)
export const toastAnimations = `
  @keyframes progress {
    from { width: 100%; }
    to { width: 0%; }
  }
  
  @keyframes bounce-in {
    0% {
      transform: scale(0.3) rotate(10deg);
      opacity: 0;
    }
    50% {
      transform: scale(1.05) rotate(-5deg);
    }
    70% {
      transform: scale(0.9) rotate(2deg);
    }
    100% {
      transform: scale(1) rotate(0deg);
      opacity: 1;
    }
  }
  
  .animate-progress {
    animation: progress linear forwards;
  }
  
  .animate-bounce-in {
    animation: bounce-in 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  }
`

export default ToastProvider