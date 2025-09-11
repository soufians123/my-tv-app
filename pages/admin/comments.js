import { useState, useEffect } from 'react'
import { useComments } from '../../components/CommentsSystem'
import AdminLayout from '../../components/admin/AdminLayout'
import { MessageCircle, Eye, EyeOff, Trash2, User, Calendar, ThumbsUp, ThumbsDown, Search, Filter, BarChart3 } from 'lucide-react'
import { useToast } from '../../components/ToastSystem'

export default function AdminComments() {
  const { getAllComments, deleteComment, toggleCommentVisibility, getCommentsStats, isAdmin } = useComments()
  const { showToast } = useToast()
  
  const [comments, setComments] = useState([])
  const [filteredComments, setFilteredComments] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all') // all, visible, hidden, reported
  const [sortBy, setSortBy] = useState('newest') // newest, oldest, likes, dislikes
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  // التحقق من صلاحيات المشرف
  useEffect(() => {
    // AdminLayout يتولى التحقق من الصلاحيات والتوجيه
    loadComments()
  }, [])

  // تحميل التعليقات
  const loadComments = () => {
    try {
      const allComments = getAllComments()
      const flatComments = []
      
      // تحويل التعليقات والردود إلى قائمة مسطحة
      allComments.forEach(comment => {
        flatComments.push({ ...comment, type: 'comment' })
        if (comment.replies && comment.replies.length > 0) {
          comment.replies.forEach(reply => {
            flatComments.push({ ...reply, type: 'reply', parentId: comment.id })
          })
        }
      })
      
      setComments(flatComments)
      setFilteredComments(flatComments)
      setStats(getCommentsStats())
      setLoading(false)
    } catch (error) {
      console.error('Error loading comments:', error)
      showToast('حدث خطأ في تحميل التعليقات', 'error')
      setLoading(false)
    }
  }

  // تطبيق الفلاتر والبحث
  useEffect(() => {
    let filtered = [...comments]
    
    // البحث
    if (searchTerm) {
      filtered = filtered.filter(comment => 
        comment.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        comment.author.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }
    
    // الفلتر حسب الحالة
    switch (filterStatus) {
      case 'visible':
        filtered = filtered.filter(comment => !comment.hidden)
        break
      case 'hidden':
        filtered = filtered.filter(comment => comment.hidden)
        break
      case 'reported':
        filtered = filtered.filter(comment => comment.reported)
        break
    }
    
    // الترتيب
    switch (sortBy) {
      case 'newest':
        filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        break
      case 'oldest':
        filtered.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
        break
      case 'likes':
        filtered.sort((a, b) => b.likes - a.likes)
        break
      case 'dislikes':
        filtered.sort((a, b) => b.dislikes - a.dislikes)
        break
    }
    
    setFilteredComments(filtered)
  }, [comments, searchTerm, filterStatus, sortBy])

  // حذف تعليق
  const handleDeleteComment = async (commentId) => {
    if (window.confirm('هل أنت متأكد من حذف هذا التعليق؟')) {
      const success = deleteComment(commentId)
      if (success) {
        loadComments() // إعادة تحميل التعليقات
      }
    }
  }

  // إخفاء/إظهار تعليق
  const handleToggleVisibility = async (commentId) => {
    const success = toggleCommentVisibility(commentId)
    if (success) {
      loadComments() // إعادة تحميل التعليقات
    }
  }

  // تنسيق التاريخ
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <AdminLayout title="إدارة التعليقات" description="إدارة وتنظيم تعليقات المستخدمين">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout title="إدارة التعليقات" description="إدارة وتنظيم تعليقات المستخدمين">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">إدارة التعليقات</h1>
          <p className="text-gray-600">إدارة وتنظيم تعليقات المستخدمين</p>
        </div>

        {/* إحصائيات */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <MessageCircle className="h-6 w-6 text-blue-600" />
                </div>
                <div className="mr-4">
                  <p className="text-sm font-medium text-gray-600">إجمالي التعليقات</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Eye className="h-6 w-6 text-green-600" />
                </div>
                <div className="mr-4">
                  <p className="text-sm font-medium text-gray-600">التعليقات المرئية</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total - stats.hidden}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <EyeOff className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="mr-4">
                  <p className="text-sm font-medium text-gray-600">التعليقات المخفية</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.hidden}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-red-100 rounded-lg">
                  <BarChart3 className="h-6 w-6 text-red-600" />
                </div>
                <div className="mr-4">
                  <p className="text-sm font-medium text-gray-600">التعليقات المبلغ عنها</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.reported}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* أدوات البحث والفلترة */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* البحث */}
            <div className="relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="ابحث في التعليقات..."
                className="w-full border border-gray-300 rounded-lg px-10 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            {/* فلترة */}
            <div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="all">جميع الحالات</option>
                <option value="visible">مرئي</option>
                <option value="hidden">مخفي</option>
                <option value="reported">تم الإبلاغ عنه</option>
              </select>
            </div>
            {/* ترتيب */}
            <div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="newest">الأحدث</option>
                <option value="oldest">الأقدم</option>
                <option value="likes">الإعجابات</option>
                <option value="dislikes">عدم الإعجاب</option>
              </select>
            </div>
          </div>
        </div>

        {/* قائمة التعليقات */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              التعليقات ({filteredComments.length})
            </h2>
          </div>
          
          <div className="divide-y divide-gray-200">
            {filteredComments.length > 0 ? (
              filteredComments.map(comment => (
                <div key={comment.id} className={`p-6 ${comment.hidden ? 'bg-gray-50' : ''}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4 space-x-reverse flex-1">
                      <img
                        src={comment.author.avatar}
                        alt={comment.author.name}
                        className="w-10 h-10 rounded-full flex-shrink-0"
                      />
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 space-x-reverse mb-2">
                          <span className="font-medium text-gray-900">{comment.author.name}</span>
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            comment.type === 'reply' 
                              ? 'bg-blue-100 text-blue-800' 
                              : 'bg-green-100 text-green-800'
                          }`}>
                            {comment.type === 'reply' ? 'رد' : 'تعليق'}
                          </span>
                          {comment.hidden && (
                            <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full">
                              مخفي
                            </span>
                          )}
                          {comment.reported && (
                            <span className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full">
                              مبلغ عنه
                            </span>
                          )}
                        </div>
                        
                        <p className="text-gray-700 mb-3">{comment.content}</p>
                        
                        <div className="flex items-center space-x-6 space-x-reverse text-sm text-gray-500">
                          <div className="flex items-center space-x-1 space-x-reverse">
                            <Calendar className="h-4 w-4" />
                            <span>{formatDate(comment.createdAt)}</span>
                          </div>
                          
                          <div className="flex items-center space-x-1 space-x-reverse">
                            <ThumbsUp className="h-4 w-4" />
                            <span>{comment.likes}</span>
                          </div>
                          
                          <div className="flex items-center space-x-1 space-x-reverse">
                            <ThumbsDown className="h-4 w-4" />
                            <span>{comment.dislikes}</span>
                          </div>
                          
                          <div className="flex items-center space-x-1 space-x-reverse">
                            <User className="h-4 w-4" />
                            <span>المقال #{comment.articleId}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* أزرار الإجراءات */}
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <button
                        onClick={() => handleToggleVisibility(comment.id)}
                        className={`p-2 rounded-lg transition-colors ${
                          comment.hidden 
                            ? 'text-gray-400 hover:text-gray-600 hover:bg-gray-100' 
                            : 'text-green-600 hover:text-green-700 hover:bg-green-50'
                        }`}
                        title={comment.hidden ? 'إظهار التعليق' : 'إخفاء التعليق'}
                      >
                        {comment.hidden ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                      
                      <button
                        onClick={() => handleDeleteComment(comment.id)}
                        className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                        title="حذف التعليق"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-12 text-center">
                <MessageCircle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">لا توجد تعليقات تطابق معايير البحث</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}