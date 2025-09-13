import React, { useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Sun, 
  Moon, 
  Settings, 
  Bell, 
  User, 
  LogOut, 
  Menu,
  Search,
  Maximize,
  Minimize,
  Palette
} from 'lucide-react';
import Link from 'next/link';
import { Button, Input, Badge, Card } from '../ui/unified-components';

const AdminHeader = ({ onToggleSidebar, sidebarCollapsed }) => {
  const { theme, toggleTheme, primaryColor, updatePrimaryColor, isDark } = useTheme();
  const { user, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const colorOptions = [
    { name: 'Blue', value: '#3B82F6' },
    { name: 'Purple', value: '#8B5CF6' },
    { name: 'Green', value: '#10B981' },
    { name: 'Red', value: '#EF4444' },
    { name: 'Orange', value: '#F59E0B' },
    { name: 'Pink', value: '#EC4899' },
    { name: 'Indigo', value: '#6366F1' },
    { name: 'Teal', value: '#14B8A6' }
  ];

  const notifications = [
    {
      id: 1,
      title: 'مستخدم جديد مسجل',
      message: 'انضم مستخدم جديد إلى المنصة',
      time: '5 دقائق',
      type: 'info',
      unread: true
    },
    {
      id: 2,
      title: 'تحديث النظام',
      message: 'تم تحديث النظام بنجاح',
      time: '1 ساعة',
      type: 'success',
      unread: true
    },
    {
      id: 3,
      title: 'تحذير أمني',
      message: 'محاولة دخول مشبوهة',
      time: '2 ساعة',
      type: 'warning',
      unread: false
    }
  ];

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('خطأ في تسجيل الخروج:', error);
    }
  };

  const handleColorChange = (color) => {
    updatePrimaryColor(color);
    setShowColorPicker(false);
  };

  const unreadCount = notifications.filter(n => n.unread).length;

  return (
    <header className="admin-header">
      <div className="flex items-center gap-4">
        {/* Sidebar Toggle */}
        <Button
          variant="secondary"
          size="sm"
          onClick={onToggleSidebar}
          title={sidebarCollapsed ? 'توسيع الشريط الجانبي' : 'طي الشريط الجانبي'}
        >
          <Menu size={20} />
        </Button>

        {/* Search Bar */}
        <div className="relative hidden md:block">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <Input
            type="text"
            placeholder="البحث في لوحة التحكم..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 w-64"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Color Picker */}
        <div className="relative">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setShowColorPicker(!showColorPicker)}
            title="تغيير اللون الأساسي"
          >
            <Palette size={20} />
          </Button>
          
          {showColorPicker && (
            <div className="absolute right-0 top-12 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-4 z-50">
              <h3 className="text-sm font-medium mb-3">اختر اللون الأساسي</h3>
              <div className="grid grid-cols-4 gap-2">
                {colorOptions.map((color) => (
                  <Button
                    key={color.value}
                    variant="ghost"
                    size="sm"
                    onClick={() => handleColorChange(color.value)}
                    className={`w-8 h-8 rounded-full border-2 transition-all p-0 ${
                      primaryColor === color.value 
                        ? 'border-gray-400 scale-110' 
                        : 'border-gray-200 hover:scale-105'
                    }`}
                    style={{ backgroundColor: color.value }}
                    title={color.name}
                  >
                  </Button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Theme Toggle */}
        <Button
          variant="secondary"
          size="sm"
          onClick={toggleTheme}
          title={isDark ? 'التبديل للوضع الفاتح' : 'التبديل للوضع المظلم'}
        >
          {isDark ? <Sun size={20} /> : <Moon size={20} />}
        </Button>

        {/* Notifications */}
        <div className="relative">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setShowNotifications(!showNotifications)}
            title="الإشعارات"
            className="relative"
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <Badge className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {unreadCount}
              </Badge>
            )}
          </Button>

          {showNotifications && (
            <div className="absolute right-0 top-12 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold">الإشعارات</h3>
              </div>
              <div className="max-h-96 overflow-y-auto">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 ${
                      notification.unread ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className="text-sm font-medium">{notification.title}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {notification.message}
                        </p>
                        <span className="text-xs text-gray-500 mt-2 block">
                          منذ {notification.time}
                        </span>
                      </div>
                      {notification.unread && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                <Link href="/admin/notifications" className="text-sm text-blue-600 hover:text-blue-800">
                  عرض جميع الإشعارات
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Settings */}
        <Button
          variant="secondary"
          size="sm"
          asChild
          title="الإعدادات"
        >
          <Link href="/admin/settings">
            <Settings size={20} />
          </Link>
        </Button>

        {/* User Menu */}
        <div className="relative">
          <Button
            variant="secondary"
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2"
          >
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
              {user?.email?.charAt(0).toUpperCase() || 'A'}
            </div>
            <span className="hidden md:block text-sm font-medium">
              {user?.email || 'المدير'}
            </span>
          </Button>

          {showUserMenu && (
            <div className="absolute right-0 top-12 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
              <div className="p-2">
                <Link
                  href="/admin/profile"
                  className="flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <User size={16} />
                  الملف الشخصي
                </Link>
                <Link
                  href="/admin/settings"
                  className="flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <Settings size={16} />
                  الإعدادات
                </Link>
                <hr className="my-2 border-gray-200 dark:border-gray-700" />
                <Button
                  variant="ghost"
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-3 py-2 text-sm w-full justify-start text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
                >
                  <LogOut size={16} />
                  تسجيل الخروج
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;