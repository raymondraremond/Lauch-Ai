import React, { createContext, useContext, useEffect, useState, useRef } from 'react'
import { supabase, supabaseConfigured } from '../lib/supabase'

const AuthContext = createContext({})

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const loadingTimeout = useRef(null)

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
    
    if (!supabaseConfigured || !supabase || !supabase.auth) {
      console.warn('⚠️ [AUTH PROVIDER] Skipping auth initialization (Supabase not configured)')
      setLoading(false)
      return
    }

    // Set a safety timeout — will be cancelled if auth resolves first
    loadingTimeout.current = setTimeout(() => {
      console.warn('🚨 [AUTH PROVIDER] Loading timed out — forcing ready state')
      setLoading(false)
    }, 10000)

    // 1. Get initial session
    supabase.auth.getSession().then(async ({ data: { session: existingSession } }) => {
      if (existingSession) {
        console.log('✅ [AUTH PROVIDER] Found existing session.')
        setSession(existingSession)
        setUser(existingSession.user)
        await fetchProfile(existingSession.user.id)
      } else {
        console.log('ℹ️ [AUTH PROVIDER] No session found.')
      }
      
      setLoading(false)
      if (loadingTimeout.current) clearTimeout(loadingTimeout.current)
    }).catch(err => {
      console.error('❌ [AUTH PROVIDER] getSession failed:', err.message)
      setLoading(false)
      if (loadingTimeout.current) clearTimeout(loadingTimeout.current)
    })

    // 2. Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        console.log(`🔔 [AUTH PROVIDER] Event: ${event} | Has session: ${!!currentSession}`)
        
        setSession(currentSession)
        const currentUser = currentSession?.user ?? null
        setUser(currentUser)

        if (currentUser) {
          await fetchProfile(currentUser.id)
        } else {
          setProfile(null)
        }

        const hashHasToken = window.location.hash.includes('access_token=')
        if (event === 'SIGNED_IN' && hashHasToken) {
          window.history.replaceState(null, '', window.location.pathname + window.location.search)
        }

        setLoading(false)
        if (loadingTimeout.current) {
          clearTimeout(loadingTimeout.current)
          loadingTimeout.current = null
        }
      }
    )

    return () => {
      if (subscription) subscription.unsubscribe()
      if (loadingTimeout.current) clearTimeout(loadingTimeout.current)
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
