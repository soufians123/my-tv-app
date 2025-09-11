import { supabase } from './supabase'

// Helpers to parse string value based on type column
const parseValue = (raw, type) => {
  try {
    switch ((type || 'string').toLowerCase()) {
      case 'json':
        return raw ? JSON.parse(raw) : null
      case 'number':
        return raw != null ? Number(raw) : null
      case 'boolean':
        if (typeof raw === 'boolean') return raw
        if (raw == null) return null
        const s = String(raw).toLowerCase()
        return s === 'true' || s === '1'
      case 'string':
      default:
        return raw ?? null
    }
  } catch (_) {
    return raw ?? null
  }
}

export async function getSetting(key, defaultValue = null) {
  const { data, error } = await supabase
    .from('settings')
    .select('key, value, type, is_public, description, updated_at')
    .eq('key', key)
    .maybeSingle()

  if (error) {
    // Most likely RLS denial for non-public keys; return default silently
    return defaultValue
  }

  if (!data) return defaultValue
  return parseValue(data.value, data.type)
}

export async function getSettings(keys = []) {
  let query = supabase
    .from('settings')
    .select('key, value, type, is_public')

  if (Array.isArray(keys) && keys.length > 0) {
    query = query.in('key', keys)
  }

  const { data, error } = await query
  if (error) return {}
  const out = {}
  for (const row of data || []) {
    out[row.key] = parseValue(row.value, row.type)
  }
  return out
}

// NOTE: For writes, prefer using the server API route /api/admin/settings/[key]
export async function setSettingViaApi(key, value, { type = 'json', is_public = false, description = '' } = {}) {
  try {
    const res = await fetch(`/api/admin/settings/${encodeURIComponent(key)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ value, type, is_public, description })
    })
    if (!res.ok) {
      const msg = await res.text()
      throw new Error(msg || 'Failed to update setting')
    }
    return true
  } catch (e) {
    console.error('setSettingViaApi error:', e)
    return false
  }
}