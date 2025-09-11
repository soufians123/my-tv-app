import { useState } from 'react'
import Link from 'next/link'
import { useAuth } from '../../contexts/AuthContext'
import { Mail, ArrowLeft } from 'lucide-react'
import toast from 'react-hot-toast'

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const { resetPassword } = useAuth()

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!email) {
      toast.error('يرجى إدخال البريد الإلكتروني')
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      toast.error('يرجى إدخال بريد إلكتروني صحيح')
      return
    }

    setLoading(true)
    
    try {
      const { error } = await resetPassword(email)
      
      if (error) {
        toast.error('حدث خطأ أثناء إرسال رابط إعادة التعيين')
      } else {
        setSent(true)
        toast.success('تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني')
      }
    } catch (error) {
      toast.error('حدث خطأ غير متوقع')
    } finally {
      setLoading(false)
    }
  }

  if (sent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="bg-white rounded-lg shadow-xl p-8 text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
              <Mail className="h-6 w-6 text-green-600" />
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              تم إرسال الرابط!
            </h2>
            
            <p className="text-gray-600 mb-6">
              تم إرسال رابط إعادة تعيين كلمة المرور إلى:
              <br />
              <span className="font-medium text-gray-900">{email}</span>
            </p>
            
            <p className="text-sm text-gray-500 mb-6">
              يرجى التحقق من بريدك الإلكتروني واتباع التعليمات لإعادة تعيين كلمة المرور.
              إذا لم تجد الرسالة، تحقق من مجلد الرسائل غير المرغوب فيها.
            </p>
            
            <div className="space-y-3">
              <button
                onClick={() => {
                  setSent(false)
                  setEmail('')
                }}
                className="w-full btn-secondary"
              >
                إرسال مرة أخرى
              </button>
              
              <Link
                href="/auth/login"
                className="w-full btn-primary inline-flex items-center justify-center">
                <ArrowLeft className="h-4 w-4 mr-2" />
                العودة لتسجيل الدخول
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            استعادة كلمة المرور
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            أدخل بريدك الإلكتروني وسنرسل لك رابط إعادة تعيين كلمة المرور
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
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

            <div className="space-y-3">
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
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    جاري الإرسال...
                  </div>
                ) : (
                  'إرسال رابط الاستعادة'
                )}
              </button>
              
              <Link
                href="/auth/login"
                className="w-full btn-secondary inline-flex items-center justify-center">
                <ArrowLeft className="h-4 w-4 mr-2" />
                العودة لتسجيل الدخول
              </Link>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ForgotPasswordPage