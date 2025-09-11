import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { useAuth } from '../../contexts/AuthContext'
import Layout from '../../components/Layout'
import { BannerAd, CardAd, InlineAd } from '../../components/AdvertisementSystem'
import Link from 'next/link'
import { getGiftCategories } from '../../lib/giftsService'
import { 
  Gift, 
  Star, 
  Clock, 
  Users, 
  Heart, 
  Share2, 
  Filter, 
  Search, 
  Tag,
  Zap,
  TrendingUp,
  Calendar,
  Award,
  Sparkles,
  ShoppingCart,
  Eye,
  Download,
  ExternalLink
} from 'lucide-react'
import toast from 'react-hot-toast'

const GiftsPage = () => {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [gifts, setGifts] = useState([])
  const [filteredGifts, setFilteredGifts] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategory, setFilterCategory] = useState('all')
  const [filterType, setFilterType] = useState('all')
  const [sortBy, setSortBy] = useState('newest')
  const [favorites, setFavorites] = useState([])

  useEffect(() => {
    loadGifts()
    loadFavorites()
  }, [])

  useEffect(() => {
    filterAndSortGifts()
  }, [gifts, searchTerm, filterCategory, filterType, sortBy])

  const loadGifts = async () => {
    try {
      // منتجات التسويق بالعمولة - عروض حصرية
      const mockGifts = [
        {
          id: 1,
          title: '🔥 عرض محدود: لابتوب Dell XPS 13 بخصم 40%',
          description: 'اكتشف أحدث لابتوب Dell XPS 13 بمعالج Intel Core i7 الجيل الـ12، شاشة 4K، وذاكرة 16GB RAM. عرض حصري لفترة محدودة!',
          category: 'تكنولوجيا',
          type: 'منتج',
          image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&h=250&fit=crop',
          originalPrice: 1299,
          discountPrice: 779,
          discount: 40,
          validUntil: '2024-02-15',
          affiliateLink: 'https://amzn.to/dell-xps13-offer',
          commission: 8.5,
          claimed: 1250,
          totalAvailable: 5000,
          rating: 4.8,
          reviews: 2847,
          isHot: true,
          isNew: false,
          isFeatured: true,
          tags: ['لابتوب', 'Dell', 'خصم حصري', 'تكنولوجيا'],
          createdAt: '2024-01-20',
          newsStyle: 'عاجل: شركة Dell تطلق عرضاً استثنائياً على أشهر أجهزتها المحمولة'
        },
        {
          id: 2,
          title: '📱 آيفون 15 Pro Max بأفضل سعر في السوق',
          description: 'احصل على أحدث آيفون 15 Pro Max بسعة 256GB مع ضمان Apple الرسمي. شحن مجاني وإرجاع خلال 30 يوم. العرض ساري حتى نفاد الكمية!',
          category: 'هواتف ذكية',
          type: 'منتج',
          image: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400&h=250&fit=crop',
          originalPrice: 1199,
          discountPrice: 1099,
          discount: 8,
          validUntil: '2024-02-10',
          affiliateLink: 'https://amzn.to/iphone15-promax-deal',
          commission: 3.2,
          claimed: 890,
          totalAvailable: 2000,
          rating: 4.9,
          reviews: 5634,
          isHot: false,
          isNew: true,
          isFeatured: false,
          tags: ['آيفون', 'Apple', 'هاتف ذكي', 'جديد'],
          createdAt: '2024-01-18',
          newsStyle: 'تقرير: انخفاض أسعار آيفون 15 Pro Max لأول مرة منذ الإطلاق'
        },
        {
          id: 3,
          title: '🎧 سماعات Sony WH-1000XM5 بتقنية إلغاء الضوضاء',
          description: 'أفضل سماعات لاسلكية في العالم مع تقنية إلغاء الضوضاء المتطورة وجودة صوت استثنائية. بطارية تدوم 30 ساعة مع الشحن السريع.',
          category: 'صوتيات',
          type: 'منتج',
          image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=250&fit=crop',
          originalPrice: 399,
          discountPrice: 299,
          discount: 25,
          validUntil: '2024-02-20',
          affiliateLink: 'https://amzn.to/sony-wh1000xm5-deal',
          commission: 6.8,
          claimed: 567,
          totalAvailable: 1500,
          rating: 4.8,
          reviews: 3421,
          isHot: true,
          isNew: false,
          isFeatured: true,
          tags: ['سماعات', 'Sony', 'لاسلكي', 'إلغاء ضوضاء'],
          createdAt: '2024-01-15',
          newsStyle: 'مراجعة: سماعات Sony الجديدة تحصل على جائزة أفضل منتج صوتي لعام 2024'
        },
        {
          id: 4,
          title: '📚 دورة البرمجة الشاملة - من المبتدئ للمحترف',
          description: 'دورة شاملة تعلمك البرمجة من الصفر حتى الاحتراف مع أكثر من 100 ساعة محتوى و 50 مشروع عملي. شهادة معتمدة دولياً.',
          category: 'تعليم',
          type: 'دورة',
          image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=250&fit=crop',
          originalPrice: 199,
          discountPrice: 49,
          discount: 75,
          validUntil: '2024-02-25',
          affiliateLink: 'https://udemy.com/programming-masterclass-arabic',
          commission: 15.2,
          claimed: 2340,
          totalAvailable: 10000,
          rating: 4.9,
          reviews: 8945,
          isHot: false,
          isNew: false,
          isFeatured: false,
          tags: ['برمجة', 'دورة', 'تعليم', 'شهادة'],
          createdAt: '2024-01-12',
          newsStyle: 'خبر: منصة Udemy تطلق أكبر دورة برمجة باللغة العربية بخصم 75%'
        },
        {
          id: 5,
          title: '⌚ ساعة Apple Watch Series 9 الذكية الجديدة',
          description: 'أحدث ساعة ذكية من Apple مع مستشعرات صحية متطورة، GPS مدمج، ومقاومة للماء. تتبع اللياقة البدنية والصحة على مدار الساعة.',
          category: 'أجهزة ذكية',
          type: 'منتج',
          image: 'https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=400&h=250&fit=crop',
          originalPrice: 429,
          discountPrice: 349,
          discount: 19,
          validUntil: '2024-01-26',
          affiliateLink: 'https://amzn.to/apple-watch-series9',
          commission: 4.5,
          claimed: 234,
          totalAvailable: 500,
          rating: 4.9,
          reviews: 4267,
          isHot: true,
          isNew: true,
          isFeatured: true,
          tags: ['Apple Watch', 'ساعة ذكية', 'صحة', 'رياضة'],
          createdAt: '2024-01-25',
          newsStyle: 'إطلاق: Apple تكشف عن ميزات صحية ثورية في الساعة الذكية الجديدة'
        },
        {
          id: 6,
          title: '📖 كتاب "الذكاء العاطفي" - نسخة صوتية ومكتوبة',
          description: 'أفضل كتاب في تطوير الذات والذكاء العاطفي، متوفر بالنسخة الصوتية والمكتوبة. أكثر من مليون نسخة مباعة حول العالم.',
          category: 'كتب',
          type: 'كتاب',
          image: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=250&fit=crop',
          originalPrice: 29,
          discountPrice: 19,
          discount: 34,
          validUntil: '2024-03-01',
          affiliateLink: 'https://amzn.to/emotional-intelligence-book',
          commission: 8.0,
          claimed: 678,
          totalAvailable: 3000,
          rating: 4.7,
          reviews: 12543,
          isHot: false,
          isNew: false,
          isFeatured: false,
          tags: ['كتاب', 'تطوير ذات', 'ذكاء عاطفي', 'صوتي'],
          createdAt: '2024-01-10',
          newsStyle: 'مراجعة: خبراء علم النفس يرشحون أهم كتاب لتطوير الذكاء العاطفي'
        },
        {
          id: 7,
          title: '🏋️ جهاز تمارين منزلي متكامل - Bowflex SelectTech',
          description: 'جهاز تمارين منزلي متكامل يوفر أكثر من 50 تمرين مختلف. مثالي للياقة البدنية في المنزل مع توفير المساحة والوقت.',
          category: 'رياضة ولياقة',
          type: 'منتج',
          image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=250&fit=crop',
          originalPrice: 599,
          discountPrice: 449,
          discount: 25,
          validUntil: '2024-02-28',
          affiliateLink: 'https://amzn.to/bowflex-selecttech-deal',
          commission: 7.2,
          claimed: 1567,
          totalAvailable: 3000,
          rating: 4.6,
          reviews: 2189,
          isHot: true,
          isNew: false,
          isFeatured: true,
          tags: ['ألعاب', 'VIP', 'مجاني'],
          createdAt: '2024-01-22'
        },
        {
          id: 8,
          title: 'خصم 30% على دورات التعليم',
          description: 'خصم حصري على جميع الدورات التعليمية والتدريبية المتاحة',
          category: 'تعليم',
          type: 'خصم',
          image: '/api/placeholder/400/250',
          originalPrice: 300,
          discountPrice: 210,
          discount: 30,
          validUntil: '2024-03-15',
          pointsRequired: 350,
          claimed: 445,
          totalAvailable: 1200,
          rating: 4.6,
          reviews: 178,
          isHot: false,
          isNew: true,
          isFeatured: false,
          tags: ['تعليم', 'دورات', '30%'],
          createdAt: '2024-01-24'
        },
        {
          id: 9,
          title: 'عرض السفر - خصم 40%',
          description: 'خصم مميز على حجوزات الفنادق والرحلات السياحية',
          category: 'سفر',
          type: 'عرض',
          image: '/api/placeholder/400/250',
          originalPrice: 800,
          discountPrice: 480,
          discount: 40,
          validUntil: '2024-04-01',
          pointsRequired: 600,
          claimed: 234,
          totalAvailable: 800,
          rating: 4.8,
          reviews: 95,
          isHot: true,
          isNew: false,
          isFeatured: true,
          tags: ['سفر', 'فنادق', '40%'],
          createdAt: '2024-01-16'
        },
        {
          id: 10,
          title: 'هدية نقاط ترحيبية',
          description: 'احصل على 1000 نقطة مجانية كهدية ترحيبية للأعضاء الجدد',
          category: 'نقاط',
          type: 'هدية',
          image: '/api/placeholder/400/250',
          originalPrice: 0,
          discountPrice: 0,
          discount: 0,
          validUntil: '2024-12-31',
          pointsRequired: 0,
          claimed: 3456,
          totalAvailable: 10000,
          rating: 4.9,
          reviews: 567,
          isHot: false,
          isNew: true,
          isFeatured: false,
          tags: ['ترحيب', 'نقاط', 'جدد'],
          createdAt: '2024-01-01'
        },
        {
          id: 11,
          title: 'كوبون تسوق إلكتروني',
          description: 'كوبون خصم 20% على جميع المنتجات الإلكترونية والأجهزة الذكية',
          category: 'إلكترونيات',
          type: 'كوبون',
          image: '/api/placeholder/400/250',
          originalPrice: 1000,
          discountPrice: 800,
          discount: 20,
          validUntil: '2024-03-10',
          pointsRequired: 450,
          claimed: 789,
          totalAvailable: 2000,
          rating: 4.5,
          reviews: 234,
          isHot: false,
          isNew: false,
          isFeatured: false,
          tags: ['إلكترونيات', 'أجهزة', '20%'],
          createdAt: '2024-01-08'
        },
        {
          id: 12,
          title: 'عضوية ذهبية مجانية',
          description: 'احصل على عضوية ذهبية مجانية لمدة 3 أشهر مع جميع المزايا الحصرية',
          category: 'عضوية',
          type: 'هدية',
          image: '/api/placeholder/400/250',
          originalPrice: 299,
          discountPrice: 0,
          discount: 100,
          validUntil: '2024-02-29',
          pointsRequired: 750,
          claimed: 456,
          totalAvailable: 1000,
          rating: 4.9,
          reviews: 123,
          isHot: true,
          isNew: true,
          isFeatured: true,
          tags: ['ذهبية', 'عضوية', 'حصري'],
          createdAt: '2024-01-26'
        },
        {
          id: 13,
          title: 'خصم الصحة والجمال',
          description: 'خصم 35% على جميع منتجات الصحة والجمال والعناية الشخصية',
          category: 'صحة',
          type: 'خصم',
          image: '/api/placeholder/400/250',
          originalPrice: 250,
          discountPrice: 162.5,
          discount: 35,
          validUntil: '2024-03-20',
          pointsRequired: 300,
          claimed: 567,
          totalAvailable: 1500,
          rating: 4.6,
          reviews: 189,
          isHot: false,
          isNew: false,
          isFeatured: false,
          tags: ['صحة', 'جمال', '35%'],
          createdAt: '2024-01-14'
        },
        {
          id: 14,
          title: 'عرض الكتب الصوتية',
          description: 'الوصول المجاني لمكتبة الكتب الصوتية لمدة شهرين كاملين',
          category: 'كتب',
          type: 'عرض',
          image: '/api/placeholder/400/250',
          originalPrice: 120,
          discountPrice: 0,
          discount: 100,
          validUntil: '2024-03-05',
          pointsRequired: 280,
          claimed: 1234,
          totalAvailable: 2500,
          rating: 4.7,
          reviews: 345,
          isHot: true,
          isNew: false,
          isFeatured: true,
          tags: ['كتب', 'صوتية', 'مجاني'],
          createdAt: '2024-01-19'
        },
        {
          id: 15,
          title: 'هدية اشتراك الرياضة',
          description: 'اشتراك مجاني في قنوات الرياضة المباشرة لمدة شهر كامل',
          category: 'رياضة',
          type: 'هدية',
          image: '/api/placeholder/400/250',
          originalPrice: 80,
          discountPrice: 0,
          discount: 100,
          validUntil: '2024-02-18',
          pointsRequired: 320,
          claimed: 890,
          totalAvailable: 2000,
          rating: 4.8,
          reviews: 267,
          isHot: false,
          isNew: true,
          isFeatured: false,
          tags: ['رياضة', 'مباشر', 'مجاني'],
          createdAt: '2024-01-21'
        }
      ]
      setGifts(mockGifts)
    } catch (error) {
      console.error('Error loading gifts:', error)
      toast.error('حدث خطأ في تحميل الهدايا والعروض')
    }
  }

  const loadFavorites = () => {
    // تحميل المفضلة من التخزين المحلي
    const savedFavorites = localStorage.getItem('favorites_gifts')
    if (savedFavorites) {
      setFavorites(JSON.parse(savedFavorites))
    }
  }

  const filterAndSortGifts = () => {
    let filtered = gifts

    // البحث
    if (searchTerm) {
      filtered = filtered.filter(gift => 
        gift.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        gift.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        gift.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        gift.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    }

    // فلترة الفئة
    if (filterCategory !== 'all') {
      filtered = filtered.filter(gift => gift.category === filterCategory)
    }

    // فلترة النوع
    if (filterType !== 'all') {
      filtered = filtered.filter(gift => gift.type === filterType)
    }

    // الترتيب
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt) - new Date(a.createdAt)
        case 'oldest':
          return new Date(a.createdAt) - new Date(b.createdAt)
        case 'discount':
          return b.discount - a.discount
        case 'rating':
          return b.rating - a.rating
        case 'popular':
          return b.claimed - a.claimed
        case 'ending':
          return new Date(a.validUntil) - new Date(b.validUntil)
        default:
          return 0
      }
    })

    setFilteredGifts(filtered)
  }

  const toggleFavorite = (giftId) => {
    const newFavorites = favorites.includes(giftId)
      ? favorites.filter(id => id !== giftId)
      : [...favorites, giftId]
    
    setFavorites(newFavorites)
    localStorage.setItem('favorites_gifts', JSON.stringify(newFavorites))
    
    toast.success(
      favorites.includes(giftId) 
        ? 'تم إزالة الهدية من المفضلة' 
        : 'تم إضافة الهدية للمفضلة'
    )
  }

  const claimGift = async (giftId) => {
    if (!user) {
      toast.error('يجب تسجيل الدخول أولاً')
      router.push('/auth/login')
      return
    }

    try {
      // محاكاة استلام الهدية
      const gift = gifts.find(g => g.id === giftId)
      if (gift.claimed >= gift.totalAvailable) {
        toast.error('عذراً، انتهت الكمية المتاحة من هذه الهدية')
        return
      }

      setGifts(gifts.map(g => 
        g.id === giftId 
          ? { ...g, claimed: g.claimed + 1 }
          : g
      ))
      
      toast.success('تم استلام الهدية بنجاح! ستجدها في حسابك')
    } catch (error) {
      toast.error('حدث خطأ في استلام الهدية')
    }
  }

  const shareGift = (gift) => {
    if (navigator.share) {
      navigator.share({
        title: gift.title,
        text: gift.description,
        url: window.location.href + '/' + gift.id
      })
    } else {
      // نسخ الرابط للحافظة
      navigator.clipboard.writeText(window.location.href + '/' + gift.id)
      toast.success('تم نسخ رابط الهدية')
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getDaysLeft = (validUntil) => {
    const today = new Date()
    const endDate = new Date(validUntil)
    const diffTime = endDate - today
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays > 0 ? diffDays : 0
  }

  const getProgressPercentage = (claimed, total) => {
    return Math.min((claimed / total) * 100, 100)
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

  // استخدام حالة لتخزين فئات الهدايا
  const [categories, setCategories] = useState(['all'])
  
  // تحميل فئات الهدايا من الخدمة
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const categoriesData = await getGiftCategories()
        if (categoriesData && categoriesData.length > 0) {
          // إضافة خيار 'الكل' في البداية
          setCategories(['all', ...categoriesData.map(cat => cat.name)])
        }
      } catch (error) {
        console.error('خطأ في تحميل فئات الهدايا:', error)
      }
    }
    
    loadCategories()
  }, [])
  const types = ['all', 'هدية', 'عرض', 'خصم', 'كوبون']

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50">
        {/* Hero Section */}
        <div className="relative overflow-hidden bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 text-white">
          <div className="absolute inset-0 bg-black opacity-20"></div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
            <div className="text-center">
              <div className="flex justify-center mb-6">
                <div className="p-4 bg-white bg-opacity-20 rounded-full">
                  <TrendingUp className="w-12 h-12 sm:w-16 sm:h-16" />
                </div>
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
                أفضل العروض والمنتجات
              </h1>
              <p className="text-lg sm:text-xl lg:text-2xl mb-8 opacity-90">
                اكتشف أحدث المنتجات والعروض المختارة بعناية من خبرائنا
              </p>
              <div className="mb-8 inline-flex items-center px-4 py-2 bg-white bg-opacity-20 rounded-full">
                <Award className="w-5 h-5 mr-2" />
                <span className="font-medium">منتجات موصى بها من الخبراء</span>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <div className="bg-white bg-opacity-20 rounded-lg px-6 py-3">
                  <div className="flex items-center">
                    <Sparkles className="w-5 h-5 mr-2" />
                    <span className="font-semibold">{gifts.length} عرض متاح</span>
                  </div>
                </div>
                <div className="bg-white bg-opacity-20 rounded-lg px-6 py-3">
                  <div className="flex items-center">
                    <Users className="w-5 h-5 mr-2" />
                    <span className="font-semibold">{gifts.reduce((sum, gift) => sum + gift.claimed, 0).toLocaleString()} مستفيد</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Filters */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-4 sm:p-6 mb-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {/* البحث */}
              <div className="relative sm:col-span-2">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="البحث في الهدايا والعروض..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                />
              </div>

              {/* فلتر الفئة */}
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              >
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category === 'all' ? 'جميع الفئات' : category}
                  </option>
                ))}
              </select>

              {/* فلتر النوع */}
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              >
                {types.map(type => (
                  <option key={type} value={type}>
                    {type === 'all' ? 'جميع الأنواع' : type}
                  </option>
                ))}
              </select>

              {/* الترتيب */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              >
                <option value="newest">الأحدث</option>
                <option value="oldest">الأقدم</option>
                <option value="discount">أعلى خصم</option>
                <option value="rating">الأعلى تقييماً</option>
                <option value="popular">الأكثر شعبية</option>
                <option value="ending">ينتهي قريباً</option>
              </select>
            </div>
            
            <div className="mt-4 text-sm text-gray-600 text-center">
              <span className="font-medium">{filteredGifts.length}</span> من {gifts.length} هدية وعرض
            </div>
          </div>

          {/* Hero Banner Ad */}
          <div className="mb-8">
            <BannerAd position="gifts-hero" />
          </div>

          {/* Featured Gifts */}
          {filteredGifts.filter(gift => gift.isFeatured).length > 0 && (
            <div className="mb-12">
              <div className="flex items-center mb-6">
                <Award className="w-6 h-6 text-yellow-500 mr-2" />
                <h2 className="text-2xl font-bold text-gray-900">العروض المميزة</h2>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {filteredGifts.filter(gift => gift.isFeatured).slice(0, 2).map((gift) => (
                  <div key={gift.id} className="relative bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
                    {/* Badges */}
                    <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
                      {gift.isHot && (
                        <span className="bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center">
                          <Zap className="w-3 h-3 mr-1" />
                          ساخن
                        </span>
                      )}
                      {gift.isNew && (
                        <span className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                          جديد
                        </span>
                      )}
                      {gift.discount > 0 && (
                        <span className="bg-purple-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                          خصم {gift.discount}%
                        </span>
                      )}
                    </div>

                    {/* Favorite Button */}
                    <button
                      onClick={() => toggleFavorite(gift.id)}
                      className="absolute top-4 right-4 z-10 p-2 bg-white bg-opacity-90 rounded-full hover:bg-opacity-100 transition-all"
                    >
                      <Heart className={`w-5 h-5 ${favorites.includes(gift.id) ? 'text-red-500 fill-current' : 'text-gray-400'}`} />
                    </button>

                    {/* Image */}
                    <div className="relative h-48 sm:h-56">
                      <img 
                        src={gift.image} 
                        alt={gift.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60"></div>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-3">
                        <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium">
                          {gift.category}
                        </span>
                        <div className="flex items-center">
                          <Star className="w-4 h-4 text-yellow-400 fill-current mr-1" />
                          <span className="text-sm font-medium text-gray-700">{gift.rating}</span>
                          <span className="text-sm text-gray-500 mr-1">({gift.reviews})</span>
                        </div>
                      </div>

                      <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">
                        {gift.title}
                      </h3>
                      
                      <p className="text-gray-600 mb-4 line-clamp-2">
                        {gift.description}
                      </p>

                      {/* Price */}
                      {gift.originalPrice > 0 && (
                        <div className="flex items-center gap-2 mb-4">
                          {gift.discountPrice > 0 ? (
                            <>
                              <span className="text-2xl font-bold text-purple-600">
                                {gift.discountPrice} ر.س
                              </span>
                              <span className="text-lg text-gray-500 line-through">
                                {gift.originalPrice} ر.س
                              </span>
                            </>
                          ) : (
                            <span className="text-2xl font-bold text-green-600">
                              مجاني
                            </span>
                          )}
                        </div>
                      )}

                      {/* Progress Bar */}
                      <div className="mb-4">
                        <div className="flex justify-between text-sm text-gray-600 mb-2">
                          <span>تم الاستلام: {gift.claimed.toLocaleString()}</span>
                          <span>المتاح: {gift.totalAvailable.toLocaleString()}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${getProgressPercentage(gift.claimed, gift.totalAvailable)}%` }}
                          ></div>
                        </div>
                      </div>

                      {/* Time Left */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center text-sm text-gray-600">
                          <Clock className="w-4 h-4 mr-1" />
                          <span>ينتهي خلال {getDaysLeft(gift.validUntil)} يوم</span>
                        </div>
                        <div className="flex items-center text-sm text-purple-600">
                          <Tag className="w-4 h-4 mr-1" />
                          <span>{gift.pointsRequired} نقطة</span>
                        </div>
                      </div>

                      {/* News Style Header */}
                      {gift.newsStyle && (
                        <div className="mb-4 p-3 bg-blue-50 border-l-4 border-blue-500 rounded">
                          <p className="text-sm font-medium text-blue-800">{gift.newsStyle}</p>
                        </div>
                      )}

                      {/* Commission Info */}
                      {gift.commission && (
                        <div className="mb-4 flex items-center justify-between text-sm">
                          <span className="text-gray-600">عمولة الشراكة:</span>
                          <span className="font-bold text-green-600">{gift.commission}%</span>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex gap-3">
                        {gift.affiliateLink ? (
                          <a
                            href={gift.affiliateLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 px-4 rounded-xl font-semibold hover:from-green-700 hover:to-emerald-700 transition-all duration-300 flex items-center justify-center text-center"
                          >
                            <ExternalLink className="w-4 h-4 mr-2" />
                            اشتري الآن
                          </a>
                        ) : (
                          <button
                            onClick={() => claimGift(gift.id)}
                            disabled={gift.claimed >= gift.totalAvailable}
                            className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 px-4 rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center"
                          >
                            {gift.claimed >= gift.totalAvailable ? (
                              'انتهت الكمية'
                            ) : (
                              <>
                                <Download className="w-4 h-4 mr-2" />
                                استلام الهدية
                              </>
                            )}
                          </button>
                        )}
                        <button
                          onClick={() => shareGift(gift)}
                          className="p-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition-all"
                        >
                          <Share2 className="w-4 h-4 text-gray-600" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Inline Ad between Featured and All Gifts */}
          <div className="mb-8">
            <InlineAd position="gifts-content" size="large" />
          </div>

          {/* All Gifts Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredGifts.map((gift) => (
              <div key={gift.id} className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                {/* Badges */}
                <div className="absolute top-3 left-3 z-10 flex flex-col gap-1">
                  {gift.isHot && (
                    <span className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold flex items-center">
                      <Zap className="w-3 h-3 mr-1" />
                      ساخن
                    </span>
                  )}
                  {gift.isNew && (
                    <span className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                      جديد
                    </span>
                  )}
                  {gift.discount > 0 && (
                    <span className="bg-purple-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                      {gift.discount}%
                    </span>
                  )}
                </div>

                {/* Favorite Button */}
                <button
                  onClick={() => toggleFavorite(gift.id)}
                  className="absolute top-3 right-3 z-10 p-2 bg-white bg-opacity-90 rounded-full hover:bg-opacity-100 transition-all"
                >
                  <Heart className={`w-4 h-4 ${favorites.includes(gift.id) ? 'text-red-500 fill-current' : 'text-gray-400'}`} />
                </button>

                {/* Image */}
                <div className="relative h-40">
                  <img 
                    src={gift.image} 
                    alt={gift.title}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Content */}
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-lg text-xs font-medium">
                      {gift.category}
                    </span>
                    <div className="flex items-center">
                      <Star className="w-3 h-3 text-yellow-400 fill-current mr-1" />
                      <span className="text-xs font-medium text-gray-700">{gift.rating}</span>
                    </div>
                  </div>

                  <h3 className="font-bold text-gray-900 mb-2 line-clamp-2 text-sm">
                    {gift.title}
                  </h3>
                  
                  <p className="text-gray-600 mb-3 line-clamp-2 text-xs">
                    {gift.description}
                  </p>

                  {/* Price */}
                  {gift.originalPrice > 0 && (
                    <div className="flex items-center gap-2 mb-3">
                      {gift.discountPrice > 0 ? (
                        <>
                          <span className="text-lg font-bold text-purple-600">
                            {gift.discountPrice} ر.س
                          </span>
                          <span className="text-sm text-gray-500 line-through">
                            {gift.originalPrice} ر.س
                          </span>
                        </>
                      ) : (
                        <span className="text-lg font-bold text-green-600">
                          مجاني
                        </span>
                      )}
                    </div>
                  )}

                  {/* Progress Bar */}
                  <div className="mb-3">
                    <div className="flex justify-between text-xs text-gray-600 mb-1">
                      <span>{gift.claimed.toLocaleString()}</span>
                      <span>{gift.totalAvailable.toLocaleString()}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <div 
                        className="bg-gradient-to-r from-purple-500 to-pink-500 h-1.5 rounded-full transition-all duration-300"
                        style={{ width: `${getProgressPercentage(gift.claimed, gift.totalAvailable)}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Time and Points */}
                  <div className="flex items-center justify-between mb-3 text-xs">
                    <div className="flex items-center text-gray-600">
                      <Clock className="w-3 h-3 mr-1" />
                      <span>{getDaysLeft(gift.validUntil)} يوم</span>
                    </div>
                    <div className="flex items-center text-purple-600">
                      <Tag className="w-3 h-3 mr-1" />
                      <span>{gift.pointsRequired} نقطة</span>
                    </div>
                  </div>

                  {/* News Style Header */}
                  {gift.newsStyle && (
                    <div className="mb-3 p-2 bg-blue-50 border-l-3 border-blue-500 rounded text-xs">
                      <p className="font-medium text-blue-800">{gift.newsStyle}</p>
                    </div>
                  )}

                  {/* Commission Info */}
                  {gift.commission && (
                    <div className="mb-3 flex items-center justify-between text-xs">
                      <span className="text-gray-600">عمولة:</span>
                      <span className="font-bold text-green-600">{gift.commission}%</span>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2">
                    {gift.affiliateLink ? (
                      <a
                        href={gift.affiliateLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white py-2 px-3 rounded-lg font-semibold hover:from-green-700 hover:to-emerald-700 transition-all duration-300 flex items-center justify-center text-xs text-center"
                      >
                        <ExternalLink className="w-3 h-3 mr-1" />
                        اشتري الآن
                      </a>
                    ) : (
                      <button
                        onClick={() => claimGift(gift.id)}
                        disabled={gift.claimed >= gift.totalAvailable}
                        className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-2 px-3 rounded-lg text-sm font-semibold hover:from-purple-700 hover:to-pink-700 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed transition-all duration-300"
                      >
                        {gift.claimed >= gift.totalAvailable ? 'انتهت' : 'استلام'}
                      </button>
                    )}
                    <button
                      onClick={() => shareGift(gift)}
                      className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-all"
                    >
                      <Share2 className="w-3 h-3 text-gray-600" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Empty State */}
          {filteredGifts.length === 0 && (
            <div className="text-center py-16">
              <div className="mb-6">
                <Gift className="w-20 h-20 text-gray-300 mx-auto" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">لا توجد هدايا أو عروض</h3>
              <p className="text-gray-500 mb-6">لم يتم العثور على هدايا أو عروض تطابق معايير البحث</p>
              <button 
                onClick={() => {
                  setSearchTerm('')
                  setFilterCategory('all')
                  setFilterType('all')
                }}
                className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-300"
              >
                عرض جميع الهدايا
              </button>
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}

export default GiftsPage