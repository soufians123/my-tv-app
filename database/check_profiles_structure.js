// سكريپت لفحص بنية جدول profiles

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

async function checkProfilesStructure() {
  try {
    console.log('فحص بنية جدول profiles...')
    
    // جلب جميع البيانات لمعرفة الأعمدة المتاحة
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .limit(1)
    
    if (profilesError) {
      console.error('خطأ في جلب البيانات:', profilesError)
    } else {
      console.log('البيانات المتاحة:')
      if (profiles && profiles.length > 0) {
        console.log('الأعمدة المتاحة:', Object.keys(profiles[0]))
        console.log('البيانات:', profiles[0])
      } else {
        console.log('لا توجد بيانات في الجدول')
      }
    }
    
    // فحص جداول أخرى قد تحتوي على معلومات المستخدمين
    console.log('\nفحص الجداول الأخرى...')
    
    // فحص جدول users إذا كان موجوداً
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*')
      .limit(1)
    
    if (usersError) {
      console.log('جدول users غير موجود أو لا يمكن الوصول إليه:', usersError.message)
    } else {
      console.log('جدول users موجود:')
      if (users && users.length > 0) {
        console.log('الأعمدة المتاحة:', Object.keys(users[0]))
      }
    }
    
  } catch (error) {
    console.error('خطأ عام:', error)
  }
}

// تشغيل الفحص
checkProfilesStructure()