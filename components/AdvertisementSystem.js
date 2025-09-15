import React, { useState, useEffect, useContext, createContext, useCallback, useMemo } from 'react'
import { X, Eye, MousePointerClick, TrendingUp, Calendar, Target, BarChart3, Settings, Plus, Edit, Trash2 } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { getAllActiveAds } from '../lib/advertisementsService'
import { Button, Card, Badge } from './ui/unified-components'

// Advertisement Context
const AdvertisementContext = createContext()

// Advertisement Provider
const AdvertisementProvider = ({ children }) => {
  const [advertisements, setAdvertisements] = useState([])
  const [adSettings, setAdSettings] = useState({
    enabled: true,
    frequency: 'medium', // low, medium, high
    positions: ['header', 'sidebar', 'content', 'footer'],
    autoRotate: true,
    rotationInterval: 30000, // 30 seconds
    showCloseButton: true,
    respectUserPreferences: true,
    showPopups: true
  })
  const [adStats, setAdStats] = useState({})
  const [userPreferences, setUserPreferences] = useState({
    allowAds: true,
    preferredCategories: [],
    blockedCategories: []
  })

  // Load advertisements
  useEffect(() => {
    loadAdvertisements()
    loadAdSettings()
    loadUserPreferences()
  }, [])

  const loadAdvertisements = useCallback(async () => {
    try {
      // جلب الإعلانات الحقيقية من Supabase مع مراعاة تاريخ الانتهاء (قد يكون NULL)
      const activeAds = await getAllActiveAds(100)
      console.log('[Ads] fetched active ads count:', Array.isArray(activeAds) ? activeAds.length : 'N/A', activeAds)
      const normalized = (activeAds || []).map(ad => ({
        id: ad.id,
        title: ad.title,
        description: ad.description || '',
        image: ad.image_url || null,
        link: ad.link_url || '#',
        category: 'عام',
        type: ad.ad_type || 'banner',
        position: ad.position || 'header',
        priority: 'medium',
        startDate: ad.start_date || null,
        endDate: ad.end_date || null,
        targetAudience: ad.target_audience || [],
        budget: Number(ad.budget || 0),
        spent: 0,
        impressions: ad.impression_count || 0,
        clicks: ad.click_count || 0,
        conversions: 0,
        isActive: !!ad.is_active,
        createdAt: ad.created_at,
        updatedAt: ad.updated_at
      }))
      console.log('[Ads] normalized ads positions:', normalized.map(a => a.position))
      setAdvertisements(normalized)
    } catch (error) {
      console.error('Error loading advertisements:', error)
    }
  }, [])

  const loadAdSettings = () => {
    const savedSettings = localStorage.getItem('adSettings')
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings)
        setAdSettings(prev => ({ ...prev, ...parsed }))
      } catch (_) {
        // تجاهل في حال فساد التخزين
      }
    }
  }

  const loadUserPreferences = () => {
    const savedPreferences = localStorage.getItem('userAdPreferences')
    if (savedPreferences) {
      try {
        const parsed = JSON.parse(savedPreferences)
        setUserPreferences(prev => ({ ...prev, ...parsed }))
      } catch (_) {
        // تجاهل في حال فساد التخزين
      }
    }
  }

  const trackAdImpression = useCallback((adId) => {
    setAdStats(prev => ({
      ...prev,
      [adId]: {
        ...prev[adId],
        impressions: (prev[adId]?.impressions || 0) + 1,
        lastSeen: new Date().toISOString()
      }
    }))
  }, [])

  const trackAdClick = useCallback((adId) => {
    setAdStats(prev => ({
      ...prev,
      [adId]: {
        ...prev[adId],
        clicks: (prev[adId]?.clicks || 0) + 1,
        lastClicked: new Date().toISOString()
      }
    }))
  }, [])

  // Memoized contextual mapping for better performance
  const contextualMapping = useMemo(() => ({
    'gaming': ['ألعاب', 'تقنية', 'ترفيه'],
    'games': ['ألعاب', 'تقنية', 'ترفيه'],
    'articles': ['تعليم', 'كتب', 'أخبار', 'نمط حياة'],
    'gifts': ['تسوق', 'نمط حياة', 'أزياء', 'تقنية'],
    'index': ['عام', 'تقنية', 'نمط حياة'],
    'header': ['عام', 'تقنية'],
    'sidebar': ['نمط حياة', 'تسوق'],
    'footer': ['عام', 'تعليم'],
    'default': ['عام', 'تقنية', 'نمط حياة']
  }), [])

  // Enhanced smart ad selection based on context and user behavior
  const getContextualAds = useCallback((context, userPrefs = {}) => {
    const relevantCategories = contextualMapping[context] || contextualMapping.default
    let contextualAds = advertisements.filter(ad => 
      relevantCategories.includes(ad.category) || ad.category === 'عام'
    )
    
    // Apply user preferences if available
    if (userPrefs.preferredCategories && userPrefs.preferredCategories.length > 0) {
      const preferredAds = contextualAds.filter(ad => 
        userPrefs.preferredCategories.some(interest => 
          ad.category.includes(interest) || ad.title.toLowerCase().includes(interest.toLowerCase())
        )
      )
      if (preferredAds.length > 0) {
        contextualAds = preferredAds
      }
    }
    
    // Ensure we always have ads to show
    if (contextualAds.length === 0) {
      contextualAds = advertisements.slice(0, 3)
    }
    
    return contextualAds
  }, [advertisements, contextualMapping])

  const getFilteredAds = useCallback((position, category = null) => {
    if (!adSettings.enabled || !userPreferences.allowAds) {
      return []
    }

    return advertisements.filter(ad => {
      if (!ad.isActive) return false
      if (position && ad.position !== position) return false
      if (category && ad.category !== category) return false
      if (userPreferences.blockedCategories.includes(ad.category)) return false
      
      // Check date range (تعامل مع نهاية غير محددة)
      const now = new Date()
      const startDate = ad.startDate ? new Date(ad.startDate) : new Date(0)
      const endDate = ad.endDate ? new Date(ad.endDate) : null
      
      return now >= startDate && (endDate === null || now <= endDate)
    })
  }, [advertisements, adSettings.enabled, userPreferences.allowAds, userPreferences.blockedCategories])

  const updateAdSettings = useCallback((newSettings) => {
    setAdSettings(newSettings)
    localStorage.setItem('adSettings', JSON.stringify(newSettings))
  }, [])

  const updateUserPreferences = useCallback((newPreferences) => {
    setUserPreferences(newPreferences)
    localStorage.setItem('userAdPreferences', JSON.stringify(newPreferences))
  }, [])

  const value = {
    advertisements,
    adSettings,
    adStats,
    userPreferences,
    trackAdImpression,
    trackAdClick,
    getFilteredAds,
    getContextualAds,
    updateAdSettings,
    updateUserPreferences,
    setAdvertisements
  }

  return (
    <AdvertisementContext.Provider value={value}>
      {children}
    </AdvertisementContext.Provider>
  )
}

// Hook to use advertisement context
const useAdvertisement = () => {
  const context = useContext(AdvertisementContext)
  if (!context) {
    throw new Error('useAdvertisement must be used within AdvertisementProvider')
  }
  return context
}

// Banner Advertisement Component
const BannerAd = ({ position = 'header', className = '' }) => {
  const { getFilteredAds, getContextualAds, trackAdImpression, trackAdClick, adSettings } = useAdvertisement()
  const [currentAdIndex, setCurrentAdIndex] = useState(0)
  const [isVisible, setIsVisible] = useState(true)

  // Use contextual ads for better relevance
  const contextualAds = getContextualAds(position)
  const ads = getFilteredAds(position).length > 0 ? getFilteredAds(position) : contextualAds
  const currentAd = ads[currentAdIndex]

  useEffect(() => {
    if (currentAd) {
      trackAdImpression(currentAd.id)
    }
  }, [currentAd])

  useEffect(() => {
    if (ads.length > 1 && adSettings.autoRotate) {
      const interval = setInterval(() => {
        setCurrentAdIndex(prev => (prev + 1) % ads.length)
      }, adSettings.rotationInterval)
      return () => clearInterval(interval)
    }
  }, [ads.length, adSettings.autoRotate, adSettings.rotationInterval])

  if (!currentAd || !isVisible) return null

  const handleClick = () => {
    trackAdClick(currentAd.id)
    if (currentAd.link.startsWith('http')) {
      window.open(currentAd.link, '_blank')
    } else {
      window.location.href = currentAd.link
    }
  }

  const handleClose = () => {
    setIsVisible(false)
  }

  return (
    <div className={`relative bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 border border-gray-100 rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 ${className}`}>
      {adSettings.showCloseButton && (
        <button
          onClick={handleClose}
          className="absolute top-2 left-2 sm:top-3 sm:left-3 z-10 bg-white bg-opacity-90 text-gray-600 rounded-full p-1 sm:p-1.5 hover:bg-opacity-100 hover:text-gray-800 transition-all duration-200 shadow-sm touch-target"
        >
          <X className="w-3 h-3" />
        </button>
      )}
      
      <div 
        className="cursor-pointer flex items-center p-2 sm:p-4 group hover:bg-white hover:bg-opacity-50 transition-all duration-300"
        onClick={handleClick}
      >
        {currentAd.image && (
          <div className="relative overflow-hidden rounded-lg sm:rounded-xl mr-2 sm:mr-4 group-hover:scale-105 transition-transform duration-300 w-16 h-16 sm:w-24 sm:h-24 flex items-center justify-center bg-white flex-shrink-0">
            <img 
              src={currentAd.image} 
              alt={currentAd.title}
              className="w-full h-full object-contain"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1 sm:gap-2 mb-1">
            <h3 className="font-bold text-base sm:text-lg text-gray-800 group-hover:text-purple-700 transition-colors duration-300 line-clamp-1">{currentAd.title}</h3>
          </div>
          <p className="text-xs sm:text-sm text-gray-600 line-clamp-2 mb-2 sm:mb-0">{currentAd.description}</p>
        </div>
        <div className="text-left flex-shrink-0">
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-2 py-1 sm:px-3 sm:py-1.5 rounded-lg text-xs font-medium group-hover:from-purple-700 group-hover:to-pink-700 transition-all duration-300 touch-target">
            <span className="hidden sm:inline">اعرف المزيد</span>
            <span className="sm:hidden">عرض</span>
          </div>
        </div>
      </div>
      
      {ads.length > 1 && (
        <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-1">
          {ads.map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                index === currentAdIndex ? 'bg-purple-500 scale-125' : 'bg-gray-300'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// Card Advertisement Component
const CardAd = ({ position = 'sidebar', className = '' }) => {
  const { getFilteredAds, getContextualAds, trackAdImpression, trackAdClick } = useAdvertisement()
  const [isVisible, setIsVisible] = useState(true)
  
  // Use contextual ads for better relevance
  const contextualAds = getContextualAds(position)
  const ads = getFilteredAds(position).length > 0 ? getFilteredAds(position) : contextualAds
  const ad = ads[0] // Show first available ad

  useEffect(() => {
    if (ad) {
      trackAdImpression(ad.id)
    }
  }, [ad])

  if (!ad || !isVisible) return null

  const handleClick = () => {
    trackAdClick(ad.id)
    if (ad.link.startsWith('http')) {
      window.open(ad.link, '_blank')
    } else {
      window.location.href = ad.link
    }
  }

  const handleClose = () => {
    setIsVisible(false)
  }

  return (
    <div className={`relative bg-white border border-gray-50 rounded-2xl sm:rounded-3xl p-3 sm:p-5 shadow-sm hover:shadow-md transition-all duration-300 group ${className}`}>
      <button
        onClick={handleClose}
        className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 text-gray-200 hover:text-gray-400 transition-colors z-10 bg-white/80 hover:bg-white rounded-full p-1 sm:p-1.5 shadow-sm touch-target"
        aria-label="Close advertisement"
      >
        <X className="w-3 h-3" />
      </button>
      
      <div 
        className="cursor-pointer"
        onClick={handleClick}
      >
        <div className="space-y-2 sm:space-y-3">
          <div className="w-full h-20 sm:h-28 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl sm:rounded-2xl flex items-center justify-center overflow-hidden">
            <img 
              src={ad.image} 
              alt={ad.title}
              className="w-full h-full object-contain group-hover:scale-102 transition-transform duration-500"
            />
          </div>
          
          <div>
            <h3 className="font-medium text-gray-900 text-xs sm:text-sm mb-1 sm:mb-1.5 line-clamp-1">{ad.title}</h3>
            <p className="text-gray-500 text-xs leading-relaxed mb-2 sm:mb-3 line-clamp-2">{ad.description}</p>
            
            <button className="w-full bg-gray-900 hover:bg-gray-800 text-white py-2 sm:py-2.5 px-3 sm:px-4 rounded-xl sm:rounded-2xl text-xs font-medium transition-all duration-300 touch-target">
              اعرف المزيد
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// Popup Advertisement Component
const PopupAd = ({ className = '' }) => {
  const { getFilteredAds, trackAdImpression, trackAdClick, adSettings } = useAdvertisement()
  const [isVisible, setIsVisible] = useState(false)
  const [currentAdIndex, setCurrentAdIndex] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)
  
  const ads = getFilteredAds('popup')
  const currentAd = ads[currentAdIndex]

  useEffect(() => {
    if (ads.length > 0 && adSettings.showPopups) {
      const timer = setTimeout(() => {
        setIsVisible(true)
        setIsAnimating(true)
      }, 3000) // Show after 3 seconds
      return () => clearTimeout(timer)
    }
  }, [ads.length, adSettings.showPopups])

  useEffect(() => {
    if (currentAd && isVisible) {
      trackAdImpression(currentAd.id)
    }
  }, [currentAd, isVisible])

  if (!currentAd || !isVisible) return null

  const handleClick = () => {
    trackAdClick(currentAd.id)
    if (currentAd.link.startsWith('http')) {
      window.open(currentAd.link, '_blank')
    } else {
      window.location.href = currentAd.link
    }
  }

  const handleClose = () => {
    setIsAnimating(false)
    setTimeout(() => setIsVisible(false), 300)
  }

  return (
    <div className={`fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-3 sm:p-4 transition-all duration-300 ${isAnimating ? 'opacity-100' : 'opacity-0'}`}>
      <div className={`relative bg-white rounded-xl sm:rounded-2xl shadow-xl max-w-xs sm:max-w-sm w-full overflow-hidden transform transition-all duration-500 ${isAnimating ? 'scale-100 translate-y-0' : 'scale-95 translate-y-8'} border border-gray-100 ${className}`}>
        <button
          onClick={handleClose}
          className="absolute top-2 right-2 sm:top-3 sm:right-3 z-10 bg-gray-50 hover:bg-gray-100 text-gray-300 hover:text-gray-500 rounded-full p-1 sm:p-1.5 transition-all duration-200 touch-target"
        >
          <X className="w-3 h-3 sm:w-4 sm:h-4" />
        </button>
        
        <div 
          className="cursor-pointer group"
          onClick={handleClick}
        >
          {currentAd.image && (
            <div className="relative overflow-hidden">
              <img 
                src={currentAd.image} 
                alt={currentAd.title}
                className="w-full h-32 sm:h-40 object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
          )}
          
          <div className="p-3 sm:p-5">
            <h3 className="font-semibold text-base sm:text-lg mb-2 text-gray-900 group-hover:text-gray-700 transition-colors duration-300 line-clamp-1">{currentAd.title}</h3>
            <p className="text-gray-500 mb-4 sm:mb-5 leading-relaxed text-sm line-clamp-2">{currentAd.description}</p>
            
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <button className="flex-1 bg-gray-900 hover:bg-gray-800 text-white py-2.5 px-4 rounded-lg sm:rounded-xl transition-all duration-300 font-medium text-sm touch-target">
                اعرف المزيد
              </button>
              <button 
                onClick={(e) => { e.stopPropagation(); handleClose(); }}
                className="px-4 py-2.5 text-gray-400 hover:text-gray-600 transition-colors font-medium text-sm touch-target"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Advertisement Settings Component
export const AdSettings = () => {
  const { adSettings, updateAdSettings, userPreferences, updateUserPreferences } = useAdvertisement()
  const [localSettings, setLocalSettings] = useState(adSettings)
  const [localPreferences, setLocalPreferences] = useState(userPreferences)

  const handleSaveSettings = () => {
    updateAdSettings(localSettings)
    updateUserPreferences(localPreferences)
    toast.success('تم حفظ إعدادات الإعلانات')
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
      <h3 className="text-2xl font-semibold text-gray-900 mb-8 flex items-center">
        <Settings className="w-7 h-7 mr-3 text-indigo-600" />
        إعدادات الإعلانات
      </h3>
      
      <div className="space-y-8">
        {/* General Settings */}
        <div>
          <h4 className="font-medium text-gray-800 mb-4 text-lg">الإعدادات العامة</h4>
          <div className="space-y-4">
            <label className="flex items-center p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer">
              <input
                type="checkbox"
                checked={localPreferences.allowAds}
                onChange={(e) => setLocalPreferences(prev => ({ ...prev, allowAds: e.target.checked }))}
                className="mr-3 w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
              />
              <span className="text-gray-700">السماح بعرض الإعلانات</span>
            </label>
            
            <label className="flex items-center p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer">
              <input
                type="checkbox"
                checked={localSettings.showCloseButton}
                onChange={(e) => setLocalSettings(prev => ({ ...prev, showCloseButton: e.target.checked }))}
                className="mr-3 w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
              />
              <span className="text-gray-700">إظهار زر الإغلاق</span>
            </label>
            
            <label className="flex items-center p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer">
              <input
                type="checkbox"
                checked={localSettings.autoRotate}
                onChange={(e) => setLocalSettings(prev => ({ ...prev, autoRotate: e.target.checked }))}
                className="mr-3 w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
              />
              <span className="text-gray-700">التبديل التلقائي للإعلانات</span>
            </label>
          </div>
        </div>
        
        {/* Frequency Settings */}
        <div>
          <h4 className="font-medium text-gray-800 mb-4 text-lg">تكرار الإعلانات</h4>
          <select
            value={localSettings.frequency}
            onChange={(e) => setLocalSettings(prev => ({ ...prev, frequency: e.target.value }))}
            className="w-full p-4 border border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
          >
            <option value="low">منخفض</option>
            <option value="medium">متوسط</option>
            <option value="high">عالي</option>
          </select>
        </div>
        
        <button
          onClick={handleSaveSettings}
          className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white py-4 px-6 rounded-xl font-medium transition-all duration-300 shadow-sm hover:shadow-md"
        >
          حفظ الإعدادات
        </button>
      </div>
    </div>
  )
}

// Inline Advertisement Component for content integration
const InlineAd = ({ position = 'content', size = 'medium', className = '' }) => {
  const { getFilteredAds, getContextualAds, trackAdImpression, trackAdClick } = useAdvertisement()
  const [isVisible, setIsVisible] = useState(true)
  
  // Use contextual ads for better relevance
  const contextualAds = getContextualAds(position)
  const ads = getFilteredAds(position).length > 0 ? getFilteredAds(position) : contextualAds
  const currentAd = ads[0] // Show first ad for inline format

  useEffect(() => {
    if (currentAd) {
      trackAdImpression(currentAd.id)
    }
  }, [currentAd])

  if (!currentAd || !isVisible) return null

  const handleClick = () => {
    trackAdClick(currentAd.id)
    if (currentAd.link.startsWith('http')) {
      window.open(currentAd.link, '_blank')
    } else {
      window.location.href = currentAd.link
    }
  }

  const handleClose = () => {
    setIsVisible(false)
  }

  const sizeClasses = {
    small: 'p-3',
    medium: 'p-4',
    large: 'p-6'
  }

  const mobileClasses = {
    small: 'p-2',
    medium: 'p-2 sm:p-4',
    large: 'p-3 sm:p-6'
  }

  return (
    <div className={`relative bg-white border border-gray-100 rounded-xl sm:rounded-2xl overflow-hidden group hover:shadow-sm transition-all duration-300 ${mobileClasses[size]} ${className}`}>
      <button
        onClick={handleClose}
        className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 z-10 bg-gray-50 hover:bg-gray-100 text-gray-300 hover:text-gray-500 rounded-full p-1 transition-all duration-200 touch-target"
      >
        <X className="w-3 h-3" />
      </button>
      
      <div 
        className="cursor-pointer flex items-center gap-2 sm:gap-4 hover:bg-gray-50 rounded-lg sm:rounded-xl p-1 sm:p-2 transition-all duration-300 mt-1 sm:mt-2"
        onClick={handleClick}
      >
        {currentAd.image && (
          <div className="relative overflow-hidden rounded-md sm:rounded-lg flex-shrink-0">
            <img 
              src={currentAd.image} 
              alt={currentAd.title}
              className={`object-contain group-hover:scale-102 transition-transform duration-500 ${
                size === 'small' ? 'w-10 h-10 sm:w-12 sm:h-12' : size === 'large' ? 'w-16 h-16 sm:w-20 sm:h-20' : 'w-12 h-12 sm:w-16 sm:h-16'
              }`}
            />
          </div>
        )}
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1 sm:gap-2 mb-0.5 sm:mb-1">
            <h4 className={`font-medium text-gray-900 group-hover:text-gray-700 transition-colors duration-300 line-clamp-1 ${
              size === 'small' ? 'text-xs sm:text-sm' : size === 'large' ? 'text-sm sm:text-lg' : 'text-xs sm:text-base'
            }`}>{currentAd.title}</h4>
          </div>
          <p className={`text-gray-500 line-clamp-1 sm:line-clamp-2 ${
            size === 'small' ? 'text-xs' : size === 'large' ? 'text-xs sm:text-sm' : 'text-xs'
          }`}>{currentAd.description}</p>
        </div>
        
        <div className="flex-shrink-0">
          <div className={`bg-gray-900 hover:bg-gray-800 text-white rounded-md sm:rounded-lg font-medium transition-all duration-300 text-center touch-target ${
            size === 'small' ? 'px-2 py-1 text-xs' : size === 'large' ? 'px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm' : 'px-2 py-1 sm:px-3 sm:py-1.5 text-xs'
          }`}>
            <span className="hidden sm:inline">{size === 'large' ? 'اعرف المزيد' : 'عرض'}</span>
            <span className="sm:hidden">عرض</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export { AdvertisementProvider, useAdvertisement, BannerAd, CardAd, PopupAd, InlineAd }