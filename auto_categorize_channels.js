const { createClient } = require('@supabase/supabase-js');

// تحميل متغيرات البيئة
require('dotenv').config({ path: '.env.local' });

// إعداد Supabase
const supabaseUrl = 'https://jrtctjgdkvkdrjcbbbaz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpydGN0amdka3ZrZHJqY2JiYmF6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYwMzgyMzksImV4cCI6MjA3MTYxNDIzOX0.39DoF_bU7Yp8MuYoDffNab8h8T-FmvI3u4XJTQ0iX1Q';

const supabase = createClient(supabaseUrl, supabaseKey);

// قواعد التصنيف الذكي
const categorizationRules = {
  // القنوات الإخبارية
  'إخبارية': {
    keywords: ['news', 'أخبار', 'الأخبار', 'نيوز', 'إخبارية', 'الجزيرة', 'العربية', 'bbc', 'cnn', 'france24', 'dw', 'rt', 'sky', 'aljazeera', 'alarabiya', 'alhurra', 'الحرة', 'الإخبارية'],
    priority: 1
  },
  
  // القنوات الرياضية
  'رياضية': {
    keywords: ['sport', 'sports', 'رياضة', 'رياضية', 'كرة', 'football', 'soccer', 'kora', 'الرياضية', 'رياضي', 'الكرة', 'فوتبول', 'كأس', 'دوري', 'الدوري', 'champions', 'fifa', 'uefa', 'الأهلي', 'الزمالك', 'ريال مدريد', 'برشلونة'],
    priority: 1
  },
  
  // قنوات الأطفال
  'أطفال': {
    keywords: ['kids', 'children', 'أطفال', 'الأطفال', 'طفل', 'cartoon', 'كرتون', 'baby', 'junior', 'براعم', 'سبيستون', 'spacetoon', 'disney', 'ديزني', 'tom', 'jerry', 'mickey'],
    priority: 1
  },
  
  // القنوات الموسيقية
  'موسيقية': {
    keywords: ['music', 'موسيقى', 'موسيقية', 'أغاني', 'songs', 'اغاني', 'الموسيقى', 'مزيكا', 'ميوزك', 'rotana', 'روتانا', 'melody', 'ميلودي', 'mtv', 'الأغاني'],
    priority: 1
  },
  
  // قنوات الأفلام
  'أفلام': {
    keywords: ['movies', 'cinema', 'أفلام', 'الأفلام', 'فيلم', 'سينما', 'السينما', 'movie', 'film', 'hollywood', 'bollywood', 'aflam', 'الفيلم'],
    priority: 1
  },
  
  // القنوات الدينية
  'دينية': {
    keywords: ['quran', 'قرآن', 'القرآن', 'إسلامية', 'اسلامية', 'دينية', 'الدينية', 'مكة', 'المدينة', 'الحرم', 'islamic', 'religion', 'دين', 'الدين', 'مسيحية', 'christian', 'الكنيسة', 'church'],
    priority: 1
  },
  
  // القنوات الوثائقية
  'وثائقية': {
    keywords: ['documentary', 'وثائقية', 'الوثائقية', 'وثائق', 'discovery', 'ديسكفري', 'national geographic', 'ناشيونال جيوغرافيك', 'history', 'التاريخ', 'تاريخ', 'علوم', 'العلوم', 'science'],
    priority: 1
  },
  
  // قنوات الطبخ
  'طبخ': {
    keywords: ['cooking', 'طبخ', 'الطبخ', 'مطبخ', 'المطبخ', 'طعام', 'الطعام', 'food', 'chef', 'شيف', 'الشيف', 'وصفات', 'الوصفات', 'recipe'],
    priority: 1
  },
  
  // القنوات التعليمية
  'تعليمية': {
    keywords: ['education', 'تعليمية', 'التعليمية', 'تعليم', 'التعليم', 'مدرسة', 'المدرسة', 'جامعة', 'الجامعة', 'دروس', 'الدروس', 'تدريس', 'التدريس'],
    priority: 1
  },
  
  // القنوات المغربية
  'قنوات مغربية': {
    keywords: ['2m', 'morocco', 'maroc', 'المغرب', 'مغربية', 'المغربية', 'مغرب', 'medi1', 'الأولى', 'الثانية', 'tamazight', 'الأمازيغية', 'snrt'],
    priority: 2
  },
  
  // القنوات الترفيهية
  'ترفيهية': {
    keywords: ['entertainment', 'ترفيه', 'الترفيه', 'ترفيهية', 'الترفيهية', 'مسلسلات', 'المسلسلات', 'مسلسل', 'drama', 'دراما', 'الدراما', 'كوميديا', 'comedy', 'مسرح', 'المسرح'],
    priority: 1
  },
  
  // القنوات العامة (افتراضية)
  'عامة': {
    keywords: ['general', 'عامة', 'العامة', 'عام', 'العام', 'متنوعة', 'المتنوعة', 'منوعات', 'المنوعات'],
    priority: 0
  }
};

// دالة تصنيف القناة بناءً على الاسم
function categorizeChannel(channelName, channelCountry = '') {
  const name = channelName.toLowerCase();
  const country = channelCountry.toLowerCase();
  
  let bestMatch = null;
  let highestPriority = -1;
  
  // البحث في قواعد التصنيف
  for (const [category, rule] of Object.entries(categorizationRules)) {
    for (const keyword of rule.keywords) {
      if (name.includes(keyword.toLowerCase())) {
        if (rule.priority > highestPriority) {
          bestMatch = category;
          highestPriority = rule.priority;
        }
      }
    }
  }
  
  // إذا لم نجد تطابق، نحاول التصنيف حسب البلد
  if (!bestMatch) {
    if (country === 'المغرب' || country === 'morocco') {
      return 'قنوات مغربية';
    }
  }
  
  return bestMatch || 'عامة';
}

// دالة الحصول على معرف الفئة
async function getCategoryId(categoryName) {
  const { data, error } = await supabase
    .from('channel_categories')
    .select('id')
    .eq('name_ar', categoryName)
    .single();
  
  if (error || !data) {
    // إنشاء فئة جديدة إذا لم تكن موجودة
    const { data: newCategory, error: createError } = await supabase
      .from('channel_categories')
      .insert({
        name: categoryName,
        name_ar: categoryName,
        description: `فئة ${categoryName}`,
        is_active: true
      })
      .select('id')
      .single();
    
    if (createError) {
      console.error(`خطأ في إنشاء فئة ${categoryName}:`, createError.message);
      return null;
    }
    
    console.log(`✅ تم إنشاء فئة جديدة: ${categoryName}`);
    return newCategory.id;
  }
  
  return data.id;
}

// دالة إعادة تصنيف جميع القنوات
async function recategorizeAllChannels() {
  try {
    console.log('🚀 بدء عملية إعادة التصنيف التلقائي...');
    console.log('=' .repeat(50));
    
    // الحصول على جميع القنوات
    const { data: channels, error } = await supabase
      .from('channels')
      .select('id, name, name_ar, country, category_id');
    
    if (error) {
      console.error('خطأ في الحصول على القنوات:', error.message);
      return;
    }
    
    console.log(`📊 عدد القنوات المراد إعادة تصنيفها: ${channels.length}`);
    
    let processed = 0;
    let updated = 0;
    let errors = 0;
    const categoryStats = {};
    
    // معالجة القنوات في مجموعات
    const batchSize = 50;
    for (let i = 0; i < channels.length; i += batchSize) {
      const batch = channels.slice(i, i + batchSize);
      
      for (const channel of batch) {
        try {
          processed++;
          
          // تحديد الفئة المناسبة
          const channelName = channel.name_ar || channel.name;
          const suggestedCategory = categorizeChannel(channelName, channel.country);
          
          // الحصول على معرف الفئة
          const categoryId = await getCategoryId(suggestedCategory);
          
          if (categoryId && categoryId !== channel.category_id) {
            // تحديث القناة
            const { error: updateError } = await supabase
              .from('channels')
              .update({ category_id: categoryId })
              .eq('id', channel.id);
            
            if (updateError) {
              console.error(`خطأ في تحديث القناة ${channelName}:`, updateError.message);
              errors++;
            } else {
              updated++;
              categoryStats[suggestedCategory] = (categoryStats[suggestedCategory] || 0) + 1;
              
              if (updated % 10 === 0) {
                console.log(`⏳ تم تحديث ${updated} قناة من أصل ${processed} قناة معالجة...`);
              }
            }
          }
          
        } catch (channelError) {
          console.error(`خطأ في معالجة القناة ${channel.name}:`, channelError.message);
          errors++;
        }
      }
      
      // توقف قصير بين المجموعات
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    console.log('\n🎉 انتهت عملية إعادة التصنيف!');
    console.log('=' .repeat(50));
    console.log(`📊 إحصائيات العملية:`);
    console.log(`   - قنوات معالجة: ${processed}`);
    console.log(`   - قنوات محدثة: ${updated}`);
    console.log(`   - أخطاء: ${errors}`);
    
    if (Object.keys(categoryStats).length > 0) {
      console.log('\n📈 توزيع القنوات المحدثة:');
      Object.entries(categoryStats)
        .sort(([,a], [,b]) => b - a)
        .forEach(([category, count]) => {
          console.log(`   - ${category}: ${count} قناة`);
        });
    }
    
  } catch (error) {
    console.error('خطأ عام في عملية إعادة التصنيف:', error.message);
  }
}

// تشغيل السكريبت
if (require.main === module) {
  recategorizeAllChannels();
}

module.exports = { categorizeChannel, getCategoryId, recategorizeAllChannels };