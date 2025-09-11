require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

async function fixAdminAccount() {
  console.log('🔧 إصلاح حساب المدير...')
  
  try {
    // Step 1: Delete the orphaned profile record
    console.log('\n🗑️  حذف السجل المعطل...')
    const { error: deleteError } = await supabase
      .from('profiles')
      .delete()
      .eq('id', '9b122617-9cab-4d93-bf68-bbc3f9e79472')
    
    if (deleteError) {
      console.error('❌ خطأ في حذف السجل:', deleteError.message)
    } else {
      console.log('✅ تم حذف السجل المعطل')
    }
    
    // Step 2: Create a new admin account
    console.log('\n👤 إنشاء حساب مدير جديد...')
    const adminEmail = 'admin@example.com'
    const adminPassword = 'admin123456'
    
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: adminEmail,
      password: adminPassword,
      options: {
        data: {
          role: 'admin'
        }
      }
    })
    
    if (signUpError) {
      console.error('❌ خطأ في إنشاء الحساب:', signUpError.message)
      
      // If user already exists in auth, try to sign in
      if (signUpError.message.includes('already registered')) {
        console.log('\n🔑 الحساب موجود في المصادقة، محاولة تسجيل الدخول...')
        
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email: adminEmail,
          password: adminPassword
        })
        
        if (signInError) {
          console.error('❌ فشل تسجيل الدخول:', signInError.message)
          console.log('\n💡 قد تحتاج إلى:')
          console.log('1. إعادة تعيين كلمة المرور من Supabase Dashboard')
          console.log('2. تأكيد البريد الإلكتروني يدوياً')
          return
        } else {
          console.log('✅ تم تسجيل الدخول بنجاح!')
          await createProfile(signInData.user.id, signInData.user.email)
        }
      }
    } else {
      console.log('✅ تم إنشاء الحساب!')
      
      if (signUpData.user) {
        console.log('User ID:', signUpData.user.id)
        console.log('Email:', signUpData.user.email)
        console.log('Email Confirmed:', signUpData.user.email_confirmed_at ? 'نعم' : 'لا')
        
        // Create profile for the new user
        await createProfile(signUpData.user.id, signUpData.user.email)
        
        if (!signUpData.user.email_confirmed_at) {
          console.log('\n⚠️  تحتاج إلى تأكيد البريد الإلكتروني')
          console.log('💡 تحقق من بريدك الإلكتروني أو قم بتأكيده من Supabase Dashboard')
        }
      }
    }
    
  } catch (error) {
    console.error('❌ خطأ عام:', error.message)
  }
}

async function createProfile(userId, email) {
  console.log('\n📝 إنشاء الملف الشخصي...')
  
  try {
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: userId, // Use the UUID from auth.users
        username: 'admin',
        role: 'admin',
        is_active: true,
        is_verified: true
      })
      .select()
    
    if (profileError) {
      console.error('❌ خطأ في إنشاء الملف الشخصي:', profileError.message)
    } else {
      console.log('✅ تم إنشاء الملف الشخصي بنجاح')
      console.log('Profile ID:', userId)
    }
  } catch (error) {
    console.error('❌ خطأ في معالجة الملف الشخصي:', error.message)
  }
}

fixAdminAccount().then(() => {
  console.log('\n🎉 تم إصلاح حساب المدير!')
  console.log('📧 البريد الإلكتروني: admin@example.com')
  console.log('🔒 كلمة المرور: admin123456')
  console.log('\n💡 الآن يمكنك تجربة تسجيل الدخول')
}).catch(console.error)