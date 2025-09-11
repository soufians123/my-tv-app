import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { useAuth } from '../../contexts/AuthContext'
import { loadArticles as loadArticlesService, loadArticleCategories, createArticle, updateArticle, deleteArticle } from '../../lib/articlesService'
// import Layout from '../../components/Layout'
import AdminLayout from '../../components/admin/AdminLayout'
import AdvancedEditor from '../../components/AdvancedEditor'
import Link from 'next/link'
import { 
  FileText, 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Eye, 
  Heart, 
  MessageCircle, 
  Calendar,
  User,
  Tag,
  TrendingUp,
  Clock,
  ArrowLeft
} from 'lucide-react'
import toast from 'react-hot-toast'

const AdminArticles = () => {
  const { user } = useAuth()
  const router = useRouter()
  const [articles, setArticles] = useState([])
  const [filteredArticles, setFilteredArticles] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterCategory, setFilterCategory] = useState('all')
  const [sortBy, setSortBy] = useState('newest')
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedArticle, setSelectedArticle] = useState(null)
  const [categories, setCategories] = useState([])
  const [newArticle, setNewArticle] = useState({
    title: '',
    excerpt: '',
    content: '',
    category_id: '',
    tags: [],
    status: 'draft',
    featured: false,
    featured_image: '',
    affiliate_links: [],
    meta_title: '',
    meta_description: ''
  })

  useEffect(() => {
    // AdminLayout يتولى التحقق من الصلاحيات وإعادة التوجيه
    fetchCategories()
    fetchArticles()
  }, [])

// فتح نافذة إضافة مقال مباشرة إذا وصلنا مع open=create
useEffect(() => {
  if (!router?.isReady) return
  if (router.query?.open === 'create') {
    setShowAddModal(true)
  }
}, [router?.isReady, router?.query?.open])
  useEffect(() => {
    filterAndSortArticles()
  }, [articles, searchTerm, filterStatus, filterCategory, sortBy])

  const fetchCategories = async () => {
    try {
      const cats = await loadArticleCategories()
      setCategories(cats)
      // تعيين فئة افتراضية للنموذج
      if (cats?.length && !newArticle.category_id) {
        setNewArticle(prev => ({ ...prev, category_id: cats[0].id }))
      }
    } catch (e) {
      console.error(e)
    }
  }

  const fetchArticles = async () => {
    try {
      const articlesData = await loadArticlesService({ admin: true, status: 'all', orderBy: 'created_at', orderDirection: 'desc' })
      const formattedArticles = (articlesData || []).map(article => ({
        id: article.id,
        title: article.title,
        slug: article.slug,
        excerpt: article.excerpt,
        content: article.content,
        category_id: article.category_id,
        category_name: article.article_categories?.name_ar || article.article_categories?.name || 'غير محدد',
        tags: article.tags || [],
        author: article.profiles?.full_name || article.profiles?.username || 'غير محدد',
        authorId: article.author_id,
        status: article.status,
        featured: !!article.is_featured,
        featured_image: article.featured_image || '',
        affiliate_links: article.affiliate_links || [],
        thumbnail: article.featured_image || '/api/placeholder/400/250',
        views: article.view_count || 0,
        likes: article.like_count || 0,
        comments: article.comment_count || 0,
        readTime: article.reading_time || 5,
        publishedAt: article.published_at,
        createdAt: article.created_at,
        updatedAt: article.updated_at
      }))
      setArticles(formattedArticles)
    } catch (error) {
      console.error('Error loading articles:', error)
      toast.error('حدث خطأ في تحميل المقالات')
    }
  }

  const filterAndSortArticles = () => {
    let filtered = articles

    // البحث
    if (searchTerm) {
      filtered = filtered.filter(article => 
        article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        article.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
        article.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
        article.category_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        article.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    }

    // فلترة الحالة
    if (filterStatus !== 'all') {
      filtered = filtered.filter(article => article.status === filterStatus)
    }

    // فلترة الفئة
    if (filterCategory !== 'all') {
      filtered = filtered.filter(article => article.category_id === filterCategory)
    }

    // الترتيب
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt) - new Date(a.createdAt)
        case 'oldest':
          return new Date(a.createdAt) - new Date(b.createdAt)
        case 'views':
          return b.views - a.views
        case 'likes':
          return b.likes - a.likes
        case 'comments':
          return b.comments - a.comments
        default:
          return 0
      }
    })

    setFilteredArticles(filtered)
  }

  const handleStatusChange = async (articleId, newStatus) => {
    try {
      await updateArticle(articleId, { status: newStatus })
     
      const updatedArticles = articles.map(article => {
        if (article.id === articleId) {
          const updatedArticle = { 
            ...article, 
            status: newStatus, 
            updatedAt: new Date().toISOString()
          }
          
          // إذا تم النشر، أضف تاريخ النشر
          if (newStatus === 'published' && !article.publishedAt) {
            updatedArticle.publishedAt = new Date().toISOString()
          }
          
          return updatedArticle
        }
        return article
      })
      
      setArticles(updatedArticles)
      toast.success(`تم تحديث حالة المقال إلى "${getStatusText(newStatus)}" بنجاح`)
    } catch (error) {
      toast.error('حدث خطأ في تحديث حالة المقال')
    }
  }

  const handleDelete = async (articleId) => {
    if (window.confirm('هل أنت متأكد من حذف هذا المقال؟ لا يمكن التراجع عن هذا الإجراء.')) {
      try {
        await deleteArticle(articleId)
        setArticles(articles.filter(article => article.id !== articleId))
        toast.success('تم حذف المقال بنجاح')
      } catch (error) {
        console.error(error)
        toast.error('حدث خطأ في حذف المقال')
      }
    }
  }

  const toggleFeatured = async (articleId) => {
    try {
      const target = articles.find(a => a.id === articleId)
      const nextVal = !target?.featured
      await updateArticle(articleId, { is_featured: nextVal })
      setArticles(articles.map(article => 
        article.id === articleId 
          ? { ...article, featured: nextVal, updatedAt: new Date().toISOString() }
          : article
      ))
      toast.success('تم تحديث حالة المقال المميز بنجاح')
    } catch (error) {
      console.error(error)
      toast.error('حدث خطأ في تحديث المقال')
    }
  }

  const [creating, setCreating] = useState(false)
  const handleAddArticle = async () => {
    try {
      if (creating) return
      setCreating(true)
      if (!newArticle.title || !newArticle.content) {
        toast.error('يرجى إدخال العنوان والمحتوى')
        return
      }
      const payload = {
        title: newArticle.title,
        excerpt: newArticle.excerpt,
        content: newArticle.content,
        category_id: newArticle.category_id || null,
        tags: newArticle.tags,
        status: newArticle.status,
        is_featured: !!newArticle.featured,
        featured_image: newArticle.featured_image,
        affiliate_links: newArticle.affiliate_links,
        meta_title: newArticle.meta_title,
        meta_description: newArticle.meta_description
      }
      const created = await createArticle(payload, user?.id)
      if (created) {
        toast.success('تم إنشاء المقال بنجاح')
        await fetchArticles()
        setShowAddModal(false)
        setNewArticle({
          title: '', excerpt: '', content: '', category_id: categories?.[0]?.id || '', tags: [], status: 'draft', featured: false, featured_image: '', affiliate_links: [], meta_title: '', meta_description: ''
        })
      } else {
        toast.error('فشل إنشاء المقال. يرجى المحاولة لاحقًا.')
      }
    } catch (error) {
      console.error('خطأ أثناء إنشاء المقال:', error)
      const msg = (error?.message || '').toLowerCase()
      if (msg.includes('jwt') || msg.includes('expired')) {
        toast.error('انتهت صلاحية الجلسة. يرجى تسجيل الدخول مجددًا ثم إعادة المحاولة.')
      } else if (msg.includes('slug')) {
        toast.error('هناك تعارض في الرابط الدائم (slug). حاول تغيير العنوان قليلًا ثم أعد المحاولة.')
      } else {
        toast.error('حدث خطأ غير متوقع أثناء إنشاء المقال')
      }
    } finally {
      setCreating(false)
    }
  }

  const handleEditArticle = async () => {
    try {
      const updates = {
        title: selectedArticle.title,
        excerpt: selectedArticle.excerpt,
        content: selectedArticle.content,
        category_id: selectedArticle.category_id,
        tags: selectedArticle.tags,
        status: selectedArticle.status,
        is_featured: !!selectedArticle.featured,
        featured_image: selectedArticle.featured_image,
        affiliate_links: selectedArticle.affiliate_links,
        meta_title: selectedArticle.meta_title,
        meta_description: selectedArticle.meta_description
      }
      const updated = await updateArticle(selectedArticle.id, updates)
      if (!updated) {
        toast.error('تعذر تحديث المقال')
        return
      }
      await fetchArticles()
      setShowEditModal(false)
      setSelectedArticle(null)
      toast.success('تم تحديث المقال بنجاح')
    } catch (error) {
      console.error(error)
      toast.error('حدث خطأ في تحديث المقال')
    }
  }

  const openEditModal = (article) => {
    setSelectedArticle({ ...article })
    setShowEditModal(true)
  }

  const getStatusText = (status) => {
    switch (status) {
      case 'published': return 'منشور'
      case 'draft': return 'مسودة'
      case 'review': return 'قيد المراجعة'
      default: return status
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-800'
      case 'draft': return 'bg-gray-100 text-gray-800'
      case 'review': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'غير محدد'
    return new Date(dateString).toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  // تمت إزالة بوابة التحميل القديمة: AdminLayout يتكفل بالحماية وإدارة الحالة العامة

  /* removed duplicate categories constant; using state-based categories loaded from DB */
  const publishedArticles = articles.filter(article => article.status === 'published')
  const totalViews = publishedArticles.reduce((sum, article) => sum + article.views, 0)
  const totalLikes = publishedArticles.reduce((sum, article) => sum + article.likes, 0)
  const totalComments = publishedArticles.reduce((sum, article) => sum + article.comments, 0)

  return (
    <AdminLayout title="إدارة المقالات" description="إدارة وإنشاء وتحرير المقالات">
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
                    <FileText className="w-8 h-8 text-primary-600 mr-3" />
                    إدارة المقالات
                  </h1>
                  <p className="text-gray-600 mt-1">إدارة وتحديث المقالات والمحتوى</p>
                </div>
              </div>
              <button 
                onClick={() => setShowAddModal(true)}
                className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 flex items-center"
              >
                <Plus className="w-5 h-5 mr-2" />
                إضافة مقال جديد
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-lg bg-blue-100 mr-4">
                  <FileText className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">إجمالي المقالات</p>
                  <p className="text-2xl font-bold text-gray-900">{articles.length}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-lg bg-green-100 mr-4">
                  <Eye className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">إجمالي المشاهدات</p>
                  <p className="text-2xl font-bold text-gray-900">{totalViews.toLocaleString()}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-lg bg-red-100 mr-4">
                  <Heart className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">إجمالي الإعجابات</p>
                  <p className="text-2xl font-bold text-gray-900">{totalLikes.toLocaleString()}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-lg bg-purple-100 mr-4">
                  <MessageCircle className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">إجمالي التعليقات</p>
                  <p className="text-2xl font-bold text-gray-900">{totalComments.toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>



          {/* Filters */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {/* البحث */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="البحث في المقالات..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              {/* فلتر الحالة */}
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="all">جميع الحالات</option>
                <option value="published">منشور</option>
                <option value="draft">مسودة</option>
                <option value="review">قيد المراجعة</option>
              </select>

              {/* فلتر الفئة */}
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="all">جميع الفئات</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name_ar || category.name}
                  </option>
                ))}
              </select>

              {/* الترتيب */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="newest">الأحدث</option>
                <option value="oldest">الأقدم</option>
                <option value="views">الأكثر مشاهدة</option>
                <option value="likes">الأكثر إعجاباً</option>
                <option value="comments">الأكثر تعليقاً</option>
              </select>

              {/* إحصائيات سريعة */}
              <div className="text-sm text-gray-600">
                <span className="font-medium">{filteredArticles.length}</span> من {articles.length} مقال
              </div>
            </div>
          </div>

          {/* Articles List */}
          <div className="space-y-6">
            {filteredArticles.map((article) => (
              <div key={article.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                <div className="p-6">
                  <div className="flex items-start space-x-4 space-x-reverse">
                    {/* Thumbnail */}
                    <div className="flex-shrink-0">
                      <img 
                        src={article.thumbnail} 
                        alt={article.title}
                        className="w-32 h-24 object-cover rounded-lg"
                      />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2 space-x-reverse">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(article.status)}`}>
                            {getStatusText(article.status)}
                          </span>
                          {article.featured && (
                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                              مميز
                            </span>
                          )}
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            {article.category_name}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2 space-x-reverse text-sm text-gray-500">
                          <Clock className="w-4 h-4" />
                          <span>{article.readTime} دقائق قراءة</span>
                        </div>
                      </div>

                      <h3 className="text-lg font-semibold text-gray-900 mb-2 hover:text-primary-600 cursor-pointer">
                        {article.title}
                      </h3>
                      
                      <p className="text-gray-600 mb-3 line-clamp-2">{article.excerpt}</p>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-1 mb-3">
                        {article.tags.map((tag, index) => (
                          <span key={index} className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-700">
                            <Tag className="w-3 h-3 mr-1" />
                            {tag}
                          </span>
                        ))}
                      </div>

                      {/* Meta Info */}
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <div className="flex items-center space-x-4 space-x-reverse">
                          <div className="flex items-center">
                            <User className="w-4 h-4 mr-1" />
                            <span>{article.author}</span>
                          </div>
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-1" />
                            <span>{formatDate(article.publishedAt || article.createdAt)}</span>
                          </div>
                        </div>
                        
                        {article.status === 'published' && (
                          <div className="flex items-center space-x-4 space-x-reverse">
                            <div className="flex items-center">
                              <Eye className="w-4 h-4 mr-1" />
                              <span>{article.views.toLocaleString()}</span>
                            </div>
                            <div className="flex items-center">
                              <Heart className="w-4 h-4 mr-1" />
                              <span>{article.likes.toLocaleString()}</span>
                            </div>
                            <div className="flex items-center">
                              <MessageCircle className="w-4 h-4 mr-1" />
                              <span>{article.comments.toLocaleString()}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex-shrink-0">
                      <div className="flex flex-col space-y-2">
                        <button 
                          onClick={() => toggleFeatured(article.id)}
                          className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                            article.featured
                              ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {article.featured ? 'إلغاء التمييز' : 'تمييز'}
                        </button>
                        
                        <select
                          value={article.status}
                          onChange={(e) => handleStatusChange(article.id, e.target.value)}
                          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        >
                          <option value="draft">مسودة</option>
                          <option value="review">قيد المراجعة</option>
                          <option value="published">منشور</option>
                        </select>
                        
                        <div className="flex space-x-1 space-x-reverse">
                          <button 
                            onClick={() => openEditModal(article)}
                            className="px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDelete(article.id)}
                            className="px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Empty State */}
          {filteredArticles.length === 0 && (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد مقالات</h3>
              <p className="text-gray-500 mb-4">لم يتم العثور على مقالات تطابق معايير البحث</p>
              <button 
                onClick={() => setShowAddModal(true)}
                className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700"
              >
                إضافة مقال جديد
              </button>
            </div>
          )}
        </div>

        {/* Add Article Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">إضافة مقال جديد</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">عنوان المقال</label>
                  <input
                    type="text"
                    value={newArticle.title}
                    onChange={(e) => setNewArticle({...newArticle, title: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="أدخل عنوان المقال"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">الملخص</label>
                  <textarea
                    value={newArticle.excerpt}
                    onChange={(e) => setNewArticle({...newArticle, excerpt: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    rows="3"
                    placeholder="أدخل ملخص المقال"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">المحتوى</label>
                  <AdvancedEditor
                    value={newArticle.content}
                    onChange={(content) => setNewArticle({...newArticle, content})}
                    placeholder="ابدأ كتابة محتوى المقال هنا..."
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">الفئة</label>
                    <select
                      value={newArticle.category_id}
                      onChange={(e) => setNewArticle({ ...newArticle, category_id: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    >
                      <option value="">اختر الفئة</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name_ar || cat.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">الحالة</label>
                    <select
                      value={newArticle.status}
                      onChange={(e) => setNewArticle({...newArticle, status: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    >
                      <option value="draft">مسودة</option>
                      <option value="review">قيد المراجعة</option>
                      <option value="published">منشور</option>
                    </select>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">الكلمات المفتاحية</label>
                  <input
                    type="text"
                    value={newArticle.tags.join(', ')}
                    onChange={(e) => setNewArticle({...newArticle, tags: e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="أدخل الكلمات المفتاحية مفصولة بفاصلة"
                  />
                </div>
                
                {/* حقول SEO */}
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <h4 className="text-sm font-semibold text-gray-800 mb-3 flex items-center">
                    <FileText className="w-4 h-4 mr-2" />
                    إعدادات تحسين محركات البحث (SEO)
                  </h4>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">عنوان SEO</label>
                      <input
                        type="text"
                        value={newArticle.meta_title || ''}
                        onChange={(e) => setNewArticle({...newArticle, meta_title: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="عنوان مخصص لمحركات البحث (اختياري)"
                        maxLength="60"
                      />
                      <p className="text-xs text-gray-500 mt-1">الطول المثالي: 50-60 حرف</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">وصف SEO</label>
                      <textarea
                        value={newArticle.meta_description || ''}
                        onChange={(e) => setNewArticle({...newArticle, meta_description: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        rows="2"
                        placeholder="وصف مخصص لمحركات البحث (اختياري)"
                        maxLength="160"
                      />
                      <p className="text-xs text-gray-500 mt-1">الطول المثالي: 150-160 حرف</p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">رابط الصورة الرئيسية</label>
                  <input
                    type="url"
                    value={newArticle.featured_image}
                    onChange={(e) => setNewArticle({...newArticle, featured_image: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="https://example.com/image.jpg"
                  />
                  {newArticle.featured_image && (
                    <div className="mt-2">
                      <img 
                        src={newArticle.featured_image} 
                        alt="معاينة الصورة" 
                        className="w-32 h-20 object-cover rounded-lg border"
                        onError={(e) => {
                          e.target.style.display = 'none'
                        }}
                      />
                    </div>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">روابط الإحالة</label>
                  <div className="space-y-2">
                    {newArticle.affiliate_links.map((link, index) => (
                      <div key={index} className="flex gap-2">
                        <input
                          type="text"
                          value={link.title || ''}
                          onChange={(e) => {
                            const updatedLinks = [...newArticle.affiliate_links]
                            updatedLinks[index] = { ...updatedLinks[index], title: e.target.value }
                            setNewArticle({...newArticle, affiliate_links: updatedLinks})
                          }}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          placeholder="عنوان الرابط"
                        />
                        <input
                          type="url"
                          value={link.url || ''}
                          onChange={(e) => {
                            const updatedLinks = [...newArticle.affiliate_links]
                            updatedLinks[index] = { ...updatedLinks[index], url: e.target.value }
                            setNewArticle({...newArticle, affiliate_links: updatedLinks})
                          }}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          placeholder="https://example.com"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const updatedLinks = newArticle.affiliate_links.filter((_, i) => i !== index)
                            setNewArticle({...newArticle, affiliate_links: updatedLinks})
                          }}
                          className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          حذف
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => {
                        setNewArticle({
                          ...newArticle, 
                          affiliate_links: [...newArticle.affiliate_links, { title: '', url: '' }]
                        })
                      }}
                      className="w-full px-3 py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-primary-500 hover:text-primary-600 transition-colors"
                    >
                      + إضافة رابط إحالة
                    </button>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="featured"
                    checked={newArticle.featured}
                    onChange={(e) => setNewArticle({...newArticle, featured: e.target.checked})}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <label htmlFor="featured" className="mr-2 block text-sm text-gray-900">
                    مقال مميز
                  </label>
                </div>
              </div>
              
              <div className="flex space-x-3 space-x-reverse mt-6">
                <button
                  onClick={handleAddArticle}
                  className="flex-1 bg-primary-600 text-white py-2 px-4 rounded-lg hover:bg-primary-700 transition-colors"
                >
                  إضافة المقال
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

        {/* Edit Article Modal */}
        {showEditModal && selectedArticle && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">تعديل المقال</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">عنوان المقال</label>
                  <input
                    type="text"
                    value={selectedArticle.title}
                    onChange={(e) => setSelectedArticle({...selectedArticle, title: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">الملخص</label>
                  <textarea
                    value={selectedArticle.excerpt}
                    onChange={(e) => setSelectedArticle({...selectedArticle, excerpt: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    rows="3"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">المحتوى</label>
                  <AdvancedEditor
                    value={selectedArticle.content}
                    onChange={(content) => setSelectedArticle({...selectedArticle, content})}
                    placeholder="ابدأ كتابة محتوى المقال هنا..."
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">الفئة</label>
                    <select
                      value={selectedArticle.category_id}
                      onChange={(e) => setSelectedArticle({...selectedArticle, category_id: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    >
                      <option value="">اختر الفئة</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name_ar || cat.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">الحالة</label>
                    <select
                      value={selectedArticle.status}
                      onChange={(e) => setSelectedArticle({...selectedArticle, status: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    >
                      <option value="draft">مسودة</option>
                      <option value="review">قيد المراجعة</option>
                      <option value="published">منشور</option>
                    </select>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">الكلمات المفتاحية</label>
                  <input
                    type="text"
                    value={selectedArticle.tags.join(', ')}
                    onChange={(e) => setSelectedArticle({...selectedArticle, tags: e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="أدخل الكلمات المفتاحية مفصولة بفاصلة"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">رابط الصورة الرئيسية</label>
                  <input
                    type="url"
                    value={selectedArticle.featured_image || ''}
                    onChange={(e) => setSelectedArticle({...selectedArticle, featured_image: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="https://example.com/image.jpg"
                  />
                  {selectedArticle.featured_image && (
                    <div className="mt-2">
                      <img 
                        src={selectedArticle.featured_image} 
                        alt="معاينة الصورة" 
                        className="w-32 h-20 object-cover rounded-lg border"
                        onError={(e) => {
                          e.target.style.display = 'none'
                        }}
                      />
                    </div>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">روابط الإحالة</label>
                  <div className="space-y-2">
                    {(selectedArticle.affiliate_links || []).map((link, index) => (
                      <div key={index} className="flex gap-2">
                        <input
                          type="text"
                          value={link.title || ''}
                          onChange={(e) => {
                            const updatedLinks = [...(selectedArticle.affiliate_links || [])]
                            updatedLinks[index] = { ...updatedLinks[index], title: e.target.value }
                            setSelectedArticle({...selectedArticle, affiliate_links: updatedLinks})
                          }}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          placeholder="عنوان الرابط"
                        />
                        <input
                          type="url"
                          value={link.url || ''}
                          onChange={(e) => {
                            const updatedLinks = [...(selectedArticle.affiliate_links || [])]
                            updatedLinks[index] = { ...updatedLinks[index], url: e.target.value }
                            setSelectedArticle({...selectedArticle, affiliate_links: updatedLinks})
                          }}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          placeholder="https://example.com"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const updatedLinks = (selectedArticle.affiliate_links || []).filter((_, i) => i !== index)
                            setSelectedArticle({...selectedArticle, affiliate_links: updatedLinks})
                          }}
                          className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          حذف
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedArticle({
                          ...selectedArticle, 
                          affiliate_links: [...(selectedArticle.affiliate_links || []), { title: '', url: '' }]
                        })
                      }}
                      className="w-full px-3 py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-primary-500 hover:text-primary-600 transition-colors"
                    >
                      + إضافة رابط إحالة
                    </button>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="editFeatured"
                    checked={selectedArticle.featured}
                    onChange={(e) => setSelectedArticle({...selectedArticle, featured: e.target.checked})}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <label htmlFor="editFeatured" className="mr-2 block text-sm text-gray-900">
                    مقال مميز
                  </label>
                </div>
              </div>
              
              <div className="flex space-x-3 space-x-reverse mt-6">
                <button
                  onClick={handleEditArticle}
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

export default AdminArticles