import { useState } from 'react'
import { X, Upload, Image, Tv, Save, AlertCircle, CheckCircle, Star, Globe, Tag, Monitor, Headphones } from 'lucide-react'
import toast from 'react-hot-toast'

const ChannelModals = ({ 
  showAddModal, 
  setShowAddModal, 
  showEditModal, 
  setShowEditModal, 
  formData, 
  setFormData, 
  handleAddChannel, 
  handleEditChannel, 
  editingChannel, 
  categories, 
  countries, 
  languages, 
  qualities, 
  statuses 
}) => {
  const [logoPreview, setLogoPreview] = useState('')
  const [dragActive, setDragActive] = useState(false)
  const [uploading, setUploading] = useState(false)

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleTagsChange = (e) => {
    const tags = e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag)
    setFormData(prev => ({ ...prev, tags }))
  }

  const handleImageUpload = async (file) => {
    if (!file) return
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('يرجى اختيار ملف صورة صحيح')
      return
    }
    
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('حجم الصورة يجب أن يكون أقل من 5 ميجابايت')
      return
    }
    
    setUploading(true)
    
    try {
      // Create preview
      const reader = new FileReader()
      reader.onload = (e) => {
        setLogoPreview(e.target.result)
        setFormData(prev => ({ ...prev, logo_url: e.target.result }))
      }
      reader.readAsDataURL(file)
      
      toast.success('تم رفع الصورة بنجاح')
    } catch (error) {
      console.error('خطأ في رفع الصورة:', error)
      toast.error('حدث خطأ في رفع الصورة')
    } finally {
      setUploading(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragActive(false)
    
    const files = e.dataTransfer.files
    if (files && files[0]) {
      handleImageUpload(files[0])
    }
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    setDragActive(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    setDragActive(false)
  }

  const resetModal = () => {
    setLogoPreview('')
    setDragActive(false)
    setUploading(false)
  }

  const ModalContent = ({ isEdit = false }) => (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center">
          <div className="p-2 bg-primary-100 dark:bg-primary-900 rounded-lg mr-3">
            <Tv className="w-6 h-6 text-primary-600 dark:text-primary-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              {isEdit ? 'تعديل القناة' : 'إضافة قناة جديدة'}
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {isEdit ? 'تحديث معلومات القناة' : 'إضافة قناة جديدة إلى النظام'}
            </p>
          </div>
        </div>
        <button
          onClick={() => {
            if (isEdit) {
              setShowEditModal(false)
            } else {
              setShowAddModal(false)
            }
            resetModal()
          }}
          className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Form Content */}
      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Basic Info */}
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <Tag className="w-5 h-5 mr-2 text-primary-600" />
                المعلومات الأساسية
              </h3>
              
              {/* Channel Name */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  اسم القناة *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="أدخل اسم القناة"
                  required
                />
              </div>

              {/* Streaming URL */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  رابط البث *
                </label>
                <input
                  type="url"
                  value={formData.streaming_url}
                  onChange={(e) => handleInputChange('streaming_url', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="https://example.com/stream.m3u8"
                  required
                />
              </div>

              {/* Description */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  الوصف
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
                  placeholder="وصف مختصر للقناة"
                />
              </div>

              {/* Tags */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  العلامات (مفصولة بفواصل)
                </label>
                <input
                  type="text"
                  value={formData.tags?.join(', ') || ''}
                  onChange={handleTagsChange}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="رياضة, أخبار, ترفيه"
                />
              </div>
            </div>

            {/* Categories and Location */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <Globe className="w-5 h-5 mr-2 text-primary-600" />
                التصنيف والموقع
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Category */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    الفئة
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => handleInputChange('category', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="">اختر الفئة</option>
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>

                {/* Country */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    البلد
                  </label>
                  <select
                    value={formData.country}
                    onChange={(e) => handleInputChange('country', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="">اختر البلد</option>
                    {countries.map(country => (
                      <option key={country} value={country}>{country}</option>
                    ))}
                  </select>
                </div>

                {/* Language */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    اللغة
                  </label>
                  <select
                    value={formData.language}
                    onChange={(e) => handleInputChange('language', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="">اختر اللغة</option>
                    {languages.map(language => (
                      <option key={language} value={language}>{language}</option>
                    ))}
                  </select>
                </div>

                {/* Quality */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    الجودة
                  </label>
                  <select
                    value={formData.quality}
                    onChange={(e) => handleInputChange('quality', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    {qualities.map(quality => (
                      <option key={quality} value={quality}>{quality}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Logo and Settings */}
          <div className="space-y-6">
            {/* Logo Upload */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <Image className="w-5 h-5 mr-2 text-primary-600" />
                شعار القناة
              </h3>
              
              {/* Logo URL Input */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  رابط الشعار
                </label>
                <input
                  type="url"
                  value={formData.logo_url}
                  onChange={(e) => {
                    handleInputChange('logo_url', e.target.value)
                    setLogoPreview(e.target.value)
                  }}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="https://example.com/logo.png"
                />
              </div>

              {/* Drag and Drop Upload */}
              <div
                className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                  dragActive 
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' 
                    : 'border-gray-300 dark:border-gray-600 hover:border-primary-400'
                }`}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
              >
                {uploading ? (
                  <div className="flex flex-col items-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mb-2"></div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">جاري الرفع...</p>
                  </div>
                ) : (
                  <>
                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      اسحب وأفلت الصورة هنا أو
                    </p>
                    <label className="cursor-pointer">
                      <span className="text-primary-600 hover:text-primary-700 font-medium">
                        اختر ملف
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => e.target.files[0] && handleImageUpload(e.target.files[0])}
                        className="hidden"
                      />
                    </label>
                    <p className="text-xs text-gray-500 mt-1">
                      PNG, JPG, GIF حتى 5MB
                    </p>
                  </>
                )}
              </div>

              {/* Logo Preview */}
              {(logoPreview || formData.logo_url) && (
                <div className="mt-4">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">معاينة الشعار:</p>
                  <div className="relative w-32 h-32 mx-auto bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
                    <img
                      src={logoPreview || formData.logo_url}
                      alt="Logo Preview"
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                      crossOrigin="anonymous"
                      onError={(e) => {
                        console.log('Logo preview failed to load (ORB/CORS):', logoPreview || formData.logo_url)
                        e.target.style.display = 'none'
                        // إضافة رسالة بديلة
                        const parent = e.target.parentElement
                        if (parent && !parent.querySelector('.logo-error-message')) {
                          const errorDiv = document.createElement('div')
                          errorDiv.className = 'logo-error-message flex items-center justify-center w-full h-full bg-gray-200 dark:bg-gray-600 text-gray-500 dark:text-gray-400 text-sm'
                          errorDiv.innerHTML = '<div class="text-center"><div class="text-2xl mb-1">📷</div><div>فشل تحميل الصورة</div></div>'
                          parent.appendChild(errorDiv)
                        }
                      }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Settings */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <Monitor className="w-5 h-5 mr-2 text-primary-600" />
                الإعدادات
              </h3>
              
              {/* Status */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  الحالة
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => handleInputChange('status', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="active">نشط</option>
                  <option value="inactive">غير نشط</option>
                  <option value="maintenance">صيانة</option>
                  <option value="blocked">محظور</option>
                </select>
              </div>

              {/* Sort Order */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  ترتيب العرض
                </label>
                <input
                  type="number"
                  value={formData.sort_order}
                  onChange={(e) => handleInputChange('sort_order', parseInt(e.target.value) || 0)}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="0"
                  min="0"
                />
              </div>

              {/* Premium Channel */}
              <div className="mb-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.is_premium}
                    onChange={(e) => handleInputChange('is_premium', e.target.checked)}
                    className="w-4 h-4 text-primary-600 bg-white border-gray-300 rounded focus:ring-primary-500 mr-3"
                  />
                  <div className="flex items-center">
                    <Star className="w-4 h-4 text-yellow-500 mr-1" />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      قناة مميزة
                    </span>
                  </div>
                </label>
                <p className="text-xs text-gray-500 mt-1 mr-7">
                  القنوات المميزة تظهر في المقدمة وتحتاج اشتراك
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
        <div className="flex items-center text-sm text-gray-500">
          <AlertCircle className="w-4 h-4 mr-1" />
          الحقول المطلوبة مميزة بـ *
        </div>
        <div className="flex items-center space-x-3 space-x-reverse">
          <button
            onClick={() => {
              if (isEdit) {
                setShowEditModal(false)
              } else {
                setShowAddModal(false)
              }
              resetModal()
            }}
            className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            إلغاء
          </button>
          <button
            onClick={isEdit ? handleEditChannel : handleAddChannel}
            disabled={!formData.name || !formData.streaming_url}
            className="flex items-center px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Save className="w-4 h-4 mr-2" />
            {isEdit ? 'حفظ التغييرات' : 'إضافة القناة'}
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <>
      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <ModalContent isEdit={false} />
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <ModalContent isEdit={true} />
        </div>
      )}
    </>
  )
}

export default ChannelModals