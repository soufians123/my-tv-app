// خدمة البيانات الموحدة
// تجمع جميع خدمات البيانات في واجهة موحدة مع تحسينات الأداء

import { supabase } from './supabase'
import { withCache, cacheInvalidate, cacheGet, cacheSet } from './apiCache'
import { emitChannelEvent, CHANNEL_EVENTS } from './channelEvents'

// مفاتيح التخزين المؤقت
const CACHE_KEYS = {
  CHANNELS: 'channels',
  ARTICLES: 'articles',
  GAMES: 'games',
  ADVERTISEMENTS: 'advertisements',
  SETTINGS: 'settings',
  ANALYTICS: 'analytics'
}

// أوقات انتهاء صلاحية التخزين المؤقت (بالدقائق)
const CACHE_EXPIRY = {
  CHANNELS: 30,
  ARTICLES: 15,
  GAMES: 60,
  ADVERTISEMENTS: 10,
  SETTINGS: 120,
  ANALYTICS: 5
}

class UnifiedDataService {
  constructor() {
    this.isOnline = navigator.onLine
    this.setupNetworkListeners()
  }

  // إعداد مستمعي الشبكة
  setupNetworkListeners() {
    window.addEventListener('online', () => {
      this.isOnline = true
      this.syncOfflineData()
    })
    
    window.addEventListener('offline', () => {
      this.isOnline = false
    })
  }

  // مزامنة البيانات غير المتصلة
  async syncOfflineData() {
    try {
      // مزامنة البيانات المحفوظة محلياً مع الخادم
      const offlineData = localStorage.getItem('offline_changes')
      if (offlineData) {
        const changes = JSON.parse(offlineData)
        await this.processOfflineChanges(changes)
        localStorage.removeItem('offline_changes')
      }
    } catch (error) {
      // خطأ في مزامنة البيانات
    }
  }

  // معالجة التغييرات غير المتصلة
  async processOfflineChanges(changes) {
    for (const change of changes) {
      try {
        switch (change.type) {
          case 'channel_update':
            await this.updateChannel(change.data)
            break
          case 'article_create':
            await this.createArticle(change.data)
            break
          // إضافة المزيد من أنواع التغييرات حسب الحاجة
        }
      } catch (error) {
        // خطأ في معالجة التغيير
      }
    }
  }

  // طريقة عامة للحصول على البيانات مع التخزين المؤقت
  async getData(table, cacheKey, options = {}) {
    try {
      // محاولة الحصول على البيانات من التخزين المؤقت أولاً
      const cachedData = cacheGet(cacheKey)
      if (cachedData && !options.forceRefresh) {
        return cachedData
      }

      // إذا لم تكن متصلاً بالإنترنت، استخدم البيانات المحفوظة محلياً
      if (!this.isOnline) {
        const offlineData = localStorage.getItem(`offline_${cacheKey}`)
        return offlineData ? JSON.parse(offlineData) : []
      }

      // الحصول على البيانات من Supabase
      let query = supabase.from(table).select('*')
      
      // تطبيق المرشحات إذا وجدت
      if (options.filters) {
        Object.entries(options.filters).forEach(([key, value]) => {
          query = query.eq(key, value)
        })
      }

      // تطبيق الترتيب إذا وجد
      if (options.orderBy) {
        query = query.order(options.orderBy.column, { ascending: options.orderBy.ascending })
      }

      // تطبيق التحديد إذا وجد
      if (options.limit) {
        query = query.limit(options.limit)
      }

      const { data, error } = await query
      
      if (error) throw error

      // حفظ البيانات في التخزين المؤقت والتخزين المحلي
      cacheSet(cacheKey, data, CACHE_EXPIRY[cacheKey.toUpperCase()] || 30)
      localStorage.setItem(`offline_${cacheKey}`, JSON.stringify(data))
      
      return data
    } catch (error) {
      // خطأ في الحصول على البيانات
      
      // في حالة الخطأ، محاولة الحصول على البيانات المحفوظة محلياً
      const offlineData = localStorage.getItem(`offline_${cacheKey}`)
      return offlineData ? JSON.parse(offlineData) : []
    }
  }

  // طريقة عامة لإنشاء البيانات
  async createData(table, data, cacheKey) {
    try {
      if (!this.isOnline) {
        // حفظ التغيير للمزامنة لاحقاً
        this.saveOfflineChange({
          type: `${table}_create`,
          data,
          timestamp: new Date().toISOString()
        })
        return { success: true, offline: true }
      }

      const { data: result, error } = await supabase
        .from(table)
        .insert([data])
        .select()

      if (error) throw error

      // إبطال التخزين المؤقت
      cacheInvalidate(cacheKey)
      
      return { success: true, data: result[0] }
    } catch (error) {
      // خطأ في إنشاء البيانات
      throw error
    }
  }

  // طريقة عامة لتحديث البيانات
  async updateData(table, id, data, cacheKey) {
    try {
      if (!this.isOnline) {
        this.saveOfflineChange({
          type: `${table}_update`,
          id,
          data,
          timestamp: new Date().toISOString()
        })
        return { success: true, offline: true }
      }

      const { data: result, error } = await supabase
        .from(table)
        .update(data)
        .eq('id', id)
        .select()

      if (error) throw error

      // إبطال التخزين المؤقت
      cacheInvalidate(cacheKey)
      
      return { success: true, data: result[0] }
    } catch (error) {
      // خطأ في تحديث البيانات
      throw error
    }
  }

  // طريقة عامة لحذف البيانات
  async deleteData(table, id, cacheKey) {
    try {
      if (!this.isOnline) {
        this.saveOfflineChange({
          type: `${table}_delete`,
          id,
          timestamp: new Date().toISOString()
        })
        return { success: true, offline: true }
      }

      const { error } = await supabase
        .from(table)
        .delete()
        .eq('id', id)

      if (error) throw error

      // إبطال التخزين المؤقت
      cacheInvalidate(cacheKey)
      
      return { success: true }
    } catch (error) {
      // خطأ في حذف البيانات
      throw error
    }
  }

  // حفظ التغيير للمزامنة لاحقاً
  saveOfflineChange(change) {
    const existingChanges = localStorage.getItem('offline_changes')
    const changes = existingChanges ? JSON.parse(existingChanges) : []
    changes.push(change)
    localStorage.setItem('offline_changes', JSON.stringify(changes))
  }

  // خدمات القنوات
  async getChannels(options = {}) {
    return this.getData('channels', CACHE_KEYS.CHANNELS, options)
  }

  async createChannel(channelData) {
    const result = await this.createData('channels', channelData, CACHE_KEYS.CHANNELS)
    if (result.success) {
      emitChannelEvent(CHANNEL_EVENTS.CHANNEL_ADDED, result.data)
    }
    return result
  }

  async updateChannel(id, channelData) {
    const result = await this.updateData('channels', id, channelData, CACHE_KEYS.CHANNELS)
    if (result.success) {
      emitChannelEvent(CHANNEL_EVENTS.CHANNEL_UPDATED, result.data)
    }
    return result
  }

  async deleteChannel(id) {
    const result = await this.deleteData('channels', id, CACHE_KEYS.CHANNELS)
    if (result.success) {
      emitChannelEvent(CHANNEL_EVENTS.CHANNEL_DELETED, { id })
    }
    return result
  }

  // خدمات المقالات
  async getArticles(options = {}) {
    return this.getData('articles', CACHE_KEYS.ARTICLES, options)
  }

  async createArticle(articleData) {
    return this.createData('articles', articleData, CACHE_KEYS.ARTICLES)
  }

  async updateArticle(id, articleData) {
    return this.updateData('articles', id, articleData, CACHE_KEYS.ARTICLES)
  }

  async deleteArticle(id) {
    return this.deleteData('articles', id, CACHE_KEYS.ARTICLES)
  }

  // خدمات الألعاب
  async getGames(options = {}) {
    return this.getData('games', CACHE_KEYS.GAMES, options)
  }

  async createGame(gameData) {
    return this.createData('games', gameData, CACHE_KEYS.GAMES)
  }

  async updateGame(id, gameData) {
    return this.updateData('games', id, gameData, CACHE_KEYS.GAMES)
  }

  async deleteGame(id) {
    return this.deleteData('games', id, CACHE_KEYS.GAMES)
  }

  // خدمات الإعلانات
  async getAdvertisements(options = {}) {
    return this.getData('advertisements', CACHE_KEYS.ADVERTISEMENTS, options)
  }

  async createAdvertisement(adData) {
    return this.createData('advertisements', adData, CACHE_KEYS.ADVERTISEMENTS)
  }

  async updateAdvertisement(id, adData) {
    return this.updateData('advertisements', id, adData, CACHE_KEYS.ADVERTISEMENTS)
  }

  async deleteAdvertisement(id) {
    return this.deleteData('advertisements', id, CACHE_KEYS.ADVERTISEMENTS)
  }

  // خدمات الإعدادات
  async getSettings(options = {}) {
    return this.getData('settings', CACHE_KEYS.SETTINGS, options)
  }

  async updateSettings(settingsData) {
    return this.updateData('settings', 1, settingsData, CACHE_KEYS.SETTINGS)
  }

  // خدمات التحليلات
  async getAnalytics(options = {}) {
    return this.getData('analytics', CACHE_KEYS.ANALYTICS, options)
  }

  // تنظيف التخزين المؤقت
  clearCache(cacheKey = null) {
    if (cacheKey) {
      cacheInvalidate(cacheKey)
    } else {
      // تنظيف جميع البيانات المؤقتة
      Object.values(CACHE_KEYS).forEach(key => {
        cacheInvalidate(key)
      })
    }
  }

  // إحصائيات الأداء
  getPerformanceStats() {
    const stats = {
      cacheHits: 0,
      cacheMisses: 0,
      offlineOperations: 0,
      networkRequests: 0
    }

    // يمكن تحسين هذا لتتبع الإحصائيات الفعلية
    return stats
  }
}

// إنشاء مثيل واحد من الخدمة
const unifiedDataService = new UnifiedDataService()

export default unifiedDataService
export { UnifiedDataService, CACHE_KEYS, CACHE_EXPIRY }