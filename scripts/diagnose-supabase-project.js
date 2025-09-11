require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

async function diagnoseSupabaseProject() {
  console.log('🔍 تشخيص مشروع Supabase...')
  console.log('URL:', supabaseUrl)
  
  try {
    // Test basic connectivity
    console.log('\n🌐 اختبار الاتصال الأساسي...')
    const { data, error } = await supabase
      .from('profiles')
      .select('count', { count: 'exact', head: true })
    
    if (error) {
      console.error('❌ خطأ في الاتصال:', error.message)
    } else {
      console.log('✅ الاتصال يعمل')
      console.log('عدد السجلات في profiles:', data || 0)
    }
    
    // Check project status
    console.log('\n📊 فحص حالة المشروع...')
    
    // Try to get project info (this might fail with anon key)
    try {
      const response = await fetch(`${supabaseUrl}/rest/v1/`, {
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`
        }
      })
      
      console.log('Status Code:', response.status)
      console.log('Status Text:', response.statusText)
      
      if (response.status === 200) {
        console.log('✅ API يعمل بشكل صحيح')
      } else {
        console.log('⚠️  مشكلة في API:', response.status)
      }
    } catch (fetchError) {
      console.log('❌ خطأ في طلب API:', fetchError.message)
    }
    
    // Check auth endpoint
    console.log('\n🔐 فحص نقطة المصادقة...')
    try {
      const authResponse = await fetch(`${supabaseUrl}/auth/v1/settings`, {
        headers: {
          'apikey': supabaseKey
        }
      })
      
      if (authResponse.ok) {
        const authSettings = await authResponse.json()
        console.log('✅ نقطة المصادقة تعمل')
        console.log('إعدادات المصادقة:')
        console.log('- External providers:', Object.keys(authSettings.external || {}).length)
        console.log('- Email enabled:', authSettings.email_enabled !== false)
        console.log('- Phone enabled:', authSettings.phone_enabled === true)
      } else {
        console.log('❌ مشكلة في نقطة المصادقة:', authResponse.status)
      }
    } catch (authError) {
      console.log('❌ خطأ في فحص المصادقة:', authError.message)
    }
    
    // Test database operations
    console.log('\n💾 اختبار عمليات قاعدة البيانات...')
    
    // Test SELECT
    const { data: selectData, error: selectError } = await supabase
      .from('profiles')
      .select('id, role')
      .limit(1)
    
    if (selectError) {
      console.log('❌ خطأ في SELECT:', selectError.message)
    } else {
      console.log('✅ SELECT يعمل')
    }
    
    // Test INSERT (will likely fail, but let's see the error)
    const testId = crypto.randomUUID()
    const { error: insertError } = await supabase
      .from('profiles')
      .insert({
        id: testId,
        username: 'test-user-' + Date.now(),
        role: 'user',
        is_active: true,
        is_verified: false
      })
    
    if (insertError) {
      console.log('❌ خطأ في INSERT:', insertError.message)
      console.log('تفاصيل الخطأ:', insertError)
    } else {
      console.log('✅ INSERT يعمل')
      // Clean up
      await supabase.from('profiles').delete().eq('id', testId)
    }
    
    console.log('\n💡 التوصيات:')
    console.log('1. تحقق من حالة مشروع Supabase في Dashboard')
    console.log('2. تأكد من أن المشروع لم يتم إيقافه بسبب تجاوز الحدود')
    console.log('3. تحقق من إعدادات RLS في جدول profiles')
    console.log('4. جرب إنشاء مشروع Supabase جديد كحل أخير')
    
  } catch (error) {
    console.error('❌ خطأ عام في التشخيص:', error.message)
  }
}

diagnoseSupabaseProject().catch(console.error)