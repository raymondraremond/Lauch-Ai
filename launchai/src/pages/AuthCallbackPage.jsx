import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

export default function AuthCallbackPage() {
  const [status, setStatus] = useState('loading') // 'loading' | 'success' | 'error'
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    async function handleCallback() {
      try {
        // Supabase automatically handles the OAuth callback
        // when detectSessionInUrl: true is set in the client
        const { data, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Auth callback error:', error.message)
          setErrorMsg(error.message)
          setStatus('error')
          // Auto-redirect to auth page after 3s even on error
          setTimeout(() => { window.location.href = '/auth' }, 3000)
          return
        }

        if (data.session) {
          setStatus('success')
          setTimeout(() => { window.location.href = '/dashboard' }, 1000)
        } else {
          // Try exchanging the code from URL
          const hashParams = new URLSearchParams(window.location.hash.substring(1))
          const accessToken = hashParams.get('access_token')
          
          if (accessToken) {
            const { error: setError } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: hashParams.get('refresh_token') || ''
            })
            if (setError) {
              console.error('Session setting error:', setError.message)
              setErrorMsg(setError.message)
              setStatus('error')
              setTimeout(() => { window.location.href = '/auth' }, 3000)
            } else {
              setStatus('success')
              setTimeout(() => { window.location.href = '/dashboard' }, 1000)
            }
          } else {
            console.warn('No access token found in URL hash')
            setErrorMsg('No session found after OAuth redirect')
            setStatus('error')
            setTimeout(() => { window.location.href = '/auth' }, 3000)
          }
        }
      } catch (err) {
        console.error('Auth callback exception:', err.message)
        setErrorMsg(err.message)
        setStatus('error')
        setTimeout(() => { window.location.href = '/auth' }, 3000)
      }
    }

    handleCallback()
  }, [])

  if (status === 'loading') return (
    <div style={styles.screen}>
      <div style={styles.spinner} />
      <p style={styles.text}>Completing sign in...</p>
    </div>
  )

  if (status === 'success') return (
    <div style={styles.screen}>
      <div style={{ fontSize: '48px' }}>✅</div>
      <p style={styles.text}>Signed in! Redirecting to dashboard...</p>
    </div>
  )

  return (
    <div style={styles.screen}>
      <div style={{ fontSize: '48px' }}>❌</div>
      <p style={{ ...styles.text, color: '#ef4444' }}>Sign in failed</p>
      <p style={{ color: '#6b7280', fontSize: '14px' }}>{errorMsg}</p>
      <button
        onClick={() => window.location.href = '/'}
        style={styles.btn}
      >
        Try Again
      </button>
    </div>
  )
}

const styles = {
  screen: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '16px',
    background: '#0f0f1a',
  },
  spinner: {
    width: '40px', height: '40px',
    border: '3px solid #333',
    borderTop: '3px solid #1a73e8',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  text: { color: '#fff', fontSize: '16px', margin: 0 },
  btn: {
    padding: '10px 24px',
    background: '#1a73e8',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    marginTop: '8px'
  }
}
