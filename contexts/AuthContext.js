import { createContext, useContext, useEffect, useState } from 'react'
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
  console.log('🔧 AuthProvider: Component initializing...')
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [authError, setAuthError] = useState(null)

  // Helper function to save user data to localStorage
  const saveUserToStorage = (userData) => {
    if (typeof window !== 'undefined' && userData) {
      localStorage.setItem('admin_user_data', JSON.stringify(userData))
    }
  }

  // Helper function to load user data from localStorage
  const loadUserFromStorage = () => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('admin_user_data')
      return stored ? JSON.parse(stored) : null
    }
    return null
  }

  // Helper function to clear user data from localStorage
  const clearUserFromStorage = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('admin_user_data')
    }
  }
  console.log('🔧 AuthProvider: Initial state set - loading: true')

  useEffect(() => {
    let mounted = true
    console.log('🔄 AuthContext: Starting initialization...')
    
    // Try to load user from localStorage first for faster loading
    const storedUser = loadUserFromStorage()
    if (storedUser && storedUser.role === 'admin') {
      console.log('📦 Loading user from storage:', storedUser.email)
      setUser(storedUser)
    }
    
    // Fallback timeout to prevent infinite loading - increased timeout and better handling
    const fallbackTimeout = setTimeout(() => {
      if (mounted && loading) {
        console.warn('⏰ Auth initialization timeout - keeping current state')
        // Don't reset user to null if we already have a session or stored data
        if (!user && !storedUser) {
          setUser(null)
          setAuthError('انتهت مهلة تحميل المصادقة')
        }
        setLoading(false)
      }
    }, 30000) // 30 seconds timeout instead of 10
    
    // Get initial session with enhanced error handling
    const getInitialSession = async () => {
      try {
        console.log('🔍 AuthContext: Getting initial session...')
        // Add timeout to the auth request with retry mechanism
        const authPromise = supabase.auth.getSession()
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Auth timeout')), 8000)
        )
        
        const { data: { session }, error } = await Promise.race([authPromise, timeoutPromise])
        console.log('📋 AuthContext: Session result:', { session: !!session, error: !!error })
        
        if (error) {
          console.error('❌ AuthContext: Error getting session:', error)
          if (mounted) {
            setUser(null)
            setLoading(false)
            setAuthError(error.message)
          }
          return
        }

        if (mounted) {
          const userData = session?.user ?? null
          console.log('👤 AuthContext: Processing user data:', { hasUser: !!userData })
          if (userData) {
            try {
              console.log('🔍 AuthContext: Fetching user profile...')
              // Get user profile to check role with timeout and fallback
              const profilePromise = supabase
                .from('profiles')
                .select('role')
                .eq('id', userData.id)
                .single()
              
              const profileTimeoutPromise = new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Profile timeout')), 10000)
              )
              
              const { data: profile } = await Promise.race([profilePromise, profileTimeoutPromise])
              userData.role = (profile?.role ? String(profile.role).toLowerCase() : 'user')
              console.log('✅ AuthContext: Profile loaded, role:', userData.role)
            } catch (profileError) {
              console.warn('⚠️ AuthContext: Error getting user profile, using default role:', profileError)
              userData.role = 'user'
            }
          }
          console.log('✅ AuthContext: Setting user and completing initialization')
          setUser(userData)
          // Save admin user data to localStorage for persistence
          if (userData && userData.role === 'admin') {
            saveUserToStorage(userData)
          }
          setLoading(false)
          setAuthError(null)
          clearTimeout(fallbackTimeout)
        } else {
          console.log('❌ No session found')
          // Check if we have stored admin data as fallback
          const storedUser = loadUserFromStorage()
          if (storedUser && storedUser.role === 'admin') {
            console.log('📦 Using stored admin data as fallback')
            setUser(storedUser)
          } else {
            setUser(null)
            clearUserFromStorage()
          }
          setLoading(false)
          setAuthError(null)
          clearTimeout(fallbackTimeout)
        }
      } catch (error) {
        console.error('❌ AuthContext: Critical error in getInitialSession:', error)
        console.error('❌ AuthContext: Error details:', { message: error.message, stack: error.stack })
        if (mounted) {
          console.log('⚠️ AuthContext: Setting error state due to exception')
          setUser(null)
          setLoading(false)
          setAuthError(error.message === 'Auth timeout' ? 'انتهت مهلة الاتصال' : 'حدث خطأ في تحميل المصادقة')
          clearTimeout(fallbackTimeout)
        }
      }
    }

    getInitialSession()

    // Listen for auth changes with enhanced error handling
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔄 AuthContext: Auth state changed:', { event, hasSession: !!session })
        if (mounted) {
          try {
            const userData = session?.user ?? null
            if (userData) {
              try {
                console.log('🔍 AuthContext: Fetching profile in auth change...')
                // Get user profile to check role with timeout and fallback
                const profilePromise = supabase
                  .from('profiles')
                  .select('role')
                  .eq('id', userData.id)
                  .single()
                
                const profileTimeoutPromise = new Promise((_, reject) => 
                  setTimeout(() => reject(new Error('Profile timeout')), 5000)
                )
                
                const { data: profile } = await Promise.race([profilePromise, profileTimeoutPromise])
                userData.role = (profile?.role ? String(profile.role).toLowerCase() : 'user')
                console.log('✅ AuthContext: Profile loaded in auth change, role:', userData.role)
              } catch (profileError) {
                console.warn('⚠️ AuthContext: Error getting user profile in auth change, using default role:', profileError)
                userData.role = 'user'
              }
            }
            console.log('✅ AuthContext: Updating user state from auth change')
            setUser(userData)
            setLoading(false)
            setAuthError(null)
          } catch (stateChangeError) {
            console.error('❌ AuthContext: Error in auth state change handler:', stateChangeError)
            // Don't set error state here to avoid disrupting auth flow
          }
        }
      }
    )

    // Set up periodic session validation for admin users
    const sessionCheckInterval = setInterval(() => {
      if (user && user.role === 'admin') {
        supabase.auth.getSession().then(({ data: { session } }) => {
          if (!session) {
            console.warn('⚠️ Session expired, using stored data')
            const storedUser = loadUserFromStorage()
            if (!storedUser || storedUser.role !== 'admin') {
              console.log('🔄 No valid stored data, signing out')
              setUser(null)
              clearUserFromStorage()
            }
          }
        })
      }
    }, 60000) // Check every minute

    return () => {
      console.log('🧹 AuthContext: Cleaning up auth effect')
      mounted = false
      clearTimeout(fallbackTimeout)
      clearInterval(sessionCheckInterval)
      subscription?.unsubscribe()
    }
  }, [user])

  const signUp = async (email, password, userData = {}, retryCount = 0) => {
    console.log('📝 AuthContext: Starting signUp process...', { email, userData, attempt: retryCount + 1 })
    try {
      setLoading(true)
      console.log('⏳ AuthContext: Setting loading to true for signUp')
      
      // إضافة timeout للطلب لتجنب التعليق
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Request timeout')), 10000)
      )
      
      console.log('🔄 AuthContext: Making signUp request to Supabase...')
      const authPromise = supabase.auth.signUp({
        email,
        password,
        options: {
          data: userData
        }
      })
      
      const { data, error } = await Promise.race([authPromise, timeoutPromise])
      console.log('📋 AuthContext: SignUp response received:', { hasData: !!data, hasError: !!error, errorMessage: error?.message })
      
      if (error) {
        // إذا كان خطأ شبكة وهذه ليست المحاولة الثالثة، جرب مرة أخرى
        if (retryCount < 2 && (error.message?.includes('network') || error.message?.includes('fetch'))) {
          console.log('🔄 AuthContext: Retrying signUp due to network error')
          await new Promise(resolve => setTimeout(resolve, 1000)) // انتظار ثانية واحدة
          return signUp(email, password, userData, retryCount + 1)
        }
        throw error
      }
      console.log('✅ AuthContext: SignUp successful')
      return { data, error: null }
    } catch (error) {
      console.error('❌ AuthContext: SignUp error:', error)
      
      // معالجة أفضل للأخطاء
      if (error.message === 'Request timeout') {
        // إذا كان timeout وهذه ليست المحاولة الثالثة، جرب مرة أخرى
        if (retryCount < 2) {
          console.log('🔄 AuthContext: Retrying signUp due to timeout')
          await new Promise(resolve => setTimeout(resolve, 1000))
          return signUp(email, password, userData, retryCount + 1)
        }
        console.log('⏰ AuthContext: SignUp timeout occurred after retries')
        return { data: null, error: { message: 'انتهت مهلة الاتصال بعد عدة محاولات. يرجى المحاولة مرة أخرى.' } }
      }
      
      return { data: null, error }
    } finally {
      console.log('🔄 AuthContext: Setting loading to false for signUp')
      setLoading(false)
    }
  }

  const signIn = async (email, password, retryCount = 0) => {
    console.log('🔑 AuthContext: Starting signIn process...', { email, attempt: retryCount + 1 })
    try {
      setLoading(true)
      console.log('⏳ AuthContext: Setting loading to true for signIn')
      
      // إضافة timeout للطلب لتجنب التعليق
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Request timeout')), 10000)
      )
      
      console.log('🔄 AuthContext: Making signIn request to Supabase...')
      const authPromise = supabase.auth.signInWithPassword({
        email,
        password
      })
      
      const { data, error } = await Promise.race([authPromise, timeoutPromise])
      console.log('📋 AuthContext: SignIn response received:', { hasData: !!data, hasError: !!error, errorMessage: error?.message })
      
      if (error) {
        // إذا كان خطأ شبكة وهذه ليست المحاولة الثالثة، جرب مرة أخرى
        if (retryCount < 2 && (error.message?.includes('network') || error.message?.includes('fetch'))) {
          console.log('🔄 AuthContext: Retrying signIn due to network error')
          await new Promise(resolve => setTimeout(resolve, 1000)) // انتظار ثانية واحدة
          return signIn(email, password, retryCount + 1)
        }
        throw error
      }
      console.log('✅ AuthContext: SignIn successful')
      return { data, error: null }
    } catch (error) {
      console.error('❌ AuthContext: SignIn error:', error)
      
      // معالجة أفضل للأخطاء
      if (error.message === 'Request timeout') {
        // إذا كان timeout وهذه ليست المحاولة الثالثة، جرب مرة أخرى
        if (retryCount < 2) {
          console.log('🔄 AuthContext: Retrying signIn due to timeout')
          await new Promise(resolve => setTimeout(resolve, 1000))
          return signIn(email, password, retryCount + 1)
        }
        console.log('⏰ AuthContext: SignIn timeout occurred after retries')
        return { data: null, error: { message: 'انتهت مهلة الاتصال بعد عدة محاولات. يرجى المحاولة مرة أخرى.' } }
      }
      
      return { data: null, error }
    } finally {
      console.log('🔄 AuthContext: Setting loading to false for signIn')
      setLoading(false)
    }
  }

  const signOut = async () => {
    try {
      setLoading(true)
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      
      setUser(null)
      setAuthError(null)
      // Clear stored user data
      clearUserFromStorage()
      console.log('✅ User signed out successfully')
      return { error: null }
    } catch (error) {
      console.error('❌ Error signing out:', error)
      setAuthError(error.message)
      return { error }
    } finally {
      setLoading(false)
    }
  }

  const resetPassword = async (email) => {
    try {
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      })
      
      if (error) throw error
      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }

  const updatePassword = async (newPassword) => {
    try {
      const { data, error } = await supabase.auth.updateUser({
        password: newPassword
      })
      
      if (error) throw error
      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }

  // Helper function to check if user is admin
  const isAdmin = (userData = user) => {
    if (!userData) return false
    return String(userData.role || '').toLowerCase() === 'admin'
  }

  // Helper function to check if user is moderator or admin
  const isModerator = (userData = user) => {
    if (!userData) return false
    const role = String(userData.role || '').toLowerCase()
    return role === 'admin' || role === 'moderator'
  }

  const value = {
    user,
    loading,
    authError,
    signUp,
    signIn,
    signOut,
    resetPassword,
    updatePassword,
    isAdmin,
    isModerator
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}