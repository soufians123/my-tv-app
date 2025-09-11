const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ متغيرات البيئة مفقودة')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function clearSessionAndTest() {
  console.log('🧹 مسح الجلسة الحالية وإعادة اختبار تسجيل الدخول...')
  
  try {
    // 1. تسجيل الخروج من أي جلسة حالية
    console.log('\n1️⃣ تسجيل الخروج من الجلسة الحالية...')
    const { error: signOutError } = await supabase.auth.signOut()
    
    if (signOutError) {
      console.log('⚠️  خطأ في تسجيل الخروج (قد يكون طبيعياً):', signOutError.message)
    } else {
      console.log('✅ تم تسجيل الخروج بنجاح')
    }
    
    // 2. التحقق من عدم وجود جلسة
    console.log('\n2️⃣ التحقق من حالة الجلسة...')
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError) {
      console.log('❌ خطأ في جلب الجلسة:', sessionError.message)
    } else if (session) {
      console.log('⚠️  لا تزال هناك جلسة نشطة:', session.user?.email)
    } else {
      console.log('✅ لا توجد جلسة نشطة')
    }
    
    // 3. تسجيل دخول جديد
    console.log('\n3️⃣ تسجيل دخول جديد...')
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email: 'admin@zomiga.com',
      password: 'Admin123!@#'
    })
    
    if (loginError) {
      console.log('❌ فشل تسجيل الدخول:', loginError.message)
      return
    }
    
    console.log('✅ نجح تسجيل الدخول الجديد!')
    console.log('   User ID:', loginData.user?.id)
    console.log('   Email:', loginData.user?.email)
    console.log('   Session ID:', loginData.session?.access_token?.substring(0, 20) + '...')
    
    // 4. التحقق من الدور
    console.log('\n4️⃣ التحقق من الدور...')
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role, is_active, is_verified')
      .eq('id', loginData.user.id)
      .single()
    
    if (profileError) {
      console.log('❌ خطأ في جلب الملف الشخصي:', profileError.message)
    } else {
      console.log('✅ بيانات الملف الشخصي:')
      console.log('   Role:', profile.role)
      console.log('   Active:', profile.is_active)
      console.log('   Verified:', profile.is_verified)
      
      if (profile.role === 'admin' && profile.is_active) {
        console.log('\n🎉 كل شيء يعمل بشكل صحيح!')
        console.log('\n📋 تعليمات الوصول إلى لوحة الإدارة:')
        console.log('1. اذهب إلى: http://localhost:3000/auth/login')
        console.log('2. استخدم البيانات:')
        console.log('   - البريد الإلكتروني: admin@zomiga.com')
        console.log('   - كلمة المرور: Admin123!@#')
        console.log('3. بعد تسجيل الدخول، اذهب إلى: http://localhost:3000/admin')
        console.log('\n💡 نصيحة: امسح كوكيز المتصفح إذا استمرت المشكلة')
      } else {
        console.log('❌ مشكلة في صلاحيات المستخدم')
      }
    }
    
  } catch (error) {
    console.error('❌ خطأ عام:', error)
  }
}

clearSessionAndTest()