import React, { useMemo, useState } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { Globe, Plus, Calendar, BarChart3, Edit, Trash2, Link as LinkIcon, RefreshCw, Search } from 'lucide-react';
import toast from 'react-hot-toast';

const mockAccounts = [
  { id: 1, platform: 'Twitter/X', handle: '@zomiga', status: 'connected', followers: 12500 },
  { id: 2, platform: 'Facebook', handle: 'zomigaPage', status: 'connected', followers: 8450 },
  { id: 3, platform: 'Instagram', handle: '@zomiga_official', status: 'disconnected', followers: 0 },
];

const mockPosts = [
  { id: 101, platform: 'Twitter/X', content: 'تحديث جديد على المنصة 🚀', scheduledAt: '2025-09-10 18:00', status: 'scheduled' },
  { id: 102, platform: 'Facebook', content: 'مقال جديد حول أفضل الممارسات 📚', scheduledAt: '2025-09-11 12:00', status: 'draft' },
  { id: 103, platform: 'Instagram', content: 'لمحة من وراء الكواليس 🎬', scheduledAt: '2025-09-12 20:30', status: 'scheduled' },
];

const StatusPill = ({ status }) => {
  const styles = {
    connected: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
    disconnected: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
    scheduled: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
    draft: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
  };
  return <span className={`px-2 py-0.5 text-xs rounded ${styles[status] || ''}`}>{status}</span>;
};

export default function SocialMediaManagement() {
  const [accounts] = useState(mockAccounts);
  const [posts] = useState(mockPosts);
  const [query, setQuery] = useState('');
  const [platformFilter, setPlatformFilter] = useState('all');
  const [loading, setLoading] = useState(false);

  const filteredPosts = useMemo(() => {
    let list = [...posts];
    if (platformFilter !== 'all') list = list.filter(p => p.platform === platformFilter);
    if (query.trim()) list = list.filter(p => p.content.toLowerCase().includes(query.toLowerCase()));
    return list;
  }, [posts, platformFilter, query]);

  const connectAccount = () => {
    toast.success('تم فتح نافذة ربط الحساب (تجريبي)');
  };

  const schedulePost = () => {
    toast.success('تمت جدولة منشور تجريبي');
  };

  const refreshStats = async () => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 800));
    toast.success('تم تحديث الإحصائيات');
    setLoading(false);
  };

  return (
    <AdminLayout title="إدارة وسائل التواصل الاجتماعي">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">وسائل التواصل الاجتماعي</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">إدارة الحسابات، جدولة المنشورات، واستعراض إحصائيات مبسطة.</p>
          </div>
          <div className="flex gap-2">
            <button onClick={connectAccount} className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700">
              <LinkIcon size={16} /> ربط حساب
            </button>
            <button onClick={schedulePost} className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700">
              <Plus size={16} /> جدولة منشور
            </button>
            <button onClick={refreshStats} disabled={loading} className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-60">
              <RefreshCw className={loading ? 'animate-spin' : ''} size={16} /> تحديث
            </button>
          </div>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500">إجمالي الحسابات المتصلة</p>
                <p className="text-xl font-semibold mt-1">{accounts.filter(a => a.status==='connected').length}</p>
              </div>
              <Globe className="text-blue-600" size={24} />
            </div>
          </div>
          <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500">منشورات مجدولة</p>
                <p className="text-xl font-semibold mt-1">{posts.filter(p => p.status==='scheduled').length}</p>
              </div>
              <Calendar className="text-emerald-600" size={24} />
            </div>
          </div>
          <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500">متابعون إجمالاً</p>
                <p className="text-xl font-semibold mt-1">{accounts.reduce((s,a)=> s + (a.followers||0), 0).toLocaleString()}</p>
              </div>
              <BarChart3 className="text-purple-600" size={24} />
            </div>
          </div>
          <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500">حالة الربط</p>
                <p className="text-xl font-semibold mt-1">{accounts.every(a => a.status==='connected') ? 'مكتمل' : 'بحاجة لمتابعة'}</p>
              </div>
              <StatusPill status={accounts.every(a => a.status==='connected') ? 'connected' : 'disconnected'} />
            </div>
          </div>
        </div>

        {/* Accounts table */}
        <div className="rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="p-4 bg-gray-50 dark:bg-gray-800/50 flex items-center justify-between">
            <h2 className="font-semibold">الحسابات المرتبطة</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800/50">
                <tr>
                  <th className="px-4 py-2 text-right text-sm font-medium text-gray-500">المنصة</th>
                  <th className="px-4 py-2 text-right text-sm font-medium text-gray-500">المعرف</th>
                  <th className="px-4 py-2 text-right text-sm font-medium text-gray-500">المتابعون</th>
                  <th className="px-4 py-2 text-right text-sm font-medium text-gray-500">الحالة</th>
                  <th className="px-4 py-2" />
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                {accounts.map(acc => (
                  <tr key={acc.id}>
                    <td className="px-4 py-3 text-sm">{acc.platform}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{acc.handle}</td>
                    <td className="px-4 py-3 text-sm">{acc.followers.toLocaleString()}</td>
                    <td className="px-4 py-3 text-sm"><StatusPill status={acc.status} /></td>
                    <td className="px-4 py-3 text-sm text-left">
                      <div className="flex items-center gap-2 justify-end">
                        <button className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800"><Edit size={16} /></button>
                        <button className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800"><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Posts section */}
        <div className="rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="p-4 bg-gray-50 dark:bg-gray-800/50 flex items-center justify-between">
            <h2 className="font-semibold">المنشورات</h2>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search size={14} className="absolute right-2 top-2.5 text-gray-400" />
                <input value={query} onChange={e=>setQuery(e.target.value)} placeholder="ابحث في المحتوى" className="pl-3 pr-8 py-2 rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-sm" />
              </div>
              <select value={platformFilter} onChange={e=>setPlatformFilter(e.target.value)} className="py-2 px-3 rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-sm">
                <option value="all">الكل</option>
                <option>Twitter/X</option>
                <option>Facebook</option>
                <option>Instagram</option>
              </select>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800/50">
                <tr>
                  <th className="px-4 py-2 text-right text-sm font-medium text-gray-500">المنصة</th>
                  <th className="px-4 py-2 text-right text-sm font-medium text-gray-500">المحتوى</th>
                  <th className="px-4 py-2 text-right text-sm font-medium text-gray-500">الجدولة</th>
                  <th className="px-4 py-2 text-right text-sm font-medium text-gray-500">الحالة</th>
                  <th className="px-4 py-2" />
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredPosts.map(p => (
                  <tr key={p.id}>
                    <td className="px-4 py-3 text-sm">{p.platform}</td>
                    <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300 max-w-xl truncate" title={p.content}>{p.content}</td>
                    <td className="px-4 py-3 text-sm">{p.scheduledAt}</td>
                    <td className="px-4 py-3 text-sm"><StatusPill status={p.status} /></td>
                    <td className="px-4 py-3 text-sm text-left">
                      <div className="flex items-center gap-2 justify-end">
                        <button className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800"><Edit size={16} /></button>
                        <button className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800"><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}