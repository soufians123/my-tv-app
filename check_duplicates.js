const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function checkDuplicates() {
  try {
    console.log('🔍 فحص التكرارات في قاعدة بيانات القنوات...');
    
    // جلب جميع القنوات
    const { data: channels, error } = await supabase
      .from('channels')
      .select('id, name, stream_url, category_id')
      .order('name');

    if (error) {
      console.error('❌ خطأ في جلب القنوات:', error);
      return;
    }

    console.log(`📊 إجمالي القنوات: ${channels.length}`);
    
    // فحص التكرارات بناءً على الاسم
    const nameGroups = {};
    const urlGroups = {};
    
    channels.forEach(channel => {
      // تجميع حسب الاسم
      const cleanName = channel.name.toLowerCase().trim();
      if (!nameGroups[cleanName]) {
        nameGroups[cleanName] = [];
      }
      nameGroups[cleanName].push(channel);
      
      // تجميع حسب الرابط
      if (channel.stream_url) {
        if (!urlGroups[channel.stream_url]) {
          urlGroups[channel.stream_url] = [];
        }
        urlGroups[channel.stream_url].push(channel);
      }
    });
    
    // العثور على التكرارات في الأسماء
    const duplicateNames = Object.entries(nameGroups)
      .filter(([name, channels]) => channels.length > 1)
      .sort((a, b) => b[1].length - a[1].length);
    
    console.log(`\n🔄 التكرارات في الأسماء: ${duplicateNames.length}`);
    console.log('أكثر الأسماء تكراراً:');
    duplicateNames.slice(0, 10).forEach(([name, channels]) => {
      console.log(`  - "${channels[0].name}" (${channels.length} مرات)`);
      channels.forEach(ch => {
        console.log(`    ID: ${ch.id}, Category: ${ch.category_id}`);
      });
    });
    
    // العثور على التكرارات في الروابط
    const duplicateUrls = Object.entries(urlGroups)
      .filter(([url, channels]) => channels.length > 1)
      .sort((a, b) => b[1].length - a[1].length);
    
    console.log(`\n🔗 التكرارات في الروابط: ${duplicateUrls.length}`);
    console.log('أكثر الروابط تكراراً:');
    duplicateUrls.slice(0, 5).forEach(([url, channels]) => {
      console.log(`  - ${url} (${channels.length} قنوات)`);
      channels.forEach(ch => {
        console.log(`    "${ch.name}" (ID: ${ch.id})`);
      });
    });
    
    // حساب إجمالي القنوات المكررة
    let totalDuplicatesByName = 0;
    duplicateNames.forEach(([name, channels]) => {
      totalDuplicatesByName += channels.length - 1; // نحتفظ بواحدة فقط
    });
    
    let totalDuplicatesByUrl = 0;
    duplicateUrls.forEach(([url, channels]) => {
      totalDuplicatesByUrl += channels.length - 1;
    });
    
    console.log(`\n📈 إحصائيات التكرارات:`);
    console.log(`- قنوات مكررة بالاسم: ${totalDuplicatesByName}`);
    console.log(`- قنوات مكررة بالرابط: ${totalDuplicatesByUrl}`);
    console.log(`- إجمالي القنوات الفريدة المتوقعة: ${channels.length - Math.max(totalDuplicatesByName, totalDuplicatesByUrl)}`);
    
    // فحص الفئات الفارغة
    const channelsWithoutCategory = channels.filter(ch => !ch.category_id);
    console.log(`\n❌ قنوات بدون فئة: ${channelsWithoutCategory.length}`);
    
    if (channelsWithoutCategory.length > 0) {
      console.log('أمثلة على القنوات بدون فئة:');
      channelsWithoutCategory.slice(0, 10).forEach(ch => {
        console.log(`  - "${ch.name}" (ID: ${ch.id})`);
      });
    }
    
  } catch (error) {
    console.error('❌ خطأ عام:', error);
  }
}

checkDuplicates();