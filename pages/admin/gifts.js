import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
// import Layout from '../../components/Layout'
import AdminLayout from '../../components/admin/AdminLayout'
import { 
  Gift, 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  Filter, 
  Eye, 
  EyeOff,
  Star,
  Clock,
  Users,
  TrendingUp,
  Calendar,
  Tag,
  Zap,
  Award,
  Download,
  Share2,
  MoreVertical,
  CheckCircle,
  XCircle,
  AlertCircle,
  BarChart3,
  PieChart,
  Activity
} from 'lucide-react'
import toast from 'react-hot-toast'
import { loadGifts as loadGiftsService, createGift, updateGift as updateGiftService, deleteGift as deleteGiftService, getClaimCountsForGifts } from '../../lib/giftsService'
import { useAuth } from '../../contexts/AuthContext'

const AdminGifts = () => {
  const router = useRouter()
  const { user } = useAuth()
  const [gifts, setGifts] = useState([])
  const [filteredGifts, setFilteredGifts] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterCategory, setFilterCategory] = useState('all')
  const [filterType, setFilterType] = useState('all')
  const [sortBy, setSortBy] = useState('newest')
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedGift, setSelectedGift] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    gift_type: '',
    points_required: 0,
    image_url: '',
    value: 0,
    currency: 'USD',
    quantity_available: null,
    max_per_user: 1,
    expiry_date: '',
    status: 'active',
    priority: 1
  })
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    expired: 0,
    claimed: 0,
    totalValue: 0
  })

  useEffect(() => {
    // AdminLayout يتولى التحقق من الصلاحيات
    loadGifts()
  }, [])

  useEffect(() => {
    filterAndSortGifts()
    calculateStats()
  }, [gifts, searchTerm, filterStatus, filterCategory, filterType, sortBy])

  const loadGifts = async () => {
    try {
      setIsLoading(true)
      const data = await loadGiftsService()
      const ids = (data || []).map(d => d.id)
      const claimCounts = await getClaimCountsForGifts(ids)

      const mapped = (data || []).map(d => ({
        id: d.id,
        title: d.title || '',
        description: d.description || '',
        category: d.category || 'غير محدد',
        type: d.gift_type || 'غير محدد',
        image: d.image_url || '/api/placeholder/400/250',
        originalPrice: d.value || 0,
        discountPrice: d.discount_price || 0,
        discount: d.discount || 0,
        validFrom: d.valid_from || null,
        validUntil: d.expiry_date || null,
        pointsRequired: d.points_required || 0,
        claimed: claimCounts[d.id] || 0,
        totalAvailable: d.quantity_available ?? 0,
        rating: d.rating || 0,
        reviews: d.reviews || 0,
        isHot: d.is_hot || false,
        isNew: d.is_new || false,
        isFeatured: d.is_featured || false,
        isActive: (d.status || 'inactive') === 'active',
        tags: d.tags || [],
        createdAt: d.created_at,
        updatedAt: d.updated_at,
        createdBy: d.created_by || '',
        views: d.views || 0,
        shares: d.shares || 0,
        conversionRate: d.conversion_rate || 0
      }))

      setGifts(mapped)
    } catch (error) {
      console.error('Error loading gifts:', error)
      toast.error('حدث خطأ في تحميل الهدايا والعروض')
    } finally {
      setIsLoading(false)
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

    // فلترة الحالة
    if (filterStatus !== 'all') {
      const now = new Date()
      filtered = filtered.filter(gift => {
        const hasExpiry = !!gift.validUntil
        const isExpired = hasExpiry ? new Date(gift.validUntil) < now : false
        const isOutOfStock = gift.totalAvailable > 0 ? gift.claimed >= gift.totalAvailable : false
        
        switch (filterStatus) {
          case 'active':
            return gift.isActive && !isExpired && !isOutOfStock
          case 'inactive':
            return !gift.isActive
          case 'expired':
            return isExpired
          case 'out_of_stock':
            return isOutOfStock
          default:
            return true
        }
      })
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
        case 'title':
          return a.title.localeCompare(b.title)
        case 'claimed':
          return b.claimed - a.claimed
        case 'rating':
          return b.rating - a.rating
        case 'views':
          return b.views - a.views
        case 'conversion':
          return b.conversionRate - a.conversionRate
        default:
          return 0
      }
    })

    setFilteredGifts(filtered)
  }

  const calculateStats = () => {
    const now = new Date()
    const activeGifts = gifts.filter(gift => {
      const hasExpiry = !!gift.validUntil
      const isExpired = hasExpiry ? new Date(gift.validUntil) < now : false
      const isOutOfStock = gift.totalAvailable > 0 ? gift.claimed >= gift.totalAvailable : false
      return gift.isActive && !isExpired && !isOutOfStock
    })
    const expiredGifts = gifts.filter(gift => {
      const hasExpiry = !!gift.validUntil
      return hasExpiry ? new Date(gift.validUntil) < now : false
    })
    const totalClaimed = gifts.reduce((sum, gift) => sum + (gift.claimed || 0), 0)
    const totalValue = gifts.reduce((sum, gift) => sum + ((gift.originalPrice || 0) * (gift.claimed || 0)), 0)

    setStats({
      total: gifts.length,
      active: activeGifts.length,
      expired: expiredGifts.length,
      claimed: totalClaimed,
      totalValue: totalValue
    })
  }

  const toggleGiftStatus = async (giftId) => {
    try {
      const prev = gifts
      const target = gifts.find(g => g.id === giftId)
      if (!target) return
      const newActive = !target.isActive

      // Optimistic update
      setGifts(gifts.map(gift => 
        gift.id === giftId 
          ? { ...gift, isActive: newActive, updatedAt: new Date().toISOString() }
          : gift
      ))

      const updated = await updateGiftService(giftId, { status: newActive ? 'active' : 'inactive' })
      if (!updated) {
        setGifts(prev)
        toast.error('تعذر تحديث حالة الهدية')
        return
      }

      toast.success('تم تحديث حالة الهدية بنجاح')
    } catch (error) {
      toast.error('حدث خطأ في تحديث حالة الهدية')
    }
  }

  const deleteGift = async (giftId) => {
    if (!confirm('هل أنت متأكد من حذف هذه الهدية؟')) return
    
    try {
      const ok = await deleteGiftService(giftId)
      if (!ok) {
        toast.error('تعذر حذف الهدية')
        return
      }
      setGifts(gifts.filter(gift => gift.id !== giftId))
      toast.success('تم حذف الهدية بنجاح')
    } catch (error) {
      toast.error('حدث خطأ في حذف الهدية')
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'غير محدد'
    return new Date(dateString).toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getDaysLeft = (validUntil) => {
    if (!validUntil) return null
    const today = new Date()
    const endDate = new Date(validUntil)
    const diffTime = endDate - today
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const getStatusBadge = (gift) => {
    const now = new Date()
    const hasExpiry = !!gift.validUntil
    const isExpired = hasExpiry ? new Date(gift.validUntil) < now : false
    const isOutOfStock = gift.totalAvailable > 0 ? gift.claimed >= gift.totalAvailable : false
    const daysLeft = hasExpiry ? getDaysLeft(gift.validUntil) : null
    
    if (!gift.isActive) {
      return <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs font-medium">معطل</span>
    }
    if (isExpired) {
      return <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-medium">منتهي</span>
    }
    if (isOutOfStock) {
      return <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-xs font-medium">نفدت الكمية</span>
    }
    if (daysLeft !== null && daysLeft <= 3) {
      return <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium">ينتهي قريباً</span>
    }
    return <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">نشط</span>
  }

  const getProgressPercentage = (claimed, total) => {
    if (!total || total <= 0) return 0
    return Math.min((claimed / total) * 100, 100)
  }

  // إعادة ضبط نموذج إضافة هدية
  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      category: '',
      gift_type: '',
      points_required: 0,
      image_url: '',
      value: 0,
      currency: 'USD',
      quantity_available: null,
      max_per_user: 1,
      expiry_date: '',
      status: 'active',
      priority: 1
    })
  }

  // حفظ (إضافة) هدية جديدة
  const handleAddGift = async () => {
    try {
      if (!formData.title?.trim()) {
        toast.error('الرجاء إدخال عنوان الهدية')
        return
      }
      if (!formData.gift_type?.trim()) {
        toast.error('الرجاء اختيار نوع الهدية')
        return
      }
      if (formData.points_required === '' || Number(formData.points_required) < 0) {
        toast.error('عدد النقاط غير صالح')
        return
      }

      setIsSaving(true)

      const payload = {
        ...formData,
        points_required: Number(formData.points_required),
        value: Number(formData.value || 0),
        max_per_user: Number(formData.max_per_user || 1),
        quantity_available: formData.quantity_available === '' || formData.quantity_available === null ? null : Number(formData.quantity_available),
        expiry_date: formData.expiry_date || null,
        created_by: user?.id || null,
      }

      const created = await createGift(payload)
      if (!created) {
        toast.error('تعذر إضافة الهدية، حاول مرة أخرى')
        return
      }

      toast.success('تمت إضافة الهدية بنجاح')
      setShowAddModal(false)
      resetForm()
      await loadGifts()
    } catch (e) {
      console.error(e)
      toast.error('حدث خطأ أثناء إضافة الهدية')
    } finally {
      setIsSaving(false)
    }
  }

  // حفظ (تعديل) هدية موجودة
  const handleUpdateGift = async () => {
    if (!selectedGift) return
    try {
      setIsSaving(true)
      const updates = {
        title: selectedGift.title,
        description: selectedGift.description,
        category: selectedGift.category,
        gift_type: selectedGift.type,
        points_required: Number(selectedGift.pointsRequired || 0),
        image_url: selectedGift.image,
        value: Number(selectedGift.originalPrice || 0),
        currency: 'USD',
        quantity_available: selectedGift.totalAvailable === '' || selectedGift.totalAvailable === null ? null : Number(selectedGift.totalAvailable),
        max_per_user: Number(selectedGift.max_per_user || 1),
        expiry_date: selectedGift.validUntil || null,
        status: selectedGift.isActive ? 'active' : 'inactive',
        priority: 1,
      }

      const updated = await updateGiftService(selectedGift.id, updates)
      if (!updated) {
        toast.error('تعذر تحديث الهدية')
        return
      }

      toast.success('تم تحديث الهدية بنجاح')
      setShowEditModal(false)
      setSelectedGift(null)
      await loadGifts()
    } catch (e) {
      console.error(e)
      toast.error('حدث خطأ أثناء تحديث الهدية')
    } finally {
      setIsSaving(false)
    }
  }

  const categories = ['all', 'اشتراكات', 'نقاط', 'تسوق', 'محتوى', 'مطاعم', 'ترفيه']
  const types = ['all', 'هدية', 'عرض', 'خصم', 'كوبون']
  const statuses = [
    { value: 'all', label: 'الكل' },
    { value: 'active', label: 'نشط' },
    { value: 'inactive', label: 'معطل' },
    { value: 'expired', label: 'منتهي' },
    { value: 'out_of_stock', label: 'نفدت الكمية' }
  ]

  return (
    <AdminLayout title="إدارة الهدايا والعروض" description="إدارة وتتبع جميع الهدايا والعروض في النظام">
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center">
                <Gift className="w-8 h-8 text-purple-600 mr-3" />
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">إدارة الهدايا والعروض</h1>
                  <p className="text-gray-600 mt-1">إدارة وتتبع جميع الهدايا والعروض في النظام</p>
                </div>
              </div>
              <button
                onClick={() => setShowAddModal(true)}
                className="mt-4 sm:mt-0 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-300 flex items-center"
              >
                <Plus className="w-5 h-5 mr-2" />
                إضافة هدية جديدة
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
              <div className="flex items-center">
                <div className="p-3 bg-blue-100 rounded-xl">
                  <Gift className="w-6 h-6 text-blue-600" />
                </div>
                <div className="mr-4">
                  <p className="text-sm font-medium text-gray-600">إجمالي الهدايا</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
              <div className="flex items-center">
                <div className="p-3 bg-green-100 rounded-xl">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <div className="mr-4">
                  <p className="text-sm font-medium text-gray-600">نشط</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.active}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
              <div className="flex items-center">
                <div className="p-3 bg-red-100 rounded-xl">
                  <XCircle className="w-6 h-6 text-red-600" />
                </div>
                <div className="mr-4">
                  <p className="text-sm font-medium text-gray-600">منتهي</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.expired}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
              <div className="flex items-center">
                <div className="p-3 bg-purple-100 rounded-xl">
                  <Download className="w-6 h-6 text-purple-600" />
                </div>
                <div className="mr-4">
                  <p className="text-sm font-medium text-gray-600">تم الاستلام</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.claimed.toLocaleString()}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
              <div className="flex items-center">
                <div className="p-3 bg-yellow-100 rounded-xl">
                  <TrendingUp className="w-6 h-6 text-yellow-600" />
                </div>
                <div className="mr-4">
                  <p className="text-sm font-medium text-gray-600">القيمة الإجمالية</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalValue.toLocaleString()} ر.س</p>
                </div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
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

              {/* فلتر الحالة */}
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              >
                {statuses.map(status => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>

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
                <option value="title">الاسم</option>
                <option value="claimed">الأكثر استلاماً</option>
                <option value="rating">الأعلى تقييماً</option>
                <option value="views">الأكثر مشاهدة</option>
                <option value="conversion">معدل التحويل</option>
              </select>
            </div>
            
            <div className="mt-4 text-sm text-gray-600 text-center">
              <span className="font-medium">{filteredGifts.length}</span> من {gifts.length} هدية وعرض
            </div>
          </div>

          {/* Gifts Table */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      الهدية/العرض
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      الفئة والنوع
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      السعر والخصم
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      التقدم
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      الإحصائيات
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      الحالة
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      الإجراءات
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredGifts.map((gift) => (
                    <tr key={gift.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-16 w-16">
                            <img 
                              className="h-16 w-16 rounded-xl object-cover" 
                              src={gift.image} 
                              alt={gift.title} 
                            />
                          </div>
                          <div className="mr-4 min-w-0 flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="text-sm font-semibold text-gray-900 truncate">
                                {gift.title}
                              </p>
                              {gift.isHot && <Zap className="w-4 h-4 text-red-500" />}
                              {gift.isNew && <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">جديد</span>}
                              {gift.isFeatured && <Award className="w-4 h-4 text-yellow-500" />}
                            </div>
                            <p className="text-sm text-gray-500 truncate">
                              {gift.description}
                            </p>
                            <div className="flex items-center mt-1">
                              <Star className="w-4 h-4 text-yellow-400 fill-current mr-1" />
                              <span className="text-sm text-gray-600">{gift.rating} ({gift.reviews})</span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                            {gift.category}
                          </span>
                          <br />
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {gift.type}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          {gift.originalPrice > 0 ? (
                            <>
                              {gift.discountPrice > 0 ? (
                                <>
                                  <p className="text-sm font-semibold text-purple-600">
                                    {gift.discountPrice} ر.س
                                  </p>
                                  <p className="text-sm text-gray-500 line-through">
                                    {gift.originalPrice} ر.س
                                  </p>
                                  <p className="text-xs text-green-600 font-medium">
                                    خصم {gift.discount}%
                                  </p>
                                </>
                              ) : (
                                <>
                                  <p className="text-sm font-semibold text-green-600">مجاني</p>
                                  <p className="text-sm text-gray-500 line-through">
                                    {gift.originalPrice} ر.س
                                  </p>
                                  <p className="text-xs text-green-600 font-medium">
                                    خصم {gift.discount}%
                                  </p>
                                </>
                              )}
                            </>
                          ) : (
                            <p className="text-sm font-semibold text-blue-600">نقاط فقط</p>
                          )}
                          <p className="text-xs text-purple-600">
                            {gift.pointsRequired} نقطة
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">{gift.claimed.toLocaleString()}</span>
                            <span className="text-gray-600">{gift.totalAvailable.toLocaleString()}</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${getProgressPercentage(gift.claimed, gift.totalAvailable)}%` }}
                            ></div>
                          </div>
                          <p className="text-xs text-gray-500">
                            {getProgressPercentage(gift.claimed, gift.totalAvailable).toFixed(1)}% مكتمل
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1 text-sm">
                          <div className="flex items-center">
                            <Eye className="w-4 h-4 text-gray-400 mr-1" />
                            <span className="text-gray-600">{gift.views.toLocaleString()}</span>
                          </div>
                          <div className="flex items-center">
                            <Share2 className="w-4 h-4 text-gray-400 mr-1" />
                            <span className="text-gray-600">{gift.shares}</span>
                          </div>
                          <div className="flex items-center">
                            <TrendingUp className="w-4 h-4 text-gray-400 mr-1" />
                            <span className="text-gray-600">{gift.conversionRate}%</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-2">
                          {getStatusBadge(gift)}
                          <div className="text-xs text-gray-500">
                            <div className="flex items-center">
                              <Calendar className="w-3 h-3 mr-1" />
                              <span>ينتهي: {formatDate(gift.validUntil)}</span>
                            </div>
                            <div className="flex items-center mt-1">
                              <Clock className="w-3 h-3 mr-1" />
                              <span>
                                {getDaysLeft(gift.validUntil) > 0 
                                  ? `${getDaysLeft(gift.validUntil)} يوم متبقي`
                                  : 'انتهى'
                                }
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2 space-x-reverse">
                          <button
                            onClick={() => toggleGiftStatus(gift.id)}
                            className={`p-2 rounded-lg transition-all ${
                              gift.isActive 
                                ? 'bg-green-100 text-green-600 hover:bg-green-200' 
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                            title={gift.isActive ? 'إلغاء التفعيل' : 'تفعيل'}
                          >
                            {gift.isActive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                          </button>
                          <button
                            onClick={() => {
                              setSelectedGift(gift)
                              setShowEditModal(true)
                            }}
                            className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-all"
                            title="تعديل"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => deleteGift(gift.id)}
                            className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-all"
                            title="حذف"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Empty State */}
            {filteredGifts.length === 0 && (
              <div className="text-center py-16">
                <Gift className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">لا توجد هدايا أو عروض</h3>
                <p className="text-gray-500 mb-6">لم يتم العثور على هدايا أو عروض تطابق معايير البحث</p>
                <button 
                  onClick={() => {
                    setSearchTerm('')
                    setFilterStatus('all')
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

          {/* Add Gift Modal */}
          {showAddModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-2xl p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">إضافة هدية/عرض جديد</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">العنوان</label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="مثال: بطاقة هدية أمازون 50$"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">الفئة</label>
                    <input
                      type="text"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="مثال: تسوق"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">النوع</label>
                    <select
                      value={formData.gift_type}
                      onChange={(e) => setFormData({ ...formData, gift_type: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="">اختر النوع</option>
                      <option value="هدية">هدية</option>
                      <option value="عرض">عرض</option>
                      <option value="خصم">خصم</option>
                      <option value="كوبون">كوبون</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">النقاط المطلوبة</label>
                    <input
                      type="number"
                      value={formData.points_required}
                      onChange={(e) => setFormData({ ...formData, points_required: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      min="0"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">الوصف</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      rows="3"
                      placeholder="صف الهدية أو العرض"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">رابط الصورة</label>
                    <input
                      type="url"
                      value={formData.image_url}
                      onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="https://example.com/image.jpg"
                    />
                    {formData.image_url && (
                      <img src={formData.image_url} alt="معاينة" className="w-24 h-24 object-cover rounded-lg border mt-2" onError={(e)=>{e.currentTarget.style.display='none'}} />
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">القيمة (اختياري)</label>
                    <input
                      type="number"
                      value={formData.value}
                      onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      min="0"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">العملة</label>
                    <select
                      value={formData.currency}
                      onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="USD">USD</option>
                      <option value="SAR">SAR</option>
                      <option value="AED">AED</option>
                      <option value="EUR">EUR</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">الكمية المتاحة (اتركه فارغ = غير محدود)</label>
                    <input
                      type="number"
                      value={formData.quantity_available ?? ''}
                      onChange={(e) => setFormData({ ...formData, quantity_available: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      min="0"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">الحد الأقصى للمستخدم</label>
                    <input
                      type="number"
                      value={formData.max_per_user}
                      onChange={(e) => setFormData({ ...formData, max_per_user: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      min="1"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">تاريخ الانتهاء (اختياري)</label>
                    <input
                      type="date"
                      value={formData.expiry_date ? formData.expiry_date.substring(0,10) : ''}
                      onChange={(e) => setFormData({ ...formData, expiry_date: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">الحالة</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="active">نشط</option>
                      <option value="inactive">معطل</option>
                    </select>
                  </div>
                </div>

                <div className="flex space-x-3 space-x-reverse mt-6">
                  <button
                    onClick={handleAddGift}
                    disabled={isSaving}
                    className={`flex-1 py-2 px-4 rounded-lg text-white transition-colors ${isSaving ? 'bg-purple-300' : 'bg-purple-600 hover:bg-purple-700'}`}
                  >
                    {isSaving ? 'جارٍ الحفظ...' : 'إضافة الهدية'}
                  </button>
                  <button
                    onClick={() => { setShowAddModal(false); resetForm() }}
                    disabled={isSaving}
                    className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors"
                  >
                    إلغاء
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Edit Gift Modal */}
          {showEditModal && selectedGift && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-2xl p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">تعديل الهدية/العرض</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">العنوان</label>
                    <input
                      type="text"
                      value={selectedGift.title}
                      onChange={(e) => setSelectedGift({ ...selectedGift, title: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">الفئة</label>
                    <input
                      type="text"
                      value={selectedGift.category}
                      onChange={(e) => setSelectedGift({ ...selectedGift, category: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">النوع</label>
                    <select
                      value={selectedGift.type}
                      onChange={(e) => setSelectedGift({ ...selectedGift, type: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="هدية">هدية</option>
                      <option value="عرض">عرض</option>
                      <option value="خصم">خصم</option>
                      <option value="كوبون">كوبون</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">النقاط المطلوبة</label>
                    <input
                      type="number"
                      value={selectedGift.pointsRequired}
                      onChange={(e) => setSelectedGift({ ...selectedGift, pointsRequired: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      min="0"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">الوصف</label>
                    <textarea
                      value={selectedGift.description}
                      onChange={(e) => setSelectedGift({ ...selectedGift, description: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      rows="3"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">رابط الصورة</label>
                    <input
                      type="url"
                      value={selectedGift.image}
                      onChange={(e) => setSelectedGift({ ...selectedGift, image: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                    {selectedGift.image && (
                      <img src={selectedGift.image} alt="معاينة" className="w-24 h-24 object-cover rounded-lg border mt-2" onError={(e)=>{e.currentTarget.style.display='none'}} />
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">القيمة</label>
                    <input
                      type="number"
                      value={selectedGift.originalPrice}
                      onChange={(e) => setSelectedGift({ ...selectedGift, originalPrice: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      min="0"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">الكمية المتاحة</label>
                    <input
                      type="number"
                      value={selectedGift.totalAvailable ?? ''}
                      onChange={(e) => setSelectedGift({ ...selectedGift, totalAvailable: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      min="0"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">تاريخ الانتهاء</label>
                    <input
                      type="date"
                      value={selectedGift.validUntil ? selectedGift.validUntil.substring(0,10) : ''}
                      onChange={(e) => setSelectedGift({ ...selectedGift, validUntil: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">الحالة</label>
                    <select
                      value={selectedGift.isActive ? 'active' : 'inactive'}
                      onChange={(e) => setSelectedGift({ ...selectedGift, isActive: e.target.value === 'active' })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="active">نشط</option>
                      <option value="inactive">معطل</option>
                    </select>
                  </div>
                </div>

                <div className="flex space-x-3 space-x-reverse mt-6">
                  <button
                    onClick={handleUpdateGift}
                    disabled={isSaving}
                    className={`flex-1 py-2 px-4 rounded-lg text-white transition-colors ${isSaving ? 'bg-blue-300' : 'bg-blue-600 hover:bg-blue-700'}`}
                  >
                    {isSaving ? 'جارٍ الحفظ...' : 'حفظ التعديلات'}
                  </button>
                  <button
                    onClick={() => { setShowEditModal(false); setSelectedGift(null) }}
                    disabled={isSaving}
                    className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors"
                  >
                    إلغاء
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}

export default AdminGifts
