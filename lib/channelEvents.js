// نظام الأحداث للتحديث الفوري للقنوات

// أنواع الأحداث
export const CHANNEL_EVENTS = {
  ADDED: 'channel_added',
  UPDATED: 'channel_updated',
  DELETED: 'channel_deleted',
  STATUS_CHANGED: 'channel_status_changed'
}

// إرسال حدث تحديث القنوات
export const emitChannelEvent = (eventType, channelData = null) => {
  const event = {
    type: eventType,
    data: channelData,
    timestamp: Date.now()
  }
  
  // إرسال الحدث عبر CustomEvent للتحديث الفوري في نفس الصفحة
  if (typeof window !== 'undefined') {
    const customEvent = new CustomEvent('channelUpdate', {
      detail: event
    })
    window.dispatchEvent(customEvent)
  }
  
  // إرسال الحدث عبر localStorage للتحديث بين التبويبات
  if (typeof window !== 'undefined') {
    localStorage.setItem('channel_event', JSON.stringify(event))
    
    // إزالة الحدث بعد فترة قصيرة لتجنب التراكم
    setTimeout(() => {
      localStorage.removeItem('channel_event')
    }, 100)
  }
}

// الاستماع لأحداث تحديث القنوات
export const listenToChannelEvents = (callback) => {
  if (typeof window === 'undefined') return () => {}
  
  // معالج الأحداث المخصصة (للتحديث الفوري في نفس الصفحة)
  const handleCustomEvent = (e) => {
    try {
      callback(e.detail)
    } catch (error) {
      console.error('خطأ في معالجة حدث القناة المخصص:', error)
    }
  }
  
  // معالج أحداث localStorage (للتحديث بين التبويبات)
  const handleStorageChange = (e) => {
    if (e.key === 'channel_event' && e.newValue) {
      try {
        const event = JSON.parse(e.newValue)
        callback(event)
      } catch (error) {
        console.error('خطأ في معالجة حدث القناة من localStorage:', error)
      }
    }
  }
  
  // إضافة المستمعين
  window.addEventListener('channelUpdate', handleCustomEvent)
  window.addEventListener('storage', handleStorageChange)
  
  // إرجاع دالة لإلغاء الاستماع
  return () => {
    window.removeEventListener('channelUpdate', handleCustomEvent)
    window.removeEventListener('storage', handleStorageChange)
  }
}

// Hook مخصص للاستماع لأحداث القنوات في React
export const useChannelEvents = (onChannelEvent) => {
  const { useEffect } = require('react')
  
  useEffect(() => {
    if (typeof window === 'undefined') return // تجنب الأخطاء في SSR
    
    const unsubscribe = listenToChannelEvents(onChannelEvent)
    return unsubscribe
  }, [onChannelEvent])
}