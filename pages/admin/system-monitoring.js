import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import {
  Activity,
  Server,
  Database,
  Wifi,
  HardDrive,
  Cpu,
  MemoryStick,
  Users,
  Eye,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Download,
  Settings,
  Bell,
  Zap
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from 'next/router';

const SystemMonitoring = () => {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(5000);
  
  const [systemMetrics, setSystemMetrics] = useState({
    cpu: {
      usage: 45.2,
      cores: 8,
      temperature: 62,
      processes: 156
    },
    memory: {
      used: 6.8,
      total: 16,
      cached: 2.1,
      available: 9.2
    },
    disk: {
      used: 245,
      total: 500,
      read: 125.6,
      write: 89.3
    },
    network: {
      download: 1250,
      upload: 890,
      latency: 12,
      connections: 1247
    },
    services: {
      database: 'running',
      webServer: 'running',
      streamingService: 'running',
      authService: 'running',
      fileStorage: 'warning',
      emailService: 'error'
    }
  });

  const [performanceHistory, setPerformanceHistory] = useState({
    cpu: Array.from({ length: 20 }, (_, i) => Math.random() * 100),
    memory: Array.from({ length: 20 }, (_, i) => Math.random() * 100),
    network: Array.from({ length: 20 }, (_, i) => Math.random() * 2000)
  });

  const [alerts, setAlerts] = useState([
    {
      id: 1,
      type: 'warning',
      service: 'File Storage',
      message: 'مساحة التخزين منخفضة (15% متبقية)',
      timestamp: new Date(Date.now() - 5 * 60 * 1000),
      severity: 'medium'
    },
    {
      id: 2,
      type: 'error',
      service: 'Email Service',
      message: 'فشل في الاتصال بخادم البريد الإلكتروني',
      timestamp: new Date(Date.now() - 15 * 60 * 1000),
      severity: 'high'
    },
    {
      id: 3,
      type: 'info',
      service: 'Database',
      message: 'تم تحسين قاعدة البيانات بنجاح',
      timestamp: new Date(Date.now() - 30 * 60 * 1000),
      severity: 'low'
    }
  ]);

  // Simulate real-time updates
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      setSystemMetrics(prev => ({
        ...prev,
        cpu: {
          ...prev.cpu,
          usage: Math.max(10, Math.min(95, prev.cpu.usage + (Math.random() - 0.5) * 10)),
          temperature: Math.max(40, Math.min(85, prev.cpu.temperature + (Math.random() - 0.5) * 5))
        },
        memory: {
          ...prev.memory,
          used: Math.max(2, Math.min(14, prev.memory.used + (Math.random() - 0.5) * 1))
        },
        network: {
          ...prev.network,
          download: Math.max(100, Math.min(3000, prev.network.download + (Math.random() - 0.5) * 200)),
          upload: Math.max(50, Math.min(2000, prev.network.upload + (Math.random() - 0.5) * 150)),
          connections: Math.max(1000, Math.min(2000, prev.network.connections + Math.floor((Math.random() - 0.5) * 50)))
        }
      }));

      // Update performance history
      setPerformanceHistory(prev => ({
        cpu: [...prev.cpu.slice(1), systemMetrics.cpu.usage],
        memory: [...prev.memory.slice(1), (systemMetrics.memory.used / systemMetrics.memory.total) * 100],
        network: [...prev.network.slice(1), systemMetrics.network.download]
      }));
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, systemMetrics]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'running':
        return 'text-green-500';
      case 'warning':
        return 'text-yellow-500';
      case 'error':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'running':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const getAlertIcon = (type) => {
    switch (type) {
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'info':
      default:
        return <CheckCircle className="w-5 h-5 text-blue-500" />;
    }
  };

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatTimestamp = (timestamp) => {
    const now = new Date();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    
    if (minutes < 1) return 'الآن';
    if (minutes < 60) return `منذ ${minutes} دقيقة`;
    return `منذ ${hours} ساعة`;
  };

  const refreshData = async () => {
    setLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    toast.success('تم تحديث البيانات');
    setLoading(false);
  };

  const exportReport = () => {
    const report = {
      timestamp: new Date().toISOString(),
      metrics: systemMetrics,
      alerts: alerts,
      performance: performanceHistory
    };
    
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `system-report-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success('تم تصدير التقرير');
  };

  if (loading && Object.keys(systemMetrics).length === 0) {
    return (
      <AdminLayout title="مراقبة النظام" description="مراقبة أداء النظام والخوادم">
        <div className="flex justify-center items-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="مراقبة النظام" description="مراقبة أداء النظام والخوادم">
      <div className="space-y-6">
        {/* Header Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 space-x-reverse">
            <button
              onClick={refreshData}
              disabled={loading}
              className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              تحديث
            </button>
            
            <button
              onClick={exportReport}
              className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              <Download className="w-4 h-4 mr-2" />
              تصدير التقرير
            </button>
          </div>
          
          <div className="flex items-center space-x-4 space-x-reverse">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                className="mr-2"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">تحديث تلقائي</span>
            </label>
            
            <select
              value={refreshInterval}
              onChange={(e) => setRefreshInterval(Number(e.target.value))}
              className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-sm"
            >
              <option value={1000}>1 ثانية</option>
              <option value={5000}>5 ثواني</option>
              <option value={10000}>10 ثواني</option>
              <option value={30000}>30 ثانية</option>
            </select>
          </div>
        </div>

        {/* System Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* CPU Card */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                  <Cpu className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="mr-3">
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white">المعالج</h3>
                  <p className="text-xs text-gray-600 dark:text-gray-400">{systemMetrics.cpu.cores} أنوية</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {systemMetrics.cpu.usage.toFixed(1)}%
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">
                  {systemMetrics.cpu.temperature}°C
                </div>
              </div>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div 
                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${systemMetrics.cpu.usage}%` }}
              ></div>
            </div>
          </div>

          {/* Memory Card */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                  <MemoryStick className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <div className="mr-3">
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white">الذاكرة</h3>
                  <p className="text-xs text-gray-600 dark:text-gray-400">{systemMetrics.memory.total} GB إجمالي</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {systemMetrics.memory.used.toFixed(1)} GB
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">
                  {((systemMetrics.memory.used / systemMetrics.memory.total) * 100).toFixed(1)}%
                </div>
              </div>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div 
                className="bg-green-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(systemMetrics.memory.used / systemMetrics.memory.total) * 100}%` }}
              ></div>
            </div>
          </div>

          {/* Disk Card */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                  <HardDrive className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div className="mr-3">
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white">التخزين</h3>
                  <p className="text-xs text-gray-600 dark:text-gray-400">{systemMetrics.disk.total} GB إجمالي</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {systemMetrics.disk.used} GB
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">
                  {((systemMetrics.disk.used / systemMetrics.disk.total) * 100).toFixed(1)}%
                </div>
              </div>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div 
                className="bg-purple-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(systemMetrics.disk.used / systemMetrics.disk.total) * 100}%` }}
              ></div>
            </div>
          </div>

          {/* Network Card */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
                  <Wifi className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                </div>
                <div className="mr-3">
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white">الشبكة</h3>
                  <p className="text-xs text-gray-600 dark:text-gray-400">{systemMetrics.network.connections} اتصال</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-bold text-gray-900 dark:text-white">
                  ↓ {systemMetrics.network.download} KB/s
                </div>
                <div className="text-sm font-bold text-gray-900 dark:text-white">
                  ↑ {systemMetrics.network.upload} KB/s
                </div>
              </div>
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">
              زمن الاستجابة: {systemMetrics.network.latency}ms
            </div>
          </div>
        </div>

        {/* Services Status */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <Server className="w-5 h-5 mr-2" />
            حالة الخدمات
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(systemMetrics.services).map(([service, status]) => (
              <div key={service} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-center">
                  {getStatusIcon(status)}
                  <span className="mr-3 text-sm font-medium text-gray-900 dark:text-white">
                    {service === 'database' && 'قاعدة البيانات'}
                    {service === 'webServer' && 'خادم الويب'}
                    {service === 'streamingService' && 'خدمة البث'}
                    {service === 'authService' && 'خدمة المصادقة'}
                    {service === 'fileStorage' && 'تخزين الملفات'}
                    {service === 'emailService' && 'خدمة البريد'}
                  </span>
                </div>
                <span className={`text-sm font-medium ${getStatusColor(status)}`}>
                  {status === 'running' && 'يعمل'}
                  {status === 'warning' && 'تحذير'}
                  {status === 'error' && 'خطأ'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Alerts */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <Bell className="w-5 h-5 mr-2" />
            التنبيهات الحديثة
          </h3>
          <div className="space-y-3">
            {alerts.map(alert => (
              <div key={alert.id} className="flex items-start space-x-3 space-x-reverse p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex-shrink-0 mt-1">
                  {getAlertIcon(alert.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {alert.service}
                    </p>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      alert.severity === 'high' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                      alert.severity === 'medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                      'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                    }`}>
                      {alert.severity === 'high' && 'عالي'}
                      {alert.severity === 'medium' && 'متوسط'}
                      {alert.severity === 'low' && 'منخفض'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {alert.message}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                    {formatTimestamp(alert.timestamp)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Performance Charts Placeholder */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <Activity className="w-5 h-5 mr-2" />
            الأداء التاريخي
          </h3>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">استخدام المعالج</h4>
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {systemMetrics.cpu.usage.toFixed(1)}%
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                متوسط آخر 20 قراءة
              </div>
            </div>
            
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">استخدام الذاكرة</h4>
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {((systemMetrics.memory.used / systemMetrics.memory.total) * 100).toFixed(1)}%
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                {systemMetrics.memory.used.toFixed(1)} GB من {systemMetrics.memory.total} GB
              </div>
            </div>
            
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">حركة الشبكة</h4>
              <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                {systemMetrics.network.download} KB/s
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                سرعة التحميل الحالية
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default SystemMonitoring;