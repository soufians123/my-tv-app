require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

async function makeAdmin() {
  console.log('🔧 تحديث صلاحيات المستخدم إلى admin...')
  
  try {
    // Get all users first
    console.log('\n📋 عرض جميع المستخدمين...')
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, username, full_name, role')
    
    if (profilesError) {
      console.error('❌ خطأ في قراءة المستخدمين:', profilesError.message)
      return
    }
    
    console.log('المستخدمون الحاليون:')
    profiles.forEach((profile, index) => {
      console.log(`${index + 1}. ID: ${profile.id}`)
      console.log(`   الاسم: ${profile.full_name || profile.username || 'غير محدد'}`)
      console.log(`   الدور: ${profile.role}`)
      console.log('---')
    })
    
    if (profiles.length === 0) {
      console.log('❌ لا يوجد مستخدمون في قاعدة البيانات')
      return
    }
    
    // Try to update using RPC function
    const firstUserId = profiles[0].id
    console.log(`\n🔄 محاولة تحديث المستخدم الأول (${firstUserId}) إلى admin...`)
    
    // First try direct update
    const { data: updateData, error: updateError } = await supabase
      .from('profiles')
      .update({ role: 'admin' })
      .eq('id', firstUserId)
      .select()
    
    if (updateError) {
      console.error('❌ خطأ في التحديث المباشر:', updateError.message)
      
      // Try using RPC if available
      console.log('\n🔄 محاولة استخدام RPC function...')
      const { data: rpcData, error: rpcError } = await supabase
        .rpc('update_user_role', {
          user_id: firstUserId,
          new_role: 'admin'
        })
      
      if (rpcError) {
        console.error('❌ خطأ في RPC:', rpcError.message)
        console.log('\n💡 حلول مقترحة:')
        console.log('1. تسجيل الدخول إلى Supabase Dashboard')
        console.log('2. الذهاب إلى Table Editor > profiles')
        console.log('3. تحديث عمود role للمستخدم المطلوب إلى "admin" يدوياً')
        console.log('4. أو تعطيل Row Level Security مؤقتاً للتحديث')
        console.log('\n🔗 رابط Supabase Dashboard:')
        console.log('https://supabase.com/dashboard/project/jrtctjgdkvkdrjcbbbaz')
      } else {
        console.log('✅ تم التحديث باستخدام RPC!')
      }
    } else {
      console.log('✅ تم تحديث الدور بنجاح!')
      console.log('المستخدم الآن admin:', updateData[0])
    }
    
    console.log('\n🎉 بعد التحديث، يمكنك:')
    console.log('1. تسجيل الدخول بحساب المستخدم المحدث')
    console.log('2. الوصول للوحة الإدارة على /admin')
    console.log('3. إدارة المستخدمين والألعاب')
    
  } catch (error) {
    console.error('❌ خطأ عام:', error.message)
  }
}

makeAdmin().catch(console.error)