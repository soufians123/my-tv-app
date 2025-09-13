// نظام Cache محسن لتحسين أداء API calls

class APICache {
  constructor() {
    this.cache = new Map()
    this.timestamps = new Map()
    this.defaultTTL = 5 * 60 * 1000 // 5 دقائق افتراضياً
    this.maxSize = 100 // حد أقصى للعناصر المحفوظة
  }

  // إنشاء مفتاح فريد للطلب
  generateKey(endpoint, params = {}) {
    const sortedParams = Object.keys(params)
      .sort()
      .reduce((result, key) => {
        result[key] = params[key]
        return result
      }, {})
    
    return `${endpoint}:${JSON.stringify(sortedParams)}`
  }

  // حفظ البيانات في الـ cache
  set(key, data, ttl = this.defaultTTL) {
    // إزالة العناصر القديمة إذا تجاوز الحد الأقصى
    if (this.cache.size >= this.maxSize) {
      this.cleanup()
    }

    this.cache.set(key, data)
    this.timestamps.set(key, Date.now() + ttl)
  }

  // استرجاع البيانات من الـ cache
  get(key) {
    const timestamp = this.timestamps.get(key)
    
    if (!timestamp || Date.now() > timestamp) {
      // البيانات منتهية الصلاحية
      this.delete(key)
      return null
    }

    return this.cache.get(key)
  }

  // حذف عنصر من الـ cache
  delete(key) {
    this.cache.delete(key)
    this.timestamps.delete(key)
  }

  // تنظيف العناصر المنتهية الصلاحية
  cleanup() {
    const now = Date.now()
    const expiredKeys = []

    for (const [key, timestamp] of this.timestamps.entries()) {
      if (now > timestamp) {
        expiredKeys.push(key)
      }
    }

    expiredKeys.forEach(key => this.delete(key))

    // إذا لم تكن هناك عناصر منتهية الصلاحية، احذف الأقدم
    if (expiredKeys.length === 0 && this.cache.size >= this.maxSize) {
      const oldestKey = this.cache.keys().next().value
      this.delete(oldestKey)
    }
  }

  // مسح كامل للـ cache
  clear() {
    this.cache.clear()
    this.timestamps.clear()
  }

  // إحصائيات الـ cache
  getStats() {
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      keys: Array.from(this.cache.keys())
    }
  }

  // تحديث البيانات في الـ cache
  invalidate(pattern) {
    const keysToDelete = []
    
    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        keysToDelete.push(key)
      }
    }

    keysToDelete.forEach(key => this.delete(key))
  }
}

// إنشاء instance واحد للتطبيق
const apiCache = new APICache()

// وظائف مساعدة للاستخدام السهل
export const cacheGet = (endpoint, params) => {
  const key = apiCache.generateKey(endpoint, params)
  return apiCache.get(key)
}

export const cacheSet = (endpoint, params, data, ttl) => {
  const key = apiCache.generateKey(endpoint, params)
  apiCache.set(key, data, ttl)
}

export const cacheDelete = (endpoint, params) => {
  const key = apiCache.generateKey(endpoint, params)
  apiCache.delete(key)
}

export const cacheInvalidate = (pattern) => {
  apiCache.invalidate(pattern)
}

export const cacheClear = () => {
  apiCache.clear()
}

export const cacheStats = () => {
  return apiCache.getStats()
}

// HOF لتطبيق الـ caching على أي وظيفة API
export const withCache = (apiFunction, ttl = 5 * 60 * 1000) => {
  return async (...args) => {
    const endpoint = apiFunction.name
    const params = args[0] || {}
    
    // محاولة الحصول على البيانات من الـ cache
    const cachedData = cacheGet(endpoint, params)
    if (cachedData) {
      return cachedData
    }

    try {
      // تنفيذ الوظيفة الأصلية
      const result = await apiFunction(...args)
      
      // حفظ النتيجة في الـ cache
      cacheSet(endpoint, params, result, ttl)
      
      return result
    } catch (error) {
      // في حالة الخطأ، لا نحفظ في الـ cache
      throw error
    }
  }
}

export default apiCache