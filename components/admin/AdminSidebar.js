import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useTheme } from '../../contexts/ThemeContext';
import {
  LayoutDashboard,
  Users,
  FileText,
  Tv,
  Gamepad2,
  BarChart3,
  Settings,
  Bell,
  Shield,
  Database,
  Megaphone,
  Calendar,
  Mail,
  HelpCircle,
  ChevronDown,
  ChevronRight,
  Home,
  Activity,
  Zap,
  Globe,
  Send
} from 'lucide-react';

const AdminSidebar = ({ collapsed, onToggle }) => {
  const router = useRouter();
  const { sidebarCollapsed } = useTheme();
  const [expandedMenus, setExpandedMenus] = useState({});

  const menuItems = [
    {
      id: 'dashboard',
      title: 'لوحة المعلومات',
      icon: LayoutDashboard,
      href: '/admin',
      badge: null
    },
    {
      id: 'advanced-dashboard',
      title: 'لوحة التحكم المتقدمة',
      icon: Activity,
      href: '/admin/advanced-dashboard',
      badge: 'جديد'
    },
    {
      id: 'analytics',
      title: 'التحليلات',
      icon: BarChart3,
      href: '/admin/analytics',
      badge: null
    },
    {
      id: 'content-management',
      title: 'إدارة المحتوى',
      icon: FileText,
      submenu: [
        {
          title: 'المقالات',
          href: '/admin/articles',
          icon: FileText
        },
        {
          title: 'إدارة المحتوى',
          href: '/admin/content',
          icon: Database
        }
      ]
    },
    {
      id: 'channels-management',
      title: 'إدارة القنوات',
      icon: Tv,
      submenu: [
        {
          title: 'القنوات التقليدية',
          href: '/admin/channels',
          icon: Tv
        },
        {
          title: 'القنوات المتقدمة',
          href: '/admin/advanced-channels',
          icon: Zap,
          badge: 'محدث'
        },
        {
          title: 'إضافة قنوات جديدة',
          href: '/admin/add-channels',
          icon: FileText,
          badge: 'جديد'
        }
      ]
    },
    {
      id: 'games',
      title: 'الألعاب',
      icon: Gamepad2,
      href: '/admin/games',
      badge: null
    },
    {
      id: 'users-management',
      title: 'إدارة المستخدمين',
      icon: Users,
      href: '/admin/users-management',
      badge: null
    },
    {
      id: 'marketing',
      title: 'التسويق والإعلانات',
      icon: Megaphone,
      submenu: [
        {
          title: 'الإعلانات',
          href: '/admin/advertisements',
          icon: Megaphone
        },
        {
          title: 'زر تليغرام',
          href: '/admin/telegram-button',
          icon: Send
        }
      ]
    },
    {
      id: 'system',
      title: 'النظام',
      icon: Settings,
      submenu: [
        {
          title: 'الإعدادات',
          href: '/admin/settings',
          icon: Settings
        },
        {
          title: 'الأمان',
          href: '/admin/security',
          icon: Shield
        },
        {
          title: 'النسخ الاحتياطي',
          href: '/admin/backup',
          icon: Database
        },
        {
          title: 'السجلات',
          href: '/admin/logs',
          icon: Activity
        }
      ]
    },
    {
      id: 'notifications',
      title: 'الإشعارات',
      icon: Bell,
      href: '/admin/notifications',
      badge: '3'
    },
    {
      id: 'help',
      title: 'المساعدة',
      icon: HelpCircle,
      href: '/admin/help',
      badge: null
    }
  ];

  const toggleSubmenu = (menuId) => {
    if (collapsed) return;
    setExpandedMenus(prev => ({
      ...prev,
      [menuId]: !prev[menuId]
    }));
  };

  const isActive = (href) => {
    return router.pathname === href;
  };

  const isSubmenuActive = (submenu) => {
    return submenu.some(item => router.pathname === item.href);
  };

  const renderMenuItem = (item) => {
    const Icon = item.icon;
    const hasSubmenu = item.submenu && item.submenu.length > 0;
    const isExpanded = expandedMenus[item.id];
    const isMenuActive = item.href ? isActive(item.href) : isSubmenuActive(item.submenu);

    if (hasSubmenu) {
      return (
        <div key={item.id} className="mb-1">
          <button
            onClick={() => toggleSubmenu(item.id)}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-all duration-200 group ${
              isMenuActive
                ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
          >
            <div className="flex items-center gap-3">
              <Icon 
                size={20} 
                className={`transition-colors ${
                  isMenuActive 
                    ? 'text-blue-600 dark:text-blue-400' 
                    : 'text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300'
                }`} 
              />
              {!collapsed && (
                <span className="font-medium text-sm">{item.title}</span>
              )}
            </div>
            {!collapsed && (
              <div className="flex items-center gap-2">
                {item.badge && (
                  <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-full">
                    {item.badge}
                  </span>
                )}
                {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
              </div>
            )}
          </button>
          
          {!collapsed && isExpanded && (
            <div className="mt-1 ml-6 space-y-1">
              {item.submenu.map((subItem) => {
                const SubIcon = subItem.icon;
                return (
                  <Link
                    key={subItem.href}
                    href={subItem.href}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-200 ${
                      isActive(subItem.href)
                        ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-r-2 border-blue-500'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-200'
                    }`}
                  >
                    <SubIcon size={16} />
                    <span>{subItem.title}</span>
                    {subItem.badge && (
                      <span className="ml-auto px-1.5 py-0.5 text-xs font-medium bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded">
                        {subItem.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      );
    }

    return (
      <Link
        key={item.id}
        href={item.href}
        className={`flex items-center justify-between px-3 py-2.5 rounded-lg transition-all duration-200 mb-1 group ${
          isActive(item.href)
            ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300'
            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
        }`}
      >
        <div className="flex items-center gap-3">
          <Icon 
            size={20} 
            className={`transition-colors ${
              isActive(item.href) 
                ? 'text-blue-600 dark:text-blue-400' 
                : 'text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300'
            }`} 
          />
          {!collapsed && (
            <span className="font-medium text-sm">{item.title}</span>
          )}
        </div>
        {!collapsed && item.badge && (
          <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
            item.badge === 'جديد' 
              ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300'
              : item.badge === 'محدث'
              ? 'bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300'
              : 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300'
          }`}>
            {item.badge}
          </span>
        )}
      </Link>
    );
  };

  return (
    <aside className={`admin-sidebar ${collapsed ? 'collapsed' : ''} flex flex-col`}>
      {/* Logo */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <Link href="/admin" className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <Globe className="text-white" size={20} />
          </div>
          {!collapsed && (
            <div>
              <h1 className="text-lg font-bold text-gray-900 dark:text-white">
                لوحة التحكم
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                نظام إدارة متقدم
              </p>
            </div>
          )}
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 overflow-y-auto">
        <div className="space-y-1">
          {menuItems.map(renderMenuItem)}
        </div>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        {!collapsed && (
          <div className="text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
              الإصدار 2.0.0
            </p>
            <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>متصل</span>
            </div>
          </div>
        )}
        {collapsed && (
          <div className="flex justify-center">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          </div>
        )}
      </div>
    </aside>
  );
};

export default AdminSidebar;