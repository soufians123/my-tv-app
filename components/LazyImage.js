import React, { useState, useRef, useEffect } from 'react'

const LazyImage = React.memo(({ 
  src, 
  alt, 
  className = '', 
  fallback = null,
  onError = null,
  loading = 'lazy',
  ...props 
}) => {
  const [isLoaded, setIsLoaded] = useState(false)
  const [hasError, setHasError] = useState(false)
  const [isInView, setIsInView] = useState(false)
  const imgRef = useRef(null)
  const observerRef = useRef(null)

  useEffect(() => {
    const currentImg = imgRef.current
    
    if (!currentImg || !('IntersectionObserver' in window)) {
      setIsInView(true)
      return
    }

    observerRef.current = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true)
          observerRef.current?.unobserve(currentImg)
        }
      },
      {
        rootMargin: '50px',
        threshold: 0.1
      }
    )

    observerRef.current.observe(currentImg)

    return () => {
      if (observerRef.current && currentImg) {
        observerRef.current.unobserve(currentImg)
      }
    }
  }, [])

  const handleLoad = () => {
    setIsLoaded(true)
  }

  const handleError = (e) => {
    setHasError(true)
    if (onError) {
      onError(e)
    }
  }

  if (hasError && fallback) {
    return fallback
  }

  return (
    <div ref={imgRef} className={`relative ${className}`}>
      {isInView && (
        <img
          src={src}
          alt={alt}
          className={`transition-opacity duration-300 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          } ${className}`}
          loading={loading}
          onLoad={handleLoad}
          onError={handleError}
          {...props}
        />
      )}
      
      {!isLoaded && isInView && (
        <div className={`absolute inset-0 bg-gray-200 animate-pulse ${className}`} />
      )}
    </div>
  )
})

export default LazyImage