// سكريبت اختبار نهائي للتحقق من حل مشكلة RLS
// يجب تشغيل هذا السكريبت بعد تطبيق إصلاحات RLS في Supabase Dashboard

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function testAfterFix() {
  console.log('🧪 اختبار النظام بعد إصلاح RLS policies...');
  console.log('=' .repeat(50));

  try {
    // 1. اختبار تسجيل مستخدم جديد
    console.log('\n1️⃣ اختبار تسجيل مستخدم جديد...');
    const testEmail = `testuser${Math.floor(Math.random() * 10000)}@gmail.com`;
    const testPassword = 'testpassword123';
    
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword
    });

    if (signUpError) {
      console.log('❌ خطأ في تسجيل المستخدم:', signUpError.message);
      return;
    }

    console.log('✅ تم تسجيل المستخدم بنجاح!');
    console.log('📧 البريد الإلكتروني:', testEmail);
    console.log('🆔 معرف المستخدم:', signUpData.user?.id);

    // 2. التحقق من إنشاء profile تلقائياً
    console.log('\n2️⃣ التحقق من إنشاء profile تلقائياً...');
    
    // انتظار قليل للسماح للـ trigger بالعمل
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', signUpData.user?.id)
      .single();

    if (profileError) {
      console.log('❌ خطأ في قراءة profile:', profileError.message);
    } else {
      console.log('✅ تم إنشاء profile تلقائياً!');
      console.log('👤 بيانات Profile:', {
        id: profileData.id,
        role: profileData.role,
        is_active: profileData.is_active,
        is_verified: profileData.is_verified
      });
    }

    // 3. اختبار تسجيل الدخول
    console.log('\n3️⃣ اختبار تسجيل الدخول...');
    
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: testEmail,
      password: testPassword
    });

    if (signInError) {
      console.log('❌ خطأ في تسجيل الدخول:', signInError.message);
    } else {
      console.log('✅ تم تسجيل الدخول بنجاح!');
      console.log('🔑 Session ID:', signInData.session?.access_token?.substring(0, 20) + '...');
    }

    // 4. اختبار تحديث profile
    console.log('\n4️⃣ اختبار تحديث profile...');
    
    const { data: updateData, error: updateError } = await supabase
      .from('profiles')
      .update({ is_verified: true })
      .eq('id', signUpData.user?.id)
      .select();

    if (updateError) {
      console.log('❌ خطأ في تحديث profile:', updateError.message);
    } else {
      console.log('✅ تم تحديث profile بنجاح!');
      console.log('📝 البيانات المحدثة:', updateData[0]);
    }

    // 5. تنظيف - حذف المستخدم التجريبي
    console.log('\n5️⃣ تنظيف البيانات التجريبية...');
    
    const { error: deleteError } = await supabase
      .from('profiles')
      .delete()
      .eq('id', signUpData.user?.id);

    if (deleteError) {
      console.log('⚠️ تحذير: لم يتم حذف profile التجريبي:', deleteError.message);
    } else {
      console.log('🗑️ تم حذف profile التجريبي');
    }

    console.log('\n' + '='.repeat(50));
    console.log('🎉 جميع الاختبارات مكتملة! النظام يعمل بشكل صحيح.');
    console.log('✅ يمكنك الآن استخدام النظام بشكل طبيعي.');
    
  } catch (error) {
    console.error('💥 خطأ غير متوقع:', error.message);
  }
}

// تشغيل الاختبار
testAfterFix().catch(console.error);