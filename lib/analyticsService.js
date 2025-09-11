// خدمة التحليلات مع Supabase

import { supabase } from './supabase'

// الحصول على إحصائيات عامة
export const getOverviewStats = async (dateRange = '7d') => {
  try {
    const daysAgo = parseInt(dateRange.replace('d', ''))
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - daysAgo)

    // إجمالي المستخدمين
    const { count: totalUsers } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })

    // المستخدمين النشطين (الذين سجلوا دخول في الفترة المحددة)
    const { count: activeUsers } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .gte('last_sign_in_at', startDate.toISOString())

    // المستخدمين الجدد
    const { count: newUsers } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', startDate.toISOString())

    // إجمالي مشاهدات المقالات
    const { data: articleViews } = await supabase
      .from('articles')
      .select('view_count')
      .eq('status', 'published')

    const totalArticleViews = articleViews?.reduce((sum, article) => sum + (article.view_count || 0), 0) || 0

    // إجمالي مشاهدات القنوات
    const { count: channelViews } = await supabase
      .from('channel_views')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', startDate.toISOString())

    // إجمالي الألعاب المُلعبة
    const { count: gameSessions } = await supabase
      .from('user_scores')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', startDate.toISOString())

    return {
      totalUsers: totalUsers || 0,
      activeUsers: activeUsers || 0,
      newUsers: newUsers || 0,
      returningUsers: (activeUsers || 0) - (newUsers || 0),
      pageViews: totalArticleViews + (channelViews || 0),
      sessions: gameSessions || 0,
      bounceRate: 35.2, // يمكن حسابها لاحقاً بناءً على بيانات أكثر تفصيلاً
      avgSessionDuration: 245, // يمكن حسابها لاحقاً
      conversionRate: 4.8 // يمكن حسابها بناءً على الأهداف المحددة
    }
  } catch (error) {
    console.error('خطأ في جلب الإحصائيات العامة:', error)
    return {
      totalUsers: 0,
      activeUsers: 0,
      newUsers: 0,
      returningUsers: 0,
      pageViews: 0,
      sessions: 0,
      bounceRate: 0,
      avgSessionDuration: 0,
      conversionRate: 0
    }
  }
}

// الحصول على اتجاهات البيانات
export const getTrendsData = async (dateRange = '7d') => {
  try {
    const days = parseInt(dateRange.replace('d', ''))
    const trends = {
      users: { current: 0, previous: 0, change: 0, data: [] },
      pageViews: { current: 0, previous: 0, change: 0, data: [] },
      sessions: { current: 0, previous: 0, change: 0, data: [] },
      revenue: { current: 0, previous: 0, change: 0, data: [] }
    }

    // جلب بيانات المستخدمين لكل يوم
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const nextDate = new Date(date)
      nextDate.setDate(nextDate.getDate() + 1)

      const { count: dailyUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', date.toISOString().split('T')[0])
        .lt('created_at', nextDate.toISOString().split('T')[0])

      trends.users.data.push(dailyUsers || 0)
    }

    // حساب المتوسطات والتغييرات
    trends.users.current = trends.users.data[trends.users.data.length - 1] || 0
    trends.users.previous = trends.users.data[Math.floor(trends.users.data.length / 2)] || 0
    trends.users.change = trends.users.previous > 0 
      ? ((trends.users.current - trends.users.previous) / trends.users.previous * 100)
      : 0

    // بيانات تجريبية للمقاييس الأخرى (يمكن تطويرها لاحقاً)
    trends.pageViews = {
      current: 45670,
      previous: 42340,
      change: 7.9,
      data: [40200, 41500, 42340, 43200, 44100, 44800, 45670]
    }

    trends.sessions = {
      current: 12340,
      previous: 11200,
      change: 10.2,
      data: [10800, 11000, 11200, 11500, 11800, 12100, 12340]
    }

    trends.revenue = {
      current: 25680,
      previous: 23450,
      change: 9.5,
      data: [22000, 22500, 23450, 24100, 24800, 25200, 25680]
    }

    return trends
  } catch (error) {
    console.error('خطأ في جلب بيانات الاتجاهات:', error)
    return {
      users: { current: 0, previous: 0, change: 0, data: [] },
      pageViews: { current: 0, previous: 0, change: 0, data: [] },
      sessions: { current: 0, previous: 0, change: 0, data: [] },
      revenue: { current: 0, previous: 0, change: 0, data: [] }
    }
  }
}

// الحصول على البيانات الديموغرافية
export const getDemographicsData = async () => {
  try {
    // جلب بيانات المستخدمين
    const { data: profiles } = await supabase
      .from('profiles')
      .select('age, gender, country')

    const totalUsers = profiles?.length || 0

    // تجميع البيانات حسب الفئات العمرية
    const ageGroups = {
      '18-24': 0,
      '25-34': 0,
      '35-44': 0,
      '45-54': 0,
      '55+': 0
    }

    // تجميع البيانات حسب الجنس
    const genderData = {
      'ذكر': 0,
      'أنثى': 0,
      'غير محدد': 0
    }

    // تجميع البيانات حسب البلد
    const locationData = {}

    profiles?.forEach(profile => {
      // تصنيف الأعمار
      if (profile.age) {
        if (profile.age >= 18 && profile.age <= 24) ageGroups['18-24']++
        else if (profile.age >= 25 && profile.age <= 34) ageGroups['25-34']++
        else if (profile.age >= 35 && profile.age <= 44) ageGroups['35-44']++
        else if (profile.age >= 45 && profile.age <= 54) ageGroups['45-54']++
        else if (profile.age >= 55) ageGroups['55+']++
      }

      // تصنيف الجنس
      if (profile.gender) {
        genderData[profile.gender] = (genderData[profile.gender] || 0) + 1
      } else {
        genderData['غير محدد']++
      }

      // تصنيف البلدان
      if (profile.country) {
        locationData[profile.country] = (locationData[profile.country] || 0) + 1
      }
    })

    // تحويل البيانات إلى النسق المطلوب
    const ageGroupsArray = Object.entries(ageGroups).map(([range, users]) => ({
      range,
      users,
      percentage: totalUsers > 0 ? (users / totalUsers * 100).toFixed(1) : 0
    }))

    const genderArray = Object.entries(genderData).map(([type, users]) => ({
      type,
      users,
      percentage: totalUsers > 0 ? (users / totalUsers * 100).toFixed(1) : 0
    }))

    const locationsArray = Object.entries(locationData)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([country, users]) => ({
        country,
        users,
        percentage: totalUsers > 0 ? (users / totalUsers * 100).toFixed(1) : 0
      }))

    return {
      ageGroups: ageGroupsArray,
      gender: genderArray,
      locations: locationsArray
    }
  } catch (error) {
    console.error('خطأ في جلب البيانات الديموغرافية:', error)
    return {
      ageGroups: [],
      gender: [],
      locations: []
    }
  }
}

// الحصول على بيانات الأجهزة والمتصفحات
export const getDevicesData = async () => {
  try {
    // بيانات تجريبية (يمكن تطويرها لاحقاً بناءً على تتبع أكثر تفصيلاً)
    return {
      types: [
        { type: 'Mobile', users: 5358, percentage: 60.0, icon: 'Smartphone' },
        { type: 'Desktop', users: 2679, percentage: 30.0, icon: 'Monitor' },
        { type: 'Tablet', users: 893, percentage: 10.0, icon: 'Tablet' }
      ],
      browsers: [
        { name: 'Chrome', users: 4465, percentage: 50.0, icon: 'Chrome' },
        { name: 'Safari', users: 2679, percentage: 30.0, icon: 'Safari' },
        { name: 'Firefox', users: 1072, percentage: 12.0, icon: 'Firefox' },
        { name: 'Edge', users: 714, percentage: 8.0, icon: 'Edge' }
      ]
    }
  } catch (error) {
    console.error('خطأ في جلب بيانات الأجهزة:', error)
    return {
      types: [],
      browsers: []
    }
  }
}

// الحصول على بيانات المحتوى الأكثر شعبية
export const getContentData = async () => {
  try {
    // أكثر المقالات مشاهدة
    const { data: topArticles } = await supabase
      .from('articles')
      .select('title, slug, view_count')
      .eq('status', 'published')
      .order('view_count', { ascending: false })
      .limit(10)

    // أكثر القنوات مشاهدة
    const { data: topChannels } = await supabase
      .from('channels')
      .select('name, viewers, favorites')
      .eq('status', 'active')
      .order('viewers', { ascending: false })
      .limit(10)

    // أكثر الألعاب لعباً
    const { data: topGames } = await supabase
      .from('games')
      .select('title, total_plays, average_score')
      .eq('status', 'active')
      .order('total_plays', { ascending: false })
      .limit(10)

    // تنسيق البيانات
    const topPages = [
      ...(topArticles?.map(article => ({
        path: `/articles/${article.slug}`,
        title: article.title,
        views: article.view_count || 0,
        uniqueViews: Math.floor((article.view_count || 0) * 0.7), // تقدير
        avgTime: 180 // تقدير
      })) || []),
      ...(topChannels?.map(channel => ({
        path: `/channels/${channel.name}`,
        title: channel.name,
        views: channel.viewers || 0,
        uniqueViews: Math.floor((channel.viewers || 0) * 0.8),
        avgTime: 300
      })) || []),
      ...(topGames?.map(game => ({
        path: `/games/${game.title}`,
        title: game.title,
        views: game.total_plays || 0,
        uniqueViews: Math.floor((game.total_plays || 0) * 0.9),
        avgTime: 240
      })) || [])
    ].sort((a, b) => b.views - a.views).slice(0, 10)

    return {
      topPages,
      topArticles: topArticles || [],
      topChannels: topChannels || [],
      topGames: topGames || []
    }
  } catch (error) {
    console.error('خطأ في جلب بيانات المحتوى:', error)
    return {
      topPages: [],
      topArticles: [],
      topChannels: [],
      topGames: []
    }
  }
}

// الحصول على جميع بيانات التحليلات
export const getAnalyticsData = async (dateRange = '7d') => {
  try {
    const [overview, trends, demographics, devices, content] = await Promise.all([
      getOverviewStats(dateRange),
      getTrendsData(dateRange),
      getDemographicsData(),
      getDevicesData(),
      getContentData()
    ])

    return {
      overview,
      trends,
      demographics,
      devices,
      content
    }
  } catch (error) {
    console.error('خطأ في جلب بيانات التحليلات:', error)
    return null
  }
}

// تصدير البيانات
export const exportAnalyticsData = async (dateRange = '7d', format = 'json') => {
  try {
    const data = await getAnalyticsData(dateRange)
    
    if (format === 'csv') {
      // تحويل البيانات إلى CSV
      const csvData = [
        ['المقياس', 'القيمة'],
        ['إجمالي المستخدمين', data.overview.totalUsers],
        ['المستخدمين النشطين', data.overview.activeUsers],
        ['المستخدمين الجدد', data.overview.newUsers],
        ['مشاهدات الصفحات', data.overview.pageViews],
        ['الجلسات', data.overview.sessions]
      ]
      
      return csvData.map(row => row.join(',')).join('\n')
    }
    
    return JSON.stringify(data, null, 2)
  } catch (error) {
    console.error('خطأ في تصدير البيانات:', error)
    return null
  }
}