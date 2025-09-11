import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import {
  User, Mail, Phone, Lock, Eye, EyeOff,
  ArrowLeft, Save, X, Check, AlertTriangle,
  Shield, Users, Briefcase, Crown
} from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';

export default function AddAdmin() {
  const { user, loading, isAdmin } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    admin_level: 'admin',
    department: '',
    permissions: [],
    is_active: true,
    send_welcome_email: true
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

  // قائمة الأقسام
  const departments = [
    'الإدارة العليا',
    'المحتوى',
    'خدمة العملاء',
    'التقنية',
    'التسويق',
    'المبيعات',
    'الموارد البشرية',
    'المالية',
    'عام'
  ];

  // التحقق من صلاحيات المدير
  useEffect(() => {
    if (!loading && (!user || !isAdmin())) {
      router.push('/auth/login');
      return;
    }
  }, [user, loading, router, isAdmin]);

  // التحقق من صحة البيانات
  const validateForm = () => {
    const newErrors = {};

    // التحقق من الاسم
    if (!formData.full_name.trim()) {
      newErrors.full_name = 'الاسم الكامل مطلوب';
    } else if (formData.full_name.trim().length < 2) {
      newErrors.full_name = 'الاسم يجب أن يكون أكثر من حرفين';
    }

    // التحقق من البريد الإلكتروني
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = 'البريد الإلكتروني مطلوب';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'البريد الإلكتروني غير صحيح';
    }

    // التحقق من رقم الهاتف
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    if (formData.phone && !phoneRegex.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'رقم الهاتف غير صحيح';
    }

    // التحقق من كلمة المرور
    if (!formData.password) {
      newErrors.password = 'كلمة المرور مطلوبة';
    } else if (formData.password.length < 8) {
      newErrors.password = 'كلمة المرور يجب أن تكون 8 أحرف على الأقل';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'كلمة المرور يجب أن تحتوي على حرف كبير وصغير ورقم';
    }

    // التحقق من تأكيد كلمة المرور
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'كلمات المرور غير متطابقة';
    }

    // التحقق من القسم
    if (!formData.department) {
      newErrors.department = 'القسم مطلوب';
    }

    // التحقق من الصلاحيات
    if (formData.permissions.length === 0) {
      newErrors.permissions = 'يجب اختيار صلاحية واحدة على الأقل';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // تحديث بيانات النموذج
  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // إزالة رسالة الخطأ عند التعديل
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // تحديث الصلاحيات
  const handlePermissionChange = (permissionId, checked) => {
    const newPermissions = checked
      ? [...formData.permissions, permissionId]
      : formData.permissions.filter(p => p !== permissionId);
    
    handleInputChange('permissions', newPermissions);
  };

  // إضافة المدير
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setErrors({});
    setSuccessMessage('');

    try {
      // التحقق من عدم وجود مدير بنفس البريد الإلكتروني
      const { data: existingAdmin } = await supabase
        .from('profiles')
        .select('email')
        .eq('email', formData.email)
        .single();

      if (existingAdmin) {
        setErrors({ email: 'يوجد مدير بهذا البريد الإلكتروني بالفعل' });
        return;
      }

      // إنشاء حساب المدير في Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.full_name,
            role: 'admin',
            admin_level: formData.admin_level
          }
        }
      });

      if (authError) {
        console.error('Auth error:', authError);
        setErrors({ general: 'خطأ في إنشاء الحساب: ' + authError.message });
        return;
      }

      // إضافة بيانات المدير إلى جدول profiles
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: authData.user?.id,
          email: formData.email,
          full_name: formData.full_name,
          phone: formData.phone,
          role: 'admin',
          admin_level: formData.admin_level,
          department: formData.department,
          permissions: formData.permissions,
          is_active: formData.is_active,
          created_at: new Date().toISOString()
        });

      if (profileError) {
        console.error('Profile error:', profileError);
        setErrors({ general: 'خطأ في حفظ بيانات المدير: ' + profileError.message });
        return;
      }

      // إرسال بريد ترحيبي (اختياري)
      if (formData.send_welcome_email) {
        // هنا يمكن إضافة كود إرسال البريد الإلكتروني
        console.log('إرسال بريد ترحيبي إلى:', formData.email);
      }

      setSuccessMessage('تم إضافة المدير بنجاح!');
      
      // إعادة تعيين النموذج
      setTimeout(() => {
        router.push('/admin/admins-management');
      }, 2000);

    } catch (error) {
      console.error('خطأ في إضافة المدير:', error);
      setErrors({ general: 'حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.' });
    } finally {
      setIsLoading(false);
    }
  };

  // إعادة تعيين النموذج
  const handleReset = () => {
    setFormData({
      full_name: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
      admin_level: 'admin',
      department: '',
      permissions: [],
      is_active: true,
      send_welcome_email: true
    });
    setErrors({});
    setSuccessMessage('');
  };

  /*
    if (loading) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">جاري التحميل...</p>
          </div>
        </div>
      );
    }
  */

  return (
    <AdminLayout title="إضافة مدير جديد" description="إنشاء حساب مدير جديد مع تحديد الصلاحيات">
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div className="flex items-center">
                <Link href="/admin/admins-management">
                  <a className="flex items-center text-gray-600 hover:text-gray-900 ml-4">
                    <ArrowLeft className="w-5 h-5" />
                  </a>
                </Link>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">إضافة مدير جديد</h1>
                  <p className="text-gray-600 mt-1">إنشاء حساب مدير جديد مع تحديد الصلاحيات</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* رسائل النجاح والخطأ */}
          {successMessage && (
            <div className="mb-6 bg-green-50 border border-green-200 rounded-md p-4">
              <div className="flex">
                <Check className="h-5 w-5 text-green-400" />
                <div className="mr-3">
                  <p className="text-sm text-green-800">{successMessage}</p>
                </div>
              </div>
            </div>
          )}

          {errors.general && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
              <div className="flex">
                <AlertTriangle className="h-5 w-5 text-red-400" />
                <div className="mr-3">
                  <p className="text-sm text-red-800">{errors.general}</p>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* المعلومات الأساسية */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900 flex items-center">
                  <User className="w-5 h-5 ml-2" />
                  المعلومات الأساسية
                </h3>
              </div>
              <div className="px-6 py-4 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      الاسم الكامل *
                    </label>
                    <input
                      type="text"
                      value={formData.full_name}
                      onChange={(e) => handleInputChange('full_name', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.full_name ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="أدخل الاسم الكامل"
                    />
                    {errors.full_name && (
                      <p className="mt-1 text-sm text-red-600">{errors.full_name}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      البريد الإلكتروني *
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.email ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="admin@example.com"
                    />
                    {errors.email && (
                      <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      رقم الهاتف
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.phone ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="+966501234567"
                    />
                    {errors.phone && (
                      <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      القسم *
                    </label>
                    <select
                      value={formData.department}
                      onChange={(e) => handleInputChange('department', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.department ? 'border-red-300' : 'border-gray-300'
                      }`}
                    >
                      <option value="">اختر القسم</option>
                      {departments.map(dept => (
                        <option key={dept} value={dept}>{dept}</option>
                      ))}
                    </select>
                    {errors.department && (
                      <p className="mt-1 text-sm text-red-600">{errors.department}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* كلمة المرور */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900 flex items-center">
                  <Lock className="w-5 h-5 ml-2" />
                  كلمة المرور
                </h3>
              </div>
              <div className="px-6 py-4 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      كلمة المرور *
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={formData.password}
                        onChange={(e) => handleInputChange('password', e.target.value)}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 pl-10 ${
                          errors.password ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="أدخل كلمة مرور قوية"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {errors.password && (
                      <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      تأكيد كلمة المرور *
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={formData.confirmPassword}
                        onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 pl-10 ${
                          errors.confirmPassword ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="أعد إدخال كلمة المرور"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {errors.confirmPassword && (
                      <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* مستوى الإدارة */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900 flex items-center">
                  <Crown className="w-5 h-5 ml-2" />
                  مستوى الإدارة
                </h3>
              </div>
              <div className="px-6 py-4">
                <div className="space-y-4">
                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="admin"
                      name="admin_level"
                      value="admin"
                      checked={formData.admin_level === 'admin'}
                      onChange={(e) => handleInputChange('admin_level', e.target.value)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    />
                    <label htmlFor="admin" className="mr-3 block text-sm font-medium text-gray-700">
                      مدير عادي
                    </label>
                    <span className="text-sm text-gray-500">صلاحيات محدودة حسب التخصص</span>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="super_admin"
                      name="admin_level"
                      value="super_admin"
                      checked={formData.admin_level === 'super_admin'}
                      onChange={(e) => handleInputChange('admin_level', e.target.value)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    />
                    <label htmlFor="super_admin" className="mr-3 block text-sm font-medium text-gray-700">
                      مدير عام
                    </label>
                    <span className="text-sm text-gray-500">صلاحيات كاملة على النظام</span>
                  </div>
                </div>
              </div>
            </div>

            {/* الصلاحيات */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900 flex items-center">
                  <Shield className="w-5 h-5 ml-2" />
                  الصلاحيات *
                </h3>
                <p className="text-sm text-gray-500 mt-1">اختر الصلاحيات التي سيحصل عليها المدير</p>
              </div>
              <div className="px-6 py-4">
                <div className="space-y-4">
                  {availablePermissions.map((permission) => (
                    <div key={permission.id} className="flex items-start">
                      <input
                        type="checkbox"
                        id={permission.id}
                        checked={formData.permissions.includes(permission.id)}
                        onChange={(e) => handlePermissionChange(permission.id, e.target.checked)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-1"
                      />
                      <div className="mr-3">
                        <label htmlFor={permission.id} className="block text-sm font-medium text-gray-700">
                          {permission.name}
                        </label>
                        <p className="text-sm text-gray-500">{permission.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
                {errors.permissions && (
                  <p className="mt-2 text-sm text-red-600">{errors.permissions}</p>
                )}
              </div>
            </div>

            {/* إعدادات إضافية */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900 flex items-center">
                  <Users className="w-5 h-5 ml-2" />
                  إعدادات إضافية
                </h3>
              </div>
              <div className="px-6 py-4 space-y-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="is_active"
                    checked={formData.is_active}
                    onChange={(e) => handleInputChange('is_active', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="is_active" className="mr-3 block text-sm font-medium text-gray-700">
                    تفعيل الحساب فوراً
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="send_welcome_email"
                    checked={formData.send_welcome_email}
                    onChange={(e) => handleInputChange('send_welcome_email', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="send_welcome_email" className="mr-3 block text-sm font-medium text-gray-700">
                    إرسال بريد ترحيبي
                  </label>
                </div>
              </div>
            </div>

            {/* أزرار الإجراءات */}
            <div className="flex justify-end space-x-4 space-x-reverse">
              <button
                type="button"
                onClick={handleReset}
                className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <X className="w-4 h-4 inline ml-2" />
                إعادة تعيين
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white ml-2"></div>
                    جاري الحفظ...
                  </div>
                ) : (
                  <>
                    <Save className="w-4 h-4 inline ml-2" />
                    إضافة المدير
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </AdminLayout>
  );
}