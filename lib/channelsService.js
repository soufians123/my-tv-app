// خدمة إدارة القنوات التلفزيونية
// تستخدم localStorage لحفظ البيانات ومشاركتها بين الصفحات

import { emitChannelEvent, CHANNEL_EVENTS } from './channelEvents'
import { withCache, cacheInvalidate, cacheGet, cacheSet } from './apiCache'

const CHANNELS_STORAGE_KEY = 'zomiga_channels'
const CHANNELS_VERSION_KEY = 'zomiga_channels_version'

// البيانات الافتراضية للقنوات
const defaultChannels = [
  {
    id: 1,
    name: 'الجزيرة',
    category: 'إخبارية',
    url: 'https://live-hls-web-aja.getaj.net/AJA/index.m3u8',
    logo: 'https://i.imgur.com/BB93NQP.png',
    status: 'active',
    viewers: 5200000,
    favorites: 8930,
    country: 'قطر',
    language: 'العربية',
    quality: 'HD',
    createdAt: '2024-01-15',
    lastUpdated: '2024-01-20',
    description: 'قناة إخبارية عربية رائدة تقدم تغطية شاملة للأحداث العالمية والعربية',
    rating: 4.8
  },
  {
    id: 2,
    name: 'العربية',
    category: 'إخبارية',
    url: 'https://live.alarabiya.net/alarabiapublish/alarabiya.smil/playlist.m3u8',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Al-Arabiya_new_logo.svg/640px-Al-Arabiya_new_logo.svg.png',
    status: 'active',
    viewers: 4800000,
    favorites: 6780,
    country: 'السعودية',
    language: 'العربية',
    quality: 'HD',
    createdAt: '2024-01-10',
    lastUpdated: '2024-01-18',
    description: 'قناة إخبارية عربية تقدم آخر الأخبار والتحليلات السياسية والاقتصادية',
    rating: 4.7
  },
  {
    id: 3,
    name: 'MBC 1',
    category: 'عامة',
    url: 'https://shls-mbc1ksa-prod-dub.shahid.net/out/v1/451b666db1fb41c7a4bbecf7b4865107/index.m3u8',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/MBC1_logo.svg/512px-MBC1_logo.svg.png',
    status: 'active',
    viewers: 6200000,
    favorites: 12400,
    country: 'السعودية',
    language: 'العربية',
    quality: 'HD',
    createdAt: '2024-01-05',
    lastUpdated: '2024-01-19',
    description: 'قناة ترفيهية عامة تقدم أفضل المسلسلات والبرامج العربية',
    rating: 4.9
  },
  {
    id: 4,
    name: 'بي إن سبورت 1',
    category: 'رياضية',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/82/Bein_Sports_logo.svg/512px-Bein_Sports_logo.svg.png',
    status: 'active',
    viewers: 8500000,
    favorites: 15600,
    country: 'قطر',
    language: 'العربية',
    quality: 'HD',
    createdAt: '2024-01-08',
    lastUpdated: '2024-01-17',
    description: 'قناة رياضية رائدة تنقل أهم المباريات والبطولات العالمية',
    rating: 4.9
  },
  {
    id: 5,
    name: 'سبيستون',
    category: 'أطفال',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/54/Spacetoon_logo.svg/512px-Spacetoon_logo.svg.png',
    status: 'active',
    viewers: 5100000,
    favorites: 18900,
    country: 'الإمارات',
    language: 'العربية',
    quality: 'HD',
    createdAt: '2024-01-12',
    lastUpdated: '2024-01-16',
    description: 'قناة أطفال عربية تقدم أفضل الرسوم المتحركة والبرامج التعليمية',
    rating: 4.9
  }
]

// فئات القنوات المتاحة
export const channelCategories = [
  'إخبارية',
  'عامة', 
  'رياضية',
  'أطفال',
  'ترفيهية',
  'ثقافية',
  'وثائقية',
  'موسيقية',
  'طبخ'
]

// اللغات المتاحة
export const channelLanguages = [
  'العربية',
  'الإنجليزية',
  'الفرنسية',
  'التركية',
  'الألمانية',
  'الإسبانية'
]

// جودة البث المتاحة
export const channelQualities = [
  'HD',
  'SD',
  '4K',
  'FHD'
]

// البلدان المتاحة
export const channelCountries = [
  'السعودية',
  'الإمارات',
  'قطر',
  'مصر',
  'الأردن',
  'لبنان',
  'سوريا',
  'العراق',
  'الكويت',
  'البحرين',
  'عمان',
  'المغرب',
  'الجزائر',
  'تونس',
  'ليبيا',
  'السودان',
  'اليمن',
  'فلسطين'
]

// تحديث إصدار البيانات
const updateVersion = () => {
  const version = Date.now().toString()
  if (typeof window !== 'undefined') {
    localStorage.setItem(CHANNELS_VERSION_KEY, version)
  }
  return version
}

// الحصول على إصدار البيانات
export const getChannelsVersion = () => {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(CHANNELS_VERSION_KEY)
}

// تحميل القنوات من localStorage مع caching
const _loadChannels = () => {
  if (typeof window === 'undefined') return defaultChannels
  
  try {
    const stored = localStorage.getItem(CHANNELS_STORAGE_KEY)
    if (stored) {
      const channels = JSON.parse(stored)
      return Array.isArray(channels) ? channels : defaultChannels
    }
  } catch (error) {
    console.error('خطأ في تحميل القنوات من localStorage:', error)
  }
  
  // إذا لم توجد بيانات محفوظة، احفظ البيانات الافتراضية
  saveChannels(defaultChannels)
  return defaultChannels
}

export const loadChannels = withCache(_loadChannels, 2 * 60 * 1000) // 2 دقائق

// حفظ القنوات في localStorage
export const saveChannels = (channels) => {
  // في بيئة الخادم، نعتبر الحفظ ناجحاً مؤقتاً
  if (typeof window === 'undefined') {
    console.log('حفظ القنوات في بيئة الخادم - سيتم الحفظ في المتصفح')
    return true
  }
  
  try {
    localStorage.setItem(CHANNELS_STORAGE_KEY, JSON.stringify(channels))
    updateVersion()
    return true
  } catch (error) {
    console.error('خطأ في حفظ القنوات في localStorage:', error)
    return false
  }
}

// إضافة قناة جديدة
// فحص وجود قناة مكررة بناءً على الاسم أو الرابط
export const isDuplicateChannel = (channelData, existingChannels = null) => {
  const channels = existingChannels || loadChannels()
  
  // التأكد من وجود البيانات المطلوبة
  if (!channelData || !channelData.name || !channelData.url) {
    return false
  }
  
  return channels.some(channel => {
    // التأكد من وجود البيانات في القناة الموجودة
    if (!channel || !channel.name || !channel.url) {
      return false
    }
    
    return channel.name.toLowerCase().trim() === channelData.name.toLowerCase().trim() ||
           channel.url.toLowerCase().trim() === channelData.url.toLowerCase().trim()
  })
}

// إضافة قناة جديدة مع فحص التكرار
export const addChannel = (channelData) => {
  const channels = loadChannels()
  
  // فحص التكرار
  if (isDuplicateChannel(channelData, channels)) {
    console.warn(`القناة "${channelData.name}" موجودة مسبقاً`)
    return { error: 'duplicate', message: `القناة "${channelData.name}" موجودة مسبقاً` }
  }
  
  const newChannel = {
    ...channelData,
    id: Date.now(), // استخدام timestamp كمعرف فريد
    viewers: channelData.viewers || 0,
    favorites: channelData.favorites || 0,
    rating: channelData.rating || 0,
    createdAt: channelData.createdAt || new Date().toISOString().split('T')[0],
    lastUpdated: new Date().toISOString().split('T')[0]
  }
  
  const updatedChannels = [...channels, newChannel]
  const success = saveChannels(updatedChannels)
  
  if (success) {
    // إرسال حدث إضافة القناة
    emitChannelEvent(CHANNEL_EVENTS.ADDED, newChannel)
  }
  
  return success ? newChannel : null
}

// إضافة قنوات متعددة مع فحص التكرار
export const addMultipleChannels = (channelsArray) => {
  console.log('addMultipleChannels called with:', channelsArray)
  const existingChannels = loadChannels()
  console.log('Existing channels count:', existingChannels.length)
  const results = {
    added: [],
    duplicates: [],
    errors: []
  }
  
  channelsArray.forEach((channelData, index) => {
    try {
      // فحص صحة البيانات الأساسية
      if (!channelData || !channelData.name || !channelData.url) {
        results.errors.push({
          index: index + 1,
          name: channelData?.name || 'غير محدد',
          error: 'بيانات القناة غير مكتملة (الاسم والرابط مطلوبان)'
        })
        return
      }
      
      // فحص التكرار
      if (isDuplicateChannel(channelData, existingChannels)) {
        results.duplicates.push({
          index: index + 1,
          name: channelData.name,
          message: `القناة "${channelData.name}" موجودة مسبقاً`
        })
        return
      }
      
      const newChannel = {
        ...channelData,
        id: Date.now() + index, // معرف فريد لكل قناة
        viewers: channelData.viewers || 0,
        favorites: channelData.favorites || 0,
        rating: channelData.rating || 0,
        createdAt: channelData.createdAt || new Date().toISOString().split('T')[0],
        lastUpdated: new Date().toISOString().split('T')[0]
      }
      
      existingChannels.push(newChannel)
      results.added.push(newChannel)
      
    } catch (error) {
      results.errors.push({
        index: index + 1,
        name: channelData.name || 'غير محدد',
        error: error.message
      })
    }
  })
  
  // حفظ القنوات الجديدة
  if (results.added.length > 0) {
    const success = saveChannels(existingChannels)
    if (success) {
      // إرسال أحداث إضافة القنوات
      results.added.forEach(channel => {
        emitChannelEvent(CHANNEL_EVENTS.ADDED, channel)
      })
    } else {
      results.errors.push({ message: 'فشل في حفظ القنوات' })
    }
  }
  
  console.log('Final results:', results)
  return results
}

// تحديث قناة موجودة
export const updateChannel = (channelId, updates) => {
  const channels = loadChannels()
  const channelIndex = channels.findIndex(c => c.id === channelId)
  
  if (channelIndex === -1) return null
  
  const updatedChannel = {
    ...channels[channelIndex],
    ...updates,
    lastUpdated: new Date().toISOString().split('T')[0]
  }
  
  channels[channelIndex] = updatedChannel
  const success = saveChannels(channels)
  
  if (success) {
    // إرسال حدث تحديث القناة
    const eventType = updates.status ? CHANNEL_EVENTS.STATUS_CHANGED : CHANNEL_EVENTS.UPDATED
    emitChannelEvent(eventType, updatedChannel)
  }
  
  return success ? updatedChannel : null
}

// حذف قناة
export const deleteChannel = (channelId) => {
  const channels = loadChannels()
  const channelToDelete = channels.find(c => c.id === channelId)
  const filteredChannels = channels.filter(c => c.id !== channelId)
  
  if (filteredChannels.length === channels.length) {
    return false // القناة غير موجودة
  }
  
  const success = saveChannels(filteredChannels)
  
  if (success && channelToDelete) {
    // إرسال حدث حذف القناة
    emitChannelEvent(CHANNEL_EVENTS.DELETED, { id: channelId, name: channelToDelete.name })
  }
  
  return success
}

// البحث في القنوات
export const searchChannels = (query, filters = {}) => {
  const channels = loadChannels()
  let filtered = channels
  
  // البحث النصي
  if (query && query.trim()) {
    const searchTerm = query.toLowerCase().trim()
    filtered = filtered.filter(channel => 
      channel.name.toLowerCase().includes(searchTerm) ||
      channel.category.toLowerCase().includes(searchTerm) ||
      channel.country.toLowerCase().includes(searchTerm) ||
      (channel.description && channel.description.toLowerCase().includes(searchTerm))
    )
  }
  
  // فلترة الحالة
  if (filters.status && filters.status !== 'all') {
    filtered = filtered.filter(channel => channel.status === filters.status)
  }
  
  // فلترة الفئة
  if (filters.category && filters.category !== 'all') {
    filtered = filtered.filter(channel => channel.category === filters.category)
  }
  
  // فلترة البلد
  if (filters.country && filters.country !== 'all') {
    filtered = filtered.filter(channel => channel.country === filters.country)
  }
  
  // فلترة اللغة
  if (filters.language && filters.language !== 'all') {
    filtered = filtered.filter(channel => channel.language === filters.language)
  }
  
  return filtered
}

// الحصول على قناة بالمعرف
const _getChannelById = (channelId) => {
  const channels = _loadChannels()
  return channels.find(c => c.id === channelId) || null
}

export const getChannelById = withCache(_getChannelById, 5 * 60 * 1000) // 5 دقائق

// الحصول على القنوات النشطة فقط
const _getActiveChannels = () => {
  const channels = _loadChannels()
  return channels.filter(c => c.status === 'active')
}

export const getActiveChannels = withCache(_getActiveChannels, 3 * 60 * 1000) // 3 دقائق

// الحصول على إحصائيات القنوات
const _getChannelsStats = () => {
  const channels = _loadChannels()
  
  return {
    total: channels.length,
    active: channels.filter(c => c.status === 'active').length,
    inactive: channels.filter(c => c.status === 'inactive').length,
    byCategory: channelCategories.reduce((acc, category) => {
      acc[category] = channels.filter(c => c.category === category).length
      return acc
    }, {}),
    byCountry: channelCountries.reduce((acc, country) => {
      acc[country] = channels.filter(c => c.country === country).length
      return acc
    }, {})
  }
}

export const getChannelsStats = withCache(_getChannelsStats, 5 * 60 * 1000) // 5 دقائق

// تصدير البيانات
export const exportChannels = () => {
  const channels = loadChannels()
  const dataStr = JSON.stringify(channels, null, 2)
  const dataBlob = new Blob([dataStr], { type: 'application/json' })
  
  const url = URL.createObjectURL(dataBlob)
  const link = document.createElement('a')
  link.href = url
  link.download = `zomiga-channels-${new Date().toISOString().split('T')[0]}.json`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

// استيراد البيانات
export const importChannels = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    
    reader.onload = (e) => {
      try {
        const channels = JSON.parse(e.target.result)
        if (Array.isArray(channels)) {
          const success = saveChannels(channels)
          resolve(success ? channels : null)
        } else {
          reject(new Error('تنسيق الملف غير صحيح'))
        }
      } catch (error) {
        reject(new Error('خطأ في قراءة الملف'))
      }
    }
    
    reader.onerror = () => reject(new Error('خطأ في قراءة الملف'))
    reader.readAsText(file)
  })
}

// إعادة تعيين البيانات للافتراضية
export const resetToDefault = () => {
  return saveChannels(defaultChannels)
}

// مراقب التغييرات (للاستخدام في المكونات)
export const createChannelsWatcher = (callback) => {
  if (typeof window === 'undefined') return () => {}
  
  let lastVersion = getChannelsVersion()
  
  const checkForChanges = () => {
    const currentVersion = getChannelsVersion()
    if (currentVersion !== lastVersion) {
      lastVersion = currentVersion
      // إبطال الـ cache عند تغيير البيانات
      invalidateChannelsCache()
      callback(loadChannels())
    }
  }
  
  const interval = setInterval(checkForChanges, 1000) // فحص كل ثانية
  
  return () => clearInterval(interval) // وظيفة إلغاء المراقبة
}

// وظائف إدارة الـ cache للقنوات
export const invalidateChannelsCache = () => {
  cacheInvalidate('_loadChannels')
  cacheInvalidate('_getChannelById')
  cacheInvalidate('_getActiveChannels')
  cacheInvalidate('_getChannelsStats')
}

// تحديث الـ cache عند تعديل البيانات
export const refreshChannelsCache = () => {
  invalidateChannelsCache()
  // إعادة تحميل البيانات لملء الـ cache
  loadChannels()
  getActiveChannels()
  getChannelsStats()
}