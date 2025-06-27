import React, { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../utils/supabase'

const AuthContext = createContext({})

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setUser(session?.user ?? null)
      setLoading(false)
    }

    getSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null)
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    
    // Track login activity
    if (data.user && !error) {
      await trackUserLogin(data.user.id)
    }
    
    return { data, error }
  }

  const signInAdmin = async (username, password) => {
    // Admin credentials check (in production, this should be more secure)
    const ADMIN_USERNAME = process.env.REACT_APP_ADMIN_USERNAME || 'admin'
    const ADMIN_PASSWORD = process.env.REACT_APP_ADMIN_PASSWORD || 'admin123'
    
    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      // Create a mock admin user object
      const adminUser = {
        id: 'admin',
        email: 'admin@system.local',
        role: 'admin',
        user_metadata: { role: 'admin' }
      }
      setUser(adminUser)
      return { data: { user: adminUser }, error: null }
    } else {
      return { data: null, error: { message: 'Invalid admin credentials' } }
    }
  }

  const signUp = async (email, password) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })
    
    // Track user registration
    if (data.user && !error) {
      await trackUserRegistration(data.user.id, email)
    }
    
    return { data, error }
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    setUser(null)
    return { error }
  }

  const trackUserRegistration = async (userId, email) => {
    try {
      await supabase
        .from('user_analytics')
        .insert([
          {
            user_id: userId,
            email: email,
            registration_date: new Date().toISOString(),
            last_login: new Date().toISOString(),
            login_count: 1
          }
        ])
    } catch (error) {
      console.error('Error tracking registration:', error)
    }
  }

  const trackUserLogin = async (userId) => {
    try {
      // First try to update existing record
      const { data: existingUser } = await supabase
        .from('user_analytics')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (existingUser) {
        // Update existing user
        await supabase
          .from('user_analytics')
          .update({
            last_login: new Date().toISOString(),
            login_count: existingUser.login_count + 1
          })
          .eq('user_id', userId)
      } else {
        // Create new record for existing user
        const { data: userData } = await supabase.auth.getUser()
        if (userData.user) {
          await supabase
            .from('user_analytics')
            .insert([
              {
                user_id: userId,
                email: userData.user.email,
                registration_date: userData.user.created_at,
                last_login: new Date().toISOString(),
                login_count: 1
              }
            ])
        }
      }
    } catch (error) {
      console.error('Error tracking login:', error)
    }
  }

  const value = {
    user,
    loading,
    signIn,
    signInAdmin,
    signUp,
    signOut,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
