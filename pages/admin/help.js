import React from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { HelpCircle } from 'lucide-react';

export default function HelpPage() {
  return (
    <AdminLayout title="المساعدة" description="مركز المساعدة والدعم">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
        <div className="flex items-center gap-3 mb-4">
          <HelpCircle className="w-6 h-6 text-purple-600" />
          <h1 className="text-xl font-semibold">المساعدة</h1>
        </div>
        <p className="text-gray-600 dark:text-gray-300">
          صفحة مبدئية لمسار /admin/help المشار إليه في الشريط الجانبي.
        </p>
      </div>
    </AdminLayout>
  );
}