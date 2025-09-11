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

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createRoleColumn() {
  try {
    console.log('محاولة إنشاء عمود role...');
    
    // إنشاء عمود role باستخدام SQL
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: `
        DO $$
        BEGIN
          IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'profiles' AND column_name = 'role'
          ) THEN
            ALTER TABLE profiles ADD COLUMN role TEXT DEFAULT 'user' NOT NULL;
            COMMENT ON COLUMN profiles.role IS 'User role: admin, user';
          END IF;
        END
        $$;
      `
    });
    
    if (error) {
      console.error('خطأ في إنشاء العمود:', error);
      
      // محاولة بديلة باستخدام SQL مباشر
      console.log('محاولة بديلة...');
      const { data: altData, error: altError } = await supabase
        .from('profiles')
        .select('id')
        .limit(1);
        
      if (altError) {
        console.error('خطأ في الوصول لجدول profiles:', altError);
        return;
      }
      
      console.log('\n=== تعليمات مهمة ===');
      console.log('يجب إضافة عمود role يدوياً في Supabase Dashboard:');
      console.log('1. اذهب إلى: https://supabase.com/dashboard');
      console.log('2. اختر مشروعك');
      console.log('3. اذهب إلى Table Editor > profiles');
      console.log('4. اضغط على "Add Column"');
      console.log('5. اسم العمود: role');
      console.log('6. النوع: text');
      console.log('7. القيمة الافتراضية: \'user\'');
      console.log('8. Allow Nullable: غير مفعل');
      console.log('9. احفظ التغييرات');
      console.log('\nبعد إضافة العمود، شغل: node database/update_user_to_admin.js');
      return;
    }
    
    console.log('تم إنشاء عمود role بنجاح!');
    
    // الآن نحديث المستخدم الأول ليصبح admin
    const { data: profiles, error: selectError } = await supabase
      .from('profiles')
      .select('id')
      .limit(1);
      
    if (selectError) {
      console.error('خطأ في جلب المستخدمين:', selectError);
      return;
    }
    
    if (profiles && profiles.length > 0) {
      const userId = profiles[0].id;
      console.log('تحديث المستخدم:', userId);
      
      const { data: updateData, error: updateError } = await supabase
        .from('profiles')
        .update({ role: 'admin' })
        .eq('id', userId)
        .select();
        
      if (updateError) {
        console.error('خطأ في تحديث المستخدم:', updateError);
      } else {
        console.log('تم تحديث المستخدم ليصبح admin بنجاح!');
        console.log('البيانات المحدثة:', updateData);
        console.log('\nيمكنك الآن الوصول إلى /admin');
      }
    }
    
  } catch (error) {
    console.error('خطأ عام:', error);
  }
}

createRoleColumn();