require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ متغيرات البيئة مفقودة')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function testLogin() {
  console.log('🔍 اختبار تسجيل الدخول المباشر...')
  console.log('URL:', supabaseUrl)
  
  // First, let's check what users exist in auth.users
  console.log('\n📋 فحص المستخدمين الموجودين...')
  
  try {
    // Check profiles table
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
    
    if (profilesError) {
      console.error('❌ خطأ في قراءة جدول profiles:', profilesError.message)
    } else {
      console.log('✅ جدول profiles:')
      console.log('عدد المستخدمين:', profiles.length)
      profiles.forEach(profile => {
        console.log(`- ID: ${profile.id}`)
        console.log(`- Username: ${profile.username || 'غير محدد'}`)
        console.log(`- Role: ${profile.role || 'غير محدد'}`)
        console.log(`- Active: ${profile.is_active}`)
        console.log(`- Verified: ${profile.is_verified}`)
        console.log('---')
      })
    }
  } catch (error) {
    console.error('❌ خطأ في فحص المستخدمين:', error.message)
  }
  
  // Test login with common admin credentials
  const testCredentials = [
    { email: 'admin@example.com', password: 'admin123' },
    { email: 'admin@admin.com', password: 'admin123' },
    { email: 'admin@test.com', password: 'admin123' },
    { email: 'test@example.com', password: 'password123' }
  ]
  
  console.log('\n🔑 اختبار بيانات الدخول المختلفة...')
  
  for (const cred of testCredentials) {
    console.log(`\nاختبار: ${cred.email}`)
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cred.email,
        password: cred.password
      })
      
      if (error) {
        console.log(`❌ فشل: ${error.message}`)
      } else {
        console.log('✅ نجح تسجيل الدخول!')
        console.log('User ID:', data.user.id)
        console.log('Email:', data.user.email)
        console.log('Email Confirmed:', data.user.email_confirmed_at ? 'نعم' : 'لا')
        
        // Check user profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', data.user.id)
          .single()
        
        console.log('Role:', profile?.role || 'غير محدد')
        
        // Sign out
        await supabase.auth.signOut()
        break
      }
    } catch (err) {
      console.log(`❌ خطأ: ${err.message}`)
    }
  }
}

testLogin().catch(console.error)