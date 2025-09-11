import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
// Removed unused supabase import
// import { supabase } from '../../lib/supabase';
import { toast } from 'react-hot-toast';
import AdminLayout from '../../components/admin/AdminLayout';
import {
  LayoutDashboard, Users, FileText, Settings, BarChart3, MessageSquare,
  Shield, Globe, Database, Zap, Bell, Calendar, TrendingUp, Activity,
  UserCheck, Eye, Edit, Plus, Search, Filter, RefreshCw, ArrowRight,
  Star, Clock, AlertCircle, CheckCircle, XCircle, Layers, Grid3X3,
  List, Download, Upload, Copy, Share2, ExternalLink, Maximize2,
  Minimize2, MoreVertical, ChevronRight, ChevronDown, Folder,
  Image, Video, Music, File, Code, Archive, Trash2, Lock, Unlock,
  Mail, Phone, MapPin, Heart, Bookmark, Tag, Flag, Award, Target,
  Briefcase, GraduationCap, Coffee, Gamepad2, Camera, Mic, Headphones
} from 'lucide-react';

const AdminDashboard = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    users: { total: 0, active: 0, new: 0 },
    pages: { total: 0, published: 0, draft: 0 },
    channels: { total: 0, active: 0, premium: 0 },
    views: { total: 0, today: 0, thisWeek: 0 },
    revenue: { total: 0, thisMonth: 0, growth: 0 }
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [quickActions, setQuickActions] = useState([]);
  const [systemHealth, setSystemHealth] = useState({
    server: 'healthy',
    database: 'healthy',
    storage: 'healthy',
    api: 'healthy'
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // بيانات تجريبية للوحة التحكم
      const mockStats = {
        users: { total: 15420, active: 12350, new: 245 },
        pages: { total: 156, published: 134, draft: 22 },
        channels: { total: 89, active: 76, premium: 23 },
        views: { total: 2450000, today: 15420, thisWeek: 89650 },
        revenue: { total: 125000, thisMonth: 18500, growth: 12.5 }
      };

      const mockActivity = [
        {
          id: 1,
          type: 'user_registered',
          message: 'مستخدم جديد انضم للموقع',
          user: 'أحمد محمد',
          time: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
          icon: UserCheck,
          color: 'text-green-600'
        },
        {
          id: 2,
          type: 'page_created',
          message: 'تم إنشاء صفحة جديدة',
          user: 'سارة أحمد',
          details: 'صفحة "خدماتنا الجديدة"',
          time: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
          icon: FileText,
          color: 'text-blue-600'
        },
        {
          id: 3,
          type: 'channel_updated',
          message: 'تم تحديث قناة',
          user: 'محمد علي',
          details: 'قناة "التقنية والبرمجة"',
          time: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
          icon: Settings,
          color: 'text-purple-600'
        },
        {
          id: 4,
          type: 'system_backup',
          message: 'تم إنشاء نسخة احتياطية',
          user: 'النظام',
          time: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          icon: Database,
          color: 'text-gray-600'
        },
        {
          id: 5,
          type: 'security_alert',
          message: 'محاولة دخول مشبوهة',
          user: 'نظام الأمان',
          details: 'IP: 192.168.1.100',
          time: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
          icon: Shield,
          color: 'text-red-600'
        }
      ];

      setStats(mockStats);
      setRecentActivity(mockActivity);
    } catch (error) {
      console.error('خطأ في تحميل بيانات اللوحة:', error);
      toast.error('حدث خطأ في تحميل البيانات');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'healthy': return 'text-green-600 bg-green-100';
      case 'warning': return 'text-yellow-600 bg-yellow-100';
      case 'error': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'healthy': return 'سليم';
      case 'warning': return 'تحذير';
      case 'error': return 'خطأ';
      default: return 'غير معروف';
    }
  };

  const formatNumber = (num) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'م';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'ك';
    }
    return num.toLocaleString();
  };

  const getTimeAgo = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'الآن';
    if (diffInMinutes < 60) return `منذ ${diffInMinutes} دقيقة`;
    if (diffInMinutes < 1440) return `منذ ${Math.floor(diffInMinutes / 60)} ساعة`;
    return `منذ ${Math.floor(diffInMinutes / 1440)} يوم`;
  };

  if (loading) {
    return (
      <AdminLayout title="لوحة التحكم الرئيسية" description="إدارة شاملة لجميع جوانب الموقع">
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <RefreshCw className="w-12 h-12 animate-spin mx-auto mb-4 text-blue-600" />
            <p className="text-gray-600">جاري تحميل لوحة التحكم...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="لوحة التحكم الرئيسية" description="إدارة شاملة لجميع جوانب الموقع">
      <div className="min-h-screen bg-gray-50" dir="rtl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 flex items-center space-x-3 space-x-reverse">
                  <LayoutDashboard className="w-8 h-8 text-blue-600" />
                  <span>لوحة التحكم الرئيسية</span>
                </h1>
                <p className="text-gray-600 mt-2">إدارة شاملة لجميع جوانب الموقع</p>
              </div>
              <div className="flex items-center space-x-3 space-x-reverse">
                <button
                  onClick={() => loadDashboardData()}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors bg-white rounded-lg shadow-sm hover:shadow-md"
                  title="تحديث"
                >
                  <RefreshCw className="w-5 h-5" />
                </button>
                <div className="flex items-center space-x-2 space-x-reverse bg-white px-4 py-2 rounded-lg shadow-sm">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm text-gray-600">متصل</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">إجمالي المستخدمين</p>
                  <p className="text-2xl font-bold text-gray-900">{formatNumber(stats.users.total)}</p>
                  <p className="text-xs text-green-600 mt-1">+{stats.users.new} جديد</p>
                </div>
                <Users className="w-8 h-8 text-blue-600" />
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">الصفحات</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.pages.total}</p>
                  <p className="text-xs text-blue-600 mt-1">{stats.pages.published} منشور</p>
                </div>
                <FileText className="w-8 h-8 text-green-600" />
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">القنوات</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.channels.total}</p>
                  <p className="text-xs text-purple-600 mt-1">{stats.channels.active} نشط</p>
                </div>
                <Globe className="w-8 h-8 text-purple-600" />
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">المشاهدات</p>
                  <p className="text-2xl font-bold text-gray-900">{formatNumber(stats.views.total)}</p>
                  <p className="text-xs text-orange-600 mt-1">{formatNumber(stats.views.today)} اليوم</p>
                </div>
                <BarChart3 className="w-8 h-8 text-orange-600" />
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">الإيرادات</p>
                  <p className="text-2xl font-bold text-gray-900">{formatNumber(stats.revenue.total)}$</p>
                  <p className="text-xs text-green-600 mt-1">+{stats.revenue.growth}%</p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-600" />
              </div>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Management Sections */}
            <div className="lg:col-span-2 space-y-8">
              {/* Quick Actions */}
              <div className="bg-white rounded-lg shadow-sm border">
                <div className="p-6 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2 space-x-reverse">
                    <Zap className="w-5 h-5 text-yellow-500" />
                    <span>الإجراءات السريعة</span>
                  </h3>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <button
                      onClick={() => router.push('/admin/pages-management')}
                      className="p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors group"
                    >
                      <FileText className="w-8 h-8 text-blue-600 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                      <p className="text-sm font-medium text-gray-900">إدارة الصفحات</p>
                      <p className="text-xs text-gray-600">تحرير المحتوى</p>
                    </button>
                    
                    <button
                      onClick={() => router.push('/admin/users')}
                      className="p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors group"
                    >
                      <Users className="w-8 h-8 text-green-600 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                      <p className="text-sm font-medium text-gray-900">إدارة المستخدمين</p>
                      <p className="text-xs text-gray-600">الحسابات والأذونات</p>
                    </button>
                    
                    <button
                      onClick={() => router.push('/admin/channels')}
                      className="p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors group"
                    >
                      <Globe className="w-8 h-8 text-purple-600 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                      <p className="text-sm font-medium text-gray-900">إدارة القنوات</p>
                      <p className="text-xs text-gray-600">المحتوى والإعدادات</p>
                    </button>
                    
                    <button
                      onClick={() => router.push('/admin/analytics')}
                      className="p-4 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors group"
                    >
                      <BarChart3 className="w-8 h-8 text-orange-600 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                      <p className="text-sm font-medium text-gray-900">التحليلات</p>
                      <p className="text-xs text-gray-600">الإحصائيات والتقارير</p>
                    </button>
                  </div>
                </div>
              </div>

              {/* Management Categories */}
              <div className="bg-white rounded-lg shadow-sm border">
                <div className="p-6 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2 space-x-reverse">
                    <Settings className="w-5 h-5 text-gray-600" />
                    <span>أقسام الإدارة</span>
                  </h3>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {/* Content Management */}
                    <div className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3 space-x-reverse">
                          <FileText className="w-6 h-6 text-blue-600" />
                          <div>
                            <h4 className="font-medium text-gray-900">إدارة المحتوى</h4>
                            <p className="text-sm text-gray-600">الصفحات والمقالات والوسائط</p>
                          </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <button
                          onClick={() => router.push('/admin/pages-management')}
                          className="p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors text-center"
                        >
                          <FileText className="w-5 h-5 text-blue-600 mx-auto mb-1" />
                          <span className="text-xs text-gray-700">الصفحات</span>
                        </button>
                        <button
                          onClick={() => router.push('/admin/posts')}
                          className="p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors text-center"
                        >
                          <Edit className="w-5 h-5 text-green-600 mx-auto mb-1" />
                          <span className="text-xs text-gray-700">المقالات</span>
                        </button>
                        <button
                          onClick={() => router.push('/admin/media')}
                          className="p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors text-center"
                        >
                          <Image className="w-5 h-5 text-purple-600 mx-auto mb-1" />
                          <span className="text-xs text-gray-700">الوسائط</span>
                        </button>
                        <button
                          onClick={() => router.push('/admin/categories')}
                          className="p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors text-center"
                        >
                          <Folder className="w-5 h-5 text-orange-600 mx-auto mb-1" />
                          <span className="text-xs text-gray-700">التصنيفات</span>
                        </button>
                      </div>
                    </div>
                    
                    {/* User Management */}
                    <div className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3 space-x-reverse">
                          <Users className="w-6 h-6 text-green-600" />
                          <div>
                            <h4 className="font-medium text-gray-900">إدارة المستخدمين</h4>
                            <p className="text-sm text-gray-600">الحسابات والأذونات والأدوار</p>
                          </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <button
                          onClick={() => router.push('/admin/users')}
                          className="p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors text-center"
                        >
                          <Users className="w-5 h-5 text-green-600 mx-auto mb-1" />
                          <span className="text-xs text-gray-700">المستخدمين</span>
                        </button>
                        <button
                          onClick={() => router.push('/admin/roles')}
                          className="p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors text-center"
                        >
                          <Shield className="w-5 h-5 text-red-600 mx-auto mb-1" />
                          <span className="text-xs text-gray-700">الأدوار</span>
                        </button>
                        <button
                          onClick={() => router.push('/admin/permissions')}
                          className="p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors text-center"
                        >
                          <Lock className="w-5 h-5 text-yellow-600 mx-auto mb-1" />
                          <span className="text-xs text-gray-700">الأذونات</span>
                        </button>
                        <button
                          onClick={() => router.push('/admin/activity')}
                          className="p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors text-center"
                        >
                          <Activity className="w-5 h-5 text-blue-600 mx-auto mb-1" />
                          <span className="text-xs text-gray-700">النشاط</span>
                        </button>
                      </div>
                    </div>
                    
                    {/* System Management */}
                    <div className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3 space-x-reverse">
                          <Settings className="w-6 h-6 text-gray-600" />
                          <div>
                            <h4 className="font-medium text-gray-900">إدارة النظام</h4>
                            <p className="text-sm text-gray-600">الإعدادات والأمان والصيانة</p>
                          </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <button
                          onClick={() => router.push('/admin/settings')}
                          className="p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors text-center"
                        >
                          <Settings className="w-5 h-5 text-gray-600 mx-auto mb-1" />
                          <span className="text-xs text-gray-700">الإعدادات</span>
                        </button>
                        <button
                          onClick={() => router.push('/admin/security')}
                          className="p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors text-center"
                        >
                          <Shield className="w-5 h-5 text-red-600 mx-auto mb-1" />
                          <span className="text-xs text-gray-700">الأمان</span>
                        </button>
                        <button
                          onClick={() => router.push('/admin/backup')}
                          className="p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors text-center"
                        >
                          <Database className="w-5 h-5 text-blue-600 mx-auto mb-1" />
                          <span className="text-xs text-gray-700">النسخ الاحتياطي</span>
                        </button>
                        <button
                          onClick={() => router.push('/admin/logs')}
                          className="p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors text-center"
                        >
                          <FileText className="w-5 h-5 text-purple-600 mx-auto mb-1" />
                          <span className="text-xs text-gray-700">السجلات</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* System Health */}
              <div className="bg-white rounded-lg shadow-sm border">
                <div className="p-6 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2 space-x-reverse">
                    <Activity className="w-5 h-5 text-green-500" />
                    <span>حالة النظام</span>
                  </h3>
                </div>
                <div className="p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <Database className="w-4 h-4 text-gray-600" />
                      <span className="text-sm text-gray-700">قاعدة البيانات</span>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(systemHealth.database)}`}>
                      {getStatusText(systemHealth.database)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <Globe className="w-4 h-4 text-gray-600" />
                      <span className="text-sm text-gray-700">الخادم</span>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(systemHealth.server)}`}>
                      {getStatusText(systemHealth.server)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <Archive className="w-4 h-4 text-gray-600" />
                      <span className="text-sm text-gray-700">التخزين</span>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(systemHealth.storage)}`}>
                      {getStatusText(systemHealth.storage)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <Zap className="w-4 h-4 text-gray-600" />
                      <span className="text-sm text-gray-700">API</span>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(systemHealth.api)}`}>
                      {getStatusText(systemHealth.api)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-white rounded-lg shadow-sm border">
                <div className="p-6 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2 space-x-reverse">
                    <Clock className="w-5 h-5 text-blue-500" />
                    <span>النشاط الأخير</span>
                  </h3>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {recentActivity.map((activity) => {
                      const IconComponent = activity.icon;
                      return (
                        <div key={activity.id} className="flex items-start space-x-3 space-x-reverse">
                          <div className={`p-2 rounded-lg ${activity.color.replace('text-', 'bg-').replace('-600', '-100')}`}>
                            <IconComponent className={`w-4 h-4 ${activity.color}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900">{activity.message}</p>
                            {activity.details && (
                              <p className="text-xs text-gray-600">{activity.details}</p>
                            )}
                            <div className="flex items-center space-x-2 space-x-reverse mt-1">
                              <span className="text-xs text-gray-500">{activity.user}</span>
                              <span className="text-xs text-gray-400">•</span>
                              <span className="text-xs text-gray-500">{getTimeAgo(activity.time)}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <button
                      onClick={() => router.push('/admin/activity')}
                      className="w-full text-center text-sm text-blue-600 hover:text-blue-700 font-medium"
                    >
                      عرض جميع الأنشطة
                    </button>
                  </div>
                </div>
              </div>

              {/* Quick Links */}
              <div className="bg-white rounded-lg shadow-sm border">
                <div className="p-6 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2 space-x-reverse">
                    <ExternalLink className="w-5 h-5 text-purple-500" />
                    <span>روابط سريعة</span>
                  </h3>
                </div>
                <div className="p-6">
                  <div className="space-y-3">
                    <button
                      onClick={() => window.open('/', '_blank')}
                      className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <div className="flex items-center space-x-2 space-x-reverse">
                        <Globe className="w-4 h-4 text-blue-600" />
                        <span className="text-sm font-medium text-gray-900">زيارة الموقع</span>
                      </div>
                      <ExternalLink className="w-4 h-4 text-gray-400" />
                    </button>
                    
                    <button
                      onClick={() => router.push('/admin/analytics')}
                      className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <div className="flex items-center space-x-2 space-x-reverse">
                        <BarChart3 className="w-4 h-4 text-green-600" />
                        <span className="text-sm font-medium text-gray-900">التحليلات</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                    </button>
                    
                    <button
                      onClick={() => router.push('/admin/settings')}
                      className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <div className="flex items-center space-x-2 space-x-reverse">
                        <Settings className="w-4 h-4 text-gray-600" />
                        <span className="text-sm font-medium text-gray-900">الإعدادات</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                    </button>
                    
                    <button
                      onClick={() => router.push('/admin/backup')}
                      className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <div className="flex items-center space-x-2 space-x-reverse">
                        <Database className="w-4 h-4 text-purple-600" />
                        <span className="text-sm font-medium text-gray-900">النسخ الاحتياطي</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;