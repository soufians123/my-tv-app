import { useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { useAuth } from '../../contexts/AuthContext'
import Layout from '../../components/Layout'
import { Heart } from 'lucide-react'

const FavoritesPage = () => {
  const router = useRouter()
  const { user } = useAuth()
  
  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-6 sm:py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6 mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div className="mb-4 sm:mb-0">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                  <Heart className="inline-block h-8 w-8 text-red-500 mr-3" />
                  المفضلة
                </h1>
                <p className="text-gray-600">
                  إدارة العناصر المفضلة لديك
                </p>
              </div>
            </div>
          </div>

          {/* المحتوى */}
          <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
            <div className="text-center py-12">
              <Heart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد مفضلة بعد</h3>
              <p className="text-gray-600 mb-6">ابدأ بإضافة القنوات والمقالات والألعاب المفضلة لديك</p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link href="/channels" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  تصفح القنوات
                </Link>
                <Link href="/articles" className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                  تصفح المقالات
                </Link>
                <Link href="/games" className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                  تصفح الألعاب
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}

export default FavoritesPage