import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext({})

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [authError, setAuthError] = useState(null)

  // Helper functions for localStorage
  const saveUserToStorage = useCallback((userData) => {
    if (typeof window !== 'undefined' && userData) {
      try {
        localStorage.setItem('zomiga_user', JSON.stringify({
          id: userData.id,
          email: userData.email,
          role: userData.role,
          timestamp: Date.now()
        }))
      } catch (error) {
        console.warn('Failed to save user to storage:', error)
      }
    }
  }, [])

  const loadUserFromStorage = useCallback(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('zomiga_user')
        if (stored) {
          const userData = JSON.parse(stored)
          // Check if data is not older than 24 hours
          if (Date.now() - userData.timestamp < 24 * 60 * 60 * 1000) {
            return userData
          }
          localStorage.removeItem('zomiga_user')
        }
      } catch (error) {
        console.warn('Failed to load user from storage:', error)
        localStorage.removeItem('zomiga_user')
      }
    }
    return null
  }, [])

  const clearUserFromStorage = useCallback(() => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('zomiga_user')
    }
  }, [])

  // Optimized profile fetching with caching
  const fetchUserProfile = useCallback(async (userId) => {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single()
      
      if (error) throw error
      return profile?.role || 'user'
    } catch (error) {
      console.warn('Profile fetch failed, using default role:', error)
      return 'user'
    }
  }, [])

  // Initialize auth state
  useEffect(() => {
    let mounted = true
    let timeoutId

    const initializeAuth = async () => {
      try {
        // Load from storage first for instant UI
        const storedUser = loadUserFromStorage()
        if (storedUser) {
          setUser(storedUser)
        }

        // Set timeout for auth initialization
        timeoutId = setTimeout(() => {
          if (mounted && loading) {
            console.warn('Auth initialization timeout')
            setLoading(false)
            if (!storedUser) {
              setAuthError('فشل في تحميل بيانات المصادقة')
            }
          }
        }, 10000)

        // Get current session
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Session error:', error)
          if (mounted) {
            setAuthError('خطأ في جلسة المصادقة')
            setLoading(false)
          }
          return
        }

        if (mounted) {
          if (session?.user) {
            const role = await fetchUserProfile(session.user.id)
            const userData = {
              id: session.user.id,
              email: session.user.email,
              role: role
            }
            setUser(userData)
            saveUserToStorage(userData)
          } else {
            setUser(null)
            clearUserFromStorage()
          }
          
          setLoading(false)
          setAuthError(null)
          clearTimeout(timeoutId)
        }
      } catch (error) {
        console.error('Auth initialization error:', error)
        if (mounted) {
          setAuthError('خطأ في تهيئة المصادقة')
          setLoading(false)
        }
      }
    }

    initializeAuth()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return

        try {
          if (session?.user) {
            const role = await fetchUserProfile(session.user.id)
            const userData = {
              id: session.user.id,
              email: session.user.email,
              role: role
            }
            setUser(userData)
            saveUserToStorage(userData)
          } else {
            setUser(null)
            clearUserFromStorage()
          }
          setAuthError(null)
        } catch (error) {
          console.error('Auth state change error:', error)
        }
        
        setLoading(false)
      }
    )

    return () => {
      mounted = false
      if (timeoutId) clearTimeout(timeoutId)
      subscription?.unsubscribe()
    }
  }, [])

  // Optimized sign up function
  const signUp = useCallback(async (email, password, userData = {}) => {
    try {
      setLoading(true)
      setAuthError(null)
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: userData
        }
      })
      
      if (error) throw error
      
      return { success: true, data }
    } catch (error) {
      console.error('Sign up error:', error)
      setAuthError(error.message || 'فشل في إنشاء الحساب')
      return { success: false, error: error.message }
    } finally {
      setLoading(false)
    }
  }, [])

  // Optimized sign in function
  const signIn = useCallback(async (email, password) => {
    try {
      setLoading(true)
      setAuthError(null)
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      
      if (error) throw error
      
      return { success: true, data }
    } catch (error) {
      console.error('Sign in error:', error)
      setAuthError(error.message || 'فشل في تسجيل الدخول')
      return { success: false, error: error.message }
    } finally {
      setLoading(false)
    }
  }, [])

  // Optimized sign out function
  const signOut = useCallback(async () => {
    try {
      setLoading(true)
      const { error } = await supabase.auth.signOut()
      
      if (error) throw error
      
      setUser(null)
      clearUserFromStorage()
      return { success: true }
    } catch (error) {
      console.error('Sign out error:', error)
      setAuthError(error.message || 'فشل في تسجيل الخروج')
      return { success: false, error: error.message }
    } finally {
      setLoading(false)
    }
  }, [])

  // Reset password function
  const resetPassword = useCallback(async (email) => {
    try {
      setLoading(true)
      setAuthError(null)
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`
      })
      
      if (error) throw error
      
      return { success: true }
    } catch (error) {
      console.error('Reset password error:', error)
      setAuthError(error.message || 'فشل في إرسال رابط إعادة تعيين كلمة المرور')
      return { success: false, error: error.message }
    } finally {
      setLoading(false)
    }
  }, [])

  // Admin check function
  const isAdmin = useCallback((userData = user) => {
    if (!userData) return false
    return userData.role === 'admin' || userData.role === 'super_admin'
  }, [user])

  const value = {
    user,
    loading,
    authError,
    signUp,
    signIn,
    signOut,
    resetPassword,
    isAdmin,
    clearError: () => setAuthError(null)
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}