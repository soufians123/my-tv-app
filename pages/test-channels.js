import { useState, useEffect } from 'react'
import { loadChannels } from '../lib/mockChannelsService'

const TestChannels = () => {
  const [channels, setChannels] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchChannels = async () => {
      try {
        console.log('بدء تحميل القنوات التجريبية...')
        const data = await loadChannels()
        console.log('البيانات المستلمة:', data)
        setChannels(data)
        setLoading(false)
      } catch (err) {
        console.error('خطأ في تحميل القنوات:', err)
        setError(err.message)
        setLoading(false)
      }
    }

    fetchChannels()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">جاري التحميل...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-red-600">خطأ: {error}</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">اختبار القنوات التجريبية</h1>
        
        <div className="mb-4 text-center">
          <p className="text-lg">عدد القنوات المحملة: <span className="font-bold text-blue-600">{channels.length}</span></p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {channels.map((channel) => (
            <div key={channel.id} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center mb-4">
                <img 
                  src={channel.logo_url} 
                  alt={channel.name}
                  className="w-16 h-10 object-cover rounded mr-4"
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/100x60/cccccc/666666?text=قناة'
                  }}
                />
                <div>
                  <h3 className="font-bold text-lg">{channel.name}</h3>
                  <p className="text-sm text-gray-600">{channel.category}</p>
                </div>
              </div>
              
              <div className="space-y-2 text-sm">
                <p><span className="font-semibold">البلد:</span> {channel.country}</p>
                <p><span className="font-semibold">اللغة:</span> {channel.language}</p>
                <p><span className="font-semibold">الجودة:</span> {channel.quality}</p>
                <p><span className="font-semibold">المشاهدات:</span> {channel.view_count?.toLocaleString()}</p>
                <p><span className="font-semibold">الحالة:</span> 
                  <span className={`ml-2 px-2 py-1 rounded text-xs ${
                    channel.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {channel.is_active ? 'نشط' : 'غير نشط'}
                  </span>
                </p>
              </div>
              
              {channel.description && (
                <div className="mt-4 pt-4 border-t">
                  <p className="text-sm text-gray-700">{channel.description}</p>
                </div>
              )}
            </div>
          ))}
        </div>
        
        {channels.length === 0 && (
          <div className="text-center py-12">
            <p className="text-xl text-gray-600">لا توجد قنوات متاحة</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default TestChannels