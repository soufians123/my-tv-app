import React from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { Users } from 'lucide-react';

export default function UsersManagementPage() {
  return (
    <AdminLayout title="إدارة المستخدمين" description="صفحة إدارية لإدارة المستخدمين (Placeholder)">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
        <div className="flex items-center gap-3 mb-4">
          <Users className="w-6 h-6 text-sky-600" />
          <h1 className="text-xl font-semibold">إدارة المستخدمين</h1>
        </div>
        <p className="text-gray-600 dark:text-gray-300">
          هذه صفحة مؤقتة لمسار /admin/users-management المشار إليه في الشريط الجانبي.
        </p>
      </div>
    </AdminLayout>
  );
}