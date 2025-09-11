// خدمة المنتجات التابعة مع Supabase

import { supabase } from './supabase'

// تحميل جميع المنتجات التابعة
export const loadAffiliateProducts = async (filters = {}) => {
  try {
    let query = supabase
      .from('affiliate_products')
      .select('*')

    // تطبيق الفلاتر
    if (filters.status) {
      query = query.eq('status', filters.status)
    }

    if (filters.category) {
      query = query.eq('category', filters.category)
    }

    if (filters.provider) {
      query = query.eq('provider', filters.provider)
    }

    if (filters.search) {
      query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`)
    }

    if (filters.minPrice) {
      query = query.gte('price', filters.minPrice)
    }

    if (filters.maxPrice) {
      query = query.lte('price', filters.maxPrice)
    }

    // ترتيب النتائج
    const sortBy = filters.sortBy || 'created_at'
    const sortOrder = filters.sortOrder || 'desc'
    query = query.order(sortBy, { ascending: sortOrder === 'asc' })

    // تحديد عدد النتائج
    if (filters.limit) {
      query = query.limit(filters.limit)
    }

    const { data, error } = await query

    if (error) {
      console.error('خطأ في تحميل المنتجات التابعة:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('خطأ في تحميل المنتجات التابعة:', error)
    return []
  }
}

// الحصول على منتج تابع بالمعرف
export const getAffiliateProductById = async (id) => {
  try {
    const { data, error } = await supabase
      .from('affiliate_products')
      .select(`
        *,
        affiliate_clicks(count),
        affiliate_earnings(sum(amount))
      `)
      .eq('id', id)
      .single()

    if (error) {
      console.error('خطأ في جلب المنتج التابع:', error)
      return null
    }

    return {
      ...data,
      total_clicks: data.affiliate_clicks?.length || 0,
      total_earnings: data.affiliate_earnings?.[0]?.sum || 0,
      conversion_rate: data.affiliate_clicks?.length > 0 
        ? ((data.affiliate_earnings?.length || 0) / data.affiliate_clicks.length * 100).toFixed(2)
        : 0
    }
  } catch (error) {
    console.error('خطأ في جلب المنتج التابع:', error)
    return null
  }
}

// إنشاء منتج تابع جديد
export const createAffiliateProduct = async (productData) => {
  try {
    const { data, error } = await supabase
      .from('affiliate_products')
      .insert({
        title: productData.title,
        description: productData.description,
        category: productData.category,
        provider: productData.provider,
        affiliate_url: productData.affiliate_url,
        image_url: productData.image_url,
        price: productData.price,
        original_price: productData.original_price,
        discount_percentage: productData.discount_percentage,
        commission_rate: productData.commission_rate,
        commission_type: productData.commission_type || 'percentage',
        rating: productData.rating || 0,
        reviews_count: productData.reviews_count || 0,
        features: productData.features || [],
        tags: productData.tags || [],
        status: productData.status || 'active',
        priority: productData.priority || 1,
        expires_at: productData.expires_at,
        created_by: productData.created_by
      })
      .select()
      .single()

    if (error) {
      console.error('خطأ في إنشاء المنتج التابع:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('خطأ في إنشاء المنتج التابع:', error)
    return null
  }
}

// تحديث منتج تابع
export const updateAffiliateProduct = async (id, updates) => {
  try {
    const { data, error } = await supabase
      .from('affiliate_products')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('خطأ في تحديث المنتج التابع:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('خطأ في تحديث المنتج التابع:', error)
    return null
  }
}

// حذف منتج تابع
export const deleteAffiliateProduct = async (id) => {
  try {
    const { error } = await supabase
      .from('affiliate_products')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('خطأ في حذف المنتج التابع:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('خطأ في حذف المنتج التابع:', error)
    return false
  }
}

// تسجيل نقرة على رابط تابع
export const recordAffiliateClick = async (productId, userId = null, metadata = {}) => {
  try {
    const { data, error } = await supabase
      .from('affiliate_clicks')
      .insert({
        product_id: productId,
        user_id: userId,
        ip_address: metadata.ip_address,
        user_agent: metadata.user_agent,
        page_url: metadata.page_url,
        referrer: metadata.referrer,
        device_type: metadata.device_type,
        browser: metadata.browser,
        location: metadata.location
      })
      .select()
      .single()

    if (error) {
      console.error('خطأ في تسجيل نقرة الرابط التابع:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('خطأ في تسجيل نقرة الرابط التابع:', error)
    return null
  }
}

// تسجيل عمولة
export const recordAffiliateEarning = async (productId, userId, amount, metadata = {}) => {
  try {
    const { data, error } = await supabase
      .from('affiliate_earnings')
      .insert({
        product_id: productId,
        user_id: userId,
        amount: amount,
        currency: metadata.currency || 'USD',
        conversion_id: metadata.conversion_id,
        order_value: metadata.order_value,
        commission_rate: metadata.commission_rate,
        status: 'pending'
      })
      .select()
      .single()

    if (error) {
      console.error('خطأ في تسجيل العمولة:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('خطأ في تسجيل العمولة:', error)
    return null
  }
}

// الحصول على إحصائيات المنتج التابع
export const getAffiliateStatistics = async (productId, dateRange = '30d') => {
  try {
    const daysAgo = parseInt(dateRange.replace('d', ''))
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - daysAgo)

    // عدد النقرات
    const { count: clicks } = await supabase
      .from('affiliate_clicks')
      .select('*', { count: 'exact', head: true })
      .eq('product_id', productId)
      .gte('created_at', startDate.toISOString())

    // إجمالي العمولات
    const { data: earnings } = await supabase
      .from('affiliate_earnings')
      .select('amount')
      .eq('product_id', productId)
      .gte('created_at', startDate.toISOString())

    const totalEarnings = earnings?.reduce((sum, earning) => sum + earning.amount, 0) || 0
    const conversions = earnings?.length || 0
    const conversionRate = clicks > 0 ? (conversions / clicks * 100).toFixed(2) : 0

    return {
      clicks: clicks || 0,
      conversions,
      conversionRate: parseFloat(conversionRate),
      totalEarnings: totalEarnings.toFixed(2),
      averageEarningPerClick: clicks > 0 ? (totalEarnings / clicks).toFixed(2) : '0.00'
    }
  } catch (error) {
    console.error('خطأ في جلب إحصائيات المنتج التابع:', error)
    return {
      clicks: 0,
      conversions: 0,
      conversionRate: 0,
      totalEarnings: '0.00',
      averageEarningPerClick: '0.00'
    }
  }
}

// الحصول على المنتجات الأكثر ربحية
export const getTopEarningProducts = async (limit = 10, dateRange = '30d') => {
  try {
    const daysAgo = parseInt(dateRange.replace('d', ''))
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - daysAgo)

    const { data, error } = await supabase
      .from('affiliate_products')
      .select(`
        id,
        title,
        category,
        provider,
        commission_rate,
        affiliate_earnings!inner(
          amount,
          created_at
        )
      `)
      .gte('affiliate_earnings.created_at', startDate.toISOString())
      .limit(limit)

    if (error) {
      console.error('خطأ في جلب المنتجات الأكثر ربحية:', error)
      return []
    }

    // حساب إجمالي الأرباح لكل منتج
    const productsWithEarnings = data?.map(product => {
      const totalEarnings = product.affiliate_earnings.reduce((sum, earning) => sum + earning.amount, 0)
      return {
        id: product.id,
        title: product.title,
        category: product.category,
        provider: product.provider,
        commission_rate: product.commission_rate,
        totalEarnings: totalEarnings.toFixed(2),
        conversions: product.affiliate_earnings.length
      }
    }).sort((a, b) => parseFloat(b.totalEarnings) - parseFloat(a.totalEarnings)) || []

    return productsWithEarnings
  } catch (error) {
    console.error('خطأ في جلب المنتجات الأكثر ربحية:', error)
    return []
  }
}

// البحث في المنتجات التابعة
export const searchAffiliateProducts = async (query, filters = {}) => {
  try {
    let supabaseQuery = supabase
      .from('affiliate_products')
      .select('*')
      .or(`title.ilike.%${query}%,description.ilike.%${query}%`)

    // تطبيق الفلاتر الإضافية
    if (filters.category) {
      supabaseQuery = supabaseQuery.eq('category', filters.category)
    }

    if (filters.provider) {
      supabaseQuery = supabaseQuery.eq('provider', filters.provider)
    }

    if (filters.minPrice) {
      supabaseQuery = supabaseQuery.gte('price', filters.minPrice)
    }

    if (filters.maxPrice) {
      supabaseQuery = supabaseQuery.lte('price', filters.maxPrice)
    }

    const { data, error } = await supabaseQuery
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(20)

    if (error) {
      console.error('خطأ في البحث في المنتجات التابعة:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('خطأ في البحث في المنتجات التابعة:', error)
    return []
  }
}

// الحصول على فئات المنتجات
export const getAffiliateCategories = async () => {
  try {
    const { data, error } = await supabase
      .from('affiliate_products')
      .select('category')
      .not('category', 'is', null)

    if (error) {
      console.error('خطأ في جلب فئات المنتجات:', error)
      return []
    }

    // استخراج الفئات الفريدة
    const uniqueCategories = [...new Set(data?.map(item => item.category).filter(Boolean))] || []
    
    return uniqueCategories.map(category => ({
      name: category,
      count: data?.filter(item => item.category === category).length || 0
    }))
  } catch (error) {
    console.error('خطأ في جلب فئات المنتجات:', error)
    return []
  }
}

// الحصول على مقدمي الخدمة
export const getAffiliateProviders = async () => {
  try {
    const { data, error } = await supabase
      .from('affiliate_products')
      .select('provider')
      .not('provider', 'is', null)

    if (error) {
      console.error('خطأ في جلب مقدمي الخدمة:', error)
      return []
    }

    // استخراج مقدمي الخدمة الفريدين
    const uniqueProviders = [...new Set(data?.map(item => item.provider).filter(Boolean))] || []
    
    return uniqueProviders.map(provider => ({
      name: provider,
      count: data?.filter(item => item.provider === provider).length || 0
    }))
  } catch (error) {
    console.error('خطأ في جلب مقدمي الخدمة:', error)
    return []
  }
}

// الحصول على تقرير الأداء الشامل
export const getAffiliatePerformanceReport = async (dateRange = '30d') => {
  try {
    const daysAgo = parseInt(dateRange.replace('d', ''))
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - daysAgo)

    // إجمالي المنتجات النشطة
    const { count: totalProducts } = await supabase
      .from('affiliate_products')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active')

    // إجمالي النقرات
    const { count: totalClicks } = await supabase
      .from('affiliate_clicks')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', startDate.toISOString())

    // إجمالي العمولات
    const { data: earnings } = await supabase
      .from('affiliate_earnings')
      .select('amount')
      .gte('created_at', startDate.toISOString())

    const totalEarnings = earnings?.reduce((sum, earning) => sum + earning.amount, 0) || 0
    const totalConversions = earnings?.length || 0
    const conversionRate = totalClicks > 0 ? (totalConversions / totalClicks * 100).toFixed(2) : 0

    return {
      totalProducts: totalProducts || 0,
      totalClicks: totalClicks || 0,
      totalConversions,
      totalEarnings: totalEarnings.toFixed(2),
      conversionRate: parseFloat(conversionRate),
      averageEarningPerClick: totalClicks > 0 ? (totalEarnings / totalClicks).toFixed(2) : '0.00'
    }
  } catch (error) {
    console.error('خطأ في جلب تقرير الأداء:', error)
    return {
      totalProducts: 0,
      totalClicks: 0,
      totalConversions: 0,
      totalEarnings: '0.00',
      conversionRate: 0,
      averageEarningPerClick: '0.00'
    }
  }
}