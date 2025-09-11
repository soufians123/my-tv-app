const { createClient } = require('@supabase/supabase-js');

// تحميل متغيرات البيئة
require('dotenv').config({ path: '.env.local' });

// إعداد Supabase
const supabaseUrl = 'https://jrtctjgdkvkdrjcbbbaz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpydGN0amdka3ZrZHJqY2JiYmF6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYwMzgyMzksImV4cCI6MjA3MTYxNDIzOX0.39DoF_bU7Yp8MuYoDffNab8h8T-FmvI3u4XJTQ0iX1Q';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkChannelsCount() {
  try {
    console.log('جاري التحقق من عدد القنوات في قاعدة البيانات...');
    
    // الحصول على عدد القنوات الإجمالي
    const { count: totalChannels, error: totalError } = await supabase
      .from('channels')
      .select('*', { count: 'exact', head: true });
    
    if (totalError) {
      console.error('خطأ في الحصول على العدد الإجمالي:', totalError.message);
      return;
    }
    
    // الحصول على عدد القنوات النشطة
    const { count: activeChannels, error: activeError } = await supabase
      .from('channels')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true);
    
    if (activeError) {
      console.error('خطأ في الحصول على عدد القنوات النشطة:', activeError.message);
      return;
    }
    
    // الحصول على عينة من القنوات
    const { data: sampleChannels, error: sampleError } = await supabase
      .from('channels')
      .select('name, name_ar, category_id, country, is_active')
      .limit(10);
    
    if (sampleError) {
      console.error('خطأ في الحصول على عينة القنوات:', sampleError.message);
      return;
    }
    
    // الحصول على إحصائيات الفئات
    const { data: categories, error: catError } = await supabase
      .from('channel_categories')
      .select('id, name, name_ar');
    
    if (catError) {
      console.error('خطأ في الحصول على الفئات:', catError.message);
    }
    
    console.log('\n=== إحصائيات القنوات ===');
    console.log(`العدد الإجمالي للقنوات: ${totalChannels || 0}`);
    console.log(`القنوات النشطة: ${activeChannels || 0}`);
    console.log(`القنوات غير النشطة: ${(totalChannels || 0) - (activeChannels || 0)}`);
    
    if (categories && categories.length > 0) {
      console.log('\n=== الفئات المتاحة ===');
      categories.forEach(cat => {
        console.log(`- ${cat.name_ar || cat.name} (ID: ${cat.id})`);
      });
    }
    
    if (sampleChannels && sampleChannels.length > 0) {
      console.log('\n=== عينة من القنوات ===');
      sampleChannels.forEach((channel, index) => {
        console.log(`${index + 1}. ${channel.name_ar || channel.name} - ${channel.country || 'غير محدد'} - ${channel.is_active ? 'نشطة' : 'غير نشطة'}`);
      });
    } else {
      console.log('\nلا توجد قنوات في قاعدة البيانات');
    }
    
  } catch (error) {
    console.error('خطأ عام:', error.message);
  }
}

checkChannelsCount();