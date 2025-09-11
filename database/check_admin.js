// سكريپت للتحقق من وجود مستخدم مدير

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

async function checkAdmin() {
  try {
    console.log('فحص المستخدمين المديرين...')
    
    // فحص جدول profiles
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
    
    if (profilesError) {
      console.error('خطأ في جلب الملفات الشخصية:', profilesError)
    } else {
      console.log(`عدد الملفات الشخصية: ${profiles?.length || 0}`)
      profiles?.forEach(profile => {
        console.log(`- ${profile.email} - نوع: ${profile.user_type} - ID: ${profile.id}`)
      })
      
      const admins = profiles?.filter(p => p.user_type === 'admin')
      console.log(`\nعدد المديرين: ${admins?.length || 0}`)
    }
    
  } catch (error) {
    console.error('خطأ عام:', error)
  }
}

// تشغيل الفحص
checkAdmin()