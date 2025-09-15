require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

const checkCategories = async () => {
  try {
    console.log('🔍 فحص الفئات الموجودة في قاعدة البيانات...')
    
    const { data, error } = await supabase
      .from('channel_categories')
      .select('*')
      .order('sort_order')
    
    if (error) {
      console.error('❌ خطأ في جلب الفئات:', error)
      return
    }
    
    console.log('📋 الفئات الموجودة:')
    data.forEach(category => {
      console.log(`- ${category.name} (${category.name_ar}) - ID: ${category.id}`)
    })
    
    console.log('\n📝 خريطة الفئات المطلوبة:')
    console.log('const categoryMap = {')
    data.forEach(category => {
      console.log(`  '${category.name_ar}': '${category.id}',`)
    })
    console.log('}')
    
  } catch (error) {
    console.error('❌ خطأ:', error)
  }
}

checkCategories()