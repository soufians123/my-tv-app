const { supabase } = require('./lib/supabase');
const fs = require('fs');

// قراءة ملف القنوات
const channelsData = JSON.parse(fs.readFileSync('./channels_data.json', 'utf8'));

// تصنيف القنوات حسب الفئات العربية
function categorizeChannel(channel) {
  const name = channel.name.toLowerCase();
  const groupTitle = channel['group-title']?.toLowerCase() || '';
  
  // القنوات المغربية
  if (name.includes('2m') || name.includes('morocco') || name.includes('maroc') || 
      name.includes('medi1') || name.includes('maghreb')) {
    return 'قنوات مغربية';
  }
  
  // القنوات الإخبارية
  if (groupTitle.includes('news') || name.includes('news') || name.includes('أخبار') ||
      name.includes('aljazeera') || name.includes('alarabiya') || name.includes('bbc')) {
    return 'إخبارية';
  }
  
  // القنوات الرياضية
  if (groupTitle.includes('sports') || name.includes('sport') || name.includes('رياضة') ||
      name.includes('kora') || name.includes('football') || name.includes('soccer')) {
    return 'رياضية';
  }
  
  // قنوات الأطفال
  if (groupTitle.includes('kids') || name.includes('kids') || name.includes('children') ||
      name.includes('أطفال') || name.includes('cartoon') || name.includes('baby')) {
    return 'أطفال';
  }
  
  // القنوات الموسيقية
  if (groupTitle.includes('music') || name.includes('music') || name.includes('موسيقى') ||
      name.includes('songs') || name.includes('aghani')) {
    return 'موسيقية';
  }
  
  // قنوات الأفلام
  if (groupTitle.includes('movies') || name.includes('cinema') || name.includes('aflam') ||
      name.includes('film') || name.includes('أفلام')) {
    return 'أفلام ومسلسلات';
  }
  
  // القنوات الدينية
  if (groupTitle.includes('religious') || name.includes('quran') || name.includes('قرآن') ||
      name.includes('islamic') || name.includes('دينية') || name.includes('إسلامية')) {
    return 'دينية';
  }
  
  // قنوات الطبخ
  if (name.includes('cooking') || name.includes('food') || name.includes('طبخ') ||
      name.includes('chef') || name.includes('recipe')) {
    return 'طبخ';
  }
  
  // القنوات الوثائقية
  if (groupTitle.includes('documentary') || name.includes('discovery') || 
      name.includes('national geographic') || name.includes('وثائقية')) {
    return 'وثائقية';
  }
  
  // القنوات التعليمية
  if (name.includes('education') || name.includes('learning') || name.includes('تعليمية') ||
      name.includes('university') || name.includes('school')) {
    return 'تعليمية';
  }
  
  // القنوات الثقافية
  if (name.includes('culture') || name.includes('art') || name.includes('ثقافية') ||
      name.includes('literature') || name.includes('poetry')) {
    return 'ثقافية';
  }
  
  // القنوات الترفيهية
  if (groupTitle.includes('entertainment') || name.includes('entertainment') ||
      name.includes('variety') || name.includes('ترفيهية')) {
    return 'ترفيهية';
  }
  
  // افتراضي: عامة
  return 'عامة';
}

// تحديد الدولة
function getCountry(channel) {
  const name = channel.name.toLowerCase();
  
  if (name.includes('2m') || name.includes('morocco') || name.includes('maroc')) return 'المغرب';
  if (name.includes('saudi') || name.includes('ksa') || name.includes('riyadh')) return 'السعودية';
  if (name.includes('uae') || name.includes('dubai') || name.includes('abu dhabi')) return 'الإمارات';
  if (name.includes('egypt') || name.includes('cairo') || name.includes('nile')) return 'مصر';
  if (name.includes('qatar') || name.includes('doha')) return 'قطر';
  if (name.includes('kuwait')) return 'الكويت';
  if (name.includes('bahrain')) return 'البحرين';
  if (name.includes('oman')) return 'عمان';
  if (name.includes('jordan') || name.includes('amman')) return 'الأردن';
  if (name.includes('lebanon') || name.includes('beirut')) return 'لبنان';
  if (name.includes('syria') || name.includes('damascus')) return 'سوريا';
  if (name.includes('iraq') || name.includes('baghdad')) return 'العراق';
  if (name.includes('algeria') || name.includes('algiers')) return 'الجزائر';
  if (name.includes('tunisia') || name.includes('tunis')) return 'تونس';
  if (name.includes('libya') || name.includes('tripoli')) return 'ليبيا';
  if (name.includes('sudan') || name.includes('khartoum')) return 'السودان';
  if (name.includes('yemen') || name.includes('sanaa')) return 'اليمن';
  if (name.includes('palestine') || name.includes('gaza')) return 'فلسطين';
  
  return 'عربية';
}

// تحديد الجودة
function getQuality(channel) {
  const name = channel.name.toLowerCase();
  if (name.includes('4k')) return '4K';
  if (name.includes('1080p') || name.includes('fhd')) return 'FHD';
  if (name.includes('720p') || name.includes('hd')) return 'HD';
  return 'SD';
}

async function importChannels() {
  try {
    console.log('بدء استيراد القنوات...');
    
    let successCount = 0;
    let errorCount = 0;
    
    for (const channel of channelsData.channels) {
      try {
        const channelData = {
          name: channel.name,
          url: channel.url,
          logo_url: channel['tvg-logo'] || null,
          category_name: categorizeChannel(channel),
          language: 'العربية',
          quality: getQuality(channel),
          country: getCountry(channel),
          description: `قناة ${channel.name}`,
          is_active: true,
          sort_order: successCount + 1
        };
        
        const { error } = await supabase
          .from('channels')
          .insert([channelData]);
        
        if (error) {
          console.error(`خطأ في إضافة ${channel.name}:`, error.message);
          errorCount++;
        } else {
          console.log(`تم إضافة: ${channel.name} - ${channelData.category_name}`);
          successCount++;
        }
      } catch (err) {
        console.error(`خطأ في معالجة ${channel.name}:`, err.message);
        errorCount++;
      }
    }
    
    console.log(`\nتم الانتهاء من الاستيراد:`);
    console.log(`القنوات المضافة بنجاح: ${successCount}`);
    console.log(`الأخطاء: ${errorCount}`);
    
  } catch (error) {
    console.error('خطأ عام في الاستيراد:', error.message);
  }
}

importChannels();