require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkDatabaseSetup() {
  console.log('🔍 فحص إعداد قاعدة البيانات...')
  
  try {
    // Check if we can read from profiles table
    console.log('\n📋 فحص جدول profiles...')
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .limit(5)
    
    if (profilesError) {
      console.error('❌ خطأ في قراءة جدول profiles:', profilesError.message)
      console.log('💡 قد تحتاج إلى إنشاء الجدول أو تحديث الصلاحيات')
    } else {
      console.log('✅ جدول profiles يعمل بشكل صحيح')
      console.log('عدد السجلات:', profiles.length)
      if (profiles.length > 0) {
        console.log('أول سجل:', profiles[0])
      }
    }
    
    // Try to insert a test record
    console.log('\n🧪 اختبار إدراج سجل تجريبي...')
    const testId = 'test-' + Date.now()
    
    const { data: insertData, error: insertError } = await supabase
      .from('profiles')
      .insert({
        id: testId,
        username: 'test-user',
        role: 'user',
        is_active: true,
        is_verified: false
      })
      .select()
    
    if (insertError) {
      console.error('❌ خطأ في إدراج السجل:', insertError.message)
      console.log('💡 تحقق من:')
      console.log('1. صلاحيات الجدول في Supabase Dashboard')
      console.log('2. Row Level Security (RLS) policies')
      console.log('3. هيكل الجدول والأعمدة المطلوبة')
    } else {
      console.log('✅ تم إدراج السجل التجريبي بنجاح')
      
      // Clean up test record
      await supabase
        .from('profiles')
        .delete()
        .eq('id', testId)
      
      console.log('🧹 تم حذف السجل التجريبي')
    }
    
    // Check auth configuration
    console.log('\n🔐 فحص إعدادات المصادقة...')
    
    // Try to get current session
    const { data: session } = await supabase.auth.getSession()
    console.log('الجلسة الحالية:', session.session ? 'موجودة' : 'غير موجودة')
    
    // Check if we can access auth endpoints
    console.log('\n🌐 فحص الاتصال بـ Supabase...')
    console.log('URL:', supabaseUrl)
    console.log('Key (أول 20 حرف):', supabaseKey.substring(0, 20) + '...')
    
  } catch (error) {
    console.error('❌ خطأ عام في فحص قاعدة البيانات:', error.message)
  }
}

checkDatabaseSetup().catch(console.error)