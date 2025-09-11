import React from 'react';

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