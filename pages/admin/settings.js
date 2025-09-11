import { useState, useEffect } from 'react'
// import { useRouter } from 'next/router'
// import { useAuth } from '../../contexts/AuthContext'
import AdminLayout from '../../components/admin/AdminLayout'
import {
  Settings,
  Palette,
  Globe,
  Shield,
  Bell,
  Database,
  Mail,
  Server,
  Monitor,
  Smartphone,
  Save,
  RefreshCw,
  Download,
  Upload,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Sun,
  Moon,
  Zap,
  HardDrive,
  Wifi,
  Activity,
  BarChart3,
  Users,
  FileText,
  Image,
  Video,
  Music,
  Code,
  Sliders,
  ToggleLeft,
  ToggleRight,
  CheckCircle,
  AlertTriangle,
  Info,
  X
} from 'lucide-react'
import toast from 'react-hot-toast'

const AdvancedSettings = () => {
  // const { user } = useAuth()
  // const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('general')
  const [hasChanges, setHasChanges] = useState(false)

  // General Settings
  const [generalSettings, setGeneralSettings] = useState({
    siteName: 'منصة البث المباشر',
    siteDescription: 'منصة شاملة لبث القنوات التلفزيونية والمحتوى الرقمي',
    siteUrl: 'https://example.com',
    adminEmail: 'admin@example.com',
    language: 'ar',
    timezone: 'Asia/Riyadh',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '24h',
    maintenanceMode: false,
    registrationEnabled: true,
    emailVerificationRequired: true
  })

  // Appearance Settings
  const [appearanceSettings, setAppearanceSettings] = useState({
    theme: 'light',
    primaryColor: '#3b82f6',
    secondaryColor: '#10b981',
    accentColor: '#f59e0b',
    fontFamily: 'Cairo',
    fontSize: 'medium',
    borderRadius: 'medium',
    compactMode: false,
    showBreadcrumbs: true,
    showSidebar: true,
    sidebarCollapsed: false,
    headerStyle: 'fixed',
    footerStyle: 'sticky'
  })

  // Security Settings
  const [securitySettings, setSecuritySettings] = useState({
    twoFactorAuth: false,
    sessionTimeout: 30,
    maxLoginAttempts: 5,
    passwordMinLength: 8,
    passwordRequireSpecialChars: true,
    passwordRequireNumbers: true,
    passwordRequireUppercase: true,
    ipWhitelist: '',
    apiRateLimit: 100,
    corsEnabled: true,
    corsOrigins: '*',
    sslRequired: true,
    securityHeaders: true
  })

  // Notification Settings
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    smsNotifications: false,
    newUserRegistration: true,
    newChannelAdded: true,
    systemErrors: true,
    maintenanceAlerts: true,
    performanceAlerts: true,
    securityAlerts: true,
    dailyReports: true,
    weeklyReports: true,
    monthlyReports: false
  })

  // Performance Settings
  const [performanceSettings, setPerformanceSettings] = useState({
    cacheEnabled: true,
    cacheTimeout: 3600,
    compressionEnabled: true,
    imageOptimization: true,
    lazyLoading: true,
    cdnEnabled: false,
    cdnUrl: '',
    minifyAssets: true,
    enableServiceWorker: true,
    offlineMode: false,
    maxFileSize: 10,
    maxUploadSize: 100,
    databaseOptimization: true
  })

  // Integration Settings
  const [integrationSettings, setIntegrationSettings] = useState({
    googleAnalytics: '',
    facebookPixel: '',
    googleAdsense: '',
    recaptchaSiteKey: '',
    recaptchaSecretKey: '',
    smtpHost: '',
    smtpPort: 587,
    smtpUsername: '',
    smtpPassword: '',
    smtpEncryption: 'tls',
    socialLoginGoogle: false,
    socialLoginFacebook: false,
    socialLoginTwitter: false,
    paymentGateway: 'none',
    stripePublicKey: '',
    stripeSecretKey: ''
  })

  const tabs = [
    { id: 'general', name: 'عام', icon: Settings },
    { id: 'appearance', name: 'المظهر', icon: Palette },
    { id: 'security', name: 'الأمان', icon: Shield },
    { id: 'notifications', name: 'الإشعارات', icon: Bell },
    { id: 'performance', name: 'الأداء', icon: Zap },
    { id: 'integrations', name: 'التكاملات', icon: Globe }
  ]

  const themes = [
    { value: 'light', name: 'فاتح', preview: 'bg-white border-gray-200' },
    { value: 'dark', name: 'داكن', preview: 'bg-gray-900 border-gray-700' },
    { value: 'auto', name: 'تلقائي', preview: 'bg-gradient-to-r from-white to-gray-900' }
  ]

  const colors = [
    { name: 'أزرق', value: '#3b82f6' },
    { name: 'أخضر', value: '#10b981' },
    { name: 'بنفسجي', value: '#8b5cf6' },
    { name: 'وردي', value: '#ec4899' },
    { name: 'أحمر', value: '#ef4444' },
    { name: 'برتقالي', value: '#f59e0b' },
    { name: 'أزرق فاتح', value: '#06b6d4' },
    { name: 'أخضر فاتح', value: '#84cc16' }
  ]

  const fonts = [
    { name: 'Cairo', value: 'Cairo' },
    { name: 'Tajawal', value: 'Tajawal' },
    { name: 'Amiri', value: 'Amiri' },
    { name: 'Noto Sans Arabic', value: 'Noto Sans Arabic' },
    { name: 'IBM Plex Sans Arabic', value: 'IBM Plex Sans Arabic' }
  ]

  useEffect(() => {
    // AdminLayout يتكفل بالتحقق من صلاحيات الأدمن
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      setLoading(true)
      // Replace with actual API calls
      setTimeout(() => {
        setLoading(false)
      }, 1000)
    } catch (error) {
      console.error('خطأ في تحميل الإعدادات:', error)
      toast.error('حدث خطأ في تحميل الإعدادات')
      setLoading(false)
    }
  }

  const saveSettings = async () => {
    try {
      setLoading(true)
      // Replace with actual API calls
      const allSettings = {
        general: generalSettings,
        appearance: appearanceSettings,
        security: securitySettings,
        notifications: notificationSettings,
        performance: performanceSettings,
        integrations: integrationSettings
      }
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      setHasChanges(false)
      toast.success('تم حفظ الإعدادات بنجاح')
      setLoading(false)
    } catch (error) {
      console.error('خطأ في حفظ الإعدادات:', error)
      toast.error('حدث خطأ في حفظ الإعدادات')
      setLoading(false)
    }
  }

  const resetSettings = () => {
    if (!confirm('هل أنت متأكد من إعادة تعيين جميع الإعدادات؟')) return
    
    // Reset to default values
    loadSettings()
    setHasChanges(false)
    toast.success('تم إعادة تعيين الإعدادات')
  }

  const exportSettings = () => {
    const allSettings = {
      general: generalSettings,
      appearance: appearanceSettings,
      security: securitySettings,
      notifications: notificationSettings,
      performance: performanceSettings,
      integrations: integrationSettings
    }
    
    const dataStr = JSON.stringify(allSettings, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'settings-backup.json'
    link.click()
    URL.revokeObjectURL(url)
    toast.success('تم تصدير الإعدادات')
  }

  const importSettings = (event) => {
    const file = event.target.files[0]
    if (!file) return
    
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const settings = JSON.parse(e.target.result)
        if (settings.general) setGeneralSettings(settings.general)
        if (settings.appearance) setAppearanceSettings(settings.appearance)
        if (settings.security) setSecuritySettings(settings.security)
        if (settings.notifications) setNotificationSettings(settings.notifications)
        if (settings.performance) setPerformanceSettings(settings.performance)
        if (settings.integrations) setIntegrationSettings(settings.integrations)
        setHasChanges(true)
        toast.success('تم استيراد الإعدادات بنجاح')
      } catch (error) {
        toast.error('خطأ في قراءة ملف الإعدادات')
      }
    }
    reader.readAsText(file)
  }

  const ToggleSwitch = ({ checked, onChange, label, description }) => (
    <div className="flex items-center justify-between py-3">
      <div className="flex-1">
        <label className="text-sm font-medium text-gray-900">{label}</label>
        {description && <p className="text-xs text-gray-500 mt-1">{description}</p>}
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
          checked ? 'bg-blue-600' : 'bg-gray-200'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            checked ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  )

  const ColorPicker = ({ value, onChange, colors }) => (
    <div className="flex flex-wrap gap-2">
      {colors.map((color) => (
        <button
          key={color.value}
          onClick={() => onChange(color.value)}
          className={`w-8 h-8 rounded-full border-2 transition-all ${
            value === color.value ? 'border-gray-400 scale-110' : 'border-gray-200'
          }`}
          style={{ backgroundColor: color.value }}
          title={color.name}
        />
      ))}
    </div>
  )

  if (loading && !hasChanges) {
    return (
      <AdminLayout title="الإعدادات المتقدمة" description="إعدادات النظام وتخصيص الواجهة">
        <div className="flex justify-center items-center min-h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout title="الإعدادات المتقدمة" description="إعدادات النظام وتخصيص الواجهة">
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-lg">
          {/* Header */}
          <div className="border-b border-gray-200 p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div className="flex items-center space-x-3 space-x-reverse mb-4 md:mb-0">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Settings className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">الإعدادات المتقدمة</h1>
                  <p className="text-gray-600">إدارة إعدادات النظام والتخصيص</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 space-x-reverse">
                <input
                  type="file"
                  accept=".json"
                  onChange={importSettings}
                  className="hidden"
                  id="import-settings"
                />
                <label
                  htmlFor="import-settings"
                  className="flex items-center space-x-2 space-x-reverse px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors cursor-pointer"
                >
                  <Upload className="h-4 w-4" />
                  <span>استيراد</span>
                </label>
                
                <button
                  onClick={exportSettings}
                  className="flex items-center space-x-2 space-x-reverse px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Download className="h-4 w-4" />
                  <span>تصدير</span>
                </button>
                
                <button
                  onClick={resetSettings}
                  className="flex items-center space-x-2 space-x-reverse px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  <RefreshCw className="h-4 w-4" />
                  <span>إعادة تعيين</span>
                </button>
                
                <button
                  onClick={saveSettings}
                  disabled={loading || !hasChanges}
                  className="flex items-center space-x-2 space-x-reverse px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  <span>{loading ? 'جاري الحفظ...' : 'حفظ التغييرات'}</span>
                </button>
              </div>
            </div>
            
            {hasChanges && (
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center space-x-2 space-x-reverse">
                  <AlertTriangle className="h-4 w-4 text-yellow-600" />
                  <span className="text-sm text-yellow-800">لديك تغييرات غير محفوظة</span>
                </div>
              </div>
            )}
          </div>

          <div className="flex">
            {/* Sidebar */}
            <div className="w-64 border-l border-gray-200 bg-gray-50">
              <nav className="p-4 space-y-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center space-x-3 space-x-reverse px-3 py-2 rounded-lg text-right transition-colors ${
                        activeTab === tab.id
                          ? 'bg-blue-100 text-blue-700'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{tab.name}</span>
                    </button>
                  )
                })}
              </nav>
            </div>

            {/* Content */}
            <div className="flex-1 p-6">
              {/* General Settings */}
              {activeTab === 'general' && (
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold text-gray-900">الإعدادات العامة</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">اسم الموقع</label>
                      <input
                        type="text"
                        value={generalSettings.siteName}
                        onChange={(e) => {
                          setGeneralSettings({...generalSettings, siteName: e.target.value})
                          setHasChanges(true)
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">رابط الموقع</label>
                      <input
                        type="url"
                        value={generalSettings.siteUrl}
                        onChange={(e) => {
                          setGeneralSettings({...generalSettings, siteUrl: e.target.value})
                          setHasChanges(true)
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">وصف الموقع</label>
                      <textarea
                        value={generalSettings.siteDescription}
                        onChange={(e) => {
                          setGeneralSettings({...generalSettings, siteDescription: e.target.value})
                          setHasChanges(true)
                        }}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">بريد المدير</label>
                      <input
                        type="email"
                        value={generalSettings.adminEmail}
                        onChange={(e) => {
                          setGeneralSettings({...generalSettings, adminEmail: e.target.value})
                          setHasChanges(true)
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">اللغة</label>
                      <select
                        value={generalSettings.language}
                        onChange={(e) => {
                          setGeneralSettings({...generalSettings, language: e.target.value})
                          setHasChanges(true)
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="ar">العربية</option>
                        <option value="en">English</option>
                        <option value="fr">Français</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">المنطقة الزمنية</label>
                      <select
                        value={generalSettings.timezone}
                        onChange={(e) => {
                          setGeneralSettings({...generalSettings, timezone: e.target.value})
                          setHasChanges(true)
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="Asia/Riyadh">الرياض</option>
                        <option value="Asia/Dubai">دبي</option>
                        <option value="Africa/Cairo">القاهرة</option>
                        <option value="Europe/London">لندن</option>
                        <option value="America/New_York">نيويورك</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="border-t border-gray-200 pt-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">خيارات النظام</h3>
                    <div className="space-y-4">
                      <ToggleSwitch
                        checked={generalSettings.maintenanceMode}
                        onChange={(value) => {
                          setGeneralSettings({...generalSettings, maintenanceMode: value})
                          setHasChanges(true)
                        }}
                        label="وضع الصيانة"
                        description="تفعيل وضع الصيانة لإخفاء الموقع مؤقتاً"
                      />
                      
                      <ToggleSwitch
                        checked={generalSettings.registrationEnabled}
                        onChange={(value) => {
                          setGeneralSettings({...generalSettings, registrationEnabled: value})
                          setHasChanges(true)
                        }}
                        label="السماح بالتسجيل"
                        description="السماح للمستخدمين الجدد بإنشاء حسابات"
                      />
                      
                      <ToggleSwitch
                        checked={generalSettings.emailVerificationRequired}
                        onChange={(value) => {
                          setGeneralSettings({...generalSettings, emailVerificationRequired: value})
                          setHasChanges(true)
                        }}
                        label="تأكيد البريد الإلكتروني"
                        description="طلب تأكيد البريد الإلكتروني عند التسجيل"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Appearance Settings */}
              {activeTab === 'appearance' && (
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold text-gray-900">إعدادات المظهر</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">المظهر</label>
                      <div className="grid grid-cols-3 gap-3">
                        {themes.map((theme) => (
                          <button
                            key={theme.value}
                            onClick={() => {
                              setAppearanceSettings({...appearanceSettings, theme: theme.value})
                              setHasChanges(true)
                            }}
                            className={`p-3 rounded-lg border-2 transition-all ${
                              appearanceSettings.theme === theme.value
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <div className={`w-full h-8 rounded mb-2 ${theme.preview}`}></div>
                            <span className="text-sm font-medium">{theme.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">الخط</label>
                      <select
                        value={appearanceSettings.fontFamily}
                        onChange={(e) => {
                          setAppearanceSettings({...appearanceSettings, fontFamily: e.target.value})
                          setHasChanges(true)
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        {fonts.map(font => (
                          <option key={font.value} value={font.value}>{font.name}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">اللون الأساسي</label>
                      <ColorPicker
                        value={appearanceSettings.primaryColor}
                        onChange={(value) => {
                          setAppearanceSettings({...appearanceSettings, primaryColor: value})
                          setHasChanges(true)
                        }}
                        colors={colors}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">اللون الثانوي</label>
                      <ColorPicker
                        value={appearanceSettings.secondaryColor}
                        onChange={(value) => {
                          setAppearanceSettings({...appearanceSettings, secondaryColor: value})
                          setHasChanges(true)
                        }}
                        colors={colors}
                      />
                    </div>
                  </div>
                  
                  <div className="border-t border-gray-200 pt-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">خيارات التخطيط</h3>
                    <div className="space-y-4">
                      <ToggleSwitch
                        checked={appearanceSettings.compactMode}
                        onChange={(value) => {
                          setAppearanceSettings({...appearanceSettings, compactMode: value})
                          setHasChanges(true)
                        }}
                        label="الوضع المضغوط"
                        description="تقليل المسافات والحشو لعرض أكثر كثافة"
                      />
                      
                      <ToggleSwitch
                        checked={appearanceSettings.showBreadcrumbs}
                        onChange={(value) => {
                          setAppearanceSettings({...appearanceSettings, showBreadcrumbs: value})
                          setHasChanges(true)
                        }}
                        label="عرض مسار التنقل"
                        description="إظهار مسار التنقل في أعلى الصفحات"
                      />
                      
                      <ToggleSwitch
                        checked={appearanceSettings.showSidebar}
                        onChange={(value) => {
                          setAppearanceSettings({...appearanceSettings, showSidebar: value})
                          setHasChanges(true)
                        }}
                        label="عرض الشريط الجانبي"
                        description="إظهار الشريط الجانبي للتنقل"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Security Settings */}
              {activeTab === 'security' && (
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold text-gray-900">إعدادات الأمان</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">مهلة الجلسة (دقيقة)</label>
                      <input
                        type="number"
                        value={securitySettings.sessionTimeout}
                        onChange={(e) => {
                          setSecuritySettings({...securitySettings, sessionTimeout: parseInt(e.target.value)})
                          setHasChanges(true)
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">الحد الأقصى لمحاولات تسجيل الدخول</label>
                      <input
                        type="number"
                        value={securitySettings.maxLoginAttempts}
                        onChange={(e) => {
                          setSecuritySettings({...securitySettings, maxLoginAttempts: parseInt(e.target.value)})
                          setHasChanges(true)
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">الحد الأدنى لطول كلمة المرور</label>
                      <input
                        type="number"
                        value={securitySettings.passwordMinLength}
                        onChange={(e) => {
                          setSecuritySettings({...securitySettings, passwordMinLength: parseInt(e.target.value)})
                          setHasChanges(true)
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">حد معدل API (طلب/دقيقة)</label>
                      <input
                        type="number"
                        value={securitySettings.apiRateLimit}
                        onChange={(e) => {
                          setSecuritySettings({...securitySettings, apiRateLimit: parseInt(e.target.value)})
                          setHasChanges(true)
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                  
                  <div className="border-t border-gray-200 pt-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">متطلبات كلمة المرور</h3>
                    <div className="space-y-4">
                      <ToggleSwitch
                        checked={securitySettings.passwordRequireSpecialChars}
                        onChange={(value) => {
                          setSecuritySettings({...securitySettings, passwordRequireSpecialChars: value})
                          setHasChanges(true)
                        }}
                        label="الأحرف الخاصة مطلوبة"
                        description="يجب أن تحتوي كلمة المرور على أحرف خاصة"
                      />
                      
                      <ToggleSwitch
                        checked={securitySettings.passwordRequireNumbers}
                        onChange={(value) => {
                          setSecuritySettings({...securitySettings, passwordRequireNumbers: value})
                          setHasChanges(true)
                        }}
                        label="الأرقام مطلوبة"
                        description="يجب أن تحتوي كلمة المرور على أرقام"
                      />
                      
                      <ToggleSwitch
                        checked={securitySettings.passwordRequireUppercase}
                        onChange={(value) => {
                          setSecuritySettings({...securitySettings, passwordRequireUppercase: value})
                          setHasChanges(true)
                        }}
                        label="الأحرف الكبيرة مطلوبة"
                        description="يجب أن تحتوي كلمة المرور على أحرف كبيرة"
                      />
                      
                      <ToggleSwitch
                        checked={securitySettings.twoFactorAuth}
                        onChange={(value) => {
                          setSecuritySettings({...securitySettings, twoFactorAuth: value})
                          setHasChanges(true)
                        }}
                        label="المصادقة الثنائية"
                        description="تفعيل المصادقة الثنائية للمديرين"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Notification Settings */}
              {activeTab === 'notifications' && (
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold text-gray-900">إعدادات الإشعارات</h2>
                  
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-4">طرق الإشعار</h3>
                      <div className="space-y-4">
                        <ToggleSwitch
                          checked={notificationSettings.emailNotifications}
                          onChange={(value) => {
                            setNotificationSettings({...notificationSettings, emailNotifications: value})
                            setHasChanges(true)
                          }}
                          label="إشعارات البريد الإلكتروني"
                          description="إرسال الإشعارات عبر البريد الإلكتروني"
                        />
                        
                        <ToggleSwitch
                          checked={notificationSettings.pushNotifications}
                          onChange={(value) => {
                            setNotificationSettings({...notificationSettings, pushNotifications: value})
                            setHasChanges(true)
                          }}
                          label="الإشعارات الفورية"
                          description="إرسال إشعارات فورية في المتصفح"
                        />
                        
                        <ToggleSwitch
                          checked={notificationSettings.smsNotifications}
                          onChange={(value) => {
                            setNotificationSettings({...notificationSettings, smsNotifications: value})
                            setHasChanges(true)
                          }}
                          label="إشعارات SMS"
                          description="إرسال الإشعارات عبر الرسائل النصية"
                        />
                      </div>
                    </div>
                    
                    <div className="border-t border-gray-200 pt-6">
                      <h3 className="text-lg font-medium text-gray-900 mb-4">أنواع الإشعارات</h3>
                      <div className="space-y-4">
                        <ToggleSwitch
                          checked={notificationSettings.newUserRegistration}
                          onChange={(value) => {
                            setNotificationSettings({...notificationSettings, newUserRegistration: value})
                            setHasChanges(true)
                          }}
                          label="تسجيل مستخدم جديد"
                          description="إشعار عند تسجيل مستخدم جديد"
                        />
                        
                        <ToggleSwitch
                          checked={notificationSettings.systemErrors}
                          onChange={(value) => {
                            setNotificationSettings({...notificationSettings, systemErrors: value})
                            setHasChanges(true)
                          }}
                          label="أخطاء النظام"
                          description="إشعار عند حدوث أخطاء في النظام"
                        />
                        
                        <ToggleSwitch
                          checked={notificationSettings.securityAlerts}
                          onChange={(value) => {
                            setNotificationSettings({...notificationSettings, securityAlerts: value})
                            setHasChanges(true)
                          }}
                          label="تنبيهات الأمان"
                          description="إشعار عند حدوث مشاكل أمنية"
                        />
                      </div>
                    </div>
                    
                    <div className="border-t border-gray-200 pt-6">
                      <h3 className="text-lg font-medium text-gray-900 mb-4">التقارير الدورية</h3>
                      <div className="space-y-4">
                        <ToggleSwitch
                          checked={notificationSettings.dailyReports}
                          onChange={(value) => {
                            setNotificationSettings({...notificationSettings, dailyReports: value})
                            setHasChanges(true)
                          }}
                          label="التقارير اليومية"
                          description="إرسال تقرير يومي بالإحصائيات"
                        />
                        
                        <ToggleSwitch
                          checked={notificationSettings.weeklyReports}
                          onChange={(value) => {
                            setNotificationSettings({...notificationSettings, weeklyReports: value})
                            setHasChanges(true)
                          }}
                          label="التقارير الأسبوعية"
                          description="إرسال تقرير أسبوعي مفصل"
                        />
                        
                        <ToggleSwitch
                          checked={notificationSettings.monthlyReports}
                          onChange={(value) => {
                            setNotificationSettings({...notificationSettings, monthlyReports: value})
                            setHasChanges(true)
                          }}
                          label="التقارير الشهرية"
                          description="إرسال تقرير شهري شامل"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Performance Settings */}
              {activeTab === 'performance' && (
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold text-gray-900">إعدادات الأداء</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">مهلة التخزين المؤقت (ثانية)</label>
                      <input
                        type="number"
                        value={performanceSettings.cacheTimeout}
                        onChange={(e) => {
                          setPerformanceSettings({...performanceSettings, cacheTimeout: parseInt(e.target.value)})
                          setHasChanges(true)
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">الحد الأقصى لحجم الملف (MB)</label>
                      <input
                        type="number"
                        value={performanceSettings.maxFileSize}
                        onChange={(e) => {
                          setPerformanceSettings({...performanceSettings, maxFileSize: parseInt(e.target.value)})
                          setHasChanges(true)
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">رابط CDN</label>
                      <input
                        type="url"
                        value={performanceSettings.cdnUrl}
                        onChange={(e) => {
                          setPerformanceSettings({...performanceSettings, cdnUrl: e.target.value})
                          setHasChanges(true)
                        }}
                        placeholder="https://cdn.example.com"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                  
                  <div className="border-t border-gray-200 pt-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">خيارات التحسين</h3>
                    <div className="space-y-4">
                      <ToggleSwitch
                        checked={performanceSettings.cacheEnabled}
                        onChange={(value) => {
                          setPerformanceSettings({...performanceSettings, cacheEnabled: value})
                          setHasChanges(true)
                        }}
                        label="تفعيل التخزين المؤقت"
                        description="تحسين الأداء عبر التخزين المؤقت"
                      />
                      
                      <ToggleSwitch
                        checked={performanceSettings.compressionEnabled}
                        onChange={(value) => {
                          setPerformanceSettings({...performanceSettings, compressionEnabled: value})
                          setHasChanges(true)
                        }}
                        label="ضغط المحتوى"
                        description="ضغط الملفات لتحسين سرعة التحميل"
                      />
                      
                      <ToggleSwitch
                        checked={performanceSettings.imageOptimization}
                        onChange={(value) => {
                          setPerformanceSettings({...performanceSettings, imageOptimization: value})
                          setHasChanges(true)
                        }}
                        label="تحسين الصور"
                        description="ضغط وتحسين الصور تلقائياً"
                      />
                      
                      <ToggleSwitch
                        checked={performanceSettings.lazyLoading}
                        onChange={(value) => {
                          setPerformanceSettings({...performanceSettings, lazyLoading: value})
                          setHasChanges(true)
                        }}
                        label="التحميل التدريجي"
                        description="تحميل المحتوى عند الحاجة فقط"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Integration Settings */}
              {activeTab === 'integrations' && (
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold text-gray-900">إعدادات التكاملات</h2>
                  
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-4">التحليجات والإعلانات</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Google Analytics ID</label>
                          <input
                            type="text"
                            value={integrationSettings.googleAnalytics}
                            onChange={(e) => {
                              setIntegrationSettings({...integrationSettings, googleAnalytics: e.target.value})
                              setHasChanges(true)
                            }}
                            placeholder="GA-XXXXXXXXX-X"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Facebook Pixel ID</label>
                          <input
                            type="text"
                            value={integrationSettings.facebookPixel}
                            onChange={(e) => {
                              setIntegrationSettings({...integrationSettings, facebookPixel: e.target.value})
                              setHasChanges(true)
                            }}
                            placeholder="XXXXXXXXXXXXXXX"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div className="border-t border-gray-200 pt-6">
                      <h3 className="text-lg font-medium text-gray-900 mb-4">إعدادات البريد الإلكتروني</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">خادم SMTP</label>
                          <input
                            type="text"
                            value={integrationSettings.smtpHost}
                            onChange={(e) => {
                              setIntegrationSettings({...integrationSettings, smtpHost: e.target.value})
                              setHasChanges(true)
                            }}
                            placeholder="smtp.gmail.com"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">منفذ SMTP</label>
                          <input
                            type="number"
                            value={integrationSettings.smtpPort}
                            onChange={(e) => {
                              setIntegrationSettings({...integrationSettings, smtpPort: parseInt(e.target.value)})
                              setHasChanges(true)
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">اسم المستخدم</label>
                          <input
                            type="text"
                            value={integrationSettings.smtpUsername}
                            onChange={(e) => {
                              setIntegrationSettings({...integrationSettings, smtpUsername: e.target.value})
                              setHasChanges(true)
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">كلمة المرور</label>
                          <input
                            type="password"
                            value={integrationSettings.smtpPassword}
                            onChange={(e) => {
                              setIntegrationSettings({...integrationSettings, smtpPassword: e.target.value})
                              setHasChanges(true)
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div className="border-t border-gray-200 pt-6">
                      <h3 className="text-lg font-medium text-gray-900 mb-4">تسجيل الدخول الاجتماعي</h3>
                      <div className="space-y-4">
                        <ToggleSwitch
                          checked={integrationSettings.socialLoginGoogle}
                          onChange={(value) => {
                            setIntegrationSettings({...integrationSettings, socialLoginGoogle: value})
                            setHasChanges(true)
                          }}
                          label="تسجيل الدخول بـ Google"
                          description="السماح بتسجيل الدخول عبر Google"
                        />
                        
                        <ToggleSwitch
                          checked={integrationSettings.socialLoginFacebook}
                          onChange={(value) => {
                            setIntegrationSettings({...integrationSettings, socialLoginFacebook: value})
                            setHasChanges(true)
                          }}
                          label="تسجيل الدخول بـ Facebook"
                          description="السماح بتسجيل الدخول عبر Facebook"
                        />
                        
                        <ToggleSwitch
                          checked={integrationSettings.socialLoginTwitter}
                          onChange={(value) => {
                            setIntegrationSettings({...integrationSettings, socialLoginTwitter: value})
                            setHasChanges(true)
                          }}
                          label="تسجيل الدخول بـ Twitter"
                          description="السماح بتسجيل الدخول عبر Twitter"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}

export default AdvancedSettings