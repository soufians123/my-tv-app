import React from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { Bell } from 'lucide-react';

export default function NotificationsPage() {
  return (
    <AdminLayout title="الإشعارات" description="مركز الإشعارات الإداري">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
        <div className="flex items-center gap-3 mb-4">
          <Bell className="w-6 h-6 text-yellow-600" />
          <h1 className="text-xl font-semibold">مركز الإشعارات</h1>
        </div>
        <p className="text-gray-600 dark:text-gray-300">
          صفحة مبدئية لمسار /admin/notifications المشار إليه في الترويسة.
        </p>
      </div>
    </AdminLayout>
  );
}