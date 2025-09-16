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
  console.log('🏠 HomePage: Component initializing')
  const { user, loading: authLoading } = useAuth()
  console.log('🏠 HomePage: Auth state:', { user: !!user, authLoading })
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
    console.log('🏠 HomePage: useEffect triggered, authLoading:', authLoading)
    if (!authLoading) {
      console.log('🏠 HomePage: Auth loading complete, starting data loading...')
      // Simulate API calls with realistic delays
      
      // Load stats
      setTimeout(() => {
        console.log('📊 HomePage: Loading stats...')
        setStats({
          totalChannels: 150,
          liveChannels: 45,
          totalViews: 2500000,
          articles: 1250,
          games: 85
        })
        setLoading(prev => ({ ...prev, stats: false }))
        console.log('✅ HomePage: Stats loaded')
      }, 800)

      // Load channels
      setTimeout(() => {
        console.log('📺 HomePage: Loading channels...')
        setChannels(sampleChannels)
        setLoading(prev => ({ ...prev, channels: false }))
        console.log('✅ HomePage: Channels loaded')
      }, 1200)

      // Page fully loaded
      setTimeout(() => {
        console.log('🎉 HomePage: Page fully loaded')
        setLoading(prev => ({ ...prev, page: false }))
      }, 1500)
    } else {
      console.log('⏳ HomePage: Waiting for auth to complete...')
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
          {/* Enhanced Modern Hero Section */}
          <div className="relative overflow-hidden min-h-screen flex items-center">
            {/* Premium Gradient Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 opacity-95"></div>
            
            {/* Floating Elements - Responsive */}
            <div className="absolute inset-0">
              <div className="absolute top-10 sm:top-20 left-10 sm:left-20 w-48 sm:w-64 md:w-80 lg:w-96 h-48 sm:h-64 md:h-80 lg:h-96 bg-gradient-to-br from-purple-400/30 to-pink-400/30 rounded-full animate-float filter blur-2xl sm:blur-3xl"></div>
              <div className="absolute top-20 sm:top-40 right-10 sm:right-20 w-40 sm:w-60 md:w-80 h-40 sm:h-60 md:h-80 bg-gradient-to-br from-blue-400/30 to-cyan-400/30 rounded-full animate-float filter blur-xl sm:blur-2xl" style={{animationDelay: '2s'}}></div>
              <div className="absolute bottom-10 sm:bottom-20 left-1/4 sm:left-1/3 w-36 sm:w-48 md:w-72 h-36 sm:h-48 md:h-72 bg-gradient-to-br from-orange-400/30 to-amber-400/30 rounded-full animate-pulse filter blur-lg sm:blur-xl"></div>
            </div>
            
            {/* Glass Effect Overlay */}
            <div className="absolute inset-0 bg-white/5 backdrop-blur-sm"></div>
            
            <div className="relative responsive-padding py-12 sm:py-16 md:py-24">
              <div className="text-center responsive-container">
                <div className="animate-fade-in">
                  <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight text-white mb-4 sm:mb-6 md:mb-8">
                    مرحباً بك في
                    <span className="block bg-gradient-to-r from-purple-300 via-pink-300 to-orange-300 bg-clip-text text-transparent animate-pulse">
                      زوميغا
                    </span>
                  </h1>
                </div>
                
                <div className="animate-slide-up" style={{animationDelay: '300ms'}}>
                  <p className="text-sm sm:text-lg md:text-xl lg:text-2xl text-white/90 mb-6 sm:mb-8 md:mb-12 responsive-container leading-relaxed font-light">
                    منصتك الشاملة للترفيه والمعلومات - قنوات تلفزيونية مباشرة، ألعاب تفاعلية مثيرة، مقالات مفيدة، وتجارب رقمية استثنائية
                  </p>
                </div>
                
                <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 animate-bounce-in" style={{animationDelay: '600ms'}}>
                  <Link href="/auth/register" className="group px-4 py-2 sm:px-6 sm:py-3 md:px-8 md:py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold hover:from-purple-700 hover:to-pink-700 transform hover:scale-105 transition-all duration-500 shadow-2xl hover:shadow-purple-500/25 rounded-lg sm:rounded-xl">
                    <span className="flex items-center justify-center gap-2 sm:gap-3">
                      <Star className="w-4 sm:w-5 md:w-6 h-4 sm:h-5 md:h-6 group-hover:rotate-12 transition-transform" />
                      <span className="text-sm sm:text-base md:text-lg">ابدأ الآن مجاناً</span>
                      <svg className="w-4 sm:w-5 md:w-6 h-4 sm:h-5 md:h-6 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </span>
                  </Link>
                  <Link href="/auth/login" className="px-4 py-2 sm:px-6 sm:py-3 md:px-8 md:py-4 bg-white/10 backdrop-blur-xl text-white font-bold hover:bg-white/20 transition-all duration-500 border-2 border-white/30 hover:border-white/60 rounded-lg sm:rounded-xl">
                    <span className="flex items-center justify-center gap-2 sm:gap-3">
                      <User className="w-4 sm:w-5 md:w-6 h-4 sm:h-5 md:h-6" />
                      <span className="text-sm sm:text-base md:text-lg">تسجيل الدخول</span>
                    </span>
                  </Link>
                </div>
                
                {/* Floating Stats - Responsive */}
                <div className="mt-8 sm:mt-12 md:mt-16 grid grid-cols-3 gap-3 sm:gap-4 animate-fade-in" style={{animationDelay: '1000ms'}}>
                  <div className="bg-white/10 backdrop-blur-xl text-center hover:bg-white/20 transition-all duration-300 transform hover:-translate-y-2 rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-6">
                    <div className="text-lg sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-purple-300 to-pink-300 bg-clip-text text-transparent">1000+</div>
                    <div className="text-white/80 mt-1 sm:mt-2 text-xs sm:text-sm md:text-base">مستخدم نشط</div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-xl text-center hover:bg-white/20 transition-all duration-300 transform hover:-translate-y-2 rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-6">
                    <div className="text-lg sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-300 to-cyan-300 bg-clip-text text-transparent">500+</div>
                    <div className="text-white/80 mt-1 sm:mt-2 text-xs sm:text-sm md:text-base">محتوى مميز</div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-xl text-center hover:bg-white/20 transition-all duration-300 transform hover:-translate-y-2 rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-6">
                    <div className="text-lg sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-orange-300 to-amber-300 bg-clip-text text-transparent">24/7</div>
                    <div className="text-white/80 mt-1 sm:mt-2 text-xs sm:text-sm md:text-base">دعم متواصل</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Modern Features Grid */}
          <div className="py-16 sm:py-24 lg:py-32 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 relative overflow-hidden">
            <div className="absolute inset-0">
              <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-500/5 to-purple-500/5"></div>
            </div>
            <div className="relative responsive-padding">
              <div className="text-center mb-12 sm:mb-16 md:mb-20">
                <div className="animate-scale-in">
                  <h2 className="responsive-title font-bold bg-gradient-to-r from-gray-900 via-purple-900 to-gray-900 bg-clip-text text-transparent mb-6 sm:mb-8">
                    اكتشف عالماً من الترفيه والإبداع
                  </h2>
                </div>
                <div className="animate-slide-in-left animation-delay-300">
                  <p className="text-lg sm:text-xl lg:text-2xl text-gray-600 responsive-container leading-relaxed font-light">
                    استمتع بتجربة فريدة ومتطورة تجمع بين أفضل المحتوى العربي والعالمي في منصة واحدة متكاملة
                  </p>
                </div>
              </div>
              <div className="grid-auto-fit-large">
                <div className="card-responsive floating-element group hover-lift hover-glow animate-slide-in-left animation-delay-500">
                  <div className="relative mb-6 sm:mb-8">
                    <div className="w-16 sm:w-20 h-16 sm:h-20 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl sm:rounded-3xl flex items-center justify-center mx-auto group-hover:scale-110 transition-all duration-500 shadow-lg">
                      <Tv className="w-8 sm:w-10 h-8 sm:h-10 text-white" />
                    </div>
                    <div className="absolute -top-1 sm:-top-2 -right-1 sm:-right-2 w-5 sm:w-6 h-5 sm:h-6 bg-green-400 rounded-full animate-pulse"></div>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4 text-center group-hover:text-blue-600 transition-colors">قنوات مباشرة</h3>
                  <p className="text-sm sm:text-base text-gray-600 text-center leading-relaxed mb-4 sm:mb-6">مئات القنوات العربية والعالمية بجودة عالية ومحتوى متنوع على مدار الساعة</p>
                  <div className="flex items-center justify-center text-blue-600 font-semibold group-hover:translate-x-2 transition-transform text-sm sm:text-base">
                    <span>اكتشف المزيد</span>
                    <svg className="w-4 sm:w-5 h-4 sm:h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </div>
                </div>
                <div className="card-responsive floating-element group hover-lift hover-glow animate-slide-in-left animation-delay-700">
                  <div className="relative mb-6 sm:mb-8">
                    <div className="w-16 sm:w-20 h-16 sm:h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl sm:rounded-3xl flex items-center justify-center mx-auto group-hover:scale-110 transition-all duration-500 shadow-lg">
                      <Gamepad2 className="w-8 sm:w-10 h-8 sm:h-10 text-white" />
                    </div>
                    <div className="absolute -top-1 sm:-top-2 -right-1 sm:-right-2 w-5 sm:w-6 h-5 sm:h-6 bg-pink-400 rounded-full animate-bounce"></div>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4 text-center group-hover:text-purple-600 transition-colors">ألعاب تفاعلية</h3>
                  <p className="text-sm sm:text-base text-gray-600 text-center leading-relaxed mb-4 sm:mb-6">ألعاب مسلية ومثيرة لجميع الأعمار مع تحديات يومية والمثيرة</p>
                  <div className="flex items-center justify-center text-purple-600 font-semibold group-hover:translate-x-2 transition-transform text-sm sm:text-base">
                    <span>ابدأ اللعب</span>
                    <svg className="w-4 sm:w-5 h-4 sm:h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </div>
                </div>
                <div className="card-responsive floating-element group hover-lift hover-glow animate-slide-in-right animation-delay-900">
                  <div className="relative mb-6 sm:mb-8">
                    <div className="w-16 sm:w-20 h-16 sm:h-20 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl sm:rounded-3xl flex items-center justify-center mx-auto group-hover:scale-110 transition-all duration-500 shadow-lg">
                      <FileText className="w-8 sm:w-10 h-8 sm:h-10 text-white" />
                    </div>
                    <div className="absolute -top-1 sm:-top-2 -right-1 sm:-right-2 w-5 sm:w-6 h-5 sm:h-6 bg-emerald-400 rounded-full animate-pulse"></div>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4 text-center group-hover:text-emerald-600 transition-colors">مقالات مفيدة</h3>
                  <p className="text-sm sm:text-base text-gray-600 text-center leading-relaxed mb-4 sm:mb-6">محتوى تعليمي وثقافي متنوع من أفضل الكتاب والخبراء والتخصصات</p>
                  <div className="flex items-center justify-center text-emerald-600 font-semibold group-hover:translate-x-2 transition-transform text-sm sm:text-base">
                    <span>اقرأ الآن</span>
                    <svg className="w-4 sm:w-5 h-4 sm:h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </div>
                </div>
                <div className="card-responsive floating-element group hover-lift hover-glow animate-slide-in-right animation-delay-1100">
                  <div className="relative mb-6 sm:mb-8">
                    <div className="w-16 sm:w-20 h-16 sm:h-20 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl sm:rounded-3xl flex items-center justify-center mx-auto group-hover:scale-110 transition-all duration-500 shadow-lg">
                      <Gift className="w-8 sm:w-10 h-8 sm:h-10 text-white" />
                    </div>
                    <div className="absolute -top-1 sm:-top-2 -right-1 sm:-right-2 w-5 sm:w-6 h-5 sm:h-6 bg-amber-400 rounded-full animate-bounce"></div>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4 text-center group-hover:text-orange-600 transition-colors">هدايا وجوائز</h3>
                  <p className="text-sm sm:text-base text-gray-600 text-center leading-relaxed mb-4 sm:mb-6">اربح جوائز قيمة يومياً واستمتع بعروض حصرية مميزة والمستمر</p>
                  <div className="flex items-center justify-center text-orange-600 font-semibold group-hover:translate-x-2 transition-transform text-sm sm:text-base">
                    <span>احصل على هديتك</span>
                    <svg className="w-4 sm:w-5 h-4 sm:h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  // Show authenticated user homepage
  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Welcome Hero Section */}
          <div className="relative overflow-hidden mb-12">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-purple-600/10 to-pink-600/10 dark:from-blue-600/5 dark:via-purple-600/5 dark:to-pink-600/5 rounded-3xl"></div>
            <div className="relative bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-3xl border border-gray-200/50 dark:border-slate-700/50 shadow-xl p-8 md:p-12">
              <div className="text-center">
                <div className="mb-6">
                  <div className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full shadow-lg mb-4">
                    <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold text-sm">Z</span>
                    </div>
                    <span className="text-sm font-medium text-white">أهلاً وسهلاً {user?.name || 'بك'}</span>
                  </div>
                </div>
                <h1 className="text-4xl md:text-6xl font-bold mb-6">
                  <span className="bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 dark:from-white dark:via-blue-200 dark:to-purple-200 bg-clip-text text-transparent">
                    استكشف عالم
                  </span>
                  <br />
                  <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                    zomiga
                  </span>
                </h1>
                <p className="text-xl md:text-2xl mb-8 text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
                  اكتشف أحدث القنوات التلفزيونية، العب ألعاباً تفاعلية مثيرة، واقرأ مقالات مفيدة في مكان واحد
                </p>
              </div>
            </div>
          </div>

          {/* Hero Banner Ad */}
          <div className="mb-8">
            <BannerAd position="header" />
          </div>

          {/* Enhanced Premium Stats Grid */}
          {isLoading('stats') ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 sm:gap-6 mt-8">
              {Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-xl p-4 sm:p-6 md:p-8 border border-gray-200/50 dark:border-slate-700/50 animate-pulse">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 bg-gray-200 dark:bg-slate-700 rounded-xl sm:rounded-2xl mx-auto mb-4 sm:mb-6"></div>
                  <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded mb-2 sm:mb-3"></div>
                  <div className="h-6 sm:h-8 md:h-10 bg-gray-200 dark:bg-slate-700 rounded mb-4"></div>
                  <div className="h-3 bg-gray-200 dark:bg-slate-700 rounded"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="mb-12">
              <div className="text-center mb-12">
                <div className="animate-scale-in">
                  <h2 className="text-4xl md:text-5xl font-bold mb-6">
                    <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                      إحصائيات المنصة المتقدمة
                    </span>
                  </h2>
                </div>
                <div className="animate-slide-in-left animation-delay-300">
                  <p className="text-xl text-gray-600 dark:text-gray-300 max-w-4xl mx-auto leading-relaxed">أرقام تعكس نجاح وتطور منصة zomiga وتفاعل المستخدمين المستمر</p>
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 sm:gap-6">
              <div className="group bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-xl p-4 sm:p-6 md:p-8 border border-gray-200/50 dark:border-slate-700/50 hover:shadow-2xl transition-all duration-500 cursor-pointer transform hover:-translate-y-3 animate-slide-up hover-glow">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/30 via-blue-400/30 to-purple-500/30 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div className="relative bg-gradient-to-br from-blue-500 via-blue-600 to-purple-500 rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-5 mb-4 sm:mb-6 shadow-2xl group-hover:shadow-blue-500/25">
                    <Tv className="h-6 w-6 sm:h-8 sm:w-8 md:h-10 md:w-10 text-white group-hover:scale-125 group-hover:rotate-12 transition-all duration-500" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-4 h-4 sm:w-5 sm:h-5 bg-green-400 rounded-full animate-pulse shadow-lg"></div>
                </div>
                <p className="text-xs sm:text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 sm:mb-3 tracking-wide group-hover:text-blue-600 transition-colors">إجمالي القنوات</p>
                <p className="text-2xl sm:text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent group-hover:scale-110 transition-transform duration-500">{stats.totalChannels}</p>
                <div className="w-full bg-gray-200/60 dark:bg-slate-700/60 rounded-full h-2 sm:h-3 mt-4 overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full w-4/5 animate-pulse shadow-sm group-hover:w-full transition-all duration-1000"></div>
                </div>
                <div className="mt-4 text-xs text-gray-500 dark:text-gray-400 group-hover:text-blue-500 transition-colors">+12% هذا الشهر</div>
              </div>

              <div className="group bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-xl p-4 sm:p-6 md:p-8 border border-gray-200/50 dark:border-slate-700/50 hover:shadow-2xl transition-all duration-500 cursor-pointer transform hover:-translate-y-3 animate-slide-up hover-glow" style={{animationDelay: '0.2s'}}>
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-green-500/30 via-emerald-400/30 to-teal-500/30 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div className="relative bg-gradient-to-br from-green-500 via-emerald-600 to-teal-500 rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-5 mb-4 sm:mb-6 shadow-2xl group-hover:shadow-green-500/25">
                    <Users className="h-6 w-6 sm:h-8 sm:w-8 md:h-10 md:w-10 text-white group-hover:scale-125 group-hover:rotate-12 transition-all duration-500" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-4 h-4 sm:w-5 sm:h-5 bg-emerald-400 rounded-full animate-bounce shadow-lg"></div>
                </div>
                <p className="text-xs sm:text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 sm:mb-3 tracking-wide group-hover:text-green-600 transition-colors">القنوات المباشرة</p>
                <p className="text-2xl sm:text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent group-hover:scale-110 transition-transform duration-500">{stats.liveChannels}</p>
                <div className="w-full bg-gray-200/60 dark:bg-slate-700/60 rounded-full h-2 sm:h-3 mt-4 overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-green-500 to-teal-500 rounded-full w-3/5 animate-pulse shadow-sm group-hover:w-full transition-all duration-1000"></div>
                </div>
                <div className="mt-4 text-xs text-gray-500 dark:text-gray-400 group-hover:text-green-500 transition-colors">+8% هذا الأسبوع</div>
              </div>

              <div className="group bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-xl p-4 sm:p-6 md:p-8 border border-gray-200/50 dark:border-slate-700/50 hover:shadow-2xl transition-all duration-500 cursor-pointer transform hover:-translate-y-3 animate-slide-up hover-glow" style={{animationDelay: '0.3s'}}>
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500/30 via-purple-400/30 to-indigo-500/30 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div className="relative bg-gradient-to-br from-purple-500 via-purple-600 to-indigo-500 rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-5 mb-4 sm:mb-6 shadow-2xl group-hover:shadow-purple-500/25">
                    <FileText className="h-6 w-6 sm:h-8 sm:w-8 md:h-10 md:w-10 text-white group-hover:scale-125 group-hover:rotate-12 transition-all duration-500" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-4 h-4 sm:w-5 sm:h-5 bg-purple-400 rounded-full animate-pulse shadow-lg"></div>
                </div>
                <p className="text-xs sm:text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 sm:mb-3 tracking-wide group-hover:text-purple-600 transition-colors">المقالات</p>
                <p className="text-2xl sm:text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent group-hover:scale-110 transition-transform duration-500">{stats.articles}</p>
                <div className="w-full bg-gray-200/60 dark:bg-slate-700/60 rounded-full h-2 sm:h-3 mt-4 overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full w-2/3 animate-pulse shadow-sm group-hover:w-full transition-all duration-1000"></div>
                </div>
                <div className="mt-4 text-xs text-gray-500 dark:text-gray-400 group-hover:text-purple-500 transition-colors">+25% هذا الشهر</div>
              </div>

              <div className="group bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-xl p-4 sm:p-6 md:p-8 border border-gray-200/50 dark:border-slate-700/50 hover:shadow-2xl transition-all duration-500 cursor-pointer transform hover:-translate-y-3 animate-slide-up hover-glow" style={{animationDelay: '0.4s'}}>
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-orange-500/30 via-orange-400/30 to-yellow-500/30 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div className="relative bg-gradient-to-br from-orange-500 via-orange-600 to-yellow-500 rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-5 mb-4 sm:mb-6 shadow-2xl group-hover:shadow-orange-500/25">
                    <Gamepad2 className="h-6 w-6 sm:h-8 sm:w-8 md:h-10 md:w-10 text-white group-hover:scale-125 group-hover:rotate-12 transition-all duration-500" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-4 h-4 sm:w-5 sm:h-5 bg-amber-400 rounded-full animate-bounce shadow-lg"></div>
                </div>
                <p className="text-xs sm:text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 sm:mb-3 tracking-wide group-hover:text-orange-600 transition-colors">الألعاب التفاعلية</p>
                <p className="text-2xl sm:text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-orange-600 to-yellow-600 bg-clip-text text-transparent group-hover:scale-110 transition-transform duration-500">{stats.games}</p>
                <div className="w-full bg-gray-200/60 dark:bg-slate-700/60 rounded-full h-2 sm:h-3 mt-4 overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-orange-500 to-yellow-500 rounded-full w-3/4 animate-pulse shadow-sm group-hover:w-full transition-all duration-1000"></div>
                </div>
                <div className="mt-4 text-xs text-gray-500 dark:text-gray-400 group-hover:text-orange-500 transition-colors">+15% هذا الأسبوع</div>
              </div>

              <div className="group bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-xl p-4 sm:p-6 md:p-8 border border-gray-200/50 dark:border-slate-700/50 hover:shadow-2xl transition-all duration-500 cursor-pointer transform hover:-translate-y-3 animate-slide-up hover-glow" style={{animationDelay: '0.5s'}}>
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-pink-500/30 via-pink-400/30 to-rose-500/30 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div className="relative bg-gradient-to-br from-pink-500 via-pink-600 to-rose-500 rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-5 mb-4 sm:mb-6 shadow-2xl group-hover:shadow-pink-500/25">
                    <Eye className="h-6 w-6 sm:h-8 sm:w-8 md:h-10 md:w-10 text-white group-hover:scale-125 group-hover:rotate-12 transition-all duration-500" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-4 h-4 sm:w-5 sm:h-5 bg-rose-400 rounded-full animate-pulse shadow-lg"></div>
                </div>
                <p className="text-xs sm:text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 sm:mb-3 tracking-wide group-hover:text-pink-600 transition-colors">إجمالي المشاهدات</p>
                <p className="text-2xl sm:text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent group-hover:scale-110 transition-transform duration-500">{(stats.totalViews / 1000000).toFixed(1)}M</p>
                <div className="w-full bg-gray-200/60 dark:bg-slate-700/60 rounded-full h-2 sm:h-3 mt-4 overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-pink-500 to-rose-500 rounded-full w-4/5 animate-pulse shadow-sm group-hover:w-full transition-all duration-1000"></div>
                </div>
                <div className="mt-4 text-xs text-gray-500 dark:text-gray-400 group-hover:text-pink-500 transition-colors">+30% هذا الشهر</div>
              </div>
            </div>
          </div>
        )}
        
        {/* Inline Ad between Stats and Quick Actions */}
        <div className="mt-8 mb-8">
          <InlineAd position="content" size="medium" />
        </div>

        {/* Enhanced Quick Actions */}
          <div className="mb-16">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  الوصول السريع
                </span>
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300">اكتشف جميع خدماتنا بسهولة وسرعة</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                <Link href="/channels" className="group bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl rounded-2xl shadow-xl p-6 border border-gray-200/50 dark:border-slate-700/50 hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2">
                  <div className="text-center">
                    <div className="relative mb-6">
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-2xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <div className="relative w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-300">
                        <Tv className="w-8 h-8 text-white" />
                      </div>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">القنوات التلفزيونية</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">قنوات متنوعة ومباشرة</p>
                    <span className="inline-flex items-center px-3 py-1 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-full text-xs font-medium">
                      150+ قناة
                    </span>
                  </div>
                  <div className="mt-4 h-1 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
                </Link>
                
                <Link href="/games" className="group bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl rounded-2xl shadow-xl p-6 border border-gray-200/50 dark:border-slate-700/50 hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2">
                  <div className="text-center">
                    <div className="relative mb-6">
                      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-2xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <div className="relative w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-300">
                        <Gamepad2 className="w-8 h-8 text-white" />
                      </div>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">الألعاب التفاعلية</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">ألعاب مسلية وتعليمية</p>
                    <span className="inline-flex items-center px-3 py-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full text-xs font-medium">
                      25+ لعبة
                    </span>
                  </div>
                  <div className="mt-4 h-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
                </Link>
                 
                <Link href="/articles" className="group bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl rounded-2xl shadow-xl p-6 border border-gray-200/50 dark:border-slate-700/50 hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2">
                  <div className="text-center">
                    <div className="relative mb-6">
                      <div className="absolute inset-0 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-2xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <div className="relative w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-300">
                        <FileText className="w-8 h-8 text-white" />
                      </div>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">المقالات المفيدة</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">محتوى ثري ومفيد</p>
                    <span className="inline-flex items-center px-3 py-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-full text-xs font-medium">
                      500+ مقال
                    </span>
                  </div>
                  <div className="mt-4 h-1 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
                </Link>
                 
                <Link href="/gifts" className="group bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl rounded-2xl shadow-xl p-6 border border-gray-200/50 dark:border-slate-700/50 hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2">
                  <div className="text-center">
                    <div className="relative mb-6">
                      <div className="absolute inset-0 bg-gradient-to-br from-orange-500/20 to-red-500/20 rounded-2xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <div className="relative w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-300">
                        <Gift className="w-8 h-8 text-white" />
                      </div>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">الهدايا والجوائز</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">عروض حصرية ومميزة</p>
                    <span className="inline-flex items-center px-3 py-1 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-full text-xs font-medium">
                      جديد
                    </span>
                  </div>
                  <div className="mt-4 h-1 bg-gradient-to-r from-orange-500 to-red-500 rounded-full transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
                </Link>
              </div>
            </div>
          </div>

          {/* Premium Contact Us Section */}
          <div className="mt-16">
            <div className="relative overflow-hidden rounded-3xl">
              <div>
              {/* Premium Gradient Background */}
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900"></div>
              
              {/* Glass Effect Overlay */}
              <div className="absolute inset-0 bg-white/5 backdrop-blur-sm"></div>
              
              {/* Floating Elements */}
              <div className="absolute inset-0">
                <div className="absolute top-10 left-10 w-40 h-40 bg-gradient-to-br from-white/20 to-purple-400/20 rounded-full animate-pulse filter blur-2xl"></div>
                <div className="absolute bottom-10 right-10 w-48 h-48 bg-gradient-to-br from-pink-400/20 to-orange-400/20 rounded-full animate-float filter blur-xl"></div>
                <div className="absolute top-1/2 left-1/4 w-32 h-32 bg-gradient-to-br from-cyan-400/20 to-blue-400/20 rounded-full animate-pulse filter blur-lg"></div>
              </div>
              
              {/* Content */}
              <div className="relative z-10 p-8 lg:p-12 text-center">
                <div className="animate-scale-in">
                  <div className="relative inline-block mb-8">
                    <div className="w-24 h-24 bg-gradient-to-br from-purple-400 to-pink-400 rounded-3xl flex items-center justify-center mx-auto shadow-2xl">
                      <Mail className="w-12 h-12 text-white" />
                    </div>
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-green-400 rounded-full animate-bounce shadow-lg"></div>
                  </div>
                </div>
                
                <div className="animate-slide-in-left animation-delay-300">
                  <h2 className="text-5xl md:text-6xl font-bold text-white mb-8 leading-tight">
                    تواصل معنا
                    <span className="block text-3xl md:text-4xl font-light text-white/80 mt-2">
                      نحن في خدمتك دائماً
                    </span>
                  </h2>
                </div>
                
                <div className="animate-slide-in-right animation-delay-600">
                  <p className="text-2xl text-white/90 mb-12 max-w-4xl mx-auto leading-relaxed font-light">
                    فريقنا المتخصص جاهز لمساعدتك على مدار الساعة. تواصل معنا الآن واحصل على الدعم الفوري والمساعدة المتخصصة
                  </p>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-6 justify-center animate-fade-in animation-delay-900">
                  <button className="group px-12 py-5 bg-white text-purple-900 font-bold rounded-2xl hover:shadow-2xl transition-all duration-500 text-lg transform hover:scale-105">
                    <span className="flex items-center justify-center gap-3">
                      <Mail className="w-6 h-6 group-hover:scale-110 transition-transform" />
                      إرسال رسالة
                      <svg className="w-6 h-6 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </span>
                  </button>
                  <button className="group px-12 py-5 bg-white/10 backdrop-blur-xl text-white font-bold rounded-2xl transition-all duration-500 text-lg border-2 border-white/30 hover:border-white/60 transform hover:scale-105">
                    <span className="flex items-center justify-center gap-3">
                      <Phone className="w-6 h-6 group-hover:scale-110 transition-transform" />
                      اتصل بنا مباشرة
                    </span>
                  </button>
                </div>
                
                {/* Contact Info Cards */}
                <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 animate-slide-up animation-delay-1200">
                  <div className="bg-white/10 backdrop-blur-xl p-6 rounded-2xl text-center hover:bg-white/20 transition-all duration-300 transform hover:-translate-y-2">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <Mail className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">البريد الإلكتروني</h3>
                    <p className="text-white/80">support@zomiga.com</p>
                  </div>
                  
                  <div className="bg-white/10 backdrop-blur-xl p-6 rounded-2xl text-center hover:bg-white/20 transition-all duration-300 transform hover:-translate-y-2">
                    <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <Zap className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">ساعات العمل</h3>
                    <p className="text-white/80">24/7 دعم متواصل</p>
                  </div>
                  
                  <div className="bg-white/10 backdrop-blur-xl p-6 rounded-2xl text-center hover:bg-white/20 transition-all duration-300 transform hover:-translate-y-2">
                    <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <MapPin className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">الموقع</h3>
                    <p className="text-white/80">خدمة عالمية</p>
                  </div>
                </div>
                
                {/* Social Media Links */}
                <div className="mt-16 animate-slide-up animation-delay-1500">
                  <h3 className="text-2xl font-bold text-white mb-8 text-center">تابعنا على وسائل التواصل الاجتماعي</h3>
                  <div className="flex flex-col sm:flex-row gap-6 justify-center">
                    {/* WhatsApp */}
                    <a 
                      href="https://wa.me/1234567890" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="group flex items-center justify-center gap-3 px-8 py-4 bg-green-500 hover:bg-green-600 text-white font-bold rounded-2xl transition-all duration-300 transform hover:scale-105 hover:shadow-2xl"
                    >
                      <svg className="w-6 h-6 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                      </svg>
                      <span>واتساب</span>
                    </a>
                    
                    {/* Telegram */}
                    <a 
                      href="https://t.me/zomiga_channel" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="group flex items-center justify-center gap-3 px-8 py-4 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-2xl transition-all duration-300 transform hover:scale-105 hover:shadow-2xl"
                    >
                      <svg className="w-6 h-6 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                      </svg>
                      <span>تليجرام</span>
                    </a>
                    
                    {/* Facebook */}
                    <a 
                      href="https://facebook.com/zomiga" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="group flex items-center justify-center gap-3 px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl transition-all duration-300 transform hover:scale-105 hover:shadow-2xl"
                    >
                      <svg className="w-6 h-6 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                      </svg>
                      <span>فيسبوك</span>
                    </a>
                  </div>
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
};

export default HomePage;