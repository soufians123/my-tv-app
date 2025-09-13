import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/router'
import Layout from '../../components/Layout'
import { useAuth } from '../../contexts/AuthContext'
import { ArrowLeft, Play, Pause, Volume2, VolumeX, Maximize, Users, Heart, Share2 } from 'lucide-react'
import Hls from 'hls.js'
import { useToast } from '../../components/ToastSystem'
import { useFavorites } from '../../components/FavoritesSystem'
import { getChannelById } from '../../lib/supabaseChannelsService'
import LazyImage from '../../components/LazyImage'

export default function ChannelPlayer() {
  const router = useRouter()
  const { id } = router.query
  const { user } = useAuth()
  const toast = useToast()
  const { addFavorite, removeFavorite, isFavorite: checkIsFavorite } = useFavorites()
  const videoRef = useRef(null)
  const hlsRef = useRef(null)
  
  const [loading, setLoading] = useState(true)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [volume, setVolume] = useState(1)
  const [isFavorite, setIsFavorite] = useState(false)
  const [viewerCount, setViewerCount] = useState(0)
  const [showControls, setShowControls] = useState(true)
  const [error, setError] = useState(null)
  const [hlsSupported, setHlsSupported] = useState(false)
  const [connectionQuality, setConnectionQuality] = useState('good')
  const [bufferHealth, setBufferHealth] = useState(0)
  const [retryCount, setRetryCount] = useState(0)

  // بيانات القنوات مع روابط M3U8 حقيقية وفعالة
  const sampleChannels = [
    {
      id: 1,
      name: 'الجزيرة',
      category: 'news',
      logo: 'https://i.imgur.com/BB93NQP.png',
      stream_url: 'https://live-hls-web-aja.getaj.net/AJA/index.m3u8',
      backup_urls: [
        'https://live-hls-web-aje.getaj.net/AJE/01.m3u8',
        'https://live-hls-web-aje.getaj.net/AJE/02.m3u8'
      ],
      description: 'قناة إخبارية عربية رائدة تقدم تغطية شاملة للأحداث المحلية والعالمية',
      country: 'قطر',
      viewers: 125000,
      rating: 4.8
    },
    {
      id: 2,
      name: 'العربية',
      category: 'news',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Al-Arabiya_new_logo.svg/640px-Al-Arabiya_new_logo.svg.png',
      stream_url: 'https://live.alarabiya.net/alarabiapublish/alarabiya.smil/playlist.m3u8',
      backup_urls: [
        'https://alarabiya-live.ercdn.net/alarabiya/alarabiya.m3u8',
        'https://alarabiya-live.ercdn.net/alarabiya/alarabiya_720p.m3u8'
      ],
      description: 'قناة إخبارية عربية تقدم آخر الأخبار والتحليلات السياسية والاقتصادية',
      country: 'الإمارات',
      viewers: 98000,
      rating: 4.6
    },
    {
      id: 3,
      name: 'فرانس 24 عربي',
      category: 'news',
      logo: 'https://i.imgur.com/61MSiq9.png',
      stream_url: 'https://static.france24.com/live/F24_AR_HI_HLS/live_web.m3u8',
      backup_urls: [
        'https://static.france24.com/live/F24_AR_LO_HLS/live_web.m3u8',
        'https://f24hls-i.akamaihd.net/hls/live/221147/F24_AR_HI_HLS/master.m3u8'
      ],
      description: 'قناة إخبارية فرنسية باللغة العربية تقدم تغطية شاملة للأحداث العالمية',
      country: 'فرنسا',
      viewers: 45000,
      rating: 4.3
    }
  ]

  const [channel, setChannel] = useState(null)

  useEffect(() => {
    if (id) {
      loadChannel()
    }
  }, [id])

  const loadChannel = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // تحميل القناة من الخدمة
      const foundChannel = await getChannelById(parseInt(id))
      
      if (!foundChannel) {
        setError('القناة غير موجودة')
        return
      }
      
      setChannel(foundChannel)
      setViewerCount(foundChannel.viewers + Math.floor(Math.random() * 1000))
      
      // تحميل حالة المفضلة
      if (user) {
        setIsFavorite(checkIsFavorite(foundChannel.id))
      }
      
      // إعداد مشغل HLS
      if (foundChannel.stream_url || foundChannel.url) {
        setupHlsPlayer(foundChannel.stream_url || foundChannel.url)
      }
      
    } catch (error) {
      console.error('Error loading channel:', error)
      setError('فشل في تحميل القناة')
    } finally {
      setLoading(false)
    }
  }

  const setupHlsPlayer = (streamUrl, isBackupUrl = false) => {
    if (!videoRef.current) return

    // تنظيف المشغل السابق
    if (hlsRef.current) {
      hlsRef.current.destroy()
      hlsRef.current = null
    }

    setIsPlaying(false)

    if (isBackupUrl) {
      toast.info('جاري تجربة رابط احتياطي...')
    }

    // التحقق من نوع الرابط وإعداد المشغل المناسب
    if (streamUrl.includes('youtube.com')) {
      handleYouTubeStream(streamUrl)
      return
    }

    // التحقق من دعم HLS
    if (Hls.isSupported()) {
      setHlsSupported(true)
      const hls = new Hls({
        maxBufferLength: 30,
        maxMaxBufferLength: 600,
        startLevel: -1,
        capLevelToPlayerSize: true,
        debug: false
      })
      
      hlsRef.current = hls
      
      hls.loadSource(streamUrl)
      hls.attachMedia(videoRef.current)
      
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        console.log('HLS manifest parsed successfully')
        setConnectionQuality('good')
      })
      
      hls.on(Hls.Events.LEVEL_LOADED, (event, data) => {
        console.log('Level loaded:', data.level)
        setConnectionQuality('good')
      })

      // مراقبة جودة البث
      hls.on(Hls.Events.BUFFER_APPENDED, () => {
        if (videoRef.current) {
          const buffered = videoRef.current.buffered
          if (buffered.length > 0) {
            const bufferEnd = buffered.end(buffered.length - 1)
            const currentTime = videoRef.current.currentTime
            setBufferHealth(Math.max(0, bufferEnd - currentTime))
          }
        }
      })

      hls.on(Hls.Events.BUFFER_STALLED, () => {
        setConnectionQuality('poor')
        console.log('Buffer stalled - poor connection')
      })

      hls.on(Hls.Events.BUFFER_FLUSHED, () => {
        setConnectionQuality('fair')
      })
      
      hls.on(Hls.Events.ERROR, (event, data) => {
        console.error('HLS error:', data)
        
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              console.log('Network error, trying to recover...')
              setTimeout(() => {
                if (hlsRef.current) {
                  hlsRef.current.startLoad()
                } else {
                  tryBackupUrls()
                }
              }, 1000)
              break
            case Hls.ErrorTypes.MEDIA_ERROR:
              console.log('Media error, trying to recover...')
              setTimeout(() => {
                if (hlsRef.current) {
                  hlsRef.current.recoverMediaError()
                } else {
                  tryBackupUrls()
                }
              }, 1000)
              break
            default:
              console.log('Fatal error, cannot recover')
              tryBackupUrls()
              break
          }
        }
      })
      
    } else if (videoRef.current.canPlayType('application/vnd.apple.mpegurl')) {
      // دعم HLS الأصلي في Safari
      setHlsSupported(true)
      videoRef.current.src = streamUrl
    } else {
      // استخدام الفيديو العادي كـ fallback
      tryDirectVideoFallback(streamUrl)
    }
  }

  const tryBackupUrls = () => {
    if (retryCount >= 3) {
      toast.error('تم استنفاد جميع المحاولات - يرجى تجربة قناة أخرى')
      setError('فشل في تشغيل البث بعد عدة محاولات')
      return
    }

    if (!channel || !channel.backup_urls || channel.backup_urls.length === 0) {
      // إعادة تعيين الروابط الاحتياطية للمحاولة مرة أخرى
      const originalChannel = sampleChannels.find(c => c.id === parseInt(id))
      if (originalChannel && originalChannel.backup_urls) {
        channel.backup_urls = [...originalChannel.backup_urls]
      } else {
        toast.error('خطأ في تشغيل البث - يرجى تجربة قناة أخرى')
        setError('فشل في تشغيل البث')
        return
      }
    }

    const backupUrl = channel.backup_urls[0]
    console.log('Trying backup URL:', backupUrl, 'Retry count:', retryCount + 1)
    
    setRetryCount(prev => prev + 1)
    setConnectionQuality('fair')
    
    // إزالة الرابط المستخدم من القائمة
    channel.backup_urls = channel.backup_urls.slice(1)
    
    setupHlsPlayer(backupUrl, true)
  }

  const tryDirectVideoFallback = (streamUrl) => {
    console.log('Trying direct video fallback')
    setHlsSupported(false)
    
    if (videoRef.current) {
      videoRef.current.src = streamUrl
      
      videoRef.current.addEventListener('loadstart', () => {
        console.log('Direct video loading started')
      })
      
      videoRef.current.addEventListener('error', (e) => {
        console.error('Direct video error:', e)
        tryBackupUrls()
      })
    }
  }

  const handleYouTubeStream = (youtubeUrl) => {
    console.log('YouTube stream detected:', youtubeUrl)
    toast.info('روابط يوتيوب تتطلب معالجة خاصة')
    setError('هذا النوع من الروابط غير مدعوم حالياً')
  }

  const togglePlay = () => {
    if (!videoRef.current) return
    
    if (isPlaying) {
      videoRef.current.pause()
    } else {
      videoRef.current.play().catch(error => {
        console.error('Play error:', error)
        toast.error('فشل في تشغيل الفيديو')
      })
    }
  }

  const toggleMute = () => {
    if (!videoRef.current) return
    
    videoRef.current.muted = !videoRef.current.muted
    setIsMuted(videoRef.current.muted)
  }

  const handleVolumeChange = (newVolume) => {
    if (!videoRef.current) return
    
    videoRef.current.volume = newVolume
    setVolume(newVolume)
    setIsMuted(newVolume === 0)
  }

  const toggleFavorite = () => {
    if (!user) {
      toast.error('يجب تسجيل الدخول لإضافة المفضلة')
      return
    }
    
    if (!channel) return
    
    if (isFavorite) {
      removeFavorite(channel.id)
      setIsFavorite(false)
      toast.success('تم إزالة القناة من المفضلة')
    } else {
      addFavorite({
        id: channel.id,
        name: channel.name_ar || channel.name,
        logo: channel.logo_url,
        category: channel.category
      })
      setIsFavorite(true)
      toast.success('تم إضافة القناة للمفضلة')
    }
  }

  const shareChannel = async () => {
    if (!channel) return
    
    const shareData = {
      title: channel.name_ar || channel.name,
      text: `شاهد ${channel.name_ar || channel.name} - ${channel.description}`,
      url: window.location.href
    }
    
    try {
      if (navigator.share) {
        await navigator.share(shareData)
      } else {
        await navigator.clipboard.writeText(window.location.href)
        toast.success('تم نسخ الرابط')
      }
    } catch (error) {
      console.error('Share error:', error)
      toast.error('فشل في المشاركة')
    }
  }

  const toggleFullscreen = () => {
    if (!videoRef.current) return
    
    if (document.fullscreenElement) {
      document.exitFullscreen()
    } else {
      videoRef.current.requestFullscreen().catch(error => {
        console.error('Fullscreen error:', error)
        toast.error('فشل في تفعيل الشاشة الكاملة')
      })
    }
  }

  if (loading) {
    return (
      <Layout>
        <div className="flex flex-col justify-center items-center py-12 space-y-4">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary-200 border-t-primary-600"></div>
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">جاري تحميل القناة...</h3>
            <p className="text-gray-600">يرجى الانتظار</p>
          </div>
        </div>
      </Layout>
    )
  }

  if (error || !channel) {
    return (
      <Layout>
        <div className="text-center py-12 max-w-md mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
            <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-red-100 rounded-full">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-red-900 mb-2">خطأ في تحميل القناة</h2>
            <p className="text-red-700 mb-4">{error || 'القناة غير موجودة أو غير متاحة حالياً'}</p>
          </div>
          <div className="space-y-3">
            <button
              onClick={() => {
                setError(null)
                setRetryCount(0)
                loadChannel()
              }}
              className="w-full bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              إعادة المحاولة
            </button>
            <button
              onClick={() => router.push('/channels')}
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors"
            >
              العودة للقنوات
            </button>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          العودة
        </button>

        {/* Video Player */}
        <div className="bg-black rounded-lg overflow-hidden relative group">
          <div 
            className="relative"
            onMouseMove={() => setShowControls(true)}
            onMouseLeave={() => setShowControls(false)}
          >
            {/* Video Element */}
            <video
              ref={videoRef}
              className="w-full aspect-video"
              poster={channel.logo_url}
              controls={false}
              playsInline
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              onError={(e) => {
                console.error('Video error:', e)
                setConnectionQuality('poor')
                if (retryCount < 3) {
                  toast.info('جاري إعادة المحاولة...')
                  setTimeout(() => {
                    tryBackupUrls()
                  }, 2000)
                } else {
                  setError('فشل في تحميل البث')
                  toast.error('فشل في تحميل البث')
                }
              }}
              onWaiting={() => {
                setConnectionQuality('fair')
                console.log('Video waiting for data')
              }}
              onCanPlayThrough={() => {
                setConnectionQuality('good')
                console.log('Video can play through')
              }}
              onLoadStart={() => {
                console.log('Video loading started')
              }}
              onCanPlay={() => {
                console.log('Video can play')
              }}
            >
              متصفحك لا يدعم تشغيل الفيديو
            </video>

            {/* Video Controls Overlay */}
            <div className={`absolute inset-0 bg-gradient-to-t from-black/50 to-transparent transition-opacity duration-300 ${
              showControls ? 'opacity-100' : 'opacity-0'
            }`}>
              {/* Top Controls */}
              <div className="absolute top-4 left-4 right-4 flex justify-between items-center">
                <div className="flex items-center space-x-2 space-x-reverse">
                  <div className="flex items-center bg-red-600 text-white px-2 py-1 rounded text-sm font-medium">
                    <div className="w-2 h-2 bg-white rounded-full mr-1 animate-pulse"></div>
                    مباشر
                  </div>
                  {hlsSupported && (
                    <div className="bg-green-600 text-white px-2 py-1 rounded text-sm font-medium">
                      HD
                    </div>
                  )}
                  {error && (
                    <div className="bg-red-500 text-white px-2 py-1 rounded text-sm font-medium">
                      خطأ
                    </div>
                  )}
                  {/* مؤشر جودة الاتصال */}
                  <div className={`px-2 py-1 rounded text-sm font-medium ${
                    connectionQuality === 'good' ? 'bg-green-600 text-white' :
                    connectionQuality === 'fair' ? 'bg-yellow-600 text-white' :
                    'bg-red-600 text-white'
                  }`}>
                    {connectionQuality === 'good' ? 'ممتاز' :
                     connectionQuality === 'fair' ? 'جيد' : 'ضعيف'}
                  </div>
                  {/* مؤشر صحة البافر */}
                  {bufferHealth > 0 && (
                    <div className="bg-blue-600 text-white px-2 py-1 rounded text-sm font-medium">
                      بافر: {bufferHealth.toFixed(1)}s
                    </div>
                  )}
                  {/* مؤشر عدد المحاولات */}
                  {retryCount > 0 && (
                    <div className="bg-orange-600 text-white px-2 py-1 rounded text-sm font-medium">
                      محاولة {retryCount}/3
                    </div>
                  )}
                  <div className="flex items-center text-white text-sm">
                    <Users className="h-4 w-4 mr-1" />
                    {viewerCount.toLocaleString()} مشاهد
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 space-x-reverse">
                  <button
                    onClick={shareChannel}
                    className="p-2 bg-black/30 text-white rounded-full hover:bg-black/50 transition-colors"
                  >
                    <Share2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={toggleFavorite}
                    className={`p-2 rounded-full transition-colors ${
                      isFavorite
                        ? 'bg-red-600 text-white'
                        : 'bg-black/30 text-white hover:bg-black/50'
                    }`}
                  >
                    <Heart className={`h-4 w-4 ${isFavorite ? 'fill-current' : ''}`} />
                  </button>
                </div>
              </div>

              {/* Center Play Button */}
              <div className="absolute inset-0 flex items-center justify-center">
                <button
                  onClick={togglePlay}
                  className="p-4 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
                >
                  {isPlaying ? (
                    <div className="w-6 h-6 flex items-center justify-center">
                      <div className="w-2 h-6 bg-white mr-1"></div>
                      <div className="w-2 h-6 bg-white"></div>
                    </div>
                  ) : (
                    <div className="w-0 h-0 border-l-6 border-l-white border-t-3 border-t-transparent border-b-3 border-b-transparent ml-1"></div>
                  )}
                </button>
              </div>

              {/* Bottom Controls */}
              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                <div className="flex items-center space-x-4 space-x-reverse">
                  <button
                    onClick={toggleMute}
                    className="p-2 bg-black/30 text-white rounded-full hover:bg-black/50 transition-colors"
                  >
                    {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                  </button>
                  
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={volume}
                    onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                    className="w-20 accent-white"
                  />
                </div>
                
                <button
                  onClick={toggleFullscreen}
                  className="p-2 bg-black/30 text-white rounded-full hover:bg-black/50 transition-colors"
                >
                  <Maximize className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Channel Info */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-start space-x-4 space-x-reverse">
            <LazyImage
              src={channel.logo_url}
              alt={channel.name_ar || channel.name}
              className="w-16 h-16 rounded-lg object-cover"
            />
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">{channel.name_ar || channel.name}</h1>
              <p className="text-gray-600 mb-4">{channel.description}</p>
              <div className="flex items-center space-x-6 space-x-reverse text-sm text-gray-500">
                <span>البلد: {channel.country}</span>
                <span>التقييم: {channel.rating}/5</span>
                <span>المشاهدون: {viewerCount.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}

export async function getStaticPaths() {
  // Generate paths for all channel IDs
  const paths = Array.from({ length: 10 }, (_, i) => ({
    params: { id: (i + 1).toString() }
  }))

  return {
    paths,
    fallback: 'blocking'
  }
}

export async function getStaticProps({ params }) {
  return {
    props: {
      channelId: params.id
    },
    revalidate: 60 // Revalidate every minute
  }
}