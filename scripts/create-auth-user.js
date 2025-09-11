require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ متغيرات البيئة مفقودة')
  console.log('URL:', supabaseUrl ? 'موجود' : 'مفقود')
  console.log('Service Key:', supabaseServiceKey ? 'موجود' : 'مفقود')
  process.exit(1)
}

// Create admin client with service role key
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function createAuthUser() {
  console.log('🔧 إنشاء مستخدم المصادقة...')
  
  try {
    // First, get the existing profile
    const { data: existingProfile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('role', 'admin')
      .single()
    
    if (profileError) {
      console.error('❌ خطأ في قراءة الملف الشخصي:', profileError.message)
      return
    }
    
    console.log('📋 الملف الشخصي الموجود:')
    console.log('ID:', existingProfile.id)
    console.log('Role:', existingProfile.role)
    
    // Create user in auth.users with the same ID
    const adminEmail = 'admin@example.com'
    const adminPassword = 'admin123456'
    
    console.log('\n🔑 إنشاء مستخدم المصادقة...')
    
    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
      id: existingProfile.id, // Use the same ID from profiles
      email: adminEmail,
      password: adminPassword,
      email_confirm: true, // Auto-confirm email
      user_metadata: {
        role: 'admin'
      }
    })
    
    if (authError) {
      console.error('❌ خطأ في إنشاء المستخدم:', authError.message)
      
      // If user already exists, try to update
      if (authError.message.includes('already registered')) {
        console.log('\n🔄 المستخدم موجود، محاولة التحديث...')
        
        const { data: updateData, error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
          existingProfile.id,
          {
            email: adminEmail,
            password: adminPassword,
            email_confirm: true,
            user_metadata: {
              role: 'admin'
            }
          }
        )
        
        if (updateError) {
          console.error('❌ خطأ في تحديث المستخدم:', updateError.message)
        } else {
          console.log('✅ تم تحديث المستخدم بنجاح!')
          console.log('Email:', updateData.user.email)
        }
      }
    } else {
      console.log('✅ تم إنشاء المستخدم بنجاح!')
      console.log('ID:', authUser.user.id)
      console.log('Email:', authUser.user.email)
    }
    
    // Update profile to mark as verified
    const { error: updateProfileError } = await supabaseAdmin
      .from('profiles')
      .update({ 
        is_verified: true,
        username: 'admin'
      })
      .eq('id', existingProfile.id)
    
    if (updateProfileError) {
      console.error('❌ خطأ في تحديث الملف الشخصي:', updateProfileError.message)
    } else {
      console.log('✅ تم تحديث الملف الشخصي')
    }
    
    console.log('\n🎉 تم الإعداد بنجاح!')
    console.log('📧 البريد الإلكتروني:', adminEmail)
    console.log('🔒 كلمة المرور:', adminPassword)
    console.log('\n💡 يمكنك الآن تسجيل الدخول باستخدام هذه البيانات')
    
  } catch (error) {
    console.error('❌ خطأ عام:', error.message)
  }
}

createAuthUser().catch(console.error)