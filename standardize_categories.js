const { createClient } = require('@supabase/supabase-js');

// تحميل متغيرات البيئة
require('dotenv').config({ path: '.env.local' });

// إعداد Supabase
const supabaseUrl = 'https://jrtctjgdkvkdrjcbbbaz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpydGN0amdka3ZrZHJqY2JiYmF6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYwMzgyMzksImV4cCI6MjA3MTYxNDIzOX0.39DoF_bU7Yp8MuYoDffNab8h8T-FmvI3u4XJTQ0iX1Q';

const supabase = createClient(supabaseUrl, supabaseKey);

// الفئات المعيارية المطلوبة
const standardCategories = [
  {
    name: 'إخبارية',
    name_ar: 'إخبارية',
    description: 'القنوات الإخبارية والأخبار',
    icon: '📰',
    color: '#DC2626',
    sort_order: 1
  },
  {
    name: 'رياضية',
    name_ar: 'رياضية',
    description: 'القنوات الرياضية وكرة القدم',
    icon: '⚽',
    color: '#059669',
    sort_order: 2
  },
  {
    name: 'ترفيهية',
    name_ar: 'ترفيهية',
    description: 'قنوات الترفيه والمسلسلات والدراما',
    icon: '🎭',
    color: '#7C3AED',
    sort_order: 3
  },
  {
    name: 'أفلام',
    name_ar: 'أفلام',
    description: 'قنوات الأفلام والسينما',
    icon: '🎬',
    color: '#DC2626',
    sort_order: 4
  },
  {
    name: 'أطفال',
    name_ar: 'أطفال',
    description: 'قنوات الأطفال والكرتون',
    icon: '🧸',
    color: '#F59E0B',
    sort_order: 5
  },
  {
    name: 'موسيقية',
    name_ar: 'موسيقية',
    description: 'القنوات الموسيقية والأغاني',
    icon: '🎵',
    color: '#EC4899',
    sort_order: 6
  },
  {
    name: 'دينية',
    name_ar: 'دينية',
    description: 'القنوات الدينية والقرآن الكريم',
    icon: '🕌',
    color: '#059669',
    sort_order: 7
  },
  {
    name: 'وثائقية',
    name_ar: 'وثائقية',
    description: 'القنوات الوثائقية والعلمية',
    icon: '📚',
    color: '#0891B2',
    sort_order: 8
  },
  {
    name: 'تعليمية',
    name_ar: 'تعليمية',
    description: 'القنوات التعليمية والثقافية',
    icon: '🎓',
    color: '#0891B2',
    sort_order: 9
  },
  {
    name: 'طبخ',
    name_ar: 'طبخ',
    description: 'قنوات الطبخ والمأكولات',
    icon: '👨‍🍳',
    color: '#F59E0B',
    sort_order: 10
  },
  {
    name: 'قنوات مغربية',
    name_ar: 'قنوات مغربية',
    description: 'القنوات المغربية المحلية',
    icon: '🇲🇦',
    color: '#DC2626',
    sort_order: 11
  },
  {
    name: 'عامة',
    name_ar: 'عامة',
    description: 'القنوات العامة والمتنوعة',
    icon: '📺',
    color: '#6B7280',
    sort_order: 12
  }
];

// خريطة دمج الفئات المكررة
const categoryMergeMap = {
  'الأخبار': 'إخبارية',
  'أخبار': 'إخبارية',
  'الرياضة': 'رياضية',
  'رياضة': 'رياضية',
  'الأطفال': 'أطفال',
  'طفل': 'أطفال',
  'الموسيقى': 'موسيقية',
  'موسيقى': 'موسيقية',
  'الأفلام': 'أفلام',
  'أفلام ومسلسلات': 'أفلام',
  'الترفيه': 'ترفيهية',
  'ترفيه': 'ترفيهية',
  'الدينية': 'دينية',
  'إسلامية': 'دينية',
  'اسلامية': 'دينية',
  'التعليمية': 'تعليمية',
  'تعليم': 'تعليمية',
  'العامة': 'عامة',
  'عام': 'عامة',
  'منوعات': 'عامة',
  'المنوعات': 'عامة'
};

async function standardizeCategories() {
  try {
    console.log('🔧 بدء عملية توحيد الفئات...');
    console.log('=' .repeat(50));
    
    // الحصول على جميع الفئات الحالية
    const { data: existingCategories, error: fetchError } = await supabase
      .from('channel_categories')
      .select('*');
    
    if (fetchError) {
      console.error('خطأ في الحصول على الفئات:', fetchError.message);
      return;
    }
    
    console.log(`📊 عدد الفئات الحالية: ${existingCategories.length}`);
    
    // إنشاء خريطة للفئات المعيارية
    const standardCategoryMap = {};
    
    // إنشاء أو تحديث الفئات المعيارية
    console.log('\n📝 إنشاء/تحديث الفئات المعيارية...');
    for (const stdCategory of standardCategories) {
      // البحث عن فئة موجودة بنفس الاسم
      const existing = existingCategories.find(cat => 
        cat.name_ar === stdCategory.name_ar || cat.name === stdCategory.name
      );
      
      if (existing) {
        // تحديث الفئة الموجودة
        const { error: updateError } = await supabase
          .from('channel_categories')
          .update({
            name: stdCategory.name,
            name_ar: stdCategory.name_ar,
            description: stdCategory.description,
            icon: stdCategory.icon,
            color: stdCategory.color,
            sort_order: stdCategory.sort_order,
            is_active: true
          })
          .eq('id', existing.id);
        
        if (updateError) {
          console.error(`خطأ في تحديث فئة ${stdCategory.name_ar}:`, updateError.message);
        } else {
          console.log(`✅ تم تحديث فئة: ${stdCategory.name_ar}`);
          standardCategoryMap[stdCategory.name_ar] = existing.id;
        }
      } else {
        // إنشاء فئة جديدة
        const { data: newCategory, error: createError } = await supabase
          .from('channel_categories')
          .insert(stdCategory)
          .select('id')
          .single();
        
        if (createError) {
          console.error(`خطأ في إنشاء فئة ${stdCategory.name_ar}:`, createError.message);
        } else {
          console.log(`🆕 تم إنشاء فئة جديدة: ${stdCategory.name_ar}`);
          standardCategoryMap[stdCategory.name_ar] = newCategory.id;
        }
      }
    }
    
    // دمج الفئات المكررة
    console.log('\n🔄 دمج الفئات المكررة...');
    let mergedCount = 0;
    
    for (const [oldName, newName] of Object.entries(categoryMergeMap)) {
      // البحث عن الفئة القديمة
      const oldCategory = existingCategories.find(cat => 
        cat.name_ar === oldName || cat.name === oldName
      );
      
      if (oldCategory && standardCategoryMap[newName]) {
        // نقل جميع القنوات من الفئة القديمة إلى الجديدة
        const { error: updateChannelsError } = await supabase
          .from('channels')
          .update({ category_id: standardCategoryMap[newName] })
          .eq('category_id', oldCategory.id);
        
        if (updateChannelsError) {
          console.error(`خطأ في نقل القنوات من ${oldName} إلى ${newName}:`, updateChannelsError.message);
        } else {
          // حذف الفئة القديمة
          const { error: deleteError } = await supabase
            .from('channel_categories')
            .delete()
            .eq('id', oldCategory.id);
          
          if (deleteError) {
            console.error(`خطأ في حذف فئة ${oldName}:`, deleteError.message);
          } else {
            console.log(`🔄 تم دمج فئة "${oldName}" مع "${newName}"`);
            mergedCount++;
          }
        }
      }
    }
    
    // حذف الفئات غير المستخدمة
    console.log('\n🗑️  حذف الفئات غير المستخدمة...');
    const { data: unusedCategories, error: unusedError } = await supabase
      .from('channel_categories')
      .select(`
        id, name_ar,
        channels(count)
      `);
    
    if (!unusedError) {
      let deletedCount = 0;
      for (const category of unusedCategories) {
        if (!category.channels || category.channels.length === 0) {
          // التأكد من أنها ليست من الفئات المعيارية
          const isStandard = standardCategories.some(std => std.name_ar === category.name_ar);
          if (!isStandard) {
            const { error: deleteError } = await supabase
              .from('channel_categories')
              .delete()
              .eq('id', category.id);
            
            if (!deleteError) {
              console.log(`🗑️  تم حذف فئة غير مستخدمة: ${category.name_ar}`);
              deletedCount++;
            }
          }
        }
      }
      
      if (deletedCount === 0) {
        console.log('✅ لا توجد فئات غير مستخدمة للحذف');
      }
    }
    
    // إحصائيات نهائية
    const { data: finalCategories, error: finalError } = await supabase
      .from('channel_categories')
      .select('*')
      .order('sort_order');
    
    if (!finalError) {
      console.log('\n🎉 انتهت عملية توحيد الفئات!');
      console.log('=' .repeat(50));
      console.log(`📊 إحصائيات العملية:`);
      console.log(`   - فئات مدمجة: ${mergedCount}`);
      console.log(`   - إجمالي الفئات النهائية: ${finalCategories.length}`);
      
      console.log('\n📋 الفئات النهائية:');
      finalCategories.forEach((cat, index) => {
        console.log(`${index + 1}. ${cat.icon || '📺'} ${cat.name_ar} (${cat.color || '#6B7280'})`);
      });
    }
    
  } catch (error) {
    console.error('خطأ عام في توحيد الفئات:', error.message);
  }
}

// تشغيل السكريبت
if (require.main === module) {
  standardizeCategories();
}

module.exports = { standardizeCategories, standardCategories };