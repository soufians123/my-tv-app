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

  if (req.method === 'GET') {
    const guard = await ensureAdmin(supabase)
    if (!guard.ok) return res.status(guard.status).json({ error: guard.message })

    try {
      const { status, type, position, search, sortBy = 'created_at', sortOrder = 'desc', limit } = req.query

      let query = supabase.from('advertisements').select('*')

      if (typeof status !== 'undefined' && status !== 'all') {
        if (status === 'active' || status === 'true') query = query.eq('is_active', true)
        else if (status === 'paused' || status === 'false') query = query.eq('is_active', false)
      }
      if (type) query = query.eq('ad_type', type)
      if (position) query = query.eq('position', position)
      if (search) query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`)

      query = query.order(sortBy, { ascending: String(sortOrder).toLowerCase() === 'asc' })
      if (limit) query = query.limit(Number(limit))

      const { data, error } = await query
      if (error) return res.status(400).json({ error: error.message })
      return res.status(200).json(data || [])
    } catch (e) {
      return res.status(500).json({ error: e.message })
    }
  }

  if (req.method === 'POST') {
    const guard = await ensureAdmin(supabase)
    if (!guard.ok) return res.status(guard.status).json({ error: guard.message })

    try {
      const payload = req.body || {}
      const { data, error } = await supabase
        .from('advertisements')
        .insert(payload)
        .select()
        .single()
      if (error) return res.status(400).json({ error: error.message })
      return res.status(201).json(data)
    } catch (e) {
      return res.status(500).json({ error: e.message })
    }
  }

  res.setHeader('Allow', ['GET', 'POST'])
  return res.status(405).json({ error: 'Method Not Allowed' })
}