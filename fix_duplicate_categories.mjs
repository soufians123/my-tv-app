// إصلاح مشكلة تكرار الفئات في قاعدة البيانات
// استخدام fetch المدمج في Node.js 18+

async function fixDuplicateCategories() {
  const baseUrl = 'http://localhost:3000';
  
  console.log('🔧 إصلاح مشكلة تكرار الفئات...');
  console.log('-'.repeat(50));
  
  try {
    // فحص حالة الخادم
    const healthResponse = await fetch(`${baseUrl}/`);
    if (!healthResponse.ok) {
      console.log('❌ الخادم غير متاح');
      return;
    }

    // جلب الفئات الحالية
    const categoriesResponse = await fetch(`${baseUrl}/api/channels/categories`);
    if (!categoriesResponse.ok) {
      throw new Error(`HTTP ${categoriesResponse.status}`);
    }
    
    const categories = await categoriesResponse.json();
    console.log(`✅ تم العثور على ${categories.length} فئة`);
    
    // تحديد الفئات المكررة والحلول
    const duplicateMap = {
      'رياضة': 'رياضية',
      'موسيقى': 'موسيقية', 
      'وثائقي': 'وثائقية',
      'ثقافة': 'ثقافية',
      'ترفيه': 'ترفيهية',
      'أفلام': 'أفلام ومسلسلات',
      'مسلسلات': 'أفلام ومسلسلات'
    };
    
    console.log('\n📋 الفئات المكررة المكتشفة:');
    console.log('-'.repeat(30));
    
    const categoriesToMerge = [];
    const categoriesToKeep = [];
    
    categories.forEach(category => {
      const categoryName = category.name || category.name_ar;
      if (duplicateMap[categoryName]) {
        categoriesToMerge.push({
          old: categoryName,
          new: duplicateMap[categoryName],
          id: category.id
        });
        console.log(`- ${categoryName} → ${duplicateMap[categoryName]}`);
      } else {
        categoriesToKeep.push(category);
      }
    });
    
    if (categoriesToMerge.length === 0) {
      console.log('✅ لا توجد فئات مكررة للإصلاح');
      return;
    }
    
    console.log(`\n🔄 سيتم دمج ${categoriesToMerge.length} فئة مكررة`);
    
    // جلب القنوات لتحديث ارتباطاتها
    const channelsResponse = await fetch(`${baseUrl}/api/channels`);
    if (!channelsResponse.ok) {
      throw new Error(`HTTP ${channelsResponse.status}`);
    }
    
    const channels = await channelsResponse.json();
    console.log(`✅ تم العثور على ${channels.length} قناة للتحديث`);
    
    // تحليل القنوات التي تحتاج تحديث
    const channelsToUpdate = [];
    
    channels.forEach(channel => {
      if (channel.channel_categories) {
        const categoryName = channel.channel_categories.name || channel.channel_categories.name_ar;
        const mergeInfo = categoriesToMerge.find(m => m.old === categoryName);
        
        if (mergeInfo) {
          // البحث عن الفئة الجديدة
          const targetCategory = categories.find(cat => 
            (cat.name === mergeInfo.new || cat.name_ar === mergeInfo.new)
          );
          
          if (targetCategory) {
            channelsToUpdate.push({
              channelId: channel.id,
              channelName: channel.name,
              oldCategory: categoryName,
              newCategory: mergeInfo.new,
              newCategoryId: targetCategory.id
            });
          }
        }
      }
    });
    
    console.log(`\n📊 إحصائيات التحديث:`);
    console.log('-'.repeat(25));
    console.log(`- قنوات تحتاج تحديث: ${channelsToUpdate.length}`);
    console.log(`- فئات سيتم حذفها: ${categoriesToMerge.length}`);
    
    if (channelsToUpdate.length > 0) {
      console.log('\n🔍 عينة من القنوات التي ستُحدث:');
      console.log('-'.repeat(40));
      
      channelsToUpdate.slice(0, 10).forEach(update => {
        console.log(`- ${update.channelName}: ${update.oldCategory} → ${update.newCategory}`);
      });
      
      if (channelsToUpdate.length > 10) {
        console.log(`... و ${channelsToUpdate.length - 10} قناة أخرى`);
      }
    }
    
    console.log('\n⚠️  ملاحظة: هذا السكريبت يعرض التحليل فقط.');
    console.log('💡 لتطبيق التغييرات، يجب إنشاء API endpoints للتحديث.');
    
  } catch (error) {
    console.log(`❌ خطأ في الوصول إلى API: ${error.message}`);
    console.log('\n💡 تأكد من تشغيل الخادم باستخدام: npm run dev');
  }
}

// تشغيل السكريبت
fixDuplicateCategories().catch(console.error);