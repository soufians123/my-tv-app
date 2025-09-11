const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ متغيرات البيئة مفقودة')
  console.log('SUPABASE_URL:', supabaseUrl ? '✅ موجود' : '❌ مفقود')
  console.log('SUPABASE_ANON_KEY:', supabaseKey ? '✅ موجود' : '❌ مفقود')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function testAdminLogin() {
  console.log('🔍 اختبار تسجيل دخول الأدمن...')
  
  try {
    // 1. التحقق من وجود المستخدم في auth.users
    console.log('\n1️⃣ التحقق من وجود المستخدم في جدول المصادقة...')
    
    // استخدام service role للوصول إلى auth.users
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!serviceKey) {
      console.log('⚠️  لا يمكن التحقق من جدول auth.users بدون service role key')
    } else {
      const serviceSupabase = createClient(supabaseUrl, serviceKey)
      const { data: authUsers, error: authError } = await serviceSupabase
        .from('auth.users')
        .select('id, email, created_at')
        .eq('email', 'admin@zomiga.com')
      
      if (authError) {
        console.log('❌ خطأ في الوصول إلى جدول المصادقة:', authError.message)
      } else if (authUsers && authUsers.length > 0) {
        console.log('✅ المستخدم موجود في جدول المصادقة:')
        console.log('   ID:', authUsers[0].id)
        console.log('   Email:', authUsers[0].email)
        console.log('   Created:', authUsers[0].created_at)
      } else {
        console.log('❌ المستخدم غير موجود في جدول المصادقة')
      }
    }
    
    // 2. التحقق من وجود الملف الشخصي
    console.log('\n2️⃣ التحقق من وجود الملف الشخصي...')
    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('username', 'admin')
    
    if (profileError) {
      console.log('❌ خطأ في جلب الملف الشخصي:', profileError.message)
    } else if (profiles && profiles.length > 0) {
      console.log('✅ الملف الشخصي موجود:')
      console.log('   ID:', profiles[0].id)
      console.log('   Username:', profiles[0].username)
      console.log('   Full Name:', profiles[0].full_name)
      console.log('   Role:', profiles[0].role)
      console.log('   Active:', profiles[0].is_active)
    } else {
      console.log('❌ الملف الشخصي غير موجود')
    }
    
    // 3. محاولة تسجيل الدخول
    console.log('\n3️⃣ محاولة تسجيل الدخول...')
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email: 'admin@zomiga.com',
      password: 'Admin123!@#'
    })
    
    if (loginError) {
      console.log('❌ فشل تسجيل الدخول:', loginError.message)
      
      // محاولة بكلمة مرور أخرى
      console.log('\n🔄 محاولة بكلمة مرور أخرى...')
      const { data: loginData2, error: loginError2 } = await supabase.auth.signInWithPassword({
        email: 'admin@zomiga.com',
        password: 'Ab123456'
      })
      
      if (loginError2) {
        console.log('❌ فشل تسجيل الدخول مرة أخرى:', loginError2.message)
      } else {
        console.log('✅ نجح تسجيل الدخول بكلمة المرور الثانية!')
        console.log('   User ID:', loginData2.user?.id)
        console.log('   Email:', loginData2.user?.email)
      }
    } else {
      console.log('✅ نجح تسجيل الدخول!')
      console.log('   User ID:', loginData.user?.id)
      console.log('   Email:', loginData.user?.email)
      
      // التحقق من الدور
      if (loginData.user) {
        const { data: userProfile, error: userProfileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', loginData.user.id)
          .single()
        
        if (userProfileError) {
          console.log('❌ خطأ في جلب دور المستخدم:', userProfileError.message)
        } else {
          console.log('   Role:', userProfile?.role || 'غير محدد')
          
          if (userProfile?.role === 'admin') {
            console.log('✅ المستخدم لديه صلاحيات الأدمن!')
          } else {
            console.log('❌ المستخدم ليس لديه صلاحيات الأدمن')
          }
        }
      }
    }
    
  } catch (error) {
    console.error('❌ خطأ عام:', error)
  }
}

testAdminLogin()