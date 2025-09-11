import { useState, useEffect } from 'react'
import AdminLayout from '../../components/admin/AdminLayout'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useAuth } from '../../contexts/AuthContext'
import * as gamesService from '../../lib/gamesService'
import { 
  Gamepad2, 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Eye, 
  Star, 
  Users, 
  Play,
  Trophy,
  Target,
  MoreVertical,
  ArrowLeft,
  BarChart3,
  Settings,
  Gift,
  Clock,
  TrendingUp,
  Award,
  Zap,
  Download,
  Share2,
  Calendar,
  Activity,
  Layers,
  Puzzle
} from 'lucide-react'
import toast from 'react-hot-toast'

const AdminGames = () => {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [games, setGames] = useState([])
  const [filteredGames, setFilteredGames] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterCategory, setFilterCategory] = useState('all')
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedGame, setSelectedGame] = useState(null)
  const [showAnalyticsModal, setShowAnalyticsModal] = useState(false)
  const [showChallengesModal, setShowChallengesModal] = useState(false)
  const [showRewardsModal, setShowRewardsModal] = useState(false)
  const [viewMode, setViewMode] = useState('grid') // grid, list, analytics
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [sortBy, setSortBy] = useState('name')
  const [newGame, setNewGame] = useState({
    name: '',
    category: 'ذهنية',
    description: '',
    difficulty: 'متوسط',
    pointsReward: 10,
    status: 'active',
    type: 'interactive',
    duration: 10,
    challenges: 0,
    rewards: [],
    maxPlayers: 1
  })

  useEffect(() => {
    // يتم الاعتماد على AdminLayout للتحقق من الصلاحيات
    loadGames()
  }, [])

  useEffect(() => {
    filterGames()
  }, [games, searchTerm, filterStatus, filterCategory])

  const loadGames = async () => {
    try {
      // بيانات تجريبية للألعاب
      const mockGames = [
        {
          id: 1,
          name: 'لعبة الذاكرة',
          category: 'ذهنية',
          description: 'لعبة تحدي الذاكرة وتذكر الأرقام والألوان',
          thumbnail: '/api/placeholder/200/150',
          status: 'active',
          difficulty: 'متوسط',
          plays: 15420,
          averageScore: 850,
          highScore: 2340,
          players: 1250,
          rating: 4.5,
          pointsReward: 10,
          createdAt: '2024-01-15',
          lastUpdated: '2024-01-20',
          type: 'interactive',
          duration: 15,
          completionRate: 78,
          dailyPlayers: 45,
          weeklyGrowth: 12,
          challenges: 3,
          rewards: ['نقاط مضاعفة', 'شارة ذهبية'],
          analytics: {
            engagement: 85,
            retention: 72,
            satisfaction: 4.3
          }
        },
        {
          id: 2,
          name: 'لعبة الكلمات',
          category: 'لغوية',
          description: 'اكتشف الكلمات المخفية في الشبكة',
          thumbnail: '/api/placeholder/200/150',
          status: 'active',
          difficulty: 'سهل',
          plays: 8930,
          averageScore: 650,
          highScore: 1890,
          players: 890,
          rating: 4.2,
          pointsReward: 8,
          createdAt: '2024-01-10',
          lastUpdated: '2024-01-18',
          type: 'multiplayer',
          duration: 20,
          completionRate: 85,
          dailyPlayers: 67,
          weeklyGrowth: 8,
          challenges: 5,
          rewards: ['شارة فضية', 'نقاط إضافية'],
          analytics: {
            engagement: 92,
            retention: 81,
            satisfaction: 4.6
          }
        },
        {
          id: 3,
          name: 'لعبة الرياضيات',
          category: 'تعليمية',
          description: 'حل المسائل الرياضية في وقت محدود',
          thumbnail: '/api/placeholder/200/150',
          status: 'active',
          difficulty: 'صعب',
          plays: 12750,
          averageScore: 720,
          highScore: 2100,
          players: 1100,
          rating: 4.7,
          pointsReward: 15,
          createdAt: '2024-01-05',
          lastUpdated: '2024-01-19',
          type: 'challenge',
          duration: 10,
          completionRate: 65,
          dailyPlayers: 23,
          weeklyGrowth: -5,
          challenges: 8,
          rewards: ['شارة برونزية', 'تحدي خاص'],
          analytics: {
            engagement: 68,
            retention: 55,
            satisfaction: 4.1
          }
        },
        {
          id: 4,
          name: 'لعبة الألغاز',
          category: 'ذهنية',
          description: 'حل الألغاز المنطقية والتفكير النقدي',
          thumbnail: '/api/placeholder/200/150',
          status: 'inactive',
          difficulty: 'صعب',
          plays: 3450,
          averageScore: 450,
          highScore: 1560,
          players: 320,
          rating: 4.0,
          pointsReward: 12,
          createdAt: '2024-01-12',
          lastUpdated: '2024-01-16',
          type: 'puzzle',
          duration: 25,
          completionRate: 45,
          dailyPlayers: 12,
          weeklyGrowth: -15,
          challenges: 6,
          rewards: ['شارة الألغاز', 'مكافأة خاصة'],
          analytics: {
            engagement: 55,
            retention: 42,
            satisfaction: 3.8
          }
        },
        {
          id: 5,
          name: 'لعبة السرعة',
          category: 'مهارة',
          description: 'اختبر سرعة ردود أفعالك',
          thumbnail: '/api/placeholder/200/150',
          status: 'active',
          difficulty: 'متوسط',
          plays: 6780,
          averageScore: 580,
          highScore: 1780,
          players: 670,
          rating: 4.3,
          pointsReward: 9,
          createdAt: '2024-01-08',
          lastUpdated: '2024-01-17',
          type: 'reflex',
          duration: 5,
          completionRate: 88,
          dailyPlayers: 89,
          weeklyGrowth: 18,
          challenges: 4,
          rewards: ['شارة السرعة', 'نقاط مضاعفة'],
          analytics: {
            engagement: 94,
            retention: 76,
            satisfaction: 4.4
          }
        }
      ]
      setGames(mockGames)
    } catch (error) {
      console.error('Error loading games:', error)
      toast.error('حدث خطأ في تحميل الألعاب')
    }
  }

  const filterGames = () => {
    let filtered = games

    // البحث
    if (searchTerm) {
      filtered = filtered.filter(game => 
        game.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        game.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        game.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // فلترة الحالة
    if (filterStatus !== 'all') {
      filtered = filtered.filter(game => game.status === filterStatus)
    }

    // فلترة الفئة
    if (filterCategory !== 'all') {
      filtered = filtered.filter(game => game.category === filterCategory)
    }

    setFilteredGames(filtered)
  }

  const handleStatusChange = async (gameId, newStatus) => {
    try {
      setGames(games.map(game => 
        game.id === gameId 
          ? { ...game, status: newStatus, lastUpdated: new Date().toISOString().split('T')[0] }
          : game
      ))
      toast.success(`تم ${newStatus === 'active' ? 'تفعيل' : 'إلغاء تفعيل'} اللعبة بنجاح`)
    } catch (error) {
      toast.error('حدث خطأ في تحديث حالة اللعبة')
    }
  }

  const handleDelete = async (gameId) => {
    if (window.confirm('هل أنت متأكد من حذف هذه اللعبة؟')) {
      try {
        setGames(games.filter(game => game.id !== gameId))
        toast.success('تم حذف اللعبة بنجاح')
      } catch (error) {
        toast.error('حدث خطأ في حذف اللعبة')
      }
    }
  }

  const handleAddGame = async () => {
    try {
      const gameData = {
        ...newGame,
        id: Date.now(),
        thumbnail: '/api/placeholder/200/150',
        plays: 0,
        averageScore: 0,
        highScore: 0,
        players: 0,
        rating: 0,
        createdAt: new Date().toISOString().split('T')[0],
        lastUpdated: new Date().toISOString().split('T')[0]
      }
      
      setGames([...games, gameData])
      setNewGame({
        name: '',
        category: 'ذهنية',
        description: '',
        difficulty: 'متوسط',
        pointsReward: 10,
        status: 'active'
      })
      setShowAddModal(false)
      toast.success('تم إضافة اللعبة بنجاح')
    } catch (error) {
      toast.error('حدث خطأ في إضافة اللعبة')
    }
  }

  const handleEditGame = async () => {
    try {
      setGames(games.map(game => 
        game.id === selectedGame.id 
          ? { ...selectedGame, lastUpdated: new Date().toISOString().split('T')[0] }
          : game
      ))
      setShowEditModal(false)
      setSelectedGame(null)
      toast.success('تم تحديث اللعبة بنجاح')
    } catch (error) {
      toast.error('حدث خطأ في تحديث اللعبة')
    }
  }

  const openEditModal = (game) => {
    setSelectedGame({ ...game })
    setShowEditModal(true)
  }

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'سهل': return 'bg-green-100 text-green-800'
      case 'متوسط': return 'bg-yellow-100 text-yellow-800'
      case 'صعب': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </AdminLayout>
    )
  }


  // استخدام حالة لتخزين فئات الألعاب
  const [categories, setCategories] = useState(['all'])
  
  // تحميل فئات الألعاب من الخدمة
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const categoriesData = await gamesService.getGameCategories()
        if (categoriesData && categoriesData.length > 0) {
          // إضافة خيار 'الكل' في البداية
          setCategories(['all', ...categoriesData.map(cat => cat.name)])
        }
      } catch (error) {
        console.error('خطأ في تحميل فئات الألعاب:', error)
      }
    }
    
    loadCategories()
  }, [])

  return (
    <AdminLayout title="إدارة الألعاب" description="إدارة الألعاب والتحليلات والتحديات">
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Link
                  href="/admin"
                  className="text-gray-500 hover:text-gray-700 mr-4"
                  legacyBehavior>
                  <ArrowLeft className="w-6 h-6" />
                </Link>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                    <Gamepad2 className="w-8 h-8 text-primary-600 mr-3" />
                    إدارة الألعاب
                  </h1>
                  <p className="text-gray-600 mt-1">إدارة وتحديث الألعاب والتحديات</p>
                </div>
              </div>
              <button 
                onClick={() => setShowAddModal(true)}
                className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 flex items-center"
              >
                <Plus className="w-5 h-5 mr-2" />
                إضافة لعبة جديدة
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Enhanced Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center">
                <div className="p-3 rounded-lg bg-blue-100 mr-4">
                  <Gamepad2 className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">إجمالي الألعاب</p>
                  <p className="text-2xl font-bold text-gray-900">{games.length}</p>
                  <p className="text-xs text-green-600 mt-1">+2 هذا الأسبوع</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center">
                <div className="p-3 rounded-lg bg-green-100 mr-4">
                  <Play className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">اللاعبين اليوم</p>
                  <p className="text-2xl font-bold text-gray-900">{games.reduce((sum, game) => sum + (game.dailyPlayers || 0), 0).toLocaleString()}</p>
                  <p className="text-xs text-green-600 mt-1">+{games.reduce((sum, game) => sum + (game.weeklyGrowth || 0), 0)}% نمو</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center">
                <div className="p-3 rounded-lg bg-purple-100 mr-4">
                  <Users className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">الألعاب النشطة</p>
                  <p className="text-2xl font-bold text-gray-900">{games.filter(g => g.status === 'active').length}</p>
                  <p className="text-xs text-gray-500 mt-1">{Math.round((games.filter(g => g.status === 'active').length / games.length) * 100)}% من الإجمالي</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center">
                <div className="p-3 rounded-lg bg-yellow-100 mr-4">
                  <Trophy className="w-6 h-6 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">معدل الإكمال</p>
                  <p className="text-2xl font-bold text-gray-900">{Math.round(games.reduce((sum, game) => sum + (game.completionRate || 0), 0) / games.length)}%</p>
                  <p className="text-xs text-gray-500 mt-1">متوسط عام</p>
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Analytics Panel */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">تحليلات الألعاب التفاعلية</h3>
                <div className="flex space-x-2 space-x-reverse">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      viewMode === 'grid' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <Layers className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      viewMode === 'list' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <BarChart3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('analytics')}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      viewMode === 'analytics' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <TrendingUp className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mx-auto mb-3">
                    <Activity className="w-6 h-6 text-green-600" />
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-1">معدل التفاعل</h4>
                  <p className="text-2xl font-bold text-green-600">{Math.round(games.reduce((sum, game) => sum + (game.analytics?.engagement || 0), 0) / games.length)}%</p>
                  <p className="text-sm text-gray-500">متوسط التفاعل اليومي</p>
                </div>
                
                <div className="text-center">
                  <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mx-auto mb-3">
                    <Target className="w-6 h-6 text-blue-600" />
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-1">معدل الاحتفاظ</h4>
                  <p className="text-2xl font-bold text-blue-600">{Math.round(games.reduce((sum, game) => sum + (game.analytics?.retention || 0), 0) / games.length)}%</p>
                  <p className="text-sm text-gray-500">عودة اللاعبين</p>
                </div>
                
                <div className="text-center">
                  <div className="flex items-center justify-center w-12 h-12 bg-yellow-100 rounded-full mx-auto mb-3">
                    <Star className="w-6 h-6 text-yellow-600" />
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-1">معدل الرضا</h4>
                  <p className="text-2xl font-bold text-yellow-600">{(games.reduce((sum, game) => sum + (game.analytics?.satisfaction || 0), 0) / games.length).toFixed(1)}</p>
                  <p className="text-sm text-gray-500">من 5 نجوم</p>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Filters and Search */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <div className="flex flex-col space-y-4">
              {/* Top Row - Search and Main Actions */}
              <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="البحث في الألعاب..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>

                <div className="flex space-x-3 space-x-reverse">
                  <button
                    onClick={() => setShowAnalyticsModal(true)}
                    className="bg-blue-100 text-blue-700 px-4 py-2 rounded-lg hover:bg-blue-200 transition-colors flex items-center space-x-2 space-x-reverse"
                  >
                    <BarChart3 className="w-4 h-4" />
                    <span>التحليلات</span>
                  </button>
                  <button
                    onClick={() => setShowChallengesModal(true)}
                    className="bg-purple-100 text-purple-700 px-4 py-2 rounded-lg hover:bg-purple-200 transition-colors flex items-center space-x-2 space-x-reverse"
                  >
                    <Target className="w-4 h-4" />
                    <span>التحديات</span>
                  </button>
                  <button
                    onClick={() => setShowRewardsModal(true)}
                    className="bg-yellow-100 text-yellow-700 px-4 py-2 rounded-lg hover:bg-yellow-200 transition-colors flex items-center space-x-2 space-x-reverse"
                  >
                    <Gift className="w-4 h-4" />
                    <span>المكافآت</span>
                  </button>
                </div>
              </div>

              {/* Second Row - Advanced Filters */}
              <div className="flex flex-wrap gap-3">
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                >
                  <option value="all">جميع الحالات</option>
                  <option value="active">نشطة</option>
                  <option value="inactive">غير نشطة</option>
                </select>

                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                >
                  {categories.map(category => (
                    <option key={category} value={category}>
                      {category === 'all' ? 'جميع الفئات' : category}
                    </option>
                  ))}
                </select>

                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                >
                  <option value="all">جميع الأنواع</option>
                  <option value="interactive">تفاعلية</option>
                  <option value="multiplayer">متعددة اللاعبين</option>
                  <option value="challenge">تحدي</option>
                  <option value="puzzle">ألغاز</option>
                  <option value="reflex">ردود أفعال</option>
                </select>

                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                >
                  <option value="name">ترتيب بالاسم</option>
                  <option value="rating">ترتيب بالتقييم</option>
                  <option value="players">ترتيب باللاعبين</option>
                  <option value="engagement">ترتيب بالتفاعل</option>
                  <option value="completion">ترتيب بالإكمال</option>
                </select>

                <button
                  className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm flex items-center space-x-1 space-x-reverse"
                  onClick={() => {
                    setSearchTerm('');
                    setFilterStatus('all');
                    setFilterCategory('all');
                    setSelectedCategory('all');
                    setSortBy('name');
                  }}
                >
                  <Filter className="w-4 h-4" />
                  <span>إعادة تعيين</span>
                </button>
              </div>

              {/* Stats Row */}
              <div className="flex items-center justify-between text-sm text-gray-600 pt-2 border-t border-gray-100">
                <div className="flex space-x-6 space-x-reverse">
                  <span className="font-medium">عرض {filteredGames.length} من {games.length} لعبة</span>
                  <span>نشطة: <span className="text-green-600 font-medium">{filteredGames.filter(g => g.status === 'active').length}</span></span>
                  <span>غير نشطة: <span className="text-red-600 font-medium">{filteredGames.filter(g => g.status === 'inactive').length}</span></span>
                </div>
                <div className="flex space-x-4 space-x-reverse text-xs">
                  <span>متوسط التقييم: <span className="font-medium">{(filteredGames.reduce((sum, game) => sum + game.rating, 0) / filteredGames.length || 0).toFixed(1)}</span></span>
                  <span>إجمالي اللاعبين: <span className="font-medium">{filteredGames.reduce((sum, game) => sum + (game.dailyPlayers || 0), 0)}</span></span>
                </div>
              </div>
            </div>
          </div>

          {/* Games Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredGames.map((game) => (
              <div key={game.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                {/* Game Thumbnail */}
                <div className="relative">
                  <img 
                    src={game.thumbnail} 
                    alt={game.name}
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute top-4 right-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      game.status === 'active' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {game.status === 'active' ? 'نشطة' : 'غير نشطة'}
                    </span>
                  </div>
                  <div className="absolute top-4 left-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(game.difficulty)}`}>
                      {game.difficulty}
                    </span>
                  </div>
                </div>

                {/* Enhanced Game Info */}
                <div className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <h3 className="font-semibold text-gray-900">{game.name}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        game.type === 'interactive' ? 'bg-blue-100 text-blue-700' :
                        game.type === 'multiplayer' ? 'bg-green-100 text-green-700' :
                        game.type === 'challenge' ? 'bg-red-100 text-red-700' :
                        game.type === 'puzzle' ? 'bg-purple-100 text-purple-700' :
                        'bg-orange-100 text-orange-700'
                      }`}>
                        {game.type === 'interactive' ? 'تفاعلية' :
                         game.type === 'multiplayer' ? 'متعددة' :
                         game.type === 'challenge' ? 'تحدي' :
                         game.type === 'puzzle' ? 'ألغاز' : 'سرعة'}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <div className="flex items-center text-yellow-500">
                        <Star className="w-4 h-4 mr-1" />
                        <span className="text-sm font-medium">{game.rating}</span>
                      </div>
                      <div className="flex items-center text-gray-500">
                        <Clock className="w-4 h-4 mr-1" />
                        <span className="text-xs">{game.duration}د</span>
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-4">{game.description}</p>
                  
                  <div className="flex items-center justify-between text-sm mb-4">
                    <span className="bg-gray-100 px-2 py-1 rounded text-gray-700">{game.category}</span>
                    <div className="flex items-center space-x-3 space-x-reverse">
                      <span className="text-green-600 font-medium">{game.pointsReward} نقطة</span>
                      <span className="text-blue-600 text-xs">{game.challenges} تحدي</span>
                    </div>
                  </div>

                  {/* Enhanced Game Stats */}
                  <div className="grid grid-cols-4 gap-3 mb-4 text-center">
                    <div className="bg-blue-50 rounded-lg p-2">
                      <div className="flex items-center justify-center text-blue-600 mb-1">
                        <Users className="w-4 h-4" />
                      </div>
                      <p className="text-sm font-bold text-gray-900">{game.dailyPlayers || 0}</p>
                      <p className="text-xs text-gray-500">اليوم</p>
                    </div>
                    <div className="bg-green-50 rounded-lg p-2">
                      <div className="flex items-center justify-center text-green-600 mb-1">
                        <TrendingUp className="w-4 h-4" />
                      </div>
                      <p className="text-sm font-bold text-gray-900">{game.completionRate || 0}%</p>
                      <p className="text-xs text-gray-500">إكمال</p>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-2">
                      <div className="flex items-center justify-center text-purple-600 mb-1">
                        <Activity className="w-4 h-4" />
                      </div>
                      <p className="text-sm font-bold text-gray-900">{game.analytics?.engagement || 0}%</p>
                      <p className="text-xs text-gray-500">تفاعل</p>
                    </div>
                    <div className="bg-yellow-50 rounded-lg p-2">
                      <div className="flex items-center justify-center text-yellow-600 mb-1">
                        <Award className="w-4 h-4" />
                      </div>
                      <p className="text-sm font-bold text-gray-900">{game.rewards?.length || 0}</p>
                      <p className="text-xs text-gray-500">مكافأة</p>
                    </div>
                  </div>

                  {/* Growth Indicator */}
                  <div className="flex items-center justify-between text-sm mb-4">
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <span className="text-gray-600">النمو الأسبوعي:</span>
                      <span className={`font-medium flex items-center space-x-1 space-x-reverse ${
                        (game.weeklyGrowth || 0) >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {(game.weeklyGrowth || 0) >= 0 ? 
                          <TrendingUp className="w-3 h-3" /> : 
                          <TrendingUp className="w-3 h-3 transform rotate-180" />
                        }
                        <span>{Math.abs(game.weeklyGrowth || 0)}%</span>
                      </span>
                    </div>
                    <span className="text-xs text-gray-500">{game.lastUpdated}</span>
                  </div>

                  {/* Rewards Preview */}
                  {game.rewards && game.rewards.length > 0 && (
                    <div className="mb-4">
                      <p className="text-xs text-gray-600 mb-2">المكافآت المتاحة:</p>
                      <div className="flex flex-wrap gap-1">
                        {game.rewards.slice(0, 2).map((reward, index) => (
                          <span key={index} className="bg-yellow-100 text-yellow-700 text-xs px-2 py-1 rounded">
                            {reward}
                          </span>
                        ))}
                        {game.rewards.length > 2 && (
                          <span className="text-xs text-gray-500">+{game.rewards.length - 2} أخرى</span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Enhanced Actions */}
                  <div className="space-y-3">
                    {/* Primary Actions */}
                    <div className="flex space-x-2 space-x-reverse">
                      <button 
                        onClick={() => handleStatusChange(game.id, game.status === 'active' ? 'inactive' : 'active')}
                        className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                          game.status === 'active'
                            ? 'bg-red-100 text-red-700 hover:bg-red-200'
                            : 'bg-green-100 text-green-700 hover:bg-green-200'
                        }`}
                      >
                        {game.status === 'active' ? 'إلغاء التفعيل' : 'تفعيل'}
                      </button>
                      <button 
                        onClick={() => openEditModal(game)}
                        className="px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                        title="تعديل اللعبة"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => {
                          setSelectedGame(game);
                          setShowAnalyticsModal(true);
                        }}
                        className="px-3 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors"
                        title="عرض التحليلات"
                      >
                        <BarChart3 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(game.id)}
                        className="px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                        title="حذف اللعبة"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    
                    {/* Secondary Actions */}
                    <div className="flex space-x-2 space-x-reverse text-xs">
                      <button 
                        onClick={() => {
                          setSelectedGame(game);
                          setShowChallengesModal(true);
                        }}
                        className="flex-1 px-2 py-1 bg-yellow-50 text-yellow-700 rounded border border-yellow-200 hover:bg-yellow-100 transition-colors flex items-center justify-center space-x-1 space-x-reverse"
                      >
                        <Target className="w-3 h-3" />
                        <span>التحديات</span>
                      </button>
                      <button 
                        onClick={() => {
                          setSelectedGame(game);
                          setShowRewardsModal(true);
                        }}
                        className="flex-1 px-2 py-1 bg-green-50 text-green-700 rounded border border-green-200 hover:bg-green-100 transition-colors flex items-center justify-center space-x-1 space-x-reverse"
                      >
                        <Gift className="w-3 h-3" />
                        <span>المكافآت</span>
                      </button>
                      <button 
                        className="flex-1 px-2 py-1 bg-gray-50 text-gray-700 rounded border border-gray-200 hover:bg-gray-100 transition-colors flex items-center justify-center space-x-1 space-x-reverse"
                        title="مشاركة اللعبة"
                      >
                        <Share2 className="w-3 h-3" />
                        <span>مشاركة</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Empty State */}
          {filteredGames.length === 0 && (
            <div className="text-center py-12">
              <Gamepad2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد ألعاب</h3>
              <p className="text-gray-500 mb-4">لم يتم العثور على ألعاب تطابق معايير البحث</p>
              <button
                onClick={() => setShowAddModal(true)}
                className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700"
              >
                إضافة لعبة جديدة
              </button>
            </div>
          )}
        </div>

        {/* Add Game Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">إضافة لعبة جديدة</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">اسم اللعبة</label>
                  <input
                    type="text"
                    value={newGame.name}
                    onChange={(e) => setNewGame({...newGame, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="أدخل اسم اللعبة"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">الفئة</label>
                  <select
                    value={newGame.category}
                    onChange={(e) => setNewGame({...newGame, category: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="ذهنية">ذهنية</option>
                    <option value="لغوية">لغوية</option>
                    <option value="تعليمية">تعليمية</option>
                    <option value="مهارة">مهارة</option>
                    <option value="ترفيهية">ترفيهية</option>
                    <option value="رياضية">رياضية</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">الوصف</label>
                  <textarea
                    value={newGame.description}
                    onChange={(e) => setNewGame({...newGame, description: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    rows="3"
                    placeholder="أدخل وصف اللعبة"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">الصعوبة</label>
                    <select
                      value={newGame.difficulty}
                      onChange={(e) => setNewGame({...newGame, difficulty: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    >
                      <option value="سهل">سهل</option>
                      <option value="متوسط">متوسط</option>
                      <option value="صعب">صعب</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">النقاط</label>
                    <input
                      type="number"
                      value={newGame.pointsReward}
                      onChange={(e) => setNewGame({...newGame, pointsReward: parseInt(e.target.value)})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      min="1"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">الحالة</label>
                  <select
                    value={newGame.status}
                    onChange={(e) => setNewGame({...newGame, status: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="active">نشطة</option>
                    <option value="inactive">غير نشطة</option>
                  </select>
                </div>
              </div>
              
              <div className="flex space-x-3 space-x-reverse mt-6">
                <button
                  onClick={handleAddGame}
                  className="flex-1 bg-primary-600 text-white py-2 px-4 rounded-lg hover:bg-primary-700 transition-colors"
                >
                  إضافة اللعبة
                </button>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  إلغاء
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Analytics Modal */}
        {showAnalyticsModal && selectedGame && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold flex items-center space-x-2 space-x-reverse">
                  <BarChart3 className="w-6 h-6 text-purple-600" />
                  <span>تحليلات اللعبة: {selectedGame.name}</span>
                </h3>
                <button 
                  onClick={() => setShowAnalyticsModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ×
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-blue-600 font-medium">معدل المشاركة</p>
                      <p className="text-2xl font-bold text-blue-800">{selectedGame.analytics?.engagement || 0}%</p>
                    </div>
                    <Users className="w-8 h-8 text-blue-600" />
                  </div>
                </div>
                
                <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-green-600 font-medium">معدل الاحتفاظ</p>
                      <p className="text-2xl font-bold text-green-800">{selectedGame.analytics?.retention || 0}%</p>
                    </div>
                    <TrendingUp className="w-8 h-8 text-green-600" />
                  </div>
                </div>
                
                <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-yellow-600 font-medium">معدل الرضا</p>
                      <p className="text-2xl font-bold text-yellow-800">{selectedGame.analytics?.satisfaction || 0}</p>
                    </div>
                    <Star className="w-8 h-8 text-yellow-600" />
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold mb-3 flex items-center space-x-2 space-x-reverse">
                    <Calendar className="w-5 h-5 text-gray-600" />
                    <span>إحصائيات يومية</span>
                  </h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">اللاعبون اليوم:</span>
                      <span className="font-semibold">{selectedGame.dailyPlayers || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">معدل الإكمال:</span>
                      <span className="font-semibold">{selectedGame.completionRate || 0}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">النمو الأسبوعي:</span>
                      <span className="font-semibold text-green-600">+{selectedGame.weeklyGrowth || 0}%</span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold mb-3 flex items-center space-x-2 space-x-reverse">
                    <Clock className="w-5 h-5 text-gray-600" />
                    <span>معلومات اللعبة</span>
                  </h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">النوع:</span>
                      <span className="font-semibold">{selectedGame.type || 'غير محدد'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">المدة:</span>
                      <span className="font-semibold">{selectedGame.duration || 0} دقيقة</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">إجمالي اللعبات:</span>
                      <span className="font-semibold">{selectedGame.plays || 0}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setShowAnalyticsModal(false)}
                  className="bg-gray-600 text-white py-2 px-6 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  إغلاق
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Challenges Modal */}
        {showChallengesModal && selectedGame && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-3xl mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold flex items-center space-x-2 space-x-reverse">
                  <Target className="w-6 h-6 text-purple-600" />
                  <span>تحديات اللعبة: {selectedGame.name}</span>
                </h3>
                <button 
                  onClick={() => setShowChallengesModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ×
                </button>
              </div>
              
              <div className="mb-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-blue-800">إجمالي التحديات</h4>
                      <p className="text-2xl font-bold text-blue-600">{selectedGame.challenges || 0}</p>
                    </div>
                    <Puzzle className="w-12 h-12 text-blue-600" />
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">التحديات المتاحة</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white p-3 rounded border">
                      <div className="flex items-center space-x-2 space-x-reverse mb-2">
                        <Zap className="w-4 h-4 text-yellow-600" />
                        <span className="font-medium">تحدي السرعة</span>
                      </div>
                      <p className="text-sm text-gray-600">أكمل اللعبة في أقل من دقيقتين</p>
                      <div className="mt-2 flex justify-between text-xs">
                        <span className="text-green-600">مكافأة: 50 نقطة</span>
                        <span className="text-gray-500">نشط</span>
                      </div>
                    </div>
                    
                    <div className="bg-white p-3 rounded border">
                      <div className="flex items-center space-x-2 space-x-reverse mb-2">
                        <Award className="w-4 h-4 text-purple-600" />
                        <span className="font-medium">تحدي الإتقان</span>
                      </div>
                      <p className="text-sm text-gray-600">احصل على نتيجة مثالية</p>
                      <div className="mt-2 flex justify-between text-xs">
                        <span className="text-green-600">مكافأة: 100 نقطة</span>
                        <span className="text-gray-500">نشط</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">إحصائيات التحديات</h4>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-2xl font-bold text-blue-600">78%</p>
                      <p className="text-sm text-gray-600">معدل المشاركة</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-green-600">45%</p>
                      <p className="text-sm text-gray-600">معدل الإنجاز</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-purple-600">234</p>
                      <p className="text-sm text-gray-600">إجمالي المحاولات</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 flex justify-between">
                <button className="bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors">
                  إضافة تحدي جديد
                </button>
                <button
                  onClick={() => setShowChallengesModal(false)}
                  className="bg-gray-600 text-white py-2 px-6 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  إغلاق
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Rewards Modal */}
        {showRewardsModal && selectedGame && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-3xl mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold flex items-center space-x-2 space-x-reverse">
                  <Gift className="w-6 h-6 text-yellow-600" />
                  <span>مكافآت اللعبة: {selectedGame.name}</span>
                </h3>
                <button 
                  onClick={() => setShowRewardsModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ×
                </button>
              </div>
              
              <div className="mb-6">
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-yellow-800">إجمالي المكافآت</h4>
                      <p className="text-2xl font-bold text-yellow-600">{selectedGame.rewards?.length || 0}</p>
                    </div>
                    <Award className="w-12 h-12 text-yellow-600" />
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold mb-3">المكافآت المتاحة</h4>
                  <div className="space-y-3">
                    {selectedGame.rewards && selectedGame.rewards.length > 0 ? (
                      selectedGame.rewards.map((reward, index) => (
                        <div key={index} className="bg-white p-3 rounded border flex items-center justify-between">
                          <div className="flex items-center space-x-3 space-x-reverse">
                            <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                              <Gift className="w-5 h-5 text-yellow-600" />
                            </div>
                            <div>
                              <p className="font-medium">{reward}</p>
                              <p className="text-sm text-gray-600">مكافأة خاصة للاعبين المتميزين</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium">نشطة</span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <Gift className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                        <p>لا توجد مكافآت محددة لهذه اللعبة</p>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold mb-3">إعدادات المكافآت</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white p-3 rounded border">
                      <label className="block text-sm font-medium text-gray-700 mb-2">النقاط الأساسية</label>
                      <div className="flex items-center space-x-2 space-x-reverse">
                        <Zap className="w-4 h-4 text-blue-600" />
                        <span className="font-semibold text-blue-600">{selectedGame.pointsReward || 0} نقطة</span>
                      </div>
                    </div>
                    
                    <div className="bg-white p-3 rounded border">
                      <label className="block text-sm font-medium text-gray-700 mb-2">مكافأة الإنجاز</label>
                      <div className="flex items-center space-x-2 space-x-reverse">
                        <Trophy className="w-4 h-4 text-gold-600" />
                        <span className="font-semibold text-yellow-600">{Math.round((selectedGame.pointsReward || 0) * 1.5)} نقطة</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 flex justify-between">
                <button className="bg-yellow-600 text-white py-2 px-4 rounded-lg hover:bg-yellow-700 transition-colors">
                  إضافة مكافأة جديدة
                </button>
                <button
                  onClick={() => setShowRewardsModal(false)}
                  className="bg-gray-600 text-white py-2 px-6 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  إغلاق
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Game Modal */}
        {showEditModal && selectedGame && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">تعديل اللعبة</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">اسم اللعبة</label>
                  <input
                    type="text"
                    value={selectedGame.name}
                    onChange={(e) => setSelectedGame({...selectedGame, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">الفئة</label>
                  <select
                    value={selectedGame.category}
                    onChange={(e) => setSelectedGame({...selectedGame, category: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="ذهنية">ذهنية</option>
                    <option value="لغوية">لغوية</option>
                    <option value="تعليمية">تعليمية</option>
                    <option value="مهارة">مهارة</option>
                    <option value="ترفيهية">ترفيهية</option>
                    <option value="رياضية">رياضية</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">الوصف</label>
                  <textarea
                    value={selectedGame.description}
                    onChange={(e) => setSelectedGame({...selectedGame, description: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    rows="3"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">الصعوبة</label>
                    <select
                      value={selectedGame.difficulty}
                      onChange={(e) => setSelectedGame({...selectedGame, difficulty: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    >
                      <option value="سهل">سهل</option>
                      <option value="متوسط">متوسط</option>
                      <option value="صعب">صعب</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">النقاط</label>
                    <input
                      type="number"
                      value={selectedGame.pointsReward}
                      onChange={(e) => setSelectedGame({...selectedGame, pointsReward: parseInt(e.target.value)})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      min="1"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">الحالة</label>
                  <select
                    value={selectedGame.status}
                    onChange={(e) => setSelectedGame({...selectedGame, status: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="active">نشطة</option>
                    <option value="inactive">غير نشطة</option>
                  </select>
                </div>
              </div>
              
              <div className="flex space-x-3 space-x-reverse mt-6">
                <button
                  onClick={handleEditGame}
                  className="flex-1 bg-primary-600 text-white py-2 px-4 rounded-lg hover:bg-primary-700 transition-colors"
                >
                  حفظ التغييرات
                </button>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  إلغاء
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

export default AdminGames