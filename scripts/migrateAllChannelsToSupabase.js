const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

// إعداد Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env.local file.');
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// قائمة الفئات مع الكلمات المفتاحية للتصنيف التلقائي
const categories = {
  'أخبار': ['news', 'أخبار', 'إخبارية', 'الأخبار', 'نيوز'],
  'رياضة': ['sport', 'رياضة', 'رياضي', 'كرة', 'الرياضة', 'sports'],
  'ترفيه': ['entertainment', 'ترفيه', 'ترفيهي', 'فن', 'الفن', 'موسيقى'],
  'أطفال': ['kids', 'أطفال', 'طفل', 'children', 'cartoon', 'كرتون'],
  'ثقافة': ['culture', 'ثقافة', 'ثقافي', 'تعليم', 'تعليمي', 'علوم'],
  'دين': ['religion', 'دين', 'ديني', 'إسلامي', 'قرآن', 'دعوة'],
  'أفلام': ['movies', 'أفلام', 'فيلم', 'سينما', 'cinema'],
  'مسلسلات': ['series', 'مسلسلات', 'مسلسل', 'drama', 'دراما'],
  'موسيقى': ['music', 'موسيقى', 'أغاني', 'غناء', 'مطرب'],
  'وثائقي': ['documentary', 'وثائقي', 'وثائقية', 'تاريخ', 'طبيعة'],
  'طبخ': ['cooking', 'طبخ', 'طعام', 'مطبخ', 'وصفات'],
  'عامة': ['general', 'عامة', 'عام', 'متنوع']
};

// دالة لتصنيف القناة تلقائياً
function categorizeChannel(channelName, groupTitle = '') {
  const searchText = (channelName + ' ' + groupTitle).toLowerCase();
  
  for (const [category, keywords] of Object.entries(categories)) {
    for (const keyword of keywords) {
      if (searchText.includes(keyword.toLowerCase())) {
        return category;
      }
    }
  }
  
  return 'عامة'; // الفئة الافتراضية
}

// دالة لقراءة وتوحيد القنوات من جميع المصادر
function loadAllChannels() {
  const allChannels = [];
  const channelSources = [
    { file: path.join(__dirname, 'zomiga_channels.json'), type: 'array' },
    { file: path.join(__dirname, '..', 'additional_channels.json'), type: 'object' },
    { file: path.join(__dirname, '..', 'new_channels_batch.json'), type: 'array' }
  ];

  channelSources.forEach(({ file, type }) => {
    try {
      if (fs.existsSync(file)) {
        const data = JSON.parse(fs.readFileSync(file, 'utf8'));
        const channels = type === 'array' ? data : data.channels;
        
        if (Array.isArray(channels)) {
          channels.forEach(channel => {
            // توحيد هيكل البيانات
            const unifiedChannel = {
              name: channel.name || channel.title || 'قناة غير محددة',
              url: channel.url || channel.link || '',
              logo: channel.logo || channel['tvg-logo'] || '',
              category: channel.category || categorizeChannel(
                channel.name || channel.title || '',
                channel['group-title'] || channel.groupTitle || ''
              ),
              country: channel.country || 'غير محدد',
              language: channel.language || 'عربي',
              tvgId: channel['tvg-id'] || channel.tvgId || '',
              groupTitle: channel['group-title'] || channel.groupTitle || ''
            };
            
            // تجنب التكرار
            const exists = allChannels.find(ch => 
              ch.name === unifiedChannel.name && ch.url === unifiedChannel.url
            );
            
            if (!exists && unifiedChannel.url) {
              allChannels.push(unifiedChannel);
            }
          });
          
          console.log(`تم تحميل ${channels.length} قناة من ${file}`);
        }
      } else {
        console.log(`الملف ${file} غير موجود`);
      }
    } catch (error) {
      console.error(`خطأ في قراءة ${file}:`, error.message);
    }
  });

  return allChannels;
}

// دالة لإنشاء الفئات في قاعدة البيانات
async function createCategories() {
  console.log('إنشاء الفئات...');
  
  for (const categoryName of Object.keys(categories)) {
    try {
      const { data: existingCategory } = await supabase
        .from('channel_categories')
        .select('id')
        .eq('name_ar', categoryName)
        .single();

      if (!existingCategory) {
        const { error } = await supabase
          .from('channel_categories')
          .insert({ 
            name: categoryName,
            name_ar: categoryName,
            is_active: true
          });

        if (error) {
          console.error(`خطأ في إنشاء الفئة ${categoryName}:`, error);
        } else {
          console.log(`تم إنشاء الفئة: ${categoryName}`);
        }
      }
    } catch (error) {
      console.error(`خطأ في التحقق من الفئة ${categoryName}:`, error);
    }
  }
}

// دالة لرفع القنوات
async function uploadChannels(channels) {
  console.log(`بدء رفع ${channels.length} قناة...`);
  
  // حذف القنوات الموجودة
  const { error: deleteError } = await supabase
    .from('channels')
    .delete()
    .gt('id', 0);

  if (deleteError) {
    console.error('خطأ في حذف القنوات الموجودة:', deleteError);
    // لا نتوقف هنا، قد تكون القنوات غير موجودة أصلاً
  } else {
    console.log('تم حذف القنوات الموجودة');
  }

  // الحصول على معرفات الفئات
  const { data: categoriesData } = await supabase
    .from('channel_categories')
    .select('id, name_ar');

  const categoryMap = {};
  categoriesData.forEach(cat => {
    categoryMap[cat.name_ar] = cat.id;
  });

  // رفع القنوات على دفعات
  const batchSize = 50;
  let uploadedCount = 0;
  
  for (let i = 0; i < channels.length; i += batchSize) {
    const batch = channels.slice(i, i + batchSize);
    
    const channelsToInsert = batch.map(channel => ({
      name: channel.name,
      name_ar: channel.name,
      stream_url: channel.url,
      logo_url: channel.logo,
      category_id: categoryMap[channel.category] || categoryMap['عامة'],
      country: channel.country,
      language: channel.language,
      is_active: true,
      is_live: true
    }));

    const { error } = await supabase
      .from('channels')
      .insert(channelsToInsert);

    if (error) {
      console.error(`خطأ في رفع الدفعة ${Math.floor(i/batchSize) + 1}:`, error);
    } else {
      uploadedCount += batch.length;
      console.log(`تم رفع ${uploadedCount} من ${channels.length} قناة`);
    }
  }

  return uploadedCount;
}

// الدالة الرئيسية
async function main() {
  try {
    console.log('بدء عملية دمج ورفع جميع القنوات...');
    
    // اختبار الاتصال بـ Supabase
    const { data, error } = await supabase.from('channel_categories').select('count').limit(1);
    if (error) {
      console.error('خطأ في الاتصال بـ Supabase:', error);
      return;
    }
    console.log('تم الاتصال بـ Supabase بنجاح');

    // إنشاء الفئات
    await createCategories();

    // تحميل جميع القنوات
    const allChannels = loadAllChannels();
    console.log(`تم تحميل إجمالي ${allChannels.length} قناة من جميع المصادر`);

    if (allChannels.length === 0) {
      console.log('لا توجد قنوات للرفع');
      return;
    }

    // رفع القنوات
    const uploadedCount = await uploadChannels(allChannels);
    
    console.log(`\n✅ تم بنجاح:`);
    console.log(`- رفع ${uploadedCount} قناة`);
    console.log(`- تصنيف القنوات تلقائياً حسب الفئات`);
    console.log(`- دمج جميع مصادر القنوات`);
    
  } catch (error) {
    console.error('خطأ عام:', error);
  }
}

// تشغيل السكريپت
if (require.main === module) {
  main();
}

module.exports = { main, loadAllChannels, categorizeChannel };