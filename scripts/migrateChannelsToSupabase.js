// سكريپت لرفع البيانات من zomiga_channels.json إلى Supabase
// Migration script to upload channels data from JSON file to Supabase

const fs = require('fs')
const path = require('path')
const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') })

// إنشاء عميل Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env.local file.')
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

// مسار ملف القنوات
const channelsFilePath = path.join(__dirname, 'zomiga_channels.json')

// دالة لقراءة البيانات من الملف
const readChannelsFromFile = () => {
  try {
    if (!fs.existsSync(channelsFilePath)) {
      console.error('ملف القنوات غير موجود:', channelsFilePath)
      return null
    }
    
    const fileContent = fs.readFileSync(channelsFilePath, 'utf8')
    const channels = JSON.parse(fileContent)
    
    console.log(`تم قراءة ${channels.length} قناة من الملف`)
    return channels
  } catch (error) {
    console.error('خطأ في قراءة ملف القنوات:', error)
    return null
  }
}

// خريطة الفئات - تحويل أسماء الفئات إلى معرفات UUID الموجودة في قاعدة البيانات
const categoryMap = {
  'عامة': '225e6e78-e5c5-4f95-855f-97c49eaa8fc4',
  'إخبارية': '101d082a-5b61-4d99-acc7-2b133cee98f3',
  'رياضية': 'a4e47878-92e1-419a-b535-1c772e651d5d',
  'موسيقية': '69dec596-1492-4492-82e4-58d8460141ce',
  'أفلام': '7817bb68-3887-4b7d-945f-5834846516da',
  'دينية': '0120777a-0767-4970-8737-31090c5d3e94',
  'أطفال': 'f8584f6c-b626-4042-a5d5-652b910e2504',
  'تعليمية': 'bc038dcb-7ade-436f-919f-58cb307e29ef',
  'وثائقية': 'af91f94c-88b7-47c8-a12c-431d99e8c946',
  'طبخ': '291f32b9-777c-4665-ba37-c0376461e2fd',
  'ترفيهية': '83fb5158-3b5e-4d0b-b920-41dcf8f7ffe7',
  'قنوات مغربية': '7267f55a-b7a6-4466-8e59-3e4f411d13c4',
  'Documentary;News': 'af91f94c-88b7-47c8-a12c-431d99e8c946',
  'أعمال': '225e6e78-e5c5-4f95-855f-97c49eaa8fc4',
  'غير محدد': '225e6e78-e5c5-4f95-855f-97c49eaa8fc4'
}

// دالة لإنشاء الفئات المفقودة
const createMissingCategories = async () => {
  const missingCategories = [
    { name: 'إخبارية', name_ar: 'إخبارية', description: 'القنوات الإخبارية', icon: '📰', color: '#DC2626', sort_order: 2 },
    { name: 'رياضية', name_ar: 'رياضية', description: 'القنوات الرياضية', icon: '⚽', color: '#059669', sort_order: 3 },
    { name: 'موسيقية', name_ar: 'موسيقية', description: 'القنوات الموسيقية', icon: '🎵', color: '#7C3AED', sort_order: 4 },
    { name: 'أفلام', name_ar: 'أفلام', description: 'قنوات الأفلام والمسلسلات', icon: '🎬', color: '#DC2626', sort_order: 5 },
    { name: 'دينية', name_ar: 'دينية', description: 'القنوات الدينية', icon: '🕌', color: '#059669', sort_order: 6 },
    { name: 'أطفال', name_ar: 'أطفال', description: 'قنوات الأطفال', icon: '🧸', color: '#F59E0B', sort_order: 7 }
  ]
  
  for (const category of missingCategories) {
    const { error } = await supabase
      .from('channel_categories')
      .insert(category)
    
    if (error && !error.message.includes('duplicate key')) {
      console.error(`خطأ في إنشاء الفئة ${category.name}:`, error)
    }
  }
}

// دالة لتنظيف البيانات وإعدادها للرفع
const cleanChannelData = (channel) => {
  // تحويل اسم الفئة إلى معرف UUID
  const categoryId = categoryMap[channel.category] || categoryMap['عامة']
  
  // إعداد البيانات بالتنسيق المطلوب لجدول channels
  const cleanedChannel = {
    name: channel.name || '',
    name_ar: channel.name || '',
    description: channel.description || null,
    logo_url: channel.logo || null,
    stream_url: channel.url || '',
    backup_stream_url: null,
    category_id: categoryId,
    country: channel.country || 'غير محدد',
    language: channel.language || 'العربية',
    is_live: channel.status === 'active',
    is_active: channel.status === 'active',
    viewer_count: parseInt(channel.viewers) || 0,
    rating: parseFloat(channel.rating) || 0,
    sort_order: parseInt(channel.id) || 0
  }
  
  return cleanedChannel
}

// دالة لرفع البيانات إلى Supabase
const uploadChannelsToSupabase = async (channels) => {
  try {
    console.log('بدء رفع البيانات إلى Supabase...')
    
    // تنظيف البيانات
    const cleanedChannels = channels.map(cleanChannelData)
    
    // حذف جميع القنوات الموجودة (اختياري)
    console.log('حذف القنوات الموجودة...')
    
    // أولاً، احصل على جميع القنوات الموجودة
    const { data: existingChannels, error: fetchError } = await supabase
      .from('channels')
      .select('id')
    
    if (fetchError) {
      console.error('خطأ في جلب القنوات الموجودة:', fetchError)
      return false
    }
    
    if (existingChannels && existingChannels.length > 0) {
        // حذف القنوات على دفعات لتجنب مشكلة الحجم
        const deleteBatchSize = 50
        let deletedCount = 0
        
        for (let i = 0; i < existingChannels.length; i += deleteBatchSize) {
          const batch = existingChannels.slice(i, i + deleteBatchSize)
          const { error: deleteError } = await supabase
            .from('channels')
            .delete()
            .in('id', batch.map(channel => channel.id))
          
          if (deleteError) {
            console.error(`خطأ في حذف الدفعة ${Math.floor(i / deleteBatchSize) + 1}:`, deleteError)
            return false
          }
          
          deletedCount += batch.length
          console.log(`تم حذف ${batch.length} قناة (المجموع: ${deletedCount}/${existingChannels.length})`)
        }
        
        console.log(`تم حذف ${deletedCount} قناة موجودة بنجاح`)
      } else {
        console.log('لا توجد قنوات لحذفها')
      }
    
    // رفع البيانات على دفعات لتجنب مشاكل الحجم
    const batchSize = 100
    let uploadedCount = 0
    
    for (let i = 0; i < cleanedChannels.length; i += batchSize) {
      const batch = cleanedChannels.slice(i, i + batchSize)
      
      console.log(`رفع الدفعة ${Math.floor(i / batchSize) + 1}: ${batch.length} قناة`)
      
      const { data, error } = await supabase
        .from('channels')
        .insert(batch)
        .select()
      
      if (error) {
        console.error(`خطأ في رفع الدفعة ${Math.floor(i / batchSize) + 1}:`, error)
        continue
      }
      
      uploadedCount += data.length
      console.log(`تم رفع ${data.length} قناة بنجاح`)
    }
    
    console.log(`\n✅ تم رفع ${uploadedCount} قناة من أصل ${cleanedChannels.length} إلى Supabase`)
    return true
    
  } catch (error) {
    console.error('خطأ في رفع البيانات:', error)
    return false
  }
}

// دالة للتحقق من الاتصال بـ Supabase
const testSupabaseConnection = async () => {
  try {
    const { data, error } = await supabase
      .from('channels')
      .select('count', { count: 'exact' })
      .limit(1)
    
    if (error) {
      console.error('خطأ في الاتصال بـ Supabase:', error)
      return false
    }
    
    console.log('✅ تم الاتصال بـ Supabase بنجاح')
    return true
  } catch (error) {
    console.error('خطأ في اختبار الاتصال:', error)
    return false
  }
}

// الدالة الرئيسية
const main = async () => {
  console.log('🚀 بدء عملية رفع القنوات إلى Supabase')
  console.log('=' .repeat(50))
  
  // اختبار الاتصال
  const connectionOk = await testSupabaseConnection()
  if (!connectionOk) {
    console.error('❌ فشل في الاتصال بـ Supabase')
    process.exit(1)
  }
  
  // إنشاء الفئات المفقودة
  console.log('📂 إنشاء الفئات المفقودة...')
  await createMissingCategories()
  
  // قراءة البيانات من الملف
  const channels = readChannelsFromFile()
  if (!channels || channels.length === 0) {
    console.error('❌ لا توجد بيانات للرفع')
    process.exit(1)
  }
  
  // رفع البيانات
  const success = await uploadChannelsToSupabase(channels)
  
  if (success) {
    console.log('\n🎉 تمت عملية الرفع بنجاح!')
  } else {
    console.log('\n❌ فشلت عملية الرفع')
    process.exit(1)
  }
}

// تشغيل السكريپت
if (require.main === module) {
  main().catch(console.error)
}

module.exports = { uploadChannelsToSupabase, readChannelsFromFile, cleanChannelData }