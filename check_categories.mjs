// فحص الفئات والقنوات من خلال API
// استخدام fetch المدمج في Node.js 18+

async function checkCategoriesAndChannels() {
  try {
    console.log('🔍 فحص الفئات والقنوات من خلال API...');
    console.log('-'.repeat(50));
    
    // فحص إذا كان الخادم يعمل
    const baseUrl = 'http://localhost:3000';
    
    try {
      // جلب الفئات والقنوات من API
      const [categoriesResponse, channelsResponse] = await Promise.all([
        fetch(`${baseUrl}/api/channels/categories`),
        fetch(`${baseUrl}/api/channels`)
      ]);
      
      if (!categoriesResponse.ok || !channelsResponse.ok) {
        throw new Error(`HTTP ${categoriesResponse.status} or ${channelsResponse.status}`);
      }
      
      const categories = await categoriesResponse.json();
      const channels = await channelsResponse.json();
      console.log(`✅ تم العثور على ${channels.length} قناة و ${categories.length} فئة`);
      
      // تحليل الفئات
      const categoryStats = {};
      const uncategorizedChannels = [];
      
      // إحصائيات الفئات المتاحة
      categories.forEach(category => {
        categoryStats[category.name] = 0;
      });
      
      // تحليل القنوات
      channels.forEach(ch => {
        if (!ch.category_id || !ch.channel_categories) {
          uncategorizedChannels.push(ch);
          const catName = 'غير مصنف';
          categoryStats[catName] = (categoryStats[catName] || 0) + 1;
        } else {
          const catName = ch.channel_categories?.name_ar || ch.channel_categories?.name || 'غير محددة';
          categoryStats[catName] = (categoryStats[catName] || 0) + 1;
        }
      });
      
      console.log('\n📊 إحصائيات الفئات:');
      console.log('-'.repeat(30));
      
      // ترتيب الفئات حسب عدد القنوات
      const sortedStats = Object.entries(categoryStats)
        .sort(([,a], [,b]) => b - a);
      
      sortedStats.forEach(([category, count]) => {
        console.log(`- ${category}: ${count} قناة`);
      });
      
      if (uncategorizedChannels.length > 0) {
        console.log(`- ❌ قنوات بدون فئة: ${uncategorizedChannels.length} قناة`);
      }
      
      console.log(`\n📈 إجمالي القنوات: ${channels.length}`);
      
      // عرض عينة من القنوات غير المصنفة
      if (uncategorizedChannels.length > 0) {
        console.log('\n🔍 عينة من القنوات غير المصنفة:');
        console.log('-'.repeat(40));
        
        uncategorizedChannels.slice(0, 10).forEach(ch => {
          console.log(`- ${ch.name} (ID: ${ch.id})`);
        });
      }
      
    } catch (apiError) {
      console.error('❌ خطأ في الوصول إلى API:', apiError.message);
      console.log('\n💡 تأكد من تشغيل الخادم باستخدام: npm run dev');
    }
    
  } catch (error) {
    console.error('❌ خطأ عام:', error);
  }
}

checkCategoriesAndChannels();