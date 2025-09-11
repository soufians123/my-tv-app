import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import AdminLayout from '../../components/admin/AdminLayout';
import { supabase } from '../../lib/supabase';
import {
  FiUserX, FiUsers, FiSearch, FiFilter, FiArrowLeft,
  FiUnlock, FiLock, FiEye, FiTrash2, FiAlertTriangle,
  FiCalendar, FiClock, FiCheck, FiX, FiMoreVertical
} from 'react-icons/fi';

export default function BlockedUsers() {
  const router = useRouter();
  const [blockedUsers, setBlockedUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPeriod, setFilterPeriod] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [actionType, setActionType] = useState('');

  useEffect(() => {
    // الاعتماد على AdminLayout في الحراسة، هنا فقط نحمل البيانات
    loadBlockedUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [blockedUsers, searchTerm, filterPeriod]);

  const loadBlockedUsers = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('is_blocked', true)
        .order('blocked_at', { ascending: false });

      if (error) throw error;

      // إضافة بيانات وهمية للاختبار إذا لم توجد بيانات
      const mockBlockedUsers = data.length === 0 ? [
        {
          id: '1',
          email: 'blocked1@example.com',
          full_name: 'أحمد محمد',
          is_blocked: true,
          blocked_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          blocked_reason: 'انتهاك شروط الاستخدام',
          blocked_by: 'admin@zomiga.com',
          last_seen: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: '2',
          email: 'blocked2@example.com',
          full_name: 'سارة أحمد',
          is_blocked: true,
          blocked_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          blocked_reason: 'محتوى غير مناسب',
          blocked_by: 'admin@zomiga.com',
          last_seen: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: '3',
          email: 'blocked3@example.com',
          full_name: 'محمد علي',
          is_blocked: true,
          blocked_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
          blocked_reason: 'سلوك مسيء',
          blocked_by: 'admin@zomiga.com',
          last_seen: new Date(Date.now() - 11 * 24 * 60 * 60 * 1000).toISOString()
        }
      ] : data;

      setBlockedUsers(mockBlockedUsers);
    } catch (error) {
      console.error('خطأ في تحميل المستخدمين المحظورين:', error);
      setErrorMessage('حدث خطأ في تحميل المستخدمين المحظورين');
    } finally {
      setIsLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = blockedUsers;

    if (searchTerm) {
      filtered = filtered.filter(user => 
        user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.blocked_reason?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterPeriod !== 'all') {
      const now = new Date();
      const filterDate = new Date();
      
      switch (filterPeriod) {
        case 'today':
          filterDate.setHours(0, 0, 0, 0);
          break;
        case 'week':
          filterDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          filterDate.setMonth(now.getMonth() - 1);
          break;
      }
      
      filtered = filtered.filter(user => 
        new Date(user.blocked_at) >= filterDate
      );
    }

    setFilteredUsers(filtered);
  };

  const handleUnblockUser = async (userId) => {
    try {
      // الحصول على بريد الأدمن الحالي من Supabase بدون الاعتماد على useAuth
      const { data: authData, error: authError } = await supabase.auth.getUser();
      if (authError) {
        console.warn('Supabase auth error:', authError);
      }
      const currentUserEmail = authData?.user?.email || 'admin';

      const { error } = await supabase
        .from('profiles')
        .update({
          is_blocked: false,
          blocked_at: null,
          blocked_reason: null,
          blocked_by: null,
          unblocked_at: new Date().toISOString(),
          unblocked_by: currentUserEmail
        })
        .eq('id', userId);

      if (error) throw error;

      setSuccessMessage('تم إلغاء حظر المستخدم بنجاح');
      loadBlockedUsers();
      setShowConfirmDialog(false);
      setSelectedUser(null);
      
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('خطأ في إلغاء حظر المستخدم:', error);
      setErrorMessage('حدث خطأ في إلغاء حظر المستخدم');
      setTimeout(() => setErrorMessage(''), 3000);
    }
  };

  const handleDeleteUser = async (userId) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);

      if (error) throw error;

      setSuccessMessage('تم حذف المستخدم نهائياً');
      loadBlockedUsers();
      setShowConfirmDialog(false);
      setSelectedUser(null);
      
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('خطأ في حذف المستخدم:', error);
      setErrorMessage('حدث خطأ في حذف المستخدم');
      setTimeout(() => setErrorMessage(''), 3000);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'غير محدد';
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTimeSince = (dateString) => {
    if (!dateString) return 'غير محدد';
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 24) {
      return `منذ ${diffInHours} ساعة`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `منذ ${diffInDays} يوم`;
    }
  };

  const confirmAction = (user, action) => {
    setSelectedUser(user);
    setActionType(action);
    setShowConfirmDialog(true);
  };

  const executeAction = () => {
    if (actionType === 'unblock') {
      handleUnblockUser(selectedUser.id);
    } else if (actionType === 'delete') {
      handleDeleteUser(selectedUser.id);
    }
  };

  // إظهار لودينغ محلي فقط أثناء تحميل البيانات
  if (isLoading) {
    return (
      <AdminLayout title="المستخدمون المحظورون" description="إدارة المستخدمين المحظورين وإلغاء الحظر">
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">جاري التحميل...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="المستخدمون المحظورون" description="إدارة المستخدمين المحظورين وإلغاء الحظر">
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between py-6">
              <div className="flex items-center">
                <button
                  onClick={() => router.push('/admin/master-control-panel')}
                  className="flex items-center text-gray-600 hover:text-gray-900 ml-4"
                >
                  <FiArrowLeft className="w-5 h-5" />
                </button>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                    <FiUserX className="w-6 h-6 ml-2" />
                    المستخدمون المحظورون
                  </h1>
                  <p className="text-gray-600 mt-1">إدارة المستخدمين المحظورين وإلغاء الحظر</p>
                </div>
              </div>
              <div className="text-sm text-gray-600">
                إجمالي المحظورين: {blockedUsers.length}
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* رسائل النجاح والخطأ */}
          {successMessage && (
            <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center">
                <FiCheck className="w-5 h-5 text-green-500 ml-2" />
                <p className="text-green-800">{successMessage}</p>
              </div>
            </div>
          )}

          {errorMessage && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center">
                <FiX className="w-5 h-5 text-red-500 ml-2" />
                <p className="text-red-800">{errorMessage}</p>
              </div>
            </div>
          )}

          {/* أدوات البحث والتصفية */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
              <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4 md:space-x-reverse">
                {/* البحث */}
                <div className="relative">
                  <input
                    type="text"
                    placeholder="البحث بالاسم أو البريد أو سبب الحظر..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full md:w-80 px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <FiSearch className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                </div>

                {/* تصفية حسب الفترة */}
                <div className="relative">
                  <select
                    value={filterPeriod}
                    onChange={(e) => setFilterPeriod(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="all">جميع الفترات</option>
                    <option value="today">اليوم</option>
                    <option value="week">الأسبوع الماضي</option>
                    <option value="month">الشهر الماضي</option>
                  </select>
                </div>
              </div>

              <div className="text-sm text-gray-600">
                عرض {filteredUsers.length} من {blockedUsers.length} مستخدم محظور
              </div>
            </div>
          </div>

          {/* قائمة المستخدمين المحظورين */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            {filteredUsers.length > 0 ? (
              <div className="divide-y divide-gray-200">
                {filteredUsers.map((blockedUser) => (
                  <div key={blockedUser.id} className="p-6 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 space-x-reverse">
                        {/* صورة المستخدم */}
                        <div className="flex-shrink-0">
                          <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
                            <FiUserX className="w-6 h-6 text-red-600" />
                          </div>
                        </div>

                        {/* معلومات المستخدم */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 space-x-reverse">
                            <h3 className="text-lg font-medium text-gray-900">
                              {blockedUser.full_name || 'غير محدد'}
                            </h3>
                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                              محظور
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">{blockedUser.email}</p>
                          
                          <div className="mt-2 flex items-center space-x-4 space-x-reverse text-sm text-gray-500">
                            <div className="flex items-center">
                              <FiCalendar className="w-4 h-4 ml-1" />
                              <span>تاريخ الحظر: {formatDate(blockedUser.blocked_at)}</span>
                            </div>
                            <div className="flex items-center">
                              <FiClock className="w-4 h-4 ml-1" />
                              <span>آخر ظهور: {getTimeSince(blockedUser.last_seen)}</span>
                            </div>
                          </div>

                          {/* سبب الحظر */}
                          <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-start space-x-2 space-x-reverse">
                              <FiAlertTriangle className="w-4 ه-4 text-orange-500 mt-0.5 flex-shrink-0" />
                              <div>
                                <p className="text-sm font-medium text-gray-900">سبب الحظر:</p>
                                <p className="text-sm text-gray-600 mt-1">
                                  {blockedUser.blocked_reason || 'لم يتم تحديد السبب'}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                  تم الحظر بواسطة: {blockedUser.blocked_by || 'غير محدد'}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* أزرار الإجراءات */}
                      <div className="flex items-center space-x-2 space-x-reverse">
                        <button
                          onClick={() => confirmAction(blockedUser, 'unblock')}
                          className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                        >
                          <FiUnlock className="w-4 h-4 ml-2" />
                          إلغاء الحظر
                        </button>
                        
                        <button
                          onClick={() => confirmAction(blockedUser, 'delete')}
                          className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                        >
                          <FiTrash2 className="w-4 h-4 ml-2" />
                          حذف نهائي
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <FiUserX className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">
                  {searchTerm || filterPeriod !== 'all' ? 'لا توجد نتائج' : 'لا يوجد مستخدمون محظورون'}
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  {searchTerm || filterPeriod !== 'all' 
                    ? 'لم يتم العثور على مستخدمين يطابقون معايير البحث'
                    : 'لا يوجد مستخدمون محظورون حالياً'
                  }
                </p>
              </div>
            )}
          </div>
        </div>

        {/* نافذة التأكيد */}
        {showConfirmDialog && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3 text-center">
                <div className={`mx-auto flex items-center justify-center h-12 w-12 rounded-full ${
                  actionType === 'unblock' ? 'bg-green-100' : 'bg-red-100'
                }`}>
                  {actionType === 'unblock' ? (
                    <FiUnlock className={`w-6 h-6 text-green-600`} />
                  ) : (
                    <FiTrash2 className={`w-6 h-6 text-red-600`} />
                  )}
                </div>
                <h3 className="text-lg leading-6 font-medium text-gray-900 mt-4">
                  {actionType === 'unblock' ? 'إلغاء حظر المستخدم' : 'حذف المستخدم نهائياً'}
                </h3>
                <div className="mt-2 px-7 py-3">
                  <p className="text-sm text-gray-500">
                    {actionType === 'unblock' 
                      ? `هل أنت متأكد من إلغاء حظر المستخدم "${selectedUser?.full_name}"؟ سيتمكن من الوصول للتطبيق مرة أخرى.`
                      : `هل أنت متأكد من حذف المستخدم "${selectedUser?.full_name}" نهائياً؟ هذا الإجراء لا يمكن التراجع عنه.`
                    }
                  </p>
                </div>
                <div className="items-center px-4 py-3">
                  <div className="flex space-x-4 space-x-reverse">
                    <button
                      onClick={() => setShowConfirmDialog(false)}
                      className="px-4 py-2 bg-gray-500 text-white text-base font-medium rounded-md shadow-sm hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-300"
                    >
                      إلغاء
                    </button>
                    <button
                      onClick={executeAction}
                      className={`px-4 py-2 text-white text-base font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 ${
                        actionType === 'unblock'
                          ? 'bg-green-600 hover:bg-green-700 focus:ring-green-300'
                          : 'bg-red-600 hover:bg-red-700 focus:ring-red-300'
                      }`}
                    >
                      {actionType === 'unblock' ? 'إلغاء الحظر' : 'حذف نهائي'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}