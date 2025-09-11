// سكريپت لإضافة بيانات تجريبية للقنوات في قاعدة البيانات
// يجب تشغيل هذا السكريپت مرة واحدة فقط لإضافة البيانات الأولية

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

// بيانات فئات القنوات
const channelCategories = [
  { name: 'news', name_ar: 'إخبارية', color: '#dc2626', icon: 'news', sort_order: 1 },
  { name: 'general', name_ar: 'عامة', color: '#059669', icon: 'tv', sort_order: 2 },
  { name: 'sports', name_ar: 'رياضية', color: '#2563eb', icon: 'sports', sort_order: 3 },
  { name: 'kids', name_ar: 'أطفال', color: '#7c3aed', icon: 'kids', sort_order: 4 },
  { name: 'entertainment', name_ar: 'ترفيهية', color: '#ea580c', icon: 'entertainment', sort_order: 5 }
]

// بيانات القنوات التجريبية
const sampleChannels = [
  {
    name: 'الجزيرة',
    name_ar: 'الجزيرة',
    description: 'قناة إخبارية عربية رائدة تقدم تغطية شاملة للأحداث العالمية والعربية',
    logo_url: 'https://i.imgur.com/BB93NQP.png',
    stream_url: 'https://live-hls-web-aja.getaj.net/AJA/index.m3u8',
    country: 'قطر',
    language: 'العربية',
    quality: 'HD',
    is_active: true,
    sort_order: 1
  },
  {
    name: 'العربية',
    name_ar: 'العربية',
    description: 'قناة إخبارية عربية تقدم آخر الأخبار والتحليلات السياسية والاقتصادية',
    logo_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Al-Arabiya_new_logo.svg/640px-Al-Arabiya_new_logo.svg.png',
    stream_url: 'https://live.alarabiya.net/alarabiapublish/alarabiya.smil/playlist.m3u8',
    country: 'السعودية',
    language: 'العربية',
    quality: 'HD',
    is_active: true,
    sort_order: 2
  },
  {
    name: 'MBC 1',
    name_ar: 'MBC 1',
    description: 'قناة ترفيهية عامة تقدم أفضل المسلسلات والبرامج العربية',
    logo_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/MBC1_logo.svg/512px-MBC1_logo.svg.png',
    stream_url: 'https://shls-mbc1ksa-prod-dub.shahid.net/out/v1/451b666db1fb41c7a4bbecf7b4865107/index.m3u8',
    country: 'السعودية',
    language: 'العربية',
    quality: 'HD',
    is_active: true,
    sort_order: 3
  },
  {
    name: 'BBC Arabic',
    name_ar: 'بي بي سي عربي',
    description: 'قناة إخبارية دولية تقدم الأخبار باللغة العربية',
    logo_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/62/BBC_News_2019.svg/512px-BBC_News_2019.svg.png',
    stream_url: 'https://vs-cmaf-pushb-ww-live.akamaized.net/x=4/i=urn:bbc:pips:service:bbc_arabic_tv/iptv_hd_abr_v1.mpd',
    country: 'بريطانيا',
    language: 'العربية',
    quality: 'HD',
    is_active: true,
    sort_order: 4
  },
  {
    name: 'Dubai TV',
    name_ar: 'تلفزيون دبي',
    description: 'قناة عامة من دولة الإمارات العربية المتحدة',
    logo_url: 'https://upload.wikimedia.org/wikipedia/en/thumb/c/c7/Dubai_TV_logo.svg/512px-Dubai_TV_logo.svg.png',
    stream_url: 'https://dmisxthvll.cdn.mgmlcdn.com/dubaitv/smil:dubaitv.stream.smil/playlist.m3u8',
    country: 'الإمارات',
    language: 'العربية',
    quality: 'HD',
    is_active: true,
    sort_order: 5
  }
]

async function insertSampleData() {
  try {
    console.log('بدء إدراج البيانات التجريبية...')
    
    // إدراج فئات القنوات أولاً
    console.log('إدراج فئات القنوات...')
    const { data: categoriesData, error: categoriesError } = await supabase
      .from('channel_categories')
      .insert(channelCategories)
      .select()
    
    if (categoriesError) {
      console.error('خطأ في إدراج فئات القنوات:', categoriesError)
      return
    }
    
    console.log('تم إدراج فئات القنوات بنجاح:', categoriesData?.length || 0)
    
    // الحصول على معرف فئة الأخبار
    const { data: newsCategory } = await supabase
      .from('channel_categories')
      .select('id')
      .eq('name', 'news')
      .single()
    
    const { data: generalCategory } = await supabase
      .from('channel_categories')
      .select('id')
      .eq('name', 'general')
      .single()
    
    // إضافة معرف الفئة للقنوات
    const channelsWithCategory = sampleChannels.map((channel, index) => {
      if (index < 2 || index === 3) { // الجزيرة والعربية وBBC Arabic
        return { ...channel, category_id: newsCategory?.id }
      } else { // MBC 1 و Dubai TV
        return { ...channel, category_id: generalCategory?.id }
      }
    })
    
    // إدراج القنوات
    console.log('إدراج القنوات...')
    const { data: channelsData, error: channelsError } = await supabase
      .from('channels')
      .insert(channelsWithCategory)
      .select()
    
    if (channelsError) {
      console.error('خطأ في إدراج القنوات:', channelsError)
      return
    }
    
    console.log('تم إدراج القنوات بنجاح:', channelsData?.length || 0)
    console.log('تم الانتهاء من إدراج البيانات التجريبية!')
    
  } catch (error) {
    console.error('خطأ عام:', error)
  }
}

// تشغيل الدالة
insertSampleData()