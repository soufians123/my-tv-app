import { useState, useEffect, useMemo } from 'react'
import { Search, Filter, X, ChevronDown, Star, Eye, MapPin, Tv, Gamepad2, FileText, ShoppingBag } from 'lucide-react'
import { useToast } from './ToastSystem'
import { Button, Input, Card, Badge } from './ui/unified-components'

const SearchSystem = ({ data, onResults, placeholder = "البحث...", type = "channels" }) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [filters, setFilters] = useState({
    category: '',
    country: '',
    rating: '',
    sortBy: 'name'
  })
  const { showToast } = useToast()

  // Get unique values for filter options
  const filterOptions = useMemo(() => {
    if (!data || data.length === 0) return { categories: [], countries: [], ratings: [] }
    
    const categories = [...new Set(data.map(item => item.category).filter(Boolean))]
    const countries = [...new Set(data.map(item => item.country).filter(Boolean))]
    const ratings = ['4.5+', '4.0+', '3.5+', '3.0+']
    
    return { categories, countries, ratings }
  }, [data])

  // Advanced search and filter logic
  const filteredResults = useMemo(() => {
    if (!data) return []
    
    let results = data.filter(item => {
      // Text search
      const searchLower = searchQuery.toLowerCase()
      const matchesSearch = !searchQuery || 
        item.name?.toLowerCase().includes(searchLower) ||
        item.description?.toLowerCase().includes(searchLower) ||
        item.category?.toLowerCase().includes(searchLower) ||
        item.country?.toLowerCase().includes(searchLower)
      
      // Category filter
      const matchesCategory = !filters.category || item.category === filters.category
      
      // Country filter
      const matchesCountry = !filters.country || item.country === filters.country
      
      // Rating filter
      const matchesRating = !filters.rating || (() => {
        const minRating = parseFloat(filters.rating.replace('+', ''))
        return item.rating >= minRating
      })()
      
      return matchesSearch && matchesCategory && matchesCountry && matchesRating
    })
    
    // Sorting
    results.sort((a, b) => {
      switch (filters.sortBy) {
        case 'name':
          return a.name?.localeCompare(b.name, 'ar') || 0
        case 'rating':
          return (b.rating || 0) - (a.rating || 0)
        case 'viewers':
          const aViewers = parseFloat(a.viewers?.replace(/[^0-9.]/g, '') || '0')
          const bViewers = parseFloat(b.viewers?.replace(/[^0-9.]/g, '') || '0')
          return bViewers - aViewers
        case 'category':
          return a.category?.localeCompare(b.category, 'ar') || 0
        default:
          return 0
      }
    })
    
    return results
  }, [data, searchQuery, filters])

  // Update results when filtered data changes
  useEffect(() => {
    onResults(filteredResults)
  }, [filteredResults, onResults])

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }))
    showToast(`تم تطبيق فلتر ${key}`, 'info')
  }

  const clearFilters = () => {
    setFilters({
      category: '',
      country: '',
      rating: '',
      sortBy: 'name'
    })
    setSearchQuery('')
    showToast('تم مسح جميع الفلاتر', 'success')
  }

  const getTypeIcon = () => {
    switch (type) {
      case 'channels': return <Tv className="w-5 h-5" />
      case 'games': return <Gamepad2 className="w-5 h-5" />
      case 'articles': return <FileText className="w-5 h-5" />
      case 'products': return <ShoppingBag className="w-5 h-5" />
      default: return <Search className="w-5 h-5" />
    }
  }

  const activeFiltersCount = Object.values(filters).filter(value => value && value !== 'name').length + (searchQuery ? 1 : 0)

  return (
    <div className="bg-white rounded-2xl shadow-soft border border-gray-100 overflow-hidden">
      {/* Search Header */}
      <div className="bg-gradient-to-r from-primary-50 to-secondary-50 px-6 py-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white rounded-xl shadow-sm">
              {getTypeIcon()}
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">البحث المتقدم</h3>
              <p className="text-sm text-gray-600">
                {filteredResults.length} من {data?.length || 0} نتيجة
              </p>
            </div>
          </div>
          
          {activeFiltersCount > 0 && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-2 px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors duration-200"
            >
              <X className="w-4 h-4" />
              <span className="text-sm font-medium">مسح الفلاتر ({activeFiltersCount})</span>
            </button>
          )}
        </div>
      </div>

      {/* Search Input */}
      <div className="p-6 border-b border-gray-100">
        <div className="relative">
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="block w-full pr-10 pl-3 py-3 border border-gray-200 rounded-xl leading-5 bg-gray-50 placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 focus:bg-white transition-all duration-200"
            placeholder={placeholder}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute inset-y-0 left-0 pl-3 flex items-center"
            >
              <X className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors" />
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="px-6 py-4">
        <button
          onClick={() => setIsFilterOpen(!isFilterOpen)}
          className="flex items-center justify-between w-full p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors duration-200"
        >
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-600" />
            <span className="font-medium text-gray-700">فلاتر متقدمة</span>
            {activeFiltersCount > 0 && (
              <span className="px-2 py-1 bg-primary-100 text-primary-700 rounded-full text-xs font-bold">
                {activeFiltersCount}
              </span>
            )}
          </div>
          <ChevronDown className={`w-5 h-5 text-gray-600 transition-transform duration-200 ${
            isFilterOpen ? 'rotate-180' : ''
          }`} />
        </button>

        {isFilterOpen && (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-slide-down">
            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">الفئة</label>
              <select
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200"
              >
                <option value="">جميع الفئات</option>
                {filterOptions.categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            {/* Country Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">البلد</label>
              <select
                value={filters.country}
                onChange={(e) => handleFilterChange('country', e.target.value)}
                className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200"
              >
                <option value="">جميع البلدان</option>
                {filterOptions.countries.map(country => (
                  <option key={country} value={country}>{country}</option>
                ))}
              </select>
            </div>

            {/* Rating Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">التقييم</label>
              <select
                value={filters.rating}
                onChange={(e) => handleFilterChange('rating', e.target.value)}
                className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200"
              >
                <option value="">جميع التقييمات</option>
                {filterOptions.ratings.map(rating => (
                  <option key={rating} value={rating}>{rating} نجوم</option>
                ))}
              </select>
            </div>

            {/* Sort By */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">ترتيب حسب</label>
              <select
                value={filters.sortBy}
                onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200"
              >
                <option value="name">الاسم</option>
                <option value="rating">التقييم</option>
                <option value="viewers">عدد المشاهدين</option>
                <option value="category">الفئة</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Search Results Summary */}
      {(searchQuery || activeFiltersCount > 0) && (
        <div className="px-6 py-3 bg-gray-50 border-t border-gray-100">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-gray-600">
              <span>النتائج:</span>
              <span className="font-bold text-primary-600">{filteredResults.length}</span>
              {searchQuery && (
                <span>للبحث عن "{searchQuery}"</span>
              )}
            </div>
            
            {filteredResults.length === 0 && (
              <span className="text-red-600 font-medium">لا توجد نتائج مطابقة</span>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default SearchSystem