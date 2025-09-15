import React, { useEffect, useState } from 'react';

// Enhanced Skeleton Loader Component
export const SkeletonLoader = ({ className = '', width = 'w-full', height = 'h-4' }) => {
  return (
    <div className={`${width} ${height} bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-pulse rounded-lg ${className} relative overflow-hidden`}>
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent animate-shimmer bg-[length:200%_100%]"></div>
    </div>
  );
};

// Channel Card Skeleton
export const ChannelCardSkeleton = () => {
  return (
    <div className="card-glass p-6 animate-pulse">
      <div className="flex items-center space-x-4 rtl:space-x-reverse">
        <SkeletonLoader width="w-12" height="h-12" className="rounded-full" />
        <div className="flex-1 space-y-2">
          <SkeletonLoader width="w-3/4" height="h-5" />
          <SkeletonLoader width="w-1/2" height="h-4" />
        </div>
      </div>
      <div className="mt-4 space-y-2">
        <SkeletonLoader width="w-full" height="h-3" />
        <SkeletonLoader width="w-2/3" height="h-3" />
      </div>
      <div className="mt-4 flex justify-between items-center">
        <SkeletonLoader width="w-16" height="h-6" className="rounded-full" />
        <SkeletonLoader width="w-20" height="h-8" className="rounded-lg" />
      </div>
    </div>
  );
};

// Video Player Skeleton
export const VideoPlayerSkeleton = () => {
  return (
    <div className="card-glass p-6 animate-pulse">
      <SkeletonLoader width="w-full" height="h-64" className="rounded-2xl mb-4" />
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3 rtl:space-x-reverse">
          <SkeletonLoader width="w-10" height="h-10" className="rounded-full" />
          <div className="space-y-2">
            <SkeletonLoader width="w-32" height="h-5" />
            <SkeletonLoader width="w-24" height="h-4" />
          </div>
        </div>
        <SkeletonLoader width="w-16" height="h-6" className="rounded-full" />
      </div>
      <div className="flex space-x-2 rtl:space-x-reverse">
        <SkeletonLoader width="w-20" height="h-10" className="rounded-lg" />
        <SkeletonLoader width="w-20" height="h-10" className="rounded-lg" />
        <SkeletonLoader width="w-24" height="h-10" className="rounded-lg" />
      </div>
    </div>
  );
};

// Stats Card Skeleton
export const StatsCardSkeleton = () => {
  return (
    <div className="card-glass p-6 animate-pulse">
      <div className="flex items-center space-x-4 rtl:space-x-reverse">
        <SkeletonLoader width="w-12" height="h-12" className="rounded-xl" />
        <div className="flex-1 space-y-2">
          <SkeletonLoader width="w-16" height="h-8" />
          <SkeletonLoader width="w-20" height="h-4" />
        </div>
      </div>
      <div className="mt-4">
        <SkeletonLoader width="w-full" height="h-2" className="rounded-full" />
      </div>
    </div>
  );
};

// Stat Card Skeleton (alias for compatibility)
export const StatCardSkeleton = StatsCardSkeleton;

// Enhanced Page Loading Spinner
export const PageLoader = ({ message = 'جاري التحميل...' }) => {
  return (
    <div className="fixed inset-0 bg-gradient-to-br from-primary-50/90 to-secondary-50/90 backdrop-blur-lg z-50 flex items-center justify-center animate-fade-in">
      <div className="text-center bg-white/80 backdrop-blur-md rounded-3xl p-8 shadow-glow border border-white/30">
        <div className="relative mb-8">
          <div className="w-24 h-24 border-4 border-primary-200/50 rounded-full animate-spin">
            <div className="absolute top-0 left-0 w-24 h-24 border-4 border-transparent border-t-primary-600 rounded-full animate-spin shadow-glow"></div>
          </div>
          <div className="absolute inset-0 w-24 h-24 border-4 border-transparent border-r-secondary-600 rounded-full animate-spin" style={{animationDirection: 'reverse', animationDuration: '1.5s'}}></div>
          <div className="absolute inset-2 w-20 h-20 bg-gradient-to-br from-primary-100 to-secondary-100 rounded-full animate-pulse"></div>
        </div>
        <h3 className="text-xl font-bold text-gradient bg-gradient-to-r from-primary-600 to-secondary-600 mb-4">{message}</h3>
        <div className="flex items-center justify-center space-x-2 rtl:space-x-reverse">
          <div className="w-3 h-3 bg-gradient-to-r from-primary-500 to-primary-600 rounded-full animate-bounce-gentle shadow-soft" style={{animationDelay: '0ms'}}></div>
          <div className="w-3 h-3 bg-gradient-to-r from-secondary-500 to-secondary-600 rounded-full animate-bounce-gentle shadow-soft" style={{animationDelay: '200ms'}}></div>
          <div className="w-3 h-3 bg-gradient-to-r from-accent-500 to-accent-600 rounded-full animate-bounce-gentle shadow-soft" style={{animationDelay: '400ms'}}></div>
        </div>
      </div>
    </div>
  );
};

// Enhanced Loading Fallback with Timeout
export const LoadingFallback = ({ children, maxLoadingTime = 12000, loading = false, authError = null }) => {
  const [showFallback, setShowFallback] = useState(false);
  const [timeoutReached, setTimeoutReached] = useState(false);

  useEffect(() => {
    if (loading) {
      const timer = setTimeout(() => {
        setTimeoutReached(true);
        setShowFallback(true);
      }, maxLoadingTime);

      return () => clearTimeout(timer);
    } else {
      setShowFallback(false);
      setTimeoutReached(false);
    }
  }, [loading, maxLoadingTime]);

  // Show fallback if loading takes too long or there's an auth error
  if ((loading && showFallback) || authError) {
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
                  setShowFallback(false);
                  setTimeoutReached(false);
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
    );
  }

  // Show normal loading for the first few seconds
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <PageLoader />
        </div>
      </div>
    );
  }

  return children;
};

// Button Loading State
export const ButtonLoader = ({ size = 'sm' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  return (
    <div className={`${sizeClasses[size]} border-2 border-white/30 border-t-white rounded-full animate-spin`}></div>
  );
};

// Content Loading Placeholder
export const ContentLoader = ({ lines = 3, showAvatar = false }) => {
  return (
    <div className="animate-pulse">
      {showAvatar && (
        <div className="flex items-center space-x-4 rtl:space-x-reverse mb-4">
          <SkeletonLoader width="w-12" height="h-12" className="rounded-full" />
          <div className="space-y-2">
            <SkeletonLoader width="w-32" height="h-4" />
            <SkeletonLoader width="w-24" height="h-3" />
          </div>
        </div>
      )}
      <div className="space-y-3">
        {Array.from({ length: lines }).map((_, index) => (
          <SkeletonLoader 
            key={`skeleton-${index}`} 
            width={index === lines - 1 ? 'w-2/3' : 'w-full'} 
            height="h-4" 
          />
        ))}
      </div>
    </div>
  );
};

// Grid Loading
export const GridLoader = ({ items = 6, component: Component = ChannelCardSkeleton }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: items }).map((_, index) => (
        <Component key={`grid-item-${index}`} />
      ))}
    </div>
  );
};

// Loading States Hook
export const useLoadingStates = () => {
  const [loadingStates, setLoadingStates] = React.useState({});

  const setLoading = (key, isLoading) => {
    setLoadingStates(prev => ({
      ...prev,
      [key]: isLoading
    }));
  };

  const isLoading = (key) => {
    return loadingStates[key] || false;
  };

  return { setLoading, isLoading };
};