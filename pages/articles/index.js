import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useAuth } from '../../contexts/AuthContext'
import { toast } from 'react-hot-toast'
import Layout from '../../components/Layout'
import { BannerAd, CardAd, InlineAd } from '../../components/AdvertisementSystem'
import { Search, Filter, Grid, List, Star, Heart, Bookmark, Eye, MessageCircle, Clock, ChevronDown, TrendingUp, Calendar, User, Tag } from 'lucide-react'
import { loadArticles, loadArticleCategories } from '../../lib/articlesService'

const ArticlesPage = () => {
  const { user } = useAuth()
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [sortBy, setSortBy] = useState('latest')
  const [sortOrder, setSortOrder] = useState('latest')
  const [viewMode, setViewMode] = useState('grid')
  const [showFilters, setShowFilters] = useState(false)
  const [loading, setLoading] = useState(true)
  const [articles, setArticles] = useState([])
  const [categories, setCategories] = useState([])

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      // جلب الفئات
      const categoriesData = await loadArticleCategories()
      const formattedCategories = [
        { id: 'all', name: 'جميع المقالات', name_ar: 'جميع المقالات' },
        ...(categoriesData || [])
      ]
      setCategories(formattedCategories)

      // جلب المقالات
      const articlesData = await loadArticles({ 
        status: 'published', 
        orderBy: 'published_at', 
        orderDirection: 'desc' 
      })
      
      const formattedArticles = (articlesData || []).map(article => ({
        id: article.id,
        title: article.title,
        excerpt: article.excerpt,
        content: article.content,
        image: article.featured_image || '/api/placeholder/400/300',
        category: article.category_id,
        categoryName: article.article_categories?.name_ar || article.article_categories?.name || 'غير محدد',
        author: {
          name: article.profiles?.full_name || article.profiles?.username || 'غير محدد',
          avatar: article.profiles?.avatar_url || '/api/placeholder/50/50'
        },
        publishedAt: article.published_at,
        rating: 4.5 + Math.random() * 0.5, // تقييم افتراضي
        readTime: article.reading_time || Math.ceil(article.content?.length / 1000) || 5,
        views: article.view_count || 0,
        likes: article.like_count || 0,
        comments: article.comment_count || 0,
        featured: !!article.is_featured,
        liked: false // سيتم تحديثه لاحقاً بناءً على بيانات المستخدم
      }))
      
      setArticles(formattedArticles)
    } catch (error) {
      console.error('خطأ في تحميل البيانات:', error)
      toast.error('حدث خطأ في تحميل المقالات')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ar-EG')
  }

  const handleLike = (articleId) => {
    if (!user) {
      toast.error('يجب تسجيل الدخول أولاً')
      return
    }
    toast.success('تم إضافة الإعجاب')
  }

  const isFavorite = (type, id) => {
    return false // Placeholder
  }

  const toggleFavorite = (id) => {
    if (!user) {
      toast.error('يجب تسجيل الدخول أولاً')
      return
    }
    toast.success('تم إضافة المقال للمفضلة')
  }

  const filteredArticles = articles.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         article.excerpt.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || article.category === selectedCategory
    return matchesSearch && matchesCategory
  }).sort((a, b) => {
    switch (sortBy) {
      case 'latest':
        return new Date(b.publishedAt) - new Date(a.publishedAt)
      case 'popular':
        return b.views - a.views
      case 'rating':
        return b.rating - a.rating
      default:
        return 0
    }
  })

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        {/* Hero Section */}
        <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 text-white">
          <div className="absolute inset-0 bg-black opacity-20"></div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
            <div className="text-center">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-2 animate-fade-in-up">
                مكتبة المعرفة
              </h1>
              <p className="text-xl sm:text-2xl mb-2 opacity-90 animate-fade-in-up animation-delay-200">
                اكتشف عالم المعرفة والإبداع
              </p>
            </div>
          </div>
        </div>

        {/* Hero Banner Ad */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
          <div className="mb-8">
            <BannerAd position="articles-hero" />
          </div>
        </div>

        {/* Search and Filters */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 mb-8">
            <div className="flex flex-row gap-1 sm:gap-4 items-center justify-between overflow-x-auto px-1 sm:px-0">
              {/* Search */}
              <div className="relative flex-1 min-w-0">
                <Search className="absolute right-2 sm:right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 sm:h-5 sm:w-5" />
                <input
                  type="text"
                  placeholder="ابحث..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pr-8 sm:pr-10 pl-2 sm:pl-4 py-2 sm:py-3 border border-gray-300 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-xs sm:text-sm"
                />
              </div>

              {/* Filters */}
              <div className="flex items-center gap-1 sm:gap-4 flex-shrink-0">
                <select 
                  value={selectedCategory} 
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-1 py-1 sm:px-2 sm:py-2 border border-gray-300 rounded sm:rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-xs min-w-0 flex-1"
                >
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name_ar || category.name}
                    </option>
                  ))}
                </select>

                <select 
                  value={sortBy} 
                  onChange={(e) => setSortBy(e.target.value)}
                   className="px-1 py-1 sm:px-2 sm:py-2 border border-gray-300 rounded sm:rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-xs min-w-0 flex-1"
                 >
                   <option value="latest">الأحدث</option>
                   <option value="popular">الأكثر مشاهدة</option>
                   <option value="rating">الأعلى تقييماً</option>
                 </select>

                {/* View Mode Toggle */}
                <div className="flex bg-gray-100 rounded-lg sm:rounded-xl p-0.5 sm:p-1">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-1.5 sm:p-2 rounded-md sm:rounded-lg transition-all duration-200 ${
                      viewMode === 'grid'
                        ? 'bg-white text-blue-600 shadow-md'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <Grid className="h-4 w-4 sm:h-5 sm:w-5" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-1.5 sm:p-2 rounded-md sm:rounded-lg transition-all duration-200 ${
                      viewMode === 'list'
                        ? 'bg-white text-blue-600 shadow-md'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <List className="h-4 w-4 sm:h-5 sm:w-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Articles Grid/List */}
          {filteredArticles.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-gray-400 mb-4">
                <Search className="h-16 w-16 mx-auto" />
              </div>
              <h3 className="text-xl font-semibold text-gray-600 mb-2">لا توجد مقالات</h3>
              <p className="text-gray-500">جرب تغيير معايير البحث</p>
            </div>
          ) : (
            <>
              {/* Inline Ad before Articles */}
              <div className="mb-8">
                <InlineAd position="articles-content" size="large" />
              </div>

              <div className="p-4 sm:p-6">
              <div className={viewMode === 'grid' ? 'grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'space-y-4 sm:space-y-6'}>
                {filteredArticles.map((article, index) => (
                  <div 
                    key={`article-${article.id}`} 
                    className={`group ${viewMode === 'grid' ? 'transform hover:-translate-y-2 transition-all duration-300' : 'hover:bg-gray-50 transition-colors duration-200 rounded-xl p-3 sm:p-4'}`}
                    style={viewMode === 'grid' ? { animationDelay: `${index * 100}ms` } : {}}
                  >
                    {viewMode === 'grid' ? (
                      // Grid View
                      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300 hover:border-blue-300">
                        <div className="relative overflow-hidden">
                          <Link href={`/articles/${article.id}`}>
                            <div>
                              <img
                                src={article.image || '/api/placeholder/400/300'}
                                alt={article.title}
                                className="w-full h-20 sm:h-28 object-cover group-hover:scale-105 transition-transform duration-300 cursor-pointer"
                                onError={(e) => {
                                  e.target.src = '/api/placeholder/400/300'
                                }}
                              />
                            </div>
                          </Link>
                          
                          <div className="absolute top-3 left-3 right-3 flex justify-between items-start">
                            <span className="bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xs px-3 py-1 rounded-full font-bold shadow-lg">
                              {(categories.find(c => c.id === article.category)?.name_ar) || (categories.find(c => c.id === article.category)?.name)}
                            </span>
                            {article.featured && (
                              <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-2 py-1 rounded-full text-xs font-bold flex items-center space-x-1 space-x-reverse">
                                <Star className="h-3 w-3 fill-current" />
                                <span>مميز</span>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="p-1 sm:p-3">
                          <Link href={`/articles/${article.id}`}>
                            <div>
                              <h3 className="text-xs sm:text-sm font-bold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors duration-200 cursor-pointer line-clamp-2">
                                {article.title}
                              </h3>
                            </div>
                          </Link>
                          
                          <p className="text-gray-600 text-xs mb-1 sm:mb-2 line-clamp-2">
                            {article.excerpt}
                          </p>
                          
                          <div className="flex items-center justify-between mb-1 sm:mb-2">
                            <div className="flex items-center space-x-1 sm:space-x-2 space-x-reverse">
                              <img
                                src={article.author.avatar}
                                alt={article.author.name}
                                className="w-4 h-4 sm:w-5 sm:h-5 rounded-full"
                              />
                              <div>
                                <p className="text-xs font-medium text-gray-900">{article.author.name}</p>
                                <p className="text-xs text-gray-500 hidden sm:block">{formatDate(article.publishedAt)}</p>
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-1 space-x-reverse text-yellow-400">
                              <Star className="h-3 w-3 fill-current" />
                              <span className="text-xs font-medium text-gray-700">{article.rating}</span>
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between text-xs text-gray-500 mb-1 sm:mb-2">
                            <div className="flex items-center space-x-2 sm:space-x-3 space-x-reverse">
                              <div className="flex items-center space-x-1 space-x-reverse">
                                <Eye className="h-3 w-3" />
                                <span>{article.views.toLocaleString('en-US')}</span>
                              </div>
                              <div className="flex items-center space-x-1 space-x-reverse">
                                <MessageCircle className="h-3 w-3" />
                                <span>{article.comments.toLocaleString('en-US')}</span>
                              </div>
                              <div className="flex items-center space-x-1 space-x-reverse">
                                <Clock className="h-3 w-3" />
                                <span>{article.readTime}</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between pt-1 sm:pt-2 border-t border-gray-100">
                            <button
                              onClick={() => handleLike(article.id)}
                              className={`flex items-center space-x-1 space-x-reverse px-2 py-1 rounded-full transition-all duration-200 text-xs font-medium transform hover:scale-105 ${
                                article.liked
                                  ? 'text-red-600 bg-red-50 hover:bg-red-100 shadow-md'
                                  : 'text-gray-500 hover:text-red-600 hover:bg-red-50'
                              }`}
                            >
                              <Heart className={`h-3 w-3 transition-transform duration-200 ${article.liked ? 'fill-current scale-110' : ''}`} />
                              <span>{article.likes.toLocaleString('en-US')}</span>
                            </button>
                            
                            <button
                              onClick={() => toggleFavorite(article.id)}
                              className={`p-1 rounded-full transition-all duration-200 transform hover:scale-105 ${
                                isFavorite('articles', article.id)
                                  ? 'text-yellow-600 bg-yellow-50 hover:bg-yellow-100'
                                  : 'text-gray-400 hover:text-yellow-600 hover:bg-yellow-50'
                              }`}
                              title={isFavorite('articles', article.id) ? 'إزالة من المفضلة' : 'إضافة للمفضلة'}
                            >
                              <Bookmark className={`h-3 w-3 transition-transform duration-200 ${isFavorite('articles', article.id) ? 'fill-current scale-110' : ''}`} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      // List View
                      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300 hover:border-blue-300">
                        <div className="flex">
                          <div className="flex-shrink-0">
                            <Link href={`/articles/${article.id}`}>
                              <div>
                                <img
                                  src={article.image || '/api/placeholder/400/300'}
                                  alt={article.title}
                                  className="w-20 h-16 sm:w-28 sm:h-20 object-cover group-hover:scale-105 transition-transform duration-300 cursor-pointer"
                                  onError={(e) => {
                                    e.target.src = '/api/placeholder/400/300'
                                  }}
                                />
                              </div>
                            </Link>
                          </div>
                          
                          <div className="flex-1 p-1 sm:p-3">
                            <div className="flex flex-wrap items-center gap-1 mb-1">
                              <span className="bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xs px-3 py-1 rounded-full font-bold shadow-lg">
                                {(categories.find(c => c.id === article.category)?.name_ar) || (categories.find(c => c.id === article.category)?.name)
                                }
                              </span>
                              {article.featured && (
                                <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-2 py-1 rounded-full text-xs font-bold flex items-center space-x-1 space-x-reverse">
                                  <Star className="h-3 w-3 fill-current" />
                                  <span>مميز</span>
                                </div>
                              )}
                            </div>
                            
                            <Link href={`/articles/${article.id}`}>
                              <div>
                                <h3 className="text-xs sm:text-base font-bold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors duration-200 cursor-pointer line-clamp-2">
                                   {article.title}
                                 </h3>
                              </div>
                            </Link>
                            
                            <p className="text-gray-600 text-xs mb-1 sm:mb-2 line-clamp-2">
                               {article.excerpt}
                             </p>
                            
                            <div className="flex items-center justify-between mb-1 sm:mb-2">
                               <div className="flex items-center space-x-1 sm:space-x-2 space-x-reverse">
                                 <img
                                   src={article.author.avatar}
                                   alt={article.author.name}
                                   className="w-4 h-4 sm:w-5 sm:h-5 rounded-full"
                                 />
                                 <div>
                                   <p className="text-xs font-medium text-gray-900">{article.author.name}</p>
                                   <p className="text-xs text-gray-500 hidden sm:block">{formatDate(article.publishedAt)}</p>
                                 </div>
                               </div>
                              
                              <div className="flex items-center space-x-1 space-x-reverse text-yellow-400">
                                <Star className="h-3 w-3 fill-current" />
                                <span className="text-xs font-medium text-gray-700">{article.rating}</span>
                              </div>
                            </div>
                            
                            <div className="flex items-center justify-between text-xs text-gray-500 mb-1 sm:mb-2">
                               <div className="flex items-center space-x-2 sm:space-x-3 space-x-reverse">
                                <div className="flex items-center space-x-1 space-x-reverse">
                                  <Eye className="h-3 w-3" />
                                  <span>{article.views.toLocaleString('en-US')}</span>
                                </div>
                                <div className="flex items-center space-x-1 space-x-reverse">
                                  <MessageCircle className="h-3 w-3" />
                                  <span>{article.comments.toLocaleString('en-US')}</span>
                                </div>
                                <div className="flex items-center space-x-1 space-x-reverse">
                                  <Clock className="h-3 w-3" />
                                  <span>{article.readTime}</span>
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex items-center justify-between pt-1 sm:pt-2 border-t border-gray-100">
                              <button
                                onClick={() => handleLike(article.id)}
                                className={`flex items-center space-x-1 space-x-reverse px-2 py-1 rounded-full transition-all duration-200 text-xs font-medium transform hover:scale-105 ${
                                  article.liked
                                    ? 'text-red-600 bg-red-50 hover:bg-red-100 shadow-md'
                                    : 'text-gray-500 hover:text-red-600 hover:bg-red-50'
                                }`}
                              >
                                <Heart className={`h-3 w-3 transition-transform duration-200 ${article.liked ? 'fill-current scale-110' : ''}`} />
                                <span>{article.likes.toLocaleString('en-US')}</span>
                              </button>
                              
                              <button
                                onClick={() => toggleFavorite(article.id)}
                                className={`p-1 rounded-full transition-all duration-200 transform hover:scale-105 ${
                                  isFavorite('articles', article.id)
                                    ? 'text-yellow-600 bg-yellow-50 hover:bg-yellow-100'
                                    : 'text-gray-400 hover:text-yellow-600 hover:bg-yellow-50'
                                }`}
                                title={isFavorite('articles', article.id) ? 'إزالة من المفضلة' : 'إضافة للمفضلة'}
                              >
                                <Bookmark className={`h-3 w-3 transition-transform duration-200 ${isFavorite('articles', article.id) ? 'fill-current scale-110' : ''}`} />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              </div>
            </>
          )}
        </div>
      </div>
    </Layout>
  )
}

export default ArticlesPage