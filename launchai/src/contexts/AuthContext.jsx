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
    console.log('🔄 [AUTH PROVIDER] Initializing...')
    
    // Safety check: if supabase client failed to initialize or is not configured
    if (!supabaseConfigured || !supabase || !supabase.auth) {
      console.warn('⚠️ [AUTH PROVIDER] Skipping auth initialization (Supabase not configured)')
      setLoading(false)
      return
    }

    // Safety timeout: Never leave the user on a loading screen for more than 6s
    const timer = setTimeout(() => {
      console.warn('🚨 [AUTH PROVIDER] Loading timed out — forcing ready state')
      setLoading(false)
    }, 6000)

    let subscription = null

    try {
      console.log('📡 [AUTH PROVIDER] Subscribing to auth state changes...')
      // CRITICAL: Subscribe to auth changes FIRST (before getSession)
      const { data } = supabase.auth.onAuthStateChange(
        async (event, currentSession) => {
          console.log('🔔 [AUTH PROVIDER] Event:', event, '| Has session:', !!currentSession)

          setSession(currentSession)
          const currentUser = currentSession?.user ?? null
          setUser(currentUser)

          if (currentUser) {
            await fetchProfile(currentUser.id)
          } else {
            setProfile(null)
          }

          const hashHasToken = window.location.hash.includes('access_token=')
          if (event === 'INITIAL_SESSION' && !currentSession && hashHasToken) {
            console.log('ℹ️ [AUTH PROVIDER] OAuth callback detected — waiting for SIGNED_IN...')
            return 
          }

          if (event === 'SIGNED_IN' && hashHasToken) {
            window.history.replaceState(null, '', window.location.pathname + window.location.search)
          }

          if (!initialized.current) {
            console.log('✅ [AUTH PROVIDER] Initialized via onAuthStateChange')
            clearTimeout(timer)
            initialized.current = true
            setLoading(false)
          }
        }
      )
      subscription = data?.subscription
    } catch (err) {
      console.error('❌ [AUTH PROVIDER] onAuthStateChange failed:', err.message)
      setLoading(false)
    }

    // getSession() kicks off the session recovery
    try {
      console.log('🔍 [AUTH PROVIDER] Fetching initial session...')
      supabase.auth.getSession().then(({ data: { session: existingSession } }) => {
        if (initialized.current) {
          console.log('ℹ️ [AUTH PROVIDER] Already initialized via event.')
          return
        }
  
        if (existingSession) {
          console.log('✅ [AUTH PROVIDER] Found existing session.')
          setSession(existingSession)
          setUser(existingSession.user)
          fetchProfile(existingSession.user.id)
        } else {
          console.log('ℹ️ [AUTH PROVIDER] No session found.')
        }
        
        clearTimeout(timer)
        initialized.current = true
        setLoading(false)
      }).catch(err => {
        console.error('❌ [AUTH PROVIDER] getSession failed:', err.message)
        setLoading(false)
      })
    } catch (err) {
      console.error('❌ [AUTH PROVIDER] getSession sync error:', err.message)
      setLoading(false)
    }

    return () => {
      clearTimeout(timer)
      if (subscription) subscription.unsubscribe()
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
