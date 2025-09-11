// سكريپت للتحقق من البيانات الموجودة في قاعدة البيانات

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

// إنشاء عميل Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('متغيرات البيئة مفقودة!')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function checkData() {
  try {
    console.log('فحص البيانات في قاعدة البيانات...')
    
    // فحص فئات القنوات
    console.log('\n=== فئات القنوات ===')
    const { data: categories, error: categoriesError } = await supabase
      .from('channel_categories')
      .select('*')
    
    if (categoriesError) {
      console.error('خطأ في جلب فئات القنوات:', categoriesError)
    } else {
      console.log(`عدد الفئات: ${categories?.length || 0}`)
      categories?.forEach(cat => {
        console.log(`- ${cat.name_ar} (${cat.name}) - ID: ${cat.id}`)
      })
    }
    
    // فحص القنوات
    console.log('\n=== القنوات ===')
    const { data: channels, error: channelsError } = await supabase
      .from('channels')
      .select(`
        *,
        channel_categories(name, name_ar, color, icon)
      `)
    
    if (channelsError) {
      console.error('خطأ في جلب القنوات:', channelsError)
    } else {
      console.log(`عدد القنوات: ${channels?.length || 0}`)
      channels?.forEach(channel => {
        console.log(`- ${channel.name} - نشطة: ${channel.is_active} - فئة: ${channel.category_id}`)
      })
    }
    
    // فحص القنوات النشطة فقط
    console.log('\n=== القنوات النشطة ===')
    const { data: activeChannels, error: activeError } = await supabase
      .from('channels')
      .select(`
        *,
        channel_categories(name, name_ar, color, icon)
      `)
      .eq('is_active', true)
      .order('sort_order', { ascending: true })
    
    if (activeError) {
      console.error('خطأ في جلب القنوات النشطة:', activeError)
    } else {
      console.log(`عدد القنوات النشطة: ${activeChannels?.length || 0}`)
      activeChannels?.forEach(channel => {
        console.log(`- ${channel.name} - ${channel.country} - ${channel.language}`)
      })
    }
    
  } catch (error) {
    console.error('خطأ عام:', error)
  }
}

// تشغيل الفحص
checkData()