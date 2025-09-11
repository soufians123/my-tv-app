import { useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { useAuth } from '../../contexts/AuthContext'
import Layout from '../../components/Layout'
import { FavoritesDisplay, useFavorites } from '../../components/FavoritesSystem'
import { Heart, Download, Upload, Trash2, RefreshCw, BarChart3, Calendar, User } from 'lucide-react'
import { useToast } from '../../components/ToastSystem'

const FavoritesPage = () => {
  const router = useRouter()
  const { user } = useAuth()
  const { showToast } = useToast()
  const {
    favorites,
    isLoading,
    lastSync,
    clearAllFavorites,
    exportFavorites,
    importFavorites,
    syncWithCloud,
    getFavoritesStats
  } = useFavorites()
  
  const [activeTab, setActiveTab] = useState('all')
  const [showImportDialog, setShowImportDialog] = useState(false)
  
  const stats = getFavoritesStats()
  
  const handleImportFile = (event) => {
    const file = event.target.files[0]
    if (file) {
      importFavorites(file)
      setShowImportDialog(false)
      event.target.value = '' // إعادة تعيين input
    }
  }
  
  const handleClearAll = () => {
    if (window.confirm('هل أنت متأكد من حذف جميع المفضلة؟ لا يمكن التراجع عن هذا الإجراء.')) {
      clearAllFavorites()
    }
  }
  
  const handleSync = async () => {
    if (!user) {
      showToast('يرجى تسجيل الدخول للمزامنة مع السحابة', 'error')
      return
    }
    await syncWithCloud()
  }

  const tabs = [
    { id: 'all', name: 'الكل', count: stats.total },
    { id: 'channels', name: 'القنوات', count: stats.channels },
    { id: 'articles', name: 'المقالات', count: stats.articles },
    { id: 'games', name: 'الألعاب', count: stats.games }
  ]

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-6 sm:py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6 mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div className="mb-4 sm:mb-0">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                  <Heart className="inline-block h-8 w-8 text-red-500 mr-3" />
                  المفضلة
                </h1>
                <p className="text-gray-600">
                  إدارة العناصر المفضلة لديك مع المزامنة السحابية
                </p>
              </div>
              
              {/* إحصائيات سريعة */}
              <div className="flex items-center space-x-4 space-x-reverse">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
                  <div className="text-xs text-gray-500">إجمالي</div>
                </div>
                {user && (
                  <div className="text-center">
                    <div className="text-sm text-green-600 flex items-center">
                      <RefreshCw className="h-4 w-4 mr-1" />
                      متزامن
                    </div>
                    <div className="text-xs text-gray-500">
                      {lastSync ? new Date(lastSync).toLocaleDateString('ar-EG') : 'لم يتم'}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* أدوات الإدارة */}
          <div className="bg-white rounded-xl shadow-md border border-gray-100 p-4 mb-6">
            <div className="flex flex-wrap gap-3">
              {/* مزامنة */}
              <button
                onClick={handleSync}
                disabled={isLoading || !user}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                {user ? 'مزامنة مع السحابة' : 'تسجيل الدخول للمزامنة'}
              </button>
              
              {/* تصدير */}
              <button
                onClick={exportFavorites}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Download className="h-4 w-4 mr-2" />
                تصدير
              </button>
              
              {/* استيراد */}
              <div className="relative">
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportFile}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <button className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                  <Upload className="h-4 w-4 mr-2" />
                  استيراد
                </button>
              </div>
              
              {/* مسح الكل */}
              <button
                onClick={handleClearAll}
                className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                مسح الكل
              </button>
            </div>
          </div>

          {/* التبويبات */}
          <div className="bg-white rounded-xl shadow-md border border-gray-100 mb-6">
            <div className="border-b border-gray-200">
              <nav className="flex space-x-8 space-x-reverse px-6">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    {tab.name}
                    {tab.count > 0 && (
                      <span className={`mr-2 px-2 py-1 text-xs rounded-full ${
                        activeTab === tab.id
                          ? 'bg-blue-100 text-blue-600'
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {tab.count}
                      </span>
                    )}
                  </button>
                ))}
              </nav>
            </div>
            
            <div className="p-6">
              {activeTab === 'all' ? (
                <div className="space-y-8">
                  {/* عرض جميع الأنواع */}
                  {stats.channels > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                        القنوات المفضلة ({stats.channels})
                      </h3>
                      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {favorites.channels.slice(0, 6).map(channel => (
                          <Link
                            key={channel.id}
                            href={`/channels/${channel.id}`}
                            className="block bg-gray-50 border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                            legacyBehavior>
                            <div className="flex items-center space-x-3 space-x-reverse">
                              {channel.logo_url && (
                  <img src={channel.logo_url} alt={channel.name} className="w-10 h-10 rounded-full" />
                              )}
                              <div className="flex-1 min-w-0">
                                <h4 className="font-medium text-gray-900 truncate">{channel.name}</h4>
                                <p className="text-sm text-gray-600 truncate">{channel.category}</p>
                              </div>
                            </div>
                          </Link>
                        ))}
                      </div>
                      {stats.channels > 6 && (
                        <button
                          onClick={() => setActiveTab('channels')}
                          className="mt-4 text-blue-600 hover:text-blue-700 text-sm font-medium"
                        >
                          عرض جميع القنوات ({stats.channels})
                        </button>
                      )}
                    </div>
                  )}
                  
                  {stats.articles > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                        المقالات المفضلة ({stats.articles})
                      </h3>
                      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {favorites.articles.slice(0, 6).map(article => (
                          <Link
                            key={article.id}
                            href={`/articles/${article.id}`}
                            className="block bg-gray-50 border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                            legacyBehavior>
                            <h4 className="font-medium text-gray-900 line-clamp-2 mb-2">{article.title}</h4>
                            <p className="text-sm text-gray-600 line-clamp-2">{article.excerpt}</p>
                          </Link>
                        ))}
                      </div>
                      {stats.articles > 6 && (
                        <button
                          onClick={() => setActiveTab('articles')}
                          className="mt-4 text-blue-600 hover:text-blue-700 text-sm font-medium"
                        >
                          عرض جميع المقالات ({stats.articles})
                        </button>
                      )}
                    </div>
                  )}
                  
                  {stats.games > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <div className="w-2 h-2 bg-purple-500 rounded-full mr-3"></div>
                        الألعاب المفضلة ({stats.games})
                      </h3>
                      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {favorites.games.slice(0, 6).map(game => (
                          <Link
                            key={game.id}
                            href={`/games/${game.id}`}
                            className="block bg-gray-50 border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                            legacyBehavior>
                            <h4 className="font-medium text-gray-900 line-clamp-2 mb-2">{game.title}</h4>
                            <p className="text-sm text-gray-600 line-clamp-2">{game.description}</p>
                          </Link>
                        ))}
                      </div>
                      {stats.games > 6 && (
                        <button
                          onClick={() => setActiveTab('games')}
                          className="mt-4 text-blue-600 hover:text-blue-700 text-sm font-medium"
                        >
                          عرض جميع الألعاب ({stats.games})
                        </button>
                      )}
                    </div>
                  )}
                  
                  {stats.total === 0 && (
                    <div className="text-center py-12">
                      <Heart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد مفضلة بعد</h3>
                      <p className="text-gray-600 mb-6">ابدأ بإضافة القنوات والمقالات والألعاب المفضلة لديك</p>
                      <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <Link href="/channels" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                          تصفح القنوات
                        </Link>
                        <Link href="/articles" className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                          تصفح المقالات
                        </Link>
                        <Link href="/games" className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                          تصفح الألعاب
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                /* عرض نوع محدد */
                (<div>
                  {activeTab === 'channels' && (
                    <FavoritesDisplay
                      type="channels"
                      title="القنوات المفضلة"
                      emptyMessage="لم تقم بإضافة أي قنوات للمفضلة بعد"
                    />
                  )}
                  {activeTab === 'articles' && (
                    <FavoritesDisplay
                      type="articles"
                      title="المقالات المفضلة"
                      emptyMessage="لم تقم بإضافة أي مقالات للمفضلة بعد"
                    />
                  )}
                  {activeTab === 'games' && (
                    <FavoritesDisplay
                      type="games"
                      title="الألعاب المفضلة"
                      emptyMessage="لم تقم بإضافة أي ألعاب للمفضلة بعد"
                    />
                  )}
                </div>)
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default FavoritesPage