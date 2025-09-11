import React, { useState, useRef, useEffect } from 'react'
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
  WifiOff
} from 'lucide-react'

const VideoPlayer = ({ 
  src, 
  poster, 
  title, 
  isLive = false, 
  onError, 
  className = '',
  autoPlay = false,
  muted = false 
}) => {
  const videoRef = useRef(null)
  const progressRef = useRef(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(muted)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showControls, setShowControls] = useState(true)
  const [isLoading, setIsLoading] = useState(true)
  const [isBuffering, setIsBuffering] = useState(false)
  const [playbackRate, setPlaybackRate] = useState(1)
  const [quality, setQuality] = useState('auto')
  const [showSettings, setShowSettings] = useState(false)
  const [isConnected, setIsConnected] = useState(true)
  const [error, setError] = useState(null)

  let controlsTimeout = useRef(null)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

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
      setError('فشل في تحميل الفيديو')
      setIsLoading(false)
      onError && onError(e)
    }

    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }

    video.addEventListener('loadedmetadata', handleLoadedMetadata)
    video.addEventListener('timeupdate', handleTimeUpdate)
    video.addEventListener('play', handlePlay)
    video.addEventListener('pause', handlePause)
    video.addEventListener('waiting', handleWaiting)
    video.addEventListener('canplay', handleCanPlay)
    video.addEventListener('error', handleError)
    document.addEventListener('fullscreenchange', handleFullscreenChange)

    return () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata)
      video.removeEventListener('timeupdate', handleTimeUpdate)
      video.removeEventListener('play', handlePlay)
      video.removeEventListener('pause', handlePause)
      video.removeEventListener('waiting', handleWaiting)
      video.removeEventListener('canplay', handleCanPlay)
      video.removeEventListener('error', handleError)
      document.removeEventListener('fullscreenchange', handleFullscreenChange)
    }
  }, [onError])

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

  const togglePlay = () => {
    const video = videoRef.current
    if (!video) return

    if (isPlaying) {
      video.pause()
    } else {
      video.play().catch(err => {
        setError('فشل في تشغيل الفيديو')
        onError && onError(err)
      })
    }
  }

  const toggleMute = () => {
    const video = videoRef.current
    if (!video) return

    video.muted = !isMuted
    setIsMuted(!isMuted)
  }

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value)
    const video = videoRef.current
    if (!video) return

    setVolume(newVolume)
    video.volume = newVolume
    setIsMuted(newVolume === 0)
  }

  const handleProgressClick = (e) => {
    if (!progressRef.current || isLive) return

    const rect = progressRef.current.getBoundingClientRect()
    const clickX = e.clientX - rect.left
    const newTime = (clickX / rect.width) * duration
    
    const video = videoRef.current
    if (video) {
      video.currentTime = newTime
      setCurrentTime(newTime)
    }
  }

  const toggleFullscreen = () => {
    const video = videoRef.current
    if (!video) return

    if (document.fullscreenElement) {
      document.exitFullscreen()
    } else {
      video.requestFullscreen().catch(err => {
        console.error('فشل في تفعيل وضع ملء الشاشة:', err)
      })
    }
  }

  const skipTime = (seconds) => {
    const video = videoRef.current
    if (!video || isLive) return

    video.currentTime = Math.max(0, Math.min(duration, video.currentTime + seconds))
  }

  const changePlaybackRate = (rate) => {
    const video = videoRef.current
    if (!video) return

    video.playbackRate = rate
    setPlaybackRate(rate)
    setShowSettings(false)
  }

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

  const progressPercentage = isLive ? 100 : (currentTime / duration) * 100 || 0

  return (
    <div 
      className={`video-player group ${className}`}
      onMouseMove={() => setShowControls(true)}
      onMouseLeave={() => !showSettings && setShowControls(false)}
    >
      {/* Video Element */}
      <video
        ref={videoRef}
        className="w-full h-full object-cover"
        poster={poster}
        autoPlay={autoPlay}
        muted={isMuted}
        playsInline
        preload="metadata"
      >
        <source src={src} type="video/mp4" />
        <source src={src} type="application/x-mpegURL" />
        متصفحك لا يدعم تشغيل الفيديو
      </video>

      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <div className="flex flex-col items-center text-white">
            <Loader className="w-8 h-8 animate-spin mb-2" />
            <span className="text-sm">جاري التحميل...</span>
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
          <div className="text-center text-white p-6">
            <WifiOff className="w-12 h-12 mx-auto mb-4 text-red-400" />
            <h3 className="text-lg font-semibold mb-2">خطأ في التشغيل</h3>
            <p className="text-sm text-gray-300 mb-4">{error}</p>
            <button 
              onClick={() => {
                setError(null)
                setIsLoading(true)
                videoRef.current?.load()
              }}
              className="btn-primary-sm"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              إعادة المحاولة
            </button>
          </div>
        </div>
      )}

      {/* Controls Overlay */}
      <div className={`absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 transition-opacity duration-300 ${
        showControls ? 'opacity-100' : 'opacity-0'
      }`}>
        
        {/* Top Bar */}
        <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between">
          <div className="flex items-center space-x-3 rtl:space-x-reverse">
            {isLive && (
              <div className="flex items-center space-x-2 rtl:space-x-reverse bg-red-600 px-3 py-1 rounded-full">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                <span className="text-white text-sm font-medium">مباشر</span>
              </div>
            )}
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              {isConnected ? (
                <Wifi className="w-4 h-4 text-green-400" />
              ) : (
                <WifiOff className="w-4 h-4 text-red-400" />
              )}
              <span className="text-white text-sm">{quality.toUpperCase()}</span>
            </div>
          </div>
          
          {title && (
            <h3 className="text-white font-medium text-lg truncate max-w-md">{title}</h3>
          )}
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
        <div className="absolute bottom-0 left-0 right-0 p-4">
          {/* Progress Bar */}
          {!isLive && (
            <div 
              ref={progressRef}
              className="video-progress mb-4 cursor-pointer"
              onClick={handleProgressClick}
            >
              <div 
                className="video-progress-bar"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          )}

          {/* Control Buttons */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 rtl:space-x-reverse">
              {/* Play/Pause */}
              <button
                onClick={togglePlay}
                className="p-2 text-white hover:text-primary-400 transition-colors"
              >
                {isPlaying ? (
                  <Pause className="w-6 h-6" />
                ) : (
                  <Play className="w-6 h-6 fill-current" />
                )}
              </button>

              {/* Skip Buttons (for non-live content) */}
              {!isLive && (
                <>
                  <button
                    onClick={() => skipTime(-10)}
                    className="p-2 text-white hover:text-primary-400 transition-colors"
                  >
                    <SkipBack className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => skipTime(10)}
                    className="p-2 text-white hover:text-primary-400 transition-colors"
                  >
                    <SkipForward className="w-5 h-5" />
                  </button>
                </>
              )}

              {/* Volume Controls */}
              <div className="flex items-center space-x-2 rtl:space-x-reverse">
                <button
                  onClick={toggleMute}
                  className="p-2 text-white hover:text-primary-400 transition-colors"
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
                  className="w-20 accent-primary-500 bg-white/20 rounded-full"
                />
              </div>

              {/* Time Display */}
              {!isLive && (
                <div className="text-white text-sm font-mono">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </div>
              )}
            </div>

            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              {/* Settings */}
              <div className="relative">
                <button
                  onClick={() => setShowSettings(!showSettings)}
                  className="p-2 text-white hover:text-primary-400 transition-colors"
                >
                  <Settings className="w-5 h-5" />
                </button>
                
                {showSettings && (
                  <div className="absolute bottom-12 right-0 bg-black/90 backdrop-blur-sm rounded-lg p-3 min-w-[150px]">
                    <div className="text-white text-sm space-y-2">
                      <div className="font-medium border-b border-white/20 pb-2 mb-2">سرعة التشغيل</div>
                      {[0.5, 0.75, 1, 1.25, 1.5, 2].map(rate => (
                        <button
                          key={rate}
                          onClick={() => changePlaybackRate(rate)}
                          className={`block w-full text-right px-2 py-1 rounded hover:bg-white/20 transition-colors ${
                            playbackRate === rate ? 'text-primary-400' : ''
                          }`}
                        >
                          {rate}x
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Fullscreen */}
              <button
                onClick={toggleFullscreen}
                className="p-2 text-white hover:text-primary-400 transition-colors"
              >
                {isFullscreen ? (
                  <Minimize className="w-5 h-5" />
                ) : (
                  <Maximize className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default VideoPlayer