const fs = require('fs');

try {
  const channels = JSON.parse(fs.readFileSync('./zomiga_channels.json', 'utf8'));
  
  console.log('📊 إحصائيات القنوات بعد التنظيف:');
  console.log('================================');
  console.log(`إجمالي القنوات الحالية: ${channels.length}`);
  
  // حساب توزيع الفئات
  const categories = {};
  channels.forEach(ch => {
    const category = ch.category || 'غير محدد';
    categories[category] = (categories[category] || 0) + 1;
  });
  
  console.log('\n📋 توزيع القنوات حسب الفئات:');
  console.log('==============================');
  
  Object.entries(categories)
    .sort((a, b) => b[1] - a[1])
    .forEach(([cat, count]) => {
      console.log(`${cat}: ${count} قناة`);
    });
  
  // إحصائيات إضافية
  const activeChannels = channels.filter(ch => ch.status === 'active').length;
  const countries = [...new Set(channels.map(ch => ch.country))].length;
  const languages = [...new Set(channels.map(ch => ch.language))].length;
  
  console.log('\n📈 إحصائيات إضافية:');
  console.log('===================');
  console.log(`القنوات النشطة: ${activeChannels}`);
  console.log(`عدد البلدان: ${countries}`);
  console.log(`عدد اللغات: ${languages}`);
  
} catch (error) {
  console.error('خطأ في قراءة الملف:', error.message);
}