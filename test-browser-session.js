const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ متغيرات البيئة مفقودة')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function testBrowserSession() {
  console.log('🌐 اختبار جلسة المتصفح والـ middleware...')
  
  try {
    // 1. تسجيل دخول جديد
    console.log('\n1️⃣ تسجيل دخول جديد...')
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email: 'admin@zomiga.com',
      password: 'Admin123!@#'
    })
    
    if (loginError) {
      console.log('❌ فشل تسجيل الدخول:', loginError.message)
      return
    }
    
    console.log('✅ نجح تسجيل الدخول!')
    console.log('   User ID:', loginData.user?.id)
    console.log('   Email:', loginData.user?.email)
    console.log('   Access Token:', loginData.session?.access_token?.substring(0, 30) + '...')
    console.log('   Refresh Token:', loginData.session?.refresh_token?.substring(0, 30) + '...')
    
    // 2. التحقق من الملف الشخصي
    console.log('\n2️⃣ التحقق من الملف الشخصي...')
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', loginData.user.id)
      .single()
    
    if (profileError) {
      console.log('❌ خطأ في جلب الملف الشخصي:', profileError.message)
    } else {
      console.log('✅ بيانات الملف الشخصي:')
      console.log('   ID:', profile.id)
      console.log('   Username:', profile.username)
      console.log('   Full Name:', profile.full_name)
      console.log('   Role:', profile.role)
      console.log('   Active:', profile.is_active)
      console.log('   Verified:', profile.is_verified)
    }
    
    // 3. محاكاة فحص الـ middleware
    console.log('\n3️⃣ محاكاة فحص الـ middleware...')
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError) {
      console.log('❌ خطأ في جلب الجلسة:', sessionError.message)
    } else if (!session) {
      console.log('❌ لا توجد جلسة نشطة')
    } else {
      console.log('✅ الجلسة نشطة:')
      console.log('   User ID:', session.user?.id)
      console.log('   Email:', session.user?.email)
      console.log('   Expires At:', new Date(session.expires_at * 1000).toLocaleString())
      
      // فحص الدور مثل الـ middleware
      const { data: middlewareProfile, error: middlewareError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single()
      
      if (middlewareError) {
        console.log('❌ خطأ في فحص الدور (middleware):', middlewareError.message)
      } else if (!middlewareProfile || String(middlewareProfile.role || '').toLowerCase() !== 'admin') {
        console.log('❌ المستخدم ليس مديراً (middleware check)')
        console.log('   Role found:', middlewareProfile?.role || 'null')
      } else {
        console.log('✅ المستخدم مدير (middleware check passed)')
        console.log('   Role:', middlewareProfile.role)
      }
    }
    
    // 4. إنشاء رابط اختبار
    console.log('\n4️⃣ روابط الاختبار:')
    console.log('🔗 صفحة تسجيل الدخول: http://localhost:3000/auth/login')
    console.log('🔗 لوحة الإدارة: http://localhost:3000/admin')
    console.log('🔗 الصفحة الرئيسية: http://localhost:3000')
    
    console.log('\n💡 نصائح لحل المشكلة:')
    console.log('1. امسح كوكيز المتصفح للموقع')
    console.log('2. استخدم وضع التصفح الخفي')
    console.log('3. تأكد من أن الخادم يعمل على localhost:3000')
    console.log('4. تحقق من أن ملف .env يحتوي على المتغيرات الصحيحة')
    
    // 5. معلومات إضافية للتشخيص
    console.log('\n5️⃣ معلومات التشخيص:')
    console.log('   Supabase URL:', supabaseUrl)
    console.log('   Anon Key:', supabaseKey.substring(0, 20) + '...')
    console.log('   Session expires in:', Math.round((session?.expires_at * 1000 - Date.now()) / 1000 / 60), 'minutes')
    
  } catch (error) {
    console.error('❌ خطأ عام:', error)
  }
}

testBrowserSession()