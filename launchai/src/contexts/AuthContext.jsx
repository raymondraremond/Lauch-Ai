import React, { createContext, useContext, useEffect, useState, useRef } from 'react'
import { supabase, supabaseConfigured } from '../lib/supabaseClient'

const AuthContext = createContext({})

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const initialized = useRef(false)

  const fetchProfile = async (userId) => {
    if (!supabase) return;
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()
      
      if (error && error.code !== 'PGRST116') throw error
      setProfile(data || null)
    } catch (err) {
      console.warn('Could not fetch profile:', err.message)
    }
  }

  useEffect(() => {
    if (!supabaseConfigured || !supabase) {
      setLoading(false)
      return
    }

    // Safety timeout: Never leave the user on a loading screen for more than 6s
    const timer = setTimeout(() => {
      console.warn('Auth loading timed out — forcing ready state')
      setLoading(false)
    }, 6000)

    // CRITICAL: Subscribe to auth changes FIRST (before getSession) so we
    // never miss a SIGNED_IN event that Supabase fires when it processes
    // the #access_token hash fragment during an OAuth callback.
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        console.log('Auth event:', event, '| Has session:', !!currentSession)

        setSession(currentSession)
        const currentUser = currentSession?.user ?? null
        setUser(currentUser)

        if (currentUser) {
          await fetchProfile(currentUser.id)
        } else {
          setProfile(null)
        }

        // For INITIAL_SESSION: If there's a hash with access_token but no
        // session yet, Supabase will fire SIGNED_IN shortly after — wait for it.
        const hashHasToken = window.location.hash.includes('access_token=')
        if (event === 'INITIAL_SESSION' && !currentSession && hashHasToken) {
          console.log('OAuth callback detected — waiting for SIGNED_IN event...')
          return // Don't clear loading yet; SIGNED_IN will follow
        }

        // After successful OAuth sign-in, clean up the hash fragment
        // to prevent stale tokens on page refresh
        if (event === 'SIGNED_IN' && hashHasToken) {
          window.history.replaceState(null, '', window.location.pathname + window.location.search)
        }

        // For every other event (SIGNED_IN, SIGNED_OUT, TOKEN_REFRESHED, etc.)
        // or INITIAL_SESSION with a valid session — we're done loading.
        clearTimeout(timer)
        initialized.current = true
        setLoading(false)
      }
    )

    // getSession() kicks off the session recovery (including hash exchange).
    // The result will come through onAuthStateChange above.
    supabase.auth.getSession().then(({ data: { session: existingSession } }) => {
      // If onAuthStateChange already initialized us, skip.
      if (initialized.current) return

      // If getSession found a session and onAuthStateChange hasn't fired yet,
      // set the state optimistically. onAuthStateChange will confirm it.
      if (existingSession) {
        setSession(existingSession)
        setUser(existingSession.user)
        fetchProfile(existingSession.user.id)
      }
    })

    return () => {
      clearTimeout(timer)
      subscription.unsubscribe()
    }
  }, [])

  const value = {
    signUp: (data) => supabase?.auth.signUp(data),
    signIn: (data) => supabase?.auth.signInWithPassword(data),
    signInWithGoogle: () => supabase?.auth.signInWithOAuth({
      provider: 'google',
      options: { 
        redirectTo: window.location.origin + '/auth/callback',
        queryParams: { access_type: 'offline', prompt: 'consent' }
      }
    }),
    signInWithGitHub: () => supabase?.auth.signInWithOAuth({
      provider: 'github',
      options: { 
        redirectTo: window.location.origin + '/auth/callback',
        queryParams: { access_type: 'offline', prompt: 'consent' }
      }
    }),
    signOut: () => supabase?.auth.signOut(),
    resetPassword: (email) => supabase?.auth.resetPasswordForEmail(email),
    user,
    profile,
    session,
    loading,
    supabaseConfigured
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  return useContext(AuthContext)
}
