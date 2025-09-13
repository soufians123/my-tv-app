// خدمة الإعلانات مع Supabase

import { supabase } from './supabase'
import { withCache, cacheInvalidate } from './apiCache'

// واجهة مساعدة للطلبات إلى API الداخلي
const apiRequest = async (path, options = {}) => {
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) }
  try {
    const { data: { session } } = await supabase.auth.getSession()
    if (session?.access_token) {
      headers['Authorization'] = `Bearer ${session.access_token}`
    }
  } catch (_) { /* تجاهل أي أخطاء في الحصول على الجلسة */ }

  const res = await fetch(path, {
    headers,
    credentials: 'same-origin',
    ...options
  })
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(text || `API request failed with status ${res.status}`)
  }
  // قد لا يكون هناك جسم دائمًا (مثلاً في DELETE)
  try {
    return await res.json()
  } catch (_) {
    return null
  }
}

// تحميل جميع الإعلانات
const _loadAdvertisements = async (filters = {}) => {
  try {
    const params = new URLSearchParams()
    if (typeof filters.status !== 'undefined' && filters.status !== 'all') params.set('status', String(filters.status))
    if (filters.type) params.set('type', filters.type)
    if (filters.position) params.set('position', filters.position)
    if (filters.search) params.set('search', filters.search)
    params.set('sortBy', filters.sortBy || 'created_at')
    params.set('sortOrder', filters.sortOrder || 'desc')
    if (filters.limit) params.set('limit', String(filters.limit))

    const data = await apiRequest(`/api/admin/promos?${params.toString()}`)
    return data || []
  } catch (error) {
    console.error('خطأ في تحميل الإعلانات:', error)
    return []
  }
}

// الحصول على إعلان بالمعرف
const _getAdvertisementById = async (id) => {
  try {
    const data = await apiRequest(`/api/admin/promos/${id}`)
    return data || null
  } catch (error) {
    console.error('خطأ في جلب الإعلان:', error)
    return null
  }
}

// إنشاء إعلان جديد
export const createAdvertisement = async (adData) => {
  try {
    const payload = {
      title: adData.title,
      description: adData.description || null,
      ad_type: adData.ad_type,
      position: adData.position,
      image_url: adData.image_url || null,
      link_url: adData.link_url || adData.target_url || null,
      start_date: adData.start_date || null,
      end_date: adData.end_date || null,
      budget: adData.budget ?? 0,
      cost_per_click: adData.cost_per_click ?? 0,
      target_audience: adData.target_audience || {},
      is_active: typeof adData.is_active === 'boolean'
        ? adData.is_active
        : (adData.status ? adData.status === 'active' : true)
    }

    const data = await apiRequest('/api/admin/promos', {
      method: 'POST',
      body: JSON.stringify(payload)
    })

    return data
  } catch (error) {
    console.error('خطأ في إنشاء الإعلان:', error)
    return null
  }
}

// تحديث إعلان
export const updateAdvertisement = async (id, updates) => {
  try {
    const payload = {
      updated_at: new Date().toISOString()
    }

    if (typeof updates.title !== 'undefined') payload.title = updates.title
    if (typeof updates.description !== 'undefined') payload.description = updates.description
    if (typeof updates.ad_type !== 'undefined') payload.ad_type = updates.ad_type
    if (typeof updates.position !== 'undefined') payload.position = updates.position
    if (typeof updates.image_url !== 'undefined') payload.image_url = updates.image_url
    if (typeof updates.link_url !== 'undefined' || typeof updates.target_url !== 'undefined') {
      payload.link_url = updates.link_url || updates.target_url
    }
    if (typeof updates.start_date !== 'undefined') payload.start_date = updates.start_date
    if (typeof updates.end_date !== 'undefined') payload.end_date = updates.end_date
    if (typeof updates.budget !== 'undefined') payload.budget = updates.budget
    if (typeof updates.cost_per_click !== 'undefined') payload.cost_per_click = updates.cost_per_click
    if (typeof updates.target_audience !== 'undefined') payload.target_audience = updates.target_audience
    if (typeof updates.is_active !== 'undefined' || typeof updates.status !== 'undefined') {
      const resolved = typeof updates.is_active === 'boolean'
        ? updates.is_active
        : (updates.status ? updates.status === 'active' : undefined)
      if (typeof resolved !== 'undefined') payload.is_active = resolved
    }

    const data = await apiRequest(`/api/admin/promos/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload)
    })

    return data
  } catch (error) {
    console.error('خطأ في تحديث الإعلان:', error)
    return null
  }
}

// حذف إعلان
export const deleteAdvertisement = async (id) => {
  try {
    await apiRequest(`/api/admin/promos/${id}`, { method: 'DELETE' })
    return true
  } catch (error) {
    console.error('خطأ في حذف الإعلان:', error)
    return false
  }
}

// تسجيل عرض إعلان (impression)
export const recordAdImpression = async (adId, userId = null, metadata = {}) => {
  try {
    const { data, error } = await supabase
      .from('ad_impressions')
      .insert({
        ad_id: adId,
        user_id: userId
      })
      .select()
      .single()

    if (error) {
      console.error('خطأ في تسجيل عرض الإعلان:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('خطأ في تسجيل عرض الإعلان:', error)
    return null
  }
}

// تسجيل نقرة على إعلان
export const recordAdClick = async (adId, userId = null, metadata = {}) => {
  try {
    const { data, error } = await supabase
      .from('ad_clicks')
      .insert({
        ad_id: adId,
        user_id: userId
      })
      .select()
      .single()

    if (error) {
      console.error('خطأ في تسجيل نقرة الإعلان:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('خطأ في تسجيل نقرة الإعلان:', error)
    return null
  }
}

// الحصول على إحصائيات الإعلان
const _getAdStatistics = async (adId, dateRange = '7d') => {
  try {
    const daysAgo = parseInt(dateRange.replace('d', ''))
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - daysAgo)

    // عدد العروض
    const { count: impressions } = await supabase
      .from('ad_impressions')
      .select('*', { count: 'exact', head: true })
      .eq('ad_id', adId)
      .gte('created_at', startDate.toISOString())

    // عدد النقرات
    const { count: clicks } = await supabase
      .from('ad_clicks')
      .select('*', { count: 'exact', head: true })
      .eq('ad_id', adId)
      .gte('created_at', startDate.toISOString())

    // حساب معدل النقر (CTR)
    const ctr = impressions > 0 ? (clicks / impressions * 100).toFixed(2) : 0

    // الحصول على بيانات الإعلان للحصول على التكلفة
    const { data: adData } = await supabase
      .from('advertisements')
      .select('cost_per_click, budget')
      .eq('id', adId)
      .single()

    // حساب التكلفة
    const totalCost = (clicks * (adData?.cost_per_click || 0))

    return {
      impressions: impressions || 0,
      clicks: clicks || 0,
      ctr: parseFloat(ctr),
      totalCost: totalCost.toFixed(2),
      remainingBudget: Math.max(0, (adData?.budget || 0) - totalCost).toFixed(2)
    }
  } catch (error) {
    console.error('خطأ في جلب إحصائيات الإعلان:', error)
    return {
      impressions: 0,
      clicks: 0,
      ctr: 0,
      totalCost: '0.00',
      remainingBudget: '0.00'
    }
  }
}

// الحصول على الإعلانات النشطة حسب الموقع
const _getActiveAdsByPosition = async (position, limit = 5) => {
  try {
    const now = new Date().toISOString()
    
    const { data, error } = await supabase
      .from('advertisements')
      .select('*')
      .eq('is_active', true)
      .eq('position', position)
      // Treat NULL start_date as already started, or start_date <= now
      .or(`start_date.is.null,start_date.lte.${now}`)
      // Treat NULL end_date as non-expiring, or end_date >= now
      .or(`end_date.is.null,end_date.gte.${now}`)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('خطأ في جلب الإعلانات النشطة:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('خطأ في جلب الإعلانات النشطة:', error)
    return []
  }
}

// إضافة: جلب جميع الإعلانات النشطة (مع التعامل مع انتهاء الصلاحية الاختياري)
const _getAllActiveAds = async (limit = 50) => {
  try {
    // التحقق من صحة الجلسة وتحديث الرمز المميز إذا لزم الأمر
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    if (sessionError || !session) {
      console.warn('لا توجد جلسة صالحة، سيتم استخدام المفاتيح العامة')
    }

    const now = new Date().toISOString()

    let query = supabase
      .from('advertisements')
      .select('*')
      .eq('is_active', true)
      // Treat NULL start_date as already started, or start_date <= now
      .or(`start_date.is.null,start_date.lte.${now}`)
      // If end_date is NULL consider it unlimited, otherwise end_date >= now
      .or(`end_date.is.null,end_date.gte.${now}`)
      .order('created_at', { ascending: false })
      .limit(limit)

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
              return retryData || []
            }
          }
        } catch (refreshErr) {
          console.error('فشل في تحديث الجلسة:', refreshErr)
        }
      }
      console.error('خطأ في جلب جميع الإعلانات النشطة:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('خطأ في جلب جميع الإعلانات النشطة:', error)
    return []
  }
}

// البحث في الإعلانات
const _searchAdvertisements = async (query, filters = {}) => {
  try {
    let supabaseQuery = supabase
      .from('advertisements')
      .select('*')
      .or(`title.ilike.%${query}%,description.ilike.%${query}%`)

    // تطبيق الفلاتر الإضافية
    if (typeof filters.status !== 'undefined' && filters.status !== 'all') {
      if (typeof filters.status === 'boolean') {
        supabaseQuery = supabaseQuery.eq('is_active', filters.status)
      } else if (filters.status === 'active') {
        supabaseQuery = supabaseQuery.eq('is_active', true)
      } else {
        supabaseQuery = supabaseQuery.eq('is_active', false)
      }
    }

    if (filters.type) {
      supabaseQuery = supabaseQuery.eq('ad_type', filters.type)
    }

    if (filters.position) {
      supabaseQuery = supabaseQuery.eq('position', filters.position)
    }

    const { data, error } = await supabaseQuery
      .order('created_at', { ascending: false })
      .limit(20)

    if (error) {
      console.error('خطأ في البحث في الإعلانات:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('خطأ في البحث في الإعلانات:', error)
    return []
  }
}

// الحصول على تقرير الأداء
const _getPerformanceReport = async (dateRange = '30d') => {
  try {
    const daysAgo = parseInt(dateRange.replace('d', ''))
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - daysAgo)

    // إجمالي الإعلانات النشطة
    const { count: totalAds } = await supabase
      .from('advertisements')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true)

    // إجمالي العروض
    const { count: totalImpressions } = await supabase
      .from('ad_impressions')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', startDate.toISOString())

    // إجمالي النقرات
    const { count: totalClicks } = await supabase
      .from('ad_clicks')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', startDate.toISOString())

    // أفضل الإعلانات أداءً
    const { data: topAds } = await supabase
      .from('advertisements')
      .select(`
        id,
        title,
        ad_type,
        position,
        ad_clicks(*),
        ad_impressions(*)
      `)
      .eq('is_active', true)
      .limit(10)

    const topPerformingAds = topAds?.map(ad => ({
      ...ad,
      clicks: ad.ad_clicks?.length || 0,
      impressions: ad.ad_impressions?.length || 0,
      ctr: ad.ad_impressions?.length > 0 
        ? ((ad.ad_clicks?.length || 0) / ad.ad_impressions.length * 100).toFixed(2)
        : 0
    })).sort((a, b) => parseFloat(b.ctr) - parseFloat(a.ctr)) || []

    return {
      totalAds: totalAds || 0,
      totalImpressions: totalImpressions || 0,
      totalClicks: totalClicks || 0,
      averageCTR: totalImpressions > 0 ? (totalClicks / totalImpressions * 100).toFixed(2) : 0,
      topPerformingAds
    }
  } catch (error) {
    console.error('خطأ في جلب تقرير الأداء:', error)
    return {
      totalAds: 0,
      totalImpressions: 0,
      totalClicks: 0,
      averageCTR: 0,
      topPerformingAds: []
    }
  }
}

// تصدير الخدمات مع caching محسن
export const loadAdvertisements = withCache(_loadAdvertisements, 3 * 60 * 1000) // 3 دقائق
export const getAdvertisementById = withCache(_getAdvertisementById, 5 * 60 * 1000) // 5 دقائق
export const getAdStatistics = withCache(_getAdStatistics, 2 * 60 * 1000) // 2 دقائق
export const getActiveAdsByPosition = withCache(_getActiveAdsByPosition, 5 * 60 * 1000) // 5 دقائق
export const getAllActiveAds = withCache(_getAllActiveAds, 3 * 60 * 1000) // 3 دقائق
export const searchAdvertisements = withCache(_searchAdvertisements, 5 * 60 * 1000) // 5 دقائق
export const getPerformanceReport = withCache(_getPerformanceReport, 10 * 60 * 1000) // 10 دقائق

// وظائف إدارة الـ cache للإعلانات
export const invalidateAdvertisementsCache = () => {
  cacheInvalidate('loadAdvertisements')
  cacheInvalidate('getAdvertisementById')
  cacheInvalidate('getActiveAdsByPosition')
  cacheInvalidate('getAllActiveAds')
  cacheInvalidate('searchAdvertisements')
  cacheInvalidate('getPerformanceReport')
}

export const invalidateAdStatisticsCache = (adId) => {
  cacheInvalidate(`getAdStatistics:${adId}`)
}