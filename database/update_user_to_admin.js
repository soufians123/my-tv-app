require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('متغيرات البيئة مفقودة');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function updateUserToAdmin() {
  try {
    console.log('البحث عن المستخدمين...');
    
    // جلب جميع المستخدمين
    const { data: profiles, error: selectError } = await supabase
      .from('profiles')
      .select('id, role, username, full_name')
      .order('created_at', { ascending: true });
      
    if (selectError) {
      console.error('خطأ في جلب المستخدمين:', selectError);
      return;
    }
    
    console.log('المستخدمين الموجودين:');
    profiles.forEach((profile, index) => {
      console.log(`${index + 1}. ID: ${profile.id}`);
      console.log(`   الاسم: ${profile.full_name || profile.username || 'غير محدد'}`);
      console.log(`   الدور: ${profile.role || 'غير محدد'}`);
      console.log('---');
    });
    
    if (profiles && profiles.length > 0) {
      // تحديث المستخدم الأول ليصبح admin
      const userId = profiles[0].id;
      console.log(`\nتحديث المستخدم الأول (${userId}) ليصبح admin...`);
      
      const { data: updateData, error: updateError } = await supabase
        .from('profiles')
        .update({ role: 'admin' })
        .eq('id', userId)
        .select('id, role, username, full_name');
        
      if (updateError) {
        console.error('خطأ في تحديث المستخدم:', updateError);
        
        if (updateError.message.includes('role')) {
          console.log('\n❌ عمود role غير موجود!');
          console.log('يجب إضافة عمود role أولاً في Supabase Dashboard:');
          console.log('1. اذهب إلى: https://supabase.com/dashboard');
          console.log('2. اختر مشروعك');
          console.log('3. اذهب إلى Table Editor > profiles');
          console.log('4. اضغط على "Add Column"');
          console.log('5. اسم العمود: role');
          console.log('6. النوع: text');
          console.log('7. القيمة الافتراضية: \'user\'');
          console.log('8. Allow Nullable: غير مفعل');
          console.log('9. احفظ التغييرات');
        }
      } else if (updateData && updateData.length > 0) {
        console.log('\n✅ تم تحديث المستخدم بنجاح!');
        console.log('البيانات المحدثة:', updateData[0]);
        console.log('\n🎉 يمكنك الآن الوصول إلى /admin');
        
        // التحقق من التحديث
        console.log('\nالتحقق من التحديث...');
        const { data: verifyData, error: verifyError } = await supabase
          .from('profiles')
          .select('id, role')
          .eq('role', 'admin');
          
        if (verifyError) {
          console.error('خطأ في التحقق:', verifyError);
        } else {
          console.log(`عدد المديرين: ${verifyData.length}`);
          verifyData.forEach(admin => {
            console.log(`- Admin ID: ${admin.id}`);
          });
        }
      } else {
        console.log('\n⚠️ لم يتم تحديث أي مستخدم');
        console.log('قد يكون عمود role غير موجود أو هناك مشكلة في الصلاحيات');
      }
    } else {
      console.log('لا توجد مستخدمين في قاعدة البيانات');
    }
    
  } catch (error) {
    console.error('خطأ عام:', error);
  }
}

updateUserToAdmin();