import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

export default function DebugPage() {
  const { user, loading, authError } = useAuth()
  const [debugInfo, setDebugInfo] = useState(null)
  const [apiDebug, setApiDebug] = useState(null)
  const [testLoading, setTestLoading] = useState(false)

  useEffect(() => {
    // Client-side debug info
    const clientDebug = {
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || 'Not set',
      hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      authContext: {
        user: !!user,
        loading,
        authError: authError || null
      }
    }
    setDebugInfo(clientDebug)
  }, [user, loading, authError])

  const testSupabaseConnection = async () => {
    setTestLoading(true)
    try {
      // Test API endpoint
      const response = await fetch('/api/debug/supabase-status')
      const data = await response.json()
      setApiDebug(data)
    } catch (error) {
      setApiDebug({
        status: 'error',
        error: error.message
      })
    }
    setTestLoading(false)
  }

  const testDirectConnection = async () => {
    try {
      console.log('Testing direct Supabase connection...')
      const { data, error } = await supabase.auth.getSession()
      console.log('Direct connection result:', { data, error })
      alert(`Direct connection test: ${error ? 'Failed - ' + error.message : 'Success'}`)
    } catch (error) {
      console.error('Direct connection error:', error)
      alert('Direct connection failed: ' + error.message)
    }
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace', backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      <h1 style={{ color: '#333', marginBottom: '20px' }}>🔧 Supabase Debug Dashboard</h1>
      
      <div style={{ marginBottom: '20px' }}>
        <button 
          onClick={testSupabaseConnection}
          disabled={testLoading}
          style={{
            padding: '10px 20px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            marginRight: '10px'
          }}
        >
          {testLoading ? 'Testing...' : 'Test API Connection'}
        </button>
        
        <button 
          onClick={testDirectConnection}
          style={{
            padding: '10px 20px',
            backgroundColor: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          Test Direct Connection
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        <div>
          <h2 style={{ color: '#333' }}>📱 Client-Side Info</h2>
          <pre style={{ 
            backgroundColor: 'white', 
            padding: '15px', 
            borderRadius: '5px', 
            border: '1px solid #ddd',
            overflow: 'auto',
            fontSize: '12px'
          }}>
            {JSON.stringify(debugInfo, null, 2)}
          </pre>
        </div>

        <div>
          <h2 style={{ color: '#333' }}>🖥️ Server-Side Info</h2>
          <pre style={{ 
            backgroundColor: 'white', 
            padding: '15px', 
            borderRadius: '5px', 
            border: '1px solid #ddd',
            overflow: 'auto',
            fontSize: '12px'
          }}>
            {apiDebug ? JSON.stringify(apiDebug, null, 2) : 'Click "Test API Connection" to load'}
          </pre>
        </div>
      </div>

      <div style={{ marginTop: '20px' }}>
        <h2 style={{ color: '#333' }}>🚨 Current Issues</h2>
        <div style={{ 
          backgroundColor: 'white', 
          padding: '15px', 
          borderRadius: '5px', 
          border: '1px solid #ddd'
        }}>
          {authError && (
            <div style={{ color: 'red', marginBottom: '10px' }}>
              ❌ Auth Error: {authError}
            </div>
          )}
          {loading && (
            <div style={{ color: 'orange', marginBottom: '10px' }}>
              ⏳ Still Loading...
            </div>
          )}
          {!user && !loading && (
            <div style={{ color: 'blue', marginBottom: '10px' }}>
              ℹ️ No authenticated user
            </div>
          )}
          {user && (
            <div style={{ color: 'green', marginBottom: '10px' }}>
              ✅ User authenticated: {user.email}
            </div>
          )}
        </div>
      </div>

      <div style={{ marginTop: '20px', fontSize: '12px', color: '#666' }}>
        <p>💡 This page helps diagnose Supabase connection issues in production.</p>
        <p>🔗 Access this page at: /debug</p>
      </div>
    </div>
  )
}