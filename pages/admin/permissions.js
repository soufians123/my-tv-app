import { useState, useEffect } from 'react';
// import { useRouter } from 'next/router';
import Link from 'next/link';
import AdminLayout from '../../components/admin/AdminLayout';
import { supabase } from '../../lib/supabase';
import {
  Shield, Users, Settings, FileText, BarChart3,
  ArrowLeft, Edit, Save, X, Check, Search,
  Filter, MoreVertical, Eye, Lock, Unlock
} from 'lucide-react';

export default function Permissions() {
  // const router = useRouter();
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [editingUser, setEditingUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const permissionsList = [
    { key: 'userManagement', label: 'إدارة المستخدمين', description: 'عرض وتعديل وحذف المستخدمين' },
    { key: 'contentManagement', label: 'إدارة المحتوى', description: 'إنشاء وتعديل وحذف المحتوى' },
    { key: 'systemSettings', label: 'إعدادات النظام', description: 'تعديل إعدادات التطبيق العامة' },
    { key: 'analytics', label: 'التحليلات والتقارير', description: 'عرض التحليلات والإحصائيات' },
    { key: 'backup', label: 'النسخ الاحتياطي', description: 'إنشاء واستعادة النسخ الاحتياطية' },
    { key: 'adminManagement', label: 'إدارة المديرين', description: 'إضافة وحذف المديرين' }
  ];

  useEffect(() => {
    // تحميل المستخدمين عند التركيب، AdminLayout يتكفل بالمصادقة والحراسة
    loadUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, searchTerm, filterRole]);

  const loadUsers = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // إضافة صلاحيات افتراضية للمستخدمين الذين لا يملكون صلاحيات
      const usersWithPermissions = data.map(user => ({
        ...user,
        permissions: user.permissions || {
          userManagement: user.role === 'admin',
          contentManagement: user.role === 'admin',
          systemSettings: user.role === 'admin',
          analytics: user.role === 'admin',
          backup: user.role === 'admin',
          adminManagement: user.role === 'admin'
        }
      }));

      setUsers(usersWithPermissions);
    } catch (error) {
      console.error('خطأ في تحميل المستخدمين:', error);
      setErrorMessage('حدث خطأ في تحميل المستخدمين');
    } finally {
      setIsLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = users;

    if (searchTerm) {
      filtered = filtered.filter(user => 
        user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterRole !== 'all') {
      filtered = filtered.filter(user => user.role === filterRole);
    }

    setFilteredUsers(filtered);
  };

  const handlePermissionChange = (userId, permission, value) => {
    setUsers(prev => prev.map(user => {
      if (user.id === userId) {
        return {
          ...user,
          permissions: {
            ...user.permissions,
            [permission]: value
          }
        };
      }
      return user;
    }));
  };

  const handleRoleChange = (userId, newRole) => {
    setUsers(prev => prev.map(user => {
      if (user.id === userId) {
        const defaultPermissions = newRole === 'admin' ? {
          userManagement: true,
          contentManagement: true,
          systemSettings: true,
          analytics: true,
          backup: true,
          adminManagement: true
        } : {
          userManagement: false,
          contentManagement: false,
          systemSettings: false,
          analytics: false,
          backup: false,
          adminManagement: false
        };

        return {
          ...user,
          role: newRole,
          permissions: defaultPermissions
        };
      }
      return user;
    }));
  };

  const saveUserPermissions = async (userId) => {
    try {
      const userToUpdate = users.find(u => u.id === userId);
      if (!userToUpdate) return;

      const { error } = await supabase
        .from('profiles')
        .update({
          role: userToUpdate.role,
          permissions: userToUpdate.permissions,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (error) throw error;

      setSuccessMessage('تم حفظ الصلاحيات بنجاح');
      setEditingUser(null);
      
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('خطأ في حفظ الصلاحيات:', error);
      setErrorMessage('حدث خطأ في حفظ الصلاحيات');
      setTimeout(() => setErrorMessage(''), 3000);
    }
  };

  if (isLoading) {
    return (
      <AdminLayout title="إدارة الصلاحيات" description="تحديد صلاحيات المستخدمين والمديرين">
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
    <AdminLayout title="إدارة الصلاحيات" description="تحديد صلاحيات المستخدمين والمديرين">
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between py-6">
              <div className="flex items-center">
                <Link href="/admin/master-control-panel" className="flex items-center text-gray-600 hover:text-gray-900 ml-4">
                  <ArrowLeft className="w-5 h-5" />
                </Link>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                    <Shield className="w-6 ه-6 ml-2" />
                    إدارة الصلاحيات
                  </h1>
                  <p className="text-gray-600 mt-1">تحديد صلاحيات المستخدمين والمديرين</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* رسائل النجاح والخطأ */}
          {successMessage && (
            <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center">
                <Check className="w-5 h-5 text-green-500 ml-2" />
                <p className="text-green-800">{successMessage}</p>
              </div>
            </div>
          )}

          {errorMessage && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center">
                <X className="w-5 h-5 text-red-500 ml-2" />
                <p className="text-red-800">{errorMessage}</p>
              </div>
            </div>
          )}

          {/* بقية المحتوى يبقى كما هو */}
        </div>
      </div>
    </AdminLayout>
  );
}