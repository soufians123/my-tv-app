import { useEffect, useState } from 'react'
import AdminLayout from '../../components/admin/AdminLayout'
import { useAuth } from '../../contexts/AuthContext'
import { Save, Send, Link as LinkIcon, Hash, Eye, Shield } from 'lucide-react'
import { getSetting, setSettingViaApi } from '../../lib/settingsService'

export default function AdminTelegramButtonPage() {
  const { user, loading, isAdmin } = useAuth()
  const [form, setForm] = useState({
    enabled: true,
    text: 'انضم إلى قناتنا على تليغرام',
    color: '#24A1DE',
    link: 'https://t.me/yourchannel'
  })
  const [saving, setSaving] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    (async () => {
      const cfg = await getSetting('telegram_bottom_button', null)
      if (cfg && typeof cfg === 'object') {
        setForm({
          enabled: cfg.enabled !== false,
          text: cfg.text || 'انضم إلى قناتنا على تليغرام',
          color: cfg.color || '#24A1DE',
          link: cfg.link || ''
        })
      }
      setLoaded(true)
    })()
  }, [])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setError('')
    try {
      if (!form.link || !/^https?:\/\//i.test(form.link)) {
        setError('يرجى إدخال رابط صحيح يبدأ بـ http أو https')
        return
      }
      setSaving(true)
      const ok = await setSettingViaApi('telegram_bottom_button', {
        enabled: !!form.enabled,
        text: String(form.text || '').trim() || 'انضم إلى قناتنا على تليغرام',
        color: form.color || '#24A1DE',
        link: form.link
      }, { type: 'json', is_public: true, description: 'إعداد زر تليغرام السفلي الثابت' })
      if (!ok) throw new Error('فشل حفظ الإعداد')
      alert('تم حفظ الإعدادات بنجاح')
    } catch (err) {
      setError(err.message || 'حدث خطأ غير متوقع')
    } finally {
      setSaving(false)
    }
  }

  return (
    <AdminLayout title="زر تليغرام" description="إدارة خصائص الزر السفلي الثابت">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
          <div className="flex items-center gap-3 mb-6">
            <Send className="w-6 h-6 text-sky-600" />
            <h1 className="text-xl font-semibold">زر تليغرام السفلي</h1>
          </div>

          {!loaded ? (
            <div className="py-12 text-center text-gray-500">جاري التحميل...</div>
          ) : (
            <form onSubmit={handleSave} className="space-y-6">
              {error && (
                <div className="p-3 rounded bg-red-50 text-red-700 border border-red-200">{error}</div>
              )}

              <div className="flex items-center gap-3">
                <input id="enabled" name="enabled" type="checkbox" checked={!!form.enabled} onChange={handleChange} className="h-4 w-4 text-sky-600 border-gray-300 rounded" />
                <label htmlFor="enabled" className="text-sm font-medium">تفعيل عرض الزر لجميع الصفحات العامة</label>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">نص الزر</label>
                <input name="text" value={form.text} onChange={handleChange} className="w-full px-3 py-2 rounded border border-gray-300 focus:ring-2 focus:ring-sky-500 bg-white dark:bg-gray-900" placeholder="انضم إلى قناتنا على تليغرام" />
                <p className="mt-1 text-xs text-gray-500">اختصر النص قدر الإمكان ليتناسب مع العرض.</p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">اللون</label>
                <input type="color" name="color" value={form.color} onChange={handleChange} className="h-10 w-16 p-1 rounded border border-gray-300" />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">الرابط</label>
                <div className="flex gap-2">
                  <input name="link" value={form.link} onChange={handleChange} className="flex-1 px-3 py-2 rounded border border-gray-300 focus:ring-2 focus:ring-sky-500 bg-white dark:bg-gray-900" placeholder="https://t.me/yourchannel" />
                </div>
                <p className="mt-1 text-xs text-gray-500">مثال: https://t.me/yourchannel</p>
              </div>

              <div className="pt-2 flex items-center gap-3">
                <button type="submit" disabled={saving} className="inline-flex items-center gap-2 px-4 py-2 rounded bg-sky-600 hover:bg-sky-700 text-white disabled:opacity-60">
                  <Save className="w-4 h-4" />
                  {saving ? 'جارٍ الحفظ...' : 'حفظ الإعدادات'}
                </button>
                <a href={form.link || '#'} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2 rounded border border-gray-300 text-gray-700 hover:bg-gray-50">
                  <Send className="w-4 h-4" />
                  معاينة الرابط
                </a>
              </div>
            </form>
          )}

          <div className="mt-8 p-4 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2 mb-2 text-sm text-gray-700 dark:text-gray-300">
              <Shield className="w-4 h-4" />
              <span>ملاحظة حول الصلاحيات</span>
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              حتى تعمل الكتابة إلى جدول settings عبر الواجهة الأمامية بأمان، نقوم بالتمرير عبر مسار API داخلي يتحقق من كونك مديرًا أولًا. كما يجب أن تكون سياسة RLS لجدول settings تسمح بالقراءة العامة لإعدادات is_public فقط. للكتابة، نستخدم تحقّق الأدمن في هذا المسار.
            </p>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}