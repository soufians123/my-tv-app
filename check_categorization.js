const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function checkCategorization() {
  try {
    console.log('فحص التصنيف التلقائي للقنوات...');
    
    // جلب عينة من القنوات مع تصنيفاتها
    const { data: channels, error } = await supabase
      .from('channels')
      .select(`
        id,
        name,
        category_id,
        channel_categories(name_ar)
      `)
      .limit(30);

    if (error) {
      console.error('خطأ في جلب القنوات:', error);
      return;
    }

    console.log('\nعينة من القنوات وتصنيفاتها:');
    console.log('================================');
    
    let uncategorized = 0;
    let categorized = 0;
    
    channels.forEach(channel => {
      const categoryName = channel.channel_categories?.name_ar || 'غير مصنف';
      console.log(`- ${channel.name} -> ${categoryName}`);
      
      if (categoryName === 'غير مصنف') {
        uncategorized++;
      } else {
        categorized++;
      }
    });
    
    console.log('\nإحصائيات العينة:');
    console.log(`- قنوات مصنفة: ${categorized}`);
    console.log(`- قنوات غير مصنفة: ${uncategorized}`);
    
    // فحص القنوات غير المصنفة في كامل قاعدة البيانات
    const { data: uncategorizedChannels, error: uncategorizedError } = await supabase
      .from('channels')
      .select('id, name')
      .is('category_id', null);
      
    if (uncategorizedError) {
      console.error('خطأ في جلب القنوات غير المصنفة:', uncategorizedError);
      return;
    }
    
    console.log(`\nإجمالي القنوات غير المصنفة في قاعدة البيانات: ${uncategorizedChannels.length}`);
    
    if (uncategorizedChannels.length > 0) {
      console.log('\nأمثلة على القنوات غير المصنفة:');
      uncategorizedChannels.slice(0, 10).forEach(channel => {
        console.log(`- ${channel.name}`);
      });
    }
    
  } catch (error) {
    console.error('خطأ عام:', error);
  }
}

checkCategorization();