import dynamic from 'next/dynamic'
import { Loader } from 'lucide-react'

// Dynamic loading for heavy editor components
const AdvancedEditor = dynamic(
  () => import('./AdvancedEditor'),
  {
    loading: () => (
      <div className="flex items-center justify-center p-12 bg-gray-50 rounded-lg">
        <div className="text-center">
          <Loader className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-gray-600">جاري تحميل المحرر المتقدم...</p>
        </div>
      </div>
    ),
    ssr: false
  }
)

const CommentsSystem = dynamic(
  () => import('./CommentsSystem'),
  {
    loading: () => (
      <div className="animate-pulse space-y-4">
        <div className="bg-gray-200 rounded-lg h-32"></div>
        <div className="bg-gray-200 rounded-lg h-24"></div>
        <div className="bg-gray-200 rounded-lg h-24"></div>
      </div>
    ),
    ssr: false
  }
)

const SearchSystem = dynamic(
  () => import('./SearchSystem'),
  {
    loading: () => (
      <div className="animate-pulse bg-gray-200 rounded-lg h-12 w-full"></div>
    ),
    ssr: false
  }
)

export {
  AdvancedEditor,
  CommentsSystem,
  SearchSystem
}