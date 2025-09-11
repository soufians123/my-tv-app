import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import AdminLayout from '../../components/admin/AdminLayout';
import { toast } from 'react-hot-toast';
import {
  FileText, Plus, Edit, Trash2, Eye, Search, Filter, Settings,
  Globe, Lock, Unlock, Calendar, User, Tag, Image, MoreVertical,
  Copy, Download, Upload, ArrowLeft, Save, X, Check, AlertCircle,
  Star, TrendingUp, BarChart3, Users, Clock, Zap, Layout,
  Maximize2, Minimize2, RefreshCw, Grid3X3, List, Layers
} from 'lucide-react';

const PagesManagement = () => {
  const [loading, setLoading] = useState(false);
  const [pages, setPages] = useState([]);
  const [filteredPages, setFilteredPages] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [viewMode, setViewMode] = useState('grid');
  const [selectedPages, setSelectedPages] = useState([]);
  const [showPageModal, setShowPageModal] = useState(false);
  const [selectedPage, setSelectedPage] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [pageToDelete, setPageToDelete] = useState(null);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    published: 0,
    draft: 0,
    archived: 0,
    views: 0
  });

  // نموذج صفحة جديدة
  const [newPage, setNewPage] = useState({
    title: '',
    slug: '',
    content: '',
    excerpt: '',
    status: 'draft',
    type: 'page',
    featured_image: '',
    meta_title: '',
    meta_description: '',
    is_featured: false,
    allow_comments: true,
    template: 'default'
  });

  useEffect(() => {
    loadPages();
  }, []);

  useEffect(() => {
    filterPages();
  }, [pages, searchTerm, filterStatus, filterType]);

  // تمت إزالة checkAuth: الحماية تتم الآن عبر AdminLayout فقط

  const loadPages = async () => {
    try {
      // بيانات تجريبية للصفحات
      const mockPages = [
        {
          id: '1',
          title: 'الصفحة الرئيسية',
          slug: 'home',
          content: 'محتوى الصفحة الرئيسية...',
          excerpt: 'مرحباً بكم في زوميجا',
          type: 'page',
          status: 'published',
          author: 'المدير العام',
          created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          updated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          views: 1250,
          featured_image: '/images/home-banner.jpg',
          meta_title: 'زوميجا - الصفحة الرئيسية',
          meta_description: 'الصفحة الرئيسية لموقع زوميجا',
          is_featured: true,
          allow_comments: false,
          template: 'home'
        },
        {
          id: '2',
          title: 'من نحن',
          slug: 'about',
          content: 'نحن فريق زوميجا...',
          excerpt: 'تعرف على فريقنا',
          type: 'page',
          status: 'published',
          author: 'المدير العام',
          created_at: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
          updated_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          views: 850,
          featured_image: '/images/about-us.jpg',
          meta_title: 'من نحن - زوميجا',
          meta_description: 'تعرف على فريق زوميجا ورؤيتنا',
          is_featured: false,
          allow_comments: true,
          template: 'default'
        },
        {
          id: '3',
          title: 'سياسة الخصوصية',
          slug: 'privacy-policy',
          content: 'سياسة الخصوصية...',
          excerpt: 'حماية بياناتك مهمة لنا',
          type: 'page',
          status: 'published',
          author: 'المدير القانوني',
          created_at: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
          updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          views: 420,
          featured_image: null,
          meta_title: 'سياسة الخصوصية',
          meta_description: 'سياسة الخصوصية وحماية البيانات',
          is_featured: false,
          allow_comments: false,
          template: 'legal'
        },
        {
          id: '4',
          title: 'شروط الاستخدام',
          slug: 'terms-of-service',
          content: 'شروط الاستخدام...',
          excerpt: 'القواعد والشروط',
          type: 'page',
          status: 'draft',
          author: 'المدير القانوني',
          created_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
          updated_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          views: 0,
          featured_image: null,
          meta_title: 'شروط الاستخدام',
          meta_description: 'شروط وأحكام استخدام الموقع',
          is_featured: false,
          allow_comments: false,
          template: 'legal'
        },
        {
          id: '5',
          title: 'اتصل بنا',
          slug: 'contact',
          content: 'نموذج الاتصال...',
          excerpt: 'تواصل معنا',
          type: 'page',
          status: 'published',
          author: 'مدير المحتوى',
          created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
          updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          views: 320,
          featured_image: '/images/contact.jpg',
          meta_title: 'اتصل بنا - زوميجا',
          meta_description: 'تواصل مع فريق زوميجا',
          is_featured: false,
          allow_comments: true,
          template: 'contact'
        },
        {
          id: '6',
          title: 'الأسئلة الشائعة',
          slug: 'faq',
          content: 'الأسئلة والأجوبة...',
          excerpt: 'إجابات لأهم الأسئلة',
          type: 'page',
          status: 'archived',
          author: 'مدير المحتوى',
          created_at: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
          updated_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          views: 180,
          featured_image: null,
          meta_title: 'الأسئلة الشائعة',
          meta_description: 'إجابات لأهم الأسئلة المتكررة',
          is_featured: false,
          allow_comments: false,
          template: 'faq'
        }
      ];

      setPages(mockPages);
      
      // حساب الإحصائيات
      const totalViews = mockPages.reduce((sum, page) => sum + page.views, 0);
      setStats({
        total: mockPages.length,
        published: mockPages.filter(p => p.status === 'published').length,
        draft: mockPages.filter(p => p.status === 'draft').length,
        archived: mockPages.filter(p => p.status === 'archived').length,
        views: totalViews
      });
    } catch (error) {
      console.error('خطأ في تحميل الصفحات:', error);
      toast.error('حدث خطأ في تحميل الصفحات');
    }
  };

  const filterPages = () => {
    let filtered = pages;

    if (searchTerm) {
      filtered = filtered.filter(page => 
        page.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        page.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        page.author.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterStatus !== 'all') {
      filtered = filtered.filter(page => page.status === filterStatus);
    }

    if (filterType !== 'all') {
      filtered = filtered.filter(page => page.type === filterType);
    }

    setFilteredPages(filtered);
  };

  const handleCreatePage = () => {
    setSelectedPage(null);
    setNewPage({
      title: '',
      slug: '',
      content: '',
      excerpt: '',
      status: 'draft',
      type: 'page',
      featured_image: '',
      meta_title: '',
      meta_description: '',
      is_featured: false,
      allow_comments: true,
      template: 'default'
    });
    setShowPageModal(true);
  };

  const handleEditPage = (page) => {
    setSelectedPage(page);
    setNewPage({ ...page });
    setShowPageModal(true);
  };

  const handleSavePage = async () => {
    try {
      if (!newPage.title.trim()) {
        toast.error('عنوان الصفحة مطلوب');
        return;
      }

      if (!newPage.slug.trim()) {
        newPage.slug = newPage.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      }

      if (selectedPage) {
        // تحديث صفحة موجودة
        const updatedPages = pages.map(page => 
          page.id === selectedPage.id 
            ? { ...newPage, id: selectedPage.id, updated_at: new Date().toISOString() }
            : page
        );
        setPages(updatedPages);
        toast.success('تم تحديث الصفحة بنجاح');
      } else {
        // إنشاء صفحة جديدة
        const newPageData = {
          ...newPage,
          id: Date.now().toString(),
          author: 'المدير الحالي',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          views: 0
        };
        setPages([...pages, newPageData]);
        toast.success('تم إنشاء الصفحة بنجاح');
      }

      setShowPageModal(false);
      loadPages();
    } catch (error) {
      console.error('خطأ في حفظ الصفحة:', error);
      toast.error('حدث خطأ في حفظ الصفحة');
    }
  };

  const handleDeletePage = async () => {
    try {
      const updatedPages = pages.filter(page => page.id !== pageToDelete.id);
      setPages(updatedPages);
      setShowDeleteModal(false);
      setPageToDelete(null);
      toast.success('تم حذف الصفحة بنجاح');
      loadPages();
    } catch (error) {
      console.error('خطأ في حذف الصفحة:', error);
      toast.error('حدث خطأ في حذف الصفحة');
    }
  };

  const handleStatusChange = async (pageId, newStatus) => {
    try {
      const updatedPages = pages.map(page => 
        page.id === pageId 
          ? { ...page, status: newStatus, updated_at: new Date().toISOString() }
          : page
      );
      setPages(updatedPages);
      toast.success(`تم تغيير حالة الصفحة إلى ${newStatus}`);
      loadPages();
    } catch (error) {
      console.error('خطأ في تغيير حالة الصفحة:', error);
      toast.error('حدث خطأ في تغيير حالة الصفحة');
    }
  };

  const handleBulkAction = async (action) => {
    try {
      if (selectedPages.length === 0) {
        toast.error('يرجى اختيار صفحات للتطبيق عليها');
        return;
      }

      let updatedPages = [...pages];
      
      switch (action) {
        case 'publish':
          updatedPages = updatedPages.map(page => 
            selectedPages.includes(page.id) 
              ? { ...page, status: 'published', updated_at: new Date().toISOString() }
              : page
          );
          toast.success(`تم نشر ${selectedPages.length} صفحة`);
          break;
        case 'draft':
          updatedPages = updatedPages.map(page => 
            selectedPages.includes(page.id) 
              ? { ...page, status: 'draft', updated_at: new Date().toISOString() }
              : page
          );
          toast.success(`تم تحويل ${selectedPages.length} صفحة إلى مسودة`);
          break;
        case 'archive':
          updatedPages = updatedPages.map(page => 
            selectedPages.includes(page.id) 
              ? { ...page, status: 'archived', updated_at: new Date().toISOString() }
              : page
          );
          toast.success(`تم أرشفة ${selectedPages.length} صفحة`);
          break;
        case 'delete':
          updatedPages = updatedPages.filter(page => !selectedPages.includes(page.id));
          toast.success(`تم حذف ${selectedPages.length} صفحة`);
          break;
      }

      setPages(updatedPages);
      setSelectedPages([]);
      setShowBulkActions(false);
      loadPages();
    } catch (error) {
      console.error('خطأ في تنفيذ العملية المجمعة:', error);
      toast.error('حدث خطأ في تنفيذ العملية');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-800';
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      case 'archived': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'published': return 'منشور';
      case 'draft': return 'مسودة';
      case 'archived': return 'مؤرشف';
      default: return status;
    }
  };

  if (loading) {
    return (
      <AdminLayout title="إدارة الصفحات" description="إدارة وتحرير صفحات الموقع">
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <RefreshCw className="w-12 h-12 animate-spin mx-auto mb-4 text-blue-600" />
            <p className="text-gray-600">جاري تحميل إدارة الصفحات...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="إدارة الصفحات" description="إدارة وتحرير صفحات الموقع">
      <div className="min-h-screen bg-gray-50" dir="rtl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 space-x-reverse">
              <Link href='/admin' className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                <ArrowLeft className="w-6 h-6" />
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 flex items-center space-x-3 space-x-reverse">
                  <FileText className="w-8 h-8 text-blue-600" />
                  <span>إدارة الصفحات</span>
                </h1>
                <p className="text-gray-600 mt-2">إدارة وتحرير جميع صفحات الموقع</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 space-x-reverse">
              <button
                onClick={() => loadPages()}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors bg-white rounded-lg shadow-sm hover:shadow-md"
                title="تحديث"
              >
                <RefreshCw className="w-5 h-5" />
              </button>
              <button
                onClick={handleCreatePage}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 space-x-reverse shadow-md hover:shadow-lg"
              >
                <Plus className="w-5 h-5" />
                <span>صفحة جديدة</span>
              </button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">إجمالي الصفحات</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <FileText className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">منشور</p>
                <p className="text-2xl font-bold text-green-600">{stats.published}</p>
              </div>
              <Globe className="w-8 h-8 text-green-600" />
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">مسودات</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.draft}</p>
              </div>
              <Edit className="w-8 h-8 text-yellow-600" />
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">مؤرشف</p>
                <p className="text-2xl font-bold text-gray-600">{stats.archived}</p>
              </div>
              <Layers className="w-8 h-8 text-gray-600" />
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">إجمالي المشاهدات</p>
                <p className="text-2xl font-bold text-purple-600">{stats.views.toLocaleString()}</p>
              </div>
              <BarChart3 className="w-8 h-8 text-purple-600" />
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white p-6 rounded-lg shadow-sm mb-8 border">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 mb-6">
            <div className="flex items-center space-x-4 space-x-reverse">
              <div className="relative">
                <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="البحث في الصفحات..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
                />
              </div>
              
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">جميع الحالات</option>
                <option value="published">منشور</option>
                <option value="draft">مسودة</option>
                <option value="archived">مؤرشف</option>
              </select>
              
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">جميع الأنواع</option>
                <option value="page">صفحة</option>
                <option value="post">مقال</option>
                <option value="landing">صفحة هبوط</option>
              </select>
            </div>
            
            <div className="flex items-center space-x-3 space-x-reverse">
              <div className="flex items-center space-x-2 space-x-reverse bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded ${viewMode === 'grid' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500'}`}
                  title="عرض شبكي"
                >
                  <Grid3X3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded ${viewMode === 'list' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500'}`}
                  title="عرض قائمة"
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
              
              {selectedPages.length > 0 && (
                <button
                  onClick={() => setShowBulkActions(!showBulkActions)}
                  className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2 space-x-reverse"
                >
                  <Settings className="w-4 h-4" />
                  <span>إجراءات مجمعة ({selectedPages.length})</span>
                </button>
              )}
            </div>
          </div>
          
          {/* Bulk Actions */}
          {showBulkActions && selectedPages.length > 0 && (
            <div className="bg-gray-50 p-4 rounded-lg border">
              <div className="flex items-center space-x-3 space-x-reverse">
                <span className="text-sm font-medium text-gray-700">تطبيق على {selectedPages.length} صفحة:</span>
                <button
                  onClick={() => handleBulkAction('publish')}
                  className="px-3 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors text-sm"
                >
                  نشر
                </button>
                <button
                  onClick={() => handleBulkAction('draft')}
                  className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200 transition-colors text-sm"
                >
                  مسودة
                </button>
                <button
                  onClick={() => handleBulkAction('archive')}
                  className="px-3 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors text-sm"
                >
                  أرشفة
                </button>
                <button
                  onClick={() => handleBulkAction('delete')}
                  className="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors text-sm"
                >
                  حذف
                </button>
              </div>
            </div>
          )}
          
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>عرض {filteredPages.length} من {pages.length} صفحة</span>
            <div className="flex items-center space-x-4 space-x-reverse">
              <span>الصفحات المنشورة: {filteredPages.filter(p => p.status === 'published').length}</span>
              <span>إجمالي المشاهدات: {filteredPages.reduce((sum, p) => sum + p.views, 0).toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Pages Grid/List */}
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPages.map((page) => (
              <div key={page.id} className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
                <div className="p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3 space-x-reverse">
                      <input
                        type="checkbox"
                        checked={selectedPages.includes(page.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedPages([...selectedPages, page.id]);
                          } else {
                            setSelectedPages(selectedPages.filter(id => id !== page.id));
                          }
                        }}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <div>
                        <h3 className="font-semibold text-gray-900 line-clamp-2">{page.title}</h3>
                        <p className="text-sm text-gray-600">/{page.slug}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1 space-x-reverse">
                      {page.is_featured && <Star className="w-4 h-4 text-yellow-500" />}
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(page.status)}`}>
                        {getStatusText(page.status)}
                      </span>
                    </div>
                  </div>
                  
                  {/* Featured Image */}
                  {page.featured_image && (
                    <div className="mb-4">
                      <img
                        src={page.featured_image}
                        alt={page.title}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                    </div>
                  )}
                  
                  {/* Excerpt */}
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">{page.excerpt}</p>
                  
                  {/* Meta Info */}
                  <div className="space-y-2 mb-4 text-xs text-gray-500">
                    <div className="flex justify-between">
                      <span>المؤلف: {page.author}</span>
                      <span>المشاهدات: {page.views}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>النوع: {page.type}</span>
                      <span>القالب: {page.template}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>تاريخ الإنشاء: {new Date(page.created_at).toLocaleDateString('ar-SA')}</span>
                      <span>آخر تحديث: {new Date(page.updated_at).toLocaleDateString('ar-SA')}</span>
                    </div>
                  </div>
                  
                  {/* Actions */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <button
                        onClick={() => handleEditPage(page)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="تحرير"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => window.open(`/${page.slug}`, '_blank')}
                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                        title="معاينة"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          setPageToDelete(page);
                          setShowDeleteModal(true);
                        }}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="حذف"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    
                    <div className="flex items-center space-x-1 space-x-reverse">
                      {page.status === 'published' ? (
                        <button
                          onClick={() => handleStatusChange(page.id, 'draft')}
                          className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded text-xs hover:bg-yellow-200 transition-colors"
                        >
                          إلغاء النشر
                        </button>
                      ) : (
                        <button
                          onClick={() => handleStatusChange(page.id, 'published')}
                          className="px-3 py-1 bg-green-100 text-green-700 rounded text-xs hover:bg-green-200 transition-colors"
                        >
                          نشر
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <input
                        type="checkbox"
                        checked={selectedPages.length === filteredPages.length && filteredPages.length > 0}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedPages(filteredPages.map(p => p.id));
                          } else {
                            setSelectedPages([]);
                          }
                        }}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">العنوان</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الحالة</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">المؤلف</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">المشاهدات</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">تاريخ التحديث</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">إجراءات</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredPages.map((page) => (
                    <tr key={page.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={selectedPages.includes(page.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedPages([...selectedPages, page.id]);
                            } else {
                              setSelectedPages(selectedPages.filter(id => id !== page.id));
                            }
                          }}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {page.featured_image && (
                            <img className="h-10 w-10 rounded-lg object-cover ml-3" src={page.featured_image} alt={page.title} />
                          )}
                          <div>
                            <div className="flex items-center space-x-2 space-x-reverse">
                              <div className="text-sm font-medium text-gray-900">{page.title}</div>
                              {page.is_featured && <Star className="w-4 h-4 text-yellow-500" />}
                            </div>
                            <div className="text-sm text-gray-500">/{page.slug}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(page.status)}`}>
                          {getStatusText(page.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{page.author}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{page.views.toLocaleString()}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(page.updated_at).toLocaleDateString('ar-SA')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2 space-x-reverse">
                          <button
                            onClick={() => handleEditPage(page)}
                            className="text-blue-600 hover:text-blue-900 p-1 hover:bg-blue-50 rounded"
                            title="تحرير"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => window.open(`/${page.slug}`, '_blank')}
                            className="text-green-600 hover:text-green-900 p-1 hover:bg-green-50 rounded"
                            title="معاينة"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setPageToDelete(page);
                              setShowDeleteModal(true);
                            }}
                            className="text-red-600 hover:text-red-900 p-1 hover:bg-red-50 rounded"
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
          </div>
        )}

        {/* Empty State */}
        {filteredPages.length === 0 && (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد صفحات</h3>
            <p className="text-gray-600 mb-4">لم يتم العثور على صفحات تطابق معايير البحث</p>
            <button
              onClick={handleCreatePage}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              إنشاء صفحة جديدة
            </button>
          </div>
        )}
      </div>

      {/* Page Modal */}
      {showPageModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold">
                  {selectedPage ? 'تحرير الصفحة' : 'إنشاء صفحة جديدة'}
                </h3>
                <button
                  onClick={() => setShowPageModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">عنوان الصفحة *</label>
                    <input
                      type="text"
                      value={newPage.title}
                      onChange={(e) => setNewPage({ ...newPage, title: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="أدخل عنوان الصفحة"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">الرابط (Slug)</label>
                    <input
                      type="text"
                      value={newPage.slug}
                      onChange={(e) => setNewPage({ ...newPage, slug: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="page-url"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">المقتطف</label>
                  <textarea
                    value={newPage.excerpt}
                    onChange={(e) => setNewPage({ ...newPage, excerpt: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="وصف مختصر للصفحة"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">المحتوى</label>
                  <textarea
                    value={newPage.content}
                    onChange={(e) => setNewPage({ ...newPage, content: e.target.value })}
                    rows={10}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="محتوى الصفحة..."
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">الحالة</label>
                    <select
                      value={newPage.status}
                      onChange={(e) => setNewPage({ ...newPage, status: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="draft">مسودة</option>
                      <option value="published">منشور</option>
                      <option value="archived">مؤرشف</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">النوع</label>
                    <select
                      value={newPage.type}
                      onChange={(e) => setNewPage({ ...newPage, type: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="page">صفحة</option>
                      <option value="post">مقال</option>
                      <option value="landing">صفحة هبوط</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">القالب</label>
                    <select
                      value={newPage.template}
                      onChange={(e) => setNewPage({ ...newPage, template: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="default">افتراضي</option>
                      <option value="home">الرئيسية</option>
                      <option value="contact">اتصل بنا</option>
                      <option value="legal">قانوني</option>
                      <option value="faq">أسئلة شائعة</option>
                    </select>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">عنوان SEO</label>
                    <input
                      type="text"
                      value={newPage.meta_title}
                      onChange={(e) => setNewPage({ ...newPage, meta_title: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="عنوان محرك البحث"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">الصورة المميزة</label>
                    <input
                      type="url"
                      value={newPage.featured_image}
                      onChange={(e) => setNewPage({ ...newPage, featured_image: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="رابط الصورة"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">وصف SEO</label>
                  <textarea
                    value={newPage.meta_description}
                    onChange={(e) => setNewPage({ ...newPage, meta_description: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="وصف الصفحة لمحركات البحث"
                  />
                </div>
                
                <div className="flex items-center space-x-6 space-x-reverse">
                  <label className="flex items-center space-x-2 space-x-reverse">
                    <input
                      type="checkbox"
                      checked={newPage.is_featured}
                      onChange={(e) => setNewPage({ ...newPage, is_featured: e.target.checked })}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">صفحة مميزة</span>
                  </label>
                  <label className="flex items-center space-x-2 space-x-reverse">
                    <input
                      type="checkbox"
                      checked={newPage.allow_comments}
                      onChange={(e) => setNewPage({ ...newPage, allow_comments: e.target.checked })}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">السماح بالتعليقات</span>
                  </label>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 space-x-reverse mt-8 pt-6 border-t">
                <button
                  onClick={() => setShowPageModal(false)}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  إلغاء
                </button>
                <button
                  onClick={handleSavePage}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 space-x-reverse"
                >
                  <Save className="w-4 h-4" />
                  <span>{selectedPage ? 'تحديث' : 'إنشاء'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && pageToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center mb-4">
              <AlertCircle className="w-6 h-6 text-red-600 ml-3" />
              <h3 className="text-lg font-semibold text-gray-900">تأكيد الحذف</h3>
            </div>
            <p className="text-gray-600 mb-6">
              هل أنت متأكد من حذف الصفحة "{pageToDelete.title}"؟ لا يمكن التراجع عن هذا الإجراء.
            </p>
            <div className="flex justify-end space-x-3 space-x-reverse">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setPageToDelete(null);
                }}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                إلغاء
              </button>
              <button
                onClick={handleDeletePage}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                حذف
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
    </AdminLayout>
  );
};

export default PagesManagement;