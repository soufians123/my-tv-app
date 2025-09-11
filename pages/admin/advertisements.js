import { useState, useEffect } from 'react'
import AdminLayout from '../../components/admin/AdminLayout'
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff,
  Search, 
  Filter, 
  MoreVertical,
  TrendingUp,
  Target,
  Calendar,
  DollarSign,
  Users,
  MousePointerClick,
  BarChart3,
  Settings,
  Download,
  Upload,
  Copy,
  Play,
  Pause,
  ArrowLeft,
  AlertCircle,
  CheckCircle,
  XCircle
} from 'lucide-react'
import toast from 'react-hot-toast'
import Link from 'next/link'
import { loadAdvertisements as fetchAdvertisements, updateAdvertisement as svcUpdateAdvertisement, deleteAdvertisement as svcDeleteAdvertisement, createAdvertisement as svcCreateAdvertisement } from '../../lib/advertisementsService'
import { useAuth } from '../../contexts/AuthContext'
import { useRouter } from 'next/router'

const AdvertisementsManagement = () => {
  const { user, loading, isAdmin } = useAuth()
  const router = useRouter()
  const [advertisements, setAdvertisements] = useState([])
  const [filteredAds, setFilteredAds] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [positionFilter, setPositionFilter] = useState('all')
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedAd, setSelectedAd] = useState(null)
  const [loadingAds, setLoadingAds] = useState(true)
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    paused: 0,
    expired: 0,
    totalImpressions: 0,
    totalClicks: 0,
    totalSpent: 0,
    averageCTR: 0
  })

  // محول الحقول من السجر في قاعدة البيانات إلى نموذج الواجهة
  const mapAdRecord = (ad) => {
    const impressions = Number(ad?.total_impressions ?? ad?.impression_count ?? 0)
    const clicks = Number(ad?.total_clicks ?? ad?.click_count ?? 0)
    const cpc = Number(ad?.cost_per_click ?? 0)
    const spent = Number(((clicks * cpc) || 0).toFixed(2))
    const isExpired = ad?.end_date ? new Date(ad.end_date) < new Date() : false
    const status = ad?.is_active ? (isExpired ? 'expired' : 'active') : 'paused'
    const ctr = impressions > 0 ? Number(((clicks / impressions) * 100).toFixed(2)) : 0

    return {
      id: ad.id,
      title: ad.title,
      description: ad.description || '',
      image: ad.image_url || '',
      link: ad.link_url || '',
      category: 'إعلان',
      type: ad.ad_type,
      position: ad.position,
      startDate: ad.start_date,
      endDate: ad.end_date,
      targetAudience: ad.target_audience || [],
      budget: Number(ad?.budget ?? 0),
      spent,
      impressions,
      clicks,
      conversions: 0,
      ctr,
      cpc,
      status,
      createdAt: ad.created_at,
      updatedAt: ad.updated_at,
      createdBy: ''
    }
  }

  // useEffect(() => {
  //   if (!loading && (!user || user.role !== 'admin')) {
  //     toast.error('غير مصرح لك بالوصول إلى هذه الصفحة')
  //     router.push('/')
  //     return
  //   }

  //   if (user && user.role === 'admin') {
  //     loadAdvertisements()
  //   }
  // }, [user, loading, router])

  useEffect(() => {
    if (loading) return

    if (!user || !isAdmin()) {
      toast.error('غير مصرح لك بالوصول إلى هذه الصفحة')
      router.push('/')
      return
    }

    loadAdvertisements()
  }, [user, loading, router, isAdmin])

  useEffect(() => {
    filterAdvertisements()
    calculateStats()
  }, [advertisements, searchTerm, statusFilter, typeFilter, positionFilter])

  const loadAdvertisements = async () => {
    try {
      setLoadingAds(true)
      const data = await fetchAdvertisements({ sortBy: 'created_at', sortOrder: 'desc' })
      const mapped = (data || []).map(mapAdRecord)
      setAdvertisements(mapped)
    } catch (error) {
      console.error('Error loading advertisements:', error)
      toast.error('حدث خطأ في تحميل الإعلانات')
    } finally {
      setLoadingAds(false)
    }
  }

  const filterAdvertisements = () => {
    let filtered = advertisements

    if (searchTerm) {
      filtered = filtered.filter(ad =>
        (ad.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (ad.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (ad.category || '').toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(ad => ad.status === statusFilter)
    }

    if (typeFilter !== 'all') {
      filtered = filtered.filter(ad => ad.type === typeFilter)
    }

    if (positionFilter !== 'all') {
      filtered = filtered.filter(ad => ad.position === positionFilter)
    }

    setFilteredAds(filtered)
  }

  const calculateStats = () => {
    const total = advertisements.length
    const active = advertisements.filter(ad => ad.status === 'active').length
    const paused = advertisements.filter(ad => ad.status === 'paused').length
    const expired = advertisements.filter(ad => ad.status === 'expired').length
    const totalImpressions = advertisements.reduce((sum, ad) => sum + (ad.impressions || 0), 0)
    const totalClicks = advertisements.reduce((sum, ad) => sum + (ad.clicks || 0), 0)
    const totalSpent = advertisements.reduce((sum, ad) => sum + (ad.spent || 0), 0)
    const averageCTR = totalImpressions > 0 ? (totalClicks / totalImpressions * 100) : 0

    setStats({
      total,
      active,
      paused,
      expired,
      totalImpressions,
      totalClicks,
      totalSpent,
      averageCTR
    })
  }

  const handleStatusChange = async (adId, newStatus) => {
    try {
      const isActive = newStatus === 'active'
      const updated = await svcUpdateAdvertisement(adId, { is_active: isActive })
      if (!updated) throw new Error('Failed to update advertisement')
      setAdvertisements(prev => prev.map(ad => ad.id === adId ? { ...ad, status: newStatus, updatedAt: new Date().toISOString() } : ad))
      toast.success(`تم ${newStatus === 'active' ? 'تفعيل' : 'إيقاف'} الإعلان`)
    } catch (error) {
      console.error(error)
      toast.error('حدث خطأ في تحديث حالة الإعلان')
    }
  }

  const handleDeleteAd = async (adId) => {
    if (window.confirm('هل أنت متأكد من حذف هذا الإعلان؟')) {
      try {
        const ok = await svcDeleteAdvertisement(adId)
        if (ok === false) throw new Error('Failed to delete')
        setAdvertisements(prev => prev.filter(ad => ad.id !== adId))
        toast.success('تم حذف الإعلان بنجاح')
      } catch (error) {
        console.error(error)
        toast.error('حدث خطأ في حذف الإعلان')
      }
    }
  }

  // حالة نموذج إضافة إعلان جديد
  const [newAd, setNewAd] = useState({
    title: '',
    description: '',
    type: 'banner',
    position: 'header',
    image: '',
    link: '',
    startDate: '',
    endDate: '',
    budget: 0,
    cpc: 0,
    targetAudience: '' // نص مفصول بفواصل سيتم تحويله إلى مصفوفة عند الإرسال
  })

  const normalizeAdType = (t) => {
    const allowed = ['banner', 'popup', 'video', 'native']
    return allowed.includes(t) ? t : 'banner'
  }

  const handleAddAd = async () => {
    try {
      const payload = {
        title: newAd.title.trim(),
        description: (newAd.description || '').trim(),
        ad_type: normalizeAdType(newAd.type),
        position: newAd.position,
        image_url: (newAd.image || '').trim(),
        link_url: (newAd.link || '').trim(),
        start_date: newAd.startDate || null,
        end_date: newAd.endDate || null,
        budget: Number(newAd.budget) || 0,
        cost_per_click: Number(newAd.cpc) || 0,
        target_audience: (newAd.targetAudience || '')
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
        is_active: true
      }

      const created = await svcCreateAdvertisement(payload)
      if (!created) throw new Error('Failed to create')

      const mapped = mapAdRecord(created)
      setAdvertisements((prev) => [mapped, ...prev])
      setShowAddModal(false)
      setNewAd({
        title: '',
        description: '',
        type: 'banner',
        position: 'header',
        image: '',
        link: '',
        startDate: '',
        endDate: '',
        budget: 0,
        cpc: 0,
        targetAudience: ''
      })

      toast.success('تم إضافة الإعلان بنجاح')
    } catch (error) {
      console.error(error)
      toast.error('حدث خطأ أثناء إضافة الإعلان')
    }
  }

  const handleDuplicateAd = async (ad) => {
    try {
      const payload = {
        title: `${ad.title} - نسخة`,
        description: ad.description,
        ad_type: normalizeAdType(ad.type),
        position: ad.position,
        image_url: ad.image,
        link_url: ad.link,
        start_date: ad.startDate,
        end_date: ad.endDate,
        budget: ad.budget,
        cost_per_click: ad.cpc || 0,
        target_audience: ad.targetAudience || [],
        is_active: false
      }
      const created = await svcCreateAdvertisement(payload)
      if (!created) throw new Error('Failed to duplicate')
      const mapped = mapAdRecord(created)
      setAdvertisements(prev => [mapped, ...prev])
      toast.success('تم نسخ الإعلان بنجاح')
    } catch (error) {
      console.error(error)
      toast.error('حدث خطأ في نسخ الإعلان')
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100'
      case 'paused': return 'text-yellow-600 bg-yellow-100'
      case 'expired': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active': return <CheckCircle className="w-4 h-4" />
      case 'paused': return <Pause className="w-4 h-4" />
      case 'expired': return <XCircle className="w-4 h-4" />
      default: return <AlertCircle className="w-4 h-4" />
    }
  }

  const StatCard = ({ title, value, icon: Icon, color = 'blue', change = null }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className={`text-2xl font-bold text-${color}-600 mt-1`}>{value}</p>
          {change && (
            <p className={`text-sm mt-1 ${
              change > 0 ? 'text-green-600' : change < 0 ? 'text-red-600' : 'text-gray-600'
            }`}>
              {change > 0 ? '+' : ''}{change}%
            </p>
          )}
        </div>
        <div className={`p-3 bg-${color}-100 rounded-lg`}>
          <Icon className={`w-6 h-6 text-${color}-600`} />
        </div>
      </div>
    </div>
  )

  if (loadingAds) {
    return (
      <AdminLayout title="إدارة الإعلانات" description="إدارة وتتبع جميع الإعلانات والحملات الترويجية">
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout title="إدارة الإعلانات" description="إدارة وتتبع جميع الإعلانات والحملات الترويجية">
      <div className="min-h-screen bg-gray-50 p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 space-x-reverse">
              <Link
                href="/admin"
                className="text-gray-600 hover:text-gray-800"
                legacyBehavior>
                <ArrowLeft className="w-6 h-6" />
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">إدارة الإعلانات</h1>
                <p className="text-gray-600 mt-1">إدارة وتتبع جميع الإعلانات والحملات الترويجية</p>
              </div>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2 space-x-reverse"
            >
              <Plus className="w-5 h-5" />
              <span>إضافة إعلان جديد</span>
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="إجمالي الإعلانات"
            value={stats.total}
            icon={BarChart3}
            color="blue"
          />
          <StatCard
            title="الإعلانات النشطة"
            value={stats.active}
            icon={CheckCircle}
            color="green"
          />
          <StatCard
            title="إجمالي المشاهدات"
            value={stats.totalImpressions.toLocaleString()}
            icon={Eye}
            color="purple"
          />
          <StatCard
            title="إجمالي النقرات"
            value={stats.totalClicks.toLocaleString()}
            icon={MousePointerClick}
            color="orange"
          />
        </div>

        {/* Additional Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatCard
            title="إجمالي الإنفاق"
            value={`${stats.totalSpent.toLocaleString()} ر.س`}
            icon={DollarSign}
            color="red"
          />
          <StatCard
            title="معدل النقر (CTR)"
            value={`${stats.averageCTR.toFixed(2)}%`}
            icon={Target}
            color="indigo"
          />
          <StatCard
            title="الإعلانات المتوقفة"
            value={stats.paused}
            icon={Pause}
            color="yellow"
          />
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="البحث في الإعلانات..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="all">جميع الحالات</option>
              <option value="active">نشط</option>
              <option value="paused">متوقف</option>
              <option value="expired">منتهي الصلاحية</option>
            </select>
            
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="all">جميع الأنواع</option>
              <option value="banner">بانر</option>
              <option value="popup">نافذة منبثقة</option>
              <option value="video">فيديو</option>
              <option value="native">مضمن</option>
            </select>
            
            <select
              value={positionFilter}
              onChange={(e) => setPositionFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="all">جميع المواضع</option>
              <option value="header">الرأس</option>
              <option value="sidebar">الشريط الجانبي</option>
              <option value="content">المحتوى</option>
              <option value="footer">التذييل</option>
            </select>
          </div>
        </div>

        {/* Advertisements Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-right py-4 px-6 font-semibold text-gray-900">الإعلان</th>
                  <th className="text-right py-4 px-6 font-semibold text-gray-900">النوع</th>
                  <th className="text-right py-4 px-6 font-semibold text-gray-900">الموضع</th>
                  <th className="text-right py-4 px-6 font-semibold text-gray-900">الحالة</th>
                  <th className="text-right py-4 px-6 font-semibold text-gray-900">الأداء</th>
                  <th className="text-right py-4 px-6 font-semibold text-gray-900">الميزانية</th>
                  <th className="text-right py-4 px-6 font-semibold text-gray-900">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredAds.map((ad) => (
                  <tr key={ad.id} className="hover:bg-gray-50">
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-4 space-x-reverse">
                        <img
                          src={ad.image}
                          alt={ad.title}
                          className="w-16 h-12 object-cover rounded-lg"
                        />
                        <div>
                          <h3 className="font-semibold text-gray-900">{ad.title}</h3>
                          <p className="text-sm text-gray-600 line-clamp-1">{ad.description}</p>
                          <span className="text-xs text-gray-500">{ad.category}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {ad.type}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-sm text-gray-900">{ad.position}</span>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(ad.status)}`}>
                        {getStatusIcon(ad.status)}
                        <span className="mr-1">
                          {ad.status === 'active' ? 'نشط' : ad.status === 'paused' ? 'متوقف' : 'منتهي'}
                        </span>
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-sm">
                        <div className="flex items-center space-x-2 space-x-reverse mb-1">
                          <Eye className="w-4 h-4 text-gray-400" />
                          <span>{ad.impressions.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center space-x-2 space-x-reverse">
                          <MousePointerClick className="w-4 h-4 text-gray-400" />
                          <span>{ad.clicks.toLocaleString()}</span>
                          <span className="text-gray-500">({ad.ctr}%)</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-sm">
                        <div className="font-medium text-gray-900">{ad.spent} / {ad.budget} ر.س</div>
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                          <div 
                            className="bg-purple-600 h-2 rounded-full" 
                            style={{ width: `${ad.budget > 0 ? Math.min(100, (ad.spent / ad.budget) * 100) : 0}%` }}
                          ></div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-2 space-x-reverse">
                        {ad.status === 'active' ? (
                          <button
                            onClick={() => handleStatusChange(ad.id, 'paused')}
                            className="text-yellow-600 hover:text-yellow-800 p-1"
                            title="إيقاف"
                          >
                            <Pause className="w-4 h-4" />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleStatusChange(ad.id, 'active')}
                            className="text-green-600 hover:text-green-800 p-1"
                            title="تفعيل"
                          >
                            <Play className="w-4 h-4" />
                          </button>
                        )}
                        
                        <button
                          onClick={() => {
                            setSelectedAd(ad)
                            setShowEditModal(true)
                          }}
                          className="text-blue-600 hover:text-blue-800 p-1"
                          title="تعديل"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        
                        <button
                          onClick={() => handleDuplicateAd(ad)}
                          className="text-purple-600 hover:text-purple-800 p-1"
                          title="نسخ"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        
                        <button
                          onClick={() => handleDeleteAd(ad.id)}
                          className="text-red-600 hover:text-red-800 p-1"
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
          
          {filteredAds.length === 0 && (
            <div className="text-center py-12">
              <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد إعلانات</h3>
              <p className="text-gray-600">لم يتم العثور على إعلانات تطابق المعايير المحددة</p>
            </div>
          )}
        </div>
      </div>

      {/* Add Advertisement Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">إضافة إعلان جديد</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">عنوان الإعلان</label>
                <input
                  type="text"
                  value={newAd.title}
                  onChange={(e) => setNewAd({ ...newAd, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="أدخل عنوان الإعلان"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">الوصف</label>
                <textarea
                  value={newAd.description}
                  onChange={(e) => setNewAd({ ...newAd, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  rows="3"
                  placeholder="أدخل وصف الإعلان"
                />
              </div>

              <div className="grid grid-cols-1 md-grid-cols-2 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">نوع الإعلان</label>
                  <select
                    value={newAd.type}
                    onChange={(e) => setNewAd({ ...newAd, type: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="banner">بانر</option>
                    <option value="popup">نافذة منبثقة</option>
                    <option value="video">فيديو</option>
                    <option value="native">مضمن</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">موضع العرض</label>
                  <select
                    value={newAd.position}
                    onChange={(e) => setNewAd({ ...newAd, position: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="header">الرأس</option>
                    <option value="sidebar">الشريط الجانبي</option>
                    <option value="content">المحتوى</option>
                    <option value="footer">التذييل</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">رابط صورة الإعلان</label>
                  <input
                    type="url"
                    value={newAd.image}
                    onChange={(e) => setNewAd({ ...newAd, image: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="https://example.com/image.jpg"
                  />
                  <p className="mt-1 text-xs text-gray-500">ادخل رابط مباشر لصورة الإعلان (PNG, JPG, GIF)</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">رابط التوجيه عند النقر</label>
                  <input
                    type="url"
                    value={newAd.link}
                    onChange={(e) => setNewAd({ ...newAd, link: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="https://your-landing-page.com"
                  />
                  <p className="mt-1 text-xs text-gray-500">سيتم فتح هذا الرابط عند نقر المستخدم على الإعلان</p>
                </div>
              </div>
              {newAd.image && (
                <div className="mt-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">معاينة الصورة</label>
                  <img src={newAd.image} alt="معاينة إعلان" className="w-full h-40 object-contain rounded border" />
                </div>
              )}

              <div className="flex items-center justify-end space-x-3 space-x-reverse mt-6">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  إلغاء
                </button>
                <button
                  onClick={handleAddAd}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                >
                  إضافة
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Advertisement Modal */}
      {showEditModal && selectedAd && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">تعديل الإعلان</h3>

            {/* محتوى التعديل يمكن إضافته لاحقًا */}
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">عنوان الإعلان</label>
                  <input
                    type="text"
                    value={selectedAd.title}
                    onChange={(e) => setSelectedAd({ ...selectedAd, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">موضع العرض</label>
                  <select
                    value={selectedAd.position}
                    onChange={(e) => setSelectedAd({ ...selectedAd, position: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="header">الرأس</option>
                    <option value="sidebar">الشريط الجانبي</option>
                    <option value="content">المحتوى</option>
                    <option value="footer">التذييل</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">الوصف</label>
                <textarea
                  value={selectedAd.description}
                  onChange={(e) => setSelectedAd({ ...selectedAd, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  rows="3"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">رابط صورة الإعلان</label>
                  <input
                    type="url"
                    value={selectedAd.image}
                    onChange={(e) => setSelectedAd({ ...selectedAd, image: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">رابط التوجيه عند النقر</label>
                  <input
                    type="url"
                    value={selectedAd.link}
                    onChange={(e) => setSelectedAd({ ...selectedAd, link: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="https://your-landing-page.com"
                  />
                </div>
              </div>
              {selectedAd.image && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">معاينة الصورة</label>
                  <img src={selectedAd.image} alt="معاينة إعلان" className="w-full h-40 object-contain rounded border" />
                </div>
              )}

              <div className="flex items-center justify-end space-x-3 space-x-reverse mt-6">
                <button
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  إغلاق
                </button>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                >
                  حفظ
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}
 
export default AdvertisementsManagement