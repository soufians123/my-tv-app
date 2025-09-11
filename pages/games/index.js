import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import Layout from '../../components/Layout'
import SearchSystem from '../../components/SearchSystem'
import { BannerAd, CardAd, InlineAd } from '../../components/AdvertisementSystem'
import { useFavorites } from '../../components/FavoritesSystem'
import { GameSystemProvider, PlayerStats, AchievementsPanel, Leaderboard, GameStats } from '../../components/games/GameSystem'
import { Trophy, Star, Play, Users, Clock, Target, Gamepad2, Heart, Award, Crown, TrendingUp, Medal, Sparkles } from 'lucide-react'
import Link from 'next/link'
import { useToast } from '../../components/ToastSystem'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Badge } from '../../components/ui/badge'
import { gamesService } from '../../lib/gamesService'

const GamesPage = () => {
  const { user } = useAuth()
  const { showToast } = useToast()
  const { addToFavorites, removeFromFavorites, isFavorite } = useFavorites()
  const [games, setGames] = useState([])
  const [filteredGames, setFilteredGames] = useState([])
  const [leaderboard, setLeaderboard] = useState([])
  const [userStats, setUserStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState('all')

  // بيانات تجريبية للألعاب
  const sampleGames = [
    // الألعاب الجديدة المتقدمة
    {
      id: 'chess',
      title: 'الشطرنج الذكي',
      description: 'لعبة شطرنج متقدمة مع ذكاء اصطناعي قوي ومستويات صعوبة متدرجة',
      category: 'strategy',
      difficulty: 'hard',
      maxScore: 5000,
      playTime: '15-45 دقيقة',
      players: 2340,
      image: 'https://images.unsplash.com/photo-1606092195730-5d7b9af1efc5?w=300&h=200&fit=crop&crop=center',
      featured: true,
      rating: 4.9,
      achievements: ['سيد الشطرنج', 'استراتيجي محترف'],
      gameFile: '/games/chess'
    },
    {
      id: 'kingdom-wars',
      title: 'حرب الممالك',
      description: 'لعبة استراتيجية شاملة لإدارة الموارد وبناء الجيوش والتوسع',
      category: 'strategy',
      difficulty: 'hard',
      maxScore: 8000,
      playTime: '20-60 دقيقة',
      players: 1890,
      image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=200&fit=crop&crop=center',
      featured: true,
      rating: 4.8,
      achievements: ['ملك الحرب', 'استراتيجي عبقري'],
      gameFile: '/games/kingdom-wars'
    },
    {
      id: 'logic-puzzles',
      title: 'الألغاز المنطقية',
      description: 'تحديات منطقية متنوعة تشمل السودوكو والأنماط والرياضيات',
      category: 'puzzle',
      difficulty: 'medium',
      maxScore: 3000,
      playTime: '10-25 دقيقة',
      players: 1560,
      image: 'https://images.unsplash.com/photo-1606092195730-5d7b9af1efc5?w=300&h=200&fit=crop&crop=center',
      featured: true,
      rating: 4.7,
      achievements: ['عقل منطقي', 'حلال الألغاز'],
      gameFile: '/games/logic-puzzles'
    },
    {
      id: 'crossword',
      title: 'الكلمات المتقاطعة العربية',
      description: 'كلمات متقاطعة عربية تفاعلية مع مستويات صعوبة متدرجة',
      category: 'word',
      difficulty: 'medium',
      maxScore: 2500,
      playTime: '15-30 دقيقة',
      players: 1230,
      image: 'https://images.unsplash.com/photo-1611996575749-79a3a250f948?w=300&h=200&fit=crop&crop=center',
      featured: true,
      rating: 4.6,
      achievements: ['خبير الكلمات', 'لغوي ماهر'],
      gameFile: '/games/crossword'
    },
    {
      id: 'sudoku',
      title: 'السودوكو المتقدم',
      description: 'سودوكو بأنماط وأشكال مختلفة مع مولد ألغاز ذكي',
      category: 'puzzle',
      difficulty: 'medium',
      maxScore: 2000,
      playTime: '10-20 دقيقة',
      players: 1780,
      image: 'https://images.unsplash.com/photo-1606092195730-5d7b9af1efc5?w=300&h=200&fit=crop&crop=center',
      featured: true,
      rating: 4.8,
      achievements: ['سيد السودوكو', 'عقل رياضي'],
      gameFile: '/games/sudoku'
    },
    {
      id: 'memory',
      title: 'تحدي الذاكرة المتقدم',
      description: 'ألعاب ذاكرة متنوعة مع تحديات بصرية ومستويات تقدمية',
      category: 'memory',
      difficulty: 'medium',
      maxScore: 1800,
      playTime: '5-15 دقيقة',
      players: 2100,
      image: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=300&h=200&fit=crop&crop=center',
      featured: true,
      rating: 4.7,
      achievements: ['ذاكرة فولاذية', 'تركيز عالي'],
      gameFile: '/games/memory'
    },
    {
      id: 'empire-builder',
      title: 'بناء الإمبراطورية',
      description: 'محاكاة اقتصادية شاملة لبناء وإدارة إمبراطورية عظيمة',
      category: 'simulation',
      difficulty: 'hard',
      maxScore: 10000,
      playTime: '30-90 دقيقة',
      players: 1450,
      image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=200&fit=crop&crop=center',
      featured: true,
      rating: 4.9,
      achievements: ['إمبراطور عظيم', 'اقتصادي محترف'],
      gameFile: '/games/empire-builder'
    },
    // ألعاب الذاكرة الكلاسيكية
    {
      id: 1,
      title: 'لعبة الذاكرة الكلاسيكية',
      description: 'اختبر قوة ذاكرتك مع هذه اللعبة المثيرة وتذكر مواقع البطاقات',
      category: 'memory',
      difficulty: 'easy',
      maxScore: 1000,
      playTime: '5-10 دقائق',
      players: 1250,
      image: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=300&h=200&fit=crop&crop=center',
      featured: false,
      rating: 4.8,
      achievements: ['ذاكرة حديدية', 'سرعة البرق']
    },
    {
      id: 2,
      title: 'ذاكرة الأرقام',
      description: 'تذكر تسلسل الأرقام المعقد واعيد كتابته بالترتيب الصحيح',
      category: 'memory',
      difficulty: 'medium',
      maxScore: 1500,
      playTime: '3-7 دقائق',
      players: 890,
      image: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=300&h=200&fit=crop&crop=center',
      featured: false,
      rating: 4.6,
      achievements: ['عبقري الأرقام']
    },
    // ألعاب الرياضيات
    {
      id: 3,
      title: 'الرياضيات السريعة',
      description: 'حل المسائل الرياضية بأسرع وقت ممكن واكسب نقاط إضافية',
      category: 'math',
      difficulty: 'medium',
      maxScore: 2000,
      playTime: '3-5 دقائق',
      players: 1450,
      image: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=300&h=200&fit=crop&crop=center',
      featured: true,
      rating: 4.7,
      achievements: ['عالم رياضيات', 'حاسبة بشرية']
    },
    {
      id: 4,
      title: 'جدول الضرب التفاعلي',
      description: 'اختبر معرفتك بجدول الضرب في تحدي زمني مثير',
      category: 'math',
      difficulty: 'easy',
      maxScore: 1200,
      playTime: '2-4 دقائق',
      players: 980,
      image: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=300&h=200&fit=crop&crop=center',
      featured: false,
      rating: 4.5,
      achievements: ['خبير الضرب']
    },
    {
      id: 5,
      title: 'معادلات الجبر',
      description: 'حل المعادلات الجبرية المعقدة واثبت مهاراتك الرياضية',
      category: 'math',
      difficulty: 'hard',
      maxScore: 3000,
      playTime: '8-12 دقيقة',
      players: 520,
      image: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=300&h=200&fit=crop&crop=center',
      featured: true,
      rating: 4.9,
      achievements: ['أستاذ الجبر', 'عبقري المعادلات']
    },
    // ألعاب الكلمات
    {
      id: 6,
      title: 'الكلمات المتقاطعة العربية',
      description: 'اكتشف الكلمات المخفية في الشبكة وطور مفردatك العربية',
      category: 'word',
      difficulty: 'hard',
      maxScore: 1500,
      playTime: '10-15 دقيقة',
      players: 670,
      image: 'https://images.unsplash.com/photo-1611996575749-79a3a250f948?w=300&h=200&fit=crop&crop=center',
      featured: true,
      rating: 4.8,
      achievements: ['خبير الكلمات', 'لغوي ماهر']
    },
    {
      id: 7,
      title: 'تكوين الكلمات',
      description: 'كون أكبر عدد من الكلمات من الحروف المعطاة',
      category: 'word',
      difficulty: 'medium',
      maxScore: 1800,
      playTime: '5-8 دقائق',
      players: 1120,
      image: 'https://images.unsplash.com/photo-1611996575749-79a3a250f948?w=300&h=200&fit=crop&crop=center',
      featured: false,
      rating: 4.6,
      achievements: ['صانع الكلمات']
    },
    {
      id: 8,
      title: 'الكلمة المفقودة',
      description: 'اكمل الجمل بالكلمات المناسبة واختبر ثقافتك اللغوية',
      category: 'word',
      difficulty: 'easy',
      maxScore: 1000,
      playTime: '4-6 دقائق',
      players: 850,
      image: 'https://images.unsplash.com/photo-1611996575749-79a3a250f948?w=300&h=200&fit=crop&crop=center',
      featured: false,
      rating: 4.4,
      achievements: ['مكمل الجمل']
    },
    // ألعاب رد الفعل
    {
      id: 9,
      title: 'تحدي الألوان',
      description: 'اختبر سرعة رد فعلك مع الألوان المتغيرة بسرعة',
      category: 'reaction',
      difficulty: 'easy',
      maxScore: 800,
      playTime: '2-3 دقائق',
      players: 1100,
      image: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=300&h=200&fit=crop&crop=center',
      featured: false,
      rating: 4.3,
      achievements: ['سريع البديهة']
    },
    {
      id: 10,
      title: 'النقر السريع',
      description: 'انقر على الأهداف المتحركة بأسرع ما يمكن',
      category: 'reaction',
      difficulty: 'medium',
      maxScore: 1400,
      playTime: '1-3 دقائق',
      players: 1350,
      image: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=300&h=200&fit=crop&crop=center',
      featured: true,
      rating: 4.7,
      achievements: ['نقار محترف', 'عين الصقر']
    },
    // ألعاب الأحاجي
    {
      id: 11,
      title: 'أحجية الصور المقطعة',
      description: 'اعد تركيب الصورة من القطع المبعثرة',
      category: 'puzzle',
      difficulty: 'medium',
      maxScore: 2000,
      playTime: '8-12 دقيقة',
      players: 720,
      image: 'https://images.unsplash.com/photo-1606092195730-5d7b9af1efc5?w=300&h=200&fit=crop&crop=center',
      featured: true,
      rating: 4.8,
      achievements: ['مركب الصور', 'صبور']
    },
    {
      id: 12,
      title: 'متاهة الذكاء',
      description: 'اجد الطريق الصحيح عبر المتاهة المعقدة',
      category: 'puzzle',
      difficulty: 'hard',
      maxScore: 2500,
      playTime: '15-20 دقيقة',
      players: 450,
      image: 'https://images.unsplash.com/photo-1606092195730-5d7b9af1efc5?w=300&h=200&fit=crop&crop=center',
      featured: true,
      rating: 4.9,
      achievements: ['خبير المتاهات', 'عقل استراتيجي']
    },
    {
      id: 13,
      title: 'سودوكو العربي',
      description: 'حل لغز السودوكو الكلاسيكي بأرقام عربية',
      category: 'puzzle',
      difficulty: 'hard',
      maxScore: 3000,
      playTime: '20-30 دقيقة',
      players: 380,
      image: 'https://images.unsplash.com/photo-1606092195730-5d7b9af1efc5?w=300&h=200&fit=crop&crop=center',
      featured: false,
      rating: 4.8,
      achievements: ['أستاذ السودوكو']
    },
    // ألعاب السرعة
    {
      id: 14,
      title: 'سباق الكتابة',
      description: 'اكتب النص بأسرع ما يمكن دون أخطاء',
      category: 'speed',
      difficulty: 'medium',
      maxScore: 1200,
      playTime: '2-5 دقائق',
      players: 980,
      image: 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=300&h=200&fit=crop&crop=center',
      featured: false,
      rating: 4.5,
      achievements: ['كاتب سريع']
    },
    {
      id: 15,
      title: 'تحدي الحفظ السريع',
      description: 'احفظ المعلومات واسترجعها في أقل وقت ممكن',
      category: 'speed',
      difficulty: 'hard',
      maxScore: 2200,
      playTime: '3-6 دقائق',
      players: 650,
      image: 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=300&h=200&fit=crop&crop=center',
      featured: true,
      rating: 4.7,
      achievements: ['ذاكرة فوتوغرافية']
    },
    // ألعاب المنطق
    {
      id: 16,
      title: 'سلاسل المنطق',
      description: 'اكمل السلاسل المنطقية واكتشف النمط',
      category: 'logic',
      difficulty: 'medium',
      maxScore: 1600,
      playTime: '5-8 دقائق',
      players: 780,
      image: '/api/placeholder/300/200',
      featured: false,
      rating: 4.6,
      achievements: ['منطقي']
    },
    {
      id: 17,
      title: 'الاستنتاج المنطقي',
      description: 'حل المسائل باستخدام المنطق والاستنتاج',
      category: 'logic',
      difficulty: 'hard',
      maxScore: 2800,
      playTime: '10-15 دقيقة',
      players: 420,
      image: '/api/placeholder/300/200',
      featured: true,
      rating: 4.9,
      achievements: ['شيرلوك هولمز', 'عقل تحليلي']
    },
    // ألعاب الثقافة العامة
    {
      id: 18,
      title: 'اختبار الثقافة العامة',
      description: 'اختبر معلوماتك في مختلف المجالات الثقافية',
      category: 'trivia',
      difficulty: 'medium',
      maxScore: 1800,
      playTime: '8-12 دقيقة',
      players: 1200,
      image: '/api/placeholder/300/200',
      featured: true,
      rating: 4.7,
      achievements: ['مثقف', 'موسوعة معرفية']
    },
    {
      id: 19,
      title: 'جغرافيا العالم',
      description: 'اختبر معرفتك بجغرافيا العالم والدول',
      category: 'trivia',
      difficulty: 'hard',
      maxScore: 2400,
      playTime: '10-15 دقيقة',
      players: 680,
      image: '/api/placeholder/300/200',
      featured: false,
      rating: 4.8,
      achievements: ['خبير جغرافي']
    },
    {
      id: 20,
      title: 'تاريخ الحضارات',
      description: 'اكتشف معلومات شيقة عن تاريخ الحضارات القديمة',
      category: 'trivia',
      difficulty: 'hard',
      maxScore: 2600,
      playTime: '12-18 دقيقة',
      players: 540,
      image: '/api/placeholder/300/200',
      featured: true,
      rating: 4.9,
      achievements: ['مؤرخ', 'خبير الحضارات']
    }
  ]

  // بيانات تجريبية للوحة المتصدرين
  const sampleLeaderboard = [
    { id: 1, username: 'أحمد محمد', totalScore: 15420, gamesPlayed: 45, avatar: '/api/placeholder/40/40' },
    { id: 2, username: 'فاطمة علي', totalScore: 14890, gamesPlayed: 38, avatar: '/api/placeholder/40/40' },
    { id: 3, username: 'محمد حسن', totalScore: 13750, gamesPlayed: 42, avatar: '/api/placeholder/40/40' },
    { id: 4, username: 'سارة أحمد', totalScore: 12980, gamesPlayed: 35, avatar: '/api/placeholder/40/40' },
    { id: 5, username: 'عبدالله خالد', totalScore: 11650, gamesPlayed: 29, avatar: '/api/placeholder/40/40' },
    { id: 6, username: 'نور الدين', totalScore: 10890, gamesPlayed: 31, avatar: '/api/placeholder/40/40' },
    { id: 7, username: 'ليلى محمود', totalScore: 9750, gamesPlayed: 26, avatar: '/api/placeholder/40/40' },
    { id: 8, username: 'يوسف عمر', totalScore: 8920, gamesPlayed: 24, avatar: '/api/placeholder/40/40' }
  ]

  // تحميل فئات الألعاب من الخدمة
  const [categories, setCategories] = useState([
    { id: 'all', name: 'جميع الألعاب', count: sampleGames.length }
  ])
  
  // تحميل فئات الألعاب من الخدمة
  const loadCategories = async () => {
    try {
      const categoriesData = await gamesService.getGameCategories()
      if (categoriesData && categoriesData.length > 0) {
        // إضافة عدد الألعاب لكل فئة
        const categoriesWithCount = categoriesData.map(category => ({
          ...category,
          count: games.filter(g => g.category === category.id).length
        }))
        setCategories(categoriesWithCount)
      }
    } catch (error) {
      console.error('خطأ في تحميل فئات الألعاب:', error)
    }
  }

  useEffect(() => {
    loadGamesData()
  }, [])

  const loadGamesData = async () => {
    setLoading(true)
    try {
      // تحميل البيانات من الخدمة الجديدة
      const [gamesData, leaderboardData, userStatsData] = await Promise.all([
        gamesService.loadGames(),
        gamesService.loadLeaderboard(),
        user ? gamesService.loadUserStats(user.id) : Promise.resolve(null)
      ])
      
      setGames(gamesData)
      setFilteredGames(gamesData)
      setLeaderboard(leaderboardData)
      
      if (user && userStatsData) {
        setUserStats(userStatsData)
      }
      
      // تحميل فئات الألعاب بعد تحميل الألعاب
      await loadCategories()
      
      showToast('تم تحميل الألعاب بنجاح!', 'success')
    } catch (error) {
      console.error('خطأ في تحميل البيانات:', error)
      showToast('حدث خطأ أثناء تحميل البيانات', 'error')
    } finally {
      setLoading(false)
    }
  }

  // Handle search results from SearchSystem
  const handleSearchResults = (filteredResults) => {
    try {
      setFilteredGames(filteredResults)
    } catch (error) {
      console.error('خطأ في البحث:', error)
      setFilteredGames(games)
    }
  }

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'hard': return 'bg-red-100 text-red-800'
      case 'expert': return 'bg-indigo-100 text-indigo-800'
      case 'legend': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getDifficultyText = (difficulty) => {
    switch (difficulty) {
      case 'easy': return 'سهل'
      case 'medium': return 'عادي'
      case 'hard': return 'صعب'
      case 'expert': return 'خبير'
      case 'legend': return 'أسطوري'
      default: return 'غير محدد'
    }
  }

  const toggleFavorite = (gameId) => {
    const game = games.find(g => g.id === gameId)
    if (!game) return

    if (isFavorite('games', gameId)) {
      removeFromFavorites('games', gameId)
      showToast('تم إزالة اللعبة من المفضلة', 'success')
    } else {
      addToFavorites('games', {
        id: game.id,
        title: game.title,
        description: game.description,
        category: game.category,
        difficulty: game.difficulty,
        image: game.image,
        rating: game.rating
      })
      showToast('تم إضافة اللعبة للمفضلة', 'success')
    }
  }

  // Filter games based on selected category
  const getFilteredGames = () => {
    if (selectedCategory === 'all') {
      return filteredGames
    }
    return filteredGames.filter(game => game.category === selectedCategory)
  }

  const featuredGames = games.filter(game => game.featured)
  const displayedGames = getFilteredGames()

  if (!user) {
    return (
      <Layout>
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 sm:p-12 text-center border border-white/20 mx-4 sm:mx-auto max-w-md">
          <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Gamepad2 className="h-10 w-10 sm:h-12 sm:w-12 text-blue-600" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">يرجى تسجيل الدخول</h2>
          <p className="text-gray-600 mb-6 text-sm sm:text-base">يجب تسجيل الدخول للعب الألعاب وكسب النقاط</p>
          <Link href="/auth/login" className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-xl font-semibold hover:shadow-lg transition-all duration-200 transform hover:scale-105 inline-block">
            تسجيل الدخول
          </Link>
        </div>
      </Layout>
    )
  }

  return (
    <GameSystemProvider>
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 relative overflow-hidden">
          {/* Animated background elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-400/10 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-400/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-400/5 rounded-full blur-3xl animate-pulse" style={{animationDelay: '4s'}}></div>
          </div>
        <div className="relative space-y-8">
        {/* Enhanced Header */}
        <div className="relative bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white py-12 sm:py-16 overflow-hidden rounded-3xl mx-4 sm:mx-0">
          {/* Header background effects */}
          <div className="absolute inset-0">
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-500/20 to-purple-500/20"></div>
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-white/10 rounded-full blur-2xl animate-bounce" style={{animationDuration: '3s'}}></div>
            <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-white/5 rounded-full blur-3xl animate-bounce" style={{animationDuration: '4s', animationDelay: '1s'}}></div>
          </div>
          
          <div className="relative text-center px-4">
            <div className="mb-6">
              {/* Game Icon */}
              <div className="inline-flex items-center justify-center w-16 h-16 sm:w-18 sm:h-18 bg-white/20 backdrop-blur-sm rounded-full mb-6 transform hover:scale-110 transition-transform duration-300">
                <Gamepad2 className="h-8 w-8 sm:h-9 sm:w-9 text-white animate-pulse" />
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent whitespace-nowrap">
              مركز الألعاب التفاعلية
            </h1>
              <div className="w-24 h-1 bg-gradient-to-r from-yellow-400 to-orange-500 mx-auto rounded-full mb-4"></div>
            </div>
            <p className="text-blue-100 max-w-3xl mx-auto text-base sm:text-lg leading-relaxed">
              استمتع بمجموعة متنوعة من الألعاب المثيرة، اكسب النقاط، وتنافس مع اللاعبين الآخرين في تجربة تفاعلية
            </p>
            
            {/* Category Filter Pills */}
            <div className="mt-8 flex flex-wrap justify-center gap-2 sm:gap-3">
              {[
                { id: 'all', label: 'جميع الألعاب', icon: Gamepad2 },
                { id: 'strategy', label: 'استراتيجية', icon: Target },
                { id: 'puzzle', label: 'ألغاز', icon: Sparkles },
                { id: 'memory', label: 'ذاكرة', icon: Star },
                { id: 'math', label: 'رياضيات', icon: TrendingUp },
                { id: 'word', label: 'كلمات', icon: Award }
              ].map((category) => {
                const IconComponent = category.icon
                return (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`glass-morphism px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 transform hover:scale-105 flex items-center gap-2 ${
                      selectedCategory === category.id
                        ? 'bg-white/30 text-white shadow-lg border-white/40'
                        : 'bg-white/10 text-blue-100 hover:bg-white/20 hover:text-white border-white/20'
                    }`}
                  >
                    <IconComponent className="h-4 w-4" />
                     {category.label}
                   </button>
                 )
               })}
             </div>
            </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        ) : (
          <>
            {/* Enhanced Game System Navigation */}
            <div className="bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl border border-white/30 mx-4 sm:mx-0 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-1">
                <div className="bg-white/80 rounded-3xl p-6">
                  <div className="flex flex-wrap justify-center gap-3">
                    <button className="group px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-bold hover:from-blue-700 hover:to-blue-800 transition-all duration-300 transform hover:scale-105 hover:shadow-lg flex items-center gap-2">
                      <Play className="h-5 w-5 group-hover:animate-pulse" />
                      الألعاب
                    </button>
                    <button className="group px-6 py-3 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 rounded-xl font-bold hover:from-yellow-100 hover:to-yellow-200 hover:text-yellow-800 transition-all duration-300 transform hover:scale-105 hover:shadow-lg flex items-center gap-2">
                      <Award className="h-5 w-5 group-hover:animate-bounce" />
                      الإنجازات
                    </button>
                    <button className="group px-6 py-3 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 rounded-xl font-bold hover:from-yellow-100 hover:to-yellow-200 hover:text-yellow-800 transition-all duration-300 transform hover:scale-105 hover:shadow-lg flex items-center gap-2">
                      <Trophy className="h-5 w-5 group-hover:animate-bounce" />
                      المتصدرين
                    </button>
                    <button className="group px-6 py-3 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 rounded-xl font-bold hover:from-green-100 hover:to-green-200 hover:text-green-800 transition-all duration-300 transform hover:scale-105 hover:shadow-lg flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 group-hover:animate-pulse" />
                      الإحصائيات
                    </button>
                  </div>
                </div>
              </div>
            </div>
            {/* Enhanced User Stats */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-4 sm:p-6 text-white shadow-xl mx-4 sm:mx-0">
              <PlayerStats />
            </div>

            {/* Hero Banner Ad */}
            <div className="px-4 sm:px-0 mb-8">
              <BannerAd position="games-hero" />
            </div>

            {/* Featured Games */}
            {featuredGames.length > 0 && (
              <div className="px-4 sm:px-0">
                <div className="text-center mb-8">
                  <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                    ✨ الألعاب
                  </h2>
                  <p className="text-gray-600">اكتشف أفضل الألعاب المختارة خصيصاً لك</p>
                </div>
                
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-4 lg:gap-6">
                  {featuredGames.map((game, index) => (
                    <div key={game.id} className="group relative">
                      <div className="relative bg-white/90 backdrop-blur-sm rounded-lg sm:rounded-xl overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-white/30">
                        <div className="relative overflow-hidden">
                          <img
                            src={game.image}
                            alt={game.title}
                            className="w-full h-20 sm:h-32 md:h-40 object-cover group-hover:scale-110 transition-transform duration-700"
                          />
                          
                          {/* Overlay Effects */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />
                          
                          {/* Rating at top of image */}
                          <div className="absolute top-2 left-1/2 transform -translate-x-1/2 group-hover:scale-110 transition-transform duration-300">
                            <span className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-2 py-1 rounded-full text-xs font-bold flex items-center shadow-lg">
                              <Star className="h-3 w-3 mr-1 animate-pulse" />
                              {game.rating}
                            </span>
                          </div>
                          
                          {/* Smaller difficulty badge */}
                          <div className="absolute top-4 right-4 transform group-hover:scale-110 transition-transform duration-300">
                            <span className={`px-2 py-1 rounded-full text-xs font-bold backdrop-blur-md shadow-lg ${
                              getDifficultyColor(game.difficulty)
                            }`}>
                              {getDifficultyText(game.difficulty)}
                            </span>
                          </div>
                          
                          {/* Play Button Overlay */}
                          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500">
                            <img 
                              src={game.thumbnail || '/images/default-game.jpg'} 
                              alt={game.title}
                              className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-lg transform scale-75 group-hover:scale-100 transition-transform duration-300"
                            />
                          </div>
                        </div>
                        
                        <div className="p-2 sm:p-4 lg:p-6">
                          <h3 className="font-bold text-gray-900 mb-1 sm:mb-2 text-xs sm:text-sm lg:text-base group-hover:text-blue-600 transition-colors duration-300 line-clamp-1">{game.title}</h3>
                          
                          {/* Simplified Stats */}
                          <div className="hidden sm:flex items-center gap-2 sm:gap-4 mb-2 sm:mb-4">
                            <div className="flex items-center text-xs text-gray-600">
                              <Star className="h-3 w-3 mr-1 text-yellow-500" />
                              {game.rating}
                            </div>
                            <div className="flex items-center text-sm text-gray-600">
                              <Users className="h-4 w-4 mr-1 text-green-500" />
                              {game.players}
                            </div>
                          </div>
                          
                          {/* Enhanced Play Button */}
                          <Link
                              href={game.game_file ? game.game_file : `/games/${game.id}`}
                              target={game.game_file && /^https?:\/\//.test(game.game_file) ? '_blank' : undefined}
                              rel={game.game_file && /^https?:\/\//.test(game.game_file) ? 'noopener noreferrer' : undefined}
                              className="flex-1 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 text-white py-1 sm:py-2 px-2 sm:px-3 rounded-lg font-bold transition-all duration-300 transform hover:scale-105 hover:shadow-lg flex items-center justify-center text-xs sm:text-sm overflow-hidden">
                            {/* Animated background */}
                            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/30 to-white/0 -skew-x-12 -translate-x-full group-hover/play:translate-x-full transition-transform duration-1200"></div>
                            {/* Pulsing glow */}
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-400/50 via-purple-400/50 to-pink-400/50 rounded-2xl opacity-0 group-hover/play:opacity-100 transition-opacity duration-500 blur-xl"></div>
                            <Play className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-1 group-hover/play:scale-125 transition-all duration-300 fill-current relative z-10" />
                            <span className="relative z-10 transition-all duration-300 text-xs hidden sm:inline">العب</span>
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Inline Ad between Featured Games and Content */}
            <div className="px-4 sm:px-0 mb-8">
              <InlineAd position="games-content" size="large" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 px-4 sm:px-0">
              {/* Games List */}
              <div className="lg:col-span-2">
                {/* Advanced Search System */}
                <div className="mb-6">
                  <SearchSystem 
                    data={games}
                    onResults={handleSearchResults}
                    placeholder="البحث في الألعاب..."
                    type="games"
                  />
                </div>
                
                <div className="mb-6">
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-3">
                    <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                      {selectedCategory === 'all' ? 'جميع الألعاب' : 
                       selectedCategory === 'strategy' ? 'ألعاب الاستراتيجية' :
                       selectedCategory === 'puzzle' ? 'ألعاب الألغاز' :
                       selectedCategory === 'memory' ? 'ألعاب الذاكرة' :
                       selectedCategory === 'math' ? 'ألعاب الرياضيات' :
                       selectedCategory === 'word' ? 'ألعاب الكلمات' : 'الألعاب'}
                    </span>
                    <span className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-3 py-1 rounded-full text-sm font-medium shadow-lg">
                      {displayedGames.length}
                    </span>
                  </h2>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3 lg:gap-4">
                  {displayedGames.length === 0 ? (
                    <div className="col-span-full text-center py-12">
                      <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                        <Gamepad2 className="h-10 w-10 text-gray-400" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">لا توجد ألعاب</h3>
                      <p className="text-gray-600">
                        {selectedCategory === 'all' 
                          ? 'لم يتم العثور على ألعاب تطابق البحث'
                          : `لا توجد ألعاب في هذه الفئة`
                        }
                      </p>
                    </div>
                  ) : (
                    displayedGames.map((game, index) => (
                    <div key={game.id} className="group relative">
                      <div className="relative bg-white rounded-lg sm:rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden border border-gray-100 hover:border-blue-300">
                        <div className="relative overflow-hidden">
                          <img
                            src={game.image}
                            alt={game.title}
                            className="w-full h-12 sm:h-16 md:h-20 object-cover group-hover:scale-110 transition-transform duration-700"
                          />
                          
                          {/* Multi-layer overlay */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                          
                          {/* Animated play button with pulse */}
                          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500">
                            <div className="bg-white/30 backdrop-blur-md rounded-full p-4 transform scale-50 group-hover:scale-100 transition-all duration-500 shadow-2xl border-2 border-white/50 animate-bounce">
                              <Play className="h-8 w-8 text-white fill-current drop-shadow-lg" />
                            </div>
                          </div>
                          
                          {/* Floating particles effect */}
                          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
                            <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-white/60 rounded-full animate-ping"></div>
                            <div className="absolute top-3/4 right-1/4 w-1 h-1 bg-blue-300/80 rounded-full animate-pulse"></div>
                            <div className="absolute top-1/2 right-1/3 w-1.5 h-1.5 bg-purple-300/70 rounded-full animate-bounce"></div>
                          </div>
                          
                          {/* Rating at top of image */}
                          <div className="absolute top-2 left-1/2 transform -translate-x-1/2">
                            <div className="flex items-center bg-gradient-to-r from-yellow-400 via-yellow-500 to-orange-500 text-white px-2 py-1 rounded-full text-xs font-bold shadow-xl group-hover:shadow-2xl group-hover:scale-110 transition-all duration-300">
                              <Star className="h-3 w-3 mr-1 fill-current animate-spin" />
                              {game.rating}
                            </div>
                          </div>
                          
                          {/* Smaller category badge */}
                          <div className="absolute top-4 left-4">
                            <span className="bg-gradient-to-r from-white/95 to-gray-100/95 backdrop-blur-md text-gray-800 px-2 py-1 rounded-full text-xs font-bold shadow-xl border border-white/30 group-hover:shadow-2xl group-hover:scale-105 transition-all duration-300">
                              {game.category}
                            </span>
                          </div>
                          
                          {/* Shimmer sweep effect */}
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1500"></div>
                        </div>
                        
                        <div className="p-2 sm:p-3 lg:p-4">
                          <h3 className="font-bold text-gray-900 mb-1 sm:mb-2 text-xs sm:text-sm group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-purple-600 group-hover:bg-clip-text transition-all duration-500 line-clamp-1 leading-tight">{game.title}</h3>
                          
                          {/* Compact game statistics */}
                           <div className="hidden sm:grid grid-cols-3 gap-1 sm:gap-2 mb-2 sm:mb-3">
                             <div className="flex flex-col items-center gap-1 bg-gradient-to-br from-blue-50 to-blue-100 p-2 rounded-lg border border-blue-200 group-hover:shadow-lg transition-all duration-300">
                               <Users className="h-2 w-2 sm:h-3 sm:w-3 text-blue-600" />
                               <span className="text-xs text-blue-800 font-bold">{game.players}</span>
                               <span className="text-xs text-blue-600 hidden sm:block">لاعبين</span>
                             </div>
                             <div className="flex flex-col items-center gap-1 bg-gradient-to-br from-green-50 to-green-100 p-2 rounded-lg border border-green-200 group-hover:shadow-lg transition-all duration-300">
                               <Clock className="h-2 w-2 sm:h-3 sm:w-3 text-green-600" />
                               <span className="text-xs text-green-800 font-bold">{game.playTime || '15'}</span>
                               <span className="text-xs text-green-600 hidden sm:block">دقيقة</span>
                             </div>
                             <div className="flex flex-col items-center gap-1 bg-gradient-to-br from-purple-50 to-purple-100 p-2 rounded-lg border border-purple-200 group-hover:shadow-lg transition-all duration-300">
                               <Sparkles className="h-2 w-2 sm:h-3 sm:w-3 text-purple-600" />
                               <span className="text-xs text-purple-800 font-bold">{game.difficulty}</span>
                               <span className="text-xs text-purple-600 hidden sm:block">مستوى</span>
                             </div>
                           </div>
                          
                          {/* Premium action buttons */}
                          <div className="flex gap-1 sm:gap-2">
                            <Link
                              href={game.game_file ? game.game_file : `/games/${game.id}`}
                              target={game.game_file && /^https?:\/\//.test(game.game_file) ? '_blank' : undefined}
                              rel={game.game_file && /^https?:\/\//.test(game.game_file) ? 'noopener noreferrer' : undefined}
                              className="flex-1 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 text-white py-1 sm:py-2 px-2 sm:px-3 rounded-lg font-bold transition-all duration-300 transform hover:scale-105 hover:shadow-lg flex items-center justify-center text-xs sm:text-sm overflow-hidden">
                              {/* Animated background */}
                              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/30 to-white/0 -skew-x-12 -translate-x-full group-hover/play:translate-x-full transition-transform duration-1200"></div>
                              {/* Pulsing glow */}
                              <div className="absolute inset-0 bg-gradient-to-r from-blue-400/50 via-purple-400/50 to-pink-400/50 rounded-2xl opacity-0 group-hover/play:opacity-100 transition-opacity duration-500 blur-xl"></div>
                              <Play className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-1 group-hover/play:scale-125 transition-all duration-300 fill-current relative z-10" />
                              <span className="relative z-10 transition-all duration-300 text-xs hidden sm:inline">العب</span>
                            </Link>
                            <button
                              onClick={() => toggleFavorite(game.id)}
                              className={`p-1 sm:p-2 rounded-lg transition-all duration-300 transform hover:scale-110 relative overflow-hidden ${
                                isFavorite('games', game.id) 
                                  ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-xl hover:shadow-2xl' 
                                  : 'bg-gradient-to-r from-gray-200 to-gray-300 text-gray-600 hover:from-red-400 hover:to-pink-400 hover:text-white shadow-lg hover:shadow-xl'
                              }`}
                              title={isFavorite('games', game.id) ? 'إزالة من المفضلة' : 'إضافة للمفضلة'}>
                              {/* Heart glow effect */}
                              <div className={`absolute inset-0 rounded-2xl transition-opacity duration-500 blur-lg ${
                                isFavorite('games', game.id) ? 'bg-red-400/50 opacity-100' : 'bg-red-400/50 opacity-0 hover:opacity-100'
                              }`}></div>
                              <Heart className={`h-3 w-3 sm:h-4 sm:w-4 transition-all duration-300 relative z-10 ${
                                isFavorite('games', game.id) 
                                  ? 'fill-current scale-110 animate-pulse drop-shadow-lg' 
                                  : 'hover:scale-150 hover:fill-current'
                              }`} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )))}
                </div>
              </div>

              {/* Mobile Stats Section - After Games */}
              <div className="lg:hidden mt-6">
                <div className="bg-gradient-to-br from-blue-50/90 via-white/90 to-purple-50/90 backdrop-blur-sm rounded-2xl shadow-xl p-4 border border-blue-200/30 relative overflow-hidden">
                  {/* Decorative background elements */}
                  <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-blue-400/10 to-transparent rounded-full -translate-y-10 translate-x-10"></div>
                  <div className="absolute bottom-0 left-0 w-16 h-16 bg-gradient-to-tr from-purple-400/10 to-transparent rounded-full translate-y-8 -translate-x-8"></div>
                  
                  <div className="relative z-10">
                    <h2 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4 flex items-center">
                      <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl mr-3 shadow-lg">
                        <Medal className="h-4 w-4 text-white" />
                      </div>
                      إحصائياتك السريعة
                    </h2>
                    <GameStats />
                  </div>
                </div>
              </div>

              {/* Enhanced Sidebar */}
              <div className="space-y-6 hidden lg:block">
                {/* Quick Stats */}
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-4 sm:p-6 border border-white/20">
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 flex items-center">
                    <Medal className="h-5 w-5 text-blue-500 mr-2" />
                    إحصائياتك
                  </h2>
                  <GameStats />
                </div>

                {/* Recent Achievements */}
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-4 sm:p-6 border border-white/20">
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 flex items-center">
                    <Award className="h-5 w-5 text-yellow-500 mr-2" />
                    الإنجازات الأخيرة
                  </h2>
                  <AchievementsPanel limit={3} />
                </div>

                {/* Leaderboard */}
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-4 sm:p-6 border border-white/20">
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 flex items-center">
                    <Trophy className="h-5 w-5 text-yellow-500 mr-2" />
                    لوحة المتصدرين
                  </h2>
                  <Leaderboard limit={5} />
                  
                  <Link
                    href="/games/leaderboard"
                    className="mt-4 w-full bg-gradient-to-r from-gray-600 to-gray-700 text-white py-2 sm:py-2.5 px-4 rounded-xl font-semibold hover:shadow-lg transition-all duration-200 transform hover:scale-105 text-xs sm:text-sm text-center block"
                  >
                    عرض اللوحة الكاملة
                  </Link>
                </div>
              </div>
            </div>
          </>
        )}
        </div>
        </div>
      </Layout>
    </GameSystemProvider>
  );
}

export default GamesPage