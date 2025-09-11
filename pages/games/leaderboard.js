import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import Layout from '../../components/Layout'
import { Trophy, Medal, Award, Crown, ArrowLeft, Filter, Calendar } from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { gamesService } from '../../lib/gamesService'

const LeaderboardPage = () => {
  const { user } = useAuth()
  const [leaderboard, setLeaderboard] = useState([])
  const [loading, setLoading] = useState(true)
  const [timeFilter, setTimeFilter] = useState('all')
  const [gameFilter, setGameFilter] = useState('all')
  const [userRank, setUserRank] = useState(null)

  // بيانات تجريبية موسعة للوحة المتصدرين
  const sampleLeaderboard = [
    { 
      id: 1, 
      username: 'أحمد محمد', 
      totalScore: 15420, 
      gamesPlayed: 45, 
      avatar: '/api/placeholder/40/40',
      weeklyScore: 2850,
      monthlyScore: 8920,
      favoriteGame: 'لعبة الذاكرة',
      joinDate: '2024-01-15',
      achievements: 12
    },
    { 
      id: 2, 
      username: 'فاطمة علي', 
      totalScore: 14890, 
      gamesPlayed: 38, 
      avatar: '/api/placeholder/40/40',
      weeklyScore: 2650,
      monthlyScore: 7890,
      favoriteGame: 'لعبة الرياضيات',
      joinDate: '2024-01-20',
      achievements: 10
    },
    { 
      id: 3, 
      username: 'محمد حسن', 
      totalScore: 13750, 
      gamesPlayed: 42, 
      avatar: '/api/placeholder/40/40',
      weeklyScore: 2420,
      monthlyScore: 7650,
      favoriteGame: 'لعبة الكلمات',
      joinDate: '2024-01-10',
      achievements: 11
    },
    { 
      id: 4, 
      username: 'سارة أحمد', 
      totalScore: 12980, 
      gamesPlayed: 35, 
      avatar: '/api/placeholder/40/40',
      weeklyScore: 2180,
      monthlyScore: 6890,
      favoriteGame: 'لعبة الألوان',
      joinDate: '2024-02-01',
      achievements: 8
    },
    { 
      id: 5, 
      username: 'عبدالله خالد', 
      totalScore: 11650, 
      gamesPlayed: 29, 
      avatar: '/api/placeholder/40/40',
      weeklyScore: 1950,
      monthlyScore: 6120,
      favoriteGame: 'لعبة الأحجية',
      joinDate: '2024-01-25',
      achievements: 9
    },
    { 
      id: 6, 
      username: 'نور الدين', 
      totalScore: 10890, 
      gamesPlayed: 31, 
      avatar: '/api/placeholder/40/40',
      weeklyScore: 1820,
      monthlyScore: 5650,
      favoriteGame: 'لعبة السرعة',
      joinDate: '2024-02-05',
      achievements: 7
    },
    { 
      id: 7, 
      username: 'ليلى محمود', 
      totalScore: 9750, 
      gamesPlayed: 26, 
      avatar: '/api/placeholder/40/40',
      weeklyScore: 1650,
      monthlyScore: 4890,
      favoriteGame: 'لعبة الذاكرة',
      joinDate: '2024-02-10',
      achievements: 6
    },
    { 
      id: 8, 
      username: 'يوسف عمر', 
      totalScore: 8920, 
      gamesPlayed: 24, 
      avatar: '/api/placeholder/40/40',
      weeklyScore: 1420,
      monthlyScore: 4320,
      favoriteGame: 'لعبة الرياضيات',
      joinDate: '2024-02-15',
      achievements: 5
    },
    { 
      id: 9, 
      username: 'مريم سالم', 
      totalScore: 8150, 
      gamesPlayed: 22, 
      avatar: '/api/placeholder/40/40',
      weeklyScore: 1280,
      monthlyScore: 3950,
      favoriteGame: 'لعبة الكلمات',
      joinDate: '2024-02-20',
      achievements: 4
    },
    { 
      id: 10, 
      username: 'حسام الدين', 
      totalScore: 7680, 
      gamesPlayed: 20, 
      avatar: '/api/placeholder/40/40',
      weeklyScore: 1150,
      monthlyScore: 3650,
      favoriteGame: 'لعبة الألوان',
      joinDate: '2024-02-25',
      achievements: 3
    },
    { 
      id: 11, 
      username: 'زينب محمد', 
      totalScore: 7250, 
      gamesPlayed: 19, 
      avatar: '/api/placeholder/40/40',
      weeklyScore: 1050,
      monthlyScore: 3420,
      favoriteGame: 'لعبة الأحجية',
      joinDate: '2024-03-01',
      achievements: 3
    },
    { 
      id: 12, 
      username: 'كريم أحمد', 
      totalScore: 6890, 
      gamesPlayed: 18, 
      avatar: '/api/placeholder/40/40',
      weeklyScore: 980,
      monthlyScore: 3180,
      favoriteGame: 'لعبة السرعة',
      joinDate: '2024-03-05',
      achievements: 2
    },
    { 
      id: 13, 
      username: 'هدى سعد', 
      totalScore: 6420, 
      gamesPlayed: 17, 
      avatar: '/api/placeholder/40/40',
      weeklyScore: 850,
      monthlyScore: 2950,
      favoriteGame: 'لعبة الذاكرة',
      joinDate: '2024-03-10',
      achievements: 2
    },
    { 
      id: 14, 
      username: 'طارق علي', 
      totalScore: 5980, 
      gamesPlayed: 16, 
      avatar: '/api/placeholder/40/40',
      weeklyScore: 720,
      monthlyScore: 2650,
      favoriteGame: 'لعبة الرياضيات',
      joinDate: '2024-03-15',
      achievements: 1
    },
    { 
      id: 15, 
      username: user?.email?.split('@')[0] || 'المستخدم الحالي', 
      totalScore: 5420, 
      gamesPlayed: 18, 
      avatar: '/api/placeholder/40/40',
      weeklyScore: 650,
      monthlyScore: 2420,
      favoriteGame: 'لعبة الكلمات',
      joinDate: '2024-03-20',
      achievements: 7,
      isCurrentUser: true
    }
  ]

  const games = [
    { id: 'all', name: 'جميع الألعاب' },
    { id: 'memory', name: 'لعبة الذاكرة' },
    { id: 'math', name: 'لعبة الرياضيات' },
    { id: 'word', name: 'لعبة الكلمات' },
    { id: 'colors', name: 'لعبة الألوان' },
    { id: 'puzzle', name: 'لعبة الأحجية' },
    { id: 'speed', name: 'لعبة السرعة' }
  ]

  const timeFilters = [
    { id: 'all', name: 'كل الأوقات', key: 'totalScore' },
    { id: 'monthly', name: 'هذا الشهر', key: 'monthlyScore' },
    { id: 'weekly', name: 'هذا الأسبوع', key: 'weeklyScore' }
  ]

  useEffect(() => {
    loadLeaderboard()
  }, [timeFilter, gameFilter])

  const loadLeaderboard = async () => {
    setLoading(true)
    try {
      // تحميل البيانات من الخدمة الجديدة
      const leaderboardData = await gamesService.loadLeaderboard(gameFilter !== 'all' ? gameFilter : null)
      
      let filteredData = [...leaderboardData]
      
      // ترتيب حسب الفترة الزمنية
      const scoreKey = timeFilters.find(f => f.id === timeFilter)?.key || 'totalScore'
      filteredData.sort((a, b) => b[scoreKey] - a[scoreKey])
      
      setLeaderboard(filteredData)
      
      // العثور على ترتيب المستخدم الحالي
      const currentUserIndex = filteredData.findIndex(player => player.isCurrentUser)
      if (currentUserIndex !== -1) {
        setUserRank({
          rank: currentUserIndex + 1,
          player: filteredData[currentUserIndex]
        })
      }
    } catch (error) {
      console.error('خطأ في تحميل لوحة المتصدرين:', error)
      toast.error('حدث خطأ أثناء تحميل لوحة المتصدرين')
    } finally {
      setLoading(false)
    }
  }

  const getRankIcon = (rank) => {
    switch (rank) {
      case 1:
        return <Crown className="h-5 w-5 text-yellow-500" />
      case 2:
        return <Medal className="h-5 w-5 text-gray-400" />
      case 3:
        return <Award className="h-5 w-5 text-orange-500" />
      default:
        return null
    }
  }

  const getRankBadge = (rank) => {
    if (rank <= 3) {
      const colors = {
        1: 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white',
        2: 'bg-gradient-to-r from-gray-300 to-gray-500 text-white',
        3: 'bg-gradient-to-r from-orange-400 to-orange-600 text-white'
      }
      return colors[rank] || 'bg-gray-100 text-gray-800'
    }
    return rank <= 10 ? 'bg-primary-100 text-primary-800' : 'bg-gray-100 text-gray-600'
  }

  const getScoreByFilter = (player) => {
    const scoreKey = timeFilters.find(f => f.id === timeFilter)?.key || 'totalScore'
    return player[scoreKey]
  }

  if (!user) {
    return (
      <Layout>
        <div className="text-center py-12">
          <Trophy className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">يرجى تسجيل الدخول</h2>
          <p className="text-gray-600 mb-6">يجب تسجيل الدخول لمشاهدة لوحة المتصدرين</p>
          <Link href="/auth/login" className="btn-primary">
            تسجيل الدخول
          </Link>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-400/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-400/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-400/5 rounded-full blur-3xl animate-pulse" style={{animationDelay: '4s'}}></div>
        </div>
        
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
          {/* Enhanced Header */}
          <div className="bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 text-white rounded-3xl p-8 mb-8 relative overflow-hidden shadow-2xl">
            {/* Header background effects */}
            <div className="absolute inset-0">
              <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-yellow-500/20 to-red-500/20"></div>
              <div className="absolute -top-20 -right-20 w-40 h-40 bg-white/10 rounded-full blur-2xl animate-bounce" style={{animationDuration: '3s'}}></div>
              <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-white/5 rounded-full blur-3xl animate-bounce" style={{animationDuration: '4s', animationDelay: '1s'}}></div>
            </div>
            
            <div className="relative">
              <div className="flex items-center justify-between mb-6">
                <Link
                  href="/games"
                  className="flex items-center text-white/80 hover:text-white transition-all duration-300 transform hover:scale-105 glass-morphism px-4 py-2 rounded-full"
                  legacyBehavior>
                  <ArrowLeft className="h-5 w-5 mr-2" />
                  العودة للألعاب
                </Link>
              </div>
              
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full mb-6 transform hover:scale-110 transition-transform duration-300">
                  <Trophy className="h-10 w-10 text-white animate-pulse" />
                </div>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 bg-gradient-to-r from-white via-yellow-100 to-orange-100 bg-clip-text text-transparent">
                  لوحة المتصدرين
                </h1>
                <div className="w-24 h-1 bg-gradient-to-r from-yellow-300 to-orange-400 mx-auto rounded-full mb-4"></div>
                <p className="text-yellow-100 text-lg max-w-2xl mx-auto leading-relaxed">
                  تنافس مع أفضل اللاعبين واكسب مكانتك بين النجوم
                </p>
              </div>
            </div>
          </div>

        {/* Enhanced Filters */}
        <div className="modern-card glass-morphism p-6 shadow-xl">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                <div className="p-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg mr-2">
                  <Calendar className="h-4 w-4 text-white" />
                </div>
                الفترة الزمنية
              </label>
              <select
                value={timeFilter}
                onChange={(e) => setTimeFilter(e.target.value)}
                className="modern-input w-full"
              >
                {timeFilters.map((filter) => (
                  <option key={filter.id} value={filter.id}>
                    {filter.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="flex-1">
              <label className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                <div className="p-1 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg mr-2">
                  <Filter className="h-4 w-4 text-white" />
                </div>
                نوع اللعبة
              </label>
              <select
                value={gameFilter}
                onChange={(e) => setGameFilter(e.target.value)}
                className="modern-input w-full"
              >
                {games.map((game) => (
                  <option key={game.id} value={game.id}>
                    {game.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

           {/* User's Current Rank */}
           {userRank && (
             <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-2xl p-6 text-white shadow-2xl relative overflow-hidden">
               {/* Background effects */}
               <div className="absolute inset-0">
                 <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-500/20 to-purple-500/20"></div>
                 <div className="absolute -top-10 -right-10 w-20 h-20 bg-white/10 rounded-full blur-xl animate-pulse"></div>
                 <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white/5 rounded-full blur-2xl animate-pulse" style={{animationDelay: '1s'}}></div>
               </div>
               
               <div className="relative flex items-center justify-between">
                 <div className="flex items-center space-x-4 space-x-reverse">
                   <div className="relative">
                     <img
                       src={userRank.player.avatar}
                       alt="صورتك الشخصية"
                       className="w-16 h-16 rounded-full object-cover border-3 border-white shadow-lg"
                     />
                     <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center">
                       <Crown className="h-3 w-3 text-yellow-800" />
                     </div>
                   </div>
                   <div>
                     <h3 className="text-xl font-bold mb-1">ترتيبك الحالي</h3>
                     <p className="text-blue-100">في {timeFilters.find(f => f.id === timeFilter)?.name}</p>
                   </div>
                 </div>
                 
                 <div className="text-center">
                   <div className="text-4xl font-bold mb-1 bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
                     #{userRank.rank}
                   </div>
                   <div className="text-blue-100 font-medium">{getScoreByFilter(userRank.player).toLocaleString()} نقطة</div>
                 </div>
               </div>
             </div>
           )}

        {/* Enhanced Leaderboard */}
        <div className="modern-card glass-morphism shadow-2xl overflow-hidden">
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="relative">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600"></div>
                <div className="absolute inset-0 rounded-full bg-blue-100/20 animate-pulse"></div>
              </div>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {leaderboard.map((player, index) => {
                const rank = index + 1
                const isCurrentUser = player.isCurrentUser
                
                return (
                  <div
                    key={player.id}
                    className={`p-6 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-all duration-300 transform hover:scale-[1.02] ${
                      isCurrentUser ? 'bg-gradient-to-r from-blue-50 to-purple-50 border-l-4 border-gradient-to-b border-blue-500' : ''
                    } ${rank <= 3 ? 'bg-gradient-to-r from-yellow-50/50 to-orange-50/50' : ''}`}
                  >
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4 space-x-reverse">
                          {/* Enhanced Rank Badge */}
                          <div className={`relative w-14 h-14 rounded-full flex items-center justify-center font-bold text-lg shadow-lg transform transition-all duration-300 hover:scale-110 ${
                            getRankBadge(rank)
                          }`}>
                            {rank <= 3 ? (
                              <div className="relative">
                                {getRankIcon(rank)}
                                <div className="absolute inset-0 rounded-full bg-gradient-to-t from-black/20 to-transparent"></div>
                              </div>
                            ) : (
                              <span className="relative z-10">{rank}</span>
                            )}
                            {rank <= 3 && (
                              <div className="absolute inset-0 rounded-full animate-pulse bg-gradient-to-r from-yellow-400/30 to-orange-400/30"></div>
                            )}
                          </div>
                          
                          {/* Enhanced Avatar */}
                          <div className="relative">
                            <img
                              src={player.avatar}
                              alt={player.username}
                              className="w-14 h-14 rounded-full object-cover border-3 border-white shadow-lg transition-transform duration-300 hover:scale-105"
                            />
                            {rank <= 3 && (
                              <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full flex items-center justify-center shadow-lg">
                                <Crown className="h-3 w-3 text-white" />
                              </div>
                            )}
                            {isCurrentUser && (
                              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                                <div className="w-2 h-2 bg-white rounded-full"></div>
                              </div>
                            )}
                          </div>
                        
                          {/* Enhanced Player Info */}
                          <div className="flex-1 mr-4">
                            <div className="flex items-center space-x-2 space-x-reverse mb-2">
                              <h3 className={`text-xl font-bold transition-colors duration-300 ${
                                isCurrentUser ? 'text-blue-600' : 'text-gray-900'
                              }`}>
                                {player.username}
                                {isCurrentUser && (
                                  <span className="mr-2 text-xs bg-gradient-to-r from-blue-500 to-purple-500 text-white px-3 py-1 rounded-full shadow-lg animate-pulse">
                                    أنت
                                  </span>
                                )}
                                {rank <= 3 && (
                                  <span className="mr-2 text-xs bg-gradient-to-r from-yellow-400 to-orange-400 text-white px-2 py-1 rounded-full shadow-md">
                                    متصدر
                                  </span>
                                )}
                              </h3>
                            </div>
                            
                            <div className="flex items-center space-x-4 space-x-reverse text-sm text-gray-600 mb-1">
                              <div className="flex items-center space-x-1 space-x-reverse bg-blue-50 px-2 py-1 rounded-full">
                                <Trophy className="h-3 w-3 text-blue-500" />
                                <span className="font-medium">{player.gamesPlayed} لعبة</span>
                              </div>
                              <div className="flex items-center space-x-1 space-x-reverse bg-purple-50 px-2 py-1 rounded-full">
                                <Award className="h-3 w-3 text-purple-500" />
                                <span className="font-medium">{player.achievements} إنجاز</span>
                              </div>
                            </div>
                            
                            <div className="text-sm text-gray-500 flex items-center space-x-2 space-x-reverse">
                              <Calendar className="h-3 w-3" />
                              <span>انضم في {new Date(player.joinDate).toLocaleDateString('ar-EG')}</span>
                              <span className="mx-2">•</span>
                              <span className="font-medium text-gray-600">{player.favoriteGame}</span>
                            </div>
                          </div>
                      </div>
                      
                        {/* Enhanced Score Display */}
                        <div className="text-right">
                          <div className={`relative text-3xl font-bold transition-all duration-300 ${
                            isCurrentUser ? 'text-blue-600' : rank <= 3 ? 'bg-gradient-to-r from-yellow-500 to-orange-500 bg-clip-text text-transparent' : 'text-gray-900'
                          }`}>
                            {getScoreByFilter(player).toLocaleString()}
                            {rank <= 3 && (
                              <div className="absolute -inset-1 bg-gradient-to-r from-yellow-400/20 to-orange-400/20 rounded-lg blur-sm animate-pulse"></div>
                            )}
                          </div>
                          <div className="text-sm text-gray-500 font-medium mt-1">نقطة</div>
                          {rank <= 3 && (
                            <div className="flex items-center justify-end mt-2 space-x-1 space-x-reverse">
                              <div className="w-2 h-2 bg-yellow-400 rounded-full animate-bounce"></div>
                              <div className="w-2 h-2 bg-orange-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                              <div className="w-2 h-2 bg-yellow-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                            </div>
                          )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Load More */}
        {!loading && leaderboard.length >= 15 && (
          <div className="text-center">
            <button className="btn-secondary">
              تحميل المزيد
            </button>
          </div>
        )}
      </div>
      </div>
    </Layout>
  );
}

export default LeaderboardPage