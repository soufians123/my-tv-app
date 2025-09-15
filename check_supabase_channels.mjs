import pkg from './lib/supabase.js';
const { supabase } = pkg;

async function checkChannelsTable() {
  try {
    console.log('فحص جدول channels في Supabase...');
    
    // محاولة الاستعلام عن القنوات
    const { data, error } = await supabase
      .from('channels')
      .select('*')
      .limit(1);
    
    if (error) {
      console.log('خطأ في الاستعلام:', error.message);
      console.log('تفاصيل الخطأ:', error);
      
      // التحقق من وجود الجدول
      const { data: tables, error: tablesError } = await supabase
        .from('information_schema.tables')
        .select('table_name')
        .eq('table_schema', 'public')
        .eq('table_name', 'channels');
        
      if (tablesError) {
        console.log('لا يمكن التحقق من الجداول:', tablesError.message);
      } else if (tables && tables.length === 0) {
        console.log('جدول channels غير موجود في قاعدة البيانات');
      } else {
        console.log('جدول channels موجود ولكن هناك مشكلة في الوصول إليه');
      }
    } else {
      console.log('جدول channels موجود وقابل للوصول');
      console.log('عدد القنوات المسترجعة:', data.length);
      if (data.length > 0) {
        console.log('الأعمدة المتاحة:', Object.keys(data[0]));
        console.log('مثال على البيانات:', data[0]);
      }
    }
    
    // التحقق من جدول channel_categories
    const { data: categories, error: catError } = await supabase
      .from('channel_categories')
      .select('*')
      .limit(5);
      
    if (catError) {
      console.log('جدول channel_categories غير موجود:', catError.message);
    } else {
      console.log('جدول channel_categories موجود، عدد الفئات:', categories.length);
    }
    
  } catch (error) {
    console.error('خطأ في الاتصال بقاعدة البيانات:', error.message);
  }
}

checkChannelsTable();