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
  profile: {
    username?: string | null
    displayName?: string | null
    bio?: string | null
    profilePublic?: boolean
  } | null
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
  const [profile, setProfile] = useState<AuthContextType['profile']>(null)

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
      if (session?.user) {
        fetchProfile(session.user.id)
      }
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.email)
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
      if (session?.user) {
        fetchProfile(session.user.id)
      } else {
        setProfile(null)
      }

      if (event === 'SIGNED_IN' && session?.user) {
        // Initialize user settings when signing in
        try {
          console.log('User signed in, initializing settings and syncing data for:', session.user.id)
          await initializeUserSettings(session.user.id)
          
          // Force a data sync to ensure user data is up-to-date
          console.log('Triggering initial data sync after login')
          setTimeout(async () => {
            try {
              await syncService.syncData(session.user.id)
              console.log('Initial data sync completed successfully')
            } catch (syncError) {
              console.error('Error during initial data sync:', syncError)
            }
          }, 1000) // Small delay to ensure auth is fully established
          
          toast.success('Successfully signed in!')
          
          // Redirect to dashboard if not already there
          const currentPath = window.location.pathname
          if (currentPath === '/' || currentPath === '/login') {
            window.location.href = '/dashboard'
          }
        } catch (error) {
          console.error('Error during sign-in process:', error)
          toast.error('Error completing sign-in process')
        }
      } else if (event === 'SIGNED_OUT') {
        toast.success('Successfully signed out!')
        // Redirect to home page after sign out
        window.location.href = '/'
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const initializeUserSettings = async (userId: string) => {
    try {
      console.log('🔄 Initializing user settings for:', userId)
      
      // First, check if user settings exist in Supabase
      const { data: remoteSettings, error: remoteError } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', userId)
        .single()
      
      console.log('Remote settings check:', { 
        exists: !!remoteSettings, 
        error: remoteError?.message,
        errorCode: remoteError?.code 
      })
      
      // Check if user settings exist locally
      const existingSettings = await dbHelpers.getSettings(userId)
      console.log('Local settings check:', { exists: !!existingSettings })
      
      // Case 1: No settings in Supabase, create them from local or defaults
      if (!remoteSettings || (remoteError && remoteError.code === 'PGRST116')) {
        console.log('⚠️ No settings in Supabase, creating them')
        
        // Create default settings locally if they don't exist
        if (!existingSettings) {
          console.log('💾 Creating default local settings')
          await dbHelpers.updateSettings({
            pomodoroLength: 25,
            shortBreakLength: 5,
            longBreakLength: 15,
            sessionsUntilLongBreak: 4,
            autoStartBreaks: false,
            autoStartPomodoros: false,
            soundEnabled: true,
            soundType: 'beep',
            notificationsEnabled: true
          }, userId)
        }
        
        // Get the settings after ensuring they exist
        const settingsToSync = await dbHelpers.getSettings(userId)
        
        if (!settingsToSync) {
          console.error('❌ Failed to retrieve settings after creation')
          return
        }
        
        // Try to create settings in Supabase with upsert to handle potential race conditions
        console.log('📤 Uploading settings to Supabase')
        const { data, error } = await supabase
          .from('user_settings')
          .upsert({
            user_id: userId,
            pomodoro_length: settingsToSync.pomodoroLength,
            short_break_length: settingsToSync.shortBreakLength,
            long_break_length: settingsToSync.longBreakLength,
            sessions_until_long_break: settingsToSync.sessionsUntilLongBreak,
            auto_start_breaks: settingsToSync.autoStartBreaks,
            auto_start_pomodoros: settingsToSync.autoStartPomodoros,
            sound_enabled: settingsToSync.soundEnabled,
            sound_type: settingsToSync.soundType || 'beep',
            notifications_enabled: settingsToSync.notificationsEnabled
          }, {
            onConflict: 'user_id'
          })
          .select()
        
        if (error) {
          console.error('❌ Failed to create settings in Supabase:', error)
          
          // Try direct insert as fallback
          console.log('🔄 Attempting direct insert as fallback')
          const { error: insertError } = await supabase
            .from('user_settings')
            .insert({
              user_id: userId,
              pomodoro_length: settingsToSync.pomodoroLength,
              short_break_length: settingsToSync.shortBreakLength,
              long_break_length: settingsToSync.longBreakLength,
              sessions_until_long_break: settingsToSync.sessionsUntilLongBreak,
              auto_start_breaks: settingsToSync.autoStartBreaks,
              auto_start_pomodoros: settingsToSync.autoStartPomodoros,
              sound_enabled: settingsToSync.soundEnabled,
              sound_type: settingsToSync.soundType || 'beep',
              notifications_enabled: settingsToSync.notificationsEnabled
            })
          
          if (insertError) {
            console.error('❌ Direct insert also failed:', insertError)
          } else {
            console.log('✅ Successfully inserted settings via fallback')
          }
        } else {
          console.log('✅ Successfully created settings in Supabase:', data)
        }
      } 
      // Case 2: Settings exist in Supabase but not locally
      else if (!existingSettings) {
        console.log('📥 Creating local settings from Supabase data')
        await dbHelpers.updateSettings({
          pomodoroLength: remoteSettings.pomodoro_length,
          shortBreakLength: remoteSettings.short_break_length,
          longBreakLength: remoteSettings.long_break_length,
          sessionsUntilLongBreak: remoteSettings.sessions_until_long_break,
          autoStartBreaks: remoteSettings.auto_start_breaks,
          autoStartPomodoros: remoteSettings.auto_start_pomodoros,
          soundEnabled: remoteSettings.sound_enabled,
          soundType: remoteSettings.sound_type || 'beep',
          notificationsEnabled: remoteSettings.notifications_enabled
        }, userId)
        console.log('✅ Local settings created from remote data')
      }
      // Case 3: Both local and remote settings exist - ensure they're in sync
      else {
        console.log('🔄 Both local and remote settings exist, syncing...')
        await syncService.syncData(userId)
      }

      // Ensure user profile exists in Supabase
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (!profile) {
        console.log('Creating user profile in Supabase')
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

  // Fetch user profile from Supabase
  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()
      if (error) {
        console.error('Failed to fetch user profile:', error)
        setProfile(null)
      } else {
        setProfile({
          username: data.username,
          displayName: data.display_name,
          bio: data.bio,
          profilePublic: data.profile_public
        })
      }
    } catch (err) {
      setProfile(null)
    }
  }

  const signInWithGoogle = async () => {
    try {
      const redirectUrl = import.meta.env.VITE_APP_URL || window.location.origin
      console.log('🔍 Debug - Redirect URL:', redirectUrl)
      console.log('🔍 Debug - VITE_APP_URL:', import.meta.env.VITE_APP_URL)
      console.log('🔍 Debug - window.location.origin:', window.location.origin)
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl
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
          redirectTo: `${import.meta.env.VITE_APP_URL || window.location.origin}`
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
      // Refetch profile after update
      await fetchProfile(user.id)
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
    profile,
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
