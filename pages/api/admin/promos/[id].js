import { createPagesServerClient } from '@supabase/auth-helpers-nextjs'
import { createClient } from '@supabase/supabase-js'

const ensureAdmin = async (supabase) => {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false, status: 401, message: 'غير مصرح: لم يتم العثور على المستخدم' }
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle()
  if (error) return { ok: false, status: 500, message: error.message }
  if (!profile || String(profile.role || '').toLowerCase() !== 'admin') {
    return { ok: false, status: 403, message: 'غير مصرح: يتطلب صلاحية مدير' }
  }
  return { ok: true, user }
}

const getSupabaseServerClient = (req, res) => {
  const authHeader = req.headers['authorization'] || req.headers['Authorization']
  if (authHeader) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    return createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    })
  }
  return createPagesServerClient({ req, res })
}

export default async function handler(req, res) {
  const supabase = getSupabaseServerClient(req, res)

  const guard = await ensureAdmin(supabase)
  if (!guard.ok) return res.status(guard.status).json({ error: guard.message })

  const { id } = req.query

  if (req.method === 'GET') {
    const { data, error } = await supabase
      .from('advertisements')
      .select('*')
      .eq('id', id)
      .maybeSingle()

    if (error) return res.status(400).json({ error: error.message })
    if (!data) return res.status(404).json({ error: 'غير موجود' })
    return res.status(200).json(data)
  }

  if (req.method === 'PATCH') {
    try {
      const updates = req.body || {}
      updates.updated_at = new Date().toISOString()
      const { data, error } = await supabase
        .from('advertisements')
        .update(updates)
        .eq('id', id)
        .select()
        .maybeSingle()
      if (error) return res.status(400).json({ error: error.message })
      return res.status(200).json(data)
    } catch (e) {
      return res.status(500).json({ error: e.message })
    }
  }

  if (req.method === 'DELETE') {
    const { error } = await supabase
      .from('advertisements')
      .delete()
      .eq('id', id)
    if (error) return res.status(400).json({ error: error.message })
    return res.status(204).end()
  }

  res.setHeader('Allow', ['GET', 'PATCH', 'DELETE'])
  return res.status(405).json({ error: 'Method Not Allowed' })
}