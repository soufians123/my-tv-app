const { createClient } = require('@supabase/supabase-js');

// تحميل متغيرات البيئة
require('dotenv').config({ path: '.env.local' });

// إعداد Supabase
const supabaseUrl = 'https://jrtctjgdkvkdrjcbbbaz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpydGN0amdka3ZrZHJqY2JiYmF6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYwMzgyMzksImV4cCI6MjA3MTYxNDIzOX0.39DoF_bU7Yp8MuYoDffNab8h8T-FmvI3u4XJTQ0iX1Q';

const supabase = createClient(supabaseUrl, supabaseKey);

async function analyzeCategorization() {
  try {
    console.log('🔍 تحليل التصنيف الحالي للقنوات...');
    console.log('=' .repeat(50));
    
    // الحصول على جميع الفئات مع عدد القنوات في كل فئة
    const { data: categoryStats, error: catError } = await supabase
      .from('channels')
      .select(`
        category_id,
        channel_categories(id, name, name_ar)
      `);
    
    if (catError) {
      console.error('خطأ في الحصول على إحصائيات الفئات:', catError.message);
      return;
    }
    
    // الحصول على القنوات بدون فئة
    const { count: uncategorizedCount, error: uncatError } = await supabase
      .from('channels')
      .select('*', { count: 'exact', head: true })
      .is('category_id', null);
    
    if (uncatError) {
      console.error('خطأ في الحصول على القنوات غير المصنفة:', uncatError.message);
    }
    
    // تجميع الإحصائيات
    const categoryCount = {};
    const categoryNames = {};
    
    categoryStats.forEach(channel => {
      if (channel.category_id && channel.channel_categories) {
        const catId = channel.category_id;
        const catName = channel.channel_categories.name_ar || channel.channel_categories.name;
        
        categoryCount[catId] = (categoryCount[catId] || 0) + 1;
        categoryNames[catId] = catName;
      }
    });
    
    console.log('📊 توزيع القنوات حسب الفئات:');
    console.log('-'.repeat(40));
    
    // ترتيب الفئات حسب عدد القنوات
    const sortedCategories = Object.entries(categoryCount)
      .sort(([,a], [,b]) => b - a)
      .map(([catId, count]) => ({ 
        id: catId, 
        name: categoryNames[catId], 
        count 
      }));
    
    let totalCategorized = 0;
    sortedCategories.forEach((cat, index) => {
      console.log(`${index + 1}. ${cat.name}: ${cat.count} قناة`);
      totalCategorized += cat.count;
    });
    
    console.log(`\n❌ قنوات بدون فئة: ${uncategorizedCount || 0} قناة`);
    console.log(`✅ قنوات مصنفة: ${totalCategorized} قناة`);
    console.log(`📈 إجمالي القنوات: ${totalCategorized + (uncategorizedCount || 0)} قناة`);
    
    // تحليل المشاكل في التصنيف
    console.log('\n🔍 تحليل مشاكل التصنيف:');
    console.log('-'.repeat(40));
    
    // البحث عن فئات مكررة أو متشابهة
    const duplicateCategories = [];
    const categoryNamesArray = Object.values(categoryNames);
    
    for (let i = 0; i < categoryNamesArray.length; i++) {
      for (let j = i + 1; j < categoryNamesArray.length; j++) {
        const name1 = categoryNamesArray[i].toLowerCase().trim();
        const name2 = categoryNamesArray[j].toLowerCase().trim();
        
        // فحص التشابه
        if (name1.includes(name2) || name2.includes(name1) || 
            (name1.replace(/ية$/, '') === name2.replace(/ية$/, '')) ||
            (name1.replace(/ال/, '') === name2.replace(/ال/, ''))) {
          duplicateCategories.push([categoryNamesArray[i], categoryNamesArray[j]]);
        }
      }
    }
    
    if (duplicateCategories.length > 0) {
      console.log('⚠️  فئات مكررة أو متشابهة:');
      duplicateCategories.forEach(([cat1, cat2], index) => {
        console.log(`   ${index + 1}. "${cat1}" و "${cat2}"`);
      });
    } else {
      console.log('✅ لا توجد فئات مكررة واضحة');
    }
    
    // عرض عينة من القنوات غير المصنفة
    if (uncategorizedCount > 0) {
      const { data: uncategorizedSample, error: sampleError } = await supabase
        .from('channels')
        .select('name, name_ar, country')
        .is('category_id', null)
        .limit(10);
      
      if (!sampleError && uncategorizedSample.length > 0) {
        console.log('\n📋 عينة من القنوات غير المصنفة:');
        console.log('-'.repeat(40));
        uncategorizedSample.forEach((channel, index) => {
          console.log(`${index + 1}. ${channel.name_ar || channel.name} (${channel.country || 'غير محدد'})`);
        });
      }
    }
    
    // اقتراحات للتحسين
    console.log('\n💡 اقتراحات للتحسين:');
    console.log('-'.repeat(40));
    
    if (uncategorizedCount > 0) {
      console.log(`1. تصنيف ${uncategorizedCount} قناة غير مصنفة`);
    }
    
    if (duplicateCategories.length > 0) {
      console.log(`2. دمج ${duplicateCategories.length} مجموعة من الفئات المتشابهة`);
    }
    
    console.log('3. إضافة فئات جديدة مثل: وثائقية، طبخ، تقنية، صحة وجمال');
    console.log('4. توحيد أسماء الفئات باللغة العربية');
    console.log('5. إعادة تصنيف القنوات بناءً على المحتوى والاسم');
    
  } catch (error) {
    console.error('خطأ عام في التحليل:', error.message);
  }
}

analyzeCategorization();