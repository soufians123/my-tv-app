import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { useAuth } from '../../contexts/AuthContext'
import AdminLayout from '../../components/admin/AdminLayout'
import { 
  Database, 
  Download, 
  Upload,
  RefreshCw,
  ArrowLeft,
  Calendar,
  Clock,
  HardDrive,
  Cloud,
  Shield,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Play,
  Pause,
  Trash2,
  Eye,
  Copy,
  Server,
  Archive,
  FileText,
  Settings,
  Info,
  Zap
} from 'lucide-react'
import toast from 'react-hot-toast'
import Link from 'next/link'

const BackupPage = () => {
  // const { user, loading } = useAuth()
  // const router = useRouter()
  const [backups, setBackups] = useState([])
  const [loadingBackups, setLoadingBackups] = useState(true)
  const [creatingBackup, setCreatingBackup] = useState(false)
  const [restoringBackup, setRestoringBackup] = useState(null)
  const [selectedBackups, setSelectedBackups] = useState([])
  const [backupSettings, setBackupSettings] = useState(null)
  const [activeTab, setActiveTab] = useState('backups')
  const [dbStats, setDbStats] = useState(null)

  useEffect(() => {
    // AdminLayout يتولى التحقق من الصلاحيات وإعادة التوجيه
    loadBackups()
    loadBackupSettings()
    loadDatabaseStats()
  }, [])

  const loadBackups = async () => {
    try {
      setLoadingBackups(true)
      // Mock backup data
      const mockBackups = [
        {
          id: '1',
          name: 'backup_2024_01_15_10_30',
          type: 'full',
          size: '2.5 GB',
          sizeBytes: 2684354560,
          created: '2024-01-15T10:30:00Z',
          status: 'completed',
          location: 'local',
          description: 'نسخة احتياطية كاملة تلقائية',
          tables: 15,
          records: 125430,
          duration: 245, // seconds
          compression: 'gzip',
          encrypted: true
        },
        {
          id: '2',
          name: 'backup_2024_01_14_10_30',
          type: 'incremental',
          size: '450 MB',
          sizeBytes: 471859200,
          created: '2024-01-14T10:30:00Z',
          status: 'completed',
          location: 'cloud',
          description: 'نسخة احتياطية تدريجية',
          tables: 8,
          records: 23450,
          duration: 89,
          compression: 'gzip',
          encrypted: true
        },
        {
          id: '3',
          name: 'backup_2024_01_13_15_45',
          type: 'full',
          size: '2.3 GB',
          sizeBytes: 2469606400,
          created: '2024-01-13T15:45:00Z',
          status: 'completed',
          location: 'local',
          description: 'نسخة احتياطية يدوية قبل التحديث',
          tables: 15,
          records: 118920,
          duration: 312,
          compression: 'gzip',
          encrypted: true
        },
        {
          id: '4',
          name: 'backup_2024_01_12_10_30',
          type: 'full',
          size: '2.2 GB',
          sizeBytes: 2361393152,
          created: '2024-01-12T10:30:00Z',
          status: 'failed',
          location: 'local',
          description: 'نسخة احتياطية تلقائية - فشلت',
          tables: 0,
          records: 0,
          duration: 45,
          compression: 'gzip',
          encrypted: false,
          error: 'خطأ في الاتصال بقاعدة البيانات'
        },
        {
          id: '5',
          name: 'backup_2024_01_11_10_30',
          type: 'incremental',
          size: '380 MB',
          sizeBytes: 398458880,
          created: '2024-01-11T10:30:00Z',
          status: 'completed',
          location: 'cloud',
          description: 'نسخة احتياطية تدريجية',
          tables: 6,
          records: 18750,
          duration: 67,
          compression: 'gzip',
          encrypted: true
        }
      ]
      setBackups(mockBackups)
    } catch (error) {
      console.error('Error loading backups:', error)
      toast.error('حدث خطأ في تحميل النسخ الاحتياطية')
    } finally {
      setLoadingBackups(false)
    }
  }

  const loadBackupSettings = async () => {
    try {
      // Mock backup settings
      const mockSettings = {
        autoBackup: true,
        frequency: 'daily',
        time: '02:00',
        retention: 30,
        compression: true,
        encryption: true,
        location: 'local',
        cloudProvider: 'aws',
        maxBackups: 10,
        emailNotifications: true,
        backupTypes: ['full', 'incremental'],
        excludeTables: ['logs', 'sessions']
      }
      setBackupSettings(mockSettings)
    } catch (error) {
      console.error('Error loading backup settings:', error)
    }
  }

  const loadDatabaseStats = async () => {
    try {
      // Mock database statistics
      const mockStats = {
        totalSize: '5.2 GB',
        totalTables: 15,
        totalRecords: 1254300,
        lastOptimized: '2024-01-10T08:00:00Z',
        fragmentationLevel: 12.5,
        indexSize: '850 MB',
        dataSize: '4.35 GB',
        tables: [
          { name: 'users', records: 15420, size: '125 MB', lastUpdated: '2024-01-15T14:30:00Z' },
          { name: 'articles', records: 8930, size: '2.1 GB', lastUpdated: '2024-01-15T12:15:00Z' },
          { name: 'games', records: 1250, size: '450 MB', lastUpdated: '2024-01-14T16:45:00Z' },
          { name: 'channels', records: 890, size: '180 MB', lastUpdated: '2024-01-14T10:20:00Z' },
          { name: 'gifts', records: 2340, size: '95 MB', lastUpdated: '2024-01-15T09:30:00Z' },
          { name: 'comments', records: 45670, size: '320 MB', lastUpdated: '2024-01-15T15:10:00Z' },
          { name: 'ratings', records: 23450, size: '85 MB', lastUpdated: '2024-01-15T11:45:00Z' },
          { name: 'sessions', records: 12340, size: '45 MB', lastUpdated: '2024-01-15T15:30:00Z' },
          { name: 'logs', records: 156780, size: '1.2 GB', lastUpdated: '2024-01-15T15:35:00Z' }
        ]
      }
      setDbStats(mockStats)
    } catch (error) {
      console.error('Error loading database stats:', error)
    }
  }

  const createBackup = async (type = 'full') => {
    try {
      setCreatingBackup(true)
      // Mock backup creation
      await new Promise(resolve => setTimeout(resolve, 3000))
      
      const newBackup = {
        id: Date.now().toString(),
        name: `backup_${new Date().toISOString().replace(/[:.]/g, '_').slice(0, -5)}`,
        type,
        size: type === 'full' ? '2.6 GB' : '420 MB',
        sizeBytes: type === 'full' ? 2791728742 : 440401920,
        created: new Date().toISOString(),
        status: 'completed',
        location: backupSettings?.location || 'local',
        description: `نسخة احتياطية ${type === 'full' ? 'كاملة' : 'تدريجية'} يدوية`,
        tables: type === 'full' ? 15 : 8,
        records: type === 'full' ? 125430 : 23450,
        duration: type === 'full' ? 280 : 95,
        compression: 'gzip',
        encrypted: true
      }
      
      setBackups(prev => [newBackup, ...prev])
      toast.success('تم إنشاء النسخة الاحتياطية بنجاح')
    } catch (error) {
      console.error('Error creating backup:', error)
      toast.error('حدث خطأ في إنشاء النسخة الاحتياطية')
    } finally {
      setCreatingBackup(false)
    }
  }

  const restoreBackup = async (backupId) => {
    if (!confirm('هل أنت متأكد من استعادة هذه النسخة الاحتياطية؟ سيتم استبدال البيانات الحالية.')) {
      return
    }

    try {
      setRestoringBackup(backupId)
      // Mock restore operation
      await new Promise(resolve => setTimeout(resolve, 5000))
      toast.success('تم استعادة النسخة الاحتياطية بنجاح')
    } catch (error) {
      console.error('Error restoring backup:', error)
      toast.error('حدث خطأ في استعادة النسخة الاحتياطية')
    } finally {
      setRestoringBackup(null)
    }
  }

  const deleteBackup = async (backupId) => {
    if (!confirm('هل أنت متأكد من حذف هذه النسخة الاحتياطية؟')) {
      return
    }

    try {
      setBackups(prev => prev.filter(backup => backup.id !== backupId))
      toast.success('تم حذف النسخة الاحتياطية')
    } catch (error) {
      console.error('Error deleting backup:', error)
      toast.error('حدث خطأ في حذف النسخة الاحتياطية')
    }
  }

  const downloadBackup = (backup) => {
    // Mock download
    toast.success(`جاري تحميل ${backup.name}`)
  }

  const optimizeDatabase = async () => {
    if (!confirm('هل تريد تحسين قاعدة البيانات؟ قد يستغرق هذا بعض الوقت.')) {
      return
    }

    try {
      toast.loading('جاري تحسين قاعدة البيانات...')
      // Mock optimization
      await new Promise(resolve => setTimeout(resolve, 3000))
      toast.dismiss()
      toast.success('تم تحسين قاعدة البيانات بنجاح')
      loadDatabaseStats()
    } catch (error) {
      console.error('Error optimizing database:', error)
      toast.error('حدث خطأ في تحسين قاعدة البيانات')
    }
  }

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatDuration = (seconds) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-600" />
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-600" />
      case 'running':
        return <RefreshCw className="w-5 h-5 text-blue-600 animate-spin" />
      default:
        return <Clock className="w-5 h-5 text-gray-600" />
    }
  }

  const getTypeColor = (type) => {
    switch (type) {
      case 'full':
        return 'bg-blue-100 text-blue-800'
      case 'incremental':
        return 'bg-green-100 text-green-800'
      case 'differential':
        return 'bg-purple-100 text-purple-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  // إزالة شرط التحميل المعتمد على المصادقة المحلية، والإبقاء فقط على تحميل النسخ الاحتياطية
  if (loadingBackups) {
    return (
      <AdminLayout title="النسخ الاحتياطي وقاعدة البيانات" description="إدارة النسخ الاحتياطية وصيانة قاعدة البيانات">
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout title="النسخ الاحتياطي وقاعدة البيانات" description="إدارة النسخ الاحتياطية وصيانة قاعدة البيانات">
      <div className="min-h-screen bg-gray-50 p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 space-x-reverse">
              <Link
                href="/admin"
                className="text-gray-600 hover:text-gray-800"
                legacyBehavior>
                <ArrowLeft className="w-6 h-6" />
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">النسخ الاحتياطي وقاعدة البيانات</h1>
                <p className="text-gray-600 mt-1">إدارة النسخ الاحتياطية وصيانة قاعدة البيانات</p>
              </div>
            </div>
            <div className="flex items-center space-x-4 space-x-reverse">
              <button
                onClick={() => createBackup('incremental')}
                disabled={creatingBackup}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2 space-x-reverse disabled:opacity-50"
              >
                <Archive className="w-4 h-4" />
                <span>نسخة تدريجية</span>
              </button>
              <button
                onClick={() => createBackup('full')}
                disabled={creatingBackup}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 space-x-reverse disabled:opacity-50"
              >
                {creatingBackup ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Database className="w-4 h-4" />
                )}
                <span>{creatingBackup ? 'جاري الإنشاء...' : 'نسخة كاملة'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 space-x-reverse">
              {[
                { id: 'backups', name: 'النسخ الاحتياطية', icon: Database },
                { id: 'database', name: 'قاعدة البيانات', icon: Server },
                { id: 'settings', name: 'الإعدادات', icon: Settings }
              ].map(tab => {
                const IconComponent = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 space-x-reverse py-2 px-1 border-b-2 font-medium text-sm ${
                      activeTab === tab.id
                        ? 'border-purple-500 text-purple-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <IconComponent className="w-4 h-4" />
                    <span>{tab.name}</span>
                  </button>
                )
              })}
            </nav>
          </div>
        </div>

        {/* Backups Tab */}
        {activeTab === 'backups' && (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">إجمالي النسخ</p>
                    <p className="text-2xl font-bold text-blue-600 mt-1">{backups.length}</p>
                  </div>
                  <Database className="w-8 h-8 text-blue-600" />
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">النسخ المكتملة</p>
                    <p className="text-2xl font-bold text-green-600 mt-1">
                      {backups.filter(b => b.status === 'completed').length}
                    </p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">الحجم الإجمالي</p>
                    <p className="text-2xl font-bold text-purple-600 mt-1">
                      {formatFileSize(backups.reduce((sum, b) => sum + (b.sizeBytes || 0), 0))}
                    </p>
                  </div>
                  <HardDrive className="w-8 h-8 text-purple-600" />
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">آخر نسخة</p>
                    <p className="text-sm font-bold text-gray-900 mt-1">
                      {backups.length > 0 ? new Date(backups[0].created).toLocaleDateString('ar-EG') : 'لا توجد'}
                    </p>
                  </div>
                  <Calendar className="w-8 h-8 text-gray-600" />
                </div>
              </div>
            </div>

            {/* Backups List */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">النسخ الاحتياطية</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        النسخة الاحتياطية
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        النوع
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        الحجم
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        التاريخ
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        الحالة
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        الإجراءات
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {backups.map((backup) => (
                      <tr key={backup.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{backup.name}</div>
                            <div className="text-sm text-gray-500">{backup.description}</div>
                            <div className="text-xs text-gray-400 mt-1">
                              {backup.tables} جداول • {backup.records.toLocaleString()} سجل
                              {backup.duration && ` • ${formatDuration(backup.duration)}`}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTypeColor(backup.type)}`}>
                            {backup.type === 'full' ? 'كاملة' : backup.type === 'incremental' ? 'تدريجية' : backup.type}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {backup.size}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <div>{new Date(backup.created).toLocaleDateString('ar-EG')}</div>
                          <div className="text-xs text-gray-500">
                            {new Date(backup.created).toLocaleTimeString('ar-SA')}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-2 space-x-reverse">
                            {getStatusIcon(backup.status)}
                            <span className={`text-sm ${
                              backup.status === 'completed' ? 'text-green-600' :
                              backup.status === 'failed' ? 'text-red-600' :
                              'text-blue-600'
                            }`}>
                              {backup.status === 'completed' ? 'مكتملة' :
                               backup.status === 'failed' ? 'فشلت' :
                               backup.status === 'running' ? 'جارية' : backup.status}
                            </span>
                          </div>
                          {backup.error && (
                            <div className="text-xs text-red-500 mt-1">{backup.error}</div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-2 space-x-reverse">
                            {backup.status === 'completed' && (
                              <>
                                <button
                                  onClick={() => downloadBackup(backup)}
                                  className="text-blue-600 hover:text-blue-900"
                                  title="تحميل"
                                >
                                  <Download className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => restoreBackup(backup.id)}
                                  disabled={restoringBackup === backup.id}
                                  className="text-green-600 hover:text-green-900 disabled:opacity-50"
                                  title="استعادة"
                                >
                                  {restoringBackup === backup.id ? (
                                    <RefreshCw className="w-4 h-4 animate-spin" />
                                  ) : (
                                    <RefreshCw className="w-4 h-4" />
                                  )}
                                </button>
                              </>
                            )}
                            <button
                              onClick={() => deleteBackup(backup.id)}
                              className="text-red-600 hover:text-red-900"
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
          </div>
        )}

        {/* Database Tab */}
        {activeTab === 'database' && dbStats && (
          <div className="space-y-6">
            {/* Database Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">حجم قاعدة البيانات</p>
                    <p className="text-2xl font-bold text-blue-600 mt-1">{dbStats.totalSize}</p>
                  </div>
                  <Database className="w-8 h-8 text-blue-600" />
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">عدد الجداول</p>
                    <p className="text-2xl font-bold text-green-600 mt-1">{dbStats.totalTables}</p>
                  </div>
                  <FileText className="w-8 h-8 text-green-600" />
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">إجمالي السجلات</p>
                    <p className="text-2xl font-bold text-purple-600 mt-1">{dbStats.totalRecords.toLocaleString()}</p>
                  </div>
                  <Archive className="w-8 h-8 text-purple-600" />
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">مستوى التجزئة</p>
                    <p className={`text-2xl font-bold mt-1 ${
                      dbStats.fragmentationLevel > 20 ? 'text-red-600' :
                      dbStats.fragmentationLevel > 10 ? 'text-yellow-600' : 'text-green-600'
                    }`}>
                      {dbStats.fragmentationLevel}%
                    </p>
                  </div>
                  <Zap className={`w-8 h-8 ${
                    dbStats.fragmentationLevel > 20 ? 'text-red-600' :
                    dbStats.fragmentationLevel > 10 ? 'text-yellow-600' : 'text-green-600'
                  }`} />
                </div>
              </div>
            </div>

            {/* Database Actions */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">إجراءات قاعدة البيانات</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  onClick={optimizeDatabase}
                  className="bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2 space-x-reverse"
                >
                  <Zap className="w-5 h-5" />
                  <span>تحسين قاعدة البيانات</span>
                </button>
                <button className="bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center space-x-2 space-x-reverse">
                  <RefreshCw className="w-5 h-5" />
                  <span>إعادة بناء الفهارس</span>
                </button>
                <button className="bg-purple-600 text-white px-4 py-3 rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center space-x-2 space-x-reverse">
                  <Shield className="w-5 h-5" />
                  <span>فحص سلامة البيانات</span>
                </button>
              </div>
            </div>

            {/* Tables List */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">جداول قاعدة البيانات</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        اسم الجدول
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        عدد السجلات
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        الحجم
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        آخر تحديث
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {dbStats.tables.map((table, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-3 space-x-reverse">
                            <FileText className="w-5 h-5 text-gray-400" />
                            <span className="text-sm font-medium text-gray-900">{table.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {table.records.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {table.size}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Date(table.lastUpdated).toLocaleDateString('ar-EG')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && backupSettings && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">إعدادات النسخ الاحتياطي</h2>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-gray-900">النسخ الاحتياطي التلقائي</div>
                  <div className="text-sm text-gray-600">تفعيل النسخ الاحتياطي التلقائي</div>
                </div>
                <button className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  backupSettings.autoBackup ? 'bg-purple-600' : 'bg-gray-200'
                }`}>
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    backupSettings.autoBackup ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">تكرار النسخ</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent">
                    <option value="daily">يومياً</option>
                    <option value="weekly">أسبوعياً</option>
                    <option value="monthly">شهرياً</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">وقت النسخ</label>
                  <input
                    type="time"
                    value={backupSettings.time}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">مدة الاحتفاظ (أيام)</label>
                  <input
                    type="number"
                    value={backupSettings.retention}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">الحد الأقصى للنسخ</label>
                  <input
                    type="number"
                    value={backupSettings.maxBackups}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end space-x-4 space-x-reverse pt-6 border-t border-gray-200">
                <button className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors">
                  إلغاء
                </button>
                <button className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors">
                  حفظ الإعدادات
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

export default BackupPage