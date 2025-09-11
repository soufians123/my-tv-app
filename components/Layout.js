import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useAuth } from '../contexts/AuthContext'
import { Menu, X, Home, Tv, Gamepad2, FileText, ShoppingBag, LogOut, User, Gift, Settings, Bookmark, Megaphone, Tag, Send, Sun, Moon } from 'lucide-react'
import { useToast } from './ToastSystem'
import { BannerAd, CardAd } from './AdvertisementSystem'
import { getSetting } from '../lib/settingsService'
import { useTheme } from '../contexts/ThemeContext'

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [activeNavItem, setActiveNavItem] = useState('')
  const { user, signOut, loading, isAdmin } = useAuth()
  const router = useRouter()
  const toast = useToast()
  const { isDark, toggleTheme } = useTheme()

  useEffect(() => {
    setActiveNavItem(router.pathname)
  }, [router.pathname])

  const handleSignOut = async () => {
    try {
      await signOut()
      toast.success('تم تسجيل الخروج بنجاح')
    } catch (error) {
      toast.error('حدث خطأ أثناء تسجيل الخروج')
    }
  }

  const handleNavClick = () => {
    setSidebarOpen(false)
  }

  // Load Telegram bottom button config from settings
  const [telegramBtn, setTelegramBtn] = useState(null)
  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const cfg = await getSetting('telegram_bottom_button', null)
        if (mounted) setTelegramBtn(cfg)
      } catch (_) {
        // ignore
      }
    })()
    return () => { mounted = false }
  }, [])
  
  const navigation = [
    { name: 'الرئيسية', href: '/', icon: Home },
    { name: 'القنوات التلفزيونية', href: '/channels', icon: Tv },
    { name: 'الألعاب', href: '/games', icon: Gamepad2 },
    { name: 'المقالات', href: '/articles', icon: FileText },
    { name: 'المفضلة', href: '/favorites', icon: Bookmark },
    { name: 'الهدايا والعروض', href: '/gifts', icon: Gift },
    { name: 'التسويق بالعمولة', href: '/affiliate', icon: ShoppingBag },
    ...(user && isAdmin() ? [
      // روابط الإدارة السريعة
      { name: 'إدارة الألعاب', href: '/admin/games', icon: Gamepad2 },
      { name: 'إدارة المقالات', href: '/admin/articles', icon: FileText },
      { name: 'إدارة الهدايا', href: '/admin/gifts', icon: Gift },
      { name: 'زر تليغرام', href: '/admin/telegram-button', icon: Tag },
      { name: 'العروض الترويجية', href: '/admin/promotions', icon: Tag },
      { name: 'الإعلانات', href: '/admin/advertisements', icon: Megaphone },
      // الروابط الإدارية العامة
      { name: 'إدارة المستخدمين', href: '/admin/users', icon: User },
      { name: 'إدارة المحتوى', href: '/admin/content', icon: FileText },
      { name: 'إدارة القنوات', href: '/admin/channels', icon: Tv },
      { name: 'إعدادات النظام', href: '/admin/settings', icon: Settings },
    ] : [])
  ]

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-900/60 dark:to-slate-900">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 flex z-40 md:hidden ${sidebarOpen ? '' : 'pointer-events-none'}`}>
        <div className={`fixed inset-0 bg-gradient-to-br from-gray-900/80 to-purple-900/80 backdrop-blur-sm transition-opacity ease-linear duration-300 ${sidebarOpen ? 'opacity-100' : 'opacity-0'}`} onClick={() => setSidebarOpen(false)} />
        
        <div className={`relative flex-1 flex flex-col max-w-xs w-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg border-r border-white/20 dark:border-slate-700/40 shadow-2xl transform transition ease-in-out duration-300 ${sidebarOpen ? 'translate-x-0' : 'ltr:-translate-x-full rtl:translate-x-full'}`}>
          <div className="absolute top-0 ltr:right-0 rtl:left-0 ltr:-mr-12 rtl:-ml-12 pt-2">
            <button
              className="ltr:ml-1 rtl:mr-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white transition-all duration-300 transform hover:scale-110 hover:bg-white/20 hover:backdrop-blur-sm"
              onClick={() => {
                setSidebarOpen(false)
                toast.info('تم إغلاق القائمة الجانبية')
              }}
            >
              <X className="h-6 w-6 text-white transition-transform duration-300 hover:rotate-90" />
            </button>
          </div>
          
          <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
            <div className="flex-shrink-0 flex items-center px-4">
              <div className="flex items-center space-x-2 rtl:space-x-reverse">
                {/* logo */}
                <h1 className="text-xl font-bold bg-gradient-to-r from-primary-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">zomiga</h1>
              </div>
            </div>
            <nav className="mt-5 px-2 space-y-1">
              {navigation.map((item, index) => {
                const Icon = item.icon
                const isActive = router.pathname === item.href
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={handleNavClick}
                    className={`nav-link group flex items-center px-3 py-3 text-base font-medium rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg ${
                      isActive
                        ? 'bg-gradient-to-r from-primary-100 to-secondary-100 text-primary-900 shadow-soft ltr:border-r-4 rtl:border-l-4 border-primary-500'
                        : 'text-gray-600 dark:text-gray-300 hover:bg-gradient-to-r hover:from-gray-50/60 hover:to-gray-100/60 dark:hover:from-slate-800 dark:hover:to-slate-800/80 hover:text-gray-900 dark:hover:text-white'
                    }`}
                    style={{ animationDelay: `${index * 100}ms` }}>
                    <div className="flex items-center w-full">
                      <Icon className={`ltr:mr-3 rtl:ml-3 h-5 w-5 sm:h-6 sm:w-6 transition-all duration-300 ${
                        isActive ? 'text-primary-500' : 'text-gray-400 dark:text-gray-500 group-hover:text-gray-500 group-hover:scale-110'
                      }`} />
                      <span className="transition-all duration-300 ltr:group-hover:translate-x-1 rtl:group-hover:-translate-x-1">{item.name}</span>
                      {isActive && (
                        <div className="ltr:ml-auto rtl:mr-auto w-2 h-2 bg-primary-500 rounded-full"></div>
                      )}
                    </div>
                  </Link>
                );
              })}
            </nav>
          </div>
          
          {user && (
            <div className="flex-shrink-0 flex border-t border-gray-200 dark:border-slate-700 p-4">
              <div className="flex items-center w-full">
                <User className="h-8 w-8 text-gray-400" />
                <div className="ltr:ml-3 rtl:mr-3 flex-1">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-200">{user.email}</p>
                  <button
                    onClick={handleSignOut}
                    className="text-xs font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-white flex items-center mt-1"
                  >
                    <LogOut className="h-3 w-3 ltr:mr-1 rtl:ml-1" />
                    تسجيل خروج
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      {/* Main content */}
      <div className="ltr:md:pl-64 rtl:md:pr-64 flex flex-col flex-1">
        {/* Desktop header */}
        <div className="hidden md:flex sticky top-0 z-10 items-center justify-between px-4 sm:px-6 md:px-8 h-16 bg-white/90 dark:bg-slate-900/90 backdrop-blur-lg border-b border-white/20 dark:border-slate-700/40 shadow-soft">
          {/* Left: Logo */}
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold bg-gradient-to-r from-primary-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">zomiga</h1>
          </div>
          {/* Right: Theme toggle + auth */}
          <div className="flex items-center gap-2">
            <button
              onClick={toggleTheme}
              aria-label={isDark ? 'تبديل للوضع الفاتح' : 'تبديل للوضع الداكن'}
              className="p-2 rounded-lg border border-gray-200 dark:border-slate-700 bg-white/70 dark:bg-slate-800/70 text-gray-700 dark:text-gray-200 hover:shadow-md transition"
              title={isDark ? 'الوضع الفاتح' : 'الوضع الداكن'}
            >
              {isDark ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            {user ? (
              <button 
                onClick={handleSignOut}
                className="flex items-center gap-2 p-2 rounded-lg hover:bg-white/50 dark:hover:bg-slate-800/60 transition-all duration-200"
              >
                <User className="h-6 w-6 text-gray-400" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-200">{user.user_metadata?.full_name || user.email || 'مستخدم'}</span>
              </button>
            ) : (
              <Link
                href="/auth/login"
                className="flex items-center gap-2 p-2 rounded-lg hover:bg-white/50 dark:hover:bg-slate-800/60 transition-all duration-200"
              >
                <User className="h-6 w-6 text-gray-400" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-200">تسجيل دخول</span>
              </Link>
            )}
          </div>
        </div>
        {/* Mobile sticky header */}
        <div className="sticky top-0 z-10 md:hidden ltr:pl-1 rtl:pr-1 pt-1 ltr:sm:pl-3 rtl:sm:pr-3 sm:pt-3 bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg border-b border-white/20 dark:border-slate-700/40 shadow-soft">
          <div className="flex items-center justify-between">
            <button
              className="ltr:-ml-0.5 rtl:mr-0.5 -mt-0.5 h-12 w-12 inline-flex items-center justify-center rounded-xl text-gray-500 hover:text-white hover:bg-gradient-to-r hover:from-primary-500 hover:to-secondary-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500 transition-all duration-300 transform hover:scale-110 hover:shadow-lg"
              onClick={() => {
                setSidebarOpen(true)
                toast.info('فتح القائمة الجانبية')
              }}
            >
              <Menu className="h-6 w-6 transition-transform duration-300 hover:rotate-180" />
            </button>
            
            {/* Logo and App Name */}
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              <h1 className="text-lg font-bold bg-gradient-to-r from-primary-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">zomiga</h1>
            </div>
            
            {/* Actions: Theme toggle + user/login */}
            <div className="flex items-center gap-1">
              <button
                onClick={toggleTheme}
                aria-label={isDark ? 'تبديل للوضع الفاتح' : 'تبديل للوضع الداكن'}
                className="p-2 rounded-lg border border-gray-200 dark:border-slate-700 bg-white/70 dark:bg-slate-800/70 text-gray-700 dark:text-gray-200 hover:shadow-md transition"
                title={isDark ? 'الوضع الفاتح' : 'الوضع الداكن'}
              >
                {isDark ? <Sun size={18} /> : <Moon size={18} />}
              </button>
              {user ? (
                <button 
                  onClick={handleSignOut}
                  className="flex items-center space-x-2 rtl:space-x-reverse p-2 rounded-lg hover:bg-white/50 dark:hover:bg-slate-800/60 transition-all duration-200 transform hover:scale-105"
                >
                  <User className="h-6 w-6 text-gray-400" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-200 hidden sm:block">
                    {user.user_metadata?.full_name || user.email || 'مستخدم'}
                  </span>
                </button>
              ) : (
                <Link
                  href="/auth/login"
                  className="flex items-center space-x-2 rtl:space-x-reverse p-2 rounded-lg hover:bg-white/50 dark:hover:bg-slate-800/60 transition-all duration-200 transform hover:scale-105"
                >
                  <User className="h-6 w-6 text-gray-400" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-200 hidden sm:block">تسجيل دخول</span>
                </Link>
              )}
            </div>
          </div>
          
          {/* Mobile Header Ad */}
          <div className="mt-2 px-2">
            <BannerAd position="header" className="" />
          </div>
        </div>
        
        <main className="flex-1 min-h-screen">
          <div className="py-6 animate-fade-in">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              {children}
            </div>
          </div>
          
          {/* Footer Ad */}
          <div className="bg-gradient-to-r from-gray-50/80 to-white/80 dark:from-slate-900/40 dark:to-slate-900/40 backdrop-blur-sm border-t border-white/20 dark:border-slate-700/40 shadow-soft">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-6">
              <BannerAd position="footer" className="" />
            </div>
          </div>
        </main>
        
        {/* Fixed Telegram Bottom Button */}
        {telegramBtn && telegramBtn.enabled && telegramBtn.link && !router.pathname.startsWith('/admin') && (
          <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
            <a
              href={telegramBtn.link}
              target="_blank"
              rel="noopener noreferrer"
              className="telegram-button flex items-center gap-3 px-8 py-4 rounded-full shadow-2xl hover:shadow-3xl animate-bounce-slow font-bold text-white"
              style={{
                backgroundColor: telegramBtn.color || '#24A1DE',
                background: `linear-gradient(135deg, ${telegramBtn.color || '#24A1DE'}, ${telegramBtn.color ? telegramBtn.color + '99' : '#1E90FF'})`
              }}
            >
              <Send className="w-6 h-6 animate-pulse" />
              <span className="text-base font-bold drop-shadow-lg">
                {telegramBtn.text || 'انضم إلى قناتنا على تليغرام'}
              </span>
              <div className="absolute inset-0 rounded-full bg-white opacity-0 hover:opacity-20 transition-opacity duration-300"></div>
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

export default Layout