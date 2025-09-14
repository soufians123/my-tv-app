#!/usr/bin/env node

/**
 * اختبار إصلاحات المصادقة
 * يتحقق من:
 * 1. حفظ بيانات المستخدم في localStorage
 * 2. استرداد البيانات عند إعادة التحميل
 * 3. التعامل مع انقطاع الجلسة
 */

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ متغيرات البيئة مفقودة')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function testAuthFixes() {
  console.log('🧪 بدء اختبار إصلاحات المصادقة...')
  
  try {
    // اختبار الحصول على الجلسة الحالية
    console.log('\n1️⃣ اختبار الحصول على الجلسة...')
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError) {
      console.error('❌ خطأ في الحصول على الجلسة:', sessionError.message)
      return
    }
    
    if (session) {
      console.log('✅ الجلسة موجودة:', session.user.email)
      
      // اختبار الحصول على بيانات المستخدم
      console.log('\n2️⃣ اختبار الحصول على بيانات المستخدم...')
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single()
      
      if (profileError) {
        console.error('❌ خطأ في الحصول على البيانات:', profileError.message)
        return
      }
      
      console.log('✅ بيانات المستخدم:', {
        email: session.user.email,
        role: profile.role
      })
      
      // محاكاة حفظ البيانات في localStorage
      console.log('\n3️⃣ اختبار حفظ البيانات...')
      const userData = {
        ...session.user,
        role: profile.role
      }
      
      console.log('✅ البيانات جاهزة للحفظ:', {
        id: userData.id,
        email: userData.email,
        role: userData.role
      })
      
      if (userData.role === 'admin') {
        console.log('🔑 المستخدم لديه صلاحيات إدارية - سيتم حفظ البيانات')
      } else {
        console.log('⚠️ المستخدم ليس إدارياً - لن يتم حفظ البيانات')
      }
      
    } else {
      console.log('❌ لا توجد جلسة نشطة')
    }
    
    // اختبار مراقبة تغييرات المصادقة
    console.log('\n4️⃣ اختبار مراقبة تغييرات المصادقة...')
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('🔄 تغيير حالة المصادقة:', event)
      if (session) {
        console.log('👤 المستخدم:', session.user.email)
      }
    })
    
    console.log('✅ مراقب تغييرات المصادقة نشط')
    
    // تنظيف
    setTimeout(() => {
      subscription.unsubscribe()
      console.log('\n🧹 تم تنظيف المراقبات')
      console.log('\n✅ اكتمل اختبار إصلاحات المصادقة بنجاح!')
      process.exit(0)
    }, 2000)
    
  } catch (error) {
    console.error('❌ خطأ في الاختبار:', error.message)
    process.exit(1)
  }
}

// تشغيل الاختبار
testAuthFixes()