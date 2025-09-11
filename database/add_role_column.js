require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('متغيرات البيئة مفقودة');
  console.log('URL:', supabaseUrl);
  console.log('Key exists:', !!supabaseAnonKey);
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function addRoleColumn() {
  try {
    console.log('محاولة إضافة عمود role إلى جدول profiles...');
    
    // أولاً، دعنا نتحقق من المستخدمين الحاليين
    const { data: profiles, error: selectError } = await supabase
      .from('profiles')
      .select('*')
      .limit(5);
      
    if (selectError) {
      console.error('خطأ في جلب المستخدمين:', selectError);
      return;
    }
    
    console.log('المستخدمين الحاليين:', profiles);
    
    // محاولة تحديث مستخدم بعمود role
    if (profiles && profiles.length > 0) {
      const userId = profiles[0].id;
      console.log('محاولة تحديث المستخدم:', userId);
      
      const { data, error: updateError } = await supabase
        .from('profiles')
        .update({ role: 'admin' })
        .eq('id', userId)
        .select();
        
      if (updateError) {
        console.error('خطأ في تحديث المستخدم:', updateError);
        
        if (updateError.code === 'PGRST204') {
          console.log('\n=== تعليمات مهمة ===');
          console.log('عمود role غير موجود في جدول profiles.');
          console.log('يجب إضافته يدوياً في Supabase Dashboard:');
          console.log('1. اذهب إلى: https://supabase.com/dashboard');
          console.log('2. اختر مشروعك');
          console.log('3. اذهب إلى Table Editor > profiles');
          console.log('4. اضغط على "Add Column"');
          console.log('5. اسم العمود: role');
          console.log('6. النوع: text');
          console.log('7. القيمة الافتراضية: user');
          console.log('8. احفظ التغييرات');
          console.log('\nبعد إضافة العمود، شغل هذا الملف مرة أخرى.');
        }
      } else {
        console.log('تم تحديث المستخدم ليصبح admin بنجاح!', data);
        console.log('\nيمكنك الآن الوصول إلى /admin');
      }
    } else {
      console.log('لا توجد مستخدمين في قاعدة البيانات');
    }
    
  } catch (error) {
    console.error('خطأ عام:', error);
  }
}

addRoleColumn();