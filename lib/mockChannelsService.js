// خدمة إدارة القنوات التلفزيونية مع بيانات تجريبية
// نسخة مبسطة بدون Supabase

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

// بيانات تجريبية للقنوات
const mockChannels = [
  {
    id: 1,
    name: 'قناة الجزيرة',
    name_ar: 'قناة الجزيرة',
    description: 'قناة إخبارية عربية',
    logo: 'https://via.placeholder.com/100x60/0066cc/ffffff?text=الجزيرة',
    logo_url: 'https://via.placeholder.com/100x60/0066cc/ffffff?text=الجزيرة',
    stream_url: 'https://live-hls-web-aje.getaj.net/AJE/01.m3u8',
    url: 'https://live-hls-web-aje.getaj.net/AJE/01.m3u8',
    category: 'إخبارية',
    country: 'قطر',
    language: 'العربية',
    quality: 'HD',
    is_active: true,
    status: 'active',
    sort_order: 1,
    view_count: 15420,
    viewers: 15420,
    favorites: 2340,
    lastUpdated: '2024-01-15',
    created_at: '2024-01-01T00:00:00Z',
    channel_categories: {
      name: 'news',
      name_ar: 'إخبارية',
      color: '#0066cc',
      icon: 'news'
    }
  },
  {
    id: 2,
    name: 'العربية',
    name_ar: 'العربية',
    description: 'قناة إخبارية عربية',
    logo: 'https://via.placeholder.com/100x60/cc0000/ffffff?text=العربية',
    logo_url: 'https://via.placeholder.com/100x60/cc0000/ffffff?text=العربية',
    stream_url: 'https://live.alarabiya.net/alarabiapublish/alarabiya.smil/playlist.m3u8',
    url: 'https://live.alarabiya.net/alarabiapublish/alarabiya.smil/playlist.m3u8',
    category: 'إخبارية',
    country: 'السعودية',
    language: 'العربية',
    quality: 'HD',
    is_active: true,
    status: 'active',
    sort_order: 2,
    view_count: 12350,
    viewers: 12350,
    favorites: 1890,
    lastUpdated: '2024-01-14',
    created_at: '2024-01-01T00:00:00Z',
    channel_categories: {
      name: 'news',
      name_ar: 'إخبارية',
      color: '#cc0000',
      icon: 'news'
    }
  },
  {
    id: 3,
    name: 'بي بي سي عربي',
    name_ar: 'بي بي سي عربي',
    description: 'قناة إخبارية دولية باللغة العربية',
    logo: 'https://via.placeholder.com/100x60/990000/ffffff?text=BBC',
    logo_url: 'https://via.placeholder.com/100x60/990000/ffffff?text=BBC',
    stream_url: 'https://vs-hls-push-ww-live.akamaized.net/x=4/i=urn:bbc:pips:service:bbc_arabic_tv/t=3840/v=pv14/b=5070016/main.m3u8',
    url: 'https://vs-hls-push-ww-live.akamaized.net/x=4/i=urn:bbc:pips:service:bbc_arabic_tv/t=3840/v=pv14/b=5070016/main.m3u8',
    category: 'إخبارية',
    country: 'بريطانيا',
    language: 'العربية',
    quality: 'HD',
    is_active: true,
    status: 'active',
    sort_order: 3,
    view_count: 8920,
    viewers: 8920,
    favorites: 1250,
    lastUpdated: '2024-01-13',
    created_at: '2024-01-01T00:00:00Z',
    channel_categories: {
      name: 'news',
      name_ar: 'إخبارية',
      color: '#990000',
      icon: 'news'
    }
  },
  {
    id: 4,
    name: 'بي إن سبورت',
    name_ar: 'بي إن سبورت',
    description: 'قناة رياضية عربية',
    logo: 'https://via.placeholder.com/100x60/006600/ffffff?text=beIN',
    logo_url: 'https://via.placeholder.com/100x60/006600/ffffff?text=beIN',
    stream_url: 'https://example.com/beinsport.m3u8',
    url: 'https://example.com/beinsport.m3u8',
    category: 'رياضية',
    country: 'قطر',
    language: 'العربية',
    quality: 'HD',
    is_active: true,
    status: 'active',
    sort_order: 4,
    view_count: 25680,
    viewers: 25680,
    favorites: 4120,
    lastUpdated: '2024-01-16',
    created_at: '2024-01-01T00:00:00Z',
    channel_categories: {
      name: 'sports',
      name_ar: 'رياضية',
      color: '#006600',
      icon: 'sports'
    }
  },
  {
    id: 5,
    name: 'إم بي سي',
    name_ar: 'إم بي سي',
    description: 'قناة ترفيهية عامة',
    logo: 'https://via.placeholder.com/100x60/ff6600/ffffff?text=MBC',
    logo_url: 'https://via.placeholder.com/100x60/ff6600/ffffff?text=MBC',
    stream_url: 'https://example.com/mbc.m3u8',
    url: 'https://example.com/mbc.m3u8',
    category: 'عامة',
    country: 'الإمارات',
    language: 'العربية',
    quality: 'HD',
    is_active: true,
    status: 'active',
    sort_order: 5,
    view_count: 18750,
    viewers: 18750,
    favorites: 3200,
    lastUpdated: '2024-01-12',
    created_at: '2024-01-01T00:00:00Z',
    channel_categories: {
      name: 'general',
      name_ar: 'عامة',
      color: '#ff6600',
      icon: 'tv'
    }
  },
  {
    id: 6,
    name: 'سبيستون',
    name_ar: 'سبيستون',
    description: 'قناة أطفال وكرتون',
    logo: 'https://via.placeholder.com/100x60/9900cc/ffffff?text=سبيستون',
    logo_url: 'https://via.placeholder.com/100x60/9900cc/ffffff?text=سبيستون',
    stream_url: 'https://example.com/spacetoon.m3u8',
    url: 'https://example.com/spacetoon.m3u8',
    category: 'أطفال',
    country: 'الإمارات',
    language: 'العربية',
    quality: 'HD',
    is_active: true,
    status: 'active',
    sort_order: 6,
    view_count: 22100,
    viewers: 22100,
    favorites: 5670,
    lastUpdated: '2024-01-11',
    created_at: '2024-01-01T00:00:00Z',
    channel_categories: {
      name: 'kids',
      name_ar: 'أطفال',
      color: '#9900cc',
      icon: 'baby'
    }
  }
]

// تحميل القنوات من localStorage أو استخدام البيانات الافتراضية
const loadChannelsFromStorage = () => {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('mockChannels')
    if (stored) {
      try {
        return JSON.parse(stored)
      } catch (error) {
        console.error('خطأ في قراءة البيانات المحفوظة:', error)
      }
    }
  }
  return [...mockChannels] // نسخة من البيانات الافتراضية
}

// حفظ القنوات في localStorage
const saveChannelsToStorage = (channels) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('mockChannels', JSON.stringify(channels))
  }
}

// تحميل القنوات
export const loadChannels = async () => {
  try {
    console.log('تحميل القنوات التجريبية...')
    // محاكاة تأخير الشبكة
    await new Promise(resolve => setTimeout(resolve, 500))
    const channels = loadChannelsFromStorage()
    console.log('تم تحميل', channels.length, 'قناة')
    return channels
  } catch (error) {
    console.error('خطأ في تحميل القنوات:', error)
    return []
  }
}

// تحميل فئات القنوات
export const loadChannelCategories = async () => {
  const categories = [
    { id: 1, name: 'news', name_ar: 'إخبارية', color: '#0066cc', icon: 'news', is_active: true, sort_order: 1 },
    { id: 2, name: 'sports', name_ar: 'رياضية', color: '#006600', icon: 'sports', is_active: true, sort_order: 2 },
    { id: 3, name: 'general', name_ar: 'عامة', color: '#ff6600', icon: 'tv', is_active: true, sort_order: 3 },
    { id: 4, name: 'kids', name_ar: 'أطفال', color: '#9900cc', icon: 'baby', is_active: true, sort_order: 4 },
    { id: 5, name: 'entertainment', name_ar: 'ترفيهية', color: '#cc0066', icon: 'music', is_active: true, sort_order: 5 }
  ]
  return categories
}

// إضافة قناة جديدة
export const addChannel = async (channelData) => {
  try {
    console.log('إضافة قناة جديدة:', channelData)
    
    // تحميل القنوات الحالية
    const currentChannels = loadChannelsFromStorage()
    
    // إنشاء معرف جديد
    const newId = Math.max(...currentChannels.map(ch => ch.id), 0) + 1
    
    const newChannel = {
      id: newId,
      name: channelData.name || '',
      name_ar: channelData.name || '',
      description: channelData.description || `قناة ${channelData.name}`,
      logo: channelData.logo || `https://via.placeholder.com/100x60/0066cc/ffffff?text=${encodeURIComponent(channelData.name || 'قناة')}`,
      logo_url: channelData.logo || `https://via.placeholder.com/100x60/0066cc/ffffff?text=${encodeURIComponent(channelData.name || 'قناة')}`,
      stream_url: channelData.url || '',
      url: channelData.url || '',
      category: channelData.category || 'عامة',
      country: channelData.country || 'غير محدد',
      language: channelData.language || 'العربية',
      quality: channelData.quality || 'HD',
      is_active: channelData.status === 'active' || true,
      status: channelData.status || 'active',
      sort_order: newId,
      view_count: 0,
      viewers: 0,
      favorites: 0,
      lastUpdated: new Date().toISOString().split('T')[0],
      created_at: new Date().toISOString(),
      channel_categories: {
        name: channelData.category?.toLowerCase() || 'general',
        name_ar: channelData.category || 'عامة',
        color: '#0066cc',
        icon: 'tv'
      }
    }
    
    currentChannels.push(newChannel)
    saveChannelsToStorage(currentChannels)
    console.log('تم إضافة القناة بنجاح:', newChannel)
    return { success: true, data: newChannel }
  } catch (error) {
    console.error('خطأ في إضافة القناة:', error)
    return { success: false, error: error.message }
  }
}

// تحديث قناة
export const updateChannel = async (channelId, updates) => {
  try {
    console.log('تحديث القناة:', channelId, updates)
    const currentChannels = loadChannelsFromStorage()
    const channelIndex = currentChannels.findIndex(ch => ch.id === parseInt(channelId))
    if (channelIndex === -1) {
      console.error('القناة غير موجودة:', channelId)
      return { success: false, error: 'القناة غير موجودة' }
    }
    
    // تحديث البيانات مع الحفاظ على البيانات الأصلية
    const updatedChannel = { 
      ...currentChannels[channelIndex], 
      ...updates,
      lastUpdated: new Date().toISOString().split('T')[0] // تحديث تاريخ آخر تعديل
    }
    
    // التأكد من تطابق الحقول المطلوبة
    if (updates.name) updatedChannel.name_ar = updates.name
    if (updates.url) {
      updatedChannel.stream_url = updates.url
      updatedChannel.logo_url = updates.logo || updatedChannel.logo_url
    }
    if (updates.status) {
      updatedChannel.is_active = updates.status === 'active'
    }
    if (typeof updates.is_active !== 'undefined') {
      updatedChannel.status = updates.is_active ? 'active' : 'inactive'
    }
    
    currentChannels[channelIndex] = updatedChannel
    saveChannelsToStorage(currentChannels)
    console.log('تم تحديث القناة بنجاح:', updatedChannel)
    return { success: true, data: updatedChannel }
  } catch (error) {
    console.error('خطأ في تحديث القناة:', error)
    return { success: false, error: error.message }
  }
}

// حذف قناة
export const deleteChannel = async (channelId) => {
  try {
    console.log('حذف القناة:', channelId)
    const currentChannels = loadChannelsFromStorage()
    const channelIndex = currentChannels.findIndex(ch => ch.id === parseInt(channelId))
    if (channelIndex === -1) {
      console.error('القناة غير موجودة للحذف:', channelId)
      return { success: false, error: 'القناة غير موجودة' }
    }
    
    const deletedChannel = currentChannels[channelIndex]
    currentChannels.splice(channelIndex, 1)
    saveChannelsToStorage(currentChannels)
    console.log('تم حذف القناة بنجاح:', deletedChannel.name)
    return { success: true, data: deletedChannel }
  } catch (error) {
    console.error('خطأ في حذف القناة:', error)
    return { success: false, error: error.message }
  }
}

// البحث في القنوات
export const searchChannels = async (query, filters = {}) => {
  try {
    const currentChannels = loadChannelsFromStorage()
    let results = [...currentChannels]
    
    if (query) {
      results = results.filter(channel => 
        channel.name.toLowerCase().includes(query.toLowerCase()) ||
        channel.name_ar.toLowerCase().includes(query.toLowerCase()) ||
        channel.description.toLowerCase().includes(query.toLowerCase())
      )
    }
    
    if (filters.category && filters.category !== 'all') {
      results = results.filter(channel => channel.category === filters.category)
    }
    
    if (filters.country && filters.country !== 'all') {
      results = results.filter(channel => channel.country === filters.country)
    }
    
    if (filters.language && filters.language !== 'all') {
      results = results.filter(channel => channel.language === filters.language)
    }
    
    return results
  } catch (error) {
    console.error('خطأ في البحث:', error)
    return []
  }
}

// الحصول على قناة بالمعرف
export const getChannelById = async (channelId) => {
  try {
    const currentChannels = loadChannelsFromStorage()
    const channel = currentChannels.find(ch => ch.id === parseInt(channelId))
    return channel || null
  } catch (error) {
    console.error('خطأ في الحصول على القناة:', error)
    return null
  }
}

// الحصول على القنوات النشطة
export const getActiveChannels = async () => {
  const currentChannels = loadChannelsFromStorage()
  return currentChannels.filter(channel => channel.is_active)
}

// إحصائيات القنوات
export const getChannelsStats = async () => {
  const currentChannels = loadChannelsFromStorage()
  const totalChannels = currentChannels.length
  const activeChannels = currentChannels.filter(ch => ch.is_active).length
  const totalViews = currentChannels.reduce((sum, ch) => sum + ch.view_count, 0)
  
  const categoriesStats = {}
  currentChannels.forEach(channel => {
    if (!categoriesStats[channel.category]) {
      categoriesStats[channel.category] = 0
    }
    categoriesStats[channel.category]++
  })
  
  return {
    totalChannels,
    activeChannels,
    inactiveChannels: totalChannels - activeChannels,
    totalViews,
    categoriesStats
  }
}