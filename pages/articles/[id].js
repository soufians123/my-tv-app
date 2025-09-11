import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { useAuth } from '../../contexts/AuthContext'
import Layout from '../../components/Layout'
import { CommentsSection } from '../../components/CommentsSystem'
import { ArrowLeft, Eye, Heart, MessageCircle, Share2, Calendar, User, Tag, Edit, Trash2, Send, ThumbsUp, ThumbsDown } from 'lucide-react'
import { getArticleById, getRelatedArticles, recordArticleView, likeArticle, unlikeArticle, checkUserLike, getArticleComments } from '../../lib/articlesService'
import toast from 'react-hot-toast'

const ArticlePage = ({ initialArticle, initialRelatedArticles }) => {
  const router = useRouter()
  const { user } = useAuth()
  const [article, setArticle] = useState(initialArticle)
  const [loading, setLoading] = useState(false)
  const [relatedArticles, setRelatedArticles] = useState(initialRelatedArticles || [])
  const [userLiked, setUserLiked] = useState(false)

  useEffect(() => {
    if (article && user) {
      checkUserLikeStatus()
    }
  }, [article, user])

  useEffect(() => {
    if (article) {
      recordView()
    }
  }, [article])

  const checkUserLikeStatus = async () => {
    if (!user || !article) return
    
    try {
      const liked = await checkUserLike(article.id, user.id)
      setUserLiked(liked)
    } catch (error) {
      console.error('خطأ في التحقق من حالة الإعجاب:', error)
    }
  }

  const recordView = async () => {
    if (!article) return
    
    try {
      await recordArticleView(
        article.id,
        user?.id || null,
        typeof window !== 'undefined' ? window.location.hostname : null,
        typeof navigator !== 'undefined' ? navigator.userAgent : null
      )
    } catch (error) {
      console.error('خطأ في تسجيل المشاهدة:', error)
    }
  }

  const handleLike = async () => {
    if (!user) {
      toast.error('يرجى تسجيل الدخول للإعجاب بالمقال')
      return
    }

    try {
      const optimisticLiked = !userLiked
      setUserLiked(optimisticLiked)
      setArticle(prev => prev ? ({ ...prev, likes: (prev.likes || 0) + (optimisticLiked ? 1 : -1) }) : prev)

      const ok = optimisticLiked
        ? await likeArticle(article.id, user.id)
        : await unlikeArticle(article.id, user.id)

      if (!ok) {
        // تراجع في حال الفشل
        setUserLiked(!optimisticLiked)
        setArticle(prev => prev ? ({ ...prev, likes: (prev.likes || 0) + (optimisticLiked ? -1 : 1) }) : prev)
        toast.error('تعذر تحديث الإعجاب')
      } else {
        toast.success(optimisticLiked ? 'تم الإعجاب!' : 'تم إلغاء الإعجاب')
      }
    } catch (error) {
      // تراجع عام
      setUserLiked(prev => !prev)
      setArticle(prev => prev ? ({ ...prev, likes: (prev.likes || 0) + (userLiked ? 1 : -1) }) : prev)
      toast.error('حدث خطأ أثناء تحديث الإعجاب')
    }
  }

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: article.title,
          text: article.excerpt,
          url: window.location.href
        })
      } else {
        // نسخ الرابط إلى الحافظة
        await navigator.clipboard.writeText(window.location.href)
        toast.success('تم نسخ رابط المقال')
      }
    } catch (error) {
      toast.error('حدث خطأ أثناء مشاركة المقال')
    }
  }



  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </Layout>
    )
  }

  if (!article) {
    return (
      <Layout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">المقال غير موجود</h2>
          <Link href="/articles" className="btn-primary">
            العودة للمقالات
          </Link>
        </div>
      </Layout>
    );
  }

  return (
      <Layout>
        <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            العودة
          </button>
          
          {user && user.role === 'admin' && (
            <Link
              href="/admin/articles"
              className="btn-secondary flex items-center"
            >
              <Edit className="h-4 w-4 mr-2" />
              إدارة المقالات
            </Link>
          )}
        </div>

        {/* Article */}
        <article className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Article Image */}
          <img
            src={article.image || '/api/placeholder/800/400'}
            alt={article.title}
            className="w-full h-64 md:h-96 object-cover"
            onError={(e) => {
              e.target.src = '/api/placeholder/800/400'
            }}
          />
          
          {/* Article Content */}
          <div className="p-8">
            {/* Article Meta */}
            <div className="flex flex-wrap items-center gap-4 mb-6 text-sm text-gray-600">
              <div className="flex items-center">
                <img
                  src={article.author.avatar || '/api/placeholder/50/50'}
                  alt={article.author.name}
                  className="w-10 h-10 rounded-full mr-3"
                  onError={(e) => {
                    e.target.src = '/api/placeholder/50/50'
                  }}
                />
                <div>
                  <div className="font-medium text-gray-900">{article.author.name}</div>
                  <div className="text-xs">{article.author.bio}</div>
                </div>
              </div>
              
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-1" />
                <span>{formatDate(article.publishedAt)}</span>
              </div>
              
              <div className="flex items-center">
                <Eye className="h-4 w-4 mr-1" />
                <span>{article.views.toLocaleString()} مشاهدة</span>
              </div>
              
              <div className="bg-primary-100 text-primary-800 px-2 py-1 rounded-full text-xs">
                {article.readTime} دقائق قراءة
              </div>
            </div>
            
            {/* Article Title */}
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 leading-tight">
              {article.title}
            </h1>
            
            {/* Article Tags */}
            <div className="flex flex-wrap gap-2 mb-6">
              {article.tags.map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center bg-gray-100 text-gray-800 text-sm px-3 py-1 rounded-full"
                >
                  <Tag className="h-3 w-3 mr-1" />
                  {tag}
                </span>
              ))}
            </div>
            
            {/* Article Content */}
            <div 
              className="prose prose-lg max-w-none mb-8"
              dangerouslySetInnerHTML={{ __html: article.content }}
            />
            
            {/* Affiliate Links */}
            {article.affiliate_links && article.affiliate_links.length > 0 && (
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 mb-8 border border-blue-200">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.102m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                  روابط مفيدة
                </h3>
                <div className="grid gap-3">
                  {article.affiliate_links.map((link, index) => (
                    <a
                      key={index}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between bg-white rounded-lg p-4 border border-blue-200 hover:border-blue-400 hover:shadow-md transition-all duration-200 group"
                    >
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3 group-hover:bg-blue-200 transition-colors">
                          <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                            {link.title}
                          </h4>
                          <p className="text-sm text-gray-500 truncate max-w-xs">
                            {link.url}
                          </p>
                        </div>
                      </div>
                      <svg className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </a>
                  ))}
                </div>
              </div>
            )}
            
            {/* Article Actions */}
            <div className="flex items-center justify-between pt-6 border-t border-gray-200">
              <div className="flex items-center space-x-4 space-x-reverse">
                <button
                  onClick={handleLike}
                  className={`flex items-center space-x-2 space-x-reverse px-4 py-2 rounded-lg transition-colors ${
                    userLiked
                      ? 'bg-red-100 text-red-600'
                      : 'bg-gray-100 text-gray-600 hover:bg-red-50 hover:text-red-600'
                  }`}
                >
                  <Heart className={`h-5 w-5 ${userLiked ? 'fill-current' : ''}`} />
                  <span>{article.likes}</span>
                </button>
                
                <div className="flex items-center space-x-2 space-x-reverse text-gray-600">
                  <MessageCircle className="h-5 w-5" />
                  <span>{article.comments} تعليق</span>
                </div>
              </div>
              
              <button
                onClick={handleShare}
                className="flex items-center space-x-2 space-x-reverse px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <Share2 className="h-5 w-5" />
                <span>مشاركة</span>
              </button>
            </div>
          </div>
        </article>

        {/* Comments Section */}
        <CommentsSection articleId={article.id} />

        {/* Related Articles */}
        {relatedArticles.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">مقالات ذات صلة</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {relatedArticles.map(relatedArticle => (
                <Link
                  key={relatedArticle.id}
                  href={`/articles/${relatedArticle.id}`}
                  className="group block"
                  legacyBehavior>
                  <div>
                    <img
                      src={relatedArticle.image}
                      alt={relatedArticle.title}
                      className="w-full h-32 object-cover rounded-lg mb-3 group-hover:opacity-90 transition-opacity"
                    />
                    <h3 className="font-medium text-gray-900 group-hover:text-primary-600 transition-colors line-clamp-2">
                        {relatedArticle.title}
                      </h3>
                      <div className="flex items-center text-sm text-gray-500 mt-2">
                        <Eye className="h-4 w-4 mr-1" />
                        <span>{relatedArticle.views.toLocaleString()}</span>
                        <span className="mx-2">•</span>
                        <span>{formatDate(relatedArticle.publishedAt)}</span>
                      </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
        </div>
      </Layout>
  );
}

export async function getServerSideProps({ params }) {
  const id = params.id

  const data = await getArticleById(id)
  if (!data) {
    return { notFound: true }
  }

  const [topComments, related] = await Promise.all([
    getArticleComments(id),
    getRelatedArticles(id, data.category_id, 3)
  ])

  const initialArticle = {
    id: data.id,
    title: data.title,
    content: data.content || '',
    excerpt: data.excerpt || '',
    image: data.featured_image || null,
    author: {
      id: data.author_id,
      name: data.profiles?.full_name || data.profiles?.username || 'مستخدم',
      avatar: data.profiles?.avatar_url || '/api/placeholder/50/50',
      bio: ''
    },
    publishedAt: data.published_at,
    updatedAt: data.updated_at,
    views: data.view_count || 0,
    likes: data.like_count || 0,
    comments: (topComments?.length) || 0,
    tags: Array.isArray(data.tags) ? data.tags : [],
    featured: !!data.is_featured,
    readTime: data.reading_time || 0,
    liked: false,
    affiliate_links: Array.isArray(data.affiliate_links) ? data.affiliate_links : []
  }

  const initialRelatedArticles = (related || []).map(r => ({
    id: r.id,
    title: r.title,
    image: r.featured_image || '/api/placeholder/300/200',
    publishedAt: r.published_at,
    views: r.view_count || 0
  }))

  return {
    props: {
      initialArticle,
      initialRelatedArticles
    }
  }
}

export default ArticlePage