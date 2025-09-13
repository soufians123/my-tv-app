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
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    
    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Error getting session:', error)
          if (mounted) {
            setUser(null)
            setLoading(false)
          }
          return
        }

        if (mounted) {
          const userData = session?.user ?? null
          if (userData) {
            // Get user profile to check role
            const { data: profile } = await supabase
              .from('profiles')
              .select('role')
              .eq('id', userData.id)
              .single()
            
            userData.role = (profile?.role ? String(profile.role).toLowerCase() : 'user')
          }
          setUser(userData)
          setLoading(false)
        }
      } catch (error) {
        console.error('Error in getInitialSession:', error)
        if (mounted) {
          setUser(null)
          setLoading(false)
        }
      }
    }

    getInitialSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (mounted) {
          const userData = session?.user ?? null
          if (userData) {
            // Get user profile to check role
            const { data: profile } = await supabase
              .from('profiles')
              .select('role')
              .eq('id', userData.id)
              .single()
            
            userData.role = (profile?.role ? String(profile.role).toLowerCase() : 'user')
          }
          setUser(userData)
          setLoading(false)
        }
      }
    )

    return () => {
      mounted = false
      subscription?.unsubscribe()
    }
  }, [])

  const signUp = async (email, password, userData = {}) => {
    try {
      setLoading(true)
      
      // إضافة timeout للطلب لتجنب التعليق
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Request timeout')), 15000)
      )
      
      const authPromise = supabase.auth.signUp({
        email,
        password,
        options: {
          data: userData
        }
      })
      
      const { data, error } = await Promise.race([authPromise, timeoutPromise])
      
      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('SignUp error:', error)
      
      // معالجة أفضل للأخطاء
      if (error.message === 'Request timeout') {
        return { data: null, error: { message: 'انتهت مهلة الاتصال. يرجى المحاولة مرة أخرى.' } }
      }
      
      return { data: null, error }
    } finally {
      setLoading(false)
    }
  }

  const signIn = async (email, password) => {
    try {
      setLoading(true)
      
      // إضافة timeout للطلب لتجنب التعليق
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Request timeout')), 15000)
      )
      
      const authPromise = supabase.auth.signInWithPassword({
        email,
        password
      })
      
      const { data, error } = await Promise.race([authPromise, timeoutPromise])
      
      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('SignIn error:', error)
      
      // معالجة أفضل للأخطاء
      if (error.message === 'Request timeout') {
        return { data: null, error: { message: 'انتهت مهلة الاتصال. يرجى المحاولة مرة أخرى.' } }
      }
      
      return { data: null, error }
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    try {
      setLoading(true)
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      
      setUser(null)
      return { error: null }
    } catch (error) {
      console.error('Error signing out:', error)
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