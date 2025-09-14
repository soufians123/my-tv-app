#!/usr/bin/env node

/**
 * اختبار استقرار المصادقة
 * يتحقق من عدم حدوث تسجيل دخول وخروج تلقائي
 */

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ متغيرات البيئة مفقودة')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

let authChangeCount = 0
let lastEvent = null
let lastTimestamp = Date.now()

async function testAuthStability() {
  console.log('🧪 بدء اختبار استقرار المصادقة...')
  console.log('⏱️ سيتم مراقبة تغييرات المصادقة لمدة 30 ثانية\n')
  
  // مراقبة تغييرات المصادقة
  const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
    const now = Date.now()
    const timeDiff = now - lastTimestamp
    
    authChangeCount++
    console.log(`🔄 تغيير ${authChangeCount}: ${event} (بعد ${timeDiff}ms من التغيير السابق)`)
    
    if (session) {
      console.log(`   👤 المستخدم: ${session.user.email}`)
    } else {
      console.log('   ❌ لا يوجد مستخدم')
    }
    
    // تحذير من التغييرات السريعة
    if (timeDiff < 2000 && authChangeCount > 1) {
      console.warn(`   ⚠️ تغيير سريع! (${timeDiff}ms فقط من التغيير السابق)`)
    }
    
    // تحذير من التذبذب
    if (lastEvent === event && timeDiff < 5000) {
      console.warn(`   🔄 تذبذب محتمل! نفس الحدث (${event}) تكرر خلال ${timeDiff}ms`)
    }
    
    lastEvent = event
    lastTimestamp = now
  })
  
  // انتظار 30 ثانية
  await new Promise(resolve => setTimeout(resolve, 30000))
  
  // تنظيف
  subscription.unsubscribe()
  
  console.log('\n📊 نتائج الاختبار:')
  console.log(`   📈 إجمالي التغييرات: ${authChangeCount}`)
  
  if (authChangeCount === 0) {
    console.log('   ✅ ممتاز! لا توجد تغييرات غير ضرورية')
  } else if (authChangeCount <= 2) {
    console.log('   ✅ جيد! عدد قليل من التغييرات (طبيعي)')
  } else if (authChangeCount <= 5) {
    console.log('   ⚠️ متوسط! عدد متوسط من التغييرات')
  } else {
    console.log('   ❌ مشكلة! عدد كبير من التغييرات - يشير إلى عدم استقرار')
  }
  
  console.log('\n✅ اكتمل اختبار الاستقرار!')
  process.exit(0)
}

// تشغيل الاختبار
testAuthStability().catch(error => {
  console.error('❌ خطأ في الاختبار:', error.message)
  process.exit(1)
})