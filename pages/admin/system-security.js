import { useState, useEffect } from 'react';
import Link from 'next/link';
// import { useRouter } from 'next/router';
// import { useAuth } from '../../contexts/AuthContext';
import AdminLayout from '../../components/admin/AdminLayout';
import { supabase } from '../../lib/supabase';
import {
  Shield, Server, Database, Activity, AlertTriangle,
  Lock, Unlock, Eye, EyeOff, RefreshCw, Download,
  Upload, Settings, ArrowLeft, Cpu, HardDrive,
  Wifi, Users, FileText, Clock, CheckCircle,
  XCircle, AlertCircle, Info, BarChart3
} from 'lucide-react';

export default function SystemSecurity() {
  // تمت إزالة: const { user, loading } = useAuth();
  // تمت إزالة: const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');
  const [systemStats, setSystemStats] = useState({
    cpu: 45,
    memory: 68,
    disk: 32,
    network: 'متصل',
    uptime: '15 يوم، 8 ساعات',
    lastBackup: '2024-01-15 03:00:00'
  });
  const [securityLogs, setSecurityLogs] = useState([]);
  const [systemLogs, setSystemLogs] = useState([]);
  const [securitySettings, setSecuritySettings] = useState({
    twoFactorAuth: true,
    passwordPolicy: 'strong',
    sessionTimeout: 30,
    loginAttempts: 5,
    ipWhitelist: false,
    emailNotifications: true,
    smsNotifications: false
  });
  const [isLoading, setIsLoading] = useState(false);
  const [alerts, setAlerts] = useState([]);

  // تحميل بيانات النظام عند التركيب (الحراسة تتم عبر AdminLayout)
  useEffect(() => {
    loadSystemData();
  }, []);

  // تحميل بيانات النظام
  const loadSystemData = async () => {
    try {
      setIsLoading(true);
      
      // بيانات وهمية لسجلات الأمان
      const mockSecurityLogs = [
        {
          id: '1',
          type: 'login_success',
          message: 'تسجيل دخول ناجح',
          user: 'admin@zomiga.com',
          ip: '192.168.1.100',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          severity: 'info'
        },
        {
          id: '2',
          type: 'login_failed',
          message: 'محاولة تسجيل دخول فاشلة',
          user: 'unknown@example.com',
          ip: '203.0.113.45',
          timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
          severity: 'warning'
        },
        {
          id: '3',
          type: 'password_change',
          message: 'تغيير كلمة المرور',
          user: 'user@example.com',
          ip: '192.168.1.105',
          timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
          severity: 'info'
        },
        {
          id: '4',
          type: 'suspicious_activity',
          message: 'نشاط مشبوه - محاولات دخول متعددة',
          user: 'attacker@malicious.com',
          ip: '198.51.100.23',
          timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
          severity: 'critical'
        },
        {
          id: '5',
          type: 'admin_action',
          message: 'حذف مستخدم',
          user: 'admin@zomiga.com',
          ip: '192.168.1.100',
          timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
          severity: 'warning'
        }
      ];

      // بيانات وهمية لسجلات النظام
      const mockSystemLogs = [
        {
          id: '1',
          type: 'system_start',
          message: 'بدء تشغيل النظام',
          component: 'Server',
          timestamp: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
          severity: 'info'
        },
        {
          id: '2',
          type: 'database_backup',
          message: 'نسخ احتياطي للقاعدة البيانات مكتمل',
          component: 'Database',
          timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          severity: 'info'
        },
        {
          id: '3',
          type: 'high_cpu',
          message: 'استخدام عالي للمعالج (85%)',
          component: 'CPU Monitor',
          timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
          severity: 'warning'
        },
        {
          id: '4',
          type: 'disk_space',
          message: 'مساحة القرص منخفضة (90% مستخدم)',
          component: 'Storage Monitor',
          timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
          severity: 'critical'
        },
        {
          id: '5',
          type: 'update_installed',
          message: 'تم تثبيت تحديث أمني',
          component: 'Update Manager',
          timestamp: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
          severity: 'info'
        }
      ];

      // تنبيهات النظام
      const mockAlerts = [
        {
          id: '1',
          type: 'security',
          title: 'محاولات دخول مشبوهة',
          message: 'تم رصد 15 محاولة دخول فاشلة من نفس العنوان IP',
          severity: 'high',
          timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
          resolved: false
        },
        {
          id: '2',
          type: 'system',
          title: 'مساحة التخزين منخفضة',
          message: 'مساحة القرص الصلب أقل من 10%',
          severity: 'medium',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          resolved: false
        },
        {
          id: '3',
          type: 'backup',
          title: 'النسخ الاحتياطي مكتمل',
          message: 'تم إنشاء النسخة الاحتياطية اليومية بنجاح',
          severity: 'low',
          timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
          resolved: true
        }
      ];

      setSecurityLogs(mockSecurityLogs);
      setSystemLogs(mockSystemLogs);
      setAlerts(mockAlerts);

    } catch (error) {
      console.error('خطأ في تحميل بيانات النظام:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // تحديث إعدادات الأمان
  const updateSecuritySettings = async (newSettings) => {
    try {
      setSecuritySettings(newSettings);
      // هنا يمكن إضافة كود حفظ الإعدادات في قاعدة البيانات
    } catch (error) {
      console.error('خطأ في تحديث إعدادات الأمان:', error);
    }
  };

  // حل التنبيه
  const resolveAlert = (alertId) => {
    setAlerts(alerts.map(alert => 
      alert.id === alertId ? { ...alert, resolved: true } : alert
    ));
  };

  // تنسيق التاريخ
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('ar-SA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // الحصول على لون الخطورة
  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-red-100 text-red-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'info': return 'bg-blue-100 text-blue-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // الحصول على أيقونة الخطورة
  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'critical':
      case 'high':
        return <XCircle className="w-4 h-4" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4" />;
      case 'info':
        return <Info className="w-4 h-4" />;
      case 'success':
        return <CheckCircle className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  // إزالة الاعتماد على loading من useAuth
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
    <AdminLayout title="النظام والأمان" description="مراقبة النظام وإدارة الأمان">
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div className="flex items-center">
                <Link href="/admin/master-control-panel">
                  <a className="flex items-center text-gray-600 hover:text-gray-900 ml-4">
                    <ArrowLeft className="w-5 h-5" />
                  </a>
                </Link>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">النظام والأمان</h1>
                  <p className="text-gray-600 mt-1">مراقبة النظام وإدارة الأمان</p>
                </div>
              </div>
              <div className="flex items-center space-x-4 space-x-reverse">
                <button 
                  onClick={loadSystemData}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <RefreshCw className="w-4 h-4 ml-2" />
                  تحديث
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* التبويبات */}
          <div className="mb-8">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8 space-x-reverse">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'overview'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  نظرة عامة
                </button>
                <button
                  onClick={() => setActiveTab('security')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'security'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  الأمان
                </button>
                <button
                  onClick={() => setActiveTab('logs')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'logs'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  السجلات
                </button>
                <button
                  onClick={() => setActiveTab('settings')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'settings'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  الإعدادات
                </button>
              </nav>
            </div>
          </div>

          {/* محتوى التبويبات */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* إحصائيات النظام */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Cpu className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="mr-4">
                      <p className="text-sm font-medium text-gray-600">المعالج</p>
                      <p className="text-2xl font-bold text-gray-900">{systemStats.cpu}%</p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${systemStats.cpu}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <Database className="w-6 h-6 text-green-600" />
                    </div>
                    <div className="mr-4">
                      <p className="text-sm font-medium text-gray-600">الذاكرة</p>
                      <p className="text-2xl font-bold text-gray-900">{systemStats.memory}%</p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-600 h-2 rounded-full" 
                        style={{ width: `${systemStats.memory}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-yellow-100 rounded-lg">
                      <HardDrive className="w-6 h-6 text-yellow-600" />
                    </div>
                    <div className="mr-4">
                      <p className="text-sm font-medium text-gray-600">التخزين</p>
                      <p className="text-2xl font-bold text-gray-900">{systemStats.disk}%</p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-yellow-600 h-2 rounded-full" 
                        style={{ width: `${systemStats.disk}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Wifi className="w-6 h-6 text-purple-600" />
                    </div>
                    <div className="mr-4">
                      <p className="text-sm font-medium text-gray-600">الشبكة</p>
                      <p className="text-lg font-bold text-gray-900">{systemStats.network}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* معلومات النظام */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">معلومات النظام</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">وقت التشغيل:</span>
                      <span className="font-medium">{systemStats.uptime}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">آخر نسخة احتياطية:</span>
                      <span className="font-medium">{formatDate(systemStats.lastBackup)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">إصدار النظام:</span>
                      <span className="font-medium">v2.1.0</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">التنبيهات الحديثة</h3>
                  <div className="space-y-3">
                    {alerts.filter(alert => !alert.resolved).slice(0, 3).map((alert) => (
                      <div key={alert.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(alert.severity)}`}>
                            {getSeverityIcon(alert.severity)}
                            <span className="mr-1">{alert.title}</span>
                          </span>
                        </div>
                        <button
                          onClick={() => resolveAlert(alert.id)}
                          className="text-blue-600 hover:text-blue-800 text-sm"
                        >
                          حل
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-6">
              {/* سجلات الأمان */}
              <div className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">سجلات الأمان</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          النوع
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          الرسالة
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          المستخدم
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          عنوان IP
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          الوقت
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {securityLogs.map((log) => (
                        <tr key={log.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getSeverityColor(log.severity)}`}>
                              {getSeverityIcon(log.severity)}
                              <span className="mr-1">{log.type}</span>
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {log.message}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {log.user}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {log.ip}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(log.timestamp)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'logs' && (
            <div className="space-y-6">
              {/* سجلات النظام */}
              <div className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">سجلات النظام</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          النوع
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          الرسالة
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          المكون
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          الوقت
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {systemLogs.map((log) => (
                        <tr key={log.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getSeverityColor(log.severity)}`}>
                              {getSeverityIcon(log.severity)}
                              <span className="mr-1">{log.type}</span>
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {log.message}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {log.component}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(log.timestamp)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="space-y-6">
              {/* إعدادات الأمان */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-6">إعدادات الأمان</h3>
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">المصادقة الثنائية</h4>
                      <p className="text-sm text-gray-500">تفعيل المصادقة الثنائية لجميع المديرين</p>
                    </div>
                    <button
                      onClick={() => updateSecuritySettings({
                        ...securitySettings,
                        twoFactorAuth: !securitySettings.twoFactorAuth
                      })}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        securitySettings.twoFactorAuth ? 'bg-blue-600' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          securitySettings.twoFactorAuth ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">تنبيهات البريد الإلكتروني</h4>
                      <p className="text-sm text-gray-500">إرسال تنبيهات الأمان عبر البريد الإلكتروني</p>
                    </div>
                    <button
                      onClick={() => updateSecuritySettings({
                        ...securitySettings,
                        emailNotifications: !securitySettings.emailNotifications
                      })}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        securitySettings.emailNotifications ? 'bg-blue-600' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          securitySettings.emailNotifications ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      مهلة انتهاء الجلسة (بالدقائق)
                    </label>
                    <input
                      type="number"
                      value={securitySettings.sessionTimeout}
                      onChange={(e) => updateSecuritySettings({
                        ...securitySettings,
                        sessionTimeout: parseInt(e.target.value)
                      })}
                      className="w-32 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      عدد محاولات تسجيل الدخول المسموحة
                    </label>
                    <input
                      type="number"
                      value={securitySettings.loginAttempts}
                      onChange={(e) => updateSecuritySettings({
                        ...securitySettings,
                        loginAttempts: parseInt(e.target.value)
                      })}
                      className="w-32 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}