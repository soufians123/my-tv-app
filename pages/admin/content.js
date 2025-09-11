import { useState, useEffect } from 'react'
import AdminLayout from '../../components/admin/AdminLayout'
import { 
  FileText, 
  Tv, 
  Gamepad2, 
  Search, 
  Filter, 
  MoreVertical, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff,
  Calendar,
  User,
  ArrowLeft,
  Plus,
  TrendingUp,
  MessageSquare,
  Heart,
  Share2,
  BarChart3
} from 'lucide-react'
import toast from 'react-hot-toast'
import Link from 'next/link'
import { loadArticles, updateArticle, deleteArticle } from '../../lib/articlesService'
import { loadChannels, updateChannel, deleteChannel } from '../../lib/supabaseChannelsService'
import { updateGame, deleteGame } from '../../lib/gamesService'
import { gamesService } from '../../lib/gamesService'

const ContentManagement = () => {

  const [activeTab, setActiveTab] = useState('articles')
  const [content, setContent] = useState({
    articles: [],
    channels: [],
    games: []
  })
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [loadingContent, setLoadingContent] = useState(true)

  useEffect(() => {
    loadContent()
  }, [])

  const loadContent = async () => {
    try {
      setLoadingContent(true)
      
      // تحميل البيانات من Supabase
      const [articlesDataRaw, channelsDataRaw, gamesDataRaw] = await Promise.all([
        loadArticles({ limit: 50, admin: true, includeUnpublished: true, status: 'all' }),
        loadChannels(),
        gamesService.loadGames()
      ])

      const articlesData = Array.isArray(articlesDataRaw) ? articlesDataRaw : []
      const channelsData = Array.isArray(channelsDataRaw) ? channelsDataRaw : []
      const gamesData = Array.isArray(gamesDataRaw) ? gamesDataRaw : []
      
      // تنسيق بيانات المقالات
      const formattedArticles = articlesData.map(article => ({
        id: article.id,
        title: article.title,
        author: article.profiles?.full_name || article.profiles?.username || 'غير محدد',
        authorId: article.author_id,
        status: article.status,
        views: article.view_count || 0,
        likes: article.like_count || 0,
        comments: article.comment_count || 0,
        createdAt: article.created_at,
        updatedAt: article.updated_at,
        category: article.article_categories?.name_ar || article.article_categories?.name || 'غير محدد',
        featured: article.is_featured || false,
        excerpt: article.excerpt,
        featuredImage: article.featured_image
      }))
      
      // تنسيق بيانات القنوات
      const formattedChannels = channelsData.map(channel => ({
        id: channel.id,
        name: channel.name,
        category: channel.category,
        country: channel.country,
        language: channel.language,
        status: channel.status,
        subscribers: channel.favorites || 0,
        rating: channel.rating || 0,
        createdAt: channel.created_at,
        logo_url: channel.logo_url,
        url: channel.url,
        description: channel.description
      }))
      
      // تنسيق بيانات الألعاب
      const formattedGames = gamesData.map(game => ({
        id: game.id,
        name: game.title,
        category: game.category,
        difficulty: game.difficulty,
        status: game.status || 'active',
        players: game.players || 0,
        avgScore: game.max_score || 0,
        createdAt: game.created_at ? new Date(game.created_at).toLocaleDateString('ar-SA') : new Date().toLocaleDateString('ar-SA'),
        thumbnail: game.image || 'https://images.unsplash.com/photo-1606092195730-5d7b9af1efc5?w=100&h=100&fit=crop&crop=center',
        description: game.description
      }))
      
      setContent({
        articles: formattedArticles,
        channels: formattedChannels,
        games: formattedGames
      })
    } catch (error) {
      console.error('Error loading content:', error)
      toast.error('حدث خطأ في تحميل المحتوى')
    } finally {
      setLoadingContent(false)
    }
  }

  const handleContentAction = async (type, id, action) => {
    try {
      let success = false
      
      switch (action) {
        case 'publish':
          if (type === 'articles') {
            const result = await updateArticle(id, { status: 'published' })
            success = !!result
          } else if (type === 'channels') {
            success = await updateChannel(id, { status: 'active' })
          } else if (type === 'games') {
            success = await updateGame(id, { status: 'active' })
          }
          if (success) toast.success('تم نشر المحتوى بنجاح')
          break
          
        case 'unpublish':
          if (type === 'articles') {
            const result = await updateArticle(id, { status: 'draft' })
            success = !!result
          } else if (type === 'channels') {
            success = await updateChannel(id, { status: 'inactive' })
          } else if (type === 'games') {
            success = await updateGame(id, { status: 'inactive' })
          }
          if (success) toast.success('تم إلغاء نشر المحتوى')
          break
          
        case 'activate':
          if (type === 'channels') {
            success = await updateChannel(id, { status: 'active' })
          } else if (type === 'games') {
            success = await updateGame(id, { status: 'active' })
          }
          if (success) toast.success('تم تفعيل المحتوى')
          break
          
        case 'deactivate':
          if (type === 'channels') {
            success = await updateChannel(id, { status: 'inactive' })
          } else if (type === 'games') {
            success = await updateGame(id, { status: 'inactive' })
          }
          if (success) toast.success('تم إلغاء تفعيل المحتوى')
          break
          
        case 'feature':
          if (type === 'articles') {
            const result = await updateArticle(id, { is_featured: true })
            success = !!result
          } else if (type === 'channels') {
            success = await updateChannel(id, { is_featured: true })
          } else if (type === 'games') {
            success = await updateGame(id, { is_featured: true })
          }
          if (success) toast.success('تم إضافة المحتوى للمميز')
          break
          
        case 'unfeature':
          if (type === 'articles') {
            const result = await updateArticle(id, { is_featured: false })
            success = !!result
          } else if (type === 'channels') {
            success = await updateChannel(id, { is_featured: false })
          } else if (type === 'games') {
            success = await updateGame(id, { is_featured: false })
          }
          if (success) toast.success('تم إزالة المحتوى من المميز')
          break
          
        case 'delete':
          if (confirm('هل أنت متأكد من حذف هذا المحتوى؟')) {
            if (type === 'articles') {
              success = await deleteArticle(id)
            } else if (type === 'channels') {
              success = await deleteChannel(id)
            } else if (type === 'games') {
              success = await deleteGame(id)
            }
            if (success) toast.success('تم حذف المحتوى')
          }
          break
      }
      
      // إعادة تحميل المحتوى بعد التحديث
      if (success) {
        await loadContent()
      } else if (action !== 'delete' || confirm('هل أنت متأكد من حذف هذا المحتوى؟')) {
        toast.error('فشل في تنفيذ العملية')
      }
    } catch (error) {
      console.error('Error performing content action:', error)
      toast.error('حدث خطأ أثناء تنفيذ العملية')
    }
  }

  const getStatusBadge = (status, type) => {
    const badges = {
      published: { color: 'bg-green-100 text-green-800', text: 'منشور' },
      draft: { color: 'bg-yellow-100 text-yellow-800', text: 'مسودة' },
      active: { color: 'bg-green-100 text-green-800', text: 'نشط' },
      inactive: { color: 'bg-gray-100 text-gray-800', text: 'غير نشط' },
      maintenance: { color: 'bg-orange-100 text-orange-800', text: 'صيانة' }
    }
    const badge = badges[status]
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badge.color}`}>
        {badge.text}
      </span>
    )
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getFilteredContent = () => {
    const currentContent = content[activeTab] || []
    let filtered = currentContent

    if (searchTerm) {
      filtered = filtered.filter(item => {
        const searchFields = activeTab === 'articles' 
          ? [item.title, item.author, item.category]
          : activeTab === 'channels'
          ? [item.name, item.category, item.country]
          : [item.name, item.category, item.difficulty]
        
        return searchFields.some(field => 
          field.toLowerCase().includes(searchTerm.toLowerCase())
        )
      })
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(item => item.status === statusFilter)
    }

    return filtered
  }

  const tabs = [
    { id: 'articles', name: 'المقالات', icon: FileText, count: content.articles.length },
    { id: 'channels', name: 'القنوات', icon: Tv, count: content.channels.length },
    { id: 'games', name: 'الألعاب', icon: Gamepad2, count: content.games.length }
  ]

  if (loadingContent) {
    return (
      <AdminLayout title="إدارة المحتوى" description="إدارة المقالات والقنوات والألعاب">
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </AdminLayout>
    )
  }

  // loadContent is invoked on mount via useEffect

  const filteredContent = getFilteredContent()

  return (
    <AdminLayout title="إدارة المحتوى" description="إدارة المقالات والقنوات والألعاب">
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center">
                <Link
                  href="/admin"
                  className="mobile-touch-target control-button text-gray-400 hover:text-gray-600 ml-2 sm:ml-4 p-2 rounded-lg min-h-[44px] min-w-[44px] flex items-center justify-center"
                  legacyBehavior>
                  <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6" />
                </Link>
                <div>
                  <h1 className="text-lg sm:text-2xl font-bold text-gray-900 flex items-center">
                    <FileText className="w-6 h-6 sm:w-8 sm:h-8 text-primary-600 mr-2 sm:mr-3" />
                    إدارة المحتوى
                  </h1>
                  <p className="text-sm sm:text-base text-gray-600 mt-1">إدارة المقالات والقنوات والألعاب</p>
                </div>
              </div>
              <div className="flex items-center space-x-4 space-x-reverse w-full sm:w-auto">
                <button className="mobile-touch-target control-button bg-primary-600 text-white px-4 py-3 sm:py-2 rounded-lg hover:bg-primary-700 transition-colors flex items-center justify-center min-h-[44px] flex-1 sm:flex-none text-base font-medium">
                  <Plus className="w-4 h-4 mr-2" />
                  إضافة محتوى
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Tabs */}
          <div className="border-b border-gray-200 mb-6">
            <nav className="-mb-px flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-8 sm:space-x-reverse">
              {tabs.map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`mobile-touch-target control-button ${
                      activeTab === tab.id
                        ? 'border-primary-500 text-primary-600 bg-primary-50'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                    } whitespace-nowrap py-3 sm:py-2 px-4 sm:px-1 border-b-2 sm:border-b-2 font-medium text-base sm:text-sm flex items-center justify-center sm:justify-start min-h-[44px] rounded-t-lg sm:rounded-none transition-colors`}
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {tab.name}
                    <span className="bg-gray-100 text-gray-900 ml-2 py-0.5 px-2.5 rounded-full text-xs font-medium">
                      {tab.count}
                    </span>
                  </button>
                )
              })}
            </nav>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6 mb-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="البحث في المحتوى..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="mobile-touch-target w-full pr-10 pl-4 py-3 sm:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-base min-h-[44px]"
                />
              </div>
              
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="mobile-touch-target px-4 py-3 sm:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-base min-h-[44px]"
              >
                <option value="all">جميع الحالات</option>
                {activeTab === 'articles' && (
                  <>
                    <option value="published">منشور</option>
                    <option value="draft">مسودة</option>
                  </>
                )}
                {(activeTab === 'channels' || activeTab === 'games') && (
                  <>
                    <option value="active">نشط</option>
                    <option value="inactive">غير نشط</option>
                    {activeTab === 'games' && <option value="maintenance">صيانة</option>}
                  </>
                )}
              </select>

              <div className="flex space-x-2 space-x-reverse sm:col-span-2 lg:col-span-1">
                <button className="mobile-touch-target control-button flex-1 bg-gray-100 text-gray-700 px-4 py-3 sm:py-2 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center min-h-[44px] text-base font-medium">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  إحصائيات
                </button>
              </div>
            </div>
          </div>

          {/* Content List */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            {activeTab === 'articles' && (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        المقال
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        الكاتب
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        الحالة
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        الإحصائيات
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        التاريخ
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        الإجراءات
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredContent.map((article) => (
                      <tr key={article.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div>
                            <div className="text-sm font-medium text-gray-900 flex items-center">
                              {article.title}
                              {article.featured && (
                                <span className="mr-2 bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">
                                  مميز
                                </span>
                              )}
                            </div>
                            <div className="text-sm text-gray-500">{article.category}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {article.author}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(article.status)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <div className="flex items-center space-x-4 space-x-reverse">
                            <span className="flex items-center">
                              <Eye className="w-4 h-4 mr-1" />
                              {article.views}
                            </span>
                            <span className="flex items-center">
                              <Heart className="w-4 h-4 mr-1" />
                              {article.likes}
                            </span>
                            <span className="flex items-center">
                              <MessageSquare className="w-4 h-4 mr-1" />
                              {article.comments}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatDate(article.createdAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-2 space-x-reverse">
                            <Link href={`/articles/edit/${article.id}`} legacyBehavior>
                              <button className="text-blue-600 hover:text-blue-900">
                                <Edit className="w-4 h-4" />
                              </button>
                            </Link>
                            {article.status === 'draft' ? (
                              <button
                                onClick={() => handleContentAction('articles', article.id, 'publish')}
                                className="text-green-600 hover:text-green-900"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                            ) : (
                              <button
                                onClick={() => handleContentAction('articles', article.id, 'unpublish')}
                                className="text-yellow-600 hover:text-yellow-900"
                              >
                                <EyeOff className="w-4 h-4" />
                              </button>
                            )}
                            <button
                              onClick={() => handleContentAction('articles', article.id, 'delete')}
                              className="text-red-600 hover:text-red-900"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === 'channels' && (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        القناة
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        التصنيف
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        البلد
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        الحالة
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        المشتركون
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        الإجراءات
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredContent.map((channel) => (
                      <tr key={channel.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <img
                              className="h-10 w-10 rounded-lg"
                              src={channel.logo_url}
                              alt={channel.name}
                            />
                            <div className="mr-4">
                              <div className="text-sm font-medium text-gray-900">{channel.name}</div>
                              <div className="text-sm text-gray-500">تقييم: {channel.rating}/5</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {channel.category}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {channel.country}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(channel.status)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {channel.subscribers.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-2 space-x-reverse">
                            <button className="text-blue-600 hover:text-blue-900">
                              <Edit className="w-4 h-4" />
                            </button>
                            {channel.status === 'active' ? (
                              <button
                                onClick={() => handleContentAction('channels', channel.id, 'deactivate')}
                                className="text-yellow-600 hover:text-yellow-900"
                              >
                                <EyeOff className="w-4 h-4" />
                              </button>
                            ) : (
                              <button
                                onClick={() => handleContentAction('channels', channel.id, 'activate')}
                                className="text-green-600 hover:text-green-900"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                            )}
                            <button
                              onClick={() => handleContentAction('channels', channel.id, 'delete')}
                              className="text-red-600 hover:text-red-900"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === 'games' && (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        اللعبة
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        التصنيف
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        الصعوبة
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        الحالة
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        اللاعبون
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        الإجراءات
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredContent.map((game) => (
                      <tr key={game.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <img
                              className="h-10 w-16 rounded-lg object-cover"
                              src={game.thumbnail}
                              alt={game.name}
                            />
                            <div className="mr-4">
                              <div className="text-sm font-medium text-gray-900">{game.name}</div>
                              <div className="text-sm text-gray-500">متوسط النقاط: {game.avgScore}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {game.category}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {game.difficulty}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(game.status)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {game.players.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-2 space-x-reverse">
                            <button className="text-blue-600 hover:text-blue-900">
                              <Edit className="w-4 h-4" />
                            </button>
                            {game.status === 'active' ? (
                              <button
                                onClick={() => handleContentAction('games', game.id, 'deactivate')}
                                className="text-yellow-600 hover:text-yellow-900"
                              >
                                <EyeOff className="w-4 h-4" />
                              </button>
                            ) : (
                              <button
                                onClick={() => handleContentAction('games', game.id, 'activate')}
                                className="text-green-600 hover:text-green-900"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                            )}
                            <button
                              onClick={() => handleContentAction('games', game.id, 'delete')}
                              className="text-red-600 hover:text-red-900"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {filteredContent.length === 0 && (
            <div className="text-center py-12">
              <FileText className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">لا يوجد محتوى</h3>
              <p className="mt-1 text-sm text-gray-500">لم يتم العثور على محتوى مطابق للبحث.</p>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}

export default ContentManagement