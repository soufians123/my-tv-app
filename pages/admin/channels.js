import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import AdminLayout from '../../components/admin/AdminLayout'
import Link from 'next/link'
import { 
  Tv, 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Eye, 
  Star, 
  Users, 
  Play,
  MoreVertical,
  ArrowLeft
} from 'lucide-react'
import toast from 'react-hot-toast'
import {
  loadChannels,
  addChannel,
  updateChannel,
  deleteChannel,
  searchChannels,
  channelCategories,
  channelLanguages,
  channelQualities,
  channelCountries
} from '../../lib/supabaseChannelsService'

const AdminChannels = () => {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [channels, setChannels] = useState([])
  const [filteredChannels, setFilteredChannels] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterCategory, setFilterCategory] = useState('all')
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedChannel, setSelectedChannel] = useState(null)
  const [newChannel, setNewChannel] = useState({
    name: '',
    category: 'إخبارية',
    url: '',
    logo: '',
    status: 'active',
    country: '',
    language: 'العربية',
    quality: 'HD'
  })

  useEffect(() => {
    // تحميل بيانات القنوات (الحماية تتم عبر middleware)
    loadChannelsData()
  }, [router])

  useEffect(() => {
    const applyFilters = async () => {
      await filterChannels()
    }
    applyFilters()
  }, [channels, searchTerm, filterStatus, filterCategory])

  const loadChannelsData = async () => {
    try {
      setLoading(true)
      console.log('بدء تحميل القنوات...')
      // تحميل القنوات من الخدمة المشتركة
      const channelsData = await loadChannels()
      console.log('البيانات المستلمة:', channelsData)
      console.log('عدد القنوات:', channelsData?.length || 0)
      setChannels(channelsData || [])
      toast.success(`تم تحميل ${channelsData?.length || 0} قناة بنجاح`)
    } catch (error) {
      console.error('Error loading channels:', error)
      toast.error('حدث خطأ في تحميل القنوات')
    } finally {
      setLoading(false)
    }
  }

  const filterChannels = async () => {
    const filters = {
      status: filterStatus,
      category: filterCategory
    }
    
    try {
      console.log('فلترة القنوات...', { searchTerm, filters, channelsCount: channels.length })
      const filtered = await searchChannels(searchTerm, filters)
      console.log('القنوات المفلترة:', filtered)
      console.log('عدد القنوات المفلترة:', filtered?.length || 0)
      setFilteredChannels(filtered || [])
    } catch (error) {
      console.error('خطأ في فلترة القنوات:', error)
      setFilteredChannels([])
    }
  }

  const handleStatusChange = async (channelId, newStatus) => {
    try {
      console.log('تغيير حالة القناة:', channelId, newStatus)
      const result = await updateChannel(channelId, { is_active: newStatus === 'active' })
      console.log('نتيجة تحديث الحالة:', result)
      if (result && result.success) {
        await loadChannelsData() // إعادة تحميل البيانات
        toast.success(`تم ${newStatus === 'active' ? 'تفعيل' : 'إلغاء تفعيل'} القناة بنجاح`)
      } else {
        toast.error(result?.error || 'حدث خطأ في تحديث حالة القناة')
      }
    } catch (error) {
      console.error('خطأ في تحديث حالة القناة:', error)
      toast.error('حدث خطأ في تحديث حالة القناة')
    }
  }

  const handleDelete = async (channelId) => {
    if (window.confirm('هل أنت متأكد من حذف هذه القناة؟')) {
      try {
        console.log('حذف القناة:', channelId)
        const result = await deleteChannel(channelId)
        console.log('نتيجة حذف القناة:', result)
        if (result && result.success) {
          await loadChannelsData() // إعادة تحميل البيانات
          toast.success('تم حذف القناة بنجاح')
        } else {
          toast.error(result?.error || 'حدث خطأ في حذف القناة')
        }
      } catch (error) {
        console.error('خطأ في حذف القناة:', error)
        toast.error('حدث خطأ في حذف القناة')
      }
    }
  }

  const handleAddChannel = async () => {
    try {
      // التحقق من صحة البيانات
      if (!newChannel.name.trim()) {
        toast.error('يرجى إدخال اسم القناة')
        return
      }
      if (!newChannel.url.trim()) {
        toast.error('يرجى إدخال رابط البث')
        return
      }
      
      console.log('إضافة قناة جديدة:', newChannel)
      const result = await addChannel(newChannel)
      console.log('نتيجة إضافة القناة:', result)
      if (result && result.success) {
        await loadChannelsData() // إعادة تحميل البيانات
        setNewChannel({
          name: '',
          category: 'إخبارية',
          url: '',
          logo: '',
          status: 'active',
          country: '',
          language: 'العربية',
          quality: 'HD'
        })
        setShowAddModal(false)
        toast.success('تم إضافة القناة بنجاح')
      } else {
        toast.error(result?.error || 'حدث خطأ في إضافة القناة')
      }
    } catch (error) {
      console.error('خطأ في إضافة القناة:', error)
      toast.error('حدث خطأ في إضافة القناة')
    }
  }

  const handleEditChannel = async () => {
    try {
      // التحقق من صحة البيانات
      if (!selectedChannel.name.trim()) {
        toast.error('يرجى إدخال اسم القناة')
        return
      }
      if (!selectedChannel.url.trim()) {
        toast.error('يرجى إدخال رابط البث')
        return
      }
      
      // تصفية البيانات لإرسال الحقول المطلوبة فقط
      const updateData = {
        name: selectedChannel.name,
        name_ar: selectedChannel.name_ar || selectedChannel.name,
        description: selectedChannel.description,
        logo_url: selectedChannel.logo_url || selectedChannel.logo,
        stream_url: selectedChannel.stream_url || selectedChannel.url,
        backup_stream_url: selectedChannel.backup_stream_url,
        category_id: selectedChannel.category_id,
        country: selectedChannel.country,
        language: selectedChannel.language,
        quality: selectedChannel.quality,
        is_live: selectedChannel.is_live,
        is_active: selectedChannel.is_active,
        viewer_count: selectedChannel.viewer_count,
        rating: selectedChannel.rating,
        sort_order: selectedChannel.sort_order
      }
      
      console.log('تحديث القناة:', selectedChannel.id, updateData)
      const result = await updateChannel(selectedChannel.id, updateData)
      console.log('نتيجة تحديث القناة:', result)
      if (result && result.success) {
        await loadChannelsData() // إعادة تحميل البيانات
        setShowEditModal(false)
        setSelectedChannel(null)
        toast.success('تم تحديث القناة بنجاح')
      } else {
        toast.error(result?.error || 'حدث خطأ في تحديث القناة')
      }
    } catch (error) {
      console.error('خطأ في تحديث القناة:', error)
      toast.error('حدث خطأ في تحديث القناة')
    }
  }

  const openEditModal = (channel) => {
    setSelectedChannel({ ...channel })
    setShowEditModal(true)
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </AdminLayout>
    )
  }

  const categories = ['all', 'إخبارية', 'عامة', 'رياضية', 'أطفال', 'ترفيهية', 'ثقافية', 'وثائقية', 'موسيقية', 'طبخ', 'قنوات مغربية', 'أفلام ومسلسلات', 'تعليمية', 'دينية', 'تقنية', 'صحة وجمال']

  return (
    <AdminLayout title="إدارة القنوات" description="إدارة القنوات والبث والإعدادات">
      <div dir="rtl" className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Link
                  href="/admin"
                  className="text-gray-500 hover:text-gray-700 mr-4"
                  legacyBehavior>
                  <ArrowLeft className="w-6 h-6" />
                </Link>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                    <Tv className="w-8 h-8 text-primary-600 mr-3" />
                    إدارة القنوات التلفزيونية
                  </h1>
                  <p className="text-gray-600 mt-1">إدارة وتحديث القنوات التلفزيونية</p>
                </div>
              </div>
              <button 
                onClick={() => setShowAddModal(true)}
                className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 flex items-center"
              >
                <Plus className="w-5 h-5 mr-2" />
                إضافة قناة جديدة
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Filters */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* البحث */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="البحث في القنوات..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              {/* فلتر الحالة */}
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="all">جميع الحالات</option>
                <option value="active">نشطة</option>
                <option value="inactive">غير نشطة</option>
              </select>

              {/* فلتر الفئة */}
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category === 'all' ? 'جميع الفئات' : category}
                  </option>
                ))}
              </select>

              {/* إحصائيات سريعة */}
              <div className="text-sm text-gray-600">
                <span className="font-medium">{filteredChannels.length}</span> من {channels.length} قناة
              </div>
            </div>
          </div>

          {/* Channels Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredChannels.map((channel) => (
              <div key={channel.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                {/* Channel Header */}
                <div className="p-4 border-b border-gray-100">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center">
                      <img 
                        src={channel.logo_url} 
                        alt={channel.name}
                        className="w-12 h-12 rounded-lg object-cover mr-3"
                      />
                      <div>
                        <h3 className="font-semibold text-gray-900">{channel.name}</h3>
                        <p className="text-sm text-gray-500">{channel.category}</p>
                      </div>
                    </div>
                    <div className="relative">
                      <button className="p-2 hover:bg-gray-100 rounded-lg">
                        <MoreVertical className="w-4 h-4 text-gray-500" />
                      </button>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div className="flex items-center justify-between">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      channel.status === 'active' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {channel.status === 'active' ? 'نشطة' : 'غير نشطة'}
                    </span>
                    <span className="text-xs text-gray-500">{channel.quality}</span>
                  </div>
                </div>

                {/* Channel Stats */}
                <div className="p-4">
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="text-center">
                      <div className="flex items-center justify-center text-blue-600 mb-1">
                        <Eye className="w-4 h-4 mr-1" />
                      </div>
                      <p className="text-sm font-medium text-gray-900">{(channel.viewer_count || 0).toLocaleString()}</p>
                      <p className="text-xs text-gray-500">مشاهد</p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center text-yellow-600 mb-1">
                        <Star className="w-4 h-4 mr-1" />
                      </div>
                      <p className="text-sm font-medium text-gray-900">{(channel.favorites_count || 0).toLocaleString()}</p>
                      <p className="text-xs text-gray-500">مفضلة</p>
                    </div>
                  </div>

                  {/* Channel Info */}
                  <div className="space-y-2 text-sm text-gray-600 mb-4">
                    <div className="flex justify-between">
                      <span>البلد:</span>
                      <span>{channel.country}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>اللغة:</span>
                      <span>{channel.language}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>آخر تحديث:</span>
                      <span>{channel.lastUpdated}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex space-x-2 space-x-reverse">
                    <button 
                      onClick={() => handleStatusChange(channel.id, channel.status === 'active' ? 'inactive' : 'active')}
                      className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        channel.status === 'active'
                          ? 'bg-red-100 text-red-700 hover:bg-red-200'
                          : 'bg-green-100 text-green-700 hover:bg-green-200'
                      }`}
                    >
                      {channel.status === 'active' ? 'إلغاء التفعيل' : 'تفعيل'}
                    </button>
                    <button 
                      onClick={() => openEditModal(channel)}
                      className="px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDelete(channel.id)}
                      className="px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Empty State */}
          {filteredChannels.length === 0 && (
            <div className="text-center py-12">
              <Tv className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد قنوات</h3>
              <p className="text-gray-500 mb-4">لم يتم العثور على قنوات تطابق معايير البحث</p>
              <button 
                onClick={() => setShowAddModal(true)}
                className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700"
              >
                إضافة قناة جديدة
              </button>
            </div>
          )}
        </div>

        {/* Add Channel Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">إضافة قناة جديدة</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">اسم القناة</label>
                  <input
                    type="text"
                    value={newChannel.name}
                    onChange={(e) => setNewChannel({...newChannel, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="أدخل اسم القناة"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">رابط البث</label>
                  <input
                    type="url"
                    value={newChannel.url}
                    onChange={(e) => setNewChannel({...newChannel, url: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="https://example.com/stream.m3u8"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">رابط الشعار</label>
                  <input
                    type="url"
                    value={newChannel.logo_url}
                    onChange={(e) => setNewChannel({...newChannel, logo_url: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="https://example.com/logo.png"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">الفئة</label>
                    <select
                      value={newChannel.category}
                      onChange={(e) => setNewChannel({...newChannel, category: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    >
                      <option value="إخبارية">إخبارية</option>
                      <option value="عامة">عامة</option>
                      <option value="رياضية">رياضية</option>
                      <option value="أطفال">أطفال</option>
                      <option value="ترفيهية">ترفيهية</option>
                      <option value="ثقافية">ثقافية</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">البلد</label>
                    <input
                      type="text"
                      value={newChannel.country}
                      onChange={(e) => setNewChannel({...newChannel, country: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="مصر، السعودية، الإمارات..."
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">اللغة</label>
                    <select
                      value={newChannel.language}
                      onChange={(e) => setNewChannel({...newChannel, language: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    >
                      <option value="العربية">العربية</option>
                      <option value="الإنجليزية">الإنجليزية</option>
                      <option value="الفرنسية">الفرنسية</option>
                      <option value="التركية">التركية</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">جودة البث</label>
                    <select
                      value={newChannel.quality}
                      onChange={(e) => setNewChannel({...newChannel, quality: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    >
                      <option value="HD">HD</option>
                      <option value="SD">SD</option>
                      <option value="4K">4K</option>
                    </select>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">الحالة</label>
                  <select
                    value={newChannel.status}
                    onChange={(e) => setNewChannel({...newChannel, status: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="active">نشطة</option>
                    <option value="inactive">غير نشطة</option>
                  </select>
                </div>
              </div>
              
              <div className="flex space-x-3 space-x-reverse mt-6">
                <button
                  onClick={handleAddChannel}
                  className="flex-1 bg-primary-600 text-white py-2 px-4 rounded-lg hover:bg-primary-700 transition-colors"
                >
                  إضافة القناة
                </button>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  إلغاء
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Channel Modal */}
        {showEditModal && selectedChannel && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">تعديل القناة</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">اسم القناة</label>
                  <input
                    type="text"
                    value={selectedChannel.name}
                    onChange={(e) => setSelectedChannel({...selectedChannel, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">رابط البث</label>
                  <input
                    type="url"
                    value={selectedChannel.url}
                    onChange={(e) => setSelectedChannel({...selectedChannel, url: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">رابط الشعار</label>
                  <input
                    type="url"
                    value={selectedChannel.logo_url}
                    onChange={(e) => setSelectedChannel({...selectedChannel, logo_url: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">الفئة</label>
                    <select
                      value={selectedChannel.category}
                      onChange={(e) => setSelectedChannel({...selectedChannel, category: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    >
                      <option value="إخبارية">إخبارية</option>
                      <option value="عامة">عامة</option>
                      <option value="رياضية">رياضية</option>
                      <option value="أطفال">أطفال</option>
                      <option value="ترفيهية">ترفيهية</option>
                      <option value="ثقافية">ثقافية</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">البلد</label>
                    <input
                      type="text"
                      value={selectedChannel.country}
                      onChange={(e) => setSelectedChannel({...selectedChannel, country: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">اللغة</label>
                    <select
                      value={selectedChannel.language}
                      onChange={(e) => setSelectedChannel({...selectedChannel, language: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    >
                      <option value="العربية">العربية</option>
                      <option value="الإنجليزية">الإنجليزية</option>
                      <option value="الفرنسية">الفرنسية</option>
                      <option value="التركية">التركية</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">جودة البث</label>
                    <select
                      value={selectedChannel.quality}
                      onChange={(e) => setSelectedChannel({...selectedChannel, quality: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    >
                      <option value="HD">HD</option>
                      <option value="SD">SD</option>
                      <option value="4K">4K</option>
                    </select>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">الحالة</label>
                  <select
                    value={selectedChannel.status}
                    onChange={(e) => setSelectedChannel({...selectedChannel, status: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="active">نشطة</option>
                    <option value="inactive">غير نشطة</option>
                  </select>
                </div>
              </div>
              
              <div className="flex space-x-3 space-x-reverse mt-6">
                <button
                  onClick={handleEditChannel}
                  className="flex-1 bg-primary-600 text-white py-2 px-4 rounded-lg hover:bg-primary-700 transition-colors"
                >
                  حفظ التغييرات
                </button>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  إلغاء
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

export default AdminChannels
