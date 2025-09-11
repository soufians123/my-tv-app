// سكريبت لإنشاء المستخدم الإداري باستخدام Supabase Auth API
// يجب تشغيل هذا السكريبت من terminal باستخدام: node database/create_admin_via_api.js

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ متغيرات البيئة مفقودة. تأكد من وجود NEXT_PUBLIC_SUPABASE_URL و SUPABASE_SERVICE_ROLE_KEY في .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function createAdminUser() {
  try {
    console.log('🔄 جاري إنشاء المستخدم الإداري...');
    
    // إنشاء المستخدم في auth.users
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: 'admin@zomiga.com',
      password: 'Ab123456',
      email_confirm: true,
      user_metadata: {
        role: 'admin',
        name: 'مدير النظام'
      }
    });

    if (authError) {
      if (authError.message.includes('already registered')) {
        console.log('⚠️  المستخدم موجود بالفعل، جاري تحديث البيانات...');
        
        // البحث عن المستخدم الموجود
        const { data: existingUsers } = await supabase.auth.admin.listUsers();
        const existingUser = existingUsers.users.find(u => u.email === 'admin@zomiga.com');
        
        if (existingUser) {
          // تحديث كلمة المرور
          await supabase.auth.admin.updateUserById(existingUser.id, {
            password: 'Ab123456',
            user_metadata: {
              role: 'admin',
              name: 'مدير النظام'
            }
          });
          
          console.log('✅ تم تحديث بيانات المستخدم الإداري بنجاح');
          await createProfile(existingUser.id);
          return;
        }
      } else {
        throw authError;
      }
    }

    if (authData?.user) {
      console.log('✅ تم إنشاء المستخدم الإداري بنجاح');
      await createProfile(authData.user.id);
    }

  } catch (error) {
    console.error('❌ خطأ في إنشاء المستخدم الإداري:', error.message);
    process.exit(1);
  }
}

async function createProfile(userId) {
  try {
    // إنشاء ملف التعريف
    const { error: profileError } = await supabase
      .from('profiles')
      .upsert({
        id: userId,
        username: 'admin',
        full_name: 'مدير النظام',
        bio: 'مدير النظام الرئيسي',
        is_verified: true,
        is_active: true
      });

    if (profileError && !profileError.message.includes('duplicate')) {
      throw profileError;
    }

    // إنشاء تفضيلات المستخدم
    const { error: prefsError } = await supabase
      .from('user_preferences')
      .upsert({
        user_id: userId,
        language: 'ar',
        theme: 'light',
        notifications_enabled: true,
        email_notifications: true,
        push_notifications: true
      });

    if (prefsError && !prefsError.message.includes('duplicate')) {
      throw prefsError;
    }

    // إنشاء نقاط المستخدم
    const { error: pointsError } = await supabase
      .from('user_points')
      .upsert({
        user_id: userId,
        total_points: 1000,
        available_points: 1000
      });

    if (pointsError && !pointsError.message.includes('duplicate')) {
      throw pointsError;
    }

    console.log('✅ تم إنشاء جميع بيانات المستخدم الإداري بنجاح');
    console.log('📧 البريد الإلكتروني: admin@zomiga.com');
    console.log('🔑 كلمة المرور: Ab123456');
    console.log('🎉 يمكنك الآن تسجيل الدخول!');
    
  } catch (error) {
    console.error('❌ خطأ في إنشاء بيانات المستخدم:', error.message);
  }
}

// تشغيل السكريبت
createAdminUser();