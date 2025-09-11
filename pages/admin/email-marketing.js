import React from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { Mail } from 'lucide-react';

export default function EmailMarketingPage() {
  return (
    <AdminLayout title="التسويق عبر البريد" description="حملات البريد الإلكتروني">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
        <div className="flex items-center gap-3 mb-4">
          <Mail className="w-6 h-6 text-pink-600" />
          <h1 className="text-xl font-semibold">التسويق عبر البريد</h1>
        </div>
        <p className="text-gray-600 dark:text-gray-300">
          صفحة مبدئية لمسار /admin/email-marketing المشار إليه في الشريط الجانبي.
        </p>
      </div>
    </AdminLayout>
  );
}