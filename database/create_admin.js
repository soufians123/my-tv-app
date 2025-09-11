// سكريپت لإنشاء مستخدم مدير

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

// إنشاء عميل Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('متغيرات البيئة مفقودة!')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function createAdmin() {
  try {
    console.log('إنشاء مستخدم مدير...')
    
    // تحديث المستخدم الموجود ليصبح مدير
    const { data: updateData, error: updateError } = await supabase
      .from('profiles')
      .update({
        email: 'admin@example.com',
        user_type: 'admin',
        full_name: 'Administrator'
      })
      .eq('id', '9b122617-9cab-4d93-bf68-bbc3f9e79472')
      .select()
    
    if (updateError) {
      console.error('خطأ في تحديث المستخدم:', updateError)
      
      // إذا فشل التحديث، جرب إنشاء مستخدم جديد
      console.log('محاولة إنشاء مستخدم جديد...')
      const { data: insertData, error: insertError } = await supabase
        .from('profiles')
        .insert({
          id: '550e8400-e29b-41d4-a716-446655440000',
          email: 'admin@example.com',
          user_type: 'admin',
          full_name: 'Administrator'
        })
        .select()
      
      if (insertError) {
        console.error('خطأ في إنشاء المستخدم:', insertError)
      } else {
        console.log('تم إنشاء المستخدم المدير بنجاح:', insertData)
      }
    } else {
      console.log('تم تحديث المستخدم ليصبح مدير بنجاح:', updateData)
    }
    
    // التحقق من النتيجة
    const { data: profiles, error: checkError } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_type', 'admin')
    
    if (checkError) {
      console.error('خطأ في التحقق:', checkError)
    } else {
      console.log('\nالمديرين الحاليين:')
      profiles?.forEach(profile => {
        console.log(`- ${profile.email} - ${profile.full_name} - ID: ${profile.id}`)
      })
    }
    
  } catch (error) {
    console.error('خطأ عام:', error)
  }
}

// تشغيل الإنشاء
createAdmin()