// دمج الفئات المكررة في قاعدة البيانات
// استخدام fetch المدمج في Node.js 18+

async function mergeDuplicateCategories() {
  const baseUrl = 'http://localhost:3000';
  
  console.log('🔧 دمج الفئات المكررة في قاعدة البيانات...');
  console.log('-'.repeat(50));
  
  try {
    // فحص حالة الخادم
    const healthResponse = await fetch(`${baseUrl}/`);
    if (!healthResponse.ok) {
      console.log('❌ الخادم غير متاح');
      return;
    }

    // جلب الفئات والقنوات
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
    
    // تحديد الفئات المكررة والحلول
    const duplicateMap = {
      'أخبار': 'إخبارية',
      'رياضة': 'رياضية', 
      'وثائقي': 'وثائقية',
      'ثقافة': 'ثقافية',
      'ترفيه': 'ترفيهية',
      'أفلام': 'أفلام ومسلسلات',
      'مسلسلات': 'أفلام ومسلسلات',
      'دين': 'دينية'
    };
    
    console.log('\n📋 الفئات المكررة المكتشفة:');
    console.log('-'.repeat(30));
    
    const categoriesToMerge = [];
    const targetCategories = {};
    
    // البحث عن الفئات المكررة
    categories.forEach(category => {
      const categoryName = category.name || category.name_ar;
      
      if (duplicateMap[categoryName]) {
        const targetName = duplicateMap[categoryName];
        const targetCategory = categories.find(cat => 
          (cat.name === targetName || cat.name_ar === targetName)
        );
        
        if (targetCategory) {
          categoriesToMerge.push({
            sourceId: category.id,
            sourceName: categoryName,
            targetId: targetCategory.id,
            targetName: targetName
          });
          
          targetCategories[targetCategory.id] = targetName;
          console.log(`- ${categoryName} → ${targetName}`);
        }
      }
    });
    
    if (categoriesToMerge.length === 0) {
      console.log('✅ لا توجد فئات مكررة للدمج');
      return;
    }
    
    console.log(`\n🔄 سيتم دمج ${categoriesToMerge.length} فئة مكررة`);
    
    // تحليل القنوات التي تحتاج تحديث
    const channelsToUpdate = [];
    
    channels.forEach(channel => {
      if (channel.category_id) {
        const mergeInfo = categoriesToMerge.find(m => m.sourceId === channel.category_id);
        
        if (mergeInfo) {
          channelsToUpdate.push({
            channelId: channel.id,
            channelName: channel.name,
            oldCategoryId: mergeInfo.sourceId,
            oldCategoryName: mergeInfo.sourceName,
            newCategoryId: mergeInfo.targetId,
            newCategoryName: mergeInfo.targetName
          });
        }
      }
    });
    
    console.log(`\n📊 إحصائيات الدمج:`);
    console.log('-'.repeat(25));
    console.log(`- قنوات تحتاج تحديث: ${channelsToUpdate.length}`);
    console.log(`- فئات سيتم حذفها: ${categoriesToMerge.length}`);
    
    if (channelsToUpdate.length > 0) {
      console.log('\n🔍 عينة من القنوات التي ستُحدث:');
      console.log('-'.repeat(40));
      
      channelsToUpdate.slice(0, 10).forEach(update => {
        console.log(`- ${update.channelName}: ${update.oldCategoryName} → ${update.newCategoryName}`);
      });
      
      if (channelsToUpdate.length > 10) {
        console.log(`... و ${channelsToUpdate.length - 10} قناة أخرى`);
      }
    }
    
    // عرض الفئات الفارغة التي ستُحذف
    const emptyCategories = categories.filter(cat => 
      cat.channel_count === 0 && !targetCategories[cat.id]
    );
    
    if (emptyCategories.length > 0) {
      console.log('\n🗑️  الفئات الفارغة التي ستُحذف:');
      console.log('-'.repeat(35));
      emptyCategories.forEach(cat => {
        console.log(`- ${cat.name || cat.name_ar} (${cat.channel_count} قناة)`);
      });
    }
    
    console.log('\n⚠️  ملاحظة: هذا السكريبت يعرض التحليل فقط.');
    console.log('💡 لتطبيق التغييرات، يجب إنشاء API endpoints للتحديث والحذف.');
    console.log('\n🚀 الخطوات التالية:');
    console.log('1. إنشاء API لتحديث category_id للقنوات');
    console.log('2. إنشاء API لحذف الفئات المكررة');
    console.log('3. تشغيل عملية الدمج');
    
  } catch (error) {
    console.log(`❌ خطأ في الوصول إلى API: ${error.message}`);
    console.log('\n💡 تأكد من تشغيل الخادم باستخدام: npm run dev');
  }
}

// تشغيل السكريبت
mergeDuplicateCategories().catch(console.error);