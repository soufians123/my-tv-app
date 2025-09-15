// استخدام fetch المدمج في Node.js 18+

const API_BASE = 'http://localhost:3000';

async function mergeDuplicateCategories() {
  try {
    console.log('🚀 بدء عملية دمج الفئات المكررة...');
    console.log('=' .repeat(50));
    
    const response = await fetch(`${API_BASE}/api/admin/merge-categories`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`HTTP ${response.status}: ${errorData.error || errorData.message}`);
    }
    
    const result = await response.json();
    
    console.log('✅ نتائج عملية الدمج:');
    console.log('-'.repeat(30));
    console.log(`📊 عدد الفئات المدموجة: ${result.merged}`);
    console.log(`🔄 عدد القنوات المحدثة: ${result.updated}`);
    console.log(`💬 الرسالة: ${result.message}`);
    
    if (result.details && result.details.length > 0) {
      console.log('\n🔍 تفاصيل الدمج:');
      result.details.forEach(detail => {
        console.log(`  • ${detail}`);
      });
    }
    
    console.log('\n🎉 تمت العملية بنجاح!');
    console.log('=' .repeat(50));
    
    // التحقق من النتائج
    console.log('\n🔍 التحقق من النتائج الجديدة...');
    await checkResults();
    
  } catch (error) {
    console.error('❌ خطأ في عملية الدمج:', error.message);
    process.exit(1);
  }
}

async function checkResults() {
  try {
    // جلب الفئات المحدثة
    const categoriesResponse = await fetch(`${API_BASE}/api/channels/categories`);
    const categoriesData = await categoriesResponse.json();
    
    console.log(`\n📋 إجمالي الفئات بعد الدمج: ${categoriesData.categories?.length || 0}`);
    
    if (categoriesData.categories) {
      console.log('\n📊 الفئات النهائية:');
      categoriesData.categories
        .sort((a, b) => b.channel_count - a.channel_count)
        .forEach(category => {
          console.log(`  • ${category.name} (${category.channel_count} قناة)`);
        });
    }
    
    // جلب إجمالي القنوات
    const channelsResponse = await fetch(`${API_BASE}/api/channels`);
    const channelsData = await channelsResponse.json();
    
    console.log(`\n📺 إجمالي القنوات: ${channelsData.channels?.length || 0}`);
    
  } catch (error) {
    console.error('⚠️  خطأ في التحقق من النتائج:', error.message);
  }
}

// تشغيل العملية
mergeDuplicateCategories();