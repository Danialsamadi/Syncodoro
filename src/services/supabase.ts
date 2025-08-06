import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-anon-key'

// Check if environment variables are properly set
if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
  console.error('⚠️ Supabase environment variables not found. Using placeholder values. Authentication and data sync will not work correctly.')
} else {
  console.log('✅ Supabase environment variables found:', { 
    url: supabaseUrl.substring(0, 20) + '...', // Only show part of the URL for security
    keyLength: supabaseAnonKey.length
  })
}

// Create the Supabase client with options for better reliability
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

// Database types for Supabase
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          username: string | null
          display_name: string | null
          bio: string | null
          profile_public: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          username?: string | null
          display_name?: string | null
          bio?: string | null
          profile_public?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          username?: string | null
          display_name?: string | null
          bio?: string | null
          profile_public?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      sessions: {
        Row: {
          id: string
          user_id: string
          start_time: string
          end_time: string | null
          duration: number
          type: 'pomodoro' | 'short-break' | 'long-break'
          tags: string[]
          completed: boolean
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          start_time: string
          end_time?: string | null
          duration: number
          type: 'pomodoro' | 'short-break' | 'long-break'
          tags?: string[]
          completed?: boolean
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          start_time?: string
          end_time?: string | null
          duration?: number
          type?: 'pomodoro' | 'short-break' | 'long-break'
          tags?: string[]
          completed?: boolean
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      user_settings: {
        Row: {
          id: string
          user_id: string
          pomodoro_length: number
          short_break_length: number
          long_break_length: number
          sessions_until_long_break: number
          auto_start_breaks: boolean
          auto_start_pomodoros: boolean
          sound_enabled: boolean
          sound_type: string
          notifications_enabled: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          pomodoro_length?: number
          short_break_length?: number
          long_break_length?: number
          sessions_until_long_break?: number
          auto_start_breaks?: boolean
          auto_start_pomodoros?: boolean
          sound_enabled?: boolean
          sound_type?: string
          notifications_enabled?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          pomodoro_length?: number
          short_break_length?: number
          long_break_length?: number
          sessions_until_long_break?: number
          auto_start_breaks?: boolean
          auto_start_pomodoros?: boolean
          sound_enabled?: boolean
          sound_type?: string
          notifications_enabled?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      tags: {
        Row: {
          id: string
          user_id: string
          name: string
          color: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          color: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          color?: string
          created_at?: string
        }
      }
    }
  }
}
