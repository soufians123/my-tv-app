import { useState, useEffect, createContext, useContext } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from './ToastSystem'
import { MessageCircle, Send, ThumbsUp, ThumbsDown, Trash2, Eye, EyeOff, Flag, Reply } from 'lucide-react'
import { Button, Input, Card, Badge } from './ui/unified-components'

// إنشاء Context للتعليقات
const CommentsContext = createContext()

// Hook لاستخدام نظام التعليقات
export const useComments = () => {
  const context = useContext(CommentsContext)
  if (!context) {
    throw new Error('useComments must be used within a CommentsProvider')
  }
  return context
}

// مزود نظام التعليقات
export const CommentsProvider = ({ children }) => {
  const [comments, setComments] = useState([])
  const [loading, setLoading] = useState(false)
  const { user, isAdmin } = useAuth()
  const { showToast } = useToast()

  // تحميل التعليقات من localStorage
  useEffect(() => {
    const savedComments = localStorage.getItem('comments')
    if (savedComments) {
      try {
        setComments(JSON.parse(savedComments))
      } catch (error) {
        console.error('Error loading comments:', error)
        setComments([])
      }
    }
  }, [])

  // حفظ التعليقات في localStorage
  const saveComments = (newComments) => {
    try {
      localStorage.setItem('comments', JSON.stringify(newComments))
      setComments(newComments)
    } catch (error) {
      console.error('Error saving comments:', error)
      showToast('حدث خطأ في حفظ التعليق', 'error')
    }
  }

  // إضافة تعليق جديد
  const addComment = (articleId, content, parentId = null) => {
    if (!user) {
      showToast('يرجى تسجيل الدخول للتعليق', 'error')
      return false
    }

    if (!content.trim()) {
      showToast('يرجى كتابة محتوى التعليق', 'error')
      return false
    }

    const newComment = {
      id: Date.now() + Math.random(),
      articleId: parseInt(articleId),
      content: content.trim(),
      author: {
        id: user.id,
        name: user.user_metadata?.full_name || user.email,
        avatar: user.user_metadata?.avatar_url || '/api/placeholder/40/40',
        email: user.email
      },
      parentId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      likes: 0,
      dislikes: 0,
      likedBy: [],
      dislikedBy: [],
      hidden: false,
      reported: false,
      replies: []
    }

    let updatedComments
    if (parentId) {
      // إضافة رد على تعليق موجود
      updatedComments = comments.map(comment => {
        if (comment.id === parentId) {
          return {
            ...comment,
            replies: [...comment.replies, newComment]
          }
        }
        return comment
      })
    } else {
      // إضافة تعليق جديد
      updatedComments = [newComment, ...comments]
    }

    saveComments(updatedComments)
    showToast('تم إضافة التعليق بنجاح', 'success')
    return true
  }

  // حذف تعليق (للمشرفين فقط)
  const deleteComment = (commentId) => {
    if (!user || !isAdmin()) {
      showToast('ليس لديك صلاحية لحذف التعليقات', 'error')
      return false
    }

    const updatedComments = comments.filter(comment => {
      if (comment.id === commentId) {
        return false
      }
      // حذف الردود أيضاً
      comment.replies = comment.replies.filter(reply => reply.id !== commentId)
      return true
    })

    saveComments(updatedComments)
    showToast('تم حذف التعليق بنجاح', 'success')
    return true
  }

  // إخفاء/إظهار تعليق (للمشرفين فقط)
  const toggleCommentVisibility = (commentId) => {
    if (!user || !isAdmin()) {
      showToast('ليس لديك صلاحية لإدارة التعليقات', 'error')
      return false
    }

    const updatedComments = comments.map(comment => {
      if (comment.id === commentId) {
        return { ...comment, hidden: !comment.hidden }
      }
      // التحقق من الردود أيضاً
      comment.replies = comment.replies.map(reply => {
        if (reply.id === commentId) {
          return { ...reply, hidden: !reply.hidden }
        }
        return reply
      })
      return comment
    })

    saveComments(updatedComments)
    showToast('تم تحديث حالة التعليق', 'success')
    return true
  }

  // إعجاب/عدم إعجاب بتعليق
  const likeComment = (commentId, isLike = true) => {
    if (!user) {
      showToast('يرجى تسجيل الدخول للتفاعل مع التعليقات', 'error')
      return false
    }

    const updatedComments = comments.map(comment => {
      const updateCommentLikes = (comm) => {
        const userId = user.id
        let newLikedBy = [...comm.likedBy]
        let newDislikedBy = [...comm.dislikedBy]

        if (isLike) {
          if (newLikedBy.includes(userId)) {
            // إلغاء الإعجاب
            newLikedBy = newLikedBy.filter(id => id !== userId)
          } else {
            // إضافة إعجاب وإزالة عدم الإعجاب إن وجد
            newLikedBy.push(userId)
            newDislikedBy = newDislikedBy.filter(id => id !== userId)
          }
        } else {
          if (newDislikedBy.includes(userId)) {
            // إلغاء عدم الإعجاب
            newDislikedBy = newDislikedBy.filter(id => id !== userId)
          } else {
            // إضافة عدم إعجاب وإزالة الإعجاب إن وجد
            newDislikedBy.push(userId)
            newLikedBy = newLikedBy.filter(id => id !== userId)
          }
        }

        return {
          ...comm,
          likedBy: newLikedBy,
          dislikedBy: newDislikedBy,
          likes: newLikedBy.length,
          dislikes: newDislikedBy.length
        }
      }

      if (comment.id === commentId) {
        return updateCommentLikes(comment)
      }
      
      // التحقق من الردود
      comment.replies = comment.replies.map(reply => {
        if (reply.id === commentId) {
          return updateCommentLikes(reply)
        }
        return reply
      })
      
      return comment
    })

    saveComments(updatedComments)
    return true
  }

  // الحصول على تعليقات مقال معين
  const getArticleComments = (articleId) => {
    return comments.filter(comment => 
      comment.articleId === parseInt(articleId) && !comment.hidden
    )
  }

  // الحصول على جميع التعليقات (للمشرفين)
  const getAllComments = () => {
    if (!user || !isAdmin()) {
      return []
    }
    return comments
  }



  // إحصائيات التعليقات
  const getCommentsStats = () => {
    const totalComments = comments.length
    const totalReplies = comments.reduce((sum, comment) => sum + comment.replies.length, 0)
    const hiddenComments = comments.filter(comment => comment.hidden).length
    const reportedComments = comments.filter(comment => comment.reported).length

    return {
      total: totalComments + totalReplies,
      comments: totalComments,
      replies: totalReplies,
      hidden: hiddenComments,
      reported: reportedComments
    }
  }

  const value = {
    comments,
    loading,
    addComment,
    deleteComment,
    toggleCommentVisibility,
    likeComment,
    getArticleComments,
    getAllComments,
    getCommentsStats,
    isAdmin
  }

  return (
    <CommentsContext.Provider value={value}>
      {children}
    </CommentsContext.Provider>
  )
}

// مكون عرض التعليقات
export const CommentsSection = ({ articleId }) => {
  const { user } = useAuth()
  const { 
    addComment, 
    deleteComment, 
    toggleCommentVisibility, 
    likeComment, 
    getArticleComments, 
    isAdmin 
  } = useComments()
  
  const [newComment, setNewComment] = useState('')
  const [replyTo, setReplyTo] = useState(null)
  const [replyContent, setReplyContent] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const articleComments = getArticleComments(articleId)

  // إرسال تعليق جديد
  const handleSubmitComment = async (e) => {
    e.preventDefault()
    if (!newComment.trim()) return

    setSubmitting(true)
    const success = addComment(articleId, newComment)
    if (success) {
      setNewComment('')
    }
    setSubmitting(false)
  }

  // إرسال رد
  const handleSubmitReply = async (e) => {
    e.preventDefault()
    if (!replyContent.trim()) return

    setSubmitting(true)
    const success = addComment(articleId, replyContent, replyTo)
    if (success) {
      setReplyContent('')
      setReplyTo(null)
    }
    setSubmitting(false)
  }

  // تنسيق التاريخ
  const formatDate = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60))
    
    if (diffInHours < 1) {
      return 'منذ قليل'
    } else if (diffInHours < 24) {
      return `منذ ${diffInHours} ساعة`
    } else {
      const diffInDays = Math.floor(diffInHours / 24)
      if (diffInDays < 7) {
        return `منذ ${diffInDays} يوم`
      } else {
        return date.toLocaleDateString('ar-EG')
      }
    }
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        التعليقات ({articleComments.length})
      </h2>
      
      {/* نموذج إضافة تعليق */}
      {user ? (
        <form onSubmit={handleSubmitComment} className="mb-8">
          <div className="flex gap-4">
            <img
              src={user.user_metadata?.avatar_url || '/api/placeholder/40/40'}
              alt={user.user_metadata?.full_name || user.email}
              className="w-10 h-10 rounded-full flex-shrink-0"
            />
            <div className="flex-1">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="اكتب تعليقك هنا..."
                rows={3}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
              />
              <div className="flex justify-end mt-2">
                <button
                  type="submit"
                  disabled={submitting || !newComment.trim()}
                  className="btn-primary flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  ) : (
                    <Send className="h-4 w-4 mr-2" />
                  )}
                  إرسال
                </button>
              </div>
            </div>
          </div>
        </form>
      ) : (
        <div className="text-center py-8 bg-gray-50 rounded-lg mb-8">
          <p className="text-gray-600 mb-4">يرجى تسجيل الدخول للتعليق على المقال</p>
          <a href="/auth/login" className="btn-primary">
            تسجيل الدخول
          </a>
        </div>
      )}
      
      {/* قائمة التعليقات */}
      <div className="space-y-6">
        {articleComments.map(comment => (
          <div key={comment.id} className="border-b border-gray-200 pb-6 last:border-b-0">
            <div className="flex gap-4">
              <img
                src={comment.author.avatar}
                alt={comment.author.name}
                className="w-10 h-10 rounded-full flex-shrink-0"
              />
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-900">{comment.author.name}</span>
                    <span className="text-sm text-gray-500">{formatDate(comment.createdAt)}</span>
                  </div>
                  
                  {/* أزرار الإدارة للمشرفين */}
                  {isAdmin && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleCommentVisibility(comment.id)}
                        className={`p-1 rounded transition-colors ${
                          comment.hidden 
                            ? 'text-gray-400 hover:text-gray-600' 
                            : 'text-green-600 hover:text-green-700'
                        }`}
                        title={comment.hidden ? 'إظهار التعليق' : 'إخفاء التعليق'}
                      >
                        {comment.hidden ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                      <button
                        onClick={() => deleteComment(comment.id)}
                        className="p-1 text-red-600 hover:text-red-700 transition-colors"
                        title="حذف التعليق"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>
                
                <p className="text-gray-700 mb-3">{comment.content}</p>
                
                <div className="flex items-center space-x-4 space-x-reverse">
                  <button
                    onClick={() => likeComment(comment.id, true)}
                    className={`flex items-center space-x-1 space-x-reverse text-sm transition-colors ${
                      comment.likedBy?.includes(user?.id) 
                        ? 'text-green-600' 
                        : 'text-gray-500 hover:text-green-600'
                    }`}
                  >
                    <ThumbsUp className="h-4 w-4" />
                    <span>{comment.likes}</span>
                  </button>
                  
                  <button
                    onClick={() => likeComment(comment.id, false)}
                    className={`flex items-center space-x-1 space-x-reverse text-sm transition-colors ${
                      comment.dislikedBy?.includes(user?.id) 
                        ? 'text-red-600' 
                        : 'text-gray-500 hover:text-red-600'
                    }`}
                  >
                    <ThumbsDown className="h-4 w-4" />
                    <span>{comment.dislikes}</span>
                  </button>
                  
                  {user && (
                    <button 
                      onClick={() => setReplyTo(replyTo === comment.id ? null : comment.id)}
                      className="text-sm text-gray-500 hover:text-primary-600 transition-colors flex items-center"
                    >
                      <Reply className="h-4 w-4 mr-1" />
                      رد
                    </button>
                  )}
                </div>
                
                {/* نموذج الرد */}
                {replyTo === comment.id && (
                  <form onSubmit={handleSubmitReply} className="mt-4">
                    <div className="flex gap-3">
                      <img
                        src={user.user_metadata?.avatar_url || '/api/placeholder/40/40'}
                        alt={user.user_metadata?.full_name || user.email}
                        className="w-8 h-8 rounded-full flex-shrink-0"
                      />
                      <div className="flex-1">
                        <textarea
                          value={replyContent}
                          onChange={(e) => setReplyContent(e.target.value)}
                          placeholder="اكتب ردك هنا..."
                          rows={2}
                          className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none text-sm"
                        />
                        <div className="flex justify-end gap-2 mt-2">
                          <button
                            type="button"
                            onClick={() => {
                              setReplyTo(null)
                              setReplyContent('')
                            }}
                            className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 transition-colors"
                          >
                            إلغاء
                          </button>
                          <button
                            type="submit"
                            disabled={submitting || !replyContent.trim()}
                            className="px-3 py-1 bg-primary-600 text-white text-sm rounded hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {submitting ? 'جاري الإرسال...' : 'إرسال'}
                          </button>
                        </div>
                      </div>
                    </div>
                  </form>
                )}
                
                {/* الردود */}
                {comment.replies && comment.replies.length > 0 && (
                  <div className="mt-4 pr-6 space-y-4">
                    {comment.replies.filter(reply => !reply.hidden).map(reply => (
                      <div key={reply.id} className="flex gap-3">
                        <img
                          src={reply.author.avatar}
                          alt={reply.author.name}
                          className="w-8 h-8 rounded-full flex-shrink-0"
                        />
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-gray-900 text-sm">{reply.author.name}</span>
                              <span className="text-xs text-gray-500">{formatDate(reply.createdAt)}</span>
                            </div>
                            
                            {/* أزرار الإدارة للردود */}
                            {isAdmin && (
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => toggleCommentVisibility(reply.id)}
                                  className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                                  title={reply.hidden ? 'إظهار الرد' : 'إخفاء الرد'}
                                >
                                  {reply.hidden ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                                </button>
                                <button
                                  onClick={() => deleteComment(reply.id)}
                                  className="p-1 text-red-600 hover:text-red-700 transition-colors"
                                  title="حذف الرد"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </button>
                              </div>
                            )}
                          </div>
                          
                          <p className="text-gray-700 text-sm mb-2">{reply.content}</p>
                          
                          <div className="flex items-center space-x-3 space-x-reverse">
                            <button 
                              onClick={() => likeComment(reply.id, true)}
                              className={`flex items-center space-x-1 space-x-reverse text-xs transition-colors ${
                                reply.likedBy?.includes(user?.id) 
                                  ? 'text-green-600' 
                                  : 'text-gray-500 hover:text-green-600'
                              }`}
                            >
                              <ThumbsUp className="h-3 w-3" />
                              <span>{reply.likes}</span>
                            </button>
                            
                            <button 
                              onClick={() => likeComment(reply.id, false)}
                              className={`flex items-center space-x-1 space-x-reverse text-xs transition-colors ${
                                reply.dislikedBy?.includes(user?.id) 
                                  ? 'text-red-600' 
                                  : 'text-gray-500 hover:text-red-600'
                              }`}
                            >
                              <ThumbsDown className="h-3 w-3" />
                              <span>{reply.dislikes}</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
        
        {articleComments.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <MessageCircle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>لا توجد تعليقات بعد. كن أول من يعلق!</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default CommentsSection