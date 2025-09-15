const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.log('متغيرات البيئة مفقودة. تحقق من ملف .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkDatabase() {
  try {
    console.log('فحص قاعدة البيانات...');
    console.log('URL:', supabaseUrl);
    
    // التحقق من الاتصال
    const { data: testData, error: testError } = await supabase
      .from('profiles')
      .select('count')
      .limit(1);
      
    if (testError) {
      console.log('خطأ في الاتصال بقاعدة البيانات:', testError.message);
    } else {
      console.log('الاتصال بقاعدة البيانات ناجح');
    }
    
    // التحقق من جدول channels
    console.log('\nفحص جدول channels...');
    const { data: channels, error: channelsError } = await supabase
      .from('channels')
      .select('*')
      .limit(1);
      
    if (channelsError) {
      console.log('جدول channels غير موجود أو لا يمكن الوصول إليه:', channelsError.message);
      console.log('كود الخطأ:', channelsError.code);
    } else {
      console.log('جدول channels موجود');
      if (channels && channels.length > 0) {
        console.log('الأعمدة المتاحة:', Object.keys(channels[0]));
      } else {
        console.log('الجدول فارغ');
      }
    }
    
    // التحقق من جدول channel_categories
    console.log('\nفحص جدول channel_categories...');
    const { data: categories, error: catError } = await supabase
      .from('channel_categories')
      .select('*')
      .limit(1);
      
    if (catError) {
      console.log('جدول channel_categories غير موجود:', catError.message);
    } else {
      console.log('جدول channel_categories موجود');
      if (categories && categories.length > 0) {
        console.log('الأعمدة المتاحة:', Object.keys(categories[0]));
      }
    }
    
    // عرض جميع الجداول المتاحة
    console.log('\nمحاولة عرض الجداول المتاحة...');
    const { data: tables, error: tablesError } = await supabase.rpc('get_tables');
    if (tablesError) {
      console.log('لا يمكن الحصول على قائمة الجداول:', tablesError.message);
    } else {
      console.log('الجداول المتاحة:', tables);
    }
    
  } catch (error) {
    console.error('خطأ عام:', error.message);
  }
}

checkDatabase();