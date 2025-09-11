const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

console.log('🔍 اختبار اتصال Supabase...')
console.log('URL:', supabaseUrl)
console.log('Anon Key:', supabaseAnonKey ? 'موجود ✅' : 'غير موجود ❌')
console.log('Service Key:', supabaseServiceKey ? 'موجود ✅' : 'غير موجود ❌')

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ متغيرات البيئة مفقودة!')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

async function testConnection() {
  try {
    console.log('\n📡 اختبار الاتصال الأساسي...')
    
    // Test basic connection
    const { data, error } = await supabase.from('profiles').select('count', { count: 'exact', head: true })
    
    if (error) {
      console.error('❌ خطأ في الاتصال:', error.message)
      return false
    }
    
    console.log('✅ الاتصال بقاعدة البيانات نجح')
    console.log('📊 عدد المستخدمين في جدول profiles:', data || 0)
    
    return true
  } catch (error) {
    console.error('❌ خطأ في اختبار الاتصال:', error.message)
    return false
  }
}

async function testAuth() {
  try {
    console.log('\n🔐 اختبار نظام المصادقة...')
    
    // Test auth service
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error && error.message !== 'Invalid JWT') {
      console.error('❌ خطأ في نظام المصادقة:', error.message)
      return false
    }
    
    console.log('✅ نظام المصادقة يعمل بشكل صحيح')
    console.log('👤 المستخدم الحالي:', user ? user.email : 'غير مسجل دخول')
    
    return true
  } catch (error) {
    console.error('❌ خطأ في اختبار المصادقة:', error.message)
    return false
  }
}

async function checkProfiles() {
  try {
    console.log('\n👥 فحص جدول المستخدمين...')
    
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('id, email, role')
      .limit(5)
    
    if (error) {
      console.error('❌ خطأ في قراءة جدول profiles:', error.message)
      return false
    }
    
    console.log('✅ جدول profiles موجود ويعمل')
    console.log('📋 المستخدمين الموجودين:')
    
    if (profiles && profiles.length > 0) {
      profiles.forEach((profile, index) => {
        console.log(`  ${index + 1}. ${profile.email || profile.id} - الدور: ${profile.role || 'user'}`)
      })
    } else {
      console.log('  📭 لا يوجد مستخدمين في قاعدة البيانات')
    }
    
    // Check for admin user
    const { data: adminUser, error: adminError } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'admin')
      .single()
    
    if (adminError && adminError.code !== 'PGRST116') {
      console.error('❌ خطأ في البحث عن المدير:', adminError.message)
    } else if (adminUser) {
      console.log('👑 تم العثور على حساب المدير:', adminUser.email || adminUser.id)
    } else {
      console.log('⚠️  لم يتم العثور على حساب المدير')
    }
    
    return true
  } catch (error) {
    console.error('❌ خطأ في فحص جدول profiles:', error.message)
    return false
  }
}

async function testLogin() {
  try {
    console.log('\n🔑 اختبار تسجيل الدخول مع بيانات المدير الافتراضي...')
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email: 'admin@zomiga.com',
      password: 'Admin123!@#'
    })
    
    if (error) {
      console.error('❌ فشل تسجيل الدخول:', error.message)
      
      if (error.message.includes('Invalid login credentials')) {
        console.log('💡 السبب المحتمل: المستخدم غير موجود أو كلمة المرور خاطئة')
      } else if (error.message.includes('Email not confirmed')) {
        console.log('💡 السبب المحتمل: البريد الإلكتروني غير مؤكد')
      }
      
      return false
    }
    
    console.log('✅ تم تسجيل الدخول بنجاح!')
    console.log('👤 بيانات المستخدم:', data.user.email)
    
    // Sign out after test
    await supabase.auth.signOut()
    console.log('🚪 تم تسجيل الخروج')
    
    return true
  } catch (error) {
    console.error('❌ خطأ في اختبار تسجيل الدخول:', error.message)
    return false
  }
}

async function main() {
  console.log('🚀 بدء فحص نظام تسجيل الدخول...\n')
  
  const connectionOk = await testConnection()
  const authOk = await testAuth()
  const profilesOk = await checkProfiles()
  const loginOk = await testLogin()
  
  console.log('\n📊 ملخص النتائج:')
  console.log('🔗 الاتصال بقاعدة البيانات:', connectionOk ? '✅ يعمل' : '❌ لا يعمل')
  console.log('🔐 نظام المصادقة:', authOk ? '✅ يعمل' : '❌ لا يعمل')
  console.log('👥 جدول المستخدمين:', profilesOk ? '✅ يعمل' : '❌ لا يعمل')
  console.log('🔑 تسجيل الدخول:', loginOk ? '✅ يعمل' : '❌ لا يعمل')
  
  if (connectionOk && authOk && profilesOk && loginOk) {
    console.log('\n🎉 جميع الاختبارات نجحت! النظام يعمل بشكل صحيح.')
  } else {
    console.log('\n⚠️  يوجد مشاكل تحتاج إلى إصلاح.')
    
    if (!loginOk) {
      console.log('\n💡 لإصلاح مشكلة تسجيل الدخول:')
      console.log('1. تأكد من إنشاء حساب المدير في Supabase Dashboard')
      console.log('2. تأكد من تأكيد البريد الإلكتروني')
      console.log('3. تأكد من إضافة الدور "admin" في جدول profiles')
    }
  }
}

main().catch(console.error)