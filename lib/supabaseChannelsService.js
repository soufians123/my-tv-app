// خدمة إدارة القنوات التلفزيونية مع Supabase
// تحديث من localStorage إلى Supabase

import { supabase } from './supabase'
import { emitChannelEvent, CHANNEL_EVENTS } from './channelEvents'

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
  'طبخ',
  'قنوات مغربية',
  'أفلام ومسلسلات',
  'تعليمية',
  'دينية',
  'تقنية',
  'صحة وجمال'
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

// تحميل القنوات من Supabase
export const loadChannels = async () => {
  try {
    // التحقق من صحة الجلسة وتحديث الرمز المميز إذا لزم الأمر
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    if (sessionError || !session) {
      console.warn('لا توجد جلسة صالحة، سيتم استخدام المفاتيح العامة')
    }

    const query = supabase
      .from('channels')
      .select(`
        *,
        channel_categories(
          name,
          name_ar
        )
      `)
      .eq('is_active', true)
      .order('name', { ascending: true })

    const { data, error } = await query

    if (error) {
      // التعامل مع أخطاء انتهاء صلاحية JWT
      if (error.code === 'PGRST303' || (error.message && error.message.includes('JWT expired'))) {
        console.warn('انتهت صلاحية الرمز المميز، محاولة تحديث الجلسة...')
        try {
          const { data: { session: newSession }, error: refreshError } = await supabase.auth.refreshSession()
          if (!refreshError && newSession) {
            // إعادة المحاولة مع الجلسة الجديدة
            const { data: retryData, error: retryError } = await query
            if (!retryError) {
              console.log('تم تحميل القنوات بنجاح بعد تحديث الجلسة:', retryData?.length || 0)
              return retryData || []
            }
          }
        } catch (refreshErr) {
          console.error('فشل في تحديث الجلسة:', refreshErr)
        }
      }
      console.error('خطأ في تحميل القنوات:', error)
      return []
    }

    console.log('تم تحميل القنوات بنجاح:', data?.length || 0)
    return data || []
  } catch (error) {
    console.error('خطأ في الاتصال بقاعدة البيانات:', error)
    return []
  }
}

// تحميل فئات القنوات
export const loadChannelCategories = async () => {
  try {
    // استخدام الفئات الثابتة المحددة مسبقاً
    const categoriesData = channelCategories.map((category, index) => ({
      id: `cat-${index}`,
      name: category,
      name_ar: category,
      color: '#059669',
      icon: 'tv'
    }))

    console.log('تم تحميل الفئات بنجاح:', categoriesData.length)
    return categoriesData
  } catch (error) {
    console.error('خطأ في الاتصال بقاعدة البيانات:', error)
    return []
  }
}

// إضافة قناة جديدة
export const addChannel = async (channelData) => {
  try {
    const { data, error } = await supabase
      .from('channels')
      .insert([
        {
          name: channelData.name,
          name_ar: channelData.name_ar || channelData.name,
          description: channelData.description,
          logo_url: channelData.logo,
          stream_url: channelData.url,
          backup_stream_url: channelData.backup_stream_url,
          category_id: channelData.category_id,
          country: channelData.country,
          language: channelData.language,
          quality: channelData.quality,
          is_live: true,
          is_active: true,
          viewer_count: 0,
          rating: 0,
          sort_order: channelData.sort_order || 0
        }
      ])
      .select()
      .single()

    if (error) {
      console.error('خطأ في إضافة القناة:', error)
      return { success: false, error: error.message }
    }

    // إرسال حدث إضافة القناة
    emitChannelEvent(CHANNEL_EVENTS.ADDED, data)
    
    return { success: true, data }
  } catch (error) {
    console.error('خطأ في إضافة القناة:', error)
    return { success: false, error: error.message }
  }
}

// تحديث قناة موجودة
export const updateChannel = async (channelId, updates) => {
  try {
    console.log('updateChannel called with:', { channelId, updates })
    const { data, error } = await supabase
      .from('channels')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', channelId)
      .select()
      .single()
    
    console.log('updateChannel result:', { data, error })

    if (error) {
      console.error('خطأ في تحديث القناة:', error)
      return { success: false, error: error.message }
    }

    // إرسال حدث تحديث القناة
    const eventType = updates.is_active !== undefined ? CHANNEL_EVENTS.STATUS_CHANGED : CHANNEL_EVENTS.UPDATED
    emitChannelEvent(eventType, data)
    
    return { success: true, data }
  } catch (error) {
    console.error('خطأ في تحديث القناة:', error)
    return { success: false, error: error.message }
  }
}

// حذف قناة (soft delete)
export const deleteChannel = async (channelId) => {
  try {
    const { data, error } = await supabase
      .from('channels')
      .update({ is_active: false })
      .eq('id', channelId)
      .select()
      .single()

    if (error) {
      console.error('خطأ في حذف القناة:', error)
      return { success: false, error: error.message }
    }

    // إرسال حدث حذف القناة
    emitChannelEvent(CHANNEL_EVENTS.DELETED, { id: channelId, name: data.name })
    
    return { success: true, data }
  } catch (error) {
    console.error('خطأ في حذف القناة:', error)
    return { success: false, error: error.message }
  }
}

// البحث في القنوات
export const searchChannels = async (query, filters = {}) => {
  try {
    let queryBuilder = supabase
      .from('channels')
      .select(`
        *,
        channel_categories(name, name_ar, color, icon)
      `)
      .eq('is_active', true)

    // البحث النصي
    if (query && query.trim()) {
      queryBuilder = queryBuilder.or(`name.ilike.%${query}%,name_ar.ilike.%${query}%,description.ilike.%${query}%`)
    }

    // فلترة الفئة
    if (filters.category_id) {
      queryBuilder = queryBuilder.eq('category_id', filters.category_id)
    }

    // فلترة البلد
    if (filters.country && filters.country !== 'all') {
      queryBuilder = queryBuilder.eq('country', filters.country)
    }

    // فلترة اللغة
    if (filters.language && filters.language !== 'all') {
      queryBuilder = queryBuilder.eq('language', filters.language)
    }

    // فلترة الجودة
    if (filters.quality && filters.quality !== 'all') {
      queryBuilder = queryBuilder.eq('quality', filters.quality)
    }

    const { data, error } = await queryBuilder.order('sort_order', { ascending: true })

    if (error) {
      console.error('خطأ في البحث:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('خطأ في البحث:', error)
    return []
  }
}

// الحصول على قناة بالمعرف
export const getChannelById = async (channelId) => {
  try {
    const { data, error } = await supabase
      .from('channels')
      .select(`
        *,
        channel_categories(name, name_ar, color, icon)
      `)
      .eq('id', channelId)
      .eq('is_active', true)
      .single()

    if (error) {
      console.error('خطأ في جلب القناة:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('خطأ في جلب القناة:', error)
    return null
  }
}

// الحصول على القنوات النشطة فقط
export const getActiveChannels = async () => {
  return await loadChannels()
}

// الحصول على إحصائيات القنوات
export const getChannelsStats = async () => {
  try {
    // إجمالي القنوات
    const { count: totalChannels } = await supabase
      .from('channels')
      .select('*', { count: 'exact', head: true })

    // القنوات النشطة
    const { count: activeChannels } = await supabase
      .from('channels')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true)

    // القنوات غير النشطة
    const { count: inactiveChannels } = await supabase
      .from('channels')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', false)

    // إحصائيات حسب الفئة
    const { data: categoryStats } = await supabase
      .from('channels')
      .select('category_id, channel_categories(name, name_ar)')
      .eq('is_active', true)

    // إحصائيات حسب البلد
    const { data: countryStats } = await supabase
      .from('channels')
      .select('country')
      .eq('is_active', true)

    const byCategory = {}
    categoryStats?.forEach(item => {
      const categoryName = item.channel_categories?.name_ar || 'غير محدد'
      byCategory[categoryName] = (byCategory[categoryName] || 0) + 1
    })

    const byCountry = {}
    countryStats?.forEach(item => {
      const country = item.country || 'غير محدد'
      byCountry[country] = (byCountry[country] || 0) + 1
    })

    return {
      total: totalChannels || 0,
      active: activeChannels || 0,
      inactive: inactiveChannels || 0,
      byCategory,
      byCountry
    }
  } catch (error) {
    console.error('خطأ في جلب الإحصائيات:', error)
    return {
      total: 0,
      active: 0,
      inactive: 0,
      byCategory: {},
      byCountry: {}
    }
  }
}

// إضافة قناة للمفضلة
export const addToFavorites = async (channelId, userId) => {
  try {
    const { data, error } = await supabase
      .from('channel_favorites')
      .insert([
        {
          user_id: userId,
          channel_id: channelId
        }
      ])
      .select()
      .single()

    if (error) {
      console.error('خطأ في إضافة للمفضلة:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('خطأ في إضافة للمفضلة:', error)
    return false
  }
}

// إزالة قناة من المفضلة
export const removeFromFavorites = async (channelId, userId) => {
  try {
    const { error } = await supabase
      .from('channel_favorites')
      .delete()
      .eq('user_id', userId)
      .eq('channel_id', channelId)

    if (error) {
      console.error('خطأ في إزالة من المفضلة:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('خطأ في إزالة من المفضلة:', error)
    return false
  }
}

// الحصول على القنوات المفضلة للمستخدم
export const getUserFavoriteChannels = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('channel_favorites')
      .select(`
        channels(
          *,
          channel_categories(name, name_ar, color, icon)
        )
      `)
      .eq('user_id', userId)

    if (error) {
      console.error('خطأ في جلب المفضلة:', error)
      return []
    }

    return data?.map(item => item.channels) || []
  } catch (error) {
    console.error('خطأ في جلب المفضلة:', error)
    return []
  }
}

// تسجيل مشاهدة قناة
export const recordChannelView = async (channelId, userId, duration = 0) => {
  try {
    const { error } = await supabase
      .from('channel_views')
      .insert([
        {
          user_id: userId,
          channel_id: channelId,
          view_duration: duration
        }
      ])

    if (error) {
      console.error('خطأ في تسجيل المشاهدة:', error)
      return false
    }

    // تحديث عداد المشاهدات
    await supabase
      .from('channels')
      .update({ viewer_count: supabase.raw('viewer_count + 1') })
      .eq('id', channelId)

    return true
  } catch (error) {
    console.error('خطأ في تسجيل المشاهدة:', error)
    return false
  }
}

// الحصول على تاريخ المشاهدة للمستخدم
export const getUserViewHistory = async (userId, limit = 50) => {
  try {
    const { data, error } = await supabase
      .from('channel_views')
      .select(`
        *,
        channels(
          *,
          channel_categories(name, name_ar, color, icon)
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('خطأ في جلب تاريخ المشاهدة:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('خطأ في جلب تاريخ المشاهدة:', error)
    return []
  }
}

// تصدير البيانات
export const exportChannels = async () => {
  try {
    const channels = await loadChannels()
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
    
    return true
  } catch (error) {
    console.error('خطأ في تصدير البيانات:', error)
    return false
  }
}

// استيراد البيانات
export const importChannels = async (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    
    reader.onload = async (e) => {
      try {
        const channels = JSON.parse(e.target.result)
        if (Array.isArray(channels)) {
          // إدراج القنوات في قاعدة البيانات
          const { data, error } = await supabase
            .from('channels')
            .insert(channels.map(channel => ({
              name: channel.name,
              name_ar: channel.name_ar || channel.name,
              description: channel.description,
              logo_url: channel.logo_url,
              stream_url: channel.url,
              country: channel.country,
              language: channel.language,
              quality: channel.quality,
              is_active: channel.status === 'active'
            })))
            .select()
          
          if (error) {
            reject(new Error('خطأ في استيراد البيانات: ' + error.message))
          } else {
            resolve(data)
          }
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

// مراقب التغييرات (للاستخدام في المكونات)
export const createChannelsWatcher = (callback) => {
  // استخدام Supabase Realtime للمراقبة المباشرة
  const subscription = supabase
    .channel('channels-changes')
    .on('postgres_changes', 
      { event: '*', schema: 'public', table: 'channels' },
      (payload) => {
        console.log('تغيير في القنوات:', payload)
        // إعادة تحميل البيانات وإرسالها للمكون
        loadChannels().then(callback)
      }
    )
    .subscribe()

  return () => {
    supabase.removeChannel(subscription)
  }
}

// تصدير كائن الخدمة للاستخدام في المكونات
export const supabaseChannelsService = {
  loadChannels,
  loadChannelCategories,
  addChannel,
  updateChannel,
  deleteChannel,
  searchChannels,
  getChannelById,
  getActiveChannels,
  getChannelsStats,
  addToFavorites,
  removeFromFavorites,
  getUserFavoriteChannels,
  recordChannelView,
  getUserViewHistory,
  exportChannels,
  importChannels,
  createChannelsWatcher,
  createChannel: addChannel
}