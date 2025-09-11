import React, { createContext, useContext, useState, useEffect } from 'react'
import { Heart, Star, Trash2, Search, Filter, SortAsc } from 'lucide-react'

// Create Favorites Context
const FavoritesContext = createContext()

// Custom hook to use favorites
export const useFavorites = () => {
  const context = useContext(FavoritesContext)
  if (!context) {
    throw new Error('useFavorites must be used within a FavoritesProvider')
  }
  return context
}

// Favorites Provider Component
const FavoritesProvider = ({ children }) => {
  const [favorites, setFavorites] = useState({
    channels: [],
    games: [],
    articles: [],
    products: [],
    gifts: []
  })
  const [isLoading, setIsLoading] = useState(false)
  const [lastSync, setLastSync] = useState(null)

  // Load favorites from localStorage on mount
  useEffect(() => {
    try {
      const savedFavorites = typeof window !== 'undefined' ? localStorage.getItem('favorites') : null
      if (savedFavorites) {
        setFavorites(JSON.parse(savedFavorites))
      }
      const savedLastSync = typeof window !== 'undefined' ? localStorage.getItem('favorites_last_sync') : null
      if (savedLastSync) {
        setLastSync(savedLastSync)
      }
    } catch (error) {
      console.error('Error loading favorites:', error)
    }
  }, [])

  // Save favorites to localStorage whenever favorites change
  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem('favorites', JSON.stringify(favorites))
      }
    } catch (error) {
      console.error('Error saving favorites:', error)
    }
  }, [favorites])

  // Add or remove item from favorites
  const toggleFavorite = (type, item) => {
    setFavorites(prev => {
      const currentFavorites = prev[type] || []
      const isAlreadyFavorite = currentFavorites.some(fav => fav.id === item.id)
      
      if (isAlreadyFavorite) {
        // Remove from favorites
        return {
          ...prev,
          [type]: currentFavorites.filter(fav => fav.id !== item.id)
        }
      } else {
        // Add to favorites
        return {
          ...prev,
          [type]: [...currentFavorites, { ...item, addedAt: new Date().toISOString() }]
        }
      }
    })
  }

  // Explicit add/remove helpers for compatibility
  const addToFavorites = (type, item) => {
    setFavorites(prev => {
      const currentFavorites = prev[type] || []
      const isAlreadyFavorite = currentFavorites.some(fav => fav.id === item.id)
      if (isAlreadyFavorite) return prev
      return {
        ...prev,
        [type]: [...currentFavorites, { ...item, addedAt: new Date().toISOString() }]
      }
    })
  }

  const removeFromFavorites = (type, itemId) => {
    setFavorites(prev => ({
      ...prev,
      [type]: (prev[type] || []).filter(fav => fav.id !== itemId)
    }))
  }

  // Check if item is in favorites
  const isFavorite = (type, itemId) => {
    const currentFavorites = favorites[type] || []
    return currentFavorites.some(fav => fav.id === itemId)
  }

  // Get favorites by type
  const getFavorites = (type) => {
    return favorites[type] || []
  }

  // Get total favorites count
  const getTotalFavorites = () => {
    return Object.values(favorites).reduce((total, typeArray) => total + typeArray.length, 0)
  }

  // Clear all favorites of a specific type
  const clearFavorites = (type) => {
    setFavorites(prev => ({
      ...prev,
      [type]: []
    }))
  }

  // Clear all favorites across all types
  const clearAllFavorites = () => {
    setFavorites({
      channels: [], games: [], articles: [], products: [], gifts: []
    })
  }

  // Export favorites to JSON file
  const exportFavorites = () => {
    try {
      if (typeof window === 'undefined') return
      const dataStr = JSON.stringify(favorites, null, 2)
      const blob = new Blob([dataStr], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `favorites-${new Date().toISOString().slice(0,10)}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error exporting favorites:', error)
    }
  }

  // Import favorites from JSON file (File input)
  const importFavorites = async (file) => {
    try {
      if (!file) return
      const text = await file.text()
      const parsed = JSON.parse(text)
      const structure = { channels: [], games: [], articles: [], products: [], gifts: [] }
      const next = { ...structure, ...parsed }
      // Normalize entries: ensure each has id
      Object.keys(next).forEach(key => {
        next[key] = (next[key] || []).filter(Boolean).map(item => ({
          ...item,
          addedAt: item.addedAt || new Date().toISOString()
        }))
      })
      setFavorites(next)
    } catch (error) {
      console.error('Error importing favorites:', error)
    }
  }

  // Simulate cloud sync (local persistence + timestamp)
  const syncWithCloud = async () => {
    try {
      setIsLoading(true)
      // Simulate delay
      await new Promise(res => setTimeout(res, 600))
      const now = new Date().toISOString()
      setLastSync(now)
      if (typeof window !== 'undefined') {
        localStorage.setItem('favorites_last_sync', now)
      }
    } catch (error) {
      console.error('Error syncing favorites:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Stats for UI
  const getFavoritesStats = () => {
    return {
      total: getTotalFavorites(),
      channels: favorites.channels.length,
      articles: favorites.articles.length,
      games: favorites.games.length,
      products: favorites.products.length,
      gifts: favorites.gifts.length
    }
  }

  const value = {
    favorites,
    // state
    isLoading,
    lastSync,
    // actions
    toggleFavorite,
    addToFavorites,
    removeFromFavorites,
    isFavorite,
    getFavorites,
    getTotalFavorites,
    clearFavorites,
    clearAllFavorites,
    exportFavorites,
    importFavorites,
    syncWithCloud,
    getFavoritesStats
  }

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  )
}

// Favorite Button Component
export const FavoriteButton = ({ type, item, className = '' }) => {
  const { toggleFavorite, isFavorite } = useFavorites()
  const isItemFavorite = isFavorite(type, item.id)

  return (
    <button
      onClick={(e) => {
        e.stopPropagation()
        toggleFavorite(type, item)
      }}
      className={`p-2 rounded-lg transition-all duration-200 group ${
        isItemFavorite
          ? 'bg-red-50 text-red-600 hover:bg-red-100'
          : 'bg-gray-50 text-gray-400 hover:bg-red-50 hover:text-red-500'
      } ${className}`}
      title={isItemFavorite ? 'إزالة من المفضلة' : 'إضافة للمفضلة'}
    >
      <Heart
        className={`w-4 h-4 transition-all duration-200 group-hover:scale-110 ${
          isItemFavorite ? 'fill-current' : ''
        }`}
      />
    </button>
  )
}

// Favorites Display Component
export const FavoritesDisplay = ({ type = 'all', showHeader = true, className = '' }) => {
  const { favorites, getFavorites, clearFavorites, getTotalFavorites } = useFavorites()
  const [searchTerm, setSearchTerm] = useState('')

  // Get favorites to display
  const favoritesToShow = type === 'all' 
    ? Object.entries(favorites).flatMap(([favType, items]) => 
        items.map(item => ({ ...item, type: favType }))
      )
    : getFavorites(type)

  // Filter favorites based on search term
  const filteredFavorites = favoritesToShow.filter(item =>
    item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.title?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getTypeLabel = (itemType) => {
    const labels = {
      channels: 'قناة',
      games: 'لعبة',
      articles: 'مقال',
      products: 'منتج',
      gifts: 'هدية'
    }
    return labels[itemType] || itemType
  }

  const getTypeIcon = (itemType) => {
    switch (itemType) {
      case 'channels':
        return '📺'
      case 'games':
        return '🎮'
      case 'articles':
        return '📄'
      case 'products':
        return '🛍️'
      case 'gifts':
        return '🎁'
      default:
        return '⭐'
    }
  }

  if (getTotalFavorites() === 0) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <div className="text-6xl mb-4">💝</div>
        <h3 className="text-xl font-semibold text-gray-700 mb-2">
          لا توجد عناصر مفضلة بعد
        </h3>
        <p className="text-gray-500">
          ابدأ بإضافة العناصر التي تحبها إلى المفضلة
        </p>
      </div>
    )
  }

  return (
    <div className={`bg-white rounded-2xl shadow-lg border border-gray-100 ${className}`}>
      {showHeader && (
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-50 rounded-lg">
                <Heart className="w-5 h-5 text-red-500 fill-current" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  المفضلة ({getTotalFavorites()})
                </h2>
                <p className="text-sm text-gray-500">
                  العناصر التي أضفتها إلى المفضلة
                </p>
              </div>
            </div>
            {type !== 'all' && getFavorites(type).length > 0 && (
              <button
                onClick={() => clearFavorites(type)}
                className="flex items-center gap-2 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                <span className="text-sm">مسح الكل</span>
              </button>
            )}
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="البحث في المفضلة..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>
        </div>
      )}

      <div className="p-6">
        {filteredFavorites.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-3">🔍</div>
            <p className="text-gray-500">
              {searchTerm ? 'لم يتم العثور على نتائج' : 'لا توجد عناصر مفضلة'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredFavorites.map((item, index) => (
              <div
                key={`${item.type}-${item.id}-${index}`}
                className="group p-4 border border-gray-100 rounded-xl hover:shadow-md transition-all duration-200 hover:border-red-200"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{getTypeIcon(item.type)}</span>
                    <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full">
                      {getTypeLabel(item.type)}
                    </span>
                  </div>
                  <FavoriteButton
                    type={item.type}
                    item={item}
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                  />
                </div>

                <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                  {item.name || item.title}
                </h3>
                
                {item.description && (
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {item.description}
                  </p>
                )}

                <div className="flex items-center justify-between text-xs text-gray-500">
                  {item.rating && (
                    <div className="flex items-center gap-1">
                      <Star className="w-3 h-3 text-yellow-400 fill-current" />
                      <span>{item.rating}</span>
                    </div>
                  )}
                  {item.addedAt && (
                    <span>
                      {new Date(item.addedAt).toLocaleDateString('ar-EG')}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default FavoritesProvider