import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import {
  Gift,
  Plus,
  Search,
  Filter,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  Calendar,
  Users,
  TrendingUp,
  BarChart3,
  Settings,
  Download,
  RefreshCw,
  Target,
  Star,
  Clock,
  Percent,
  DollarSign,
  Tag,
  X,
  CheckCircle,
  AlertCircle,
  Play,
  Pause,
  Copy,
  Share2
} from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout'

const AdminPromotions = () => {
  // Removed router and local auth states; AdminLayout handles auth and loading
  // const router = useRouter();
  // const [isAuthenticated, setIsAuthenticated] = useState(false);
  // const [loading, setLoading] = useState(true);
  
  // State for promotions management
  const [promotions, setPromotions] = useState([]);
  const [filteredPromotions, setFilteredPromotions] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  
  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAnalyticsModal, setShowAnalyticsModal] = useState(false);
  const [selectedPromotion, setSelectedPromotion] = useState(null);
  
  // New promotion state
  const [newPromotion, setNewPromotion] = useState({
    name: '',
    description: '',
    type: 'خصم',
    category: 'عام',
    discountType: 'percentage',
    discountValue: 0,
    minPurchase: 0,
    maxDiscount: 0,
    startDate: '',
    endDate: '',
    usageLimit: 'unlimited',
    usageCount: 0,
    code: '',
    icon: '🎯',
    color: 'blue',
    conditions: '',
    targetAudience: 'all'
  });

  // Mock promotions data
  const mockPromotions = [
    {
      id: 1,
      name: 'خصم الترحيب',
      description: 'خصم 20% للمستخدمين الجدد على أول عملية شراء',
      type: 'خصم',
      category: 'ترحيبية',
      discountType: 'percentage',
      discountValue: 20,
      minPurchase: 50,
      maxDiscount: 100,
      startDate: '2024-01-01',
      endDate: '2024-12-31',
      usageLimit: 1000,
      usageCount: 245,
      code: 'WELCOME20',
      icon: '👋',
      color: 'blue',
      status: 'active',
      conditions: 'للمستخدمين الجدد فقط',
      targetAudience: 'new_users',
      analytics: {
        views: 5420,
        clicks: 1230,
        conversions: 245,
        conversionRate: 19.9,
        revenue: 12450,
        engagement: 85,
        satisfaction: 92
      },
      createdAt: '2024-01-01',
      updatedAt: '2024-01-15'
    },
    {
      id: 2,
      name: 'عرض نهاية الأسبوع',
      description: 'خصم 15% على جميع المنتجات خلال عطلة نهاية الأسبوع',
      type: 'خصم',
      category: 'موسمية',
      discountType: 'percentage',
      discountValue: 15,
      minPurchase: 30,
      maxDiscount: 75,
      startDate: '2024-01-20',
      endDate: '2024-01-21',
      usageLimit: 'unlimited',
      usageCount: 892,
      code: 'WEEKEND15',
      icon: '🎉',
      color: 'purple',
      status: 'active',
      conditions: 'صالح أيام الجمعة والسبت فقط',
      targetAudience: 'all',
      analytics: {
        views: 8920,
        clicks: 2340,
        conversions: 892,
        conversionRate: 38.1,
        revenue: 26760,
        engagement: 78,
        satisfaction: 88
      },
      createdAt: '2024-01-15',
      updatedAt: '2024-01-20'
    },
    {
      id: 3,
      name: 'شحن مجاني',
      description: 'شحن مجاني على الطلبات التي تزيد عن 100 ريال',
      type: 'شحن',
      category: 'خدمية',
      discountType: 'free_shipping',
      discountValue: 0,
      minPurchase: 100,
      maxDiscount: 25,
      startDate: '2024-01-01',
      endDate: '2024-06-30',
      usageLimit: 'unlimited',
      usageCount: 1567,
      code: 'FREESHIP',
      icon: '🚚',
      color: 'green',
      status: 'active',
      conditions: 'للطلبات أكثر من 100 ريال',
      targetAudience: 'all',
      analytics: {
        views: 12340,
        clicks: 3450,
        conversions: 1567,
        conversionRate: 45.4,
        revenue: 0,
        engagement: 92,
        satisfaction: 95
      },
      createdAt: '2024-01-01',
      updatedAt: '2024-01-10'
    },
    {
      id: 4,
      name: 'عرض الولاء',
      description: 'خصم 25% للعملاء المميزين الذين أجروا أكثر من 5 عمليات شراء',
      type: 'ولاء',
      category: 'تميز',
      discountType: 'percentage',
      discountValue: 25,
      minPurchase: 0,
      maxDiscount: 200,
      startDate: '2024-01-01',
      endDate: '2024-12-31',
      usageLimit: 500,
      usageCount: 123,
      code: 'LOYALTY25',
      icon: '⭐',
      color: 'yellow',
      status: 'active',
      conditions: 'للعملاء الذين أجروا 5+ عمليات شراء',
      targetAudience: 'vip_customers',
      analytics: {
        views: 2340,
        clicks: 890,
        conversions: 123,
        conversionRate: 13.8,
        revenue: 15375,
        engagement: 88,
        satisfaction: 96
      },
      createdAt: '2024-01-01',
      updatedAt: '2024-01-12'
    },
    {
      id: 5,
      name: 'عرض محدود',
      description: 'خصم 50 ريال على الطلبات الأولى للمنتجات الجديدة',
      type: 'خصم',
      category: 'محدودة',
      discountType: 'fixed',
      discountValue: 50,
      minPurchase: 150,
      maxDiscount: 50,
      startDate: '2024-01-25',
      endDate: '2024-02-25',
      usageLimit: 100,
      usageCount: 67,
      code: 'LIMITED50',
      icon: '⚡',
      color: 'red',
      status: 'paused',
      conditions: 'للمنتجات الجديدة فقط',
      targetAudience: 'all',
      analytics: {
        views: 4560,
        clicks: 1120,
        conversions: 67,
        conversionRate: 5.9,
        revenue: 10050,
        engagement: 65,
        satisfaction: 82
      },
      createdAt: '2024-01-20',
      updatedAt: '2024-01-25'
    },
    {
      id: 6,
      name: 'عرض المجموعة',
      description: 'اشتري 2 واحصل على الثالث مجاناً من منتجات مختارة',
      type: 'مجموعة',
      category: 'خاصة',
      discountType: 'buy_x_get_y',
      discountValue: 0,
      minPurchase: 0,
      maxDiscount: 0,
      startDate: '2024-02-01',
      endDate: '2024-02-29',
      usageLimit: 200,
      usageCount: 34,
      code: 'BUY2GET1',
      icon: '🎁',
      color: 'orange',
      status: 'scheduled',
      conditions: 'على منتجات مختارة فقط',
      targetAudience: 'all',
      analytics: {
        views: 1230,
        clicks: 340,
        conversions: 34,
        conversionRate: 10.0,
        revenue: 5100,
        engagement: 72,
        satisfaction: 89
      },
      createdAt: '2024-01-25',
      updatedAt: '2024-01-25'
    }
  ];
  
  // Authentication check - removed in favor of AdminLayout auth handling
  // useEffect(() => {
  //   const checkAuth = () => {
  //     const token = localStorage.getItem('adminToken');
  //     if (!token) {
  //       router.push('/auth/login');
  //       return;
  //     }
  //     setIsAuthenticated(true);
  //     setLoading(false);
  //   };
  //   
  //   checkAuth();
  // }, [router]);
  
  // Initialize promotions once on mount
  useEffect(() => {
    setPromotions(mockPromotions);
    setFilteredPromotions(mockPromotions);
  }, []);

  // Filter and search promotions
  useEffect(() => {
    let filtered = promotions;
    
    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(promotion =>
        promotion.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        promotion.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        promotion.code.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(promotion => promotion.category === selectedCategory);
    }
    
    // Type filter
    if (selectedType !== 'all') {
      filtered = filtered.filter(promotion => promotion.type === selectedType);
    }
    
    // Status filter
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(promotion => promotion.status === selectedStatus);
    }
    
    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt) - new Date(a.createdAt);
        case 'oldest':
          return new Date(a.createdAt) - new Date(b.createdAt);
        case 'name':
          return a.name.localeCompare(b.name);
        case 'usage':
          return b.usageCount - a.usageCount;
        case 'conversion':
          return b.analytics.conversionRate - a.analytics.conversionRate;
        default:
          return 0;
      }
    });
    
    setFilteredPromotions(filtered);
  }, [promotions, searchTerm, selectedCategory, selectedType, selectedStatus, sortBy]);

  // Calculate statistics
  const totalPromotions = promotions.length;
  const activePromotions = promotions.filter(p => p.status === 'active').length;
  const totalUsage = promotions.reduce((sum, p) => sum + p.usageCount, 0);
  const totalRevenue = promotions.reduce((sum, p) => sum + p.analytics.revenue, 0);
  const avgConversionRate = promotions.length > 0 
    ? (promotions.reduce((sum, p) => sum + p.analytics.conversionRate, 0) / promotions.length).toFixed(1)
    : 0;
  const avgSatisfaction = promotions.length > 0
    ? Math.round(promotions.reduce((sum, p) => sum + p.analytics.satisfaction, 0) / promotions.length)
    : 0;

  // Handle functions
  const handleAddPromotion = () => {
    if (newPromotion.id) {
      // Edit existing promotion
      setPromotions(promotions.map(p => 
        p.id === newPromotion.id ? { ...newPromotion, updatedAt: new Date().toISOString().split('T')[0] } : p
      ));
    } else {
      // Add new promotion
      const promotion = {
        ...newPromotion,
        id: Date.now(),
        status: 'active',
        usageCount: 0,
        analytics: {
          views: 0,
          clicks: 0,
          conversions: 0,
          conversionRate: 0,
          revenue: 0,
          engagement: 0,
          satisfaction: 0
        },
        createdAt: new Date().toISOString().split('T')[0],
        updatedAt: new Date().toISOString().split('T')[0]
      };
      setPromotions([promotion, ...promotions]);
    }
    
    setShowAddModal(false);
    setNewPromotion({
      name: '',
      description: '',
      type: 'خصم',
      category: 'عام',
      discountType: 'percentage',
      discountValue: 0,
      minPurchase: 0,
      maxDiscount: 0,
      startDate: '',
      endDate: '',
      usageLimit: 'unlimited',
      usageCount: 0,
      code: '',
      icon: '🎯',
      color: 'blue',
      conditions: '',
      targetAudience: 'all'
    });
  };
  
  const handleStatusChange = (id, newStatus) => {
    setPromotions(promotions.map(promotion =>
      promotion.id === id ? { ...promotion, status: newStatus } : promotion
    ));
  };

  const openEditModal = (promotion) => {
    setNewPromotion({
      ...promotion,
      startDate: promotion.startDate,
      endDate: promotion.endDate
    });
    setShowAddModal(true);
  };
  
  const handleDelete = (id) => {
    if (confirm('هل أنت متأكد من حذف هذا العرض؟')) {
      setPromotions(promotions.filter(p => p.id !== id));
    }
  };
  
  const resetFilters = () => {
    setSearchTerm('');
    setSelectedCategory('all');
    setSelectedType('all');
    setSelectedStatus('all');
    setSortBy('newest');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'expired': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  
  const getStatusIcon = (status) => {
    switch (status) {
      case 'active': return <CheckCircle className="w-4 h-4" />;
      case 'paused': return <Pause className="w-4 h-4" />;
      case 'scheduled': return <Clock className="w-4 h-4" />;
      case 'expired': return <AlertCircle className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };
  
  const getStatusText = (status) => {
    switch (status) {
      case 'active': return 'نشط';
      case 'paused': return 'متوقف';
      case 'scheduled': return 'مجدول';
      case 'expired': return 'منتهي';
      default: return 'غير معروف';
    }
  };

  // Remove local loading branch; AdminLayout handles loading state
  // if (loading) {
  //   return (
  //     <AdminLayout title="إدارة العروض الترويجية" description="إدارة وتتبع جميع العروض والحملات الترويجية">
  //       <div className="min-h-screen bg-gray-50 flex items-center justify-center">
  //         <div className="text-center">
  //           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-600 mx-auto mb-4"></div>
  //           <p className="text-gray-600">جاري التحميل...</p>
  //         </div>
  //       </div>
  //     </AdminLayout>
  //   );
  // }
  
  // if (!isAuthenticated) {
  //   return null;
  // }
  
  return (
    <AdminLayout title="إدارة العروض الترويجية" description="إدارة وتتبع جميع العروض والحملات الترويجية">
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">إدارة العروض الترويجية</h1>
              <p className="text-gray-600">إدارة وتتبع جميع العروض والحملات الترويجية</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 mt-4 sm:mt-0 w-full sm:w-auto">
              <button
                onClick={() => setShowAnalyticsModal(true)}
                className="mobile-touch-target control-button flex items-center justify-center gap-2 px-4 py-3 sm:py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors min-h-[44px] text-sm sm:text-base"
              >
                <BarChart3 className="w-5 h-5 sm:w-4 sm:h-4" />
                التحليلات
              </button>
              <button
                onClick={() => setShowAddModal(true)}
                className="mobile-touch-target control-button flex items-center justify-center gap-2 px-4 py-3 sm:py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors min-h-[44px] text-sm sm:text-base"
              >
                <Plus className="w-5 h-5 sm:w-4 sm:h-4" />
                إضافة عرض جديد
              </button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6 mb-8">
            <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-gray-600">إجمالي العروض</p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900">{totalPromotions}</p>
                </div>
                <div className="p-2 sm:p-3 bg-blue-100 rounded-lg">
                  <Gift className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                </div>
              </div>
            </div>
            
            <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-gray-600">العروض النشطة</p>
                  <p className="text-xl sm:text-2xl font-bold text-green-600">{activePromotions}</p>
                </div>
                <div className="p-2 sm:p-3 bg-green-100 rounded-lg">
                  <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
                </div>
              </div>
            </div>
            
            <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-gray-600">إجمالي الاستخدام</p>
                  <p className="text-xl sm:text-2xl font-bold text-purple-600">{totalUsage.toLocaleString()}</p>
                </div>
                <div className="p-2 sm:p-3 bg-purple-100 rounded-lg">
                  <Users className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
                </div>
              </div>
            </div>
            
            <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-gray-600">إجمالي الإيرادات</p>
                  <p className="text-xl sm:text-2xl font-bold text-yellow-600">{totalRevenue.toLocaleString()} ر.س</p>
                </div>
                <div className="p-2 sm:p-3 bg-yellow-100 rounded-lg">
                  <DollarSign className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-600" />
                </div>
              </div>
            </div>
            
            <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-gray-600">معدل التحويل</p>
                  <p className="text-xl sm:text-2xl font-bold text-indigo-600">{avgConversionRate}%</p>
                </div>
                <div className="p-2 sm:p-3 bg-indigo-100 rounded-lg">
                  <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-600" />
                </div>
              </div>
            </div>
            
            <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-gray-600">متوسط الرضا</p>
                  <p className="text-xl sm:text-2xl font-bold text-pink-600">{avgSatisfaction}%</p>
                </div>
                <div className="p-2 sm:p-3 bg-pink-100 rounded-lg">
                  <Star className="w-5 h-5 sm:w-6 sm:h-6 text-pink-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-8">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="البحث في العروض..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  />
                </div>
              </div>
              
              {/* Category Filter */}
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
              >
                <option value="all">جميع الفئات</option>
                <option value="ترحيبية">ترحيبية</option>
                <option value="موسمية">موسمية</option>
                <option value="خدمية">خدمية</option>
                <option value="تميز">تميز</option>
                <option value="محدودة">محدودة</option>
                <option value="خاصة">خاصة</option>
                <option value="عام">عام</option>
              </select>
              
              {/* Type Filter */}
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
              >
                <option value="all">جميع الأنواع</option>
                <option value="خصم">خصم</option>
                <option value="شحن">شحن</option>
                <option value="ولاء">ولاء</option>
                <option value="مجموعة">مجموعة</option>
              </select>
              
              {/* Status Filter */}
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
              >
                <option value="all">جميع الحالات</option>
                <option value="active">نشط</option>
                <option value="paused">متوقف</option>
                <option value="scheduled">مجدول</option>
                <option value="expired">منتهي</option>
              </select>
              
              {/* Sort */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
              >
                <option value="newest">الأحدث</option>
                <option value="oldest">الأقدم</option>
                <option value="name">الاسم</option>
                <option value="usage">الاستخدام</option>
                <option value="conversion">معدل التحويل</option>
              </select>
              
              {/* Reset Filters */}
              <button
                onClick={resetFilters}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                إعادة تعيين
              </button>
            </div>
          </div>

          {/* Promotions Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {filteredPromotions.length > 0 ? (
              filteredPromotions.map((promotion) => (
                <div key={promotion.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                  <div className="p-6">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`text-2xl p-2 rounded-lg bg-${promotion.color}-100`}>
                          {promotion.icon}
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{promotion.name}</h3>
                          <p className="text-sm text-gray-500">{promotion.category}</p>
                        </div>
                      </div>
                      <div className="relative">
                        <button className="p-1 hover:bg-gray-100 rounded">
                          <MoreVertical className="w-4 h-4 text-gray-400" />
                        </button>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">{promotion.description}</p>

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <p className="text-lg font-bold text-gray-900">{promotion.usageCount}</p>
                        <p className="text-xs text-gray-500">مرات الاستخدام</p>
                      </div>
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <p className="text-lg font-bold text-green-600">{promotion.analytics.conversionRate}%</p>
                        <p className="text-xs text-gray-500">معدل التحويل</p>
                      </div>
                    </div>

                    {/* Discount Info */}
                    <div className="mb-4">
                      {promotion.discountType === 'percentage' && (
                        <div className="flex items-center gap-2 text-yellow-600">
                          <Percent className="w-4 h-4" />
                          <span className="font-semibold">{promotion.discountValue}% خصم</span>
                        </div>
                      )}
                      {promotion.discountType === 'fixed' && (
                        <div className="flex items-center gap-2 text-green-600">
                          <DollarSign className="w-4 h-4" />
                          <span className="font-semibold">{promotion.discountValue} ر.س خصم</span>
                        </div>
                      )}
                      {promotion.discountType === 'free_shipping' && (
                        <div className="flex items-center gap-2 text-blue-600">
                          <Gift className="w-4 h-4" />
                          <span className="font-semibold">شحن مجاني</span>
                        </div>
                      )}
                    </div>

                    {/* Code */}
                    <div className="mb-4">
                      <div className="flex items-center gap-2 p-2 bg-gray-100 rounded-lg">
                        <Tag className="w-4 h-4 text-gray-500" />
                        <code className="text-sm font-mono text-gray-700">{promotion.code}</code>
                        <button className="ml-auto p-1 hover:bg-gray-200 rounded">
                          <Copy className="w-3 h-3 text-gray-500" />
                        </button>
                      </div>
                    </div>

                    {/* Status */}
                    <div className="flex items-center justify-between mb-4">
                      <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(promotion.status)}`}>
                        {getStatusIcon(promotion.status)}
                        {getStatusText(promotion.status)}
                      </div>
                      <div className="text-xs text-gray-500">
                        {promotion.startDate} - {promotion.endDate}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => openEditModal(promotion)}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                        تعديل
                      </button>
                      <button
                        onClick={() => setSelectedPromotion(promotion)}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                        عرض
                      </button>
                      <button
                        onClick={() => handleStatusChange(promotion.id, promotion.status === 'active' ? 'paused' : 'active')}
                        className={`px-3 py-2 rounded-lg transition-colors ${
                          promotion.status === 'active'
                            ? 'bg-yellow-500 text-yellow-600 hover:bg-yellow-100'
                            : 'bg-green-50 text-green-600 hover:bg-green-100'
                        }`}
                      >
                        {promotion.status === 'active' ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => handleDelete(promotion.id)}
                        className="px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <Gift className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد عروض</h3>
                <p className="text-gray-500 mb-4">لم يتم العثور على عروض تطابق معايير البحث</p>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  إضافة عرض جديد
                </button>
              </div>
            )}
          </div>

          {/* Add/Edit Promotion Modal */}
          {showAddModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4 z-50">
              <div className="bg-white rounded-xl max-w-2xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
                <div className="p-4 sm:p-6 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg sm:text-xl font-bold text-gray-900">
                      {newPromotion.id ? 'تعديل العرض' : 'إضافة عرض جديد'}
                    </h2>
                    <button
                      onClick={() => setShowAddModal(false)}
                      className="mobile-touch-target control-button p-2 hover:bg-gray-100 rounded-lg transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                    >
                      <X className="w-5 h-5 text-gray-500" />
                    </button>
                  </div>
                </div>
                
                <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
                  {/* Basic Info */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">اسم العرض</label>
                      <input
                        type="text"
                        value={newPromotion.name}
                        onChange={(e) => setNewPromotion({...newPromotion, name: e.target.value})}
                        className="mobile-touch-target w-full px-3 py-3 sm:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent text-base"
                        placeholder="أدخل اسم العرض"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">رمز العرض</label>
                      <input
                        type="text"
                        value={newPromotion.code}
                        onChange={(e) => setNewPromotion({...newPromotion, code: e.target.value.toUpperCase()})}
                        className="mobile-touch-target w-full px-3 py-3 sm:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent text-base"
                        placeholder="PROMO2024"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">وصف العرض</label>
                    <textarea
                      value={newPromotion.description}
                      onChange={(e) => setNewPromotion({...newPromotion, description: e.target.value})}
                      rows={3}
                      className="mobile-touch-target w-full px-3 py-3 sm:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent text-base resize-none"
                      placeholder="أدخل وصف العرض"
                    />
                  </div>
                  
                  {/* Type and Category */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">نوع العرض</label>
                      <select
                        value={newPromotion.type}
                        onChange={(e) => setNewPromotion({...newPromotion, type: e.target.value})}
                        className="mobile-touch-target w-full px-3 py-3 sm:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent text-base"
                      >
                        <option value="خصم">خصم</option>
                        <option value="شحن">شحن</option>
                        <option value="ولاء">ولاء</option>
                        <option value="مجموعة">مجموعة</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">فئة العرض</label>
                      <select
                        value={newPromotion.category}
                        onChange={(e) => setNewPromotion({...newPromotion, category: e.target.value})}
                        className="mobile-touch-target w-full px-3 py-3 sm:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent text-base"
                      >
                        <option value="عام">عام</option>
                        <option value="ترحيبية">ترحيبية</option>
                        <option value="موسمية">موسمية</option>
                        <option value="خدمية">خدمية</option>
                        <option value="تميز">تميز</option>
                        <option value="محدودة">محدودة</option>
                        <option value="خاصة">خاصة</option>
                      </select>
                    </div>
                  </div>
                  
                  {/* Discount Settings */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">نوع الخصم</label>
                      <select
                        value={newPromotion.discountType}
                        onChange={(e) => setNewPromotion({...newPromotion, discountType: e.target.value})}
                        className="mobile-touch-target w-full px-3 py-3 sm:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent text-base"
                      >
                        <option value="percentage">نسبة مئوية</option>
                        <option value="fixed">مبلغ ثابت</option>
                        <option value="free_shipping">شحن مجاني</option>
                        <option value="buy_x_get_y">اشتري واحصل</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">قيمة الخصم</label>
                      <input
                        type="number"
                        value={newPromotion.discountValue}
                        onChange={(e) => setNewPromotion({...newPromotion, discountValue: parseFloat(e.target.value) || 0})}
                        className="mobile-touch-target w-full px-3 py-3 sm:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent text-base"
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">الحد الأدنى للشراء</label>
                      <input
                        type="number"
                        value={newPromotion.minPurchase}
                        onChange={(e) => setNewPromotion({...newPromotion, minPurchase: parseFloat(e.target.value) || 0})}
                        className="mobile-touch-target w-full px-3 py-3 sm:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent text-base"
                        placeholder="0"
                      />
                    </div>
                  </div>
                  
                  {/* Date Range */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">تاريخ البداية</label>
                      <input
                        type="date"
                        value={newPromotion.startDate}
                        onChange={(e) => setNewPromotion({...newPromotion, startDate: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">تاريخ النهاية</label>
                      <input
                        type="date"
                        value={newPromotion.endDate}
                        onChange={(e) => setNewPromotion({...newPromotion, endDate: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                  
                  {/* Usage Limit and Target Audience */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">حد الاستخدام</label>
                      <select
                        value={newPromotion.usageLimit}
                        onChange={(e) => setNewPromotion({...newPromotion, usageLimit: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                      >
                        <option value="unlimited">غير محدود</option>
                        <option value="100">100 مرة</option>
                        <option value="500">500 مرة</option>
                        <option value="1000">1000 مرة</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">الجمهور المستهدف</label>
                      <select
                        value={newPromotion.targetAudience}
                        onChange={(e) => setNewPromotion({...newPromotion, targetAudience: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                      >
                        <option value="all">جميع العملاء</option>
                        <option value="new_users">العملاء الجدد</option>
                        <option value="vip_customers">العملاء المميزون</option>
                      </select>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">شروط العرض</label>
                    <textarea
                      value={newPromotion.conditions}
                      onChange={(e) => setNewPromotion({...newPromotion, conditions: e.target.value})}
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                      placeholder="أدخل شروط وأحكام العرض"
                    />
                  </div>
                </div>
                
                <div className="p-4 sm:p-6 border-t border-gray-200 flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={handleAddPromotion}
                    className="mobile-touch-target control-button flex-1 bg-yellow-600 text-white py-3 sm:py-2 px-4 rounded-lg hover:bg-yellow-700 transition-colors min-h-[44px] text-base font-medium"
                  >
                    {newPromotion.id ? 'تحديث العرض' : 'إضافة العرض'}
                  </button>
                  <button
                    onClick={() => setShowAddModal(false)}
                    className="mobile-touch-target control-button px-6 py-3 sm:py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors min-h-[44px] text-base font-medium"
                  >
                    إلغاء
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Analytics Modal */}
          {showAnalyticsModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4 z-50">
              <div className="bg-white rounded-xl max-w-4xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
                <div className="p-4 sm:p-6 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg sm:text-xl font-bold text-gray-900">تحليلات العروض الترويجية</h2>
                    <button
                      onClick={() => setShowAnalyticsModal(false)}
                      className="mobile-touch-target control-button p-2 hover:bg-gray-100 rounded-lg transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                    >
                      <X className="w-5 h-5 text-gray-500" />
                    </button>
                  </div>
                </div>
                
                <div className="p-4 sm:p-6">
                  {/* Overview Stats */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
                    <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4 sm:p-6 rounded-xl text-white">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-blue-100 text-sm">إجمالي المشاهدات</p>
                          <p className="text-2xl font-bold">{promotions.reduce((sum, p) => sum + p.analytics.views, 0).toLocaleString()}</p>
                        </div>
                        <Eye className="w-8 h-8 text-blue-200" />
                      </div>
                    </div>
                    
                    <div className="bg-gradient-to-r from-green-500 to-green-600 p-6 rounded-xl text-white">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-green-100 text-sm">إجمالي النقرات</p>
                          <p className="text-2xl font-bold">{promotions.reduce((sum, p) => sum + p.analytics.clicks, 0).toLocaleString()}</p>
                        </div>
                        <Target className="w-8 h-8 text-green-200" />
                      </div>
                    </div>
                    
                    <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-6 rounded-xl text-white">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-purple-100 text-sm">إجمالي التحويلات</p>
                          <p className="text-2xl font-bold">{promotions.reduce((sum, p) => sum + p.analytics.conversions, 0).toLocaleString()}</p>
                        </div>
                        <TrendingUp className="w-8 h-8 text-purple-200" />
                      </div>
                    </div>
                    
                    <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 p-6 rounded-xl text-white">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-yellow-100 text-sm">متوسط التفاعل</p>
                          <p className="text-2xl font-bold">{Math.round(promotions.reduce((sum, p) => sum + p.analytics.engagement, 0) / promotions.length)}%</p>
                        </div>
                        <Star className="w-8 h-8 text-yellow-200" />
                      </div>
                    </div>
                  </div>
                  
                  {/* Top Performing Promotions */}
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">أفضل العروض أداءً</h3>
                    <div className="space-y-4">
                      {promotions
                        .sort((a, b) => b.analytics.conversionRate - a.analytics.conversionRate)
                        .slice(0, 5)
                        .map((promotion, index) => (
                          <div key={promotion.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                            <div className="flex items-center gap-4">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                                index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : index === 2 ? 'bg-orange-500' : 'bg-blue-500'
                              }`}>
                                {index + 1}
                              </div>
                              <div>
                                <h4 className="font-medium text-gray-900">{promotion.name}</h4>
                                <p className="text-sm text-gray-500">{promotion.code}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold text-gray-900">{promotion.analytics.conversionRate}%</p>
                              <p className="text-sm text-gray-500">{promotion.analytics.conversions} تحويل</p>
                            </div>
                          </div>
                        ))
                      }
                    </div>
                  </div>
                  
                  {/* Performance Metrics */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white border border-gray-200 rounded-xl p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">معدلات الأداء</h3>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">معدل النقر (CTR)</span>
                          <span className="font-semibold text-blue-600">
                            {((promotions.reduce((sum, p) => sum + p.analytics.clicks, 0) / promotions.reduce((sum, p) => sum + p.analytics.views, 0)) * 100).toFixed(1)}%
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">معدل التحويل العام</span>
                          <span className="font-semibold text-green-600">{avgConversionRate}%</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">متوسط الرضا</span>
                          <span className="font-semibold text-purple-600">{avgSatisfaction}%</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">الإيرادات المحققة</span>
                          <span className="font-semibold text-yellow-600">{totalRevenue.toLocaleString()} ر.س</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-white border border-gray-200 rounded-xl p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">توزيع العروض</h3>
                      <div className="space-y-4">
                        {['خصم', 'شحن', 'ولاء', 'مجموعة'].map(type => {
                          const count = promotions.filter(p => p.type === type).length;
                          const percentage = ((count / totalPromotions) * 100).toFixed(1);
                          return (
                            <div key={type} className="flex justify-between items-center">
                              <span className="text-gray-600">{type}</span>
                              <div className="flex items-center gap-2">
                                <div className="w-20 bg-gray-200 rounded-full h-2">
                                  <div 
                                    className="bg-blue-600 h-2 rounded-full" 
                                    style={{ width: `${percentage}%` }}
                                  ></div>
                                </div>
                                <span className="text-sm font-medium text-gray-900 w-12">{count}</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
    );
  };

  export default AdminPromotions;