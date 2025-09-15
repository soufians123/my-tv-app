import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from '../../contexts/AuthContext'
import Layout from '../../components/Layout'
import EnhancedVideoPlayer from '../../components/EnhancedVideoPlayer'
import { useToast } from '../../components/ToastSystem'
import { loadChannels, loadChannelCategories } from '../../lib/supabaseChannelsService'
import { listenToChannelEvents } from '../../lib/channelEvents'

const ChannelsPage = () => {
  const { user } = useAuth()
  const toast = useToast()
  const [channels, setChannels] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedChannel, setSelectedChannel] = useState(null)



  // سيتم تحميل القنوات من الخدمة المشتركة

  // استخراج الفئات من الخدمة
  const [categories, setCategories] = useState([])

  // تحميل البيانات من خدمة Supabase
  const loadChannelsData = async () => {
    setLoading(true)
    try {
      console.log('بدء تحميل القنوات...')
      const channelsData = await loadChannels()
      console.log('تم تحميل القنوات:', channelsData)
      setChannels(channelsData)
      // تحميل فئات القنوات
      const categoriesData = await loadChannelCategories()
      console.log('تم تحميل الفئات:', categoriesData)
      console.log('عدد الفئات المحملة:', categoriesData.length)
      setCategories(categoriesData)
      console.log('تم تعيين الفئات في الحالة')
    } catch (error) {
      console.error('خطأ في تحميل القنوات:', error)
      toast.error('حدث خطأ في تحميل القنوات')
      setChannels([])
      setCategories([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadChannelsData()
    
    // الاستماع لأحداث تحديث القنوات
    const unsubscribe = listenToChannelEvents((event) => {
      console.log('تم استلام حدث تحديث القناة:', event)
      
      switch (event.type) {
        case CHANNEL_EVENTS.ADDED:
          toast.success(`تم إضافة قناة جديدة: ${event.data.name}`)
          loadChannelsData() // إعادة تحميل القنوات
          break
        case CHANNEL_EVENTS.UPDATED:
          toast.success(`تم تحديث القناة: ${event.data.name}`)
          loadChannelsData()
          break
        case CHANNEL_EVENTS.STATUS_CHANGED:
          const statusText = event.data.status === 'active' ? 'تفعيل' : 'إلغاء تفعيل'
          toast.success(`تم ${statusText} القناة: ${event.data.name}`)
          loadChannelsData()
          break
        case CHANNEL_EVENTS.DELETED:
          toast.success(`تم حذف القناة: ${event.data.name}`)
          loadChannelsData()
          break
        default:
          loadChannelsData() // إعادة تحميل عامة
      }
    })
    
    // تنظيف المستمع عند إلغاء تحميل المكون
    return () => {
      if (unsubscribe) unsubscribe()
    }
  }, [])

  const handleChannelSelect = (channel) => {
    setSelectedChannel(channel)
  }

  // التحقق من تسجيل الدخول المؤقت للمدير
  const tempAdminAuth = typeof window !== 'undefined' ? localStorage.getItem('tempAdminAuth') : null
  const isAuthenticated = user || tempAdminAuth

  if (!isAuthenticated) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
          <div className="modern-card p-12 text-center max-w-md mx-auto">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h2 className="heading-secondary mb-4 gradient-text">يرجى تسجيل الدخول</h2>
            <p className="text-muted mb-8 leading-relaxed">يجب تسجيل الدخول للوصول إلى مكتبة القنوات التلفزيونية المتنوعة</p>
            <Link href="/auth/login" className="modern-button bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-3 text-lg">
              تسجيل الدخول
            </Link>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
        <div className="responsive-padding py-8 space-y-8">
          {/* Modern Header */}
          <div className="modern-card p-8 text-center">
            <div className="mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-4 animate-pulse">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </div>
              <h1 className="heading-secondary gradient-text dark:text-gray-200 mb-4">مشغل القنوات التلفزيونية</h1>
              <p className="text-xl text-muted dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
                استمتع بمشاهدة قنواتك المفضلة مع تجربة مشاهدة محسنة وجودة عالية
              </p>
            </div>
            {channels.length > 0 && (
              <div className="glass-morphism inline-flex items-center gap-3 px-6 py-3 rounded-2xl">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <span className="font-semibold text-gray-700 dark:text-gray-200">{channels.length} قناة متاحة</span>
              </div>
            )}
          </div>

          {/* Enhanced Video Player with Channels List */}
          {loading ? (
            <div className="modern-card p-20">
              <div className="text-center">
                <div className="relative mx-auto mb-8">
                  <div className="w-20 h-20 border-4 border-blue-200 rounded-full animate-spin mx-auto"></div>
                  <div className="w-20 h-20 border-4 border-blue-600 border-t-transparent rounded-full animate-spin absolute top-0 left-1/2 transform -translate-x-1/2"></div>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">جاري تحميل القنوات</h3>
                <p className="text-muted">يرجى الانتظار بينما نقوم بتحضير أفضل القنوات لك...</p>
              </div>
            </div>
          ) : (
            <div className="modern-card p-6">
              <EnhancedVideoPlayer
                channels={channels}
                categories={categories}
                selectedChannel={selectedChannel}
                onChannelSelect={handleChannelSelect}
                className="w-full"
              />
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}

export default ChannelsPage