import { useState } from 'react'
import { useRouter } from 'next/router'
import AdminLayout from '../../components/admin/AdminLayout'
import { addChannel, loadChannelCategories } from '../../lib/supabaseChannelsService'
import { toast } from 'react-hot-toast'

export default function AddChannels() {
  const router = useRouter()
  const [channelsText, setChannelsText] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [results, setResults] = useState(null)

  const handleAddChannels = async () => {
    if (!channelsText.trim()) {
      toast.error('يرجى إدخال بيانات القنوات')
      return
    }

    setIsLoading(true)
    try {
      // تحميل فئات القنوات أولاً
      const categories = await loadChannelCategories()
      console.log('Loaded categories:', categories)
      
      // تحويل النص إلى مصفوفة من القنوات
      const channelsArray = parseChannelsText(channelsText, categories)
      console.log('Parsed channels array:', channelsArray)
      
      if (channelsArray.length === 0) {
        toast.error('لم يتم العثور على قنوات صالحة')
        setIsLoading(false)
        return
      }

      // إضافة القنوات واحدة تلو الأخرى
      const results = {
        added: [],
        duplicates: [],
        errors: []
      }

      for (const channel of channelsArray) {
        try {
          const result = await addChannel(channel)
          if (result.success) {
            results.added.push(result.data)
          } else {
            results.errors.push({ channel: channel.name, error: result.error })
          }
        } catch (error) {
          console.error('خطأ في إضافة القناة:', channel.name, error)
          results.errors.push({ channel: channel.name, error: error.message })
        }
      }

      console.log('Add channels results:', results)
      setResults(results)

      // عرض النتائج
      if (results.added.length > 0) {
        toast.success(`تم إضافة ${results.added.length} قناة بنجاح`)
      }
      
      if (results.duplicates.length > 0) {
        toast.error(`تم تجاهل ${results.duplicates.length} قناة مكررة`)
      }
      
      if (results.errors.length > 0) {
        toast.error(`فشل في إضافة ${results.errors.length} قناة`)
      }

    } catch (error) {
      console.error('خطأ في إضافة القنوات:', error)
      toast.error('حدث خطأ أثناء إضافة القنوات')
    } finally {
      setIsLoading(false)
    }
  }

  const parseChannelsText = (text, categories = []) => {
    console.log('parseChannelsText called with text:', text)
    console.log('Available categories:', categories)
    
    // دالة مساعدة لتحويل اسم الفئة إلى معرف
    const getCategoryId = (categoryName) => {
      if (!categoryName) return categories[0]?.id || null // فئة افتراضية
      
      // البحث عن الفئة بالاسم العربي أو الإنجليزي
      const category = categories.find(cat => 
        cat.name_ar === categoryName || 
        cat.name === categoryName ||
        cat.name_ar.toLowerCase() === categoryName.toLowerCase() ||
        cat.name.toLowerCase() === categoryName.toLowerCase()
      )
      
      return category ? category.id : categories[0]?.id || null // إرجاع معرف الفئة أو الفئة الافتراضية
    }
    
    try {
      // محاولة تحليل JSON
      const parsed = JSON.parse(text)
      console.log('JSON parsed successfully:', parsed)
      
      // إذا كان الكائن يحتوي على خاصية channels
      if (parsed.channels && Array.isArray(parsed.channels)) {
        return parsed.channels.map(channel => ({
          name: channel.name,
          name_ar: channel.name,
          url: channel.url,
          category_id: getCategoryId(channel['group-title'] || channel.category || 'عامة'),
          logo: channel['tvg-logo'] || channel.logo || '',
          country: channel.country || 'غير محدد',
          language: channel.language || 'العربية',
          quality: channel.quality || 'HD',
          description: channel.description || ''
        }))
      }
      
      // إذا كان مصفوفة مباشرة
      if (Array.isArray(parsed)) {
        return parsed.map(channel => ({
          name: channel.name,
          name_ar: channel.name,
          url: channel.url,
          category_id: getCategoryId(channel['group-title'] || channel.category || 'عامة'),
          logo: channel['tvg-logo'] || channel.logo || '',
          country: channel.country || 'غير محدد',
          language: channel.language || 'العربية',
          quality: channel.quality || 'HD',
          description: channel.description || ''
        }))
      }
      
      // إذا كان كائن واحد
      return [{
        name: parsed.name,
        name_ar: parsed.name,
        url: parsed.url,
        category_id: getCategoryId(parsed['group-title'] || parsed.category || 'عامة'),
        logo: parsed['tvg-logo'] || parsed.logo || '',
        country: parsed.country || 'غير محدد',
        language: parsed.language || 'العربية',
        quality: parsed.quality || 'HD',
        description: parsed.description || ''
      }]
    } catch {
      console.log('JSON parsing failed, trying text parsing')
      // إذا فشل JSON، محاولة تحليل كنص عادي
      const lines = text.split('\n').filter(line => line.trim())
      const channels = []
      
      lines.forEach(line => {
        const parts = line.split('|').map(p => p.trim())
        if (parts.length >= 3) {
          channels.push({
            name: parts[0],
            name_ar: parts[0],
            url: parts[1],
            category_id: getCategoryId(parts[2] || 'عامة'),
            logo: parts[3] || '',
            country: parts[4] || 'غير محدد',
            language: parts[5] || 'العربية',
            quality: parts[6] || 'HD',
            description: parts[7] || ''
          })
        }
      })
      
      return channels
    }
  }

  const clearResults = () => {
    setResults(null)
    setChannelsText('')
  }

  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-800">إضافة قنوات جديدة</h1>
            <button
              onClick={() => router.push('/admin/channels')}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              العودة للقنوات
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* نموذج الإدخال */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  بيانات القنوات
                </label>
                <div className="text-xs text-gray-500 mb-2">
                  يمكنك إدخال البيانات بصيغة JSON أو نص عادي مفصول بـ |
                  <br />
                  مثال: اسم القناة | الرابط | التصنيف | الشعار | البلد | اللغة | الجودة | الوصف
                </div>
                <textarea
                  value={channelsText}
                  onChange={(e) => setChannelsText(e.target.value)}
                  className="w-full h-96 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                  placeholder={`مثال JSON:\n[\n  {\n    "name": "قناة تجريبية",\n    "url": "https://example.com/stream.m3u8",\n    "category": "عامة",\n    "logo": "https://example.com/logo.png",\n    "country": "السعودية",\n    "language": "العربية",\n    "quality": "HD",\n    "description": "وصف القناة"\n  }\n]\n\nأو نص عادي:\nقناة تجريبية | https://example.com/stream.m3u8 | عامة | https://example.com/logo.png | السعودية | العربية | HD | وصف القناة`}
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleAddChannels}
                  disabled={isLoading || !channelsText.trim()}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  {isLoading ? 'جاري الإضافة...' : 'إضافة القنوات'}
                </button>
                
                <button
                  onClick={clearResults}
                  className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  مسح
                </button>
              </div>
            </div>

            {/* النتائج */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800">النتائج</h3>
              
              {!results && (
                <div className="text-gray-500 text-center py-8">
                  ستظهر النتائج هنا بعد إضافة القنوات
                </div>
              )}

              {results && (
                <div className="space-y-4">
                  {/* القنوات المضافة */}
                  {results.added.length > 0 && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <h4 className="text-green-800 font-semibold mb-2">
                        تم إضافة {results.added.length} قناة بنجاح
                      </h4>
                      <div className="max-h-32 overflow-y-auto space-y-1">
                        {results.added.map((channel, index) => (
                          <div key={index} className="text-sm text-green-700">
                            ✓ {channel.name}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* القنوات المكررة */}
                  {results.duplicates.length > 0 && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <h4 className="text-yellow-800 font-semibold mb-2">
                        تم تجاهل {results.duplicates.length} قناة مكررة
                      </h4>
                      <div className="max-h-32 overflow-y-auto space-y-1">
                        {results.duplicates.map((duplicate, index) => (
                          <div key={index} className="text-sm text-yellow-700">
                            ⚠ {duplicate.name}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* الأخطاء */}
                  {results.errors.length > 0 && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <h4 className="text-red-800 font-semibold mb-2">
                        فشل في إضافة {results.errors.length} قناة
                      </h4>
                      <div className="max-h-32 overflow-y-auto space-y-1">
                        {results.errors.map((error, index) => (
                          <div key={index} className="text-sm text-red-700">
                            ✗ {error.name}: {error.error || error.message}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* ملخص */}
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <h4 className="text-gray-800 font-semibold mb-2">ملخص العملية</h4>
                    <div className="text-sm text-gray-600 space-y-1">
                      <div>إجمالي القنوات المعالجة: {results.added.length + results.duplicates.length + results.errors.length}</div>
                      <div className="text-green-600">تم إضافتها: {results.added.length}</div>
                      <div className="text-yellow-600">مكررة: {results.duplicates.length}</div>
                      <div className="text-red-600">فشلت: {results.errors.length}</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}

export async function getServerSideProps(context) {
  // التحقق من صلاحيات الأدمن
  return {
    props: {}
  }
}