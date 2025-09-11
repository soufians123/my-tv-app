const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ متغيرات البيئة مفقودة')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function fixAdminRole() {
  console.log('🔧 إصلاح دور المستخدم الإداري...')
  
  try {
    // 1. البحث عن المستخدم بالبريد الإلكتروني
    console.log('\n1️⃣ البحث عن المستخدم...')
    
    // تسجيل الدخول أولاً للحصول على معرف المستخدم
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email: 'admin@zomiga.com',
      password: 'Admin123!@#'
    })
    
    if (loginError) {
      console.log('❌ فشل تسجيل الدخول:', loginError.message)
      return
    }
    
    const userId = loginData.user.id
    console.log('✅ تم العثور على المستخدم:', userId)
    
    // 2. التحقق من الملف الشخصي الحالي
    console.log('\n2️⃣ التحقق من الملف الشخصي الحالي...')
    const { data: currentProfile, error: fetchError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
    
    if (fetchError) {
      console.log('❌ خطأ في جلب الملف الشخصي:', fetchError.message)
      
      // إنشاء ملف شخصي جديد إذا لم يكن موجوداً
      console.log('\n3️⃣ إنشاء ملف شخصي جديد...')
      const { data: newProfile, error: insertError } = await supabase
        .from('profiles')
        .insert({
          id: userId,
          username: 'admin',
          full_name: 'مدير النظام',
          bio: 'مدير النظام الرئيسي',
          is_verified: true,
          is_active: true,
          role: 'admin'
        })
        .select()
      
      if (insertError) {
        console.log('❌ فشل إنشاء الملف الشخصي:', insertError.message)
      } else {
        console.log('✅ تم إنشاء الملف الشخصي بنجاح!')
        console.log('   الدور الجديد: admin')
      }
    } else {
      console.log('✅ الملف الشخصي موجود:')
      console.log('   الدور الحالي:', currentProfile.role)
      
      if (currentProfile.role !== 'admin') {
        // تحديث الدور إلى admin
        console.log('\n3️⃣ تحديث الدور إلى admin...')
        const { data: updatedProfile, error: updateError } = await supabase
          .from('profiles')
          .update({ 
            role: 'admin',
            username: 'admin',
            full_name: 'مدير النظام',
            bio: 'مدير النظام الرئيسي',
            is_verified: true,
            is_active: true
          })
          .eq('id', userId)
          .select()
        
        if (updateError) {
          console.log('❌ فشل تحديث الدور:', updateError.message)
        } else {
          console.log('✅ تم تحديث الدور بنجاح!')
          console.log('   الدور الجديد: admin')
        }
      } else {
        console.log('✅ المستخدم لديه دور admin بالفعل')
      }
    }
    
    // 4. التحقق النهائي
    console.log('\n4️⃣ التحقق النهائي...')
    const { data: finalProfile, error: finalError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
    
    if (finalError) {
      console.log('❌ خطأ في التحقق النهائي:', finalError.message)
    } else {
      console.log('✅ الملف الشخصي النهائي:')
      console.log('   ID:', finalProfile.id)
      console.log('   Username:', finalProfile.username)
      console.log('   Full Name:', finalProfile.full_name)
      console.log('   Role:', finalProfile.role)
      console.log('   Active:', finalProfile.is_active)
      console.log('   Verified:', finalProfile.is_verified)
      
      if (finalProfile.role === 'admin') {
        console.log('\n🎉 تم إصلاح المشكلة بنجاح! يمكنك الآن الوصول إلى /admin')
      } else {
        console.log('\n❌ لم يتم إصلاح المشكلة')
      }
    }
    
  } catch (error) {
    console.error('❌ خطأ عام:', error)
  }
}

fixAdminRole()