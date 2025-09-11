import { supabase, db } from './supabase'

// بيانات احتياطية في حالة عدم توفر Supabase
const fallbackGames = [
  {
    id: 'chess',
    title: 'الشطرنج الذكي',
    description: 'لعبة شطرنج متقدمة مع ذكاء اصطناعي قوي ومستويات صعوبة متدرجة',
    category: 'strategy',
    difficulty: 'hard',
    max_score: 5000,
    play_time: '15-45 دقيقة',
    players: 2340,
    image: 'https://images.unsplash.com/photo-1606092195730-5d7b9af1efc5?w=300&h=200&fit=crop&crop=center',
    featured: true,
    rating: 4.9,
    achievements: ['سيد الشطرنج', 'استراتيجية محترف'],
    game_file: '/games/chess',
    game_type: 'chess',
    instructions: [
      'حرك القطع وفقاً لقواعد الشطرنج',
      'خطط لحماية الملك',
      'استخدم استراتيجيات متقدمة',
      'اهزم الذكاء الاصطناعي'
    ]
  },
  {
    id: 'memory',
    title: 'لعبة الذاكرة المتقدمة',
    description: 'اختبر قوة ذاكرتك مع مستويات متدرجة الصعوبة وتحديات مثيرة',
    category: 'memory',
    difficulty: 'medium',
    max_score: 3000,
    play_time: '5-15 دقيقة',
    players: 3450,
    image: 'https://images.unsplash.com/photo-1606092195730-5d7b9af1efc5?w=300&h=200&fit=crop&crop=center',
    featured: false,
    rating: 4.6,
    achievements: ['ذاكرة فولاذية', 'سرعة البرق'],
    game_file: '/games/memory',
    game_type: 'memory',
    instructions: [
      'انقر على البطاقات لكشفها',
      'ابحث عن الأزواج المتطابقة',
      'اكمل جميع الأزواج قبل انتهاء الوقت',
      'كلما أنهيت بسرعة، كلما حصلت على نقاط أكثر'
    ]
  }
]

// بيانات احتياطية للوحة المتصدرين
const fallbackLeaderboard = [
  {
    user_id: '1',
    username: 'أحمد محمد',
    avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face',
    total_score: 15420,
    games_played: 45,
    best_score: 4850,
    achievements_count: 12,
    rank: 1
  },
  {
    user_id: '2',
    username: 'فاطمة علي',
    avatar_url: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=40&h=40&fit=crop&crop=face',
    total_score: 14230,
    games_played: 38,
    best_score: 4200,
    achievements_count: 10,
    rank: 2
  }
]

// التحقق من حالة Supabase
const isSupabaseConfigured = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  return url && key && url !== 'your_supabase_project_url' && key !== 'your_supabase_anon_key'
}

// خدمات الألعاب
export const gamesService = {
  // تحميل جميع الألعاب
  async loadGames() {
    try {
      if (isSupabaseConfigured()) {
        const { data, error } = await supabase
          .from('games')
          .select('*')
          .order('featured', { ascending: false })
        
        if (error) throw error
        return data || fallbackGames
      }
      return fallbackGames
    } catch (error) {
      console.warn('فشل في تحميل الألعاب من قاعدة البيانات، استخدام البيانات الاحتياطية:', error)
      return fallbackGames
    }
  },

  // تحميل لعبة محددة
  async loadGame(gameId) {
    try {
      if (isSupabaseConfigured()) {
        const { data, error } = await supabase
          .from('games')
          .select('*')
          .eq('id', gameId)
          .single()
        
        if (error) throw error
        return data
      }
      return fallbackGames.find(game => game.id === gameId)
    } catch (error) {
      console.warn('فشل في تحميل اللعبة من قاعدة البيانات، استخدام البيانات الاحتياطية:', error)
      return fallbackGames.find(game => game.id === gameId)
    }
  },

  // تحميل لوحة المتصدرين
  async loadLeaderboard(gameId = null) {
    try {
      if (isSupabaseConfigured()) {
        let query = supabase
          .from('user_scores')
          .select(`
            user_id,
            score,
            users!inner(
              username,
              avatar_url
            )
          `)
          .order('score', { ascending: false })
          .limit(10)
        
        if (gameId) {
          query = query.eq('game_id', gameId)
        }
        
        const { data, error } = await query
        
        if (error) throw error
        
        // تحويل البيانات إلى التنسيق المطلوب
        const leaderboard = data?.map((item, index) => ({
          user_id: item.user_id,
          username: item.users.username,
          avatar_url: item.users.avatar_url,
          total_score: item.score,
          rank: index + 1
        })) || fallbackLeaderboard
        
        return leaderboard
      }
      return fallbackLeaderboard
    } catch (error) {
      console.warn('فشل في تحميل لوحة المتصدرين من قاعدة البيانات، استخدام البيانات الاحتياطية:', error)
      return fallbackLeaderboard
    }
  },

  // حفظ نقاط المستخدم
  async saveUserScore(userId, gameId, score) {
    try {
      if (isSupabaseConfigured() && userId) {
        // التحقق من وجود نقاط سابقة للمستخدم في هذه اللعبة
        const { data: existingScore } = await supabase
          .from('user_scores')
          .select('score')
          .eq('user_id', userId)
          .eq('game_id', gameId)
          .single()
        
        if (existingScore && existingScore.score >= score) {
          return { success: true, message: 'النقاط الحالية أقل من أو تساوي النقاط المحفوظة' }
        }
        
        // حفظ أو تحديث النقاط
        const { data, error } = await supabase
          .from('user_scores')
          .upsert({
            user_id: userId,
            game_id: gameId,
            score: score,
            created_at: new Date().toISOString()
          })
        
        if (error) throw error
        return { success: true, data }
      }
      
      // في وضع التطوير، حفظ النقاط في localStorage
      const scores = JSON.parse(localStorage.getItem('userScores') || '{}')
      if (!scores[userId]) scores[userId] = {}
      if (!scores[userId][gameId] || scores[userId][gameId] < score) {
        scores[userId][gameId] = score
        localStorage.setItem('userScores', JSON.stringify(scores))
      }
      return { success: true }
    } catch (error) {
      console.warn('فشل في حفظ النقاط:', error)
      return { error }
    }
  },

  // تحميل إحصائيات المستخدم
  async loadUserStats(userId) {
    try {
      if (isSupabaseConfigured() && userId) {
        const { data, error } = await supabase
          .from('user_scores')
          .select('score, game_id')
          .eq('user_id', userId)
        
        if (error) throw error
        
        // حساب الإحصائيات
        const totalScore = data?.reduce((sum, score) => sum + score.score, 0) || 0
        const gamesPlayed = data?.length || 0
        const bestScore = data?.length > 0 ? Math.max(...data.map(score => score.score)) : 0
        
        // حساب الترتيب من لوحة المتصدرين
        const leaderboard = await this.loadLeaderboard()
        const userRank = leaderboard.findIndex(user => user.user_id === userId) + 1
        
        return {
          totalScore,
          gamesPlayed,
          bestScore,
          rank: userRank || 0,
          achievements: Math.floor(totalScore / 1000) // إنجاز لكل 1000 نقطة
        }
      }
      
      // في وضع التطوير، استخدام بيانات احتياطية
      return {
        totalScore: 5420,
        gamesPlayed: 18,
        bestScore: 1850,
        rank: 15,
        achievements: 7
      }
    } catch (error) {
      console.warn('فشل في تحميل إحصائيات المستخدم:', error)
      return {
        totalScore: 0,
        gamesPlayed: 0,
        bestScore: 0,
        rank: 0,
        achievements: 0
      }
    }
  },

  // البحث في الألعاب
  async searchGames(query, category = null) {
    try {
      if (isSupabaseConfigured()) {
        let queryBuilder = supabase
          .from('games')
          .select('*')
        
        if (query) {
          queryBuilder = queryBuilder.or(`title.ilike.%${query}%,description.ilike.%${query}%`)
        }
        
        if (category && category !== 'all') {
          queryBuilder = queryBuilder.eq('category', category)
        }
        
        const { data, error } = await queryBuilder.order('featured', { ascending: false })
        
        if (error) throw error
        return data || []
      }
      
      // البحث في البيانات الاحتياطية
      const games = fallbackGames
      let filtered = games
      
      if (category && category !== 'all') {
        filtered = filtered.filter(game => game.category === category)
      }
      
      if (query) {
        const searchTerm = query.toLowerCase()
        filtered = filtered.filter(game => 
          game.title.toLowerCase().includes(searchTerm) ||
          game.description.toLowerCase().includes(searchTerm) ||
          game.category.toLowerCase().includes(searchTerm)
        )
      }
      
      return filtered
    } catch (error) {
      console.error('خطأ في البحث:', error)
      return []
    }
  },

  // الحصول على فئات الألعاب
  async getGameCategories() {
    try {
      if (isSupabaseConfigured()) {
        const { data, error } = await supabase
          .from('game_categories')
          .select('*')
          .order('name')
        
        if (error) throw error
        
        const categories = [{ id: 'all', name: 'جميع الألعاب', icon: '🎮' }]
        if (data) {
          categories.push(...data.map(cat => ({
            id: cat.id,
            name: cat.name,
            icon: cat.icon || '🎮'
          })))
        }
        
        return categories
      }
      
      return [
        { id: 'all', name: 'جميع الألعاب', icon: '🎮' },
        { id: 'strategy', name: 'استراتيجية', icon: '♟️' },
        { id: 'memory', name: 'ذاكرة', icon: '🧠' },
        { id: 'puzzle', name: 'ألغاز', icon: '🧩' },
        { id: 'word', name: 'كلمات', icon: '📝' },
        { id: 'math', name: 'رياضيات', icon: '🔢' },
        { id: 'reaction', name: 'رد الفعل', icon: '⚡' }
      ]
    } catch (error) {
      console.error('خطأ في تحميل الفئات:', error)
      return [
        { id: 'all', name: 'جميع الألعاب', icon: '🎮' },
        { id: 'strategy', name: 'استراتيجية', icon: '♟️' },
        { id: 'memory', name: 'ذاكرة', icon: '🧠' }
      ]
    }
  },

  // حفظ إنجاز جديد للمستخدم
  async saveUserAchievement(userId, gameId, achievementName, achievementDescription) {
    try {
      if (isSupabaseConfigured() && userId) {
        const { data, error } = await supabase
          .from('user_achievements')
          .insert({
            user_id: userId,
            game_id: gameId,
            achievement_name: achievementName,
            achievement_description: achievementDescription
          })
        
        if (error && error.code !== '23505') { // تجاهل خطأ التكرار
          throw error
        }
        
        return { success: true, data }
      }
      
      return { success: false, message: 'Supabase غير متاح' }
    } catch (error) {
      console.error('خطأ في حفظ الإنجاز:', error)
      return { success: false, error: error.message }
    }
  },

  // الحصول على إنجازات المستخدم
  async getUserAchievements(userId) {
    try {
      if (isSupabaseConfigured() && userId) {
        const { data, error } = await supabase
          .from('user_achievements')
          .select(`
            achievement_name,
            achievement_description,
            earned_at,
            games(title)
          `)
          .eq('user_id', userId)
          .order('earned_at', { ascending: false })
        
        if (error) throw error
        return data || []
      }
      
      return []
    } catch (error) {
      console.error('خطأ في تحميل الإنجازات:', error)
      return []
    }
  }
}

// تحديث لعبة
export const updateGame = async (id, updates) => {
  try {
    // تشكيل الحمولة المسموح بها وفق أعمدة جدول الألعاب
    const mapKeys = {
      is_featured: 'featured',
      thumbnail: 'image'
    }
    const allowedKeys = new Set([
      'title', 'description', 'category', 'difficulty', 'max_score', 'play_time',
      'players', 'image', 'featured', 'rating', 'achievements', 'game_file',
      'game_type', 'instructions'
    ])

    const payload = { updated_at: new Date().toISOString() }

    Object.keys(updates || {}).forEach((key) => {
      const mappedKey = mapKeys[key] || key
      if (allowedKeys.has(mappedKey)) {
        payload[mappedKey] = updates[key]
      }
    })

    if (isSupabaseConfigured()) {
      // لا نحاول تحديث "status" لأنه غير موجود في المخطط الحالي لجدول الألعاب
      const { data, error } = await supabase
        .from('games')
        .update(payload)
        .eq('id', id)
        .select()
        .single()

      if (error) {
        console.error('خطأ في تحديث اللعبة:', error)
        return null
      }
      return data
    }

    // وضع البيانات الاحتياطية (تطوير): تحديث داخل المصفوفة
    const index = fallbackGames.findIndex((g) => g.id === id)
    if (index === -1) return null

    // تطبيق التحديثات المسموح بها على العنصر الاحتياطي
    const current = fallbackGames[index]
    const updated = { ...current }

    Object.keys(payload).forEach((key) => {
      if (key !== 'updated_at') updated[key] = payload[key]
    })

    // دعم حالة status في الوضع الاحتياطي فقط لعمل لوحة الإدارة
    if (typeof updates?.status !== 'undefined') {
      updated.status = updates.status
    }

    // استبدال العنصر
    fallbackGames.splice(index, 1, updated)
    return updated
  } catch (error) {
    console.error('استثناء أثناء تحديث اللعبة:', error)
    return null
  }
}

// حذف لعبة
export const deleteGame = async (id) => {
  try {
    if (isSupabaseConfigured()) {
      const { error } = await supabase
        .from('games')
        .delete()
        .eq('id', id)

      if (error) {
        console.error('خطأ في حذف اللعبة:', error)
        return false
      }
      return true
    }

    // وضع البيانات الاحتياطية: إزالة من القائمة
    const index = fallbackGames.findIndex((g) => g.id === id)
    if (index === -1) return false
    fallbackGames.splice(index, 1)
    return true
  } catch (error) {
    console.error('استثناء أثناء حذف اللعبة:', error)
    return false
  }
}

// تصدير الوظائف المنفصلة للتوافق
export const getGameCategories = gamesService.getGameCategories;

export default gamesService

// إضافة لعبة رد الفعل الاحتياطية
fallbackGames.push({
  id: 'reaction-time',
  title: 'اختبار رد الفعل',
  description: 'اختبر سرعة رد فعلك واحصل على أفضل نتيجة في أقل وقت ممكن',
  category: 'reaction',
  difficulty: 'easy',
  max_score: 1000,
  play_time: '1-3 دقائق',
  players: 0,
  image: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=300&h=200&fit=crop&crop=center',
  featured: false,
  rating: 4.5,
  achievements: ['استجابة سريعة', 'عين صقر'],
  game_file: '/games/reaction-time',
  game_type: 'reaction',
  instructions: [
    'اضغط على المنطقة عندما يظهر اللون الأخضر',
    'حاول الحصول على أقل زمن ممكن',
    'تجنب الضغط قبل الإشارة (False Start)'
  ]
})