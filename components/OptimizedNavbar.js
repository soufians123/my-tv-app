import { memo, useState, useCallback, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useAuth } from '../contexts/AuthContext'
import { Avatar } from './OptimizedImage'
import LoadingSpinner from './LoadingSpinner'

const OptimizedNavbar = memo(() => {
  const { user, loading, signOut } = useAuth()
  const router = useRouter()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const toggleMenu = useCallback(() => {
    setIsMenuOpen(prev => !prev)
  }, [])

  const closeMenu = useCallback(() => {
    setIsMenuOpen(false)
  }, [])

  const handleSignOut = useCallback(async () => {
    await signOut()
    router.push('/')
    closeMenu()
  }, [signOut, router])

  const navItems = [
    { href: '/', label: 'الرئيسية', icon: 'home' },
    { href: '/games', label: 'الألعاب', icon: 'games' },
    { href: '/favorites', label: 'المفضلة', icon: 'heart' },
    { href: '/about', label: 'حول الموقع', icon: 'info' },
  ]

  const getIcon = (iconName) => {
    const icons = {
      home: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
      games: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M15 14h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      heart: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      ),
      info: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      user: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
      logout: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
        </svg>
      ),
      login: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
        </svg>
      )
    }
    return icons[iconName] || null
  }

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled 
        ? 'bg-white/95 backdrop-blur-md shadow-lg' 
        : 'bg-white/90 backdrop-blur-sm'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 space-x-reverse">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">ز</span>
            </div>
            <span className="text-xl font-bold text-gray-900">زوميجا</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8 space-x-reverse">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center space-x-2 space-x-reverse px-3 py-2 rounded-lg transition-all duration-200 hover:bg-gray-100 ${
                  router.pathname === item.href
                    ? 'text-blue-600 bg-blue-50'
                    : 'text-gray-700 hover:text-blue-600'
                }`}
              >
                {getIcon(item.icon)}
                <span className="font-medium">{item.label}</span>
              </Link>
            ))}
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-4 space-x-reverse">
            {loading ? (
              <LoadingSpinner size="small" />
            ) : user ? (
              <div className="relative">
                <button
                  onClick={toggleMenu}
                  className="flex items-center space-x-2 space-x-reverse p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                >
                  <Avatar
                    src={user.avatar}
                    alt={user.email}
                    size="small"
                    fallback={user.email?.[0]?.toUpperCase()}
                  />
                  <span className="hidden sm:block text-gray-700 font-medium">
                    {user.email?.split('@')[0]}
                  </span>
                  <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Dropdown Menu */}
                {isMenuOpen && (
                  <div className="absolute left-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                    <Link
                      href="/profile"
                      className="flex items-center space-x-2 space-x-reverse px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                      onClick={closeMenu}
                    >
                      {getIcon('user')}
                      <span>الملف الشخصي</span>
                    </Link>
                    <button
                      onClick={handleSignOut}
                      className="w-full flex items-center space-x-2 space-x-reverse px-4 py-2 text-red-600 hover:bg-red-50 transition-colors duration-200"
                    >
                      {getIcon('logout')}
                      <span>تسجيل الخروج</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-2 space-x-reverse">
                <Link
                  href="/auth/login"
                  className="flex items-center space-x-2 space-x-reverse px-4 py-2 text-blue-600 hover:text-blue-700 font-medium transition-colors duration-200"
                >
                  {getIcon('login')}
                  <span>تسجيل الدخول</span>
                </Link>
                <Link
                  href="/auth/register"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium"
                >
                  إنشاء حساب
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={toggleMenu}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-4">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center space-x-3 space-x-reverse px-4 py-3 rounded-lg transition-all duration-200 hover:bg-gray-100 ${
                  router.pathname === item.href
                    ? 'text-blue-600 bg-blue-50'
                    : 'text-gray-700'
                }`}
                onClick={closeMenu}
              >
                {getIcon(item.icon)}
                <span className="font-medium">{item.label}</span>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Overlay for mobile menu */}
      {isMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-25 z-40 md:hidden"
          onClick={closeMenu}
        />
      )}
    </nav>
  )
})

OptimizedNavbar.displayName = 'OptimizedNavbar'

export default OptimizedNavbar