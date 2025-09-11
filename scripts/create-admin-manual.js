require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

async function createAdminAccount() {
  console.log('🔧 إنشاء حساب المدير...')
  
  const adminEmail = 'admin@example.com'
  const adminPassword = 'admin123456'
  
  try {
    // Try to sign up a new user
    console.log('📝 محاولة إنشاء حساب جديد...')
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
      
      // If user already exists, try to sign in
      if (signUpError.message.includes('already registered')) {
        console.log('\n🔑 المستخدم موجود، محاولة تسجيل الدخول...')
        
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email: adminEmail,
          password: adminPassword
        })
        
        if (signInError) {
          console.error('❌ فشل تسجيل الدخول:', signInError.message)
          console.log('\n💡 الحلول المقترحة:')
          console.log('1. تأكد من أن البريد الإلكتروني مؤكد في Supabase Dashboard')
          console.log('2. جرب إعادة تعيين كلمة المرور')
          console.log('3. تحقق من إعدادات المصادقة في Supabase')
        } else {
          console.log('✅ تم تسجيل الدخول بنجاح!')
          console.log('User ID:', signInData.user.id)
          
          // Update or create profile
          await updateProfile(signInData.user.id)
        }
      }
    } else {
      console.log('✅ تم إنشاء الحساب!')
      console.log('User ID:', signUpData.user?.id)
      
      if (signUpData.user) {
        await updateProfile(signUpData.user.id)
      }
      
      console.log('\n⚠️  تحقق من بريدك الإلكتروني لتأكيد الحساب')
    }
    
  } catch (error) {
    console.error('❌ خطأ عام:', error.message)
  }
}

async function updateProfile(userId) {
  console.log('\n📝 تحديث الملف الشخصي...')
  
  try {
    // Check if profile exists
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
    
    if (existingProfile) {
      // Update existing profile
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          role: 'admin',
          username: 'admin',
          is_active: true,
          is_verified: true
        })
        .eq('id', userId)
      
      if (updateError) {
        console.error('❌ خطأ في تحديث الملف الشخصي:', updateError.message)
      } else {
        console.log('✅ تم تحديث الملف الشخصي')
      }
    } else {
      // Create new profile
      const { error: insertError } = await supabase
        .from('profiles')
        .insert({
          id: userId,
          role: 'admin',
          username: 'admin',
          is_active: true,
          is_verified: true
        })
      
      if (insertError) {
        console.error('❌ خطأ في إنشاء الملف الشخصي:', insertError.message)
      } else {
        console.log('✅ تم إنشاء الملف الشخصي')
      }
    }
  } catch (error) {
    console.error('❌ خطأ في معالجة الملف الشخصي:', error.message)
  }
}

createAdminAccount().then(() => {
  console.log('\n🎉 انتهى الإعداد!')
  console.log('📧 البريد الإلكتروني: admin@example.com')
  console.log('🔒 كلمة المرور: admin123456')
  console.log('\n💡 إذا لم يعمل تسجيل الدخول، تحقق من:')
  console.log('1. تأكيد البريد الإلكتروني في Supabase Dashboard')
  console.log('2. إعدادات المصادقة في Supabase')
}).catch(console.error)