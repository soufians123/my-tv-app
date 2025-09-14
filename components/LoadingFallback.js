import { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'

const LoadingFallback = ({ children, maxLoadingTime = 12000 }) => {
  const { loading, authError } = useAuth()
  const [showFallback, setShowFallback] = useState(false)
  const [timeoutReached, setTimeoutReached] = useState(false)

  useEffect(() => {
    console.log('🔄 LoadingFallback: State changed:', { loading, authError, maxLoadingTime })
    if (loading) {
      console.log('⏰ LoadingFallback: Starting timeout timer...')
      const timer = setTimeout(() => {
        console.log('⚠️ LoadingFallback: Timeout reached, showing fallback')
        setTimeoutReached(true)
        setShowFallback(true)
      }, maxLoadingTime)

      return () => {
        console.log('🔄 LoadingFallback: Clearing timeout timer')
        clearTimeout(timer)
      }
    } else {
      console.log('✅ LoadingFallback: Loading finished, hiding fallback')
      setShowFallback(false)
      setTimeoutReached(false)
    }
  }, [loading, maxLoadingTime])

  // Show fallback if loading takes too long or there's an auth error
  if ((loading && showFallback) || authError) {
    console.log('🚨 LoadingFallback: Showing fallback UI:', { loading, showFallback, authError })
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8 max-w-md mx-auto">
          <div className="mb-6">
            {authError ? (
              <div className="w-16 h-16 mx-auto mb-4 text-red-500">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
            ) : (
              <div className="w-16 h-16 mx-auto mb-4 text-blue-500">
                <svg className="animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
            )}
          </div>
          
          <h2 className="text-xl font-semibold text-gray-900 mb-3">
            {authError ? 'خطأ في التحميل' : 'جاري التحميل...'}
          </h2>
          
          <p className="text-gray-600 mb-6">
            {authError 
              ? `حدث خطأ أثناء تحميل التطبيق: ${authError}`
              : timeoutReached 
                ? 'يستغرق التحميل وقتاً أطول من المعتاد. يرجى الانتظار أو إعادة تحميل الصفحة.'
                : 'يرجى الانتظار بينما نقوم بتحميل التطبيق...'
            }
          </p>
          
          <div className="space-y-3">
            <button 
              onClick={() => window.location.reload()}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              إعادة تحميل الصفحة
            </button>
            
            {(authError || timeoutReached) && (
              <button 
                onClick={() => {
                  setShowFallback(false)
                  setTimeoutReached(false)
                }}
                className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded-lg transition-colors"
              >
                المتابعة بدون مصادقة
              </button>
            )}
          </div>
          
          <div className="mt-6 text-sm text-gray-500">
            <p>إذا استمرت المشكلة، يرجى التحقق من اتصال الإنترنت أو المحاولة لاحقاً.</p>
          </div>
        </div>
      </div>
    )
  }

  // Show normal loading for the first few seconds
  if (loading) {
    console.log('⏳ LoadingFallback: Showing normal loading UI')
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-4 text-blue-500">
            <svg className="animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
          <p className="text-gray-600">جاري التحميل...</p>
        </div>
      </div>
    )
  }

  console.log('✅ LoadingFallback: Rendering children (loading complete)')
  return children
}

export default LoadingFallback