const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function removeDuplicatesSmart() {
  try {
    console.log('🧹 بدء عملية حذف القنوات المكررة بذكاء...');
    
    // جلب جميع القنوات
    const { data: channels, error } = await supabase
      .from('channels')
      .select('*')
      .order('name');

    if (error) {
      console.error('❌ خطأ في جلب القنوات:', error);
      return;
    }

    console.log(`📊 إجمالي القنوات قبل التنظيف: ${channels.length}`);
    
    // تجميع القنوات حسب الاسم المنظف
    const nameGroups = {};
    
    channels.forEach(channel => {
      const cleanName = channel.name
        .toLowerCase()
        .trim()
        .replace(/\s*\([^)]*\)\s*/g, '') // إزالة النص بين الأقواس مثل (1080p)
        .replace(/\s+/g, ' '); // توحيد المسافات
      
      if (!nameGroups[cleanName]) {
        nameGroups[cleanName] = [];
      }
      nameGroups[cleanName].push(channel);
    });
    
    // العثور على المجموعات المكررة
    const duplicateGroups = Object.entries(nameGroups)
      .filter(([name, channels]) => channels.length > 1);
    
    console.log(`🔄 مجموعات القنوات المكررة: ${duplicateGroups.length}`);
    
    let channelsToDelete = [];
    let keptChannels = [];
    
    // معالجة كل مجموعة مكررة
    for (const [cleanName, duplicates] of duplicateGroups) {
      console.log(`\n🔍 معالجة: "${duplicates[0].name}" (${duplicates.length} نسخ)`);
      
      // ترتيب القنوات حسب الأولوية (أفضل نسخة أولاً)
      const sortedDuplicates = duplicates.sort((a, b) => {
        // الأولوية 1: القنوات التي لها فئة
        if (a.category_id && !b.category_id) return -1;
        if (!a.category_id && b.category_id) return 1;
        
        // الأولوية 2: القنوات التي لها شعار
        if (a.logo_url && !b.logo_url) return -1;
        if (!a.logo_url && b.logo_url) return 1;
        
        // الأولوية 3: القنوات النشطة
        if (a.is_active && !b.is_active) return -1;
        if (!a.is_active && b.is_active) return 1;
        
        // الأولوية 4: الأسماء الأطول (أكثر تفصيلاً)
        if (a.name.length !== b.name.length) {
          return b.name.length - a.name.length;
        }
        
        // الأولوية 5: الأحدث (ID أكبر)
        return b.id.localeCompare(a.id);
      });
      
      // الاحتفاظ بأفضل نسخة
      const bestChannel = sortedDuplicates[0];
      const duplicatesToDelete = sortedDuplicates.slice(1);
      
      keptChannels.push(bestChannel);
      channelsToDelete.push(...duplicatesToDelete);
      
      console.log(`  ✅ محتفظ بـ: "${bestChannel.name}" (ID: ${bestChannel.id})`);
      duplicatesToDelete.forEach(dup => {
        console.log(`  ❌ سيتم حذف: "${dup.name}" (ID: ${dup.id})`);
      });
    }
    
    console.log(`\n📈 ملخص العملية:`);
    console.log(`- قنوات سيتم الاحتفاظ بها: ${keptChannels.length}`);
    console.log(`- قنوات سيتم حذفها: ${channelsToDelete.length}`);
    console.log(`- إجمالي القنوات بعد التنظيف: ${channels.length - channelsToDelete.length}`);
    
    if (channelsToDelete.length === 0) {
      console.log('✨ لا توجد قنوات مكررة للحذف!');
      return;
    }
    
    // تأكيد الحذف
    console.log('\n⚠️  هل تريد المتابعة مع حذف القنوات المكررة؟');
    console.log('سيتم حذف القنوات في 5 ثوانٍ...');
    
    // انتظار 5 ثوانٍ
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // حذف القنوات المكررة على دفعات
    const batchSize = 50;
    let deletedCount = 0;
    
    for (let i = 0; i < channelsToDelete.length; i += batchSize) {
      const batch = channelsToDelete.slice(i, i + batchSize);
      const idsToDelete = batch.map(ch => ch.id);
      
      console.log(`🗑️  حذف دفعة ${Math.floor(i/batchSize) + 1}: ${batch.length} قناة...`);
      
      const { error: deleteError } = await supabase
        .from('channels')
        .delete()
        .in('id', idsToDelete);
      
      if (deleteError) {
        console.error(`❌ خطأ في حذف الدفعة ${Math.floor(i/batchSize) + 1}:`, deleteError);
        continue;
      }
      
      deletedCount += batch.length;
      console.log(`✅ تم حذف ${batch.length} قناة بنجاح`);
    }
    
    console.log(`\n🎉 تم الانتهاء من تنظيف القنوات!`);
    console.log(`- تم حذف: ${deletedCount} قناة مكررة`);
    console.log(`- تم الاحتفاظ بـ: ${channels.length - deletedCount} قناة فريدة`);
    
    // التحقق النهائي
    const { data: finalChannels, error: finalError } = await supabase
      .from('channels')
      .select('id')
      .limit(1);
    
    if (!finalError) {
      const { count } = await supabase
        .from('channels')
        .select('*', { count: 'exact', head: true });
      
      console.log(`📊 العدد النهائي للقنوات: ${count}`);
    }
    
  } catch (error) {
    console.error('❌ خطأ عام:', error);
  }
}

removeDuplicatesSmart();