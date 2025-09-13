import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useAuth } from '../contexts/AuthContext'
import { Menu, X, Home, Tv, Gamepad2, FileText, ShoppingBag, LogOut, User, Gift, Settings, Bookmark, Megaphone, Tag, Send, Sun, Moon, Bell, Search } from 'lucide-react'
import { useToast } from './ToastSystem'
import { BannerAd, CardAd } from './AdvertisementSystem'
import { getSetting } from '../lib/settingsService'
import { useTheme } from '../contexts/ThemeContext'
import { Button, Input, Card, Badge } from './ui/unified-components'

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
      // لوحة التحكم الإدارية
      { name: 'لوحة التحكم', href: '/admin', icon: Settings },
      { name: 'إدارة المستخدمين', href: '/admin/users', icon: User },
      { name: 'العروض الترويجية', href: '/admin/promotions', icon: Tag },
      { name: 'الإعلانات', href: '/admin/advertisements', icon: Megaphone },
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
    <div className="h-screen flex bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 flex z-50 md:hidden ${sidebarOpen ? '' : 'hidden'}`}>
        <div className={`fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity ease-linear duration-300 ${sidebarOpen ? 'opacity-100' : 'opacity-0'}`} onClick={() => setSidebarOpen(false)} />
        
        <div className={`relative flex-1 flex flex-col max-w-80 w-full bg-white/98 dark:bg-slate-900/98 backdrop-blur-xl border-r border-gray-200/50 dark:border-slate-700/50 shadow-2xl transform transition ease-in-out duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          
          <div className="flex-1 h-0 pt-6 pb-4 overflow-y-auto">
            <div className="flex-shrink-0 flex items-center justify-center px-6 mb-8">
              <div className="flex items-center space-x-3 rtl:space-x-reverse">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 via-purple-600 to-pink-500 rounded-2xl flex items-center justify-center shadow-xl transform hover:scale-105 transition-transform duration-300">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="white" fillOpacity="0.9"/>
                    <path d="M2 17L12 22L22 17" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M2 12L12 17L22 12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div className="flex flex-col">
                  <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent leading-tight">ZOMIGA</h1>
                  <span className="text-xs text-gray-500 dark:text-gray-400 font-medium tracking-wide">STREAMING</span>
                </div>
              </div>
            </div>
            <nav className="px-4 space-y-2">
              {navigation.map((item, index) => {
                const Icon = item.icon
                const isActive = router.pathname === item.href
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={handleNavClick}
                    className={`nav-link group flex items-center px-4 py-3.5 text-sm font-medium rounded-2xl transition-all duration-300 transform hover:scale-[1.02] ${
                      isActive
                        ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg shadow-blue-500/25'
                        : 'text-gray-900 dark:text-gray-100 hover:bg-gray-100/80 dark:hover:bg-slate-800/60 hover:text-gray-950 dark:hover:text-white'
                    }`}
                    style={{ animationDelay: `${index * 50}ms` }}>
                    <div className="flex items-center w-full">
                      <Icon className={`ltr:mr-3 rtl:ml-3 h-5 w-5 transition-all duration-300 ${
                        isActive ? 'text-white' : 'text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-gray-100'
                      }`} />
                      <span className="flex-1 text-right">{item.name}</span>
                      {isActive && (
                        <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                      )}
                    </div>
                  </Link>
                );
              })}
            </nav>
          </div>
          
          {user && (
            <div className="flex-shrink-0 border-t border-gray-200/30 dark:border-slate-700/30 p-4 bg-gray-50/60 dark:bg-slate-800/60">
              <div className="flex items-center w-full p-3 rounded-2xl bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <User className="h-5 w-5 text-white" />
                </div>
                <div className="ltr:ml-3 rtl:mr-3 flex-1">
                  <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">{user.user_metadata?.full_name || user.email}</p>
                  <button
                    onClick={handleSignOut}
                    className="text-xs font-medium text-gray-700 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 flex items-center mt-1 transition-colors duration-200"
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
      {/* Desktop sidebar */}
      <div className="hidden md:fixed md:inset-y-0 md:flex md:w-72 md:flex-col">
        <div className="flex flex-col w-full">
          <div className="flex flex-col h-0 flex-1 bg-white/98 dark:bg-slate-900/98 backdrop-blur-xl border-r border-gray-200/50 dark:border-slate-700/50 shadow-xl">
            <div className="flex-1 flex flex-col pt-6 pb-4 overflow-y-auto">
              <div className="flex items-center justify-center flex-shrink-0 px-6 mb-8">
                <div className="flex items-center space-x-3 rtl:space-x-reverse">
                  <div className="w-14 h-14 bg-gradient-to-br from-blue-500 via-purple-600 to-pink-500 rounded-2xl flex items-center justify-center shadow-xl transform hover:scale-105 transition-transform duration-300">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="white" fillOpacity="0.9"/>
                      <path d="M2 17L12 22L22 17" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M2 12L12 17L22 12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <div className="flex flex-col">
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent leading-tight">ZOMIGA</h1>
                    <span className="text-sm text-gray-500 dark:text-gray-400 font-medium tracking-wide">STREAMING PLATFORM</span>
                  </div>
                </div>
              </div>
              <nav className="flex-1 px-4 space-y-2">
                {navigation.map((item, index) => {
                  const Icon = item.icon
                  const isActive = router.pathname === item.href
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`nav-link group flex items-center px-4 py-3.5 text-sm font-medium rounded-2xl transition-all duration-300 transform hover:scale-[1.02] ${
                        isActive
                          ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg shadow-blue-500/25'
                          : 'text-gray-900 dark:text-gray-100 hover:bg-gray-100/80 dark:hover:bg-slate-800/60 hover:text-gray-950 dark:hover:text-white'
                      }`}
                      style={{ animationDelay: `${index * 50}ms` }}>
                      <div className="flex items-center w-full">
                        <Icon className={`ltr:mr-3 rtl:ml-3 h-5 w-5 transition-all duration-300 ${
                          isActive ? 'text-white' : 'text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-gray-100'
                        }`} />
                        <span className="flex-1 text-right">{item.name}</span>
                        {isActive && (
                          <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                        )}
                      </div>
                    </Link>
                  );
                })}
              </nav>
            </div>
            
            {user && (
              <div className="flex-shrink-0 border-t border-gray-200/30 dark:border-slate-700/30 p-4 bg-gray-50/60 dark:bg-slate-800/60">
                <div className="flex items-center w-full p-2 rounded-xl bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                    <User className="h-4 w-4 text-white" />
                  </div>
                  <div className="ltr:ml-3 rtl:mr-3 flex-1">
                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">{user.user_metadata?.full_name || user.email}</p>
                    <button
                      onClick={handleSignOut}
                      className="text-xs font-medium text-gray-700 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 flex items-center mt-0.5 transition-colors duration-200"
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
      </div>

      {/* Main content */}
      <div className="md:ltr:pl-72 md:rtl:pr-72 flex flex-col flex-1">
        {/* Desktop header */}
        <div className="hidden md:flex sticky top-0 z-30 items-center justify-between px-6 lg:px-8 h-16 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-gray-200/30 dark:border-slate-700/30 shadow-sm">
          {/* Left: Search and breadcrumb */}
          <div className="flex items-center gap-4 flex-1">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="البحث..."
                className="w-full pl-10 pr-4 py-2 bg-gray-50/60 dark:bg-slate-800/60 border border-gray-200/30 dark:border-slate-700/30 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200"
              />
            </div>
          </div>
          
          {/* Right: Actions */}
          <div className="flex items-center gap-3">
            <button className="p-2 rounded-xl bg-gray-50/60 dark:bg-slate-800/60 text-gray-600 dark:text-gray-400 hover:bg-gray-100/60 dark:hover:bg-slate-700/60 transition-all duration-200">
              <Bell className="h-5 w-5" />
            </button>
            
            <button
              onClick={toggleTheme}
              aria-label={isDark ? 'تبديل للوضع الفاتح' : 'تبديل للوضع الداكن'}
              className="p-2 rounded-xl bg-gray-50/60 dark:bg-slate-800/60 text-gray-600 dark:text-gray-400 hover:bg-gray-100/60 dark:hover:bg-slate-700/60 transition-all duration-200"
              title={isDark ? 'الوضع الفاتح' : 'الوضع الداكن'}
            >
              {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
            
            {user ? (
              <div className="flex items-center gap-3 p-2 rounded-xl bg-gray-50/60 dark:bg-slate-800/60">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <User className="h-4 w-4 text-white" />
                </div>
                <div className="hidden lg:block">
                  <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{user.user_metadata?.full_name || 'مستخدم'}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{user.email}</p>
                </div>
                <button 
                  onClick={handleSignOut}
                  className="p-1.5 rounded-lg text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200"
                  title="تسجيل خروج"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <Link
                href="/auth/login"
                className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-200 font-medium"
              >
                <User className="h-4 w-4" />
                <span className="text-sm">تسجيل دخول</span>
              </Link>
            )}
          </div>
        </div>
        {/* Mobile sticky header */}
        <div className="sticky top-0 z-30 md:hidden px-4 h-16 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-gray-200/30 dark:border-slate-700/30 shadow-sm">
          <div className="flex items-center justify-between h-full">
            {/* Left: Menu button */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-xl bg-gray-50/60 dark:bg-slate-800/60 text-gray-600 dark:text-gray-400 hover:bg-gray-100/60 dark:hover:bg-slate-700/60 transition-all duration-200"
              aria-label="فتح القائمة"
            >
              <Menu className="h-5 w-5" />
            </button>
            
            {/* Center: Logo */}
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 bg-gradient-to-br from-blue-500 via-purple-600 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="white" fillOpacity="0.9"/>
                  <path d="M2 17L12 22L22 17" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M2 12L12 17L22 12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div className="flex flex-col leading-none">
                <h1 className="text-base font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">ZOMIGA</h1>
                <span className="text-xs text-gray-500 dark:text-gray-400 font-medium tracking-wide">STREAM</span>
              </div>
            </div>
            
            {/* Right: Actions */}
            <div className="flex items-center gap-2">
              <button className="p-2 rounded-xl bg-gray-50/60 dark:bg-slate-800/60 text-gray-600 dark:text-gray-400 hover:bg-gray-100/60 dark:hover:bg-slate-700/60 transition-all duration-200">
                <Bell className="h-4 w-4" />
              </button>
              
              <button
                onClick={toggleTheme}
                aria-label={isDark ? 'تبديل للوضع الفاتح' : 'تبديل للوضع الداكن'}
                className="p-2 rounded-xl bg-gray-50/60 dark:bg-slate-800/60 text-gray-600 dark:text-gray-400 hover:bg-gray-100/60 dark:hover:bg-slate-700/60 transition-all duration-200"
                title={isDark ? 'الوضع الفاتح' : 'الوضع الداكن'}
              >
                {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </button>
              
              {user ? (
                <button 
                  onClick={handleSignOut}
                  className="p-2 rounded-xl bg-gray-50/60 dark:bg-slate-800/60 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200"
                  title="تسجيل خروج"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              ) : (
                <Link
                  href="/auth/login"
                  className="p-2 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:shadow-lg hover:scale-105 transition-all duration-200"
                  title="تسجيل دخول"
                >
                  <User className="h-4 w-4" />
                </Link>
              )}
            </div>
          </div>
          
          {/* Mobile Header Ad */}
          <div className="absolute top-full left-0 right-0 px-4 py-2 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-gray-200/30 dark:border-slate-700/30">
            <BannerAd position="header" className="" />
          </div>
        </div>
        
        <main className="flex-1">
          <div className="py-6 animate-fade-in">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              {children}
            </div>
          </div>
          
          {/* Footer Ad */}
          <div className="bg-gradient-to-r from-gray-50/80 to-white/80 dark:from-slate-900/40 dark:to-slate-900/40 backdrop-blur-sm border-t border-white/20 dark:border-slate-700/40 shadow-soft">
            <BannerAd position="footer" className="" />
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