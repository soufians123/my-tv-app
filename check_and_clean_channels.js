const fs = require('fs');
const https = require('https');
const http = require('http');
const { URL } = require('url');

// قراءة ملف القنوات
function loadChannels() {
  try {
    const data = fs.readFileSync('./zomiga_channels.json', 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('خطأ في قراءة ملف القنوات:', error);
    return [];
  }
}

// حفظ القنوات
function saveChannels(channels) {
  try {
    fs.writeFileSync('./zomiga_channels.json', JSON.stringify(channels, null, 2));
    return true;
  } catch (error) {
    console.error('خطأ في حفظ ملف القنوات:', error);
    return false;
  }
}

// فحص حالة القناة
function checkChannelStatus(url, timeout = 10000) {
  return new Promise((resolve) => {
    try {
      const urlObj = new URL(url);
      const protocol = urlObj.protocol === 'https:' ? https : http;
      
      const req = protocol.get(url, {
        timeout: timeout,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      }, (res) => {
        if (res.statusCode >= 200 && res.statusCode < 400) {
          resolve({ working: true, status: res.statusCode });
        } else {
          resolve({ working: false, status: res.statusCode, error: `HTTP ${res.statusCode}` });
        }
        req.destroy();
      });
      
      req.on('timeout', () => {
        req.destroy();
        resolve({ working: false, error: 'Timeout' });
      });
      
      req.on('error', (error) => {
        resolve({ working: false, error: error.message });
      });
      
    } catch (error) {
      resolve({ working: false, error: error.message });
    }
  });
}

// تصنيف القنوات حسب المحتوى
function categorizeChannel(name, description = '') {
  const nameAndDesc = (name + ' ' + description).toLowerCase();
  
  // القنوات الإخبارية
  if (nameAndDesc.match(/(news|إخبار|أخبار|نيوز|الإخبارية|خبر)/)) {
    return 'إخبارية';
  }
  
  // القنوات الرياضية
  if (nameAndDesc.match(/(sport|رياض|كرة|football|soccer|الرياضية)/)) {
    return 'رياضية';
  }
  
  // قنوات الأطفال
  if (nameAndDesc.match(/(kids|children|أطفال|طفل|كرتون|cartoon)/)) {
    return 'أطفال';
  }
  
  // القنوات الدينية
  if (nameAndDesc.match(/(قرآن|دين|إسلام|مسيح|كنيسة|دعوة|الحج|صلاة)/)) {
    return 'دينية';
  }
  
  // القنوات الموسيقية
  if (nameAndDesc.match(/(music|موسيق|أغان|غناء|طرب|song)/)) {
    return 'موسيقية';
  }
  
  // قنوات الأفلام
  if (nameAndDesc.match(/(movie|film|أفلام|سينما|cinema)/)) {
    return 'أفلام ومسلسلات';
  }
  
  // القنوات الوثائقية
  if (nameAndDesc.match(/(documentary|وثائق|تاريخ|علوم|طبيعة|جغراف)/)) {
    return 'وثائقية';
  }
  
  // القنوات التعليمية
  if (nameAndDesc.match(/(education|تعليم|جامعة|مدرسة|تربوي)/)) {
    return 'تعليمية';
  }
  
  // قنوات الطبخ
  if (nameAndDesc.match(/(cook|طبخ|مطبخ|وصفة|أكل)/)) {
    return 'طبخ';
  }
  
  // القنوات المغربية
  if (nameAndDesc.match(/(المغرب|مغرب|morocco|2m|snrt|الأولى)/)) {
    return 'قنوات مغربية';
  }
  
  // القنوات الترفيهية
  if (nameAndDesc.match(/(entertainment|ترفيه|تسلية|مسرح|كوميد)/)) {
    return 'ترفيهية';
  }
  
  // القنوات الثقافية
  if (nameAndDesc.match(/(culture|ثقاف|أدب|فن|heritage)/)) {
    return 'ثقافية';
  }
  
  // افتراضي: عامة
  return 'عامة';
}

// الدالة الرئيسية
async function checkAndCleanChannels() {
  console.log('🔍 بدء فحص القنوات...');
  
  const channels = loadChannels();
  console.log(`📊 إجمالي القنوات: ${channels.length}`);
  
  const workingChannels = [];
  const brokenChannels = [];
  const recategorizedChannels = [];
  
  let processed = 0;
  
  for (const channel of channels) {
    processed++;
    console.log(`\n[${processed}/${channels.length}] فحص: ${channel.name}`);
    
    // فحص حالة القناة
    const status = await checkChannelStatus(channel.url);
    
    if (status.working) {
      console.log(`✅ تعمل بشكل طبيعي`);
      
      // إعادة تصنيف القناة
      const newCategory = categorizeChannel(channel.name, channel.description);
      const oldCategory = channel.category;
      
      if (newCategory !== oldCategory) {
        console.log(`🔄 إعادة تصنيف من "${oldCategory}" إلى "${newCategory}"`);
        recategorizedChannels.push({
          name: channel.name,
          oldCategory,
          newCategory
        });
      }
      
      workingChannels.push({
        ...channel,
        category: newCategory,
        lastChecked: new Date().toISOString().split('T')[0],
        status: 'active'
      });
    } else {
      console.log(`❌ لا تعمل - ${status.error}`);
      brokenChannels.push({
        name: channel.name,
        url: channel.url,
        error: status.error,
        category: channel.category
      });
    }
    
    // تأخير قصير لتجنب الحمل الزائد
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  // حفظ النتائج
  console.log('\n💾 حفظ النتائج...');
  
  // حفظ القنوات العاملة
  if (saveChannels(workingChannels)) {
    console.log(`✅ تم حفظ ${workingChannels.length} قناة عاملة`);
  }
  
  // حفظ تقرير القنوات المحذوفة
  const deletionReport = {
    date: new Date().toISOString(),
    totalChannels: channels.length,
    workingChannels: workingChannels.length,
    brokenChannels: brokenChannels.length,
    recategorizedChannels: recategorizedChannels.length,
    deletedChannels: brokenChannels,
    recategorizations: recategorizedChannels
  };
  
  fs.writeFileSync(
    `./deletion_report_${new Date().toISOString().split('T')[0]}.json`,
    JSON.stringify(deletionReport, null, 2)
  );
  
  // طباعة التقرير النهائي
  console.log('\n📋 التقرير النهائي:');
  console.log(`📊 إجمالي القنوات المفحوصة: ${channels.length}`);
  console.log(`✅ القنوات العاملة: ${workingChannels.length}`);
  console.log(`❌ القنوات المحذوفة: ${brokenChannels.length}`);
  console.log(`🔄 القنوات المعاد تصنيفها: ${recategorizedChannels.length}`);
  
  if (brokenChannels.length > 0) {
    console.log('\n❌ القنوات المحذوفة:');
    brokenChannels.forEach(ch => {
      console.log(`  - ${ch.name} (${ch.error})`);
    });
  }
  
  if (recategorizedChannels.length > 0) {
    console.log('\n🔄 القنوات المعاد تصنيفها:');
    recategorizedChannels.forEach(ch => {
      console.log(`  - ${ch.name}: ${ch.oldCategory} → ${ch.newCategory}`);
    });
  }
  
  console.log('\n🎉 تم الانتهاء من تنظيف وتصنيف القنوات!');
}

// تشغيل السكريبت
if (require.main === module) {
  checkAndCleanChannels().catch(console.error);
}

module.exports = { checkAndCleanChannels, categorizeChannel };