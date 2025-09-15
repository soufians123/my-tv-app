import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

// Utility function to merge Tailwind CSS classes
export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

// Format date utility
export function formatDate(date, locale = 'ar-SA') {
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(new Date(date))
}

// Format number utility
export function formatNumber(number, locale = 'ar-SA') {
  return new Intl.NumberFormat(locale).format(number)
}

// Debounce utility
export function debounce(func, wait) {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

// Throttle utility
export function throttle(func, limit) {
  let inThrottle
  return function() {
    const args = arguments
    const context = this
    if (!inThrottle) {
      func.apply(context, args)
      inThrottle = true
      setTimeout(() => inThrottle = false, limit)
    }
  }
}

// Generate unique ID
export function generateId() {
  return Math.random().toString(36).substr(2, 9)
}

// Validate email
export function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Validate URL
export function isValidUrl(url) {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

// Copy to clipboard
export async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch (err) {
    // Failed to copy text
    return false
  }
}

// Local storage helpers
export const storage = {
  get: (key, defaultValue = null) => {
    if (typeof window === 'undefined') return defaultValue
    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : defaultValue
    } catch (error) {
      // Error getting localStorage key
      return defaultValue
    }
  },
  
  set: (key, value) => {
    if (typeof window === 'undefined') return
    try {
      window.localStorage.setItem(key, JSON.stringify(value))
    } catch (error) {
      // Error setting localStorage key
    }
  },
  
  remove: (key) => {
    if (typeof window === 'undefined') return
    try {
      window.localStorage.removeItem(key)
    } catch (error) {
      // Error removing localStorage key
    }
  }
}

// API response helpers
export const apiHelpers = {
  handleResponse: async (response) => {
    if (!response.ok) {
      const error = await response.text()
      throw new Error(error || `HTTP error! status: ${response.status}`)
    }
    return response.json()
  },
  
  createHeaders: (token = null) => {
    const headers = {
      'Content-Type': 'application/json'
    }
    
    if (token) {
      headers.Authorization = `Bearer ${token}`
    }
    
    return headers
  }
}

// Form validation helpers
export const validation = {
  required: (value) => {
    if (!value || (typeof value === 'string' && !value.trim())) {
      return 'هذا الحقل مطلوب'
    }
    return null
  },
  
  email: (value) => {
    if (value && !isValidEmail(value)) {
      return 'يرجى إدخال بريد إلكتروني صحيح'
    }
    return null
  },
  
  url: (value) => {
    if (value && !isValidUrl(value)) {
      return 'يرجى إدخال رابط صحيح'
    }
    return null
  },
  
  minLength: (min) => (value) => {
    if (value && value.length < min) {
      return `يجب أن يكون الحد الأدنى ${min} أحرف`
    }
    return null
  },
  
  maxLength: (max) => (value) => {
    if (value && value.length > max) {
      return `يجب أن يكون الحد الأقصى ${max} أحرف`
    }
    return null
  }
}