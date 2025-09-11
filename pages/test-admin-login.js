import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../lib/supabase'
import { toast } from 'react-hot-toast'

export default function TestAdminLogin() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [session, setSession] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loginData, setLoginData] = useState({
    email: 'admin@zomiga.com',
    password: 'Admin123!@#'
  })

  useEffect(() => {
    checkCurrentSession()
  }, [])

  const checkCurrentSession = async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession()
      
      if (error) {
        console.error('Session error:', error)
        return
      }
      
      setSession(session)
      
      if (session) {
        // Get profile
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()
        
        if (profileError) {
          console.error('Profile error:', profileError)
        } else {
          setProfile(profile)
        }
      }
    } catch (error) {
      console.error('Check session error:', error)
    }
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: loginData.email,
        password: loginData.password
      })
      
      if (error) {
        toast.error('خطأ في تسجيل الدخول: ' + error.message)
        return
      }
      
      toast.success('تم تسجيل الدخول بنجاح!')
      
      // Wait a moment then check session
      setTimeout(() => {
        checkCurrentSession()
      }, 1000)
      
    } catch (error) {
      console.error('Login error:', error)
      toast.error('حدث خطأ في تسجيل الدخول')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      
      if (error) {
        toast.error('خطأ في تسجيل الخروج: ' + error.message)
        return
      }
      
      toast.success('تم تسجيل الخروج بنجاح!')
      setSession(null)
      setProfile(null)
      
    } catch (error) {
      console.error('Logout error:', error)
      toast.error('حدث خطأ في تسجيل الخروج')
    }
  }

  const testAdminAccess = () => {
    router.push('/admin')
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold text-center mb-6">اختبار تسجيل دخول الأدمن</h1>
          
          {!session ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  البريد الإلكتروني
                </label>
                <input
                  type="email"
                  value={loginData.email}
                  onChange={(e) => setLoginData({...loginData, email: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  كلمة المرور
                </label>
                <input
                  type="password"
                  value={loginData.password}
                  onChange={(e) => setLoginData({...loginData, password: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'جاري تسجيل الدخول...' : 'تسجيل الدخول'}
              </button>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-md p-4">
                <h3 className="text-lg font-medium text-green-800 mb-2">تم تسجيل الدخول بنجاح!</h3>
                <div className="text-sm text-green-700 space-y-1">
                  <p><strong>البريد الإلكتروني:</strong> {session.user?.email}</p>
                  <p><strong>معرف المستخدم:</strong> {session.user?.id}</p>
                  {profile && (
                    <>
                      <p><strong>الاسم:</strong> {profile.full_name}</p>
                      <p><strong>اسم المستخدم:</strong> {profile.username}</p>
                      <p><strong>الدور:</strong> {profile.role}</p>
                      <p><strong>نشط:</strong> {profile.is_active ? 'نعم' : 'لا'}</p>
                      <p><strong>مؤكد:</strong> {profile.is_verified ? 'نعم' : 'لا'}</p>
                    </>
                  )}
                </div>
              </div>
              
              <div className="space-y-2">
                <button
                  onClick={testAdminAccess}
                  className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700"
                >
                  اختبار الوصول إلى لوحة الإدارة
                </button>
                
                <button
                  onClick={handleLogout}
                  className="w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700"
                >
                  تسجيل الخروج
                </button>
              </div>
            </div>
          )}
          
          <div className="mt-6 pt-4 border-t border-gray-200">
            <h4 className="text-sm font-medium text-gray-700 mb-2">روابط مفيدة:</h4>
            <div className="space-y-1 text-sm">
              <a href="/auth/login" className="block text-blue-600 hover:text-blue-800">
                صفحة تسجيل الدخول الرسمية
              </a>
              <a href="/admin" className="block text-blue-600 hover:text-blue-800">
                لوحة الإدارة
              </a>
              <a href="/" className="block text-blue-600 hover:text-blue-800">
                الصفحة الرئيسية
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}