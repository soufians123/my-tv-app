import React from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { Activity } from 'lucide-react';

export default function LogsPage() {
  return (
    <AdminLayout title="سجلات النظام" description="سجلات وأحداث النظام">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
        <div className="flex items-center gap-3 mb-4">
          <Activity className="w-6 h-6 text-gray-600" />
          <h1 className="text-xl font-semibold">سجلات النظام</h1>
        </div>
        <p className="text-gray-600 dark:text-gray-300">
          صفحة مبدئية لمسار /admin/logs لتفادي أخطاء توجيه الروابط.
        </p>
      </div>
    </AdminLayout>
  );
}