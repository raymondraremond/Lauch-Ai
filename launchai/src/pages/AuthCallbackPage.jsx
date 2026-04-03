import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function AuthCallbackPage() {
  const { user, loading } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    // If we're no longer loading and have a user, head to dashboard
    if (!loading && user) {
      const timer = setTimeout(() => {
        navigate('/dashboard', { replace: true })
      }, 500)
      return () => clearTimeout(timer)
    }
    
    // If we're not loading and still no user after 5 seconds, something failed
    if (!loading && !user) {
      const timer = setTimeout(() => {
        navigate('/auth', { replace: true })
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [user, loading, navigate])

  return (
    <div style={styles.screen}>
      <div className="flex flex-col items-center gap-6 animate-fade-up">
        <div style={styles.spinner} />
        <div className="text-center">
          <p style={styles.text}>Finalizing your secure session...</p>
          <p style={{ color: '#6b7280', fontSize: '12px', marginTop: '8px' }}>
            Preparing your AI development environment
          </p>
        </div>
      </div>
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
