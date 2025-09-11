import React from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import Link from 'next/link';
import { Activity, BarChart3, Users, Tv, Megaphone, FileText, Gift, Globe, ArrowLeft } from 'lucide-react';

export default function AdvancedDashboard() {
  const quickLinks = [
    { href: '/admin/advertisements', title: 'إدارة الإعلانات', icon: Megaphone, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-900/20' },
    { href: '/admin/articles', title: 'إدارة المقالات', icon: FileText, color: 'text-indigo-600', bg: 'bg-indigo-50 dark:bg-indigo-900/20' },
    { href: '/admin/gifts', title: 'إدارة العروض والهدايا', icon: Gift, color: 'text-rose-600', bg: 'bg-rose-50 dark:bg-rose-900/20' },
    { href: '/admin/social-media', title: 'وسائل التواصل الاجتماعي', icon: Globe, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
  ];

  return (
    <AdminLayout title="لوحة التحكم المتقدمة" description="نظرة عامة متقدمة على النظام">
      <div className="space-y-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
          <div className="flex items-center gap-3 mb-4">
            <Activity className="w-6 h-6 text-blue-600" />
            <h1 className="text-xl font-semibold">لوحة التحكم المتقدمة</h1>
          </div>
          <p className="text-gray-600 dark:text-gray-300">
            هذه صفحة مبدئية للوحة التحكم المتقدمة. يمكنك استخدامها لاحقًا لعرض مؤشرات الأداء، بطاقات إحصائية، ومخططات تفاعلية.
          </p>
        </div>

        {/* KPI cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-5">
            <div className="flex items-center gap-3">
              <BarChart3 className="w-5 h-5 text-emerald-600" />
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">معدل النشاط</p>
                <p className="text-lg font-semibold">+18%</p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-5">
            <div className="flex items-center gap-3">
              <Users className="w-5 h-5 text-indigo-600" />
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">المستخدمون الجدد</p>
                <p className="text-lg font-semibold">124</p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-5">
            <div className="flex items-center gap-3">
              <Tv className="w-5 h-5 text-pink-600" />
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">القنوات النشطة</p>
                <p className="text-lg font-semibold">37</p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-5">
            <div className="flex items-center gap-3">
              <Activity className="w-5 h-5 text-orange-600" />
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">حالة النظام</p>
                <p className="text-lg font-semibold">مستقر</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">الإجراءات السريعة</h2>
            <ArrowLeft className="w-4 h-4 text-gray-400" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickLinks.map((item) => {
              const Icon = item.icon;
              return (
                <Link key={item.href} href={item.href} className={`group rounded-xl border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition ${item.bg}`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center bg-white/70 dark:bg-gray-900/40 ${item.color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-medium text-sm text-gray-900 dark:text-gray-100 group-hover:underline">{item.title}</p>
                      <p className="text-xs text-gray-500">انتقل الآن</p>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}