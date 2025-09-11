import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, Edit, Trash2, Eye, Play, Pause, BarChart3, Target, MousePointer, DollarSign, TrendingUp, Calendar, Users, Globe } from 'lucide-react';

const CampaignsManagement = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [filteredCampaigns, setFilteredCampaigns] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAnalyticsModal, setShowAnalyticsModal] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    type: 'display',
    status: 'draft',
    budget: '',
    startDate: '',
    endDate: '',
    targetAudience: '',
    description: '',
    platforms: [],
    keywords: '',
    ageMin: 18,
    ageMax: 65
  });

  // Mock data for campaigns
  const mockCampaigns = [
    {
      id: 1,
      name: 'حملة العروض الصيفية',
      type: 'display',
      status: 'active',
      budget: 5000,
      spent: 2300,
      impressions: 125000,
      clicks: 3200,
      conversions: 85,
      ctr: 2.56,
      cpc: 0.72,
      conversionRate: 2.66,
      startDate: '2024-06-01',
      endDate: '2024-08-31',
      targetAudience: 'الشباب 18-35',
      platforms: ['facebook', 'google', 'instagram']
    },
    {
      id: 2,
      name: 'حملة المنتجات الجديدة',
      type: 'search',
      status: 'paused',
      budget: 3000,
      spent: 1800,
      impressions: 89000,
      clicks: 2100,
      conversions: 45,
      ctr: 2.36,
      cpc: 0.86,
      conversionRate: 2.14,
      startDate: '2024-07-15',
      endDate: '2024-09-15',
      targetAudience: 'النساء 25-45',
      platforms: ['google', 'bing']
    },
    {
      id: 3,
      name: 'حملة العلامة التجارية',
      type: 'video',
      status: 'completed',
      budget: 8000,
      spent: 7800,
      impressions: 250000,
      clicks: 5600,
      conversions: 120,
      ctr: 2.24,
      cpc: 1.39,
      conversionRate: 2.14,
      startDate: '2024-05-01',
      endDate: '2024-06-30',
      targetAudience: 'جميع الأعمار',
      platforms: ['youtube', 'facebook', 'instagram']
    }
  ];

  const campaignTypes = [
    { value: 'display', label: 'إعلانات العرض' },
    { value: 'search', label: 'إعلانات البحث' },
    { value: 'video', label: 'إعلانات الفيديو' },
    { value: 'social', label: 'إعلانات وسائل التواصل' },
    { value: 'email', label: 'التسويق عبر البريد الإلكتروني' }
  ];

  const campaignStatuses = [
    { value: 'draft', label: 'مسودة', color: 'gray' },
    { value: 'active', label: 'نشطة', color: 'green' },
    { value: 'paused', label: 'متوقفة مؤقتاً', color: 'yellow' },
    { value: 'completed', label: 'مكتملة', color: 'blue' },
    { value: 'cancelled', label: 'ملغية', color: 'red' }
  ];

  const platforms = [
    { value: 'google', label: 'Google Ads', icon: '🔍' },
    { value: 'facebook', label: 'Facebook', icon: '📘' },
    { value: 'instagram', label: 'Instagram', icon: '📷' },
    { value: 'youtube', label: 'YouTube', icon: '📺' },
    { value: 'linkedin', label: 'LinkedIn', icon: '💼' },
    { value: 'twitter', label: 'Twitter', icon: '🐦' },
    { value: 'bing', label: 'Bing Ads', icon: '🔎' }
  ];

  useEffect(() => {
    setCampaigns(mockCampaigns);
    setFilteredCampaigns(mockCampaigns);
  }, []);

  useEffect(() => {
    let filtered = campaigns.filter(campaign => {
      const matchesSearch = campaign.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          campaign.targetAudience.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === 'all' || campaign.status === filterStatus;
      const matchesType = filterType === 'all' || campaign.type === filterType;
      return matchesSearch && matchesStatus && matchesType;
    });
    setFilteredCampaigns(filtered);
  }, [campaigns, searchTerm, filterStatus, filterType]);

  const formatNumber = (num) => {
    return new Intl.NumberFormat('ar-SA').format(num);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('ar-SA', {
      style: 'currency',
      currency: 'SAR'
    }).format(amount);
  };

  const getStatusColor = (status) => {
    const statusObj = campaignStatuses.find(s => s.value === status);
    return statusObj ? statusObj.color : 'gray';
  };

  const getStatusLabel = (status) => {
    const statusObj = campaignStatuses.find(s => s.value === status);
    return statusObj ? statusObj.label : status;
  };

  const getTypeLabel = (type) => {
    const typeObj = campaignTypes.find(t => t.value === type);
    return typeObj ? typeObj.label : type;
  };

  const handleCreateCampaign = () => {
    const newCampaign = {
      id: campaigns.length + 1,
      ...formData,
      budget: parseFloat(formData.budget),
      spent: 0,
      impressions: 0,
      clicks: 0,
      conversions: 0,
      ctr: 0,
      cpc: 0,
      conversionRate: 0
    };
    setCampaigns([...campaigns, newCampaign]);
    setShowCreateModal(false);
    resetForm();
  };

  const handleEditCampaign = () => {
    const updatedCampaigns = campaigns.map(campaign =>
      campaign.id === selectedCampaign.id
        ? { ...campaign, ...formData, budget: parseFloat(formData.budget) }
        : campaign
    );
    setCampaigns(updatedCampaigns);
    setShowEditModal(false);
    resetForm();
  };

  const handleDeleteCampaign = (id) => {
    if (window.confirm('هل أنت متأكد من حذف هذه الحملة؟')) {
      setCampaigns(campaigns.filter(campaign => campaign.id !== id));
    }
  };

  const handleStatusChange = (id, newStatus) => {
    const updatedCampaigns = campaigns.map(campaign =>
      campaign.id === id ? { ...campaign, status: newStatus } : campaign
    );
    setCampaigns(updatedCampaigns);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      type: 'display',
      status: 'draft',
      budget: '',
      startDate: '',
      endDate: '',
      targetAudience: '',
      description: '',
      platforms: [],
      keywords: '',
      ageMin: 18,
      ageMax: 65
    });
  };

  const openEditModal = (campaign) => {
    setSelectedCampaign(campaign);
    setFormData({
      name: campaign.name,
      type: campaign.type,
      status: campaign.status,
      budget: campaign.budget.toString(),
      startDate: campaign.startDate,
      endDate: campaign.endDate,
      targetAudience: campaign.targetAudience,
      description: campaign.description || '',
      platforms: campaign.platforms || [],
      keywords: campaign.keywords || '',
      ageMin: campaign.ageMin || 18,
      ageMax: campaign.ageMax || 65
    });
    setShowEditModal(true);
  };

  const openAnalyticsModal = (campaign) => {
    setSelectedCampaign(campaign);
    setShowAnalyticsModal(true);
  };

  const calculateTotalStats = () => {
    return campaigns.reduce((totals, campaign) => {
      totals.totalBudget += campaign.budget;
      totals.totalSpent += campaign.spent;
      totals.totalImpressions += campaign.impressions;
      totals.totalClicks += campaign.clicks;
      totals.totalConversions += campaign.conversions;
      return totals;
    }, {
      totalBudget: 0,
      totalSpent: 0,
      totalImpressions: 0,
      totalClicks: 0,
      totalConversions: 0
    });
  };

  const stats = calculateTotalStats();

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">إدارة الحملات الإعلانية</h1>
        <p className="text-gray-600">إنشاء وإدارة ومتابعة الحملات الإعلانية والترويجية</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">إجمالي الميزانية</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalBudget)}</p>
            </div>
            <DollarSign className="h-8 w-8 text-blue-500" />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">إجمالي الإنفاق</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalSpent)}</p>
            </div>
            <TrendingUp className="h-8 w-8 text-red-500" />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">إجمالي المشاهدات</p>
              <p className="text-2xl font-bold text-gray-900">{formatNumber(stats.totalImpressions)}</p>
            </div>
            <Eye className="h-8 w-8 text-purple-500" />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">إجمالي النقرات</p>
              <p className="text-2xl font-bold text-gray-900">{formatNumber(stats.totalClicks)}</p>
            </div>
            <MousePointer className="h-8 w-8 text-green-500" />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">إجمالي التحويلات</p>
              <p className="text-2xl font-bold text-gray-900">{formatNumber(stats.totalConversions)}</p>
            </div>
            <Target className="h-8 w-8 text-orange-500" />
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white p-6 rounded-lg shadow-sm border mb-6">
        <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="البحث في الحملات..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-4 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full sm:w-64"
              />
            </div>
            
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">جميع الحالات</option>
              {campaignStatuses.map(status => (
                <option key={status.value} value={status.value}>{status.label}</option>
              ))}
            </select>
            
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">جميع الأنواع</option>
              {campaignTypes.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
          </div>
          
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg flex items-center gap-2 transition-colors"
          >
            <Plus className="h-4 w-4" />
            إنشاء حملة جديدة
          </button>
        </div>
      </div>

      {/* Campaigns Table */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">اسم الحملة</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">النوع</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الحالة</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الميزانية</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الإنفاق</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">المشاهدات</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">النقرات</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">معدل النقر</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredCampaigns.map((campaign) => (
                <tr key={campaign.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{campaign.name}</div>
                      <div className="text-sm text-gray-500">{campaign.targetAudience}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900">{getTypeLabel(campaign.type)}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      getStatusColor(campaign.status) === 'green' ? 'bg-green-100 text-green-800' :
                      getStatusColor(campaign.status) === 'yellow' ? 'bg-yellow-100 text-yellow-800' :
                      getStatusColor(campaign.status) === 'blue' ? 'bg-blue-100 text-blue-800' :
                      getStatusColor(campaign.status) === 'red' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {getStatusLabel(campaign.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatCurrency(campaign.budget)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatCurrency(campaign.spent)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatNumber(campaign.impressions)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatNumber(campaign.clicks)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {campaign.ctr.toFixed(2)}%
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openAnalyticsModal(campaign)}
                        className="text-blue-600 hover:text-blue-900 p-1 rounded"
                        title="عرض التحليلات"
                      >
                        <BarChart3 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => openEditModal(campaign)}
                        className="text-indigo-600 hover:text-indigo-900 p-1 rounded"
                        title="تعديل"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      {campaign.status === 'active' ? (
                        <button
                          onClick={() => handleStatusChange(campaign.id, 'paused')}
                          className="text-yellow-600 hover:text-yellow-900 p-1 rounded"
                          title="إيقاف مؤقت"
                        >
                          <Pause className="h-4 w-4" />
                        </button>
                      ) : campaign.status === 'paused' ? (
                        <button
                          onClick={() => handleStatusChange(campaign.id, 'active')}
                          className="text-green-600 hover:text-green-900 p-1 rounded"
                          title="تشغيل"
                        >
                          <Play className="h-4 w-4" />
                        </button>
                      ) : null}
                      <button
                        onClick={() => handleDeleteCampaign(campaign.id)}
                        className="text-red-600 hover:text-red-900 p-1 rounded"
                        title="حذف"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Campaign Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-gray-900 mb-4">إنشاء حملة جديدة</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">اسم الحملة</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="أدخل اسم الحملة"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">نوع الحملة</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({...formData, type: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {campaignTypes.map(type => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">الحالة</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {campaignStatuses.map(status => (
                      <option key={status.value} value={status.value}>{status.label}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">الميزانية (ريال سعودي)</label>
                <input
                  type="number"
                  value={formData.budget}
                  onChange={(e) => setFormData({...formData, budget: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="أدخل الميزانية"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">تاريخ البداية</label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">تاريخ النهاية</label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">الجمهور المستهدف</label>
                <input
                  type="text"
                  value={formData.targetAudience}
                  onChange={(e) => setFormData({...formData, targetAudience: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="مثال: الشباب 18-35"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">وصف الحملة</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="أدخل وصف الحملة"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">المنصات الإعلانية</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {platforms.map(platform => (
                    <label key={platform.value} className="flex items-center space-x-2 space-x-reverse">
                      <input
                        type="checkbox"
                        checked={formData.platforms.includes(platform.value)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData({...formData, platforms: [...formData.platforms, platform.value]});
                          } else {
                            setFormData({...formData, platforms: formData.platforms.filter(p => p !== platform.value)});
                          }
                        }}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">{platform.icon} {platform.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  resetForm();
                }}
                className="px-4 py-2 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors"
              >
                إلغاء
              </button>
              <button
                onClick={handleCreateCampaign}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                إنشاء الحملة
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Campaign Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-gray-900 mb-4">تعديل الحملة</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">اسم الحملة</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">نوع الحملة</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({...formData, type: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {campaignTypes.map(type => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">الحالة</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {campaignStatuses.map(status => (
                      <option key={status.value} value={status.value}>{status.label}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">الميزانية (ريال سعودي)</label>
                <input
                  type="number"
                  value={formData.budget}
                  onChange={(e) => setFormData({...formData, budget: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">تاريخ البداية</label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">تاريخ النهاية</label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">الجمهور المستهدف</label>
                <input
                  type="text"
                  value={formData.targetAudience}
                  onChange={(e) => setFormData({...formData, targetAudience: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">المنصات الإعلانية</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {platforms.map(platform => (
                    <label key={platform.value} className="flex items-center space-x-2 space-x-reverse">
                      <input
                        type="checkbox"
                        checked={formData.platforms.includes(platform.value)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData({...formData, platforms: [...formData.platforms, platform.value]});
                          } else {
                            setFormData({...formData, platforms: formData.platforms.filter(p => p !== platform.value)});
                          }
                        }}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">{platform.icon} {platform.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setShowEditModal(false);
                  resetForm();
                }}
                className="px-4 py-2 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors"
              >
                إلغاء
              </button>
              <button
                onClick={handleEditCampaign}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                تحديث الحملة
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Analytics Modal */}
      {showAnalyticsModal && selectedCampaign && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">تحليلات الحملة: {selectedCampaign.name}</h2>
              <button
                onClick={() => setShowAnalyticsModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            
            {/* Campaign Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-blue-600 font-medium">المشاهدات</p>
                    <p className="text-2xl font-bold text-blue-900">{formatNumber(selectedCampaign.impressions)}</p>
                  </div>
                  <Eye className="h-8 w-8 text-blue-500" />
                </div>
              </div>
              
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-green-600 font-medium">النقرات</p>
                    <p className="text-2xl font-bold text-green-900">{formatNumber(selectedCampaign.clicks)}</p>
                  </div>
                  <MousePointer className="h-8 w-8 text-green-500" />
                </div>
              </div>
              
              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-purple-600 font-medium">التحويلات</p>
                    <p className="text-2xl font-bold text-purple-900">{formatNumber(selectedCampaign.conversions)}</p>
                  </div>
                  <Target className="h-8 w-8 text-purple-500" />
                </div>
              </div>
              
              <div className="bg-orange-50 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-orange-600 font-medium">إجمالي الإنفاق</p>
                    <p className="text-2xl font-bold text-orange-900">{formatCurrency(selectedCampaign.spent)}</p>
                  </div>
                  <DollarSign className="h-8 w-8 text-orange-500" />
                </div>
              </div>
            </div>
            
            {/* Performance Metrics */}
            <div className="bg-gray-50 p-6 rounded-lg mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">مؤشرات الأداء</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-1">معدل النقر (CTR)</p>
                  <p className="text-2xl font-bold text-blue-600">{selectedCampaign.ctr.toFixed(2)}%</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-1">تكلفة النقرة (CPC)</p>
                  <p className="text-2xl font-bold text-green-600">{formatCurrency(selectedCampaign.cpc)}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-1">معدل التحويل</p>
                  <p className="text-2xl font-bold text-purple-600">{selectedCampaign.conversionRate.toFixed(2)}%</p>
                </div>
              </div>
            </div>
            
            {/* Campaign Details */}
            <div className="bg-white border rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">تفاصيل الحملة</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-gray-600 mb-1">نوع الحملة</p>
                  <p className="font-medium">{getTypeLabel(selectedCampaign.type)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">الجمهور المستهدف</p>
                  <p className="font-medium">{selectedCampaign.targetAudience}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">تاريخ البداية</p>
                  <p className="font-medium">{selectedCampaign.startDate}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">تاريخ النهاية</p>
                  <p className="font-medium">{selectedCampaign.endDate}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">الميزانية المخصصة</p>
                  <p className="font-medium">{formatCurrency(selectedCampaign.budget)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">الميزانية المتبقية</p>
                  <p className="font-medium">{formatCurrency(selectedCampaign.budget - selectedCampaign.spent)}</p>
                </div>
              </div>
              
              {selectedCampaign.platforms && selectedCampaign.platforms.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm text-gray-600 mb-2">المنصات الإعلانية</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedCampaign.platforms.map(platformValue => {
                      const platform = platforms.find(p => p.value === platformValue);
                      return platform ? (
                        <span key={platformValue} className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
                          {platform.icon} {platform.label}
                        </span>
                      ) : null;
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CampaignsManagement;