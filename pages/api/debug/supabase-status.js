// API endpoint for debugging Supabase connection status
import { supabase } from '../../../lib/supabase'

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const debugInfo = {
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Set' : 'Missing',
      supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Set' : 'Missing',
      supabaseServiceKey: process.env.SUPABASE_SERVICE_ROLE_KEY ? 'Set' : 'Missing',
      urlFormat: process.env.NEXT_PUBLIC_SUPABASE_URL?.startsWith('https://') ? 'Valid' : 'Invalid',
      connectionTest: null,
      authTest: null
    }

    // Test basic connection
    try {
      const { data, error } = await supabase.auth.getSession()
      debugInfo.connectionTest = {
        success: !error,
        error: error?.message || null,
        hasSession: !!data?.session
      }
    } catch (connError) {
      debugInfo.connectionTest = {
        success: false,
        error: connError.message,
        hasSession: false
      }
    }

    // Test auth configuration
    try {
      const { data, error } = await supabase.auth.getUser()
      debugInfo.authTest = {
        success: !error,
        error: error?.message || null,
        hasUser: !!data?.user
      }
    } catch (authError) {
      debugInfo.authTest = {
        success: false,
        error: authError.message,
        hasUser: false
      }
    }

    res.status(200).json({
      status: 'success',
      debug: debugInfo
    })

  } catch (error) {
    console.error('Debug API Error:', error)
    res.status(500).json({
      status: 'error',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    })
  }
}