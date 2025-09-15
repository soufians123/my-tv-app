import { supabase } from '../../../lib/supabase'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // التحقق من صلاحيات الإدارة (يمكن إضافة التحقق لاحقاً)
    
    // تحديد الفئات المكررة والحلول
    const duplicateMap = {
      'أخبار': 'إخبارية',
      'رياضة': 'رياضية', 
      'وثائقي': 'وثائقية',
      'ثقافة': 'ثقافية',
      'ترفيه': 'ترفيهية',
      'أفلام': 'أفلام ومسلسلات',
      'مسلسلات': 'أفلام ومسلسلات',
      'دين': 'دينية'
    };
    
    console.log('🔧 بدء عملية دمج الفئات المكررة...');
    
    // جلب جميع الفئات
    const { data: categories, error: categoriesError } = await supabase
      .from('channel_categories')
      .select('*')
      .eq('is_active', true)
    
    if (categoriesError) {
      console.error('خطأ في جلب الفئات:', categoriesError)
      return res.status(500).json({ error: 'Failed to fetch categories' })
    }
    
    const categoriesToMerge = []
    const categoriesToDelete = []
    
    // البحث عن الفئات المكررة
    categories.forEach(category => {
      const categoryName = category.name || category.name_ar
      
      if (duplicateMap[categoryName]) {
        const targetName = duplicateMap[categoryName]
        const targetCategory = categories.find(cat => 
          (cat.name === targetName || cat.name_ar === targetName)
        )
        
        if (targetCategory) {
          categoriesToMerge.push({
            sourceId: category.id,
            sourceName: categoryName,
            targetId: targetCategory.id,
            targetName: targetName
          })
        }
      }
    })
    
    if (categoriesToMerge.length === 0) {
      return res.status(200).json({ 
        success: true, 
        message: 'لا توجد فئات مكررة للدمج',
        merged: 0,
        updated: 0
      })
    }
    
    console.log(`سيتم دمج ${categoriesToMerge.length} فئة مكررة`)
    
    let totalUpdated = 0
    let totalMerged = 0
    
    // تحديث القنوات لكل فئة مكررة
    for (const mergeInfo of categoriesToMerge) {
      console.log(`دمج ${mergeInfo.sourceName} مع ${mergeInfo.targetName}...`)
      
      // تحديث جميع القنوات من الفئة المصدر إلى الفئة الهدف
      const { data: updatedChannels, error: updateError } = await supabase
        .from('channels')
        .update({ category_id: mergeInfo.targetId })
        .eq('category_id', mergeInfo.sourceId)
        .select('id')
      
      if (updateError) {
        console.error(`خطأ في تحديث القنوات من ${mergeInfo.sourceName}:`, updateError)
        continue
      }
      
      const updatedCount = updatedChannels?.length || 0
      totalUpdated += updatedCount
      console.log(`تم تحديث ${updatedCount} قناة`)
      
      // حذف الفئة المكررة
      const { error: deleteError } = await supabase
        .from('channel_categories')
        .delete()
        .eq('id', mergeInfo.sourceId)
      
      if (deleteError) {
        console.error(`خطأ في حذف الفئة ${mergeInfo.sourceName}:`, deleteError)
      } else {
        totalMerged++
        console.log(`تم حذف الفئة ${mergeInfo.sourceName}`)
      }
    }
    
    // حذف الفئات الفارغة
    console.log('حذف الفئات الفارغة...')
    const { data: emptyCategories, error: emptyError } = await supabase
      .from('channel_categories')
      .select(`
        id, name, name_ar,
        channels(count)
      `)
      .eq('is_active', true)
    
    if (!emptyError && emptyCategories) {
      let deletedEmpty = 0
      
      for (const category of emptyCategories) {
        const channelCount = category.channels?.[0]?.count || 0
        
        if (channelCount === 0) {
          const { error: deleteEmptyError } = await supabase
            .from('channel_categories')
            .delete()
            .eq('id', category.id)
          
          if (!deleteEmptyError) {
            deletedEmpty++
            console.log(`تم حذف الفئة الفارغة: ${category.name || category.name_ar}`)
          }
        }
      }
      
      console.log(`تم حذف ${deletedEmpty} فئة فارغة`)
    }
    
    console.log('✅ تمت عملية الدمج بنجاح')
    
    res.status(200).json({
      success: true,
      message: 'تم دمج الفئات المكررة بنجاح',
      merged: totalMerged,
      updated: totalUpdated,
      details: categoriesToMerge.map(m => `${m.sourceName} → ${m.targetName}`)
    })
    
  } catch (error) {
    console.error('خطأ في دمج الفئات:', error)
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    })
  }
}