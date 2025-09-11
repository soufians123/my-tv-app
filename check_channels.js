const { loadChannels } = require('./lib/supabaseChannelsService');

async function checkChannels() {
  try {
    const channels = await loadChannels();
    console.log('عدد القنوات الحالية:', channels.length);
    
    if (channels.length > 0) {
      console.log('أول 5 قنوات:');
      channels.slice(0, 5).forEach((ch, i) => {
        console.log(`${i + 1}. ${ch.name} - ${ch.category_name || 'بدون فئة'}`);
      });
    } else {
      console.log('لا توجد قنوات في قاعدة البيانات');
    }
  } catch (err) {
    console.error('خطأ:', err.message);
  }
}

checkChannels();