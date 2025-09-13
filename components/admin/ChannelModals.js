import { useState } from 'react'
import { X, Upload, Image, Tv, Save, AlertCircle, CheckCircle, Star, Globe, Tag, Monitor, Headphones } from 'lucide-react'
import toast from 'react-hot-toast'
import { Button, Input, Select, Textarea, Modal, Card, Badge } from '../ui/unified-components'

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
    console.log(`Field changed: ${field} = ${value}`)
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

  const ModalContent = ({ isEdit = false }) => {
    console.log('ModalContent rendered - isEdit:', isEdit, 'formData:', formData)
    return (
    <div className="max-w-4xl w-full max-h-[90vh] overflow-y-auto">
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
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            if (isEdit) {
              setShowEditModal(false)
            } else {
              setShowAddModal(false)
            }
            resetModal()
          }}
        >
          <X className="w-5 h-5" />
        </Button>
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
                <Input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="أدخل اسم القناة"
                  required
                />
              </div>

              {/* Streaming URL */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  رابط البث *
                </label>
                {console.log('ChannelModals - formData.streaming_url:', formData.streaming_url)}
                <Input
                  type="url"
                  value={formData.streaming_url || ''}
                  onChange={(e) => handleInputChange('streaming_url', e.target.value)}
                  placeholder="https://example.com/stream.m3u8"
                  required
                />
                {/* عرض رابط البث الحالي إذا كان موجوداً */}
                {formData.streaming_url && (
                  <div className="mt-2 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                    <div className="flex items-start space-x-2 space-x-reverse">
                      <CheckCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-1">
                          رابط البث الحالي:
                        </p>
                        <p className="text-sm text-blue-700 dark:text-blue-300 break-all font-mono bg-white dark:bg-gray-800 px-2 py-1 rounded border">
                          {formData.streaming_url}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Description */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  الوصف
                </label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={3}
                  placeholder="وصف مختصر للقناة"
                />
              </div>

              {/* Tags */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  العلامات (مفصولة بفواصل)
                </label>
                <Input
                  type="text"
                  value={formData.tags?.join(', ') || ''}
                  onChange={handleTagsChange}
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
                  <Select
                    value={formData.category}
                    onValueChange={(value) => handleInputChange('category', value)}
                  >
                    <option value="">اختر الفئة</option>
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </Select>
                </div>

                {/* Country */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    البلد
                  </label>
                  <Select
                    value={formData.country}
                    onValueChange={(value) => handleInputChange('country', value)}
                  >
                    <option value="">اختر البلد</option>
                    {countries.map(country => (
                      <option key={country} value={country}>{country}</option>
                    ))}
                  </Select>
                </div>

                {/* Language */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    اللغة
                  </label>
                  <Select
                    value={formData.language}
                    onValueChange={(value) => handleInputChange('language', value)}
                  >
                    <option value="">اختر اللغة</option>
                    {languages.map(language => (
                      <option key={language} value={language}>{language}</option>
                    ))}
                  </Select>
                </div>

                {/* Quality */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    الجودة
                  </label>
                  <Select
                    value={formData.quality}
                    onValueChange={(value) => handleInputChange('quality', value)}
                  >
                    {qualities.map(quality => (
                      <option key={quality} value={quality}>{quality}</option>
                    ))}
                  </Select>
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
                <Input
                  type="url"
                  value={formData.logo_url}
                  onChange={(e) => {
                    handleInputChange('logo_url', e.target.value)
                    setLogoPreview(e.target.value)
                  }}
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
                <Select
                  value={formData.status}
                  onValueChange={(value) => handleInputChange('status', value)}
                >
                  <option value="active">نشط</option>
                  <option value="inactive">غير نشط</option>
                  <option value="maintenance">صيانة</option>
                  <option value="blocked">محظور</option>
                </Select>
              </div>

              {/* Sort Order */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  ترتيب العرض
                </label>
                <Input
                  type="number"
                  value={formData.sort_order}
                  onChange={(e) => handleInputChange('sort_order', parseInt(e.target.value) || 0)}
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
          <Button
            variant="outline"
            onClick={() => {
              if (isEdit) {
                setShowEditModal(false)
              } else {
                setShowAddModal(false)
              }
              resetModal()
            }}
          >
            إلغاء
          </Button>
          <Button
            onClick={isEdit ? handleEditChannel : handleAddChannel}
            disabled={!formData.name || !formData.streaming_url}
          >
            <Save className="w-4 h-4 mr-2" />
            {isEdit ? 'حفظ التغييرات' : 'إضافة القناة'}
          </Button>
        </div>
      </div>
    </div>
  )
  }

  return (
    <>
      {/* Add Channel Modal */}
      <Modal isOpen={showAddModal} onClose={() => { setShowAddModal(false); resetModal(); }}>
        <Card className="p-0">
          <ModalContent isEdit={false} />
        </Card>
      </Modal>

      {/* Edit Channel Modal */}
      <Modal isOpen={showEditModal} onClose={() => { setShowEditModal(false); resetModal(); }}>
        <Card className="p-0">
          <ModalContent isEdit={true} />
        </Card>
      </Modal>
    </>
  )
}

export default ChannelModals