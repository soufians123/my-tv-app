// سكريبت لتحديث خدمة القنوات لتحميل البيانات من ملف zomiga_channels.json
const fs = require('fs');
const path = require('path');

// قراءة ملف القنوات الحالي
const channelsFilePath = path.join(__dirname, 'zomiga_channels.json');
const serviceFilePath = path.join(__dirname, 'lib', 'channelsService.js');

try {
  // قراءة بيانات القنوات
  const channelsData = fs.readFileSync(channelsFilePath, 'utf8');
  const channels = JSON.parse(channelsData);
  
  console.log(`📁 تم تحميل ${channels.length} قناة من الملف`);
  
  // قراءة ملف الخدمة الحالي
  let serviceContent = fs.readFileSync(serviceFilePath, 'utf8');
  
  // استخراج الفئات الفريدة من البيانات الفعلية
  const uniqueCategories = [...new Set(channels.map(ch => ch.category))].sort();
  
  // استخراج البلدان الفريدة
  const uniqueCountries = [...new Set(channels.map(ch => ch.country))].filter(Boolean).sort();
  
  // استخراج اللغات الفريدة
  const uniqueLanguages = [...new Set(channels.map(ch => ch.language))].filter(Boolean).sort();
  
  console.log('📊 الفئات المستخرجة:', uniqueCategories);
  console.log('🌍 البلدان المستخرجة:', uniqueCountries);
  console.log('🗣️ اللغات المستخرجة:', uniqueLanguages);
  
  // تحديث البيانات الافتراضية في الملف
  const defaultChannelsRegex = /const defaultChannels = \[[\s\S]*?\]/;
  const newDefaultChannels = `const defaultChannels = ${JSON.stringify(channels, null, 2)}`;
  
  serviceContent = serviceContent.replace(defaultChannelsRegex, newDefaultChannels);
  
  // تحديث قائمة الفئات
  const categoriesRegex = /export const channelCategories = \[[\s\S]*?\]/;
  const newCategories = `export const channelCategories = [\n  ${uniqueCategories.map(cat => `'${cat}'`).join(',\n  ')}\n]`;
  
  serviceContent = serviceContent.replace(categoriesRegex, newCategories);
  
  // تحديث قائمة البلدان
  const countriesRegex = /export const channelCountries = \[[\s\S]*?\]/;
  const newCountries = `export const channelCountries = [\n  ${uniqueCountries.map(country => `'${country}'`).join(',\n  ')}\n]`;
  
  serviceContent = serviceContent.replace(countriesRegex, newCountries);
  
  // تحديث قائمة اللغات
  const languagesRegex = /export const channelLanguages = \[[\s\S]*?\]/;
  const newLanguages = `export const channelLanguages = [\n  ${uniqueLanguages.map(lang => `'${lang}'`).join(',\n  ')}\n]`;
  
  serviceContent = serviceContent.replace(languagesRegex, newLanguages);
  
  // إضافة دالة لتحميل البيانات من الملف
  const loadFromFileFunction = `
// تحميل البيانات من ملف zomiga_channels.json
const loadChannelsFromFile = async () => {
  if (typeof window !== 'undefined') {
    try {
      const response = await fetch('/api/channels/load-from-file');
      if (response.ok) {
        const data = await response.json();
        return data.channels || defaultChannels;
      }
    } catch (error) {
      console.error('خطأ في تحميل القنوات من الملف:', error);
    }
  }
  return defaultChannels;
};
`;
  
  // إدراج الدالة قبل دالة _loadChannels
  const loadChannelsIndex = serviceContent.indexOf('const _loadChannels = () => {');
  if (loadChannelsIndex !== -1) {
    serviceContent = serviceContent.slice(0, loadChannelsIndex) + 
                   loadFromFileFunction + 
                   serviceContent.slice(loadChannelsIndex);
  }
  
  // تحديث دالة _loadChannels لتحميل من الملف أولاً
  const oldLoadFunction = /const _loadChannels = \(\) => \{[\s\S]*?\}/;
  const newLoadFunction = `const _loadChannels = async () => {
  if (typeof window === 'undefined') return defaultChannels
  
  try {
    // محاولة تحميل من localStorage أولاً
    const stored = localStorage.getItem(CHANNELS_STORAGE_KEY)
    if (stored) {
      const channels = JSON.parse(stored)
      if (Array.isArray(channels) && channels.length > 10) {
        return channels
      }
    }
    
    // إذا لم توجد بيانات كافية، حمل من الملف
    const fileChannels = await loadChannelsFromFile()
    if (fileChannels && fileChannels.length > 0) {
      saveChannels(fileChannels)
      return fileChannels
    }
  } catch (error) {
    console.error('خطأ في تحميل القنوات:', error)
  }
  
  // كحل أخير، استخدم البيانات الافتراضية
  saveChannels(defaultChannels)
  return defaultChannels
}`;
  
  serviceContent = serviceContent.replace(oldLoadFunction, newLoadFunction);
  
  // حفظ الملف المحدث
  fs.writeFileSync(serviceFilePath, serviceContent);
  
  console.log('✅ تم تحديث ملف خدمة القنوات بنجاح');
  console.log(`📊 تم تحديث ${uniqueCategories.length} فئة`);
  console.log(`🌍 تم تحديث ${uniqueCountries.length} بلد`);
  console.log(`🗣️ تم تحديث ${uniqueLanguages.length} لغة`);
  
} catch (error) {
  console.error('❌ خطأ في تحديث خدمة القنوات:', error.message);
  process.exit(1);
}