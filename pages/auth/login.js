import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { useAuth } from '../../contexts/AuthContext'
import { Eye, EyeOff, Mail, Lock } from 'lucide-react'
import toast from 'react-hot-toast'

const LoginPage = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const { signIn } = useAuth()
  const router = useRouter()
  
  useEffect(() => {
    // Check for messages from middleware or other sources
    const { message, error } = router.query
    
    if (message) {
      toast.error(message)
    }
    
    if (error === 'unauthorized') {
      toast.error('غير مصرح لك بالوصول إلى هذه الصفحة')
    }
  }, [router.query])
  
  const handleSubmit = async (e) => {
    e.preventDefault()
    console.log('🔑 Login: Form submitted')
    
    if (!email || !password) {
      console.log('❌ Login: Missing email or password')
      toast.error('يرجى ملء جميع الحقول')
      return
    }

    console.log('⏳ Login: Starting login process...', { email })
    setLoading(true)
    
    try {
      const result = await signIn(email, password)
      console.log('📋 Login: SignIn result:', { hasData: !!result.data, hasError: !!result.error })
      
      if (result.error) {
        console.error('❌ Login: SignIn error:', result.error)
        if (result.error.message?.includes('Invalid login credentials')) {
          toast.error('بيانات الدخول غير صحيحة')
        } else if (result.error.message?.includes('Email not confirmed')) {
          toast.error('يرجى تأكيد البريد الإلكتروني أولاً')
        } else if (result.error.message?.includes('انتهت مهلة الاتصال')) {
          toast.error('انتهت مهلة الاتصال. يرجى التحقق من اتصال الإنترنت والمحاولة مرة أخرى')
        } else {
          toast.error('خطأ في تسجيل الدخول: ' + (result.error.message || 'خطأ غير معروف'))
        }
      } else {
        console.log('✅ Login: Login successful, preparing redirect')
        toast.success('تم تسجيل الدخول بنجاح')
        
        // إعادة التوجيه بعد نجاح تسجيل الدخول
        // نستخدم إعادة تحميل كاملة للصفحة لضمان تمرير الكوكيز للميدلوير وتفادي التعليق
        const rawRedirect = router.query.redirectTo
        const redirectTo = typeof rawRedirect === 'string' ? rawRedirect : null
        const safeRedirect = redirectTo && redirectTo.startsWith('/') ? redirectTo : '/'
        console.log('🔄 Login: Redirecting to:', safeRedirect)
        
        // استخدام assign بدلاً من push أو href مع setTimeout
        window.location.assign(safeRedirect)
      }
    } catch (error) {
      console.error('❌ Login: Unexpected error:', error)
      toast.error('حدث خطأ غير متوقع')
    } finally {
      console.log('🔄 Login: Setting loading to false')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            تسجيل الدخول
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            أو{' '}
            <Link href="/auth/register" className="font-medium text-primary-600 hover:text-primary-500">
              إنشاء حساب جديد
            </Link>
          </p>
        </div>
        
        <form 
          className="mt-8 space-y-6" 
          onSubmit={handleSubmit}
          noValidate
        >
          <div className="bg-white rounded-lg shadow-xl p-8 space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                البريد الإلكتروني
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field pl-10"
                  placeholder="أدخل بريدك الإلكتروني"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                كلمة المرور
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field pl-10 pr-10"
                  placeholder="أدخل كلمة المرور"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="text-sm">
                <Link href="/auth/forgot-password" className="font-medium text-primary-600 hover:text-primary-500">
                  نسيت كلمة المرور؟
                </Link>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                  loading
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500'
                } transition-colors duration-200`}
              >
                {loading ? (
                  <div className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    جاري تسجيل الدخول...
                  </div>
                ) : (
                  'تسجيل الدخول'
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

export default LoginPage