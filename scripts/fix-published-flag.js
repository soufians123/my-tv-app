const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('❌ مفقود NEXT_PUBLIC_SUPABASE_URL أو SUPABASE_SERVICE_ROLE_KEY في .env.local')
  process.exit(1)
}

const admin = createClient(SUPABASE_URL, SERVICE_KEY)

async function fix() {
  try {
    console.log('🔧 ضبط is_published=true للمقالات التي حالتها published...')

    const { data: beforeData, error: countErr } = await admin
      .from('articles')
      .select('id, status, is_published, published_at')
      .eq('status', 'published')

    if (countErr) throw countErr

    const pending = (beforeData || []).filter(a => !a.is_published)
    console.log(`📝 مقالات منشورة ولكن is_published=false: ${pending.length}`)

    const { data, error } = await admin
      .from('articles')
      .update({ is_published: true, published_at: new Date().toISOString() })
      .eq('status', 'published')
      .or('is_published.is.null,is_published.eq.false')
      .select('id')

    if (error) throw error

    console.log(`✅ تم تحديث ${data ? data.length : 0} مقالاً.`)

    const { data: verify, error: vErr } = await admin
      .from('articles')
      .select('id')
      .eq('status', 'published')
      .eq('is_published', true)
      .limit(3)

    if (vErr) throw vErr

    console.log('🔎 تحقق سريع (أول 3 معرفات):', verify?.map(v => v.id) || [])
    console.log('🎉 تم الإصلاح بنجاح')
  } catch (e) {
    console.error('❌ فشل الإصلاح:', e.message || e)
    process.exit(1)
  }
}

fix()