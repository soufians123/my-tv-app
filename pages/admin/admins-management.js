import { useState, useEffect } from 'react';
import Link from 'next/link';
import AdminLayout from '../../components/admin/AdminLayout';
import { supabase } from '../../lib/supabase';
import {
  FiUserCheck, FiUserPlus, FiEdit, FiTrash2, FiEye, FiSearch,
  FiFilter, FiSettings, FiArrowLeft, FiShield, FiMail,
  FiCalendar, FiActivity, FiMoreVertical, FiCheck, FiX,
  FiLock, FiUnlock, FiAlertTriangle, FiCrown, FiUsers
} from 'react-icons/fi';

export default function AdminsManagement() {
  const [admins, setAdmins] = useState([]);
  const [filteredAdmins, setFilteredAdmins] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [isLoading, setIsLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [adminToDelete, setAdminToDelete] = useState(null);
  const [showPermissionsModal, setShowPermissionsModal] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    superAdmins: 0
  });

  // قائمة الصلاحيات المتاحة
  const availablePermissions = [
    { id: 'user_management', name: 'إدارة المستخدمين', description: 'إضافة وتعديل وحذف المستخدمين' },
    { id: 'content_management', name: 'إدارة المحتوى', description: 'إدارة الصفحات والمقالات' },
    { id: 'admin_management', name: 'إدارة المديرين', description: 'إضافة وحذف المديرين الآخرين' },
    { id: 'system_settings', name: 'إعدادات النظام', description: 'تعديل إعدادات النظام العامة' },
    { id: 'analytics', name: 'التحليلات', description: 'عرض تقارير وإحصائيات النظام' },
    { id: 'backup_restore', name: 'النسخ الاحتياطي', description: 'إنشاء واستعادة النسخ الاحتياطية' },
    { id: 'security_management', name: 'إدارة الأمان', description: 'إدارة إعدادات الأمان والمراقبة' }
  ];

  // التحقق من صلاحيات المدير - تمت إزالة الحراسة المحلية والاعتماد على AdminLayout
  // useEffect(() => {
  //   if (!loading && (!user || user.role !== 'admin')) {
  //     router.push('/auth/login');
  //     return;
  //   }
  //
  //   if (user && user.role === 'admin')) {
  //     loadAdmins();
  //   }
  // }, [user, loading, router]);

  // تحميل المديرين عند التركيب
  useEffect(() => {
    loadAdmins();
  }, []);

  // تحميل المديرين
  const loadAdmins = async () => {
    try {
      setIsLoading(true);
      
      // تحميل المديرين من قاعدة البيانات
      const { data: dbAdmins, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'admin')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Database error:', error);
      }

      // بيانات وهمية للمديرين (تستخدم إذا لم توجد بيانات في قاعدة البيانات)
      const mockAdmins = dbAdmins && dbAdmins.length > 0 ? dbAdmins.map(admin => ({
        id: admin.id,
        email: admin.email,
        full_name: admin.full_name || admin.email,
        role: admin.role,
        admin_level: admin.admin_level || 'admin',
        is_active: admin.is_active !== false,
        is_blocked: admin.is_blocked || false,
        created_at: admin.created_at,
        last_seen: admin.last_seen,
        permissions: admin.permissions || ['user_management', 'content_management'],
        avatar_url: admin.avatar_url,
        phone: admin.phone,
        department: admin.department || 'عام'
      })) : [
        {
          id: '1',
          email: 'admin@zomiga.com',
          full_name: 'المدير العام',
          role: 'admin',
          admin_level: 'super_admin',
          is_active: true,
          is_blocked: false,
          created_at: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
          last_seen: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
          permissions: ['user_management', 'content_management', 'admin_management', 'system_settings', 'analytics', 'backup_restore', 'security_management'],
          avatar_url: null,
          phone: '+966501234567',
          department: 'الإدارة العليا'
        },
        {
          id: '2',
          email: 'content.admin@zomiga.com',
          full_name: 'مدير المحتوى',
          role: 'admin',
          admin_level: 'admin',
          is_active: true,
          is_blocked: false,
          created_at: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
          last_seen: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          permissions: ['content_management', 'analytics'],
          avatar_url: null,
          phone: '+966507654321',
          department: 'المحتوى'
        },
        {
          id: '3',
          email: 'user.admin@zomiga.com',
          full_name: 'مدير المستخدمين',
          role: 'admin',
          admin_level: 'admin',
          is_active: true,
          is_blocked: false,
          created_at: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
          last_seen: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
          permissions: ['user_management', 'analytics'],
          avatar_url: null,
          phone: '+966509876543',
          department: 'خدمة العملاء'
        },
        {
          id: '4',
          email: 'tech.admin@zomiga.com',
          full_name: 'المدير التقني',
          role: 'admin',
          admin_level: 'admin',
          is_active: false,
          is_blocked: false,
          created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          last_seen: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          permissions: ['system_settings', 'backup_restore', 'security_management'],
          avatar_url: null,
          phone: '+966502468135',
          department: 'التقنية'
        }
      ];

      setAdmins(mockAdmins);
      setFilteredAdmins(mockAdmins);

      // حساب الإحصائيات
      const active = mockAdmins.filter(admin => admin.is_active && !admin.is_blocked).length;
      const inactive = mockAdmins.filter(admin => !admin.is_active || admin.is_blocked).length;
      const superAdmins = mockAdmins.filter(admin => admin.admin_level === 'super_admin').length;

      setStats({
        total: mockAdmins.length,
        active,
        inactive,
        superAdmins
      });

    } catch (error) {
      console.error('خطأ في تحميل المديرين:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // تصفية المديرين
  useEffect(() => {
    let filtered = admins;

    // تصفية حسب البحث
    if (searchTerm) {
      filtered = filtered.filter(admin => 
        admin.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        admin.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        admin.department.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // تصفية حسب الدور
    if (filterRole !== 'all') {
      filtered = filtered.filter(admin => admin.admin_level === filterRole);
    }

    // تصفية حسب الحالة
    if (filterStatus !== 'all') {
      if (filterStatus === 'active') {
        filtered = filtered.filter(admin => admin.is_active && !admin.is_blocked);
      } else if (filterStatus === 'inactive') {
        filtered = filtered.filter(admin => !admin.is_active || admin.is_blocked);
      }
    }

    setFilteredAdmins(filtered);
  }, [admins, searchTerm, filterRole, filterStatus]);

  // حذف مدير
  const handleDeleteAdmin = async (adminId) => {
    try {
      // التحقق من عدم حذف المدير العام الوحيد
      const superAdminsCount = admins.filter(admin => admin.admin_level === 'super_admin').length;
      const adminToDelete = admins.find(admin => admin.id === adminId);
      
      if (adminToDelete.admin_level === 'super_admin' && superAdminsCount === 1) {
        alert('لا يمكن حذف المدير العام الوحيد في النظام');
        return;
      }

      // هنا يمكن إضافة كود حذف المدير من قاعدة البيانات
      const updatedAdmins = admins.filter(admin => admin.id !== adminId);
      setAdmins(updatedAdmins);
      setShowDeleteModal(false);
      setAdminToDelete(null);
    } catch (error) {
      console.error('خطأ في حذف المدير:', error);
    }
  };

  // تغيير حالة المدير
  const handleStatusChange = async (adminId, field, value) => {
    try {
      const updatedAdmins = admins.map(admin => 
        admin.id === adminId ? { ...admin, [field]: value } : admin
      );
      setAdmins(updatedAdmins);
    } catch (error) {
      console.error('خطأ في تغيير حالة المدير:', error);
    }
  };

  // تحديث صلاحيات المدير
  const handleUpdatePermissions = async (adminId, newPermissions) => {
    try {
      const updatedAdmins = admins.map(admin => 
        admin.id === adminId ? { ...admin, permissions: newPermissions } : admin
      );
      setAdmins(updatedAdmins);
      setShowPermissionsModal(false);
      setSelectedAdmin(null);
    } catch (error) {
      console.error('خطأ في تحديث الصلاحيات:', error);
    }
  };

  // تنسيق التاريخ
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // الحصول على لون مستوى المدير
  const getAdminLevelColor = (level) => {
    switch (level) {
      case 'super_admin': return 'bg-purple-100 text-purple-800';
      case 'admin': return 'bg-blue-100 text-blue-800';
      case 'moderator': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // الحصول على نص مستوى المدير
  const getAdminLevelText = (level) => {
    switch (level) {
      case 'super_admin': return 'مدير عام';
      case 'admin': return 'مدير';
      case 'moderator': return 'مشرف';
      default: return 'غير محدد';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  return (
    <AdminLayout title="إدارة المديرين" description="إدارة شاملة للمديرين وصلاحياتهم">
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div className="flex items-center">
                <Link href="/admin/master-control-panel">
                  <a className="flex items-center text-gray-600 hover:text-gray-900 ml-4">
                    <FiArrowLeft className="w-5 h-5" />
                  </a>
                </Link>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">إدارة المديرين</h1>
                  <p className="text-gray-600 mt-1">إدارة شاملة للمديرين وصلاحياتهم</p>
                </div>
              </div>
              <div className="flex items-center space-x-4 space-x-reverse w-full sm:w-auto">
                <Link href="/admin/add-admin">
                  <a className="mobile-touch-target control-button flex items-center justify-center px-4 py-3 sm:py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors min-h-[44px] flex-1 sm:flex-none text-base font-medium">
                    <FiUserPlus className="w-4 h-4 ml-2" />
                    إضافة مدير جديد
                  </a>
                </Link>
                <button 
                  onClick={loadAdmins}
                  className="mobile-touch-target control-button flex items-center justify-center px-4 py-3 sm:py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors min-h-[44px] flex-1 sm:flex-none text-base font-medium"
                >
                  <FiSettings className="w-4 h-4 ml-2" />
                  تحديث
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* إحصائيات سريعة */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FiUsers className="w-6 h-6 text-blue-600" />
              </div>
              <div className="mr-4">
                <p className="text-sm font-medium text-gray-600">إجمالي المديرين</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <FiUserCheck className="w-6 h-6 text-green-600" />
              </div>
              <div className="mr-4">
                <p className="text-sm font-medium text-gray-600">نشط</p>
                <p className="text-2xl font-bold text-gray-900">{stats.active}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <FiLock className="w-6 h-6 text-red-600" />
              </div>
              <div className="mr-4">
                <p className="text-sm font-medium text-gray-600">غير نشط</p>
                <p className="text-2xl font-bold text-gray-900">{stats.inactive}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <FiCrown className="w-6 h-6 text-purple-600" />
              </div>
              <div className="mr-4">
                <p className="text-sm font-medium text-gray-600">مديرين عامين</p>
                <p className="text-2xl font-bold text-gray-900">{stats.superAdmins}</p>
              </div>
            </div>
          </div>
        </div>

        {/* أدوات البحث والتصفية */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="p-6">
            <div className="flex flex-col space-y-4">
              <div className="flex-1">
                <div className="relative">
                  <FiSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="البحث في المديرين..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="mobile-touch-target w-full pr-10 pl-4 py-3 sm:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base min-h-[44px]"
                  />
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 sm:space-x-reverse">
                <select
                  value={filterRole}
                  onChange={(e) => setFilterRole(e.target.value)}
                  className="mobile-touch-target flex-1 px-4 py-3 sm:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base min-h-[44px]"
                >
                  <option value="all">جميع المستويات</option>
                  <option value="super_admin">مدير عام</option>
                  <option value="admin">مدير</option>
                  <option value="moderator">مشرف</option>
                </select>
                
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="mobile-touch-target flex-1 px-4 py-3 sm:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base min-h-[44px]"
                >
                  <option value="all">جميع الحالات</option>
                  <option value="active">نشط</option>
                  <option value="inactive">غير نشط</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* جدول المديرين */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    المدير
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    المستوى
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    القسم
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    الحالة
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    آخر نشاط
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    تاريخ الإنضمام
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    الإجراءات
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredAdmins.map((admin) => (
                  <tr key={admin.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          {admin.avatar_url ? (
                            <img className="h-10 w-10 rounded-full" src={admin.avatar_url} alt="" />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                              <FiUserCheck className="h-5 w-5 text-gray-600" />
                            </div>
                          )}
                        </div>
                        <div className="mr-4">
                          <div className="text-sm font-medium text-gray-900">{admin.full_name}</div>
                          <div className="text-sm text-gray-500">{admin.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getAdminLevelColor(admin.admin_level)}`}>
                        {admin.admin_level === 'super_admin' && <FiCrown className="w-3 h-3 ml-1" />}
                        {getAdminLevelText(admin.admin_level)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {admin.department}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2 space-x-reverse">
                        {admin.is_active && !admin.is_blocked ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            <FiCheck className="w-3 h-3 ml-1" />
                            نشط
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            <FiX className="w-3 h-3 ml-1" />
                            غير نشط
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {admin.last_seen ? formatDate(admin.last_seen) : 'لم يسجل دخول'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(admin.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center space-x-2 space-x-reverse">
                        <button
                          onClick={() => {
                            setSelectedAdmin(admin);
                            setShowPermissionsModal(true);
                          }}
                          className="mobile-touch-target control-button text-blue-600 hover:text-blue-900 p-2 rounded-lg hover:bg-blue-50 min-h-[44px] min-w-[44px] flex items-center justify-center"
                          title="إدارة الصلاحيات"
                        >
                          <FiShield className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleStatusChange(admin.id, 'is_active', !admin.is_active)}
                          className={`mobile-touch-target control-button p-2 rounded-lg min-h-[44px] min-w-[44px] flex items-center justify-center ${admin.is_active ? 'text-red-600 hover:text-red-900 hover:bg-red-50' : 'text-green-600 hover:text-green-900 hover:bg-green-50'}`}
                          title={admin.is_active ? 'إلغاء التفعيل' : 'تفعيل'}
                        >
                          {admin.is_active ? <FiLock className="w-4 h-4" /> : <FiUnlock className="w-4 h-4" />}
                        </button>
                        {admin.admin_level !== 'super_admin' && (
                          <button
                            onClick={() => {
                              setAdminToDelete(admin);
                              setShowDeleteModal(true);
                            }}
                            className="mobile-touch-target control-button text-red-600 hover:text-red-900 p-2 rounded-lg hover:bg-red-50 min-h-[44px] min-w-[44px] flex items-center justify-center"
                            title="حذف"
                          >
                            <FiTrash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {filteredAdmins.length === 0 && (
            <div className="text-center py-12">
              <FiUsers className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">لا يوجد مديرين</h3>
              <p className="mt-1 text-sm text-gray-500">ابدأ بإضافة مدير جديد.</p>
            </div>
          )}
        </div>
      </div>

      {/* نافذة حذف المدير */}
      {showDeleteModal && adminToDelete && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3 text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                <FiTrash2 className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mt-4">حذف المدير</h3>
              <div className="mt-2 px-7 py-3">
                <p className="text-sm text-gray-500">
                  هل أنت متأكد من حذف المدير "{adminToDelete.full_name}"؟ هذا الإجراء لا يمكن التراجع عنه.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row justify-center space-y-2 sm:space-y-0 sm:space-x-4 sm:space-x-reverse mt-4">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setAdminToDelete(null);
                  }}
                  className="mobile-touch-target control-button px-4 py-3 sm:py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors min-h-[44px] text-base font-medium"
                >
                  إلغاء
                </button>
                <button
                  onClick={() => handleDeleteAdmin(adminToDelete.id)}
                  className="mobile-touch-target control-button px-4 py-3 sm:py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors min-h-[44px] text-base font-medium"
                >
                  حذف
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* نافذة إدارة الصلاحيات */}
      {showPermissionsModal && selectedAdmin && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  إدارة صلاحيات: {selectedAdmin.full_name}
                </h3>
                <button
                  onClick={() => {
                    setShowPermissionsModal(false);
                    setSelectedAdmin(null);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <FiX className="w-6 h-6" />
                </button>
              </div>
              
              <div className="space-y-4">
                {availablePermissions.map((permission) => (
                  <div key={permission.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">{permission.name}</h4>
                      <p className="text-sm text-gray-500">{permission.description}</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={selectedAdmin.permissions.includes(permission.id)}
                      onChange={(e) => {
                        const newPermissions = e.target.checked
                          ? [...selectedAdmin.permissions, permission.id]
                          : selectedAdmin.permissions.filter(p => p !== permission.id);
                        setSelectedAdmin({ ...selectedAdmin, permissions: newPermissions });
                      }}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                  </div>
                ))}
              </div>
              
              <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-4 sm:space-x-reverse mt-6">
                <button
                  onClick={() => {
                    setShowPermissionsModal(false);
                    setSelectedAdmin(null);
                  }}
                  className="mobile-touch-target control-button px-4 py-3 sm:py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors min-h-[44px] text-base font-medium"
                >
                  إلغاء
                </button>
                <button
                  onClick={() => handleUpdatePermissions(selectedAdmin.id, selectedAdmin.permissions)}
                  className="mobile-touch-target control-button px-4 py-3 sm:py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors min-h-[44px] text-base font-medium"
                >
                  حفظ التغييرات
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
    </AdminLayout>
  );
}