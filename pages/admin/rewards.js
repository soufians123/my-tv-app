import React, { useState } from 'react';
import { 
  Gift, 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Star, 
  Trophy, 
  Award, 
  Zap, 
  Target, 
  Users, 
  Calendar, 
  TrendingUp, 
  BarChart3, 
  X,
  Eye,
  Settings,
  Download,
  Upload,
  RefreshCw
} from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';

const AdminRewards = () => {
  // تمت إزالة: const router = useRouter();
  // تمت إزالة: const [user, setUser] = useState(null);
  // تمت إزالة: const [loading, setLoading] = useState(true);
  
  // State for rewards management
  const [rewards, setRewards] = useState([
    {
      id: 1,
      name: 'مكافأة المبتدئ',
      type: 'نقاط',
      value: 100,
      description: 'مكافأة ترحيبية للاعبين الجدد',
      category: 'ترحيبية',
      status: 'active',
      conditions: 'التسجيل في المنصة',
      icon: '🎁',
      color: 'blue',
      totalClaimed: 1250,
      availableCount: 'unlimited',
      validUntil: '2024-12-31',
      createdAt: '2024-01-15',
      analytics: {
        claimRate: 85,
        satisfaction: 92,
        engagement: 78
      }
    },
    {
      id: 2,
      name: 'كأس الذهب',
      type: 'شارة',
      value: 0,
      description: 'شارة خاصة للفائزين في المسابقات',
      category: 'إنجاز',
      status: 'active',
      conditions: 'الفوز في 5 مسابقات',
      icon: '🏆',
      color: 'yellow',
      totalClaimed: 89,
      availableCount: 'unlimited',
      validUntil: 'دائمة',
      createdAt: '2024-01-10',
      analytics: {
        claimRate: 45,
        satisfaction: 96,
        engagement: 88
      }
    },
    {
      id: 3,
      name: 'هدية شهرية',
      type: 'مختلط',
      value: 500,
      description: 'مكافأة شهرية للاعبين النشطين',
      category: 'دورية',
      status: 'active',
      conditions: 'لعب 20 لعبة في الشهر',
      icon: '🎊',
      color: 'purple',
      totalClaimed: 456,
      availableCount: 1000,
      validUntil: '2024-06-30',
      createdAt: '2024-02-01',
      analytics: {
        claimRate: 67,
        satisfaction: 89,
        engagement: 82
      }
    },
    {
      id: 4,
      name: 'نجمة التميز',
      type: 'شارة',
      value: 0,
      description: 'شارة للاعبين المتميزين',
      category: 'تميز',
      status: 'inactive',
      conditions: 'الحصول على تقييم 5 نجوم',
      icon: '⭐',
      color: 'orange',
      totalClaimed: 234,
      availableCount: 'unlimited',
      validUntil: 'دائمة',
      createdAt: '2024-01-20',
      analytics: {
        claimRate: 38,
        satisfaction: 94,
        engagement: 75
      }
    }
  ]);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [viewMode, setViewMode] = useState('grid');
  
  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAnalyticsModal, setShowAnalyticsModal] = useState(false);
  const [selectedReward, setSelectedReward] = useState(null);
  
  // New reward form state
  const [newReward, setNewReward] = useState({
    name: '',
    type: 'نقاط',
    value: 0,
    description: '',
    category: 'ترحيبية',
    conditions: '',
    icon: '🎁',
    color: 'blue',
    availableCount: 'unlimited',
    validUntil: ''
  });
  
  // تمت إزالة useEffect الخاص بالمصادقة وإعادة التوجيه، AdminLayout يتكفل بالحراسة
  
  // Filter and sort rewards
  const filteredRewards = rewards
    .filter(reward => {
      const matchesSearch = reward.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           reward.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || reward.category === selectedCategory;
      const matchesType = selectedType === 'all' || reward.type === selectedType;
      const matchesStatus = selectedStatus === 'all' || reward.status === selectedStatus;
      
      return matchesSearch && matchesCategory && matchesType && matchesStatus;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt) - new Date(a.createdAt);
        case 'oldest':
          return new Date(a.createdAt) - new Date(b.createdAt);
        case 'name':
          return a.name.localeCompare(b.name);
        case 'claimed':
          return b.totalClaimed - a.totalClaimed;
        case 'value':
          return b.value - a.value;
        default:
          return 0;
      }
    });
  
  // Statistics calculations
  const totalRewards = rewards.length;
  const activeRewards = rewards.filter(r => r.status === 'active').length;
  const totalClaimed = rewards.reduce((sum, r) => sum + r.totalClaimed, 0);
  const avgClaimRate = Math.round(rewards.reduce((sum, r) => sum + r.analytics.claimRate, 0) / rewards.length);
  const avgSatisfaction = Math.round(rewards.reduce((sum, r) => sum + r.analytics.satisfaction, 0) / rewards.length);
  
  // Handle functions
  const handleAddReward = () => {
    const reward = {
      id: Date.now(),
      ...newReward,
      status: 'active',
      totalClaimed: 0,
      createdAt: new Date().toISOString().split('T')[0],
      analytics: {
        claimRate: 0,
        satisfaction: 0,
        engagement: 0
      }
    };
    
    setRewards([...rewards, reward]);
    setShowAddModal(false);
    setNewReward({
      name: '',
      type: 'نقاط',
      value: 0,
      description: '',
      category: 'ترحيبية',
      conditions: '',
      icon: '🎁',
      color: 'blue',
      availableCount: 'unlimited',
      validUntil: ''
    });
  };
  
  const handleStatusChange = (id, newStatus) => {
    setRewards(rewards.map(reward => 
      reward.id === id ? { ...reward, status: newStatus } : reward
    ));
  };
  
  const handleDelete = (id) => {
    if (confirm('هل أنت متأكد من حذف هذه المكافأة؟')) {
      setRewards(rewards.filter(reward => reward.id !== id));
    }
  };
  
  const openEditModal = (reward) => {
    setSelectedReward(reward);
    setShowEditModal(true);
  };
  
  const resetFilters = () => {
    setSearchTerm('');
    setSelectedCategory('all');
    setSelectedType('all');
    setSelectedStatus('all');
    setSortBy('newest');
  };
  
  return (
    <AdminLayout title="إدارة المكافآت" description="إدارة وتتبع جميع المكافآت والهدايا">
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 flex items-center space-x-3 space-x-reverse">
                  <Gift className="w-8 h-8 text-yellow-600" />
                  <span>إدارة المكافآت</span>
                </h1>
                <p className="text-gray-600 mt-2">إدارة وتتبع جميع المكافآت والهدايا</p>
              </div>
              <button
                onClick={() => setShowAddModal(true)}
                className="bg-yellow-600 text-white px-6 py-3 rounded-lg hover:bg-yellow-700 transition-colors flex items-center space-x-2 space-x-reverse"
              >
                <Plus className="w-5 h-5" />
                <span>إضافة مكافأة</span>
              </button>
            </div>
          </div>
          
          {/* Filters and Search */}
          <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 mb-6">
              <div className="flex items-center space-x-4 space-x-reverse">
                <div className="relative">
                  <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="البحث في المكافآت..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent w-64"
                  />
                </div>
                
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                >
                  <option value="all">جميع الفئات</option>
                  <option value="ترحيبية">ترحيبية</option>
                  <option value="إنجاز">إنجاز</option>
                  <option value="دورية">دورية</option>
                  <option value="تميز">تميز</option>
                </select>
                
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                >
                  <option value="all">جميع الأنواع</option>
                  <option value="نقاط">نقاط</option>
                  <option value="شارة">شارة</option>
                  <option value="مختلط">مختلط</option>
                </select>
                
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                >
                  <option value="all">جميع الحالات</option>
                  <option value="active">نشط</option>
                  <option value="inactive">غير نشط</option>
                </select>
              </div>
              
              <div className="flex items-center space-x-3 space-x-reverse">
                <button
                  onClick={() => setShowAnalyticsModal(true)}
                  className="flex items-center space-x-2 space-x-reverse px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors"
                >
                  <BarChart3 className="w-4 h-4" />
                  <span>التحليلات</span>
                </button>
                
                <button
                  onClick={resetFilters}
                  className="flex items-center space-x-2 space-x-reverse px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>إعادة تعيين</span>
                </button>
                
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                >
                  <option value="newest">الأحدث</option>
                  <option value="oldest">الأقدم</option>
                  <option value="name">الاسم</option>
                  <option value="claimed">الأكثر طلباً</option>
                  <option value="value">القيمة</option>
                </select>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 space-x-reverse">
              <button
                onClick={() => setShowAnalyticsModal(true)}
                className="flex items-center space-x-2 space-x-reverse px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors"
              >
                <BarChart3 className="w-4 h-4" />
                <span>التحليلات</span>
              </button>
              
              <button
                onClick={resetFilters}
                className="flex items-center space-x-2 space-x-reverse px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                <span>إعادة تعيين</span>
              </button>
              
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
              >
                <option value="newest">الأحدث</option>
                <option value="oldest">الأقدم</option>
                <option value="name">الاسم</option>
                <option value="claimed">الأكثر طلباً</option>
                <option value="value">القيمة</option>
              </select>
            </div>
          </div>
          
          {/* Quick Stats */}
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>عرض {filteredRewards.length} من {totalRewards} مكافأة</span>
            <div className="flex items-center space-x-4 space-x-reverse">
              <span>المكافآت النشطة: {filteredRewards.filter(r => r.status === 'active').length}</span>
              <span>إجمالي المطالبات: {filteredRewards.reduce((sum, r) => sum + r.totalClaimed, 0).toLocaleString()}</span>
            </div>
          </div>
        </div>
        
        {/* Rewards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {filteredRewards.map((reward) => (
            <div key={reward.id} className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
              <div className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3 space-x-reverse">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl bg-${reward.color}-100`}>
                      {reward.icon}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{reward.name}</h3>
                      <p className="text-sm text-gray-600">{reward.category}</p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    reward.status === 'active' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {reward.status === 'active' ? 'نشط' : 'غير نشط'}
                  </span>
                </div>
                
                {/* Description */}
                <p className="text-gray-600 text-sm mb-4">{reward.description}</p>
                
                {/* Reward Details */}
                <div className="space-y-3 mb-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">النوع:</span>
                    <span className="font-medium">{reward.type}</span>
                  </div>
                  
                  {reward.value > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">القيمة:</span>
                      <span className="font-medium text-yellow-600">{reward.value} نقطة</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">المطالبات:</span>
                    <span className="font-medium">{reward.totalClaimed.toLocaleString()}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">معدل المطالبة:</span>
                    <span className="font-medium text-green-600">{reward.analytics.claimRate}%</span>
                  </div>
                </div>
                
                {/* Conditions */}
                <div className="bg-gray-50 p-3 rounded-lg mb-4">
                  <p className="text-xs text-gray-600 mb-1">شروط الحصول:</p>
                  <p className="text-sm font-medium">{reward.conditions}</p>
                </div>
                
                {/* Analytics Preview */}
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-3 rounded-lg mb-4">
                  <div className="flex justify-between items-center text-sm">
                    <div className="text-center">
                      <p className="font-semibold text-blue-600">{reward.analytics.engagement}%</p>
                      <p className="text-xs text-gray-600">المشاركة</p>
                    </div>
                    <div className="text-center">
                      <p className="font-semibold text-green-600">{reward.analytics.satisfaction}%</p>
                      <p className="text-xs text-gray-600">الرضا</p>
                    </div>
                    <div className="text-center">
                      <p className="font-semibold text-purple-600">{reward.analytics.claimRate}%</p>
                      <p className="text-xs text-gray-600">المطالبة</p>
                    </div>
                  </div>
                </div>
                
                {/* Validity */}
                <div className="flex justify-between items-center text-xs text-gray-600 mb-4">
                  <span>صالحة حتى: {reward.validUntil}</span>
                  <span>متاحة: {reward.availableCount === 'unlimited' ? 'غير محدود' : reward.availableCount}</span>
                </div>
                
                {/* Actions */}
                <div className="space-y-3">
                  {/* Primary Actions */}
                  <div className="flex space-x-2 space-x-reverse">
                    <button 
                      onClick={() => handleStatusChange(reward.id, reward.status === 'active' ? 'inactive' : 'active')}
                      className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        reward.status === 'active'
                          ? 'bg-red-100 text-red-700 hover:bg-red-200'
                          : 'bg-green-100 text-green-700 hover:bg-green-200'
                      }`}
                    >
                      {reward.status === 'active' ? 'إلغاء التفعيل' : 'تفعيل'}
                    </button>
                    <button 
                      onClick={() => openEditModal(reward)}
                      className="px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                      title="تعديل المكافأة"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => {
                        setSelectedReward(reward);
                        setShowAnalyticsModal(true);
                      }}
                      className="px-3 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors"
                      title="عرض التحليلات"
                    >
                      <BarChart3 className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDelete(reward.id)}
                      className="px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                      title="حذف المكافأة"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  
                  {/* Secondary Actions */}
                  <div className="flex space-x-2 space-x-reverse text-xs">
                    <button className="flex-1 px-2 py-1 bg-yellow-50 text-yellow-700 rounded border border-yellow-200 hover:bg-yellow-100 transition-colors flex items-center justify-center space-x-1 space-x-reverse">
                      <Eye className="w-3 h-3" />
                      <span>معاينة</span>
                    </button>
                    <button className="flex-1 px-2 py-1 bg-green-50 text-green-700 rounded border border-green-200 hover:bg-green-100 transition-colors flex items-center justify-center space-x-1 space-x-reverse">
                      <Settings className="w-3 h-3" />
                      <span>إعدادات</span>
                    </button>
                    <button className="flex-1 px-2 py-1 bg-gray-50 text-gray-700 rounded border border-gray-200 hover:bg-gray-100 transition-colors flex items-center justify-center space-x-1 space-x-reverse">
                      <Download className="w-3 h-3" />
                      <span>تقرير</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Empty State */}
        {filteredRewards.length === 0 && (
          <div className="text-center py-12">
            <Gift className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد مكافآت</h3>
            <p className="text-gray-600 mb-4">لم يتم العثور على مكافآت تطابق معايير البحث</p>
            <button
              onClick={resetFilters}
              className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition-colors"
            >
              إعادة تعيين الفلاتر
            </button>
          </div>
        )}
      </div>
      
      {/* Add Reward Modal */}
       {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold">إضافة مكافأة جديدة</h3>
              <button 
                onClick={() => setShowAddModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">اسم المكافأة</label>
                  <input
                    type="text"
                    value={newReward.name}
                    onChange={(e) => setNewReward({...newReward, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                    placeholder="أدخل اسم المكافأة"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">نوع المكافأة</label>
                  <select
                    value={newReward.type}
                    onChange={(e) => setNewReward({...newReward, type: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  >
                    <option value="نقاط">نقاط</option>
                    <option value="شارة">شارة</option>
                    <option value="مختلط">مختلط</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">وصف المكافأة</label>
                <textarea
                  value={newReward.description}
                  onChange={(e) => setNewReward({...newReward, description: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  rows="3"
                  placeholder="أدخل وصف المكافأة"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">الفئة</label>
                  <select
                    value={newReward.category}
                    onChange={(e) => setNewReward({...newReward, category: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  >
                    <option value="ترحيبية">ترحيبية</option>
                    <option value="إنجاز">إنجاز</option>
                    <option value="دورية">دورية</option>
                    <option value="تميز">تميز</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">القيمة (نقاط)</label>
                  <input
                    type="number"
                    value={newReward.value}
                    onChange={(e) => setNewReward({...newReward, value: parseInt(e.target.value) || 0})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                    placeholder="0"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">اللون</label>
                  <select
                    value={newReward.color}
                    onChange={(e) => setNewReward({...newReward, color: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  >
                    <option value="blue">أزرق</option>
                    <option value="yellow">أصفر</option>
                    <option value="purple">بنفسجي</option>
                    <option value="green">أخضر</option>
                    <option value="red">أحمر</option>
                    <option value="orange">برتقالي</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">شروط الحصول</label>
                <input
                  type="text"
                  value={newReward.conditions}
                  onChange={(e) => setNewReward({...newReward, conditions: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  placeholder="أدخل شروط الحصول على المكافأة"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">الرمز التعبيري</label>
                  <input
                    type="text"
                    value={newReward.icon}
                    onChange={(e) => setNewReward({...newReward, icon: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                    placeholder="🎁"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">صالحة حتى</label>
                  <input
                    type="date"
                    value={newReward.validUntil}
                    onChange={(e) => setNewReward({...newReward, validUntil: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
            
            <div className="flex space-x-3 space-x-reverse mt-8">
              <button
                onClick={handleAddReward}
                className="flex-1 bg-yellow-600 text-white py-3 px-4 rounded-lg hover:bg-yellow-700 transition-colors font-medium"
              >
                إضافة المكافأة
              </button>
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 bg-gray-300 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-400 transition-colors font-medium"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Analytics Modal */}
      {showAnalyticsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold flex items-center space-x-2 space-x-reverse">
                <BarChart3 className="w-6 h-6 text-purple-600" />
                <span>تحليلات المكافآت الشاملة</span>
              </h3>
              <button 
                onClick={() => setShowAnalyticsModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-blue-600 font-medium">إجمالي المكافآت</p>
                    <p className="text-2xl font-bold text-blue-800">{totalRewards}</p>
                  </div>
                  <Gift className="w-8 h-8 text-blue-600" />
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-green-600 font-medium">المكافآت النشطة</p>
                    <p className="text-2xl font-bold text-green-800">{activeRewards}</p>
                  </div>
                  <Target className="w-8 h-8 text-green-600" />
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-yellow-600 font-medium">إجمالي المطالبات</p>
                    <p className="text-2xl font-bold text-yellow-800">{totalClaimed.toLocaleString()}</p>
                  </div>
                  <Users className="w-8 h-8 text-yellow-600" />
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-purple-600 font-medium">معدل الرضا</p>
                    <p className="text-2xl font-bold text-purple-800">{avgSatisfaction}%</p>
                  </div>
                  <Star className="w-8 h-8 text-purple-600" />
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-50 p-6 rounded-lg">
                <h4 className="font-semibold mb-4 flex items-center space-x-2 space-x-reverse">
                  <TrendingUp className="w-5 h-5 text-gray-600" />
                  <span>أداء المكافآت</span>
                </h4>
                <div className="space-y-4">
                  {rewards.slice(0, 3).map((reward) => (
                    <div key={reward.id} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2 space-x-reverse">
                        <span className="text-lg">{reward.icon}</span>
                        <span className="font-medium">{reward.name}</span>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-green-600">{reward.totalClaimed}</p>
                        <p className="text-xs text-gray-600">مطالبة</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="bg-gray-50 p-6 rounded-lg">
                <h4 className="font-semibold mb-4 flex items-center space-x-2 space-x-reverse">
                  <Calendar className="w-5 h-5 text-gray-600" />
                  <span>إحصائيات عامة</span>
                </h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">متوسط المطالبة:</span>
                    <span className="font-semibold">{avgClaimRate}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">متوسط الرضا:</span>
                    <span className="font-semibold">{avgSatisfaction}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">المكافآت الأكثر شعبية:</span>
                    <span className="font-semibold">نقاط</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">النمو الشهري:</span>
                    <span className="font-semibold text-green-600">+15%</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowAnalyticsModal(false)}
                className="bg-gray-600 text-white py-2 px-6 rounded-lg hover:bg-gray-700 transition-colors"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminRewards;