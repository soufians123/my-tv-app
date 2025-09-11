// خدمة إدارة المقالات مع Supabase

import { supabase } from './supabase'

// تحميل جميع المقالات
export const loadArticles = async (filters = {}) => {
  try {
    let queryBuilder = supabase
      .from('articles')
      .select(`
        *,
        article_categories(name, name_ar, slug, color, icon)
      `)

    // منطق الحالة: إذا كانت "all" فلا نضيف فلتر الحالة، وإذا لم تُمرر الحالة نقيّد بالحالة المنشورة فقط في السياق العام
    if (typeof filters.status !== 'undefined') {
      if (filters.status !== 'all') {
        queryBuilder = queryBuilder.eq('status', filters.status)
      }
    } else {
      if (!filters.admin && !filters.includeUnpublished) {
        queryBuilder = queryBuilder.eq('status', 'published')
      }
    }

    // للاستعلامات العامة (ليست إدارية)، طبّق شرط is_published=true حتى تتوافق مع RLS
    if (!filters.admin && !filters.includeUnpublished) {
      queryBuilder = queryBuilder.eq('is_published', true)
    }

    // فلترة حسب الفئة
    if (filters.category_id) {
      queryBuilder = queryBuilder.eq('category_id', filters.category_id)
    }

    // فلترة حسب الكاتب
    if (filters.author_id) {
      queryBuilder = queryBuilder.eq('author_id', filters.author_id)
    }

    // فلترة المقالات المميزة
    if (filters.featured) {
      queryBuilder = queryBuilder.eq('is_featured', true)
    }

    // البحث النصي
    if (filters.search) {
      queryBuilder = queryBuilder.or(`title.ilike.%${filters.search}%,excerpt.ilike.%${filters.search}%,content.ilike.%${filters.search}%`)
    }

    // الترتيب
    const orderBy = filters.orderBy || 'published_at'
    const orderDirection = filters.orderDirection || 'desc'
    queryBuilder = queryBuilder.order(orderBy, { ascending: orderDirection === 'asc' })

    // التصفح (Pagination)
    if (filters.limit) {
      queryBuilder = queryBuilder.limit(filters.limit)
    }
    if (filters.offset) {
      queryBuilder = queryBuilder.range(filters.offset, filters.offset + (filters.limit || 10) - 1)
    }

    let { data, error } = await queryBuilder

    // fallback في حالة غياب عمود is_published في قاعدة البيانات
    if (error && (error.code === '42703' || (error.message || '').includes('is_published'))) {
      console.warn('is_published column missing, retrying loadArticles without this filter')
      let fallbackQuery = supabase
        .from('articles')
        .select(`
          *,
          article_categories(name, name_ar, slug, color, icon)
        `)

      // نفس منطق الحالة كما أعلاه
      if (typeof filters.status !== 'undefined') {
        if (filters.status !== 'all') {
          fallbackQuery = fallbackQuery.eq('status', filters.status)
        }
      } else {
        if (!filters.admin && !filters.includeUnpublished) {
          fallbackQuery = fallbackQuery.eq('status', 'published')
        }
      }

      // لا نضيف شرط is_published هنا
      if (filters.category_id) fallbackQuery = fallbackQuery.eq('category_id', filters.category_id)
      if (filters.author_id) fallbackQuery = fallbackQuery.eq('author_id', filters.author_id)
      if (filters.featured) fallbackQuery = fallbackQuery.eq('is_featured', true)
      if (filters.search) fallbackQuery = fallbackQuery.or(`title.ilike.%${filters.search}%,excerpt.ilike.%${filters.search}%,content.ilike.%${filters.search}%`)

      fallbackQuery = fallbackQuery.order(orderBy, { ascending: orderDirection === 'asc' })
      if (filters.limit) fallbackQuery = fallbackQuery.limit(filters.limit)
      if (filters.offset) fallbackQuery = fallbackQuery.range(filters.offset, filters.offset + (filters.limit || 10) - 1)

      const retry = await fallbackQuery
      data = retry.data
      error = retry.error
    }

    if (error) {
      console.error('خطأ في تحميل المقالات:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('خطأ في الاتصال بقاعدة البيانات:', error)
    return []
  }
}

// تحميل فئات المقالات
export const loadArticleCategories = async () => {
  try {
    const { data, error } = await supabase
      .from('article_categories')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true })

    if (error) {
      console.error('خطأ في تحميل فئات المقالات:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('خطأ في الاتصال بقاعدة البيانات:', error)
    return []
  }
}

// الحصول على مقال بالمعرف
export const getArticleById = async (articleId) => {
  try {
    let { data, error } = await supabase
      .from('articles')
      .select(`
        *,
        article_categories(name, name_ar, slug, color, icon)
      `)
      .eq('id', articleId)
      .eq('status', 'published')
      .eq('is_published', true)
      .single()

    if (error && (error.code === '42703' || (error.message || '').includes('is_published'))) {
      console.warn('is_published column missing, retrying getArticleById without this filter')
      const retry = await supabase
        .from('articles')
        .select(`
          *,
          article_categories(name, name_ar, slug, color, icon)
        `)
        .eq('id', articleId)
        .eq('status', 'published')
        .single()
      data = retry.data
      error = retry.error
    }

    if (error) {
      console.error('خطأ في جلب المقال:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('خطأ في جلب المقال:', error)
    return null
  }
}

// الحصول على مقال بالـ slug
export const getArticleBySlug = async (slug) => {
  try {
    let { data, error } = await supabase
      .from('articles')
      .select(`
        *,
        article_categories(name, name_ar, slug, color, icon)
      `)
      .eq('slug', slug)
      .eq('status', 'published')
      .eq('is_published', true)
      .single()

    if (error && (error.code === '42703' || (error.message || '').includes('is_published'))) {
      console.warn('is_published column missing, retrying getArticleBySlug without this filter')
      const retry = await supabase
        .from('articles')
        .select(`
          *,
          article_categories(name, name_ar, slug, color, icon)
        `)
        .eq('slug', slug)
        .eq('status', 'published')
        .single()
      data = retry.data
      error = retry.error
    }

    if (error) {
      console.error('خطأ في جلب المقال:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('خطأ في جلب المقال:', error)
    return null
  }
}

// إنشاء مقال جديد
export const createArticle = async (articleData, authorId) => {
  try {
    // التأكد من وجود author_id صحيح أو إنشاء profile إذا لزم الأمر
    let validAuthorId = authorId;
    if (authorId) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', authorId)
        .single();
      
      if (!profile) {
        // إنشاء profile جديد للمستخدم
        const { data: newProfile } = await supabase
          .from('profiles')
          .insert([{ id: authorId, role: 'admin' }])
          .select()
          .single();
        
        if (!newProfile) {
          console.warn('Could not create profile for user, setting author_id to null');
          validAuthorId = null;
        }
      }
    }
    
    // إعداء slug أوليًا من البيانات أو من العنوان
    let slug = (articleData && typeof articleData.slug === 'string' ? articleData.slug.trim() : '') || generateSlug(articleData?.title);
    // التأكد من أن slug ليس null أو undefined بعد المعالجة
    if (!slug) {
      slug = `article-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      console.log('Fallback slug created:', slug);
    }

    // ضمان تفرد الـ slug قبل الإدراج
    for (let i = 0; i < 3; i++) {
      const { data: existing, error: slugCheckError } = await supabase
        .from('articles')
        .select('id')
        .eq('slug', slug)
        .single()
      // PGRST116: لا توجد صفوف (لا يوجد تضارب) => أخرج من الحلقة
      if (slugCheckError && slugCheckError.code === 'PGRST116') {
        break
      }
      // أخطاء أخرى أثناء التحقق: لا توقف العملية ولكن بلّغ واستمر دون تغيير إضافي
      if (slugCheckError && slugCheckError.code !== 'PGRST116') {
        console.warn('Slug uniqueness check error:', slugCheckError)
        break
      }
      // إذا وجد مقال بنفس الـ slug، أضف لاحقة عشوائية ثم أعد التحقق
      if (existing?.id) {
        slug = `${slug}-${Math.random().toString(36).substr(2, 5)}`
      } else {
        break
      }
    }

    const row = {
      title: articleData.title,
      slug: slug,
      excerpt: articleData.excerpt,
      content: articleData.content,
      featured_image: articleData.featured_image,
      author_id: validAuthorId,
      category_id: articleData.category_id,
      status: articleData.status || 'draft',
      // مزامنة العمود is_published مع الحالة ليتوافق مع سياسة RLS (إذا كان موجوداً)
      is_published: (articleData.status || 'draft') === 'published',
      is_featured: articleData.is_featured || false,
      tags: articleData.tags || [],
      // دعم الحقول الجديدة من مخطط قاعدة البيانات
      meta_title: articleData.meta_title || articleData.title,
      meta_description: articleData.meta_description || articleData.excerpt,
      reading_time: calculateReadingTime(articleData.content),
      published_at: articleData.status === 'published' ? new Date().toISOString() : null,
      // دعم الحقول القديمة للتوافق مع النسخ السابقة
      affiliate_links: articleData.affiliate_links || []
    }

    let { data, error } = await supabase
      .from('articles')
      .insert([row])
      .select()
      .single()

    if (error) {
      // تعارض فريد للـ slug (23505)
      if (
        error.code === '23505' &&
        (((error.message || '').toLowerCase().includes('slug')) || ((error.details || '').toLowerCase().includes('slug')))
      ) {
        console.warn('تعارض في slug، سيتم توليد لاحقة وإعادة المحاولة...')
        const newSlug = `${slug}-${Math.random().toString(36).substr(2, 5)}`
        const retryDup = await supabase
          .from('articles')
          .insert([{ ...row, slug: newSlug }])
          .select()
          .single()
        if (!retryDup.error) {
          return retryDup.data
        }
        console.error('فشل إنشاء المقال بعد حل تعارض slug:', retryDup.error)
        return null
      }
      // معالجة انتهاء صلاحية التوكن: حاول تحديث الجلسة ثم أعد المحاولة مرة واحدة
      if (
        error.code === 'PGRST303' ||
        (error.message && error.message.toLowerCase().includes('jwt expired'))
      ) {
        console.warn('انتهت صلاحية التوكن، سيتم تحديث الجلسة وإعادة المحاولة...')
        try {
          const { error: refreshError } = await supabase.auth.refreshSession()
          if (!refreshError) {
            const retry = await supabase
              .from('articles')
              .insert([row])
              .select()
              .single()
            if (!retry.error) {
              return retry.data
            }
            console.error('فشل إنشاء المقال بعد تحديث الجلسة:', retry.error)
          } else {
            console.error('فشل تحديث الجلسة:', refreshError)
          }
        } catch (e) {
          console.error('استثناء أثناء تحديث الجلسة:', e)
        }
        return null
      }

      // معالجة غياب أعمدة في كاش PostgREST مؤقتاً بإعادة المحاولة دون الحقول المفقودة
      if (
        (error.code === 'PGRST204' || error.code === '42703') &&
        ((error.message || '').includes('affiliate_links') || (error.message || '').includes('is_published'))
      ) {
        const missingAffiliate = (error.message || '').includes('affiliate_links')
        const missingIsPublished = (error.message || '').includes('is_published')
        const rowFallback = { ...row }
        if (missingAffiliate) delete rowFallback.affiliate_links
        if (missingIsPublished) delete rowFallback.is_published
        if (missingAffiliate) console.warn('affiliate_links column missing, retrying insert without it')
        if (missingIsPublished) console.warn('is_published column missing, retrying insert without it')

        let retry = await supabase
          .from('articles')
          .insert([rowFallback])
          .select()
          .single()

        // في حال ظهرت عمود مفقود آخر في المحاولة الثانية (مثل is_published بعد إزالة affiliate_links)
        if (
          retry.error &&
          (retry.error.code === 'PGRST204' || retry.error.code === '42703') &&
          (retry.error.message || '').includes('is_published') &&
          typeof rowFallback.is_published !== 'undefined'
        ) {
          console.warn('is_published column missing on retry, trying insert without it')
          delete rowFallback.is_published
          retry = await supabase
            .from('articles')
            .insert([rowFallback])
            .select()
            .single()
        }

        if (retry.error) {
          console.error('خطأ في إنشاء المقال (بعد إعادة المحاولات دون الأعمدة المفقودة):', retry.error)
          return null
        }
        return retry.data
      }

      console.error('خطأ في إنشاء المقال:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('خطأ في إنشاء المقال:', error)
    return null
  }
}

// تحديث مقال
export const updateArticle = async (articleId, updates, authorId) => {
  try {
    // التحقق من البيانات الحالية للمقال (بما في ذلى تاريخ النشر)
    const { data: existingArticle } = await supabase
      .from('articles')
      .select('author_id, published_at')
      .eq('id', articleId)
      .single()

    // التحقق من صلاحية التحديث إذا تم تمرير معرف الكاتب فقط
    if (authorId && existingArticle && existingArticle.author_id !== authorId) {
      throw new Error('غير مسموح بتحديث هذا المقال')
    }

    const updateData = {
      ...updates,
      updated_at: new Date().toISOString()
    }

    // إذا تم تمرير الحالة، حدث is_published ليتوافق مع سياسة RLS
    if (typeof updates.status !== 'undefined') {
      updateData.is_published = updates.status === 'published'
    }

    // إذا تم تغيير الحالة إلى منشور، تحديث تاريخ النشر
    if (updates.status === 'published' && (!existingArticle || !existingArticle.published_at)) {
      updateData.published_at = new Date().toISOString()
    }

    // إعادة حساب وقت القراءة إذا تم تحديث المحتوى
    if (updates.content) {
      updateData.reading_time = calculateReadingTime(updates.content)
    }

    let { data, error } = await supabase
      .from('articles')
      .update(updateData)
      .eq('id', articleId)
      .select()
      .single()

    if (error) {
      // معالجة تعارض فريد للـ slug عند التحديث
      if (
        error.code === '23505' &&
        (((error.message || '').toLowerCase().includes('slug')) || ((error.details || '').toLowerCase().includes('slug')))
      ) {
        console.warn('تعارض في slug أثناء التحديث، سيتم توليد لاحقة وإعادة المحاولة...')
        const retryUpdate = { ...updateData }
        retryUpdate.slug = `${updateData.slug || ''}-${Math.random().toString(36).substr(2, 5)}`
        const retry = await supabase
          .from('articles')
          .update(retryUpdate)
          .eq('id', articleId)
          .select()
          .single()
        if (!retry.error) {
          return retry.data
        }
        console.error('فشل تحديث المقال بعد حل تعارض slug:', retry.error)
        return null
      }
      // معالجة انتهاء صلاحية التوكن في التحديث
      if (
        error.code === 'PGRST303' ||
        (error.message && error.message.toLowerCase().includes('jwt expired'))
      ) {
        console.warn('انتهت صلاحية التوكن، سيتم تحديث الجلسة وإعادة المحاولة (update)...')
        try {
          const { error: refreshError } = await supabase.auth.refreshSession()
          if (!refreshError) {
            const retry = await supabase
              .from('articles')
              .update(updateData)
              .eq('id', articleId)
              .select()
              .single()
            if (!retry.error) {
              return retry.data
            }
            console.error('فشل تحديث المقال بعد تحديث الجلسة (update):', retry.error)
          } else {
            console.error('فشل تحديث الجلسة (update):', refreshError)
          }
        } catch (e) {
          console.error('استثناء أثناء تحديث الجلسة (update):', e)
        }
        return null
      }

      if (
        (error.code === 'PGRST204' || error.code === '42703') &&
        ((error.message || '').includes('affiliate_links') || (error.message || '').includes('is_published'))
      ) {
        const updateFallback = { ...updateData }
        const missingAffiliate = (error.message || '').includes('affiliate_links')
        const missingIsPublished = (error.message || '').includes('is_published')
        if (missingAffiliate) {
          console.warn('affiliate_links column missing, retrying update بدون هذا الحقل')
          delete updateFallback.affiliate_links
        }
        if (missingIsPublished) {
          console.warn('is_published column missing, retrying update بدون هذا الحقل')
          delete updateFallback.is_published
        }

        let retry = await supabase
          .from('articles')
          .update(updateFallback)
          .eq('id', articleId)
          .select()
          .single()

        if (
          retry.error &&
          (retry.error.code === 'PGRST204' || retry.error.code === '42703') &&
          (retry.error.message || '').includes('is_published') &&
          typeof updateFallback.is_published !== 'undefined'
        ) {
          console.warn('is_published column missing on retry, trying update بدون هذا الحقل')
          delete updateFallback.is_published
          retry = await supabase
            .from('articles')
            .update(updateFallback)
            .eq('id', articleId)
            .select()
            .single()
        }

        if (retry.error) {
          console.error('خطأ في تحديث المقال (بعد إعادة المحاولات دون الأعمدة المفقودة):', retry.error)
          return null
        }
        return retry.data
      }

      console.error('خطأ في تحديث المقال:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('خطأ في تحديث المقال:', error)
    return null
  }
}

// ذف مقال
export const deleteArticle = async (articleId, authorId) => {
  try {
    // التحقق من صلاحية الذف فقط إذا تم تمرير معرف الكاتب
    const { data: existingArticle } = await supabase
      .from('articles')
      .select('author_id')
      .eq('id', articleId)
      .single()

    if (authorId && existingArticle && existingArticle.author_id !== authorId) {
      throw new Error('غير مسموح بذف هذا المقال')
    }

    const { error } = await supabase
      .from('articles')
      .delete()
      .eq('id', articleId)

    if (error) {
      // معالجة انتهاء صلاحية التوكن في الحذف
      if (
        error.code === 'PGRST303' ||
        (error.message && error.message.toLowerCase().includes('jwt expired'))
      ) {
        console.warn('انتهت صلاحية التوكن، سيتم تحديث الجلسة وإعادة المحاولة (delete)...')
        try {
          const { error: refreshError } = await supabase.auth.refreshSession()
          if (!refreshError) {
            const retry = await supabase
              .from('articles')
              .delete()
              .eq('id', articleId)
            if (!retry.error) {
              return true
            }
            console.error('فشل حذف المقال بعد تحديث الجلسة:', retry.error)
          } else {
            console.error('فشل تحديث الجلسة:', refreshError)
          }
        } catch (e) {
          console.error('استثناء أثناء تحديث الجلسة:', e)
        }
        return false
      }

      console.error('خطأ في ذف المقال:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('خطأ في ذف المقال:', error)
    return false
  }
}

// تسجيل مشاهدة مقال
export const recordArticleView = async (articleId, userId = null, ipAddress = null, userAgent = null) => {
  try {
    const { error } = await supabase
      .from('article_views')
      .insert([
        {
          article_id: articleId,
          user_id: userId,
          ip_address: ipAddress,
          user_agent: userAgent
        }
      ])

    if (error) {
      console.error('خطأ في تسجيل المشاهدة:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('خطأ في تسجيل المشاهدة:', error)
    return false
  }
}

// إضافة إعجاب للمقال
export const likeArticle = async (articleId, userId) => {
  try {
    const { data, error } = await supabase
      .from('article_likes')
      .insert([
        {
          article_id: articleId,
          user_id: userId
        }
      ])
      .select()
      .single()

    if (error) {
      console.error('خطأ في إضافة الإعجاب:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('خطأ في إضافة الإعجاب:', error)
    return false
  }
}

// إزالة إعجاب من المقال
export const unlikeArticle = async (articleId, userId) => {
  try {
    const { error } = await supabase
      .from('article_likes')
      .delete()
      .eq('article_id', articleId)
      .eq('user_id', userId)

    if (error) {
      console.error('خطأ في إزالة الإعجاب:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('خطأ في إزالة الإعجاب:', error)
    return false
  }
}

// التحقق من إعجاب المستخدم بالمقال
export const checkUserLike = async (articleId, userId) => {
  try {
    const { data, error } = await supabase
      .from('article_likes')
      .select('id')
      .eq('article_id', articleId)
      .eq('user_id', userId)
      .single()

    if (error && error.code !== 'PGRST116') {
      console.error('خطأ في التحقق من الإعجاب:', error)
      return false
    }

    return !!data
  } catch (error) {
    console.error('خطأ في التحقق من الإعجاب:', error)
    return false
  }
}

// الحصول على تعليقات المقال
export const getArticleComments = async (articleId, parentId = null) => {
  try {
    let queryBuilder = supabase
      .from('article_comments')
      .select(`
        *,
        profiles(username, full_name, avatar_url)
      `)
      .eq('article_id', articleId)
      .eq('is_approved', true)
      .order('created_at', { ascending: true })

    if (parentId) {
      queryBuilder = queryBuilder.eq('parent_id', parentId)
    } else {
      queryBuilder = queryBuilder.is('parent_id', null)
    }

    const { data, error } = await queryBuilder

    if (error) {
      console.error('خطأ في جلب التعليقات:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('خطأ في جلب التعليقات:', error)
    return []
  }
}

// إضافة تعليق
export const addComment = async (articleId, userId, content, parentId = null) => {
  try {
    const { data, error } = await supabase
      .from('article_comments')
      .insert([
        {
          article_id: articleId,
          user_id: userId,
          parent_id: parentId,
          content: content,
          is_approved: true // يمكن تغييرها حسب نظام الموافقة
        }
      ])
      .select(`
        *,
        profiles(username, full_name, avatar_url)
      `)
      .single()

    if (error) {
      console.error('خطأ في إضافة التعليق:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('خطأ في إضافة التعليق:', error)
    return null
  }
}

// تحديث تعليق
export const updateComment = async (commentId, userId, content) => {
  try {
    const { data, error } = await supabase
      .from('article_comments')
      .update({
        content: content,
        updated_at: new Date().toISOString()
      })
      .eq('id', commentId)
      .eq('user_id', userId)
      .select()
      .single()

    if (error) {
      console.error('خطأ في تحديث التعليق:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('خطأ في تحديث التعليق:', error)
    return null
  }
}

// حذف تعليق
export const deleteComment = async (commentId, userId) => {
  try {
    const { error } = await supabase
      .from('article_comments')
      .delete()
      .eq('id', commentId)
      .eq('user_id', userId)

    if (error) {
      console.error('خطأ في حذف التعليق:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('خطأ في حذف التعليق:', error)
    return false
  }
}

// الحصول على المقالات ذات الصلة
export const getRelatedArticles = async (articleId, categoryId, limit = 5) => {
  try {
    let { data, error } = await supabase
      .from('articles')
      .select(`
        id, title, slug, excerpt, featured_image, published_at,
        article_categories(name, name_ar, slug, color)
      `)
      .eq('status', 'published')
      .eq('is_published', true)
      .eq('category_id', categoryId)
      .neq('id', articleId)
      .order('published_at', { ascending: false })
      .limit(limit)

    if (error && (error.code === '42703' || (error.message || '').includes('is_published'))) {
      console.warn('is_published column missing, retrying getRelatedArticles without this filter')
      const retry = await supabase
        .from('articles')
        .select(`
          id, title, slug, excerpt, featured_image, published_at,
          article_categories(name, name_ar, slug, color)
        `)
        .eq('status', 'published')
        .eq('category_id', categoryId)
        .neq('id', articleId)
        .order('published_at', { ascending: false })
        .limit(limit)
      data = retry.data
      error = retry.error
    }

    if (error) {
      console.error('خطأ في جلب المقالات ذات الصلة:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('خطأ في جلب المقالات ذات الصلة:', error)
    return []
  }
}

// الحصول على المقالات الشائعة
export const getPopularArticles = async (limit = 10, days = 7) => {
  try {
    const dateFrom = new Date()
    dateFrom.setDate(dateFrom.getDate() - days)

    let { data, error } = await supabase
      .from('articles')
      .select(`
        id, title, slug, excerpt, featured_image, view_count, like_count,
        article_categories(name, name_ar, slug, color)
      `)
      .eq('status', 'published')
      .eq('is_published', true)
      .gte('published_at', dateFrom.toISOString())
      .order('view_count', { ascending: false })
      .limit(limit)

    if (error && (error.code === '42703' || (error.message || '').includes('is_published'))) {
      console.warn('is_published column missing, retrying getPopularArticles without this filter')
      const retry = await supabase
        .from('articles')
        .select(`
          id, title, slug, excerpt, featured_image, view_count, like_count,
          article_categories(name, name_ar, slug, color)
        `)
        .eq('status', 'published')
        .gte('published_at', dateFrom.toISOString())
        .order('view_count', { ascending: false })
        .limit(limit)
      data = retry.data
      error = retry.error
    }

    if (error) {
      console.error('خطأ في جلب المقالات الشائعة:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('خطأ في جلب المقالات الشائعة:', error)
    return []
  }
}

// الحصول على إحصائيات المقالات
export const getArticlesStats = async () => {
  try {
    // إجمالي المقالات
    const { count: totalArticles } = await supabase
      .from('articles')
      .select('*', { count: 'exact', head: true })

    // المقالات المنشورة
    const { count: publishedArticles } = await supabase
      .from('articles')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'published')

    // المقالات المسودة
    const { count: draftArticles } = await supabase
      .from('articles')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'draft')

    // إجمالي المشاهدات
    const { data: viewsData } = await supabase
      .from('articles')
      .select('view_count')
      .eq('status', 'published')

    const totalViews = viewsData?.reduce((sum, article) => sum + (article.view_count || 0), 0) || 0

    // إجمالي الإعجابات
    const { data: likesData } = await supabase
      .from('articles')
      .select('like_count')
      .eq('status', 'published')

    const totalLikes = likesData?.reduce((sum, article) => sum + (article.like_count || 0), 0) || 0

    // إجمالي التعليقات
    const { count: totalComments } = await supabase
      .from('article_comments')
      .select('*', { count: 'exact', head: true })
      .eq('is_approved', true)

    return {
      totalArticles: totalArticles || 0,
      publishedArticles: publishedArticles || 0,
      draftArticles: draftArticles || 0,
      totalViews: totalViews,
      totalLikes: totalLikes,
      totalComments: totalComments || 0
    }
  } catch (error) {
    console.error('خطأ في جلب إحصائيات المقالات:', error)
    return {
      totalArticles: 0,
      publishedArticles: 0,
      draftArticles: 0,
      totalViews: 0,
      totalLikes: 0,
      totalComments: 0
    }
  }
}

// وظائف مساعدة

// توليد slug من العنوان
const generateSlug = (title) => {
  if (!title || typeof title !== 'string') {
    // إذا لم يكن هناك عنوان، أنشئ slug فريد
    return `article-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }

  let slug = title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // إزالة الرموز الخاصة
    .replace(/[\s_-]+/g, '-') // استبدال المسافات بشرطات
    .replace(/^-+|-+$/g, '') // إزالة الشرطات من البداية والنهاية

  // إذا كان الـ slug فارغاً بعد التنظيف، أنشئ slug فريد
  if (!slug || slug.length === 0) {
    return `article-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }

  // إضافة رقم عشوائي صغير لتجنب التكرار
  return `${slug}-${Math.random().toString(36).substr(2, 5)}`
}

// حساب وقت القراءة (بالدقائق)
const calculateReadingTime = (content) => {
  const wordsPerMinute = 200 // متوسط سرعة القراءة
  // إذا كان المحتوى HTML، أزل الوسوم لحساب أدق
  const text = typeof content === 'string' ? content.replace(/<[^>]*>/g, ' ') : ''
  const words = text.split(/\s+/).filter(Boolean).length
  return Math.ceil(words / wordsPerMinute)
}