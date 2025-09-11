const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// إعداد Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ متغيرات البيئة مفقودة!');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// دالة تنظيف النص للمقارنة
function normalizeText(text) {
  if (!text) return '';
  return text
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ') // توحيد المسافات
    .replace(/[\u064B-\u065F]/g, '') // إزالة التشكيل العربي
    .replace(/[^\u0600-\u06FF\u0750-\u077F\w\s]/g, '') // الاحتفاظ بالأحرف العربية والإنجليزية فقط
}

// دالة تنظيف الرابط للمقارنة
function normalizeUrl(url) {
  if (!url) return '';
  return url
    .toLowerCase()
    .trim()
    .replace(/^https?:\/\//, '') // إزالة البروتوكول
    .replace(/\/$/, '') // إزالة الشرطة المائلة في النهاية
    .replace(/www\./g, '') // إزالة www
}

// دالة اكتشاف القنوات المتكررة
async function findDuplicateChannels() {
  try {
    console.log('🔍 جاري البحث عن القنوات المتكررة...');
    console.log('=' .repeat(50));
    
    // الحصول على جميع القنوات النشطة
    const { data: channels, error } = await supabase
      .from('channels')
      .select('id, name, name_ar, stream_url, country, created_at, viewer_count')
      .eq('is_active', true)
      .order('created_at', { ascending: true }); // الأقدم أولاً
    
    if (error) {
      console.error('❌ خطأ في الحصول على القنوات:', error.message);
      return [];
    }
    
    console.log(`📊 عدد القنوات النشطة: ${channels.length}`);
    
    const duplicates = [];
    const processed = new Set();
    
    // البحث عن التكرارات
    for (let i = 0; i < channels.length; i++) {
      if (processed.has(channels[i].id)) continue;
      
      const currentChannel = channels[i];
      const currentName = normalizeText(currentChannel.name || currentChannel.name_ar);
      const currentUrl = normalizeUrl(currentChannel.stream_url);
      
      if (!currentName && !currentUrl) continue;
      
      const duplicateGroup = [currentChannel];
      
      // البحث عن القنوات المشابهة
      for (let j = i + 1; j < channels.length; j++) {
        if (processed.has(channels[j].id)) continue;
        
        const compareChannel = channels[j];
        const compareName = normalizeText(compareChannel.name || compareChannel.name_ar);
        const compareUrl = normalizeUrl(compareChannel.stream_url);
        
        let isDuplicate = false;
        
        // مقارنة الأسماء
        if (currentName && compareName && currentName === compareName) {
          isDuplicate = true;
        }
        
        // مقارنة الروابط
        if (currentUrl && compareUrl && currentUrl === compareUrl) {
          isDuplicate = true;
        }
        
        // مقارنة التشابه القوي في الأسماء (أكثر من 90%)
        if (!isDuplicate && currentName && compareName) {
          const similarity = calculateSimilarity(currentName, compareName);
          if (similarity > 0.9) {
            isDuplicate = true;
          }
        }
        
        if (isDuplicate) {
          duplicateGroup.push(compareChannel);
          processed.add(compareChannel.id);
        }
      }
      
      if (duplicateGroup.length > 1) {
        duplicates.push(duplicateGroup);
      }
      
      processed.add(currentChannel.id);
    }
    
    return duplicates;
  } catch (error) {
    console.error('❌ خطأ في البحث عن المتكررات:', error.message);
    return [];
  }
}

// دالة حساب التشابه بين النصوص
function calculateSimilarity(str1, str2) {
  if (!str1 || !str2) return 0;
  
  const longer = str1.length > str2.length ? str1 : str2;
  const shorter = str1.length > str2.length ? str2 : str1;
  
  if (longer.length === 0) return 1.0;
  
  const editDistance = levenshteinDistance(longer, shorter);
  return (longer.length - editDistance) / longer.length;
}

// دالة حساب المسافة بين النصوص (Levenshtein Distance)
function levenshteinDistance(str1, str2) {
  const matrix = [];
  
  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }
  
  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }
  
  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  
  return matrix[str2.length][str1.length];
}

// دالة اختيار أفضل قناة من المجموعة المتكررة
function selectBestChannel(duplicateGroup) {
  // ترتيب حسب الأولوية:
  // 1. عدد المشاهدين (الأعلى)
  // 2. تاريخ الإنشاء (الأقدم)
  // 3. جودة البيانات (وجود الاسم العربي)
  
  return duplicateGroup.sort((a, b) => {
    // الأولوية لعدد المشاهدين
    if (a.viewer_count !== b.viewer_count) {
      return (b.viewer_count || 0) - (a.viewer_count || 0);
    }
    
    // ثم تاريخ الإنشاء (الأقدم أفضل)
    const dateA = new Date(a.created_at);
    const dateB = new Date(b.created_at);
    if (dateA.getTime() !== dateB.getTime()) {
      return dateA - dateB;
    }
    
    // ثم جودة البيانات (وجود الاسم العربي)
    const scoreA = (a.name_ar ? 2 : 0) + (a.name ? 1 : 0);
    const scoreB = (b.name_ar ? 2 : 0) + (b.name ? 1 : 0);
    return scoreB - scoreA;
  })[0];
}

// دالة حذف القنوات المتكررة
async function removeDuplicateChannels(duplicates, dryRun = true) {
  try {
    console.log(`\n🗑️  ${dryRun ? 'محاكاة' : 'تنفيذ'} حذف القنوات المتكررة...`);
    console.log('=' .repeat(50));
    
    let totalToDelete = 0;
    let totalDeleted = 0;
    const deletionLog = [];
    
    for (let i = 0; i < duplicates.length; i++) {
      const duplicateGroup = duplicates[i];
      const bestChannel = selectBestChannel(duplicateGroup);
      const channelsToDelete = duplicateGroup.filter(ch => ch.id !== bestChannel.id);
      
      console.log(`\n📋 مجموعة ${i + 1}: ${duplicateGroup.length} قنوات متكررة`);
      console.log(`   ✅ الاحتفاظ بـ: ${bestChannel.name_ar || bestChannel.name} (ID: ${bestChannel.id})`);
      console.log(`      - عدد المشاهدين: ${bestChannel.viewer_count || 0}`);
      console.log(`      - تاريخ الإنشاء: ${bestChannel.created_at}`);
      
      for (const channelToDelete of channelsToDelete) {
        totalToDelete++;
        console.log(`   ❌ حذف: ${channelToDelete.name_ar || channelToDelete.name} (ID: ${channelToDelete.id})`);
        
        if (!dryRun) {
          const { error } = await supabase
            .from('channels')
            .update({ is_active: false })
            .eq('id', channelToDelete.id);
          
          if (error) {
            console.error(`      ⚠️  خطأ في حذف القناة: ${error.message}`);
          } else {
            totalDeleted++;
            deletionLog.push({
              id: channelToDelete.id,
              name: channelToDelete.name_ar || channelToDelete.name,
              kept_instead: bestChannel.name_ar || bestChannel.name
            });
          }
        }
      }
    }
    
    console.log('\n📊 ملخص العملية:');
    console.log('=' .repeat(30));
    console.log(`🔍 مجموعات متكررة وُجدت: ${duplicates.length}`);
    console.log(`🗑️  قنوات مراد حذفها: ${totalToDelete}`);
    
    if (!dryRun) {
      console.log(`✅ قنوات تم حذفها فعلياً: ${totalDeleted}`);
      console.log(`❌ قنوات فشل حذفها: ${totalToDelete - totalDeleted}`);
      
      // حفظ سجل الحذف
      if (deletionLog.length > 0) {
        const fs = require('fs');
        const logFile = `deletion_log_${new Date().toISOString().split('T')[0]}.json`;
        fs.writeFileSync(logFile, JSON.stringify(deletionLog, null, 2));
        console.log(`📝 تم حفظ سجل الحذف في: ${logFile}`);
      }
    } else {
      console.log('ℹ️  هذه محاكاة فقط. لتنفيذ الحذف الفعلي، استخدم المعامل --execute');
    }
    
    return { totalToDelete, totalDeleted, deletionLog };
  } catch (error) {
    console.error('❌ خطأ في حذف القنوات المتكررة:', error.message);
    return { totalToDelete: 0, totalDeleted: 0, deletionLog: [] };
  }
}

// دالة عرض تفاصيل القنوات المتكررة
function displayDuplicates(duplicates) {
  console.log('\n📋 تفاصيل القنوات المتكررة:');
  console.log('=' .repeat(50));
  
  if (duplicates.length === 0) {
    console.log('✅ لا توجد قنوات متكررة!');
    return;
  }
  
  duplicates.forEach((group, index) => {
    console.log(`\n🔗 مجموعة ${index + 1}: ${group.length} قنوات`);
    console.log('-'.repeat(40));
    
    group.forEach((channel, i) => {
      console.log(`   ${i + 1}. ${channel.name_ar || channel.name}`);
      console.log(`      ID: ${channel.id}`);
      console.log(`      الرابط: ${channel.stream_url?.substring(0, 50)}...`);
      console.log(`      البلد: ${channel.country || 'غير محدد'}`);
      console.log(`      المشاهدين: ${channel.viewer_count || 0}`);
      console.log(`      تاريخ الإنشاء: ${channel.created_at}`);
    });
  });
  
  const totalDuplicates = duplicates.reduce((sum, group) => sum + group.length - 1, 0);
  console.log(`\n📊 إجمالي القنوات المتكررة: ${totalDuplicates}`);
}

// الدالة الرئيسية
async function main() {
  try {
    const args = process.argv.slice(2);
    const executeMode = args.includes('--execute');
    const showDetails = args.includes('--details');
    
    console.log('🚀 بدء عملية اكتشاف وحذف القنوات المتكررة');
    console.log('=' .repeat(60));
    
    // البحث عن القنوات المتكررة
    const duplicates = await findDuplicateChannels();
    
    if (showDetails) {
      displayDuplicates(duplicates);
    }
    
    if (duplicates.length > 0) {
      // حذف القنوات المتكررة
      const result = await removeDuplicateChannels(duplicates, !executeMode);
      
      if (executeMode) {
        console.log('\n✅ تمت عملية حذف القنوات المتكررة بنجاح!');
      } else {
        console.log('\n💡 لتنفيذ الحذف الفعلي، استخدم الأمر:');
        console.log('   node remove_duplicate_channels.js --execute');
        console.log('\n💡 لعرض تفاصيل أكثر، استخدم:');
        console.log('   node remove_duplicate_channels.js --details');
      }
    } else {
      console.log('\n✅ لا توجد قنوات متكررة في قاعدة البيانات!');
    }
    
  } catch (error) {
    console.error('❌ خطأ في تنفيذ السكريبت:', error.message);
    process.exit(1);
  }
}

// تشغيل السكريبت
if (require.main === module) {
  main();
}

module.exports = {
  findDuplicateChannels,
  removeDuplicateChannels,
  displayDuplicates
};