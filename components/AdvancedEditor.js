import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import {
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  List,
  ListOrdered,
  Link,
  Image,
  Table,
  Code,
  Quote,
  Undo,
  Redo,
  Eye,
  EyeOff,
  Type,
  Palette,
  Upload,
  Video,
  FileText
} from 'lucide-react'

// تحسين الأداء - debounce function
const useDebounce = (callback, delay) => {
  const timeoutRef = useRef(null);
  
  return useCallback((...args) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => callback(...args), delay);
  }, [callback, delay]);
};

const AdvancedEditor = ({ value = '', onChange, placeholder = 'ابدأ الكتابة...' }) => {
  const [content, setContent] = useState(value)
  const [isHtmlMode, setIsHtmlMode] = useState(false)
  const [showColorPicker, setShowColorPicker] = useState(false)
  const [showFontSizePicker, setShowFontSizePicker] = useState(false)
  const [selectedColor, setSelectedColor] = useState('#000000')
  const [selectedFontSize, setSelectedFontSize] = useState('16')
  const editorRef = useRef(null)
  const fileInputRef = useRef(null)
  const videoInputRef = useRef(null)

  // تحديث المحتوى عند تغيير القيمة الخارجية
  useEffect(() => {
    if (value !== content) {
      setContent(value)
      if (editorRef.current && !isHtmlMode) {
        editorRef.current.innerHTML = value
      }
    }
  }, [value])

  // تحسين الأداء - debounced onChange
  const debouncedOnChange = useDebounce(onChange, 300);

  // معالجة تغيير المحتوى مع تحسين الأداء
  const handleContentChange = useCallback(() => {
    if (editorRef.current) {
      const newContent = editorRef.current.innerHTML
      setContent(newContent)
      debouncedOnChange && debouncedOnChange(newContent)
    }
  }, [debouncedOnChange]);

  // تنفيذ أوامر التنسيق - محسن للأداء
  const executeCommand = useCallback((command, value = null) => {
    document.execCommand(command, false, value)
    editorRef.current?.focus()
    handleContentChange()
  }, [handleContentChange]);

  // إدراج HTML مخصص
  const insertHTML = (html) => {
    if (editorRef.current) {
      const selection = window.getSelection()
      if (selection.rangeCount > 0) {
        const range = selection.getRangeAt(0)
        range.deleteContents()
        const div = document.createElement('div')
        div.innerHTML = html
        const fragment = document.createDocumentFragment()
        while (div.firstChild) {
          fragment.appendChild(div.firstChild)
        }
        range.insertNode(fragment)
        selection.removeAllRanges()
      }
      handleContentChange()
    }
  }

  // إدراج صورة - محسن للأداء
  const insertImage = useCallback(() => {
    const url = prompt('أدخل رابط الصورة:')
    if (url) {
      const html = `<img src="${url}" alt="صورة" style="max-width: 100%; height: auto; margin: 10px 0;" />`
      insertHTML(html)
    }
  }, [insertHTML]);

  // رفع صورة
  const handleImageUpload = (event) => {
    const file = event.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const html = `<img src="${e.target.result}" alt="صورة مرفوعة" style="max-width: 100%; height: auto; margin: 10px 0;" />`
        insertHTML(html)
      }
      reader.readAsDataURL(file)
    }
  }

  // إدراج فيديو - محسن للأداء
  const insertVideo = useCallback(() => {
    const url = prompt('أدخل رابط الفيديو (YouTube, Vimeo, أو رابط مباشر):')
    if (url) {
      let html = ''
      if (url.includes('youtube.com') || url.includes('youtu.be')) {
        const videoId = url.includes('youtu.be') 
          ? url.split('/').pop().split('?')[0]
          : url.split('v=')[1]?.split('&')[0]
        if (videoId) {
          html = `<div style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; margin: 20px 0;">
            <iframe src="https://www.youtube.com/embed/${videoId}" 
              style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;" 
              frameborder="0" allowfullscreen></iframe>
          </div>`
        }
      } else if (url.includes('vimeo.com')) {
        const videoId = url.split('/').pop()
        html = `<div style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; margin: 20px 0;">
          <iframe src="https://player.vimeo.com/video/${videoId}" 
            style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;" 
            frameborder="0" allowfullscreen></iframe>
        </div>`
      } else {
        html = `<video controls style="max-width: 100%; height: auto; margin: 20px 0;">
          <source src="${url}" type="video/mp4">
          متصفحك لا يدعم تشغيل الفيديو.
        </video>`
      }
      if (html) insertHTML(html)
    }
  }, [insertHTML]);

  // إدراج رابط - محسن للأداء
  const insertLink = useCallback(() => {
    const url = prompt('أدخل الرابط:')
    if (url) {
      const text = prompt('أدخل نص الرابط:') || url
      executeCommand('createLink', url)
    }
  }, [executeCommand]);

  // إدراج جدول - محسن للأداء
  const insertTable = useCallback(() => {
    const rows = prompt('عدد الصفوف:') || '3'
    const cols = prompt('عدد الأعمدة:') || '3'
    
    let tableHTML = '<table style="border-collapse: collapse; width: 100%; margin: 20px 0; border: 1px solid #ddd;">'
    
    for (let i = 0; i < parseInt(rows); i++) {
      tableHTML += '<tr>'
      for (let j = 0; j < parseInt(cols); j++) {
        const cellStyle = 'border: 1px solid #ddd; padding: 8px; text-align: right;'
        if (i === 0) {
          tableHTML += `<th style="${cellStyle} background-color: #f5f5f5; font-weight: bold;">عنوان ${j + 1}</th>`
        } else {
          tableHTML += `<td style="${cellStyle}">خلية ${i}-${j + 1}</td>`
        }
      }
      tableHTML += '</tr>'
    }
    
    tableHTML += '</table>'
    insertHTML(tableHTML)
  }, [insertHTML]);

  // تبديل وضع HTML - محسن للأداء
  const toggleHtmlMode = useCallback(() => {
    if (isHtmlMode) {
      // العودة إلى الوضع المرئي
      if (editorRef.current) {
        editorRef.current.innerHTML = content
      }
    } else {
      // التبديل إلى وضع HTML
      if (editorRef.current) {
        setContent(editorRef.current.innerHTML)
      }
    }
    setIsHtmlMode(!isHtmlMode)
  }, [isHtmlMode, content]);

  // معالجة تغيير النص في وضع HTML مع تحسين الأداء
  const handleHtmlChange = useCallback((e) => {
    const newContent = e.target.value
    setContent(newContent)
    debouncedOnChange && debouncedOnChange(newContent)
  }, [debouncedOnChange]);

  // ألوان محددة مسبقاً - محسنة للأداء
  const predefinedColors = useMemo(() => [
    '#000000', '#333333', '#666666', '#999999', '#CCCCCC', '#FFFFFF',
    '#FF0000', '#FF6600', '#FFCC00', '#00FF00', '#0066FF', '#6600FF',
    '#FF3366', '#FF9933', '#FFFF33', '#33FF33', '#3366FF', '#9933FF',
    '#E74C3C', '#F39C12', '#F1C40F', '#27AE60', '#3498DB', '#9B59B6',
    '#1ABC9C', '#34495E', '#95A5A6', '#D35400', '#8E44AD', '#2ECC71'
  ], []);

  // أحجام الخط
  const fontSizes = ['12', '14', '16', '18', '20', '24', '28', '32', '36', '48']

  return (
    <div className="border-2 border-gray-200 rounded-xl overflow-hidden bg-white shadow-lg">
      {/* شريط الأدوات */}
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 border-b-2 border-gray-200 p-4">
        <div className="flex flex-wrap items-center gap-3">
          {/* أدوات التنسيق الأساسية */}
          <div className="flex items-center gap-2 border-l border-gray-300 pl-3">
            <button
              type="button"
              onClick={() => executeCommand('bold')}
              className="p-2 hover:bg-blue-100 hover:shadow-md rounded-lg transition-all duration-200 bg-white text-gray-700"
              title="عريض"
            >
              <Bold className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => executeCommand('italic')}
              className="p-2 hover:bg-blue-100 hover:shadow-md rounded-lg transition-all duration-200 bg-white text-gray-700"
              title="مائل"
            >
              <Italic className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => executeCommand('underline')}
              className="p-2 hover:bg-blue-100 hover:shadow-md rounded-lg transition-all duration-200 bg-white text-gray-700"
              title="تحته خط"
            >
              <Underline className="w-4 h-4" />
            </button>
          </div>

          {/* أحجام الخط */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowFontSizePicker(!showFontSizePicker)}
              className="p-2 hover:bg-gray-200 rounded transition-colors flex items-center gap-1"
              title="حجم الخط"
            >
              <Type className="w-4 h-4" />
              <span className="text-xs">{selectedFontSize}</span>
            </button>
            {showFontSizePicker && (
              <div className="absolute top-full left-0 mt-1 bg-white border border-gray-300 rounded shadow-lg z-10">
                <div className="grid grid-cols-5 gap-1 p-2">
                  {fontSizes.map(size => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => {
                        executeCommand('fontSize', size)
                        setSelectedFontSize(size)
                        setShowFontSizePicker(false)
                      }}
                      className="px-2 py-1 text-xs hover:bg-gray-100 rounded"
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* أدوات الألوان */}
          <div className="flex items-center gap-2 border-l border-gray-300 pl-3">
            <div className="flex flex-col items-center">
              <input
                type="color"
                onChange={(e) => executeCommand('foreColor', e.target.value)}
                className="w-10 h-8 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-blue-300 transition-all duration-200"
                title="لون النص"
              />
              <span className="text-xs text-gray-500 mt-1">نص</span>
            </div>
            <div className="flex flex-col items-center">
              <input
                type="color"
                onChange={(e) => executeCommand('hiliteColor', e.target.value)}
                className="w-10 h-8 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-blue-300 transition-all duration-200"
                title="لون الخلفية"
              />
              <span className="text-xs text-gray-500 mt-1">خلفية</span>
            </div>
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowColorPicker(!showColorPicker)}
                className="p-2 hover:bg-blue-100 hover:shadow-md rounded-lg transition-all duration-200 bg-white text-gray-700"
                title="ألوان محددة مسبقاً"
              >
                <Palette className="w-4 h-4" />
              </button>
              {showColorPicker && (
                <div className="absolute top-full left-0 mt-1 bg-white border-2 border-gray-200 rounded-xl shadow-xl z-10">
                  <div className="p-3">
                    <div className="text-xs text-gray-600 mb-2 font-medium">ألوان محددة مسبقاً</div>
                    <div className="grid grid-cols-6 gap-2">
                      {predefinedColors.map(color => (
                        <button
                          key={color}
                          type="button"
                          onClick={() => {
                            executeCommand('foreColor', color)
                            setSelectedColor(color)
                            setShowColorPicker(false)
                          }}
                          className="w-8 h-8 rounded-lg border-2 border-gray-200 hover:scale-110 hover:border-blue-300 transition-all duration-200 shadow-sm"
                          style={{ backgroundColor: color }}
                          title={color}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* محاذاة النص */}
          <div className="flex items-center gap-1 border-l border-gray-300 pl-2">
            <button
              type="button"
              onClick={() => executeCommand('justifyRight')}
              className="p-2 hover:bg-gray-200 rounded transition-colors"
              title="محاذاة يمين"
            >
              <AlignRight className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => executeCommand('justifyCenter')}
              className="p-2 hover:bg-gray-200 rounded transition-colors"
              title="محاذاة وسط"
            >
              <AlignCenter className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => executeCommand('justifyLeft')}
              className="p-2 hover:bg-gray-200 rounded transition-colors"
              title="محاذاة يسار"
            >
              <AlignLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => executeCommand('justifyFull')}
              className="p-2 hover:bg-gray-200 rounded transition-colors"
              title="ضبط"
            >
              <AlignJustify className="w-4 h-4" />
            </button>
          </div>

          {/* القوائم */}
          <div className="flex items-center gap-1 border-l border-gray-300 pl-2">
            <button
              type="button"
              onClick={() => executeCommand('insertUnorderedList')}
              className="p-2 hover:bg-gray-200 rounded transition-colors"
              title="قائمة نقطية"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => executeCommand('insertOrderedList')}
              className="p-2 hover:bg-gray-200 rounded transition-colors"
              title="قائمة مرقمة"
            >
              <ListOrdered className="w-4 h-4" />
            </button>
          </div>

          {/* العناوين */}
          <div className="flex items-center gap-2 border-l border-gray-300 pl-3">
            <select
              onChange={(e) => {
                if (e.target.value) {
                  executeCommand('formatBlock', e.target.value)
                  e.target.value = ''
                }
              }}
              className="px-4 py-2 border-2 border-gray-200 rounded-lg text-sm bg-white hover:border-blue-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
              defaultValue=""
            >
              <option value="">العناوين</option>
              <option value="h1">عنوان 1</option>
              <option value="h2">عنوان 2</option>
              <option value="h3">عنوان 3</option>
              <option value="h4">عنوان 4</option>
              <option value="h5">عنوان 5</option>
              <option value="h6">عنوان 6</option>
              <option value="p">فقرة عادية</option>
            </select>
          </div>

          {/* الوسائط والروابط */}
          <div className="flex items-center gap-2 border-l border-gray-300 pl-3">
            <button
              type="button"
              onClick={insertLink}
              className="p-2 hover:bg-blue-100 hover:shadow-md rounded-lg transition-all duration-200 bg-white text-gray-700 hover:text-blue-600"
              title="إدراج رابط"
            >
              <Link className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={insertImage}
              className="p-2 hover:bg-green-100 hover:shadow-md rounded-lg transition-all duration-200 bg-white text-gray-700 hover:text-green-600"
              title="إدراج صورة من رابط"
            >
              <Image className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-2 hover:bg-green-100 hover:shadow-md rounded-lg transition-all duration-200 bg-white text-gray-700 hover:text-green-600"
              title="رفع صورة"
            >
              <Upload className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={insertVideo}
              className="p-2 hover:bg-purple-100 hover:shadow-md rounded-lg transition-all duration-200 bg-white text-gray-700 hover:text-purple-600"
              title="إدراج فيديو"
            >
              <Video className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={insertTable}
              className="p-2 hover:bg-orange-100 hover:shadow-md rounded-lg transition-all duration-200 bg-white text-gray-700 hover:text-orange-600"
              title="إدراج جدول"
            >
              <Table className="w-4 h-4" />
            </button>
          </div>

          {/* أدوات إضافية */}
          <div className="flex items-center gap-1 border-l border-gray-300 pl-2">
            <button
              type="button"
              onClick={() => executeCommand('insertHorizontalRule')}
              className="p-2 hover:bg-gray-200 rounded transition-colors text-xs"
              title="خط فاصل"
            >
              ___
            </button>
            <button
              type="button"
              onClick={() => executeCommand('formatBlock', 'blockquote')}
              className="p-2 hover:bg-gray-200 rounded transition-colors"
              title="اقتباس"
            >
              <Quote className="w-4 h-4" />
            </button>
          </div>

          {/* التراجع والإعادة */}
          <div className="flex items-center gap-1 border-l border-gray-300 pl-2">
            <button
              type="button"
              onClick={() => executeCommand('undo')}
              className="p-2 hover:bg-gray-200 rounded transition-colors"
              title="تراجع"
            >
              <Undo className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => executeCommand('redo')}
              className="p-2 hover:bg-gray-200 rounded transition-colors"
              title="إعادة"
            >
              <Redo className="w-4 h-4" />
            </button>
          </div>

          {/* تبديل وضع HTML */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={toggleHtmlMode}
              className={`px-4 py-2 text-sm rounded-lg font-medium transition-all duration-200 shadow-sm flex items-center gap-2 ${
                isHtmlMode 
                  ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md hover:from-blue-600 hover:to-blue-700' 
                  : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-blue-300 hover:bg-blue-50'
              }`}
              title={isHtmlMode ? 'الوضع المرئي' : 'وضع HTML'}
            >
              {isHtmlMode ? (
                <>
                  <Eye className="w-4 h-4" />
                  <span>🔍 معاينة</span>
                </>
              ) : (
                <>
                  <Code className="w-4 h-4" />
                  <span>📝 HTML</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* منطقة التحرير */}
      <div className="relative bg-white">
        {isHtmlMode ? (
          <div className="relative">
            <textarea
              value={content}
              onChange={handleHtmlChange}
              className="w-full h-96 p-6 font-mono text-sm border-0 resize-none focus:outline-none bg-gray-50 text-gray-800 leading-relaxed"
              placeholder="اكتب كود HTML هنا... يمكنك استخدام جميع عناصر HTML المدعومة"
              style={{ fontFamily: 'Consolas, Monaco, "Courier New", monospace' }}
              dir="ltr"
            />
            <div className="absolute top-2 right-2 text-xs text-gray-400 bg-white px-2 py-1 rounded shadow-sm">
              وضع HTML
            </div>
          </div>
        ) : (
          <div className="relative">
            <div
              ref={editorRef}
              contentEditable
              onInput={handleContentChange}
              onPaste={handleContentChange}
              className="w-full min-h-96 p-6 focus:outline-none text-gray-800 leading-relaxed"
              style={{ 
                minHeight: '384px',
                lineHeight: '1.6',
                fontSize: '16px',
                direction: 'rtl',
                textAlign: 'right'
              }}
              dangerouslySetInnerHTML={{ __html: content }}
              suppressContentEditableWarning={true}
            />
            <div className="absolute top-2 right-2 text-xs text-gray-400 bg-white px-2 py-1 rounded shadow-sm">
              الوضع المرئي
            </div>
            {/* Placeholder */}
            {!content && (
              <div className="absolute top-6 right-6 text-gray-400 pointer-events-none">
                {placeholder}
              </div>
            )}
          </div>
        )}
      </div>

      {/* مدخلات مخفية للملفات */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        className="hidden"
      />
      <input
        ref={videoInputRef}
        type="file"
        accept="video/*"
        onChange={(e) => {
          const file = e.target.files[0]
          if (file) {
            const reader = new FileReader()
            reader.onload = (e) => {
              const html = `<video controls style="max-width: 100%; height: auto; margin: 20px 0;">
                <source src="${e.target.result}" type="${file.type}">
                متصفحك لا يدعم تشغيل الفيديو.
              </video>`
              insertHTML(html)
            }
            reader.readAsDataURL(file)
          }
        }}
        className="hidden"
      />
    </div>
  )
}

export default AdvancedEditor