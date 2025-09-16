// Performance optimization utilities

// Debounce function for search and input optimization
export const debounce = (func, wait, immediate = false) => {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      timeout = null
      if (!immediate) func(...args)
    }
    const callNow = immediate && !timeout
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
    if (callNow) func(...args)
  }
}

// Throttle function for scroll and resize events
export const throttle = (func, limit) => {
  let inThrottle
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args)
      inThrottle = true
      setTimeout(() => inThrottle = false, limit)
    }
  }
}

// Cache implementation for API responses
class Cache {
  constructor(maxSize = 100, ttl = 5 * 60 * 1000) { // 5 minutes default TTL
    this.cache = new Map()
    this.maxSize = maxSize
    this.ttl = ttl
  }

  set(key, value) {
    // Remove oldest entries if cache is full
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value
      this.cache.delete(firstKey)
    }

    this.cache.set(key, {
      value,
      timestamp: Date.now()
    })
  }

  get(key) {
    const item = this.cache.get(key)
    if (!item) return null

    // Check if item has expired
    if (Date.now() - item.timestamp > this.ttl) {
      this.cache.delete(key)
      return null
    }

    return item.value
  }

  has(key) {
    return this.get(key) !== null
  }

  delete(key) {
    return this.cache.delete(key)
  }

  clear() {
    this.cache.clear()
  }

  size() {
    return this.cache.size
  }
}

// Global cache instances
export const apiCache = new Cache(50, 5 * 60 * 1000) // 5 minutes
export const imageCache = new Cache(100, 30 * 60 * 1000) // 30 minutes
export const userCache = new Cache(20, 10 * 60 * 1000) // 10 minutes

// Memoization for expensive calculations
export const memoize = (fn, getKey = (...args) => JSON.stringify(args)) => {
  const cache = new Map()
  
  return (...args) => {
    const key = getKey(...args)
    
    if (cache.has(key)) {
      return cache.get(key)
    }
    
    const result = fn(...args)
    cache.set(key, result)
    
    return result
  }
}

// Lazy loading utility for images
export const createIntersectionObserver = (callback, options = {}) => {
  const defaultOptions = {
    root: null,
    rootMargin: '50px',
    threshold: 0.1
  }

  return new IntersectionObserver(callback, { ...defaultOptions, ...options })
}

// Performance monitoring
export const performanceMonitor = {
  // Measure function execution time
  measureTime: (name, fn) => {
    return async (...args) => {
      const start = performance.now()
      const result = await fn(...args)
      const end = performance.now()
      console.log(`${name} took ${end - start} milliseconds`)
      return result
    }
  },

  // Mark performance milestones
  mark: (name) => {
    if (typeof performance !== 'undefined' && performance.mark) {
      performance.mark(name)
    }
  },

  // Measure between two marks
  measure: (name, startMark, endMark) => {
    if (typeof performance !== 'undefined' && performance.measure) {
      performance.measure(name, startMark, endMark)
    }
  },

  // Get performance entries
  getEntries: (type) => {
    if (typeof performance !== 'undefined' && performance.getEntriesByType) {
      return performance.getEntriesByType(type)
    }
    return []
  }
}

// Bundle size optimization - dynamic imports
export const loadComponent = (importFn) => {
  return React.lazy(() => {
    return importFn().catch(err => {
      console.error('Failed to load component:', err)
      // Return a fallback component
      return { default: () => React.createElement('div', null, 'فشل في تحميل المكون') }
    })
  })
}

// Preload critical resources
export const preloadResource = (href, as = 'script', crossorigin = null) => {
  if (typeof document === 'undefined') return

  const link = document.createElement('link')
  link.rel = 'preload'
  link.href = href
  link.as = as
  if (crossorigin) link.crossOrigin = crossorigin
  
  document.head.appendChild(link)
}

// Optimize images for different screen sizes
export const getOptimizedImageUrl = (baseUrl, width, quality = 75) => {
  if (!baseUrl) return ''
  
  // If it's already optimized or external URL, return as is
  if (baseUrl.includes('?') || baseUrl.startsWith('http')) {
    return baseUrl
  }
  
  return `${baseUrl}?w=${width}&q=${quality}`
}

// Local storage with expiration
export const storage = {
  set: (key, value, ttl = 24 * 60 * 60 * 1000) => { // 24 hours default
    if (typeof window === 'undefined') return
    
    const item = {
      value,
      timestamp: Date.now(),
      ttl
    }
    
    try {
      localStorage.setItem(key, JSON.stringify(item))
    } catch (error) {
      console.warn('Failed to save to localStorage:', error)
    }
  },

  get: (key) => {
    if (typeof window === 'undefined') return null
    
    try {
      const item = localStorage.getItem(key)
      if (!item) return null
      
      const parsed = JSON.parse(item)
      
      // Check if expired
      if (Date.now() - parsed.timestamp > parsed.ttl) {
        localStorage.removeItem(key)
        return null
      }
      
      return parsed.value
    } catch (error) {
      console.warn('Failed to read from localStorage:', error)
      return null
    }
  },

  remove: (key) => {
    if (typeof window === 'undefined') return
    localStorage.removeItem(key)
  },

  clear: () => {
    if (typeof window === 'undefined') return
    localStorage.clear()
  }
}

// Network status detection
export const networkStatus = {
  isOnline: () => {
    return typeof navigator !== 'undefined' ? navigator.onLine : true
  },

  getConnectionType: () => {
    if (typeof navigator === 'undefined' || !navigator.connection) {
      return 'unknown'
    }
    return navigator.connection.effectiveType || 'unknown'
  },

  isSlowConnection: () => {
    const connectionType = networkStatus.getConnectionType()
    return ['slow-2g', '2g'].includes(connectionType)
  }
}

// Resource hints for better performance
export const addResourceHints = () => {
  if (typeof document === 'undefined') return

  // DNS prefetch for external domains
  const domains = [
    'fonts.googleapis.com',
    'fonts.gstatic.com'
  ]

  domains.forEach(domain => {
    const link = document.createElement('link')
    link.rel = 'dns-prefetch'
    link.href = `//${domain}`
    document.head.appendChild(link)
  })
}