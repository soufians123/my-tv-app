// مُحلل ملفات M3U لاستخراج معلومات القنوات
// يدعم تحليل ملفات M3U وإضافة القنوات إلى النظام

const { addChannel } = require('./channelsService')

/**
 * تحليل محتوى ملف M3U واستخراج معلومات القنوات
 * @param {string} m3uContent - محتوى ملف M3U
 * @returns {Array} مصفوفة من القنوات المستخرجة
 */
const parseM3U = (m3uContent) => {
  const lines = m3uContent.split('\n').map(line => line.trim()).filter(line => line)
  const channels = []
  let currentChannel = {}

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]

    // تحقق من بداية ملف M3U
    if (line === '#EXTM3U') {
      continue
    }

    // تحليل معلومات القناة
    if (line.startsWith('#EXTINF:')) {
      currentChannel = parseExtinf(line)
    }
    // تحليل خيارات VLC
    else if (line.startsWith('#EXTVLCOPT:')) {
      parseVlcOpt(line, currentChannel)
    }
    // رابط القناة
    else if (line.startsWith('http://') || line.startsWith('https://')) {
      currentChannel.url = line
      
      // إضافة القناة إلى المصفوفة إذا كانت مكتملة
      if (currentChannel.name && currentChannel.url) {
        channels.push({ ...currentChannel })
      }
      
      // إعادة تعيين القناة الحالية
      currentChannel = {}
    }
  }

  return channels
}

/**
 * تحليل سطر EXTINF لاستخراج معلومات القناة
 * @param {string} line - سطر EXTINF
 * @returns {Object} معلومات القناة
 */
const parseExtinf = (line) => {
  const channel = {
    status: 'active',
    viewers: Math.floor(Math.random() * 1000000) + 100000,
    favorites: Math.floor(Math.random() * 10000) + 100,
    language: 'العربية',
    quality: 'HD',
    createdAt: new Date().toISOString().split('T')[0],
    lastUpdated: new Date().toISOString().split('T')[0],
    rating: (Math.random() * 2 + 3).toFixed(1) // تقييم بين 3.0 و 5.0
  }

  // استخراج tvg-id
  const tvgIdMatch = line.match(/tvg-id="([^"]*)"/)
  if (tvgIdMatch) {
    channel.tvgId = tvgIdMatch[1]
  }

  // استخراج tvg-logo
  const tvgLogoMatch = line.match(/tvg-logo="([^"]*)"/)
  if (tvgLogoMatch) {
    channel.logo = tvgLogoMatch[1].replace(/`/g, '').trim()
  }

  // استخراج group-title (الفئة)
  const groupTitleMatch = line.match(/group-title="([^"]*)"/)
  if (groupTitleMatch) {
    channel.category = mapCategoryToArabic(groupTitleMatch[1])
  }

  // استخراج http-referrer
  const httpReferrerMatch = line.match(/http-referrer="([^"]*)"/)
  if (httpReferrerMatch) {
    channel.httpReferrer = httpReferrerMatch[1].replace(/`/g, '').trim()
  }

  // استخراج http-user-agent
  const httpUserAgentMatch = line.match(/http-user-agent="([^"]*)"/)
  if (httpUserAgentMatch) {
    channel.httpUserAgent = httpUserAgentMatch[1]
  }

  // استخراج اسم القناة (آخر جزء بعد الفاصلة)
  const nameMatch = line.match(/,(.+)$/)
  if (nameMatch) {
    channel.name = nameMatch[1].trim()
  }

  // تحديد البلد بناءً على اسم القناة أو المعرف
  channel.country = detectCountry(channel.name, channel.tvgId)

  // إضافة وصف افتراضي
  channel.description = `قناة ${channel.name} - ${channel.category}`

  return channel
}

/**
 * تحليل خيارات VLC
 * @param {string} line - سطر EXTVLCOPT
 * @param {Object} channel - كائن القناة
 */
const parseVlcOpt = (line, channel) => {
  if (line.includes('http-referrer=')) {
    const referrer = line.split('http-referrer=')[1]
    channel.httpReferrer = referrer.replace(/`/g, '').trim()
  }
  
  if (line.includes('http-user-agent=')) {
    const userAgent = line.split('http-user-agent=')[1]
    channel.httpUserAgent = userAgent
  }
}

/**
 * تحويل أسماء الفئات الإنجليزية إلى العربية
 * @param {string} englishCategory - اسم الفئة بالإنجليزية
 * @returns {string} اسم الفئة بالعربية
 */
const mapCategoryToArabic = (englishCategory) => {
  const categoryMap = {
    'General': 'عامة',
    'News': 'إخبارية',
    'Sports': 'رياضية',
    'Music': 'موسيقية',
    'Religious': 'دينية',
    'Kids': 'أطفال',
    'Movies': 'أفلام',
    'Documentary': 'وثائقية',
    'Business': 'أعمال',
    'Education': 'تعليمية',
    'Entertainment': 'ترفيهية',
    'Undefined': 'غير محدد'
  }

  return categoryMap[englishCategory] || englishCategory || 'عامة'
}

/**
 * تحديد البلد بناءً على اسم القناة أو المعرف
 * @param {string} channelName - اسم القناة
 * @param {string} tvgId - معرف القناة
 * @returns {string} اسم البلد
 */
const detectCountry = (channelName, tvgId) => {
  const countryPatterns = {
    'المغرب': ['.ma', '2M', 'Al Aoula', 'Al Maghribia', 'Aflam TV'],
    'الإمارات': ['Abu Dhabi', 'Emirates', 'Ajman', '.ae'],
    'السعودية': ['.sa', 'Abdulmajeed', 'Aflam', 'Al Ekhbariya'],
    'قطر': ['.qa', 'Al Jazeera', 'Al Araby', 'Al Maaref'],
    'العراق': ['.iq', 'Al Iraqia', 'Afaq', 'Al Ahad', 'Al Eshraq', 'Al Etejah', 'Al Janoub', 'Al Ayyam'],
    'لبنان': ['.lb', 'Al Jadeed', 'Al Ittihad', 'Aghani'],
    'مصر': ['.eg', 'Al Ghad', 'Aghapy'],
    'إيران': ['.ir', 'Al Alam', 'Abadan'],
    'فلسطين': ['.ps', 'Al Aqsa', 'Ajyal', 'Al Madina'],
    'الأردن': ['.jo', 'Al Mamlaka'],
    'ليبيا': ['.ly', 'Al Masar'],
    'الجزائر': ['.dz', 'AL24'],
    'السودان': ['.sd', 'Al Alamiya'],
    'أفغانستان': ['Afghanistan'],
    'المملكة المتحدة': ['.uk'],
    'الولايات المتحدة': ['.us', 'Access Sacramento', 'Aghapy']
  }

  const searchText = `${channelName} ${tvgId}`.toLowerCase()

  for (const [country, patterns] of Object.entries(countryPatterns)) {
    for (const pattern of patterns) {
      if (searchText.includes(pattern.toLowerCase())) {
        return country
      }
    }
  }

  return 'غير محدد'
}

/**
 * إضافة قائمة من القنوات إلى النظام
 * @param {Array} channels - مصفوفة القنوات
 * @returns {Object} نتيجة العملية
 */
const addChannelsToSystem = async (channels) => {
  const results = {
    success: 0,
    failed: 0,
    errors: []
  }

  for (const channel of channels) {
    try {
      await addChannel(channel)
      results.success++
    } catch (error) {
      results.failed++
      results.errors.push({
        channel: channel.name,
        error: error.message
      })
    }
  }

  return results
}

/**
 * تحليل وإضافة قنوات من محتوى M3U
 * @param {string} m3uContent - محتوى ملف M3U
 * @returns {Object} نتيجة العملية
 */
const parseAndAddM3U = async (m3uContent) => {
  try {
    const channels = parseM3U(m3uContent)
    const results = await addChannelsToSystem(channels)
    
    return {
      ...results,
      totalParsed: channels.length,
      channels: channels
    }
  } catch (error) {
    return {
      success: 0,
      failed: 0,
      totalParsed: 0,
      errors: [{ error: error.message }],
      channels: []
    }
  }
}

// تصدير الدوال
module.exports = {
  parseM3U,
  addChannelsToSystem,
  parseAndAddM3U
}