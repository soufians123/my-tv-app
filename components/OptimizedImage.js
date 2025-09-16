import { useState, useCallback, memo } from 'react'
import Image from 'next/image'
import { SkeletonLoader } from './LoadingSpinner'

const OptimizedImage = memo(({ 
  src, 
  alt, 
  width, 
  height, 
  className = '', 
  priority = false,
  quality = 75,
  placeholder = 'blur',
  blurDataURL,
  onLoad,
  onError,
  ...props 
}) => {
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  const handleLoad = useCallback((event) => {
    setIsLoading(false)
    onLoad?.(event)
  }, [onLoad])

  const handleError = useCallback((event) => {
    setIsLoading(false)
    setHasError(true)
    onError?.(event)
  }, [onError])

  // Generate a simple blur placeholder if none provided
  const defaultBlurDataURL = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k='

  if (hasError) {
    return (
      <div 
        className={`flex items-center justify-center bg-gray-200 text-gray-500 ${className}`}
        style={{ width, height }}
      >
        <svg 
          className="w-8 h-8" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" 
          />
        </svg>
      </div>
    )
  }

  return (
    <div className={`relative ${className}`}>
      {isLoading && (
        <div 
          className="absolute inset-0 flex items-center justify-center bg-gray-100"
          style={{ width, height }}
        >
          <SkeletonLoader lines={1} className="w-full h-full" />
        </div>
      )}
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        priority={priority}
        quality={quality}
        placeholder={placeholder}
        blurDataURL={blurDataURL || defaultBlurDataURL}
        onLoad={handleLoad}
        onError={handleError}
        className={`transition-opacity duration-300 ${
          isLoading ? 'opacity-0' : 'opacity-100'
        }`}
        {...props}
      />
    </div>
  )
})

OptimizedImage.displayName = 'OptimizedImage'

export default OptimizedImage

// Avatar component with optimized loading
export const Avatar = memo(({ 
  src, 
  alt, 
  size = 'medium', 
  fallback,
  className = '' 
}) => {
  const [hasError, setHasError] = useState(false)

  const sizeClasses = {
    small: 'w-8 h-8',
    medium: 'w-12 h-12',
    large: 'w-16 h-16',
    xl: 'w-24 h-24'
  }

  const handleError = useCallback(() => {
    setHasError(true)
  }, [])

  if (hasError || !src) {
    return (
      <div 
        className={`${sizeClasses[size]} rounded-full bg-gray-300 flex items-center justify-center text-gray-600 ${className}`}
      >
        {fallback || (
          <svg className="w-1/2 h-1/2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
          </svg>
        )}
      </div>
    )
  }

  return (
    <OptimizedImage
      src={src}
      alt={alt}
      width={size === 'small' ? 32 : size === 'medium' ? 48 : size === 'large' ? 64 : 96}
      height={size === 'small' ? 32 : size === 'medium' ? 48 : size === 'large' ? 64 : 96}
      className={`${sizeClasses[size]} rounded-full object-cover ${className}`}
      onError={handleError}
    />
  )
})

Avatar.displayName = 'Avatar'