import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react'
import Hls from 'hls.js'
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  Settings,
  SkipBack,
  SkipForward,
  RotateCcw,
  Loader,
  Wifi,
  WifiOff,
  Heart,
  Globe,
  Tv,
  Radio,
  Music,
  Gamepad2,
  Baby,
  ChefHat,
  BookOpen,
  Star,
  ChevronUp,
  ChevronDown,
  Zap,
  Monitor
} from 'lucide-react'
import { useFavorites } from './FavoritesSystem'
import { useToast } from './ToastSystem'
import LazyImage from './LazyImage'

const EnhancedVideoPlayer = React.memo(({ 
  channels = [],
  categories = [],
  selectedChannel = null,
  onChannelSelect,
  className = ''
}) => {
  const videoRef = useRef(null)
  const progressRef = useRef(null)
  const toast = useToast()
  const { addToFavorites, removeFromFavorites, isFavorite } = useFavorites()
  
  // Video player states
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showControls, setShowControls] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [isBuffering, setIsBuffering] = useState(false)
  const [playbackRate, setPlaybackRate] = useState(1)
  const [quality, setQuality] = useState('auto')
  const [showSettings, setShowSettings] = useState(false)
  const [availableQualities, setAvailableQualities] = useState([])
  const [showAdvancedControls, setShowAdvancedControls] = useState(false)
  
  // ميزات VLC المتقدمة
  const [audioTracks, setAudioTracks] = useState([])
  const [selectedAudioTrack, setSelectedAudioTrack] = useState(0)
  const [subtitleTracks, setSubtitleTracks] = useState([])
  const [selectedSubtitleTrack, setSelectedSubtitleTrack] = useState(-1)
  const [isConnected, setIsConnected] = useState(true)
  const [error, setError] = useState(null)
  
  // Channel list states
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [manifestErrorCount, setManifestErrorCount] = useState(0)
  
  // تحسينات VLC-like للتحميل المسبق والتخزين المؤقت
  const [preloadedChannels, setPreloadedChannels] = useState(new Map())
  const [channelCache, setChannelCache] = useState(new Map())
  const preloadTimeoutRef = useRef(null)
  const retryTimeoutRef = useRef(null)

  // Memoized filtered channels for better performance
  const filteredChannels = useMemo(() => {
    let filtered = channels
    
    if (searchTerm) {
      filtered = filtered.filter(channel => 
        (channel.name && channel.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (channel.name_ar && channel.name_ar.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (channel.country && channel.country.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    }
    
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(channel => channel.category === selectedCategory)
    }
    
    return filtered
  }, [channels, searchTerm, selectedCategory])

  let controlsTimeout = useRef(null)
  
  // Performance optimized preloading with memory management (VLC-like)
  const preloadAdjacentChannels = useCallback(() => {
    if (!selectedChannel || !filteredChannels.length) return
    
    const currentIndex = filteredChannels.findIndex(ch => 
      (ch.id && ch.id === selectedChannel.id) || ch.name === selectedChannel.name
    )
    
    if (currentIndex === -1) return
    
    // Memory management: Limit cache size
    const MAX_CACHE_SIZE = 8
    if (channelCache.size >= MAX_CACHE_SIZE) {
      // Remove oldest entries
      const entries = Array.from(channelCache.entries())
      const oldestEntries = entries
        .sort(([,a], [,b]) => a.timestamp - b.timestamp)
        .slice(0, channelCache.size - MAX_CACHE_SIZE + 2)
      
      oldestEntries.forEach(([key, cachedData]) => {
        if (cachedData.hlsInstance && !cachedData.hlsInstance.destroyed) {
          try {
            cachedData.hlsInstance.destroy()
          } catch (e) {
            console.warn(`Error destroying cached instance for ${key}:`, e)
          }
        }
        setChannelCache(prev => {
          const newCache = new Map(prev)
          newCache.delete(key)
          return newCache
        })
      })
    }
    
    // تحديد القنوات المجاورة للتحميل المسبق
    const adjacentIndices = [
      currentIndex - 1, // القناة السابقة
      currentIndex + 1  // القناة التالية
    ].filter(index => index >= 0 && index < filteredChannels.length)
    
    adjacentIndices.forEach((index, priority) => {
      const channel = filteredChannels[index]
      const streamUrl = channel.stream_url || channel.stream
      const cacheKey = `${channel.id || channel.name}_${streamUrl}`
      
      // تجنب التحميل المسبق إذا كانت القناة محملة مسبقاً
      if (channelCache.has(cacheKey) || !streamUrl || !streamUrl.includes('.m3u8')) {
        return
      }
      
      // Adaptive delay based on network conditions and priority
      const networkDelay = navigator.connection?.effectiveType === '4g' ? 1000 : 3000
      const priorityDelay = priority * 1000
      const adaptiveDelay = networkDelay + priorityDelay
      
      // تأخير التحميل المسبق لتجنب التحميل الزائد
      setTimeout(() => {
        // Double-check cache size before creating new instance
        if (channelCache.size >= MAX_CACHE_SIZE) return
        
        if (Hls.isSupported()) {
          const preloadHls = new Hls({
            enableWorker: true,
            lowLatencyMode: false, // تقليل الأولوية للتحميل المسبق
            maxBufferLength: 3, // تخزين مؤقت أقل للتحميل المسبق
            maxMaxBufferLength: 15,
            manifestLoadingTimeOut: 2000,
            fragLoadingTimeOut: 3000,
            autoStartLoad: false, // عدم البدء التلقائي
            maxLoadingDelay: 1000
          })
          
          preloadHls.loadSource(streamUrl)
          
          preloadHls.on(Hls.Events.MANIFEST_PARSED, () => {
            console.log('تم التحميل المسبق للقناة:', channel.name)
            setChannelCache(prev => {
              const newCache = new Map(prev)
              newCache.set(cacheKey, {
                hlsInstance: preloadHls,
                timestamp: Date.now(),
                channel: channel,
                preloaded: true,
                priority: priority
              })
              return newCache
            })
          })
          
          preloadHls.on(Hls.Events.ERROR, (event, data) => {
            if (data.fatal) {
              console.warn('فشل التحميل المسبق للقناة:', channel.name)
              try {
                preloadHls.destroy()
              } catch (e) {
                console.warn('Error destroying preload HLS:', e)
              }
            }
          })
        }
      }, adaptiveDelay)
    })
  }, [selectedChannel, filteredChannels, channelCache])

  // Get channel icon based on category
  const getChannelIcon = (category, size = 'w-8 h-8') => {
    const iconProps = { className: `${size} text-white` }
    
    switch (category) {
      case 'أخبار':
      case 'news':
        return <Globe {...iconProps} />
      case 'ترفيه':
      case 'entertainment':
        return <Tv {...iconProps} />
      case 'رياضة':
      case 'sports':
        return <Gamepad2 {...iconProps} />
      case 'موسيقى':
      case 'music':
        return <Music {...iconProps} />
      case 'أطفال':
      case 'kids':
        return <Baby {...iconProps} />
      case 'طبخ':
      case 'cooking':
        return <ChefHat {...iconProps} />
      case 'وثائقي':
      case 'documentary':
        return <BookOpen {...iconProps} />
      default:
        return <Radio {...iconProps} />
    }
  }

  // Get category color
  const getCategoryColor = (category) => {
    switch (category) {
      case 'أخبار': return 'bg-red-500'
      case 'رياضة': return 'bg-green-500'
      case 'ترفيه': return 'bg-purple-500'
      case 'أطفال': return 'bg-pink-500'
      case 'وثائقي': return 'bg-blue-500'
      case 'موسيقى': return 'bg-orange-500'
      case 'طبخ': return 'bg-yellow-500'
      default: return 'bg-gray-500'
    }
  }

  // Memoized functions for better performance
  const handleChannelSelect = useCallback((channel) => {
    if (onChannelSelect) {
      onChannelSelect(channel)
    }
  }, [onChannelSelect, toast])

  const togglePlayPause = useCallback(() => {
    const video = videoRef.current
    if (!video) return

    if (isPlaying) {
      video.pause()
    } else {
      video.play().catch(error => {
        console.log('Play failed:', error)
      })
    }
  }, [isPlaying])

  const toggleMute = useCallback(() => {
    const video = videoRef.current
    if (!video) return

    if (isMuted) {
      video.muted = false
      setIsMuted(false)
    } else {
      video.muted = true
      setIsMuted(true)
    }
  }, [isMuted])

  // Video player event handlers
  useEffect(() => {
    const video = videoRef.current
    if (!video || !selectedChannel) return

    const handleLoadedMetadata = () => {
      setDuration(video.duration)
      setIsLoading(false)
    }

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime)
    }

    const handlePlay = () => setIsPlaying(true)
    const handlePause = () => setIsPlaying(false)
    const handleWaiting = () => setIsBuffering(true)
    const handleCanPlay = () => setIsBuffering(false)
    
    const handleError = (e) => {
      setIsLoading(false)
    }

    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }

    const handleKeyPress = (e) => {
      if (!selectedChannel) return
      
      switch(e.key) {
        case ' ':
        case 'k':
          e.preventDefault()
          togglePlay()
          break
        case 'm':
        case 'M':
          e.preventDefault()
          toggleMute()
          break
        case 'f':
        case 'F':
          e.preventDefault()
          toggleFullscreen()
          break
        case 'ArrowUp':
          e.preventDefault()
          navigateChannel('up')
          break
        case 'ArrowDown':
          e.preventDefault()
          navigateChannel('down')
          break
        case 'ArrowLeft':
          e.preventDefault()
          skipTime(-10)
          break
        case 'ArrowRight':
          e.preventDefault()
          skipTime(10)
          break
        case '+':
        case '=':
          e.preventDefault()
          const currentRateIndex = playbackRates.indexOf(playbackRate)
          if (currentRateIndex < playbackRates.length - 1) {
            changePlaybackRate(playbackRates[currentRateIndex + 1])
          }
          break
        case '-':
          e.preventDefault()
          const currentRateIndexDown = playbackRates.indexOf(playbackRate)
          if (currentRateIndexDown > 0) {
            changePlaybackRate(playbackRates[currentRateIndexDown - 1])
          }
          break
        case '1':
          e.preventDefault()
          changePlaybackRate(1)
          break
        case '0':
          e.preventDefault()
          changeVolume(isMuted ? 0.5 : 0)
          break
        default:
          break
      }
    }

    video.addEventListener('loadedmetadata', handleLoadedMetadata)
    video.addEventListener('timeupdate', handleTimeUpdate)
    video.addEventListener('play', handlePlay)
    video.addEventListener('pause', handlePause)
    video.addEventListener('waiting', handleWaiting)
    video.addEventListener('canplay', handleCanPlay)
    video.addEventListener('error', handleError)
    document.addEventListener('fullscreenchange', handleFullscreenChange)
    document.addEventListener('keydown', handleKeyPress)

    return () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata)
      video.removeEventListener('timeupdate', handleTimeUpdate)
      video.removeEventListener('play', handlePlay)
      video.removeEventListener('pause', handlePause)
      video.removeEventListener('waiting', handleWaiting)
      video.removeEventListener('canplay', handleCanPlay)
      video.removeEventListener('error', handleError)
      document.removeEventListener('fullscreenchange', handleFullscreenChange)
      document.removeEventListener('keydown', handleKeyPress)
    }
  }, [selectedChannel, toast])

  // Auto-hide controls
  useEffect(() => {
    if (showControls) {
      clearTimeout(controlsTimeout.current)
      controlsTimeout.current = setTimeout(() => {
        if (isPlaying) {
          setShowControls(false)
        }
      }, 3000)
    }
    return () => clearTimeout(controlsTimeout.current)
  }, [showControls, isPlaying])

  // Load new channel with HLS support
  useEffect(() => {
    if (selectedChannel && videoRef.current) {
      setIsLoading(true)
      setError(null)
      
      const video = videoRef.current
      const streamUrl = selectedChannel.stream_url || selectedChannel.stream
      
      // Clean up previous HLS instance
      if (window.hlsInstance) {
        try {
          window.hlsInstance.stopLoad()
          window.hlsInstance.detachMedia()
          window.hlsInstance.destroy()
        } catch (error) {
          console.warn('Error cleaning up HLS instance:', error)
        } finally {
          window.hlsInstance = null
        }
      }
      
      // التحقق من وجود القناة في التخزين المؤقت
      const cacheKey = `${selectedChannel.id || selectedChannel.name}_${streamUrl}`
      if (channelCache.has(cacheKey)) {
        console.log('استخدام القناة من التخزين المؤقت:', selectedChannel.name)
        const cachedData = channelCache.get(cacheKey)
        if (cachedData.hlsInstance && !cachedData.hlsInstance.destroyed) {
          window.hlsInstance = cachedData.hlsInstance
          window.hlsInstance.attachMedia(video)
          setIsLoading(false)
          return
        }
      }
      
      // Reset video source
      video.src = ''
      video.load()
      
      // Check if the stream is HLS (M3U8)
      if (streamUrl && streamUrl.includes('.m3u8')) {
        if (Hls.isSupported()) {
          const hls = new Hls({
            // تحسينات VLC-like للأداء السريع
            enableWorker: true, // تفعيل Web Workers للأداء الأفضل
            lowLatencyMode: true,
            backBufferLength: 30, // تقليل التخزين الخلفي لسرعة أكبر
            maxLoadingDelay: 2, // تقليل تأخير التحميل
            maxBufferLength: 15, // تقليل حجم التخزين المؤقت للاستجابة السريعة
            maxMaxBufferLength: 120, // حد أقصى أقل للذاكرة
            manifestLoadingTimeOut: 5000, // تقليل timeout للاستجابة السريعة
            manifestLoadingMaxRetry: 2,
            manifestLoadingRetryDelay: 500,
            levelLoadingTimeOut: 5000,
            levelLoadingMaxRetry: 3,
            fragLoadingTimeOut: 8000, // تقليل timeout للأجزاء
            fragLoadingMaxRetry: 4,
            // تحسينات إضافية للسرعة
            startLevel: -1, // البدء بأفضل جودة متاحة
            capLevelToPlayerSize: true, // تحسين الجودة حسب حجم المشغل
            maxBufferHole: 0.5, // تقليل الثقوب في التخزين المؤقت
            maxSeekHole: 2,
            seekHoleNudgeDuration: 0.1,
            stalledInBufferedNudgeSize: 0.1,
            maxFragLookUpTolerance: 0.25,
            liveSyncDurationCount: 3, // تحسين البث المباشر
            liveMaxLatencyDurationCount: 10,
            liveDurationInfinity: true,
            // تحسين الشبكة
            progressive: true,
            xhrSetup: function(xhr, url) {
              xhr.withCredentials = false
              xhr.timeout = 8000 // timeout أقل للاستجابة السريعة
              xhr.setRequestHeader('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36')
              xhr.setRequestHeader('Cache-Control', 'no-cache')
            }
          })
          
          // تحقق من صحة الرابط قبل التحميل
          const isValidUrl = (url) => {
            try {
              new URL(url)
              return true
            } catch {
              return false
            }
          }
          
          if (!isValidUrl(streamUrl)) {
            setError('رابط القناة غير صحيح')
            setIsLoading(false)
            return
          }
          
          hls.loadSource(streamUrl)
          hls.attachMedia(video)
          
          hls.on(Hls.Events.MANIFEST_PARSED, () => {
            console.log('HLS manifest loaded for:', selectedChannel.name)
            setError(null)
            retryCount = 0 // إعادة تعيين عداد المحاولات عند النجاح
            setManifestErrorCount(0) // إعادة تعيين عداد أخطاء manifest عند النجاح
            
            // استخراج الجودات المتاحة (VLC-like)
            const levels = hls.levels
            if (levels && levels.length > 0) {
              const qualities = levels.map((level, index) => ({
                index,
                height: level.height,
                width: level.width,
                bitrate: level.bitrate,
                label: level.height ? `${level.height}p` : `${Math.round(level.bitrate / 1000)}k`
              }))
              qualities.unshift({ index: -1, label: 'تلقائي', height: 'auto' })
              setAvailableQualities(qualities)
              console.log('الجودات المتاحة:', qualities)
            }
            
            // استخراج المسارات الصوتية
            const audioTracks = hls.audioTracks
            if (audioTracks && audioTracks.length > 0) {
              setAudioTracks(audioTracks.map((track, index) => ({
                index,
                name: track.name || `مسار صوتي ${index + 1}`,
                language: track.lang || 'غير محدد'
              })))
            }
            
            // حفظ القناة في التخزين المؤقت
            const cacheKey = `${selectedChannel.id || selectedChannel.name}_${streamUrl}`
            setChannelCache(prev => {
              const newCache = new Map(prev)
              newCache.set(cacheKey, {
                hlsInstance: hls,
                timestamp: Date.now(),
                channel: selectedChannel
              })
              // الاحتفاظ بآخر 5 قنوات فقط لتوفير الذاكرة
              if (newCache.size > 5) {
                const oldestKey = Array.from(newCache.keys())[0]
                const oldData = newCache.get(oldestKey)
                if (oldData.hlsInstance && !oldData.hlsInstance.destroyed) {
                  try {
                    oldData.hlsInstance.destroy()
                  } catch (e) {
                    console.warn('Error destroying old HLS instance:', e)
                  }
                }
                newCache.delete(oldestKey)
              }
              return newCache
            })
            
            // Performance optimized preloading with priority delay
            setTimeout(() => {
              preloadAdjacentChannels()
            }, 1500) // Delay to prioritize main channel loading
          })
          
          // معالجة انقطاع الاتصال وإعادة الاتصال
          let fragErrorCount = 0
          const maxFragErrors = 5
          const maxManifestErrors = 3
          
          hls.on(Hls.Events.FRAG_LOAD_ERROR, (event, data) => {
            fragErrorCount++
            console.warn(`Fragment load error ${fragErrorCount}/${maxFragErrors}:`, data)
            
            if (fragErrorCount < maxFragErrors) {
              // محاولة إعادة تحميل الجزء مع تأخير متزايد
              const delay = Math.min(1000 * fragErrorCount, 5000)
              setTimeout(() => {
                if (window.hlsInstance && !window.hlsInstance.destroyed) {
                  try {
                    window.hlsInstance.startLoad()
                  } catch (error) {
                    console.warn('Error restarting HLS load:', error)
                  }
                }
              }, delay)
            } else {
              // إذا تجاوز عدد الأخطاء الحد الأقصى، أظهر رسالة للمستخدم
              console.error('Too many fragment errors, stopping playback')
              setError('مشكلة في جودة البث - جرب قناة أخرى')
              setIsLoading(false)
            }
          })
          
          // إعادة تعيين عداد أخطاء الأجزاء عند النجاح
          hls.on(Hls.Events.FRAG_LOADED, () => {
            if (fragErrorCount > 0) {
              fragErrorCount = Math.max(0, fragErrorCount - 1)
            }
          })
          
          // معالجة تحديث القائمة
           hls.on(Hls.Events.LEVEL_UPDATED, () => {
             if (error) {
               setError(null) // إزالة الخطأ عند تحديث القائمة بنجاح
             }
           })
           
           // معالجة انقطاع الاتصال المؤقت
           hls.on(Hls.Events.ERROR, (event, data) => {
             if (!data.fatal && data.type === Hls.ErrorTypes.NETWORK_ERROR) {
               console.warn('Non-fatal network error:', data)
               // محاولة إعادة الاتصال بعد فترة قصيرة
               setTimeout(() => {
                 if (window.hlsInstance && !window.hlsInstance.destroyed) {
                   try {
                     window.hlsInstance.startLoad()
                   } catch (error) {
                     console.warn('Error restarting after network issue:', error)
                   }
                 }
               }, 3000)
             }
           })
           
           // معالجة استئناف التشغيل بعد التوقف
           hls.on(Hls.Events.BUFFER_APPENDED, () => {
             if (error && error.includes('جودة البث')) {
               setError(null) // إزالة خطأ جودة البث عند استئناف التحميل
             }
           })
          
          let retryCount = 0
          const maxRetries = 3
          
          hls.on(Hls.Events.ERROR, (event, data) => {
            console.error('HLS Error:', data)
            
            // تسجيل تفصيلي للأخطاء الشائعة
            if (data.response && data.response.code) {
              console.error(`HTTP Error Code: ${data.response.code} for URL: ${data.url}`)
            }
            if (data.networkDetails) {
              console.error('Network Details:', data.networkDetails)
            }
            
            if (data.fatal) {
              switch (data.type) {
                case Hls.ErrorTypes.NETWORK_ERROR:
                  if (data.details === 'manifestLoadError') {
                    console.log('خطأ في تحميل manifest، محاولة إعادة التحميل مع تأخير...')
                    setError('خطأ في الاتصال بالخادم - جاري إعادة المحاولة...')
                    
                    // إعادة المحاولة مع تأخير متدرج
                    const retryDelay = Math.min(5000 * Math.pow(2, manifestErrorCount), 30000)
                    setTimeout(() => {
                      if (hls && !hls.destroyed && manifestErrorCount < maxManifestErrors) {
                        console.log(`محاولة إعادة تحميل manifest رقم ${manifestErrorCount + 1}/${maxManifestErrors}`)
                        hls.loadSource(streamUrl)
                        setManifestErrorCount(prev => prev + 1)
                      } else {
                        console.error('فشل نهائي في تحميل manifest بعد عدة محاولات')
                        setIsLoading(false)
                      }
                    }, retryDelay)
                  } else if (data.details === 'fragLoadError' || data.details === 'fragParsingError') {
                    // معالجة أخطاء تحميل أجزاء الفيديو
                    console.log(`خطأ في تحميل جزء من الفيديو: ${data.details}`)
                    
                    // التحقق من نوع الخطأ الشبكي
                    const isAbortedError = data.networkDetails && data.networkDetails.includes('ERR_ABORTED')
                    const isFailedError = data.networkDetails && data.networkDetails.includes('ERR_FAILED')
                    
                    if (isAbortedError) {
                      console.log('خطأ ERR_ABORTED - انقطاع في الاتصال، إعادة محاولة فورية')
                      if (retryCount < maxRetries * 2) { // مضاعفة المحاولات لأخطاء ABORTED
                        retryCount++
                        console.log(`إعادة محاولة ABORTED ${retryCount}/${maxRetries * 2}`)
                        setTimeout(() => {
                          if (hls && !hls.destroyed) {
                            hls.startLoad()
                          }
                        }, 1000) // تأخير قصير للأخطاء المؤقتة
                      } else {
                        setError('انقطاع متكرر في الاتصال - تحقق من الإنترنت')
                        setIsLoading(false)
                      }
                    } else if (isFailedError) {
                      console.log('خطأ ERR_FAILED - فشل في الخادم، إعادة محاولة مع تأخير')
                      if (retryCount < maxRetries) {
                        retryCount++
                        console.log(`إعادة محاولة FAILED ${retryCount}/${maxRetries}`)
                        setTimeout(() => {
                          if (hls && !hls.destroyed) {
                            hls.startLoad()
                          }
                        }, 3000 * retryCount) // تأخير أطول لأخطاء الخادم
                      } else {
                        setError('خادم القناة غير متاح حالياً')
                        setIsLoading(false)
                      }
                    } else if (retryCount < maxRetries) {
                      retryCount++
                      console.log(`إعادة محاولة تحميل الجزء ${retryCount}/${maxRetries}`)
                      setTimeout(() => {
                        if (hls && !hls.destroyed) {
                          hls.startLoad()
                        }
                      }, 2000 * retryCount)
                    } else {
                      setError('خطأ في تحميل أجزاء الفيديو')
                      setIsLoading(false)
                    }
                  } else if (retryCount < maxRetries) {
                    retryCount++
                    console.log(`إعادة محاولة شبكة ${retryCount}/${maxRetries} لقناة ${selectedChannel.name}`)
                    setTimeout(() => {
                      if (hls && !hls.destroyed) {
                        hls.startLoad()
                      }
                    }, 1000 * retryCount)
                  } else {
                    setError('خطأ في الشبكة - القناة غير متاحة حالياً')
                    setIsLoading(false)
                  }
                  break
                case Hls.ErrorTypes.MEDIA_ERROR:
                  if (retryCount < maxRetries) {
                    retryCount++
                    console.log(`إعادة محاولة استرداد الوسائط ${retryCount}/${maxRetries}`)
                    hls.recoverMediaError()
                  } else {
                    setError('خطأ في الوسائط - رابط القناة تالف')
                    setIsLoading(false)
                  }
                  break
                default:
                  setError('خطأ في تشغيل القناة - جرب قناة أخرى')
                  setIsLoading(false)
                  break
              }
            } else {
              // أخطاء غير قاتلة - معالجة محسنة
              console.warn('HLS Warning:', data)
              
              // معالجة خاصة لأخطاء الشبكة غير القاتلة
              if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
                if (data.details === 'fragLoadTimeOut') {
                  console.log('انتهت مهلة تحميل جزء من الفيديو - سيتم إعادة المحاولة تلقائياً')
                } else if (data.details === 'fragLoadError') {
                  // التحقق من نوع خطأ تحميل الجزء
                  const errorUrl = data.url || 'غير محدد'
                  if (errorUrl.includes('.ts')) {
                    console.log(`فشل تحميل جزء فيديو مؤقت: ${errorUrl}`)
                    
                    // معالجة خاصة لأخطاء ERR_ABORTED في الأجزاء
                    if (data.networkDetails && data.networkDetails.includes('ERR_ABORTED')) {
                      console.log('خطأ ERR_ABORTED مؤقت في جزء الفيديو - سيتم تجاهله')
                    } else if (data.networkDetails && data.networkDetails.includes('ERR_FAILED')) {
                      console.log('خطأ ERR_FAILED مؤقت في جزء الفيديو - سيتم إعادة المحاولة')
                    }
                  } else if (errorUrl.includes('.m3u8')) {
                    console.log(`فشل تحميل playlist فرعي: ${errorUrl}`)
                  }
                } else if (data.details === 'keyLoadError') {
                  console.log('فشل تحميل مفتاح التشفير - سيتم إعادة المحاولة')
                } else if (data.details === 'keyLoadTimeOut') {
                  console.log('انتهت مهلة تحميل مفتاح التشفير')
                }
              }
            }
          })
          
          // إعادة تعيين عدادات الأخطاء عند النجاح
          hls.on(Hls.Events.MANIFEST_LOADED, () => {
            console.log('تم تحميل manifest بنجاح - إعادة تعيين عداد الأخطاء')
            setManifestErrorCount(0)
            retryCount = 0
            setError(null)
          })
          
          hls.on(Hls.Events.LEVEL_LOADED, () => {
            console.log('تم تحميل مستوى الجودة بنجاح')
            retryCount = 0
          })
          
          hls.on(Hls.Events.FRAG_LOADED, () => {
            // إعادة تعيين عداد الأخطاء عند تحميل جزء بنجاح
            if (retryCount > 0) {
              console.log('تم تحميل جزء بنجاح - إعادة تعيين عداد إعادة المحاولة')
              retryCount = 0
            }
          })
          
          // نظام إعادة الاتصال التلقائي المتقدم (VLC-like)
          let reconnectAttempts = 0
          const maxReconnectAttempts = 8 // زيادة عدد المحاولات
          let reconnectTimer = null
          let healthCheckInterval = null
          
          const handleConnectionLoss = () => {
            if (reconnectAttempts < maxReconnectAttempts) {
              reconnectAttempts++
              const delay = Math.min(1000 * Math.pow(1.5, reconnectAttempts), 15000) // تأخير تدريجي محسن
              console.log(`محاولة إعادة الاتصال ${reconnectAttempts}/${maxReconnectAttempts} خلال ${delay}ms`)
              
              setError(`إعادة الاتصال... (${reconnectAttempts}/${maxReconnectAttempts})`)
              
              reconnectTimer = setTimeout(() => {
                if (hls && !hls.destroyed) {
                  try {
                    // إعادة تحميل المصدر بالكامل للاتصالات المنقطعة
                    hls.stopLoad()
                    hls.detachMedia()
                    hls.loadSource(streamUrl)
                    hls.attachMedia(video)
                    console.log('تم بدء إعادة تحميل البث الكامل')
                  } catch (error) {
                    console.error('فشل في إعادة تحميل البث:', error)
                    handleConnectionLoss() // محاولة أخرى
                  }
                }
              }, delay)
            } else {
              console.log('تم الوصول للحد الأقصى من محاولات إعادة الاتصال')
              setError('فشل الاتصال نهائياً - تحقق من الإنترنت')
              setIsLoading(false)
            }
          }
          
          // مراقبة صحة الاتصال
          const startHealthCheck = () => {
            healthCheckInterval = setInterval(() => {
              if (hls && !hls.destroyed && video.readyState === 0 && !isLoading) {
                console.warn('اكتشاف مشكلة في الاتصال - بدء إعادة الاتصال')
                handleConnectionLoss()
              }
            }, 10000) // فحص كل 10 ثوان
          }
          
          // مراقبة حالة الشبكة المحسنة
          const handleOnline = () => {
            console.log('تم استعادة الاتصال بالإنترنت')
            reconnectAttempts = 0
            setError(null)
            if (hls && !hls.destroyed) {
              hls.startLoad()
            }
            startHealthCheck()
          }
          
          const handleOffline = () => {
            console.log('انقطع الاتصال بالإنترنت')
            setError('لا يوجد اتصال بالإنترنت')
            if (healthCheckInterval) {
              clearInterval(healthCheckInterval)
            }
          }
          
          window.addEventListener('online', handleOnline)
          window.addEventListener('offline', handleOffline)
          
          // بدء مراقبة الصحة
          startHealthCheck()
          
          // تنظيف المؤقتات عند التدمير
          const originalDestroy = hls.destroy.bind(hls)
          hls.destroy = () => {
            if (reconnectTimer) clearTimeout(reconnectTimer)
            if (healthCheckInterval) clearInterval(healthCheckInterval)
            window.removeEventListener('online', handleOnline)
            window.removeEventListener('offline', handleOffline)
            originalDestroy()
          }
          
          window.hlsInstance = hls
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
          // Safari native HLS support
          video.src = streamUrl
        } else {
          setError('المتصفح لا يدعم تشغيل هذا النوع من الفيديو')
          setIsLoading(false)
        }
      } else if (streamUrl) {
        // Regular video file
        video.src = streamUrl
      } else {
        setError('رابط القناة غير متوفر')
        setIsLoading(false)
      }
    }
    
    // Performance optimized cleanup on unmount
    return () => {
      // Destroy main HLS instance with error handling
      if (window.hlsInstance) {
        try {
          window.hlsInstance.destroy()
        } catch (e) {
          console.warn('Error destroying main HLS instance:', e)
        } finally {
          window.hlsInstance = null
        }
      }
      
      // Optimized cache cleanup with batch processing
      const cacheEntries = Array.from(channelCache.entries())
      const batchSize = 5
      
      for (let i = 0; i < cacheEntries.length; i += batchSize) {
        const batch = cacheEntries.slice(i, i + batchSize)
        
        // Process batch asynchronously to prevent blocking
        setTimeout(() => {
          batch.forEach(([key, cachedData]) => {
            if (cachedData.hlsInstance && !cachedData.hlsInstance.destroyed) {
              try {
                cachedData.hlsInstance.destroy()
              } catch (e) {
                console.warn(`Error destroying cached HLS instance for ${key}:`, e)
              }
            }
          })
        }, i * 10) // Stagger cleanup to prevent performance spikes
      }
      
      // Clear cache immediately
      setChannelCache(new Map())
      
      // Enhanced timeout cleanup
      const timeouts = [
        preloadTimeoutRef.current,
        retryTimeoutRef?.current
      ]
      
      timeouts.forEach(timeout => {
        if (timeout) {
          clearTimeout(timeout)
        }
      })
      
      // Clear refs
      preloadTimeoutRef.current = null
      if (retryTimeoutRef) {
        retryTimeoutRef.current = null
      }
      
      // Memory optimization hint
      if (window.gc && typeof window.gc === 'function') {
        setTimeout(() => window.gc(), 1000)
      }
    }
  }, [selectedChannel, toast])

  const togglePlay = () => {
    const video = videoRef.current
    if (!video || !selectedChannel) return

    if (isPlaying) {
      video.pause()
    } else {
      video.play().catch(err => {
        console.log('Play failed:', err)
      })
    }
  }



  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value)
    changeVolume(newVolume)
  }

  // تخطي الوقت (VLC-like)
  const skipTime = useCallback((seconds) => {
    const video = videoRef.current
    if (!video) return
    
    video.currentTime = Math.max(0, Math.min(video.duration || 0, video.currentTime + seconds))
  }, [])
  
  // تغيير مستوى الصوت (VLC-like)
  const changeVolume = useCallback((newVolume) => {
    const video = videoRef.current
    if (!video) return

    const clampedVolume = Math.max(0, Math.min(1, newVolume))
    setVolume(clampedVolume)
    video.volume = clampedVolume
    setIsMuted(clampedVolume === 0)
  }, [])

  const toggleFullscreen = () => {
    const container = videoRef.current?.parentElement
    if (!container) return

    if (document.fullscreenElement) {
      document.exitFullscreen()
    } else {
      container.requestFullscreen().catch(err => {
        console.error('فشل في تفعيل وضع ملء الشاشة:', err)
      })
    }
  }

  // تغيير معدل التشغيل (VLC-like)
  const changePlaybackRate = useCallback((rate) => {
    const video = videoRef.current
    if (!video) return

    video.playbackRate = rate
    setPlaybackRate(rate)
    setShowSettings(false)
    console.log(`تم تغيير السرعة إلى: ${rate}x`)
  }, [])

  // تحميل مسبق لقناة واحدة (VLC-like)
  const preloadStream = useCallback((channel) => {
    if (!channel) return
    
    const streamUrl = channel.stream_url || channel.stream
    const cacheKey = `${channel.id || channel.name}_${streamUrl}`
    
    // تجنب التحميل المسبق إذا كانت القناة محملة مسبقاً
    if (preloadedStreams.current[cacheKey] || !streamUrl || !streamUrl.includes('.m3u8')) {
      return
    }
    
    if (Hls.isSupported()) {
      const preloadHls = new Hls({
        enableWorker: true,
        lowLatencyMode: false,
        maxBufferLength: 3,
        maxMaxBufferLength: 15,
        manifestLoadingTimeOut: 2000,
        fragLoadingTimeOut: 3000,
        autoStartLoad: false
      })
      
      preloadHls.loadSource(streamUrl)
      
      preloadHls.on(Hls.Events.MANIFEST_PARSED, () => {
        console.log('تم التحميل المسبق للقناة:', channel.name)
        preloadedStreams.current[cacheKey] = {
          hlsInstance: preloadHls,
          timestamp: Date.now(),
          channel: channel,
          preloaded: true
        }
      })
      
      preloadHls.on(Hls.Events.ERROR, (event, data) => {
        if (data.fatal) {
          console.warn('فشل التحميل المسبق للقناة:', channel.name)
          try {
            preloadHls.destroy()
          } catch (e) {
            console.warn('Error destroying preload HLS:', e)
          }
        }
      })
    }
  }, [])

  // تحسين التنقل السريع بين القنوات مع التخزين المؤقت (VLC-like)
  const navigateChannel = useCallback((direction) => {
    if (!selectedChannel || filteredChannels.length === 0) return
    
    const currentIndex = filteredChannels.findIndex(ch => 
      (ch.id && ch.id === selectedChannel.id) || ch.name === selectedChannel.name
    )
    let newIndex
    
    if (direction === 'up') {
      newIndex = currentIndex > 0 ? currentIndex - 1 : filteredChannels.length - 1
    } else {
      newIndex = currentIndex < filteredChannels.length - 1 ? currentIndex + 1 : 0
    }
    
    const newChannel = filteredChannels[newIndex]
    
    // التحقق من وجود القناة في التخزين المؤقت للتبديل السريع
    const streamUrl = newChannel.stream_url || newChannel.stream
    const cacheKey = `${newChannel.id || newChannel.name}_${streamUrl}`
    
    if (preloadedStreams.current[cacheKey]) {
      console.log('استخدام القناة من التخزين المؤقت:', newChannel.name)
    }
    
    onChannelSelect(newChannel)
    
    // إضافة القناة الجديدة للتخزين المؤقت إذا لم تكن موجودة
    if (!preloadedStreams.current[cacheKey]) {
      preloadStream(newChannel)
    }
  }, [selectedChannel, filteredChannels, onChannelSelect, preloadStream])
  
  // اختصارات لوحة المفاتيح (VLC-like)
  const handleKeyPress = useCallback((e) => {
    if (!videoRef.current) return
    
    switch (e.key) {
      case ' ':
        e.preventDefault()
        togglePlay()
        break
      case 'ArrowRight':
        e.preventDefault()
        skipTime(10)
        break
      case 'ArrowLeft':
        e.preventDefault()
        skipTime(-10)
        break
      case 'ArrowUp':
        e.preventDefault()
        navigateChannel('up')
        break
      case 'ArrowDown':
        e.preventDefault()
        navigateChannel('down')
        break
      case 'f':
      case 'F':
        e.preventDefault()
        toggleFullscreen()
        break
      case '+':
      case '=':
        e.preventDefault()
        const currentRateIndex = playbackRates.indexOf(playbackRate)
        if (currentRateIndex < playbackRates.length - 1) {
          changePlaybackRate(playbackRates[currentRateIndex + 1])
        }
        break
      case '-':
        e.preventDefault()
        const currentRateIndexDown = playbackRates.indexOf(playbackRate)
        if (currentRateIndexDown > 0) {
          changePlaybackRate(playbackRates[currentRateIndexDown - 1])
        }
        break
      case 'm':
      case 'M':
        e.preventDefault()
        setIsMuted(!isMuted)
        if (videoRef.current) {
          videoRef.current.muted = !isMuted
        }
        break
    }
  }, [volume, playbackRate, isMuted, togglePlay, skipTime, changeVolume, toggleFullscreen, changePlaybackRate, navigateChannel])
  
  // تغيير الجودة (VLC-like)
  const changeQuality = useCallback((qualityIndex) => {
    if (hlsRef.current && hlsRef.current.levels) {
      if (qualityIndex === -1) {
        // تلقائي
        hlsRef.current.currentLevel = -1
        setQuality('auto')
        console.log('تم تعيين الجودة على تلقائي')
      } else {
        hlsRef.current.currentLevel = qualityIndex
        const selectedLevel = hlsRef.current.levels[qualityIndex]
        setQuality(selectedLevel.height ? `${selectedLevel.height}p` : 'مخصص')
        console.log(`تم تغيير الجودة إلى: ${selectedLevel.height}p`)
      }
    }
  }, [])
  
  // تغيير المسار الصوتي
  const changeAudioTrack = useCallback((trackIndex) => {
    if (hlsRef.current && hlsRef.current.audioTracks) {
      hlsRef.current.audioTrack = trackIndex
      setSelectedAudioTrack(trackIndex)
      console.log(`تم تغيير المسار الصوتي إلى: ${trackIndex}`)
    }
  }, [])
  
  // سرعات التشغيل المتاحة (VLC-like)
  const playbackRates = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2, 2.5, 3]
  
  const formatTime = (time) => {
    if (isNaN(time)) return '00:00'
    
    const hours = Math.floor(time / 3600)
    const minutes = Math.floor((time % 3600) / 60)
    const seconds = Math.floor(time % 60)
    
    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
    }
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  }


  const toggleFavorite = (channel) => {
    if (isFavorite('channels', channel.id)) {
      removeFromFavorites('channels', channel.id)
      toast.info(`تم إزالة ${channel.name_ar || channel.name} من المفضلة`)
    } else {
      addToFavorites('channels', channel)
      toast.success(`تم إضافة ${channel.name_ar || channel.name} للمفضلة`)
    }
  }

  // استخدام الفئات الممررة كخاصية أو إنشاؤها من القنوات كبديل
  const availableCategories = useMemo(() => {
    if (categories.length > 0) {
      return categories.map(cat => typeof cat === 'object' ? (cat.name || cat.name_ar || cat) : cat)
    }
    // استخراج الفئات من القنوات مع تجنب التكرار
    const channelCategories = channels
      .map(ch => ch.category || ch.channel_categories?.name || ch.channel_categories?.name_ar)
      .filter(Boolean)
    return [...new Set(channelCategories)]
  }, [categories, channels])

  // تسجيل للتتبع
  if (categories.length === 0) {
    console.warn('لا توجد فئات محملة!')
  }

  return (
    <div className={`enhanced-video-player mobile-video-container ${className}`}>
      {/* Video Player Section */}
      <div className="relative bg-black rounded-2xl overflow-hidden shadow-2xl mb-4 sm:mb-6">
        <div 
          className="relative aspect-video mobile-video-container"
          onMouseMove={() => setShowControls(true)}
          onMouseLeave={() => !showSettings && setShowControls(false)}
        >
          {selectedChannel ? (
            <>
              {/* Video Element */}
              <video
                ref={videoRef}
                className="mobile-video w-full h-full object-cover"
                autoPlay
                muted={isMuted}
                playsInline
                preload="metadata"
                controls={false}
              >
                متصفحك لا يدعم تشغيل الفيديو
              </video>

              {/* Loading Overlay */}
              {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                  <div className="flex flex-col items-center text-white">
                    <Loader className="w-8 h-8 animate-spin mb-2" />
                    <span className="text-sm">جاري تحميل {selectedChannel.name_ar || selectedChannel.name}...</span>
                  </div>
                </div>
              )}

              {/* Buffering Overlay */}
              {isBuffering && !isLoading && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-black/70 rounded-full p-3">
                    <Loader className="w-6 h-6 animate-spin text-white" />
                  </div>
                </div>
              )}

              {/* Error Overlay */}
              {error && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/80">
                  <div className="text-center text-white p-6 max-w-md mx-auto">
                    <WifiOff className="w-12 h-12 mx-auto mb-4 text-red-400" />
                    <h3 className="text-lg font-semibold mb-2">خطأ في التشغيل</h3>
                    <p className="text-sm text-gray-300 mb-4">{error}</p>
                    
                    {/* نصائح للمستخدم */}
                    <div className="bg-gray-800/50 rounded-lg p-3 mb-4 text-xs text-gray-400">
                      <p className="mb-1">💡 نصائح:</p>
                      <p>• تحقق من اتصال الإنترنت</p>
                      <p>• جرب قناة أخرى من نفس الفئة</p>
                      <p>• أعد تحميل الصفحة إذا استمر الخطأ</p>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row gap-2 justify-center">
                      <button 
                        onClick={() => {
                          setError(null)
                          setIsLoading(true)
                          videoRef.current?.load()
                        }}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center justify-center"
                      >
                        <RotateCcw className="w-4 h-4 mr-2" />
                        إعادة المحاولة
                      </button>
                      
                      {/* اقتراح قناة بديلة */}
                      {channels.length > 1 && (
                        <button 
                          onClick={() => {
                            const currentIndex = channels.findIndex(ch => ch.id === selectedChannel?.id)
                            const nextChannel = channels[(currentIndex + 1) % channels.length]
                            onChannelSelect(nextChannel)
                          }}
                          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center justify-center"
                        >
                          <ChevronDown className="w-4 h-4 mr-2" />
                          جرب قناة أخرى
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Controls Overlay */}
              <div className={`absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 transition-opacity duration-300 ${
                showControls ? 'opacity-100' : 'opacity-0'
              }`}>
                
                {/* Top Bar */}
                <div className="absolute top-0 left-0 right-0 p-2 sm:p-4 flex items-center justify-between">
                  <div className="flex items-center space-x-2 sm:space-x-3 rtl:space-x-reverse">
                    <div className="flex items-center space-x-1 sm:space-x-2 rtl:space-x-reverse bg-red-600 px-2 sm:px-3 py-1 rounded-full">
                      <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-white rounded-full animate-pulse"></div>
                      <span className="text-white text-xs sm:text-sm font-medium">مباشر</span>
                    </div>
                    <div className="hidden sm:flex items-center space-x-2 rtl:space-x-reverse">
                      {isConnected ? (
                        <Wifi className="w-4 h-4 text-green-400" />
                      ) : (
                        <WifiOff className="w-4 h-4 text-red-400" />
                      )}
                      <span className="text-white text-sm">{quality.toUpperCase()}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 sm:space-x-3 rtl:space-x-reverse">
                    <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-lg ${getCategoryColor(selectedChannel.category)} flex items-center justify-center`}>
                      {getChannelIcon(selectedChannel.category, 'w-3 h-3 sm:w-4 sm:h-4')}
                    </div>
                    <div className="text-white">
                      <h3 className="font-medium text-sm sm:text-lg truncate max-w-20 sm:max-w-none">{selectedChannel.name_ar || selectedChannel.name}</h3>
                      <p className="text-xs sm:text-sm text-gray-300 hidden sm:block">{selectedChannel.country}</p>
                    </div>
                    
                    {/* Channel Navigation Buttons */}
                    <div className="flex items-center space-x-1 rtl:space-x-reverse mr-2 sm:mr-4">
                      <button
                        onClick={() => navigateChannel('up')}
                        className="mobile-touch-target control-button p-1.5 sm:p-2 hover:bg-white/20 rounded-lg transition-colors"
                        title="القناة السابقة (↑)"
                      >
                        <ChevronUp className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                      </button>
                      
                      <button
                        onClick={() => navigateChannel('down')}
                        className="mobile-touch-target control-button p-1.5 sm:p-2 hover:bg-white/20 rounded-lg transition-colors"
                        title="القناة التالية (↓)"
                      >
                        <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Center Play Button */}
                {!isPlaying && !isLoading && !error && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <button
                      onClick={togglePlay}
                      className="bg-white/20 backdrop-blur-sm hover:bg-white/30 rounded-full p-6 transition-all duration-300 transform hover:scale-110"
                    >
                      <Play className="w-12 h-12 text-white fill-current" />
                    </button>
                  </div>
                )}

                {/* Bottom Controls */}
                <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 sm:space-x-4 rtl:space-x-reverse">
                      {/* Play/Pause */}
                      <button
                        onClick={togglePlay}
                        className="mobile-touch-target control-button p-1.5 sm:p-2 text-white hover:text-blue-400 transition-colors"
                      >
                        {isPlaying ? (
                          <Pause className="w-5 h-5 sm:w-6 sm:h-6" />
                        ) : (
                          <Play className="w-5 h-5 sm:w-6 sm:h-6 fill-current" />
                        )}
                      </button>

                      {/* Volume Controls - Hidden on small screens */}
                      <div className="hidden sm:flex items-center space-x-2 rtl:space-x-reverse">
                        <button
                          onClick={toggleMute}
                          className="p-2 text-white hover:text-blue-400 transition-colors"
                        >
                          {isMuted || volume === 0 ? (
                            <VolumeX className="w-5 h-5" />
                          ) : (
                            <Volume2 className="w-5 h-5" />
                          )}
                        </button>
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.1"
                          value={isMuted ? 0 : volume}
                          onChange={handleVolumeChange}
                          className="w-16 sm:w-20 accent-blue-500 bg-white/20 rounded-full"
                        />
                      </div>

                      {/* Channel Info */}
                      <div className="text-white text-xs sm:text-sm">
                        <div className="font-medium truncate max-w-[120px] sm:max-w-[200px]">{selectedChannel.name_ar || selectedChannel.name}</div>
                        <div className="text-white/70 text-xs">{selectedChannel.country}</div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-1 sm:space-x-2 rtl:space-x-reverse">
                      {/* Volume for mobile */}
                      <button
                        onClick={toggleMute}
                        className="mobile-touch-target control-button sm:hidden p-1.5 text-white hover:text-blue-400 transition-colors"
                      >
                        {isMuted || volume === 0 ? (
                          <VolumeX className="w-4 h-4" />
                        ) : (
                          <Volume2 className="w-4 h-4" />
                        )}
                      </button>

                      {/* Settings */}
                      <div className="relative">
                        <button
                          onClick={() => setShowSettings(!showSettings)}
                          className="mobile-touch-target control-button p-1.5 sm:p-2 text-white hover:text-blue-400 transition-colors"
                        >
                          <Settings className="w-4 h-4 sm:w-5 sm:h-5" />
                        </button>
                        
                        {showSettings && (
                          <div className="absolute bottom-12 right-0 bg-black/95 backdrop-blur-sm rounded-lg p-4 min-w-[200px] sm:min-w-[250px] z-50 max-h-80 overflow-y-auto">
                            <div className="text-white text-sm space-y-4">
                              
                              {/* سرعة التشغيل */}
                              <div>
                                <div className="font-medium border-b border-white/20 pb-2 mb-2 flex items-center">
                                  <Zap className="w-4 h-4 mr-2" />
                                  سرعة التشغيل
                                </div>
                                <div className="grid grid-cols-3 gap-1">
                                  {playbackRates.map(rate => (
                                    <button
                                      key={rate}
                                      onClick={() => changePlaybackRate(rate)}
                                      className={`px-2 py-1 rounded text-xs hover:bg-white/20 transition-colors ${
                                        playbackRate === rate ? 'bg-blue-600 text-white' : 'bg-white/10'
                                      }`}
                                    >
                                      {rate}x
                                    </button>
                                  ))}
                                </div>
                              </div>
                              
                              {/* جودة الفيديو */}
                              {availableQualities.length > 0 && (
                                <div>
                                  <div className="font-medium border-b border-white/20 pb-2 mb-2 flex items-center">
                                    <Monitor className="w-4 h-4 mr-2" />
                                    جودة الفيديو
                                  </div>
                                  <div className="space-y-1">
                                    {availableQualities.map(qualityOption => (
                                      <button
                                        key={qualityOption.index}
                                        onClick={() => changeQuality(qualityOption.index)}
                                        className={`block w-full text-right px-2 py-1 rounded hover:bg-white/20 transition-colors ${
                                          (qualityOption.index === -1 && quality === 'auto') || 
                                          (qualityOption.label === quality) ? 'text-blue-400 bg-blue-600/20' : ''
                                        }`}
                                      >
                                        <div className="flex justify-between items-center">
                                          <span>{qualityOption.label}</span>
                                          {qualityOption.bitrate && (
                                            <span className="text-xs text-gray-400">
                                              {Math.round(qualityOption.bitrate / 1000)}k
                                            </span>
                                          )}
                                        </div>
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              )}
                              
                              {/* المسارات الصوتية */}
                              {audioTracks.length > 1 && (
                                <div>
                                  <div className="font-medium border-b border-white/20 pb-2 mb-2 flex items-center">
                                    <Volume2 className="w-4 h-4 mr-2" />
                                    المسار الصوتي
                                  </div>
                                  <div className="space-y-1">
                                    {audioTracks.map(track => (
                                      <button
                                        key={track.index}
                                        onClick={() => changeAudioTrack(track.index)}
                                        className={`block w-full text-right px-2 py-1 rounded hover:bg-white/20 transition-colors ${
                                          selectedAudioTrack === track.index ? 'text-blue-400 bg-blue-600/20' : ''
                                        }`}
                                      >
                                        <div className="flex justify-between items-center">
                                          <span>{track.name}</span>
                                          <span className="text-xs text-gray-400">{track.language}</span>
                                        </div>
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              )}
                              
                              {/* معلومات إضافية */}
                              <div className="border-t border-white/20 pt-2 text-xs text-gray-400">
                                <div>اختصارات: +/- للسرعة، F للشاشة الكاملة</div>
                                <div>مسافة للتشغيل/الإيقاف، M لكتم الصوت</div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Fullscreen */}
                      <button
                        onClick={toggleFullscreen}
                        className="mobile-touch-target control-button p-1.5 sm:p-2 text-white hover:text-blue-400 transition-colors"
                      >
                        {isFullscreen ? (
                          <Minimize className="w-4 h-4 sm:w-5 sm:h-5" />
                        ) : (
                          <Maximize className="w-4 h-4 sm:w-5 sm:h-5" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            /* No Channel Selected */
            (<div className="flex items-center justify-center h-full bg-gradient-to-br from-gray-900 to-black">
              <div className="text-center text-white p-4 sm:p-8">
                <Tv className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 text-gray-400" />
                <h3 className="text-lg sm:text-xl font-semibold mb-2">اختر قناة للمشاهدة</h3>
                <p className="text-gray-400 mb-4 sm:mb-6 text-sm sm:text-base">اختر قناة من القائمة أدناه لبدء المشاهدة</p>
                
                {/* Keyboard Shortcuts Info - Hidden on mobile */}
                <div className="hidden sm:block bg-black/50 backdrop-blur-sm rounded-lg p-4 max-w-md mx-auto">
                  <h4 className="text-sm font-medium mb-3 text-gray-300">اختصارات لوحة المفاتيح</h4>
                  <div className="grid grid-cols-2 gap-2 text-xs text-gray-400">
                    <div className="flex justify-between">
                      <span>مسافة/K</span>
                      <span>تشغيل/إيقاف</span>
                    </div>
                    <div className="flex justify-between">
                      <span>M</span>
                      <span>كتم الصوت</span>
                    </div>
                    <div className="flex justify-between">
                      <span>F</span>
                      <span>ملء الشاشة</span>
                    </div>
                    <div className="flex justify-between">
                      <span>↑↓</span>
                      <span>تغيير القناة</span>
                    </div>
                    <div className="flex justify-between">
                      <span>←→</span>
                      <span>تقديم/تأخير</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>)
          )}
        </div>
      </div>
      {/* Channels List Section */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden">
        {/* Search and Filter Header */}
        <div className="p-4 sm:p-6 border-b border-gray-200">
          <div className="flex flex-col space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-1">قائمة القنوات</h2>
                <p className="text-gray-600 text-xs sm:text-sm">{filteredChannels.length} من {channels.length} قناة</p>
              </div>
              
              {/* Quick Stats */}
              <div className="flex items-center space-x-4 rtl:space-x-reverse text-xs sm:text-sm text-gray-500">
                <span className="flex items-center space-x-1 rtl:space-x-reverse">
                  <Tv className="w-4 h-4" />
                  <span>{channels.length}</span>
                </span>
                {selectedChannel && (
                  <span className="flex items-center space-x-1 rtl:space-x-reverse text-blue-600">
                    <Play className="w-4 h-4 fill-current" />
                    <span>يتم التشغيل</span>
                  </span>
                )}
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              {/* Search Input */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="البحث في القنوات..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2.5 ltr:pr-10 rtl:pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-white/70 backdrop-blur-sm"
                />
                <div className="absolute ltr:right-3 rtl:left-3 top-1/2 transform -translate-y-1/2">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
              
              {/* Category Filter */}
              <div className="relative">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-white/70 backdrop-blur-sm appearance-none"
                >
                  <option value="all">جميع الفئات ({channels.length})</option>
                  {availableCategories.map((category, index) => {
                    const categoryCount = channels.filter(ch => ch.category === category).length
                    return (
                      <option key={`category-${index}`} value={category}>
                        {category} ({categoryCount})
                      </option>
                    )
                  })}
                </select>
                <div className="absolute ltr:right-3 rtl:left-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Channels Grid */}
        <div className="p-2 sm:p-6">
          <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-4 max-h-80 sm:max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
            {filteredChannels.map((channel) => (
              <div
                key={channel.id}
                className={`relative group cursor-pointer rounded-lg sm:rounded-xl overflow-hidden transition-all duration-300 transform hover:scale-105 hover:shadow-lg ${
                  selectedChannel?.id === channel.id 
                    ? 'ring-2 ring-blue-500 shadow-lg scale-105 shadow-blue-500/50' 
                    : 'hover:shadow-md'
                }`}
                onClick={() => handleChannelSelect(channel)}
              >
                {/* Channel Card - Simplified */}
                <div className="bg-gradient-to-br from-white to-gray-50 p-3 h-full min-h-[100px] sm:min-h-[120px] flex flex-col items-center justify-center text-center">
                  {/* Channel Logo - Enlarged */}
                  <div className="flex flex-col items-center mb-2">
                    <div className="w-16 h-16 sm:w-24 sm:h-24 rounded-lg sm:rounded-xl overflow-hidden bg-white shadow-md border border-gray-200 flex items-center justify-center mb-2">
                      {channel.logo_url ? (
                        <LazyImage 
                          src={channel.logo_url} 
                          alt={channel.name_ar || channel.name}
                          className="w-full h-full object-contain p-1"
                          referrerPolicy="no-referrer"
                          crossOrigin="anonymous"
                          fallback={
                            <div className={`w-full h-full ${getCategoryColor(channel.category)} flex items-center justify-center`}>
                              {getChannelIcon(channel.category, 'w-8 h-8 sm:w-12 sm:h-12')}
                            </div>
                          }
                          onError={(e) => {
                            console.log('Logo failed to load (ORB/CORS):', channel.logo_url)
                          }}
                        />
                      ) : null}
                      <div className={`w-full h-full ${getCategoryColor(channel.category)} items-center justify-center ${channel.logo_url ? 'hidden' : 'flex'}`}>
                        {getChannelIcon(channel.category, 'w-8 h-8 sm:w-12 sm:h-12')}
                      </div>
                    </div>
                  </div>

                  {/* Channel Name Only */}
                  <div className="flex-1 flex flex-col items-center justify-center text-center">
                    <h3 className="font-semibold text-gray-900 text-sm sm:text-base leading-tight line-clamp-2" title={channel.name_ar || channel.name}>
                      {channel.name_ar || channel.name}
                    </h3>
                  </div>

                  {/* Play Overlay */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="bg-white/90 backdrop-blur-sm rounded-full p-1 sm:p-2">
                        <Play className="w-3 h-3 sm:w-4 sm:h-4 text-gray-900 fill-current" />
                      </div>
                    </div>
                  </div>

                  {/* Selected Indicator */}
                  {selectedChannel?.id === channel.id && (
                    <div className="absolute top-1 sm:top-2 ltr:left-1 ltr:sm:left-2 rtl:right-1 rtl:sm:right-2 bg-blue-500 text-white px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-xs font-medium">
                      <span className="hidden sm:inline">يتم التشغيل</span>
                      <Play className="w-3 h-3 sm:hidden fill-current" />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* No Channels Found */}
          {filteredChannels.length === 0 && (
            <div className="text-center py-12">
              <Tv className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">لا توجد قنوات</h3>
              <p className="text-gray-600">لم يتم العثور على قنوات تطابق معايير البحث</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
})

export default EnhancedVideoPlayer