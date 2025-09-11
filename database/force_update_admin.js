require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('متغيرات البيئة مفقودة');
  console.log('URL:', supabaseUrl);
  console.log('Service Key exists:', !!supabaseServiceKey);
  process.exit(1);
}

// استخدام service role key للحصول على صلاحيات كاملة
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function forceUpdateAdmin() {
  try {
    console.log('استخدام Service Role Key للتحديث...');
    
    // جلب المستخدمين
    const { data: profiles, error: selectError } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: true });
      
    if (selectError) {
      console.error('خطأ في جلب المستخدمين:', selectError);
      return;
    }
    
    console.log('المستخدمين الموجودين:', profiles.length);
    
    if (profiles && profiles.length > 0) {
      const userId = profiles[0].id;
      console.log(`تحديث المستخدم: ${userId}`);
      
      // محاولة التحديث باستخدام service role
      const { data: updateData, error: updateError } = await supabase
        .from('profiles')
        .update({ role: 'admin' })
        .eq('id', userId)
        .select();
        
      if (updateError) {
        console.error('خطأ في التحديث:', updateError);
        
        // محاولة بديلة باستخدام SQL مباشر
        console.log('محاولة باستخدام SQL مباشر...');
        const { data: sqlData, error: sqlError } = await supabase
          .rpc('exec_sql', {
            sql: `UPDATE profiles SET role = 'admin' WHERE id = '${userId}';`
          });
          
        if (sqlError) {
          console.error('خطأ في SQL:', sqlError);
          
          // محاولة أخيرة باستخدام raw SQL
          console.log('محاولة أخيرة...');
          try {
            const { data: rawData, error: rawError } = await supabase
              .from('profiles')
              .update({ role: 'admin' })
              .eq('id', userId);
              
            if (rawError) {
              console.error('فشل في جميع المحاولات:', rawError);
              console.log('\n=== الحل اليدوي ===');
              console.log('يجب تحديث المستخدم يدوياً في Supabase Dashboard:');
              console.log('1. اذهب إلى: https://supabase.com/dashboard');
              console.log('2. اختر مشروعك');
              console.log('3. اذهب إلى Table Editor > profiles');
              console.log(`4. ابحث عن المستخدم بـ ID: ${userId}`);
              console.log('5. غير قيمة role من "user" إلى "admin"');
              console.log('6. احفظ التغييرات');
            } else {
              console.log('✅ تم التحديث بنجاح!');
            }
          } catch (finalError) {
            console.error('خطأ نهائي:', finalError);
          }
        } else {
          console.log('✅ تم التحديث باستخدام SQL!');
        }
      } else {
        console.log('✅ تم التحديث بنجاح!', updateData);
      }
      
      // التحقق من النتيجة
      console.log('\nالتحقق من النتيجة...');
      const { data: verifyData, error: verifyError } = await supabase
        .from('profiles')
        .select('id, role')
        .eq('id', userId);
        
      if (verifyError) {
        console.error('خطأ في التحقق:', verifyError);
      } else {
        console.log('حالة المستخدم الحالية:', verifyData);
        if (verifyData[0]?.role === 'admin') {
          console.log('\n🎉 المستخدم أصبح admin بنجاح!');
          console.log('يمكنك الآن الوصول إلى /admin');
        } else {
          console.log('\n❌ المستخدم لا يزال ليس admin');
        }
      }
    }
    
  } catch (error) {
    console.error('خطأ عام:', error);
  }
}

forceUpdateAdmin();