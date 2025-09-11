import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import Layout from '../components/Layout'
import Link from 'next/link'
import { useRouter } from 'next/router'
import {
  Play, Pause, Volume2, VolumeX, Maximize, Users, Eye, Heart,
  TrendingUp, Star, Award, Gift, Gamepad2, FileText, Tv,
  Globe, Music, Baby, ChefHat, BookOpen, Radio, Fullscreen,
  Mail, Phone, MapPin, Send, User, Zap
} from 'lucide-react'
import {
  PageLoader, ChannelCardSkeleton, StatCardSkeleton
} from '../components/LoadingComponents'
import VideoPlayer from '../components/VideoPlayer'
import { useToast } from '../components/ToastSystem'
import { useFavorites } from '../components/FavoritesSystem'
import { BannerAd, CardAd, InlineAd } from '../components/AdvertisementSystem'

const HomePage = () => {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const { showToast } = useToast()
  const { isFavorite, toggleFavorite } = useFavorites()
  
  const [loading, setLoading] = useState({
    page: true,
    channels: true,
    stats: true
  })
  
  const [channels, setChannels] = useState([])
  const [stats, setStats] = useState({
    totalChannels: 0,
    liveChannels: 0,
    totalViews: 0,
    articles: 0,
    games: 0
  })

  // Sample channels data
  const sampleChannels = [
    {
      id: 1,
      name: 'الجزيرة مباشر',
      description: 'قناة إخبارية عربية',
      category: 'news',
      isLive: true,
      viewers: 15420,
      rating: 4.8,
      streamUrl: "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4",
      logo: "/api/placeholder/100/100"
    },
    {
      id: 2,
      name: 'العربية',
      description: 'أخبار ومعلومات',
      category: 'news',
      isLive: true,
      viewers: 12890,
      rating: 4.6,
      streamUrl: "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_2mb.mp4",
      logo: "/api/placeholder/100/100"
    },
    {
      id: 3,
      name: 'MBC مباشر',
      description: 'ترفيه ومنوعات',
      category: 'entertainment',
      isLive: false,
      viewers: 8750,
      rating: 4.4,
      streamUrl: "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_5mb.mp4",
      logo: "/api/placeholder/100/100"
    }
  ]

  // Function to get channel icon based on category
  const getChannelIcon = (category, iconClass = 'w-6 h-6 p-1 rounded-lg') => {
    switch (category) {
      case 'news':
        return <div className={`${iconClass} bg-blue-100 text-blue-600`}><Globe className="w-full h-full" /></div>
      case 'entertainment':
        return <div className={`${iconClass} bg-purple-100 text-purple-600`}><Tv className="w-full h-full" /></div>
      case 'sports':
        return <div className={`${iconClass} bg-green-100 text-green-600`}><Gamepad2 className="w-full h-full" /></div>
      case 'music':
        return <div className={`${iconClass} bg-pink-100 text-pink-600`}><Music className="w-full h-full" /></div>
      case 'kids':
        return <div className={`${iconClass} bg-yellow-100 text-yellow-600`}><Baby className="w-full h-full" /></div>
      case 'cooking':
        return <div className={`${iconClass} bg-orange-100 text-orange-600`}><ChefHat className="w-full h-full" /></div>
      case 'education':
        return <div className={`${iconClass} bg-indigo-100 text-indigo-600`}><BookOpen className="w-full h-full" /></div>
      default:
        return <div className={`${iconClass} bg-gray-100 text-gray-600`}><Radio className="w-full h-full" /></div>
    }
  }

  // Simulate realistic loading experience
  useEffect(() => {
    if (!authLoading) {
      // Simulate API calls with realistic delays
      
      // Load stats
      setTimeout(() => {
        setStats({
          totalChannels: 150,
          liveChannels: 45,
          totalViews: 2500000,
          articles: 1250,
          games: 85
        })
        setLoading(prev => ({ ...prev, stats: false }))
      }, 800)

      // Load channels
      setTimeout(() => {
        setChannels(sampleChannels)
        setLoading(prev => ({ ...prev, channels: false }))
      }, 1200)

      // Page fully loaded
      setTimeout(() => {
        setLoading(prev => ({ ...prev, page: false }))
      }, 1500)
    }
  }, [authLoading])

  const isLoading = (type) => {
    return loading[type]
  }

  const handleChannelClick = (channelId) => {
    router.push(`/channels/${channelId}`)
  }

  // Show page loader during initial loading
  if (authLoading || loading.page) {
    return <PageLoader />
  }

  // Show guest homepage for non-authenticated users
  if (!user) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 dark:from-slate-900 dark:via-slate-900/70 dark:to-slate-900">
          {/* Modern Hero Section */}
          <div className="relative overflow-hidden min-h-screen flex items-center">
            <div className="absolute inset-0 gradient-bg opacity-90"></div>
            <div className="absolute inset-0">
              <div className="absolute top-20 left-10 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-float"></div>
              <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-float" style={{animationDelay: '2s'}}></div>
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-blue-400/10 rounded-full blur-3xl animate-pulse"></div>
            </div>
            <div className="relative mobile-container py-12 sm:py-16 md:py-24">
              <div className="text-center">
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-bold leading-tight text-white mb-6 sm:mb-8 animate-fade-in">
                  مرحباً بك في <span className="text-yellow-300 animate-glow">زوميغا</span>
                </h1>
                <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-blue-100 mb-8 sm:mb-12 max-w-4xl mx-auto leading-relaxed animate-slide-up px-4">
                  منصتك الشاملة للترفيه والمعلومات - قنوات تلفزيونية مباشرة، ألعاب تفاعلية مثيرة، مقالات مفيدة، وتجارب رقمية استثنائية
                </p>
                <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center animate-bounce-in px-4">
                  <Link href="/auth/register" className="mobile-button bg-gradient-to-r from-yellow-400 to-orange-500 text-black shadow-2xl hover:shadow-yellow-500/25 w-full sm:w-auto">
                    <span className="flex items-center justify-center gap-3">
                      <Star className="w-5 h-5" />
                      ابدأ الآن مجاناً
                    </span>
                  </Link>
                  <Link href="/auth/login" className="glass-morphism text-white mobile-button transition-all duration-300 hover:bg-white/20 border border-white/30 w-full sm:w-auto">
                    <span className="flex items-center justify-center gap-3">
                      <User className="w-5 h-5" />
                      تسجيل الدخول
                    </span>
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Modern Features Grid */}
          <div className="py-32 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 relative overflow-hidden">
            <div className="absolute inset-0">
              <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-500/5 to-purple-500/5"></div>
            </div>
            <div className="relative mobile-container">
              <div className="text-center mb-12 sm:mb-16 md:mb-20">
                <h2 className="responsive-heading gradient-text mb-4 sm:mb-6">
                  اكتشف عالماً من الترفيه والإبداع
                </h2>
                <p className="responsive-text text-muted max-w-4xl mx-auto leading-relaxed px-4">
                  استمتع بتجربة فريدة ومتطورة تجمع بين أفضل المحتوى العربي والعالمي في منصة واحدة متكاملة
                </p>
              </div>
              <div className="modern-grid-2 lg:grid-cols-4">
                <div className="mobile-card floating-element group p-6">
                  <div className="w-16 sm:w-20 h-16 sm:h-20 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl flex items-center justify-center mb-4 sm:mb-6 mx-auto group-hover:scale-110 transition-transform duration-300">
                    <Tv className="w-8 sm:w-10 h-8 sm:h-10 bg-gradient-to-br from-blue-500 to-cyan-500 bg-clip-text text-transparent" />
                  </div>
                  <h3 className="mobile-title text-gray-900 mb-3 sm:mb-4 text-center">قنوات مباشرة</h3>
                  <p className="mobile-subtitle text-center leading-relaxed">مئات القنوات العربية والعالمية بجودة عالية ومحتوى متنوع</p>
                  <div className="mt-4 sm:mt-6 h-1 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
                </div>
                <div className="mobile-card floating-element group p-6">
                  <div className="w-16 sm:w-20 h-16 sm:h-20 bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl flex items-center justify-center mb-4 sm:mb-6 mx-auto group-hover:scale-110 transition-transform duration-300">
                    <Gamepad2 className="w-8 sm:w-10 h-8 sm:h-10 bg-gradient-to-br from-purple-500 to-pink-500 bg-clip-text text-transparent" />
                  </div>
                  <h3 className="mobile-title text-gray-900 mb-3 sm:mb-4 text-center">ألعاب تفاعلية</h3>
                  <p className="mobile-subtitle text-center leading-relaxed">ألعاب مسلية ومثيرة لجميع الأعمار مع تحديات يومية</p>
                  <div className="mt-4 sm:mt-6 h-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
                </div>
                <div className="mobile-card floating-element group p-6">
                  <div className="w-16 sm:w-20 h-16 sm:h-20 bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl flex items-center justify-center mb-4 sm:mb-6 mx-auto group-hover:scale-110 transition-transform duration-300">
                    <FileText className="w-8 sm:w-10 h-8 sm:h-10 bg-gradient-to-br from-green-500 to-emerald-500 bg-clip-text text-transparent" />
                  </div>
                  <h3 className="mobile-title text-gray-900 mb-3 sm:mb-4 text-center">مقالات مفيدة</h3>
                  <p className="mobile-subtitle text-center leading-relaxed">محتوى تعليمي وثقافي متنوع من أفضل الكتاب والخبراء</p>
                  <div className="mt-4 sm:mt-6 h-1 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
                </div>
                <div className="mobile-card floating-element group p-6">
                  <div className="w-16 sm:w-20 h-16 sm:h-20 bg-gradient-to-br from-orange-50 to-red-50 rounded-2xl flex items-center justify-center mb-4 sm:mb-6 mx-auto group-hover:scale-110 transition-transform duration-300">
                    <Gift className="w-8 sm:w-10 h-8 sm:h-10 bg-gradient-to-br from-orange-500 to-red-500 bg-clip-text text-transparent" />
                  </div>
                  <h3 className="mobile-title text-gray-900 mb-3 sm:mb-4 text-center">هدايا وجوائز</h3>
                  <p className="mobile-subtitle text-center leading-relaxed">اربح جوائز قيمة يومياً واستمتع بعروض حصرية مميزة</p>
                  <div className="mt-4 sm:mt-6 h-1 bg-gradient-to-r from-orange-500 to-red-500 rounded-full transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    )
  }

  // Show authenticated user homepage
  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 dark:from-slate-900 dark:via-slate-900/70 dark:to-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Hero Banner Ad */}
          <div className="mb-8">
            <BannerAd position="header" />
          </div>

          {/* Stats Grid */}
          {isLoading('stats') ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 sm:gap-6 mt-8">
              {Array.from({ length: 5 }).map((_, index) => (
                <StatCardSkeleton key={index} />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 sm:gap-6 mt-8">
              <div className="interactive-card bg-white/95 backdrop-blur-lg rounded-2xl sm:rounded-3xl shadow-soft p-4 sm:p-6 md:p-8 border border-white/30 hover:shadow-glow transition-all duration-500 group cursor-pointer transform hover:-translate-y-2 animate-slide-up">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary-400 via-blue-400 to-secondary-400 rounded-2xl blur-lg opacity-20 group-hover:opacity-40 transition-opacity duration-300"></div>
                  <div className="relative bg-gradient-to-br from-primary-500 via-blue-600 to-secondary-500 rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-5 mb-4 sm:mb-6 shadow-medium">
                    <Tv className="h-6 w-6 sm:h-8 sm:w-8 md:h-10 md:w-10 text-white group-hover:scale-125 transition-transform duration-300" />
                  </div>
                </div>
                <p className="text-xs sm:text-sm font-bold text-dark-700 mb-2 sm:mb-3 tracking-wide">إجمالي القنوات</p>
                <p className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-gradient bg-gradient-to-r from-primary-600 to-secondary-600 group-hover:scale-110 transition-transform duration-300">{stats.totalChannels}</p>
                <div className="w-full bg-gray-200/60 rounded-full h-3 mt-4 overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full w-4/5 animate-pulse-soft shadow-soft"></div>
                </div>
              </div>

              <div className="interactive-card bg-white/95 backdrop-blur-lg rounded-2xl sm:rounded-3xl shadow-soft p-4 sm:p-6 md:p-8 border border-white/30 hover:shadow-glow transition-all duration-500 group cursor-pointer transform hover:-translate-y-2 animate-slide-up" style={{animationDelay: '0.2s'}}>
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-success-400 via-emerald-400 to-accent-400 rounded-2xl blur-lg opacity-20 group-hover:opacity-40 transition-opacity duration-300"></div>
                  <div className="relative bg-gradient-to-br from-success-500 via-emerald-600 to-accent-500 rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-5 mb-4 sm:mb-6 shadow-medium">
                    <Users className="h-6 w-6 sm:h-8 sm:w-8 md:h-10 md:w-10 text-white group-hover:scale-125 transition-transform duration-300" />
                  </div>
                </div>
                <p className="text-xs sm:text-sm font-bold text-dark-700 mb-2 sm:mb-3 tracking-wide">القنوات المباشرة</p>
                <p className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-gradient bg-gradient-to-r from-success-600 to-accent-600 group-hover:scale-110 transition-transform duration-300">{stats.liveChannels}</p>
                <div className="w-full bg-gray-200/60 rounded-full h-3 mt-4 overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-success-500 to-accent-500 rounded-full w-3/5 animate-pulse-soft shadow-soft"></div>
                </div>
              </div>

              <div className="interactive-card bg-white/95 backdrop-blur-lg rounded-2xl sm:rounded-3xl shadow-soft p-4 sm:p-6 md:p-8 border border-white/30 hover:shadow-glow transition-all duration-500 group cursor-pointer transform hover:-translate-y-2 animate-slide-up" style={{animationDelay: '0.3s'}}>
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-secondary-400 via-purple-400 to-primary-400 rounded-2xl blur-lg opacity-20 group-hover:opacity-40 transition-opacity duration-300"></div>
                  <div className="relative bg-gradient-to-br from-secondary-500 via-purple-600 to-primary-500 rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-5 mb-4 sm:mb-6 shadow-medium">
                    <FileText className="h-6 w-6 sm:h-8 sm:w-8 md:h-10 md:w-10 text-white group-hover:scale-125 transition-transform duration-300" />
                  </div>
                </div>
                <p className="text-xs sm:text-sm font-bold text-dark-700 mb-2 sm:mb-3 tracking-wide">المقالات</p>
                <p className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-gradient bg-gradient-to-r from-secondary-600 to-primary-600 group-hover:scale-110 transition-transform duration-300">{stats.articles}</p>
                <div className="w-full bg-gray-200/60 rounded-full h-3 mt-4 overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-secondary-500 to-primary-500 rounded-full w-2/3 animate-pulse-soft shadow-soft"></div>
                </div>
              </div>

              <div className="interactive-card bg-white/95 backdrop-blur-lg rounded-2xl sm:rounded-3xl shadow-soft p-4 sm:p-6 md:p-8 border border-white/30 hover:shadow-glow transition-all duration-500 group cursor-pointer transform hover:-translate-y-2 animate-slide-up" style={{animationDelay: '0.4s'}}>
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-accent-400 via-orange-400 to-warning-400 rounded-2xl blur-lg opacity-20 group-hover:opacity-40 transition-opacity duration-300"></div>
                  <div className="relative bg-gradient-to-br from-accent-500 via-orange-600 to-warning-500 rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-5 mb-4 sm:mb-6 shadow-medium">
                    <Gamepad2 className="h-6 w-6 sm:h-8 sm:w-8 md:h-10 md:w-10 text-white group-hover:scale-125 transition-transform duration-300" />
                  </div>
                </div>
                <p className="text-xs sm:text-sm font-bold text-dark-700 mb-2 sm:mb-3 tracking-wide">الألعاب التفاعلية</p>
                <p className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-gradient bg-gradient-to-r from-accent-600 to-warning-600 group-hover:scale-110 transition-transform duration-300">{stats.games}</p>
                <div className="w-full bg-gray-200/60 rounded-full h-3 mt-4 overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-accent-500 to-warning-500 rounded-full w-3/4 animate-pulse-soft shadow-soft"></div>
                </div>
              </div>

              <div className="interactive-card bg-white/95 backdrop-blur-lg rounded-2xl sm:rounded-3xl shadow-soft p-4 sm:p-6 md:p-8 border border-white/30 hover:shadow-glow transition-all duration-500 group cursor-pointer transform hover:-translate-y-2 animate-slide-up" style={{animationDelay: '0.5s'}}>
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-error-400 via-pink-400 to-accent-400 rounded-2xl blur-lg opacity-20 group-hover:opacity-40 transition-opacity duration-300"></div>
                  <div className="relative bg-gradient-to-br from-error-500 via-pink-600 to-accent-500 rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-5 mb-4 sm:mb-6 shadow-medium">
                    <Eye className="h-6 w-6 sm:h-8 sm:w-8 md:h-10 md:w-10 text-white group-hover:scale-125 transition-transform duration-300" />
                  </div>
                </div>
                <p className="text-xs sm:text-sm font-bold text-dark-700 mb-2 sm:mb-3 tracking-wide">إجمالي المشاهدات</p>
                <p className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-gradient bg-gradient-to-r from-error-600 to-accent-600 group-hover:scale-110 transition-transform duration-300">{(stats.totalViews / 1000000).toFixed(1)}M</p>
                <div className="w-full bg-gray-200/60 rounded-full h-3 mt-4 overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-error-500 to-accent-500 rounded-full w-4/5 animate-pulse-soft shadow-soft"></div>
                </div>
              </div>
            </div>
          )}

          {/* Inline Ad between Stats and Quick Actions */}
          <div className="mt-8 mb-8">
            <InlineAd position="content" size="medium" />
          </div>

          {/* Enhanced Quick Actions */}
          <div className="mt-8">
            <div className="modern-card p-4 sm:p-6 md:p-8">
              <h2 className="responsive-heading mb-6 sm:mb-8 flex items-center justify-center sm:justify-start gap-3">
                <div className="w-8 sm:w-10 h-8 sm:h-10 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center">
                  <Zap className="w-4 sm:w-6 h-4 sm:h-6 text-white" />
                </div>
                الوصول السريع
              </h2>
              <div className="modern-grid-2 lg:grid-cols-4">
                <Link href="/channels" className="mobile-card floating-element group p-4 sm:p-6 hover:scale-105 transition-all duration-300">
                  <div className="text-center">
                    <div className="w-12 sm:w-16 h-12 sm:h-16 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4 group-hover:scale-110 transition-transform duration-300">
                      <Tv className="w-6 sm:w-8 h-6 sm:h-8 bg-gradient-to-br from-blue-500 to-cyan-500 bg-clip-text text-transparent" />
                    </div>
                    <h3 className="mobile-title text-gray-900 mb-2">القنوات التلفزيونية</h3>
                    <p className="mobile-subtitle text-muted mb-3">قنوات متنوعة</p>
                    <span className="status-indicator bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium">
                      150+
                    </span>
                  </div>
                  <div className="mt-3 sm:mt-4 h-1 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
                </Link>
                
                <Link href="/games" className="mobile-card floating-element group p-4 sm:p-6 hover:scale-105 transition-all duration-300">
                  <div className="text-center">
                    <div className="w-12 sm:w-16 h-12 sm:h-16 bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4 group-hover:scale-110 transition-transform duration-300">
                      <Gamepad2 className="w-6 sm:w-8 h-6 sm:h-8 bg-gradient-to-br from-purple-500 to-pink-500 bg-clip-text text-transparent" />
                    </div>
                    <h3 className="mobile-title text-gray-900 mb-2">الألعاب التفاعلية</h3>
                    <p className="mobile-subtitle text-muted mb-3">ألعاب مسلية</p>
                    <span className="status-indicator bg-gradient-to-r from-purple-500 to-pink-500 text-white px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium">
                      25+
                    </span>
                  </div>
                  <div className="mt-3 sm:mt-4 h-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
                </Link>
                 
                <Link href="/articles" className="mobile-card floating-element group p-4 sm:p-6 hover:scale-105 transition-all duration-300">
                  <div className="text-center">
                    <div className="w-12 sm:w-16 h-12 sm:h-16 bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4 group-hover:scale-110 transition-transform duration-300">
                      <FileText className="w-6 sm:w-8 h-6 sm:h-8 bg-gradient-to-br from-green-500 to-emerald-500 bg-clip-text text-transparent" />
                    </div>
                    <h3 className="mobile-title text-gray-900 mb-2">المقالات المفيدة</h3>
                    <p className="mobile-subtitle text-muted mb-3">محتوى ثري</p>
                    <span className="status-indicator bg-gradient-to-r from-green-500 to-emerald-500 text-white px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium">
                      500+
                    </span>
                  </div>
                  <div className="mt-3 sm:mt-4 h-1 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
                </Link>
                 
                <Link href="/gifts" className="mobile-card floating-element group p-4 sm:p-6 hover:scale-105 transition-all duration-300">
                  <div className="text-center">
                    <div className="w-12 sm:w-16 h-12 sm:h-16 bg-gradient-to-br from-orange-50 to-red-50 rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4 group-hover:scale-110 transition-transform duration-300">
                      <Gift className="w-6 sm:w-8 h-6 sm:h-8 bg-gradient-to-br from-orange-500 to-red-500 bg-clip-text text-transparent" />
                    </div>
                    <h3 className="mobile-title text-gray-900 mb-2">الهدايا والجوائز</h3>
                    <p className="mobile-subtitle text-muted mb-3">عروض حصرية</p>
                    <span className="status-indicator bg-gradient-to-r from-orange-500 to-red-500 text-white px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium">
                      جديد
                    </span>
                  </div>
                  <div className="mt-3 sm:mt-4 h-1 bg-gradient-to-r from-orange-500 to-red-500 rounded-full transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
                </Link>
              </div>
            </div>
          </div>

          {/* Enhanced Contact Us Section */}
          <div className="mt-12">
            <div className="modern-card p-10 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
              <div className="text-center mb-12">
                <h2 className="heading-secondary gradient-text mb-6 flex items-center justify-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center animate-pulse">
                    <Mail className="w-7 h-7 text-white" />
                  </div>
                  تواصل معنا
                </h2>
                <p className="text-xl text-muted max-w-3xl mx-auto leading-relaxed">
                  نحن هنا لمساعدتك في أي وقت! فريق الدعم الفني متاح على مدار الساعة لتقديم أفضل خدمة
                </p>
              </div>
              
              <div className="modern-grid">
                {/* Email Card */}
                <div className="modern-card floating-element group">
                  <div className="text-center">
                    <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                      <Mail className="w-10 h-10 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">البريد الإلكتروني</h3>
                    <p className="text-lg text-muted mb-6">support@zomiga.com</p>
                    <a href="mailto:support@zomiga.com" className="modern-button bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                      <span className="flex items-center gap-3">
                        <Mail className="w-5 h-5" />
                        إرسال رسالة
                      </span>
                    </a>
                  </div>
                </div>

                {/* Phone Card */}
                <div className="modern-card floating-element group">
                  <div className="text-center">
                    <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                      <Phone className="w-10 h-10 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">الهاتف</h3>
                    <p className="text-lg text-muted mb-6">+966 50 123 4567</p>
                    <a href="tel:+966501234567" className="modern-button bg-gradient-to-r from-green-500 to-green-600 text-white">
                      <span className="flex items-center gap-3">
                        <Phone className="w-5 h-5" />
                        اتصل بنا
                      </span>
                    </a>
                  </div>
                </div>

                {/* Telegram Card */}
                <div className="modern-card floating-element group">
                  <div className="text-center">
                    <div className="w-20 h-20 bg-gradient-to-br from-blue-400 to-blue-500 rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                      <Send className="w-10 h-10 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">تليغرام</h3>
                    <p className="text-lg text-muted mb-6">@ZomigaSupport</p>
                    <a href="https://t.me/ZomigaSupport" target="_blank" rel="noopener noreferrer" className="modern-button bg-gradient-to-r from-blue-400 to-blue-500 text-white">
                      <span className="flex items-center gap-3">
                        <Send className="w-5 h-5" />
                        تواصل معنا
                      </span>
                    </a>
                  </div>
                </div>
              </div>

              {/* Additional Info */}
              <div className="mt-12 text-center">
                <div className="glass-morphism inline-flex items-center gap-3 px-8 py-4 rounded-2xl border border-white/30">
                  <MapPin className="w-6 h-6 text-blue-600" />
                  <span className="text-gray-700 font-semibold text-lg">الرياض، المملكة العربية السعودية</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Content Ad */}
          <div className="mt-8">
            <CardAd position="content-bottom" />
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default HomePage;