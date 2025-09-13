import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import AdminHeader from './AdminHeader';
import AdminSidebar from './AdminSidebar';
import { Loader2 } from 'lucide-react';
import Head from 'next/head';
import { toast } from 'react-hot-toast';
import { Loading, Card } from '../ui/unified-components';

const AdminLayout = ({ children, title = 'لوحة التحكم', description = 'نظام إدارة متقدم' }) => {
  const router = useRouter();
  const { user, loading, isAdmin } = useAuth();
  const { sidebarCollapsed, toggleSidebar, theme, animations } = useTheme();
  const [isMobile, setIsMobile] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Check if user is authenticated and has admin role
  useEffect(() => {
    if (loading) return;
    // لم نعد نستخدم إعادة التوجيه من الواجهة لتفادي ERR_ABORTED
    if (!user) return;
    if (!isAdmin(user)) {
      // عرض رسالة فقط بدون دفع المستخدم للتنقل الفوري
      toast.error('غير مصرح لك بالوصول إلى لوحة الإدارة');
    }
  }, [user, loading, isAdmin]);

  // Handle responsive design
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Handle sidebar toggle
  const handleSidebarToggle = () => {
    if (isMobile) {
      setSidebarOpen(!sidebarOpen);
    } else {
      toggleSidebar();
    }
  };

  // Close mobile sidebar when route changes
  useEffect(() => {
    setSidebarOpen(false);
  }, [router.pathname]);

  // Close mobile sidebar when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        isMobile &&
        sidebarOpen &&
        !event.target.closest('.admin-sidebar, .admin-sidebar-container')
      ) {
        setSidebarOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMobile, sidebarOpen]);

  // Apply animations setting to body
  useEffect(() => {
    document.body.setAttribute('data-animations', animations.toString());
  }, [animations]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <Loading text="جاري التحميل..." />
      </div>
    );
  }

  // مستخدم غير مسجل
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-8 text-center">
          <h2 className="text-lg font-semibold mb-2">تسجيل الدخول مطلوب</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">الرجاء تسجيل الدخول للوصول إلى لوحة الإدارة.</p>
          <a href="/auth/login" className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">الانتقال إلى تسجيل الدخول</a>
        </div>
      </div>
    );
  }

  // مستخدم ليس لديه صلاحية الإدارة
  if (user && !isAdmin(user)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-8 text-center">
          <h2 className="text-lg font-semibold mb-2">وصول غير مصرح</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">ليس لديك صلاحية الوصول إلى لوحة الإدارة.</p>
          <a href="/" className="inline-block px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-800">العودة للصفحة الرئيسية</a>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>{title} - نظام الإدارة</title>
        <meta name="description" content={description} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className={`admin-layout ${theme}`}>
        {/* Mobile Overlay */}
        {isMobile && sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar Container */}
        <div className={`admin-sidebar-container 
          ${isMobile ? 'fixed left-0 top-0 h-screen' : 'relative'} 
          ${isMobile ? 'z-50' : 'z-10'}
          ${!isMobile && sidebarCollapsed ? 'w-20' : 'w-80'}
        `} style={isMobile ? { transform: sidebarOpen ? 'translateX(0)' : 'translateX(-100%)', transition: 'transform 300ms ease-in-out' } : {}}>
          <AdminSidebar 
            collapsed={!isMobile && sidebarCollapsed} 
            onToggle={handleSidebarToggle}
          />
        </div>

        {/* Main Content */}
        <div className="admin-main flex-1">
          {/* Header */}
          <AdminHeader 
            onToggleSidebar={handleSidebarToggle}
            sidebarCollapsed={!isMobile && sidebarCollapsed}
          />

          {/* Content */}
          <main className="admin-content">
            <div className="max-w-7xl mx-auto">
              {children}
            </div>
          </main>

          {/* Footer */}
          <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-6 py-4">
            <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-center gap-4 mb-2 sm:mb-0">
                <span>© 2024 نظام الإدارة المتقدم</span>
                <span className="hidden sm:inline">•</span>
                <span className="hidden sm:inline">جميع الحقوق محفوظة</span>
              </div>
              <div className="flex items-center gap-4">
                <span>الإصدار 2.0.0</span>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span>النظام يعمل بشكل طبيعي</span>
                </div>
              </div>
            </div>
          </footer>
        </div>
      </div>

      {/* Global Styles */}
      <style jsx global>{`
        .admin-layout {
          min-height: 100vh;
          display: flex;
          background-color: var(--bg-secondary);
        }

        .admin-sidebar {
          background-color: var(--bg-primary);
          border-right: 1px solid var(--border-color);
          box-shadow: var(--shadow-sm);
          height: 100vh;
          overflow-y: auto;
          transition: width var(--transition-normal);
        }

        .admin-sidebar.collapsed {
          width: 80px;
        }

        .admin-main {
          flex: 1;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        .admin-header {
          height: 70px;
          background-color: var(--bg-primary);
          border-bottom: 1px solid var(--border-color);
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 1.5rem;
          box-shadow: var(--shadow-sm);
          position: sticky;
          top: 0;
          z-index: 30;
        }

        .admin-content {
          flex: 1;
          padding: 1.5rem;
          overflow-y: auto;
          background-color: var(--bg-secondary);
        }

        /* Scrollbar Styling */
        .admin-sidebar::-webkit-scrollbar,
        .admin-content::-webkit-scrollbar {
          width: 6px;
        }

        .admin-sidebar::-webkit-scrollbar-track,
        .admin-content::-webkit-scrollbar-track {
          background: var(--bg-secondary);
        }

        .admin-sidebar::-webkit-scrollbar-thumb,
        .admin-content::-webkit-scrollbar-thumb {
          background: var(--border-color);
          border-radius: 3px;
        }

        .admin-sidebar::-webkit-scrollbar-thumb:hover,
        .admin-content::-webkit-scrollbar-thumb:hover {
          background: var(--text-muted);
        }

        /* Mobile Responsive */
        @media (max-width: 1024px) {
          .admin-layout {
            flex-direction: column;
          }
          
          .admin-sidebar-container {
            position: fixed;
            left: 0;
            top: 0;
            height: 100vh;
            z-index: 1000;
            width: 280px !important;
          }
          
          .admin-main {
            margin-left: 0;
          }
        }

        @media (max-width: 768px) {
          .admin-header {
            padding: 0 1rem;
          }
          
          .admin-content {
            padding: 1rem;
          }
        }

        @media (max-width: 480px) {
          .admin-content {
            padding: 0.5rem;
          }
        }

        /* Animation Controls */
        @media (prefers-reduced-motion: reduce) {
          * {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }

        body[data-animations="false"] * {
          animation: none !important;
          transition: none !important;
        }
      `}</style>
    </>
  );
};

export default AdminLayout;