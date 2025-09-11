// سكريپت لإنشاء مستخدم مدير في Supabase Auth

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

// إنشاء عميل Supabase مع مفتاح الخدمة
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('متغيرات البيئة مفقودة!')
  console.log('SUPABASE_URL:', supabaseUrl ? 'موجود' : 'مفقود')
  console.log('SERVICE_KEY:', supabaseServiceKey ? 'موجود' : 'مفقود')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function createAdminAuth() {
  try {
    console.log('إنشاء مستخدم مدير في Supabase Auth...')
    
    // محاولة إنشاء المستخدم
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: 'admin@zomiga.com',
      password: 'Ab123456',
      options: {
        data: {
          role: 'admin',
          name: 'مدير النظام'
        }
      }
    })
    
    if (signUpError) {
      if (signUpError.message.includes('already registered')) {
        console.log('المستخدم موجود بالفعل. محاولة تسجيل الدخول...')
        
        // محاولة تسجيل الدخول
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email: 'admin@zomiga.com',
          password: 'Ab123456'
        })
        
        if (signInError) {
          console.error('خطأ في تسجيل الدخول:', signInError)
          console.log('محاولة إعادة تعيين كلمة المرور...')
          
          const { error: resetError } = await supabase.auth.resetPasswordForEmail('admin@zomiga.com')
          if (resetError) {
            console.error('خطأ في إعادة تعيين كلمة المرور:', resetError)
          } else {
            console.log('تم إرسال رابط إعادة تعيين كلمة المرور')
          }
        } else {
          console.log('تم تسجيل الدخول بنجاح:', signInData.user.email)
        }
      } else {
        console.error('خطأ في إنشاء المستخدم:', signUpError)
      }
    } else {
      console.log('تم إنشاء المستخدم المدير بنجاح:', signUpData.user?.email)
    }
    
    // التحقق من المستخدمين الحاليين
    const { data: session } = await supabase.auth.getSession()
    console.log('الجلسة الحالية:', session?.session?.user?.email || 'لا توجد جلسة')
    
  } catch (error) {
    console.error('خطأ عام:', error)
  }
}

// تشغيل الإنشاء
createAdminAuth()