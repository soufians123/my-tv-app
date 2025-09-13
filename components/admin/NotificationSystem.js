import { useState, useEffect } from 'react'
import { 
  Bell, 
  X, 
  CheckCircle, 
  AlertTriangle, 
  Info, 
  XCircle, 
  Zap,
  Users,
  FileText,
  Tv,
  Settings,
  Shield,
  Activity,
  Clock,
  Filter,
  MoreVertical
} from 'lucide-react'
import toast from 'react-hot-toast'
import { Button, Badge, Alert, Card } from '../ui/unified-components'

const NotificationSystem = ({ isOpen, onClose }) => {
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: 'success',
      title: 'تم تحديث النظام بنجاح',
      message: 'تم تطبيق التحديث الأمني الجديد على جميع الخوادم',
      time: '5 دقائق مضت',
      read: false,
      category: 'system',
      priority: 'high',
      actions: [
        { label: 'عرض التفاصيل', action: 'view_details' },
        { label: 'تجاهل', action: 'dismiss' }
      ]
    },
    {
      id: 2,
      type: 'warning',
      title: 'تحذير: استخدام الذاكرة مرتفع',
      message: 'استخدام الذاكرة وصل إلى 85%. يُنصح بمراقبة الأداء',
      time: '15 دقيقة مضت',
      read: false,
      category: 'performance',
      priority: 'medium',
      actions: [
        { label: 'فحص الأداء', action: 'check_performance' },
        { label: 'تجاهل', action: 'dismiss' }
      ]
    },
    {
      id: 3,
      type: 'info',
      title: 'مستخدم جديد انضم',
      message: 'أحمد محمد انضم للموقع وأكمل عملية التسجيل',
      time: '30 دقيقة مضت',
      read: true,
      category: 'users',
      priority: 'low',
      actions: [
        { label: 'عرض الملف الشخصي', action: 'view_profile' }
      ]
    },
    {
      id: 4,
      type: 'error',
      title: 'فشل في تحميل قناة تلفزيونية',
      message: 'القناة "الإخبارية" تواجه مشاكل في البث المباشر',
      time: '1 ساعة مضت',
      read: false,
      category: 'channels',
      priority: 'high',
      actions: [
        { label: 'إصلاح المشكلة', action: 'fix_channel' },
        { label: 'إيقاف القناة', action: 'disable_channel' }
      ]
    },
    {
      id: 5,
      type: 'success',
      title: 'تم نشر مقال جديد',
      message: 'سارة أحمد نشرت مقالاً جديداً بعنوان "تطوير الويب الحديث"',
      time: '2 ساعة مضت',
      read: true,
      category: 'content',
      priority: 'low',
      actions: [
        { label: 'عرض المقال', action: 'view_article' }
      ]
    }
  ])
  
  const [filter, setFilter] = useState('all')
  const [sortBy, setSortBy] = useState('time')

  const getNotificationIcon = (type) => {
    const icons = {
      success: CheckCircle,
      warning: AlertTriangle,
      error: XCircle,
      info: Info
    }
    return icons[type] || Info
  }

  const getNotificationColor = (type) => {
    const colors = {
      success: 'text-green-600 bg-green-100',
      warning: 'text-yellow-600 bg-yellow-100',
      error: 'text-red-600 bg-red-100',
      info: 'text-blue-600 bg-blue-100'
    }
    return colors[type] || colors.info
  }

  const getCategoryIcon = (category) => {
    const icons = {
      system: Settings,
      performance: Activity,
      users: Users,
      content: FileText,
      channels: Tv,
      security: Shield
    }
    return icons[category] || Info
  }

  const getPriorityColor = (priority) => {
    const colors = {
      high: 'bg-red-500',
      medium: 'bg-yellow-500',
      low: 'bg-green-500'
    }
    return colors[priority] || colors.low
  }

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'all') return true
    if (filter === 'unread') return !notification.read
    if (filter === 'read') return notification.read
    return notification.category === filter
  })

  const sortedNotifications = [...filteredNotifications].sort((a, b) => {
    if (sortBy === 'time') {
      return new Date(b.time) - new Date(a.time)
    }
    if (sortBy === 'priority') {
      const priorityOrder = { high: 3, medium: 2, low: 1 }
      return priorityOrder[b.priority] - priorityOrder[a.priority]
    }
    return 0
  })

  const markAsRead = (id) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, read: true }
          : notification
      )
    )
  }

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    )
    toast.success('تم تعليم جميع الإشعارات كمقروءة')
  }

  const deleteNotification = (id) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id))
    toast.success('تم حذف الإشعار')
  }

  const handleAction = (notification, actionType) => {
    console.log(`تنفيذ الإجراء: ${actionType} للإشعار:`, notification.id)
    
    switch (actionType) {
      case 'dismiss':
        deleteNotification(notification.id)
        break
      case 'view_details':
        toast.success('عرض تفاصيل الإشعار')
        break
      case 'check_performance':
        toast.success('فتح صفحة مراقبة الأداء')
        break
      case 'view_profile':
        toast.success('عرض الملف الشخصي للمستخدم')
        break
      case 'fix_channel':
        toast.success('بدء عملية إصلاح القناة')
        break
      case 'disable_channel':
        toast.success('تم إيقاف القناة مؤقتاً')
        break
      case 'view_article':
        toast.success('عرض المقال')
        break
      default:
        toast.info('تم تنفيذ الإجراء')
    }
    
    markAsRead(notification.id)
  }

  const unreadCount = notifications.filter(n => !n.read).length

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />
      
      {/* Panel */}
      <Card className="absolute right-0 top-0 h-full w-full max-w-md shadow-xl transform transition-transform">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <Bell className="w-6 h-6 text-primary-600 mr-3" />
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                الإشعارات
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {unreadCount} إشعار غير مقروء
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
          >
            <X className="w-5 h-5 text-gray-500" />
          </Button>
        </div>

        {/* Controls */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2 space-x-reverse">
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="text-sm border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="all">جميع الإشعارات</option>
                <option value="unread">غير مقروءة</option>
                <option value="read">مقروءة</option>
                <option value="system">النظام</option>
                <option value="users">المستخدمون</option>
                <option value="content">المحتوى</option>
                <option value="channels">القنوات</option>
              </select>
              
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="text-sm border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="time">حسب الوقت</option>
                <option value="priority">حسب الأولوية</option>
              </select>
            </div>
            
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={markAllAsRead}
                className="text-sm text-primary-600 hover:text-primary-700 font-medium"
              >
                تعليم الكل كمقروء
              </Button>
            )}
          </div>
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto">
          {sortedNotifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-500 dark:text-gray-400">
              <Bell className="w-12 h-12 mb-4 opacity-50" />
              <p className="text-lg font-medium mb-2">لا توجد إشعارات</p>
              <p className="text-sm text-center">ستظهر الإشعارات الجديدة هنا</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {sortedNotifications.map((notification) => {
                const Icon = getNotificationIcon(notification.type)
                const CategoryIcon = getCategoryIcon(notification.category)
                
                return (
                  <div
                    key={notification.id}
                    className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors ${
                      !notification.read ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                    }`}
                  >
                    <div className="flex items-start">
                      {/* Priority Indicator */}
                      <div className={`w-1 h-16 rounded-full mr-3 ${getPriorityColor(notification.priority)}`} />
                      
                      {/* Icon */}
                      <div className={`p-2 rounded-lg mr-3 ${getNotificationColor(notification.type)}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      
                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className={`text-sm font-medium ${
                            !notification.read 
                              ? 'text-gray-900 dark:text-white' 
                              : 'text-gray-700 dark:text-gray-300'
                          }`}>
                            {notification.title}
                          </h3>
                          <div className="flex items-center">
                            <CategoryIcon className="w-3 h-3 text-gray-400 mr-1" />
                            {!notification.read && (
                              <div className="w-2 h-2 bg-primary-600 rounded-full" />
                            )}
                          </div>
                        </div>
                        
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                          {notification.message}
                        </p>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center text-xs text-gray-500 dark:text-gray-500">
                            <Clock className="w-3 h-3 mr-1" />
                            {notification.time}
                          </div>
                          
                          <div className="flex items-center space-x-2 space-x-reverse">
                            {notification.actions?.map((action, index) => (
                              <Button
                                key={index}
                                variant="ghost"
                                size="sm"
                                onClick={() => handleAction(notification, action.action)}
                                className="text-xs text-primary-600 hover:text-primary-700 font-medium"
                              >
                                {action.label}
                              </Button>
                            ))}
                            
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteNotification(notification.id)}
                              className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                            >
                              <X className="w-3 h-3 text-gray-400" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="text-xs text-gray-500 dark:text-gray-400">
              آخر تحديث: {new Date().toLocaleTimeString('ar-SA')}
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-primary-600 hover:text-primary-700 font-medium"
            >
              إعدادات الإشعارات
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}

export default NotificationSystem