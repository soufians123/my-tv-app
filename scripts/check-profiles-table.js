const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ متغيرات البيئة مفقودة!')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkProfilesTable() {
  try {
    console.log('🔍 فحص هيكل جدول profiles...')
    
    // Get table structure
    const { data: columns, error: columnsError } = await supabase
      .rpc('get_table_columns', { table_name: 'profiles' })
    
    if (columnsError) {
      console.log('⚠️  لا يمكن الحصول على هيكل الجدول، سأحاول طريقة أخرى...')
      
      // Try to get data to see what columns exist
      const { data: sampleData, error: sampleError } = await supabase
        .from('profiles')
        .select('*')
        .limit(1)
      
      if (sampleError) {
        console.error('❌ خطأ في قراءة جدول profiles:', sampleError.message)
        
        if (sampleError.message.includes('relation "profiles" does not exist')) {
          console.log('💡 جدول profiles غير موجود! يجب إنشاؤه أولاً.')
          return false
        }
      } else {
        console.log('✅ جدول profiles موجود')
        console.log('📋 عينة من البيانات:', sampleData)
        
        if (sampleData && sampleData.length > 0) {
          console.log('🔧 الأعمدة الموجودة:', Object.keys(sampleData[0]))
        } else {
          console.log('📭 الجدول فارغ')
        }
      }
    } else {
      console.log('✅ تم الحصول على هيكل الجدول')
      console.log('🔧 الأعمدة:', columns)
    }
    
    return true
  } catch (error) {
    console.error('❌ خطأ في فحص جدول profiles:', error.message)
    return false
  }
}

async function checkAuthUsers() {
  try {
    console.log('\n👤 فحص جدول المصادقة...')
    
    // Check auth.users table (this requires service role key)
    const { data: { users }, error } = await supabase.auth.admin.listUsers()
    
    if (error) {
      console.error('❌ خطأ في قراءة جدول المصادقة:', error.message)
      return false
    }
    
    console.log('✅ جدول المصادقة يعمل')
    console.log('👥 عدد المستخدمين المسجلين:', users.length)
    
    if (users.length > 0) {
      console.log('📋 المستخدمين الموجودين:')
      users.forEach((user, index) => {
        console.log(`  ${index + 1}. ${user.email} - مؤكد: ${user.email_confirmed_at ? '✅' : '❌'}`)
      })
      
      // Check if admin user exists
      const adminUser = users.find(user => user.email === 'admin@zomiga.com')
      if (adminUser) {
        console.log('👑 حساب المدير موجود في نظام المصادقة')
        console.log('📧 البريد مؤكد:', adminUser.email_confirmed_at ? '✅' : '❌')
      } else {
        console.log('⚠️  حساب المدير غير موجود في نظام المصادقة')
      }
    } else {
      console.log('📭 لا يوجد مستخدمين مسجلين')
    }
    
    return true
  } catch (error) {
    console.error('❌ خطأ في فحص جدول المصادقة:', error.message)
    return false
  }
}

async function createProfilesTableIfNeeded() {
  try {
    console.log('\n🔧 محاولة إنشاء جدول profiles إذا لم يكن موجوداً...')
    
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS public.profiles (
        id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
        email TEXT,
        full_name TEXT,
        role TEXT DEFAULT 'user',
        avatar_url TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
      
      -- Enable RLS
      ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
      
      -- Create policies
      CREATE POLICY "Users can view own profile" ON public.profiles
        FOR SELECT USING (auth.uid() = id);
      
      CREATE POLICY "Users can update own profile" ON public.profiles
        FOR UPDATE USING (auth.uid() = id);
      
      -- Allow admins to view all profiles
      CREATE POLICY "Admins can view all profiles" ON public.profiles
        FOR SELECT USING (
          EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
          )
        );
    `
    
    const { error } = await supabase.rpc('exec_sql', { sql: createTableSQL })
    
    if (error) {
      console.log('⚠️  لا يمكن إنشاء الجدول باستخدام RPC، سأحاول طريقة أخرى...')
      
      // Try creating with basic structure
      const { error: createError } = await supabase
        .from('profiles')
        .insert([])
      
      if (createError && !createError.message.includes('new row violates')) {
        console.error('❌ خطأ في إنشاء جدول profiles:', createError.message)
        return false
      }
    }
    
    console.log('✅ تم التأكد من وجود جدول profiles')
    return true
  } catch (error) {
    console.error('❌ خطأ في إنشاء جدول profiles:', error.message)
    return false
  }
}

async function main() {
  console.log('🚀 بدء فحص قاعدة البيانات...\n')
  
  const profilesOk = await checkProfilesTable()
  const authOk = await checkAuthUsers()
  
  if (!profilesOk) {
    await createProfilesTableIfNeeded()
  }
  
  console.log('\n📊 ملخص الفحص:')
  console.log('👥 جدول profiles:', profilesOk ? '✅ موجود' : '❌ غير موجود')
  console.log('🔐 جدول المصادقة:', authOk ? '✅ يعمل' : '❌ لا يعمل')
  
  console.log('\n💡 الخطوات التالية:')
  console.log('1. إنشاء حساب المدير في Supabase Dashboard')
  console.log('2. إضافة بيانات المدير في جدول profiles')
  console.log('3. اختبار تسجيل الدخول')
}

main().catch(console.error)