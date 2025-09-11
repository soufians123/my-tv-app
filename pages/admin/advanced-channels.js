import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/router'
import AdminLayout from '../../components/admin/AdminLayout'
import Link from 'next/link'
import { 
  Tv, 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff, 
  Star, 
  Users, 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Maximize2, 
  Settings, 
  ArrowLeft, 
  Upload, 
  Download, 
  RefreshCw, 
  Grid, 
  List, 
  SortAsc, 
  SortDesc, 
  Calendar, 
  Globe, 
  Wifi, 
  WifiOff, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Info, 
  Copy, 
  ExternalLink, 
  BarChart3, 
  TrendingUp, 
  Heart, 
  Share2, 
  MessageCircle, 
  Bookmark, 
  Flag, 
  Shield, 
  Zap, 
  Clock, 
  MapPin, 
  Tag, 
  Image, 
  Video, 
  Headphones, 
  Radio, 
  Monitor, 
  Smartphone, 
  Tablet, 
  Chrome, 
  Firefox, 
  Safari, 
  Edge
} from 'lucide-react'
import toast from 'react-hot-toast'
import { supabaseChannelsService } from '../../lib/supabaseChannelsService'
import ChannelModals from '../../components/admin/ChannelModals'

const AdvancedChannelsManagement = () => {
  const router = useRouter()
  const [channels, setChannels] = useState([])
  const [filteredChannels, setFilteredChannels] = useState([])
  const [loadingChannels, setLoadingChannels] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedCountry, setSelectedCountry] = useState('all')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [viewMode, setViewMode] = useState('grid') // grid or list
  const [sortBy, setSortBy] = useState('name')
  const [sortOrder, setSortOrder] = useState('asc')
  const [selectedChannels, setSelectedChannels] = useState([])
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showBulkActions, setShowBulkActions] = useState(false)
  const [editingChannel, setEditingChannel] = useState(null)
  const [draggedChannel, setDraggedChannel] = useState(null)
  const [dropZone, setDropZone] = useState(null)
  const [showPreview, setShowPreview] = useState(false)
  const [previewChannel, setPreviewChannel] = useState(null)
  const [showAnalytics, setShowAnalytics] = useState(false)
  const [analyticsChannel, setAnalyticsChannel] = useState(null)
  const [refreshing, setRefreshing] = useState(false)
  
  // Form state for adding/editing channels
  const [formData, setFormData] = useState({
    name: '',
    streaming_url: '',
    logo_url: '',
    category: '',
    country: '',
    language: '',
    quality: 'HD',
    status: 'active',
    description: '',
    tags: [],
    is_premium: false,
    sort_order: 0
  })

  // Categories and countries data
  const categories = [
    'إخبارية', 'عامة', 'رياضية', 'أطفال', 'ترفيهية', 'ثقافية', 'وثائقية', 'موسيقية', 'طبخ', 'قنوات مغربية', 'أفلام ومسلسلات', 'تعليمية', 'دينية', 'تقنية', 'صحة وجمال'
  ]
  
  const countries = [
    'السعودية', 'الإمارات', 'مصر', 'الكويت', 'قطر', 'البحرين', 'عمان', 'الأردن', 'لبنان', 'سوريا', 'العراق', 'المغرب', 'الجزائر', 'تونس', 'ليبيا', 'السودان', 'اليمن'
  ]

  const languages = [
    'العربية', 'الإنجليزية', 'الفرنسية', 'التركية', 'الفارسية', 'الأردية', 'الهندية'
  ]

  const qualities = ['SD', 'HD', 'FHD', '4K']
  const statuses = ['active', 'inactive', 'maintenance', 'blocked']

  useEffect(() => {
    // تتم المصادقة والحراسة عبر AdminLayout الآن
    loadChannels()
  }, [])

  useEffect(() => {
    filterAndSortChannels()
  }, [channels, searchTerm, selectedCategory, selectedCountry, selectedStatus, sortBy, sortOrder])

  const loadChannels = async () => {
    try {
      setLoadingChannels(true)
      const data = await supabaseChannelsService.loadChannels()
      if (data) {
        setChannels(data)
      }
    } catch (error) {
      console.error('خطأ في تحميل القنوات:', error)
      toast.error('حدث خطأ في تحميل القنوات')
    } finally {
      setLoadingChannels(false)
    }
  }

  const filterAndSortChannels = () => {
    let filtered = [...channels]

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(channel => 
        channel.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        channel.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        channel.country?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(channel => channel.category === selectedCategory)
    }

    // Country filter
    if (selectedCountry !== 'all') {
      filtered = filtered.filter(channel => channel.country === selectedCountry)
    }

    // Status filter
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(channel => channel.status === selectedStatus)
    }

    // Sort
    filtered.sort((a, b) => {
      let aValue = a[sortBy] || ''
      let bValue = b[sortBy] || ''
      
      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase()
        bValue = bValue.toLowerCase()
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })

    setFilteredChannels(filtered)
  }

  const handleAddChannel = async () => {
    try {
      if (!formData.name || !formData.streaming_url) {
        toast.error('يرجى ملء الحقول المطلوبة')
        return
      }

      const newChannel = await supabaseChannelsService.createChannel(formData)
      if (newChannel) {
        setChannels([...channels, newChannel])
        setShowAddModal(false)
        resetForm()
        toast.success('تم إضافة القناة بنجاح')
      }
    } catch (error) {
      console.error('خطأ في إضافة القناة:', error)
      toast.error('حدث خطأ في إضافة القناة')
    }
  }

  const handleEditChannel = async () => {
    try {
      if (!formData.name || !formData.streaming_url) {
        toast.error('يرجى ملء الحقول المطلوبة')
        return
      }

      const updatedChannel = await supabaseChannelsService.updateChannel(editingChannel.id, formData)
      if (updatedChannel) {
        setChannels(channels.map(ch => ch.id === editingChannel.id ? updatedChannel : ch))
        setShowEditModal(false)
        setEditingChannel(null)
        resetForm()
        toast.success('تم تحديث القناة بنجاح')
      }
    } catch (error) {
      console.error('خطأ في تحديث القناة:', error)
      toast.error('حدث خطأ في تحديث القناة')
    }
  }

  const handleDeleteChannel = async (channelId) => {
    if (!confirm('هل أنت متأكد من حذف هذه القناة؟')) return

    try {
      await supabaseChannelsService.deleteChannel(channelId)
      setChannels(channels.filter(ch => ch.id !== channelId))
      toast.success('تم حذف القناة بنجاح')
    } catch (error) {
      console.error('خطأ في حذف القناة:', error)
      toast.error('حدث خطأ في حذف القناة')
    }
  }

  const handleBulkDelete = async () => {
    if (!confirm(`هل أنت متأكد من حذف ${selectedChannels.length} قناة؟`)) return

    try {
      for (const channelId of selectedChannels) {
        await supabaseChannelsService.deleteChannel(channelId)
      }
      setChannels(channels.filter(ch => !selectedChannels.includes(ch.id)))
      setSelectedChannels([])
      setShowBulkActions(false)
      toast.success(`تم حذف ${selectedChannels.length} قناة بنجاح`)
    } catch (error) {
      console.error('خطأ في الحذف المجمع:', error)
      toast.error('حدث خطأ في الحذف المجمع')
    }
  }

  const handleBulkStatusChange = async (newStatus) => {
    try {
      for (const channelId of selectedChannels) {
        await supabaseChannelsService.updateChannel(channelId, { status: newStatus })
      }
      setChannels(channels.map(ch => 
        selectedChannels.includes(ch.id) ? { ...ch, status: newStatus } : ch
      ))
      setSelectedChannels([])
      setShowBulkActions(false)
      toast.success(`تم تحديث حالة ${selectedChannels.length} قناة بنجاح`)
    } catch (error) {
      console.error('خطأ في تحديث الحالة المجمعة:', error)
      toast.error('حدث خطأ في تحديث الحالة المجمعة')
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      streaming_url: '',
      logo_url: '',
      category: '',
      country: '',
      language: '',
      quality: 'HD',
      status: 'active',
      description: '',
      tags: [],
      is_premium: false,
      sort_order: 0
    })
  }

  const openEditModal = (channel) => {
    setEditingChannel(channel)
    setFormData({
      name: channel.name || '',
      streaming_url: channel.streaming_url || '',
      logo_url: channel.logo_url || '',
      category: channel.category || '',
      country: channel.country || '',
      language: channel.language || '',
      quality: channel.quality || 'HD',
      status: channel.status || 'active',
      description: channel.description || '',
      tags: channel.tags || [],
      is_premium: channel.is_premium || false,
      sort_order: channel.sort_order || 0
    })
    setShowEditModal(true)
  }

  const handleSelectChannel = (channelId) => {
    if (selectedChannels.includes(channelId)) {
      setSelectedChannels(selectedChannels.filter(id => id !== channelId))
    } else {
      setSelectedChannels([...selectedChannels, channelId])
    }
  }

  const handleSelectAll = () => {
    if (selectedChannels.length === filteredChannels.length) {
      setSelectedChannels([])
    } else {
      setSelectedChannels(filteredChannels.map(ch => ch.id))
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await loadChannels()
    setTimeout(() => setRefreshing(false), 1000)
    toast.success('تم تحديث البيانات بنجاح')
  }

  // Drag and Drop handlers
  const handleDragStart = (e, channel) => {
    setDraggedChannel(channel)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDrop = (e, targetChannel) => {
    e.preventDefault()
    if (draggedChannel && targetChannel && draggedChannel.id !== targetChannel.id) {
      // Reorder channels logic here
      const draggedIndex = channels.findIndex(ch => ch.id === draggedChannel.id)
      const targetIndex = channels.findIndex(ch => ch.id === targetChannel.id)
      
      const newChannels = [...channels]
      const [removed] = newChannels.splice(draggedIndex, 1)
      newChannels.splice(targetIndex, 0, removed)
      
      setChannels(newChannels)
      toast.success('تم إعادة ترتيب القنوات')
    }
    setDraggedChannel(null)
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100'
      case 'inactive': return 'text-gray-600 bg-gray-100'
      case 'maintenance': return 'text-yellow-600 bg-yellow-100'
      case 'blocked': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active': return CheckCircle
      case 'inactive': return XCircle
      case 'maintenance': return AlertCircle
      case 'blocked': return Shield
      default: return Info
    }
  }

  const ChannelCard = ({ channel }) => {
    const StatusIcon = getStatusIcon(channel.status)
    
    return (
      <div 
        className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden hover:shadow-xl transition-all duration-300 group"
        draggable
        onDragStart={(e) => handleDragStart(e, channel)}
        onDragOver={handleDragOver}
        onDrop={(e) => handleDrop(e, channel)}
      >
        {/* Channel Image/Logo */}
        <div className="relative h-48 bg-gradient-to-br from-primary-500 to-blue-600">
          {channel.logo_url ? (
            <img 
              src={channel.logo_url} 
              alt={channel.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.style.display = 'none'
              }}
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <Tv className="w-16 h-16 text-white opacity-50" />
            </div>
          )}
          
          {/* Overlay with actions */}
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
            <div className="flex space-x-2 space-x-reverse">
              <button
                onClick={() => {
                  setPreviewChannel(channel)
                  setShowPreview(true)
                }}
                className="p-2 bg-white rounded-full text-gray-700 hover:bg-gray-100 transition-colors"
                title="معاينة"
              >
                <Eye className="w-4 h-4" />
              </button>
              <button
                onClick={() => openEditModal(channel)}
                className="p-2 bg-white rounded-full text-gray-700 hover:bg-gray-100 transition-colors"
                title="تعديل"
              >
                <Edit className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  setAnalyticsChannel(channel)
                  setShowAnalytics(true)
                }}
                className="p-2 bg-white rounded-full text-gray-700 hover:bg-gray-100 transition-colors"
                title="إحصائيات"
              >
                <BarChart3 className="w-4 h-4" />
              </button>
            </div>
          </div>
          
          {/* Status Badge */}
          <div className="absolute top-3 right-3">
            <div className={`flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(channel.status)}`}>
              <StatusIcon className="w-3 h-3 mr-1" />
              {channel.status === 'active' ? 'نشط' : 
               channel.status === 'inactive' ? 'غير نشط' : 
               channel.status === 'maintenance' ? 'صيانة' : 'محظور'}
            </div>
          </div>
          
          {/* Premium Badge */}
          {channel.is_premium && (
            <div className="absolute top-3 left-3">
              <div className="flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                <Star className="w-3 h-3 mr-1" />
                مميز
              </div>
            </div>
          )}
          
          {/* Selection Checkbox */}
          <div className="absolute bottom-3 left-3">
            <input
              type="checkbox"
              checked={selectedChannels.includes(channel.id)}
              onChange={() => handleSelectChannel(channel.id)}
              className="w-4 h-4 text-primary-600 bg-white border-gray-300 rounded focus:ring-primary-500"
            />
          </div>
        </div>
        
        {/* Channel Info */}
        <div className="p-4">
          <div className="flex items-start justify-between mb-2">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white line-clamp-1">
              {channel.name}
            </h3>
            <div className="flex items-center space-x-1 space-x-reverse">
              <button
                onClick={() => openEditModal(channel)}
                className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <Edit className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleDeleteChannel(channel.id)}
                className="p-1 text-gray-400 hover:text-red-600 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
          
          <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
            {channel.category && (
              <div className="flex items-center">
                <Tag className="w-4 h-4 mr-2" />
                {channel.category}
              </div>
            )}
            {channel.country && (
              <div className="flex items-center">
                <Globe className="w-4 h-4 mr-2" />
                {channel.country}
              </div>
            )}
            {channel.quality && (
              <div className="flex items-center">
                <Monitor className="w-4 h-4 mr-2" />
                {channel.quality}
              </div>
            )}
          </div>
          
          {channel.description && (
            <p className="text-sm text-gray-500 dark:text-gray-500 mt-2 line-clamp-2">
              {channel.description}
            </p>
          )}
          
          {/* Stats */}
          <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100 dark:border-gray-700">
            <div className="flex items-center space-x-4 space-x-reverse text-xs text-gray-500">
              <div className="flex items-center">
                <Users className="w-3 h-3 mr-1" />
                {Math.floor(Math.random() * 1000) + 100}
              </div>
              <div className="flex items-center">
                <Heart className="w-3 h-3 mr-1" />
                {Math.floor(Math.random() * 100) + 10}
              </div>
              <div className="flex items-center">
                <Eye className="w-3 h-3 mr-1" />
                {Math.floor(Math.random() * 5000) + 500}
              </div>
            </div>
            <div className="text-xs text-gray-400">
              {new Date(channel.created_at).toLocaleDateString('ar-SA')}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <AdminLayout title="إدارة القنوات المتقدمة" description="إدارة شاملة للقنوات مع واجهة سحب وإفلات">
      <div className="space-y-6">
        {/* Header Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 space-x-reverse">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              تحديث
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              إضافة قناة
            </button>
          </div>
        </div>
        {/* Filters and Controls */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
              {/* Search */}
              <div className="lg:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="البحث في القنوات..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>
              
              {/* Category Filter */}
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="all">جميع الفئات</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
              
              {/* Country Filter */}
              <select
                value={selectedCountry}
                onChange={(e) => setSelectedCountry(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="all">جميع البلدان</option>
                {countries.map(country => (
                  <option key={country} value={country}>{country}</option>
                ))}
              </select>
              
              {/* Status Filter */}
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="all">جميع الحالات</option>
                <option value="active">نشط</option>
                <option value="inactive">غير نشط</option>
                <option value="maintenance">صيانة</option>
                <option value="blocked">محظور</option>
              </select>
              
              {/* Sort */}
              <div className="flex space-x-2 space-x-reverse">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="name">الاسم</option>
                  <option value="category">الفئة</option>
                  <option value="country">البلد</option>
                  <option value="created_at">تاريخ الإنشاء</option>
                </select>
                <button
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  {sortOrder === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />}
                </button>
              </div>
            </div>
            
            {/* View Mode and Bulk Actions */}
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
              <div className="flex items-center space-x-4 space-x-reverse">
                {/* Select All */}
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={selectedChannels.length === filteredChannels.length && filteredChannels.length > 0}
                    onChange={handleSelectAll}
                    className="w-4 h-4 text-primary-600 bg-white border-gray-300 rounded focus:ring-primary-500 mr-2"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    تحديد الكل ({selectedChannels.length}/{filteredChannels.length})
                  </span>
                </label>
                
                {/* Bulk Actions */}
                {selectedChannels.length > 0 && (
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <button
                      onClick={() => handleBulkStatusChange('active')}
                      className="px-3 py-1 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors text-sm"
                    >
                      تفعيل
                    </button>
                    <button
                      onClick={() => handleBulkStatusChange('inactive')}
                      className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                    >
                      إلغاء تفعيل
                    </button>
                    <button
                      onClick={handleBulkDelete}
                      className="px-3 py-1 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm"
                    >
                      حذف
                    </button>
                  </div>
                )}
              </div>
              
              {/* View Mode Toggle */}
              <div className="flex items-center space-x-2 space-x-reverse">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition-colors ${
                    viewMode === 'grid' 
                      ? 'bg-primary-100 text-primary-600' 
                      : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg transition-colors ${
                    viewMode === 'list' 
                      ? 'bg-primary-100 text-primary-600' 
                      : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
        </div>

        {/* Channels Display */}
        {loadingChannels ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        ) : filteredChannels.length === 0 ? (
          <div className="text-center py-12">
            <Tv className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">لا توجد قنوات</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">لم يتم العثور على قنوات تطابق معايير البحث</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              إضافة قناة جديدة
            </button>
          </div>
        ) : (
          <div className={viewMode === 'grid' 
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' 
            : 'space-y-4'
          }>
            {filteredChannels.map(channel => 
              <ChannelCard key={channel.id} channel={channel} />
            )}
          </div>
        )}

        {/* Channel Modals */}
        <ChannelModals
          showAddModal={showAddModal}
          setShowAddModal={setShowAddModal}
          showEditModal={showEditModal}
          setShowEditModal={setShowEditModal}
          formData={formData}
          setFormData={setFormData}
          handleAddChannel={handleAddChannel}
          handleEditChannel={handleEditChannel}
          editingChannel={editingChannel}
          categories={categories}
          countries={countries}
          languages={languages}
          qualities={qualities}
          statuses={statuses}
        />
      </div>
    </AdminLayout>
  )
}

export default AdvancedChannelsManagement
