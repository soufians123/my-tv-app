import { createClient } from '@supabase/supabase-js'
import { createPagesServerClient } from '@supabase/auth-helpers-nextjs'

export default async function handler(req, res) {
  if (req.method !== 'PUT') return res.status(405).json({ message: 'Method not allowed' })

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!supabaseUrl || !anonKey) {
    return res.status(500).json({ message: 'Supabase env vars missing' })
  }

  // Use server client tied to request cookies to read auth user
  const supabase = createPagesServerClient({ req, res })

  // Ensure admin user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return res.status(401).json({ message: 'غير مصرح: تسجيل الدخول مطلوب' })
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle()
  if (profileError) return res.status(500).json({ message: profileError.message })
  if (!profile || String(profile.role || '').toLowerCase() !== 'admin') {
    return res.status(403).json({ message: 'غير مصرح: صلاحيات المدير مطلوبة' })
  }

  const key = req.query.key
  const { value, type = 'json', is_public = false, description = '' } = req.body || {}

  // Upsert into settings table using service role if available (bypass RLS)
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  const writeClient = serviceKey ? createClient(supabaseUrl, serviceKey) : createClient(supabaseUrl, anonKey)

  const serialized = type === 'json' ? JSON.stringify(value ?? null) : String(value ?? '')
  const { error } = await writeClient
    .from('settings')
    .upsert({ key, value: serialized, type, is_public, description }, { onConflict: 'key' })

  if (error) return res.status(500).json({ message: error.message })
  return res.status(200).json({ ok: true })
}