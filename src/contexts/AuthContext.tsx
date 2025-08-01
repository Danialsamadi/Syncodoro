import React, { createContext, useContext, useEffect, useState } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '../services/supabase'
import { dbHelpers } from '../services/dbHelpers'
import { syncService } from '../services/syncService'
import toast from 'react-hot-toast'

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  signInWithGoogle: () => Promise<void>
  signInWithGitHub: () => Promise<void>
  signOut: () => Promise<void>
  updateProfile: (profile: {
    username?: string
    displayName?: string
    bio?: string
    profilePublic?: boolean
  }) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: React.ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)

      if (event === 'SIGNED_IN' && session?.user) {
        // Initialize user settings when signing in
        await initializeUserSettings(session.user.id)
        
        // Start syncing data
        await syncService.syncData(session.user.id)
        
        toast.success('Successfully signed in!')
      } else if (event === 'SIGNED_OUT') {
        toast.success('Successfully signed out!')
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const initializeUserSettings = async (userId: string) => {
    try {
      // Check if user settings exist locally
      const existingSettings = await dbHelpers.getSettings(userId)
      
      if (!existingSettings) {
        // Create default settings for new user
        await dbHelpers.updateSettings({}, userId)
      }

      // Ensure user profile exists in Supabase
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (!profile) {
        await supabase
          .from('profiles')
          .insert({
            id: userId,
            profile_public: false
          })
      }
    } catch (error) {
      console.error('Failed to initialize user settings:', error)
    }
  }

  const signInWithGoogle = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`
        }
      })
      
      if (error) {
        toast.error('Failed to sign in with Google')
        throw error
      }
    } catch (error) {
      console.error('Google sign in error:', error)
      toast.error('Failed to sign in with Google')
    }
  }

  const signInWithGitHub = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
          redirectTo: `${window.location.origin}/dashboard`
        }
      })
      
      if (error) {
        toast.error('Failed to sign in with GitHub')
        throw error
      }
    } catch (error) {
      console.error('GitHub sign in error:', error)
      toast.error('Failed to sign in with GitHub')
    }
  }

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      
      if (error) {
        toast.error('Failed to sign out')
        throw error
      }
    } catch (error) {
      console.error('Sign out error:', error)
      toast.error('Failed to sign out')
    }
  }

  const updateProfile = async (profile: {
    username?: string
    displayName?: string
    bio?: string
    profilePublic?: boolean
  }) => {
    if (!user) {
      throw new Error('No user logged in')
    }

    try {
      // Update local settings
      await dbHelpers.updateSettings({
        username: profile.username,
        displayName: profile.displayName,
        bio: profile.bio,
        profilePublic: profile.profilePublic
      }, user.id)

      // Sync to Supabase
      await syncService.syncProfile(user.id, profile)
      
      toast.success('Profile updated successfully!')
    } catch (error) {
      console.error('Failed to update profile:', error)
      toast.error('Failed to update profile')
      throw error
    }
  }

  const value: AuthContextType = {
    user,
    session,
    loading,
    signInWithGoogle,
    signInWithGitHub,
    signOut,
    updateProfile
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
