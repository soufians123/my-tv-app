// خدمة الهدايا والنقاط مع Supabase

import { supabase } from './supabase'

// تحميل جميع الهدايا
export const loadGifts = async (filters = {}) => {
  try {
    let query = supabase
      .from('gifts')
      .select('*')

    // تطبيق الفلاتر
    if (filters.status) {
      query = query.eq('status', filters.status)
    }

    if (filters.category) {
      query = query.eq('category', filters.category)
    }

    if (filters.type) {
      query = query.eq('gift_type', filters.type)
    }

    if (filters.search) {
      query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`)
    }

    if (filters.minPoints) {
      query = query.gte('points_required', filters.minPoints)
    }

    if (filters.maxPoints) {
      query = query.lte('points_required', filters.maxPoints)
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
      console.error('خطأ في تحميل الهدايا:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('خطأ في تحميل الهدايا:', error)
    return []
  }
}

// الحصول على هدية بالمعرف
export const getGiftById = async (id) => {
  try {
    const { data, error } = await supabase
      .from('gifts')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      console.error('خطأ في جلب الهدية:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('خطأ في جلب الهدية:', error)
    return null
  }
}

// إنشاء هدية جديدة
export const createGift = async (giftData) => {
  try {
    const { data, error } = await supabase
      .from('gifts')
      .insert({
        title: giftData.title,
        description: giftData.description,
        category: giftData.category,
        gift_type: giftData.gift_type,
        points_required: giftData.points_required,
        image_url: giftData.image_url,
        value: giftData.value,
        currency: giftData.currency || 'USD',
        quantity_available: giftData.quantity_available,
        max_per_user: giftData.max_per_user || 1,
        expiry_date: giftData.expiry_date,
        terms_conditions: giftData.terms_conditions || [],
        status: giftData.status || 'active',
        priority: giftData.priority || 1,
        created_by: giftData.created_by
      })
      .select()
      .single()

    if (error) {
      console.error('خطأ في إنشاء الهدية:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('خطأ في إنشاء الهدية:', error)
    return null
  }
}

// تحديث هدية
export const updateGift = async (id, updates) => {
  try {
    const { data, error } = await supabase
      .from('gifts')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('خطأ في تحديث الهدية:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('خطأ في تحديث الهدية:', error)
    return null
  }
}

// حذف هدية
export const deleteGift = async (id) => {
  try {
    const { error } = await supabase
      .from('gifts')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('خطأ في حذف الهدية:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('خطأ في حذف الهدية:', error)
    return false
  }
}

// الحصول على نقاط المستخدم
export const getUserPoints = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('user_points')
      .select('total_points, available_points')
      .eq('user_id', userId)
      .single()

    if (error) {
      // إذا لم يكن للمستخدم سجل نقاط، أنشئ واحداً
      if (error.code === 'PGRST116') {
        const { data: newRecord, error: createError } = await supabase
          .from('user_points')
          .insert({
            user_id: userId,
            total_points: 0,
            available_points: 0
          })
          .select()
          .single()

        if (createError) {
          console.error('خطأ في إنشاء سجل النقاط:', createError)
          return { total_points: 0, available_points: 0 }
        }

        return newRecord
      }

      console.error('خطأ في جلب نقاط المستخدم:', error)
      return { total_points: 0, available_points: 0 }
    }

    return data
  } catch (error) {
    console.error('خطأ في جلب نقاط المستخدم:', error)
    return { total_points: 0, available_points: 0 }
  }
}

// إضافة نقاط للمستخدم
export const addUserPoints = async (userId, points, reason, metadata = {}) => {
  try {
    // الحصول على النقاط الحالية
    const currentPoints = await getUserPoints(userId)

    // تحديث النقاط
    const { data: updatedPoints, error: updateError } = await supabase
      .from('user_points')
      .update({
        total_points: currentPoints.total_points + points,
        available_points: currentPoints.available_points + points,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId)
      .select()
      .single()

    if (updateError) {
      console.error('خطأ في تحديث النقاط:', updateError)
      return null
    }

    // تسجيل المعاملة
    const { data: transaction, error: transactionError } = await supabase
      .from('point_transactions')
      .insert({
        user_id: userId,
        points: points,
        transaction_type: 'earned',
        reason: reason,
        metadata: metadata,
        balance_after: updatedPoints.available_points
      })
      .select()
      .single()

    if (transactionError) {
      console.error('خطأ في تسجيل معاملة النقاط:', transactionError)
    }

    return {
      points: updatedPoints,
      transaction
    }
  } catch (error) {
    console.error('خطأ في إضافة النقاط:', error)
    return null
  }
}

// خصم نقاط من المستخدم
export const deductUserPoints = async (userId, points, reason, metadata = {}) => {
  try {
    // الحصول على النقاط الحالية
    const currentPoints = await getUserPoints(userId)

    // التحقق من توفر النقاط الكافية
    if (currentPoints.available_points < points) {
      return {
        success: false,
        error: 'insufficient_points',
        message: 'النقاط المتاحة غير كافية'
      }
    }

    // تحديث النقاط
    const { data: updatedPoints, error: updateError } = await supabase
      .from('user_points')
      .update({
        available_points: currentPoints.available_points - points,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId)
      .select()
      .single()

    if (updateError) {
      console.error('خطأ في تحديث النقاط:', updateError)
      return {
        success: false,
        error: 'update_failed',
        message: 'فشل في تحديث النقاط'
      }
    }

    // تسجيل المعاملة
    const { data: transaction, error: transactionError } = await supabase
      .from('point_transactions')
      .insert({
        user_id: userId,
        points: -points,
        transaction_type: 'spent',
        reason: reason,
        metadata: metadata,
        balance_after: updatedPoints.available_points
      })
      .select()
      .single()

    if (transactionError) {
      console.error('خطأ في تسجيل معاملة النقاط:', transactionError)
    }

    return {
      success: true,
      points: updatedPoints,
      transaction
    }
  } catch (error) {
    console.error('خطأ في خصم النقاط:', error)
    return {
      success: false,
      error: 'system_error',
      message: 'خطأ في النظام'
    }
  }
}

// استبدال هدية بالنقاط
export const redeemGift = async (userId, giftId) => {
  try {
    // الحصول على تفاصيل الهدية
    const gift = await getGiftById(giftId)
    if (!gift) {
      return {
        success: false,
        error: 'gift_not_found',
        message: 'الهدية غير موجودة'
      }
    }

    // التحقق من حالة الهدية
    if (gift.status !== 'active') {
      return {
        success: false,
        error: 'gift_inactive',
        message: 'الهدية غير متاحة حالياً'
      }
    }

    // التحقق من الكمية المتاحة
    if (gift.quantity_available !== null && gift.quantity_available <= 0) {
      return {
        success: false,
        error: 'gift_out_of_stock',
        message: 'الهدية غير متاحة في المخزون'
      }
    }

    // التحقق من تاريخ انتهاء الصلاحية
    if (gift.expiry_date && new Date(gift.expiry_date) < new Date()) {
      return {
        success: false,
        error: 'gift_expired',
        message: 'انتهت صلاحية الهدية'
      }
    }

    // التحقق من الحد الأقصى للمستخدم
    if (gift.max_per_user) {
      const { count: userRedemptions } = await supabase
        .from('gift_claims')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('gift_id', giftId)

      if (userRedemptions >= gift.max_per_user) {
        return {
          success: false,
          error: 'max_redemptions_reached',
          message: 'تم الوصول للحد الأقصى من الاستبدال لهذه الهدية'
        }
      }
    }

    // خصم النقاط
    const deductResult = await deductUserPoints(
      userId,
      gift.points_required,
      `استبدال هدية: ${gift.title}`,
      { gift_id: giftId, gift_title: gift.title }
    )

    if (!deductResult.success) {
      return deductResult
    }

    // تسجيل الاستبدال
    const { data: redemption, error: redemptionError } = await supabase
      .from('gift_claims')
      .insert({
        user_id: userId,
        gift_id: giftId,
        points_spent: gift.points_required,
        status: 'pending',
        redemption_code: generateRedemptionCode()
      })
      .select()
      .single()

    if (redemptionError) {
      console.error('خطأ في تسجيل الاستبدال:', redemptionError)
      // إعادة النقاط في حالة الفشل
      await addUserPoints(
        userId,
        gift.points_required,
        `إعادة نقاط بسبب فشل الاستبدال: ${gift.title}`
      )
      return {
        success: false,
        error: 'redemption_failed',
        message: 'فشل في تسجيل الاستبدال'
      }
    }

    // تحديث كمية الهدية إذا كانت محدودة
    if (gift.quantity_available !== null) {
      await supabase
        .from('gifts')
        .update({ quantity_available: gift.quantity_available - 1 })
        .eq('id', giftId)
    }

    return {
      success: true,
      redemption,
      gift,
      remainingPoints: deductResult.points.available_points
    }
  } catch (error) {
    console.error('خطأ في استبدال الهدية:', error)
    return {
      success: false,
      error: 'system_error',
      message: 'خطأ في النظام'
    }
  }
}

// توليد رمز الاستبدال
const generateRedemptionCode = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let result = ''
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

// الحصول على تاريخ استبدال المستخدم
export const getUserRedemptions = async (userId, filters = {}) => {
  try {
    let query = supabase
      .from('gift_claims')
      .select(`
        *,
        gifts(
          title,
          description,
          image_url,
          category
        )
      `)
      .eq('user_id', userId)

    if (filters.status) {
      query = query.eq('status', filters.status)
    }

    if (filters.limit) {
      query = query.limit(filters.limit)
    }

    const { data, error } = await query
      .order('created_at', { ascending: false })

    if (error) {
      console.error('خطأ في جلب تاريخ الاستبدال:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('خطأ في جلب تاريخ الاستبدال:', error)
    return []
  }
}

// الحصول على تاريخ معاملات النقاط
export const getUserPointTransactions = async (userId, filters = {}) => {
  try {
    let query = supabase
      .from('point_transactions')
      .select('*')
      .eq('user_id', userId)

    if (filters.type) {
      query = query.eq('transaction_type', filters.type)
    }

    if (filters.limit) {
      query = query.limit(filters.limit)
    }

    const { data, error } = await query
      .order('created_at', { ascending: false })

    if (error) {
      console.error('خطأ في جلب تاريخ معاملات النقاط:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('خطأ في جلب تاريخ معاملات النقاط:', error)
    return []
  }
}

// البحث في الهدايا
export const searchGifts = async (query, filters = {}) => {
  try {
    let supabaseQuery = supabase
      .from('gifts')
      .select('*')
      .or(`title.ilike.%${query}%,description.ilike.%${query}%`)

    // تطبيق الفلاتر الإضافية
    if (filters.category) {
      supabaseQuery = supabaseQuery.eq('category', filters.category)
    }

    if (filters.type) {
      supabaseQuery = supabaseQuery.eq('gift_type', filters.type)
    }

    if (filters.minPoints) {
      supabaseQuery = supabaseQuery.gte('points_required', filters.minPoints)
    }

    if (filters.maxPoints) {
      supabaseQuery = supabaseQuery.lte('points_required', filters.maxPoints)
    }

    const { data, error } = await supabaseQuery
      .eq('status', 'active')
      .order('points_required', { ascending: true })
      .limit(20)

    if (error) {
      console.error('خطأ في البحث في الهدايا:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('خطأ في البحث في الهدايا:', error)
    return []
  }
}

// الحصول على فئات الهدايا
export const getGiftCategories = async () => {
  try {
    const { data, error } = await supabase
      .from('gifts')
      .select('category')
      .not('category', 'is', null)

    if (error) {
      console.error('خطأ في جلب فئات الهدايا:', error)
      return []
    }

    // استخراج الفئات الفريدة
    const uniqueCategories = [...new Set(data?.map(item => item.category).filter(Boolean))] || []
    
    return uniqueCategories.map(category => ({
      name: category,
      count: data?.filter(item => item.category === category).length || 0
    }))
  } catch (error) {
    console.error('خطأ في جلب فئات الهدايا:', error)
    return []
  }
}

// الحصول على إحصائيات النقاط والهدايا
export const getPointsStatistics = async (dateRange = '30d') => {
  try {
    const daysAgo = parseInt(dateRange.replace('d', ''))
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - daysAgo)

    // إجمالي النقاط الموزعة
    const { data: earnedPoints } = await supabase
      .from('point_transactions')
      .select('points')
      .eq('transaction_type', 'earned')
      .gte('created_at', startDate.toISOString())

    const totalEarnedPoints = earnedPoints?.reduce((sum, transaction) => sum + transaction.points, 0) || 0

    // إجمالي النقاط المستخدمة
    const { data: spentPoints } = await supabase
      .from('point_transactions')
      .select('points')
      .eq('transaction_type', 'spent')
      .gte('created_at', startDate.toISOString())

    const totalSpentPoints = Math.abs(spentPoints?.reduce((sum, transaction) => sum + transaction.points, 0) || 0)

    // عدد الاستبدالات
    const { count: totalRedemptions } = await supabase
      .from('gift_claims')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', startDate.toISOString())

    // المستخدمون النشطون
    const { count: activeUsers } = await supabase
      .from('user_points')
      .select('*', { count: 'exact', head: true })
      .gt('available_points', 0)

    return {
      totalEarnedPoints,
      totalSpentPoints,
      totalRedemptions: totalRedemptions || 0,
      activeUsers: activeUsers || 0,
      pointsUtilizationRate: totalEarnedPoints > 0 ? (totalSpentPoints / totalEarnedPoints * 100).toFixed(2) : 0
    }
  } catch (error) {
    console.error('خطأ في جلب إحصائيات النقاط:', error)
    return {
      totalEarnedPoints: 0,
      totalSpentPoints: 0,
      totalRedemptions: 0,
      activeUsers: 0,
      pointsUtilizationRate: 0
    }
  }
}

// احصاء عدد المطالبات لكل مجموعة هدايا
export const getClaimCountsForGifts = async (giftIds = []) => {
  try {
    if (!giftIds.length) return {}
    const { data, error } = await supabase
      .from('gift_claims')
      .select('gift_id')
      .in('gift_id', giftIds)

    if (error) {
      console.error('خطأ في جلب مطالبات الهدايا:', error)
      return {}
    }

    const counts = {}
    for (const row of data || []) {
      counts[row.gift_id] = (counts[row.gift_id] || 0) + 1
    }
    return counts
  } catch (error) {
    console.error('خطأ في حساب مطالبات الهدايا:', error)
    return {}
  }
}