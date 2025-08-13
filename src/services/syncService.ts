import { supabase } from './supabase'
import { dbHelpers } from './dbHelpers'
export class SyncService {
  private isOnline = navigator.onLine
  private syncInProgress = false

  constructor() {
    // Listen for online/offline events
    window.addEventListener('online', () => {
      this.isOnline = true
      this.syncData()
    })
    
    window.addEventListener('offline', () => {
      this.isOnline = false
    })
  }

  // Event emitter for sync completion
  private syncCompletedListeners: Array<() => void> = []

  // Add listener for sync completion
  public onSyncCompleted(callback: () => void): void {
    this.syncCompletedListeners.push(callback)
  }

  // Remove listener
  public removeSyncCompletedListener(callback: () => void): void {
    this.syncCompletedListeners = this.syncCompletedListeners.filter(cb => cb !== callback)
  }

  // Notify all listeners when sync is completed
  private notifySyncCompleted(): void {
    this.syncCompletedListeners.forEach(callback => {
      try {
        callback()
      } catch (error) {
        console.error('Error in sync completed callback:', error)
      }
    })
  }

  async syncData(userId?: string): Promise<void> {
    if (!this.isOnline || this.syncInProgress || !userId) {
      console.log('Sync skipped:', { isOnline: this.isOnline, syncInProgress: this.syncInProgress, userId })
      return;
    }

    console.log('🔄 Starting data sync for user:', userId)
    this.syncInProgress = true;
    
    // First, check if user settings exist in Supabase
    try {
      const { data: settingsExist, error: checkError } = await supabase
        .from('user_settings')
        .select('id')
        .eq('user_id', userId)
        .single();
      
      console.log('User settings check:', { exists: !!settingsExist, error: checkError?.message })
      
      if (!settingsExist && !checkError) {
        console.log('⚠️ No user settings found in Supabase, will create during sync')
      } else if (checkError && checkError.code !== 'PGRST116') {
        // PGRST116 is the error code for "no rows returned" which is expected if no settings exist
        console.error('Error checking user settings:', checkError)
      }
    } catch (error) {
      console.error('Failed to check user settings:', error)
    }

    try {
      // Sync settings first to ensure they exist
      console.log('Syncing settings...')
      await this.syncSettings(userId)
      
      // Sync sessions
      console.log('Syncing sessions...')
      await this.syncSessions(userId)
      
      // Sync tags
      console.log('Syncing tags...')
      await this.syncTags(userId)
      
      console.log('✅ Data sync completed successfully')
      console.log(`📊 Synced sessions, tags, and settings for user: ${userId}`)
      
      // Clean up any duplicate sessions that might have been created
      console.log('🧼 Cleaning up duplicate sessions...')
      await dbHelpers.cleanupDuplicateSessions(userId)
      
      // Notify listeners that sync is completed
      this.notifySyncCompleted()
    } catch (error) {
      console.error('Sync failed:', error)
    } finally {
      this.syncInProgress = false;
    }
  }

  private async syncSessions(userId: string): Promise<void> {
    try {
      // Upload unsynced local sessions
      const unsyncedSessions = await dbHelpers.getUnsyncedSessions(userId)
      console.log(`Found ${unsyncedSessions.length} unsynced sessions to upload`)
    
    for (const session of unsyncedSessions) {
      try {
        console.log('Uploading session:', { 
          id: session.id,
          startTime: session.startTime,
          type: session.type,
          completed: session.completed
        })
        
        const { data, error } = await supabase
          .from('sessions')
          .insert({
            user_id: userId,
            start_time: session.startTime.toISOString(),
            end_time: session.endTime?.toISOString() || null,
            duration: session.duration,
            type: session.type,
            tags: session.tags,
            completed: session.completed,
            notes: session.notes || null
          })
          .select()

        if (error) {
          console.error('Error uploading session to Supabase:', error)
        } else {
          console.log('Successfully uploaded session to Supabase:', data)
          if (session.id) {
            await dbHelpers.markSessionsSynced([session.id])
            console.log(`Marked session ${session.id} as synced`)
          }
        }
      } catch (error) {
        console.error('Failed to sync session:', error)
      }
    }

    // Download new sessions from server
    try {
      console.log('🔄 Checking for new sessions from server...')
      
      // Get all existing local sessions to avoid duplicates
      const existingSessions = await dbHelpers.getSessionsByDateRange(
        new Date(Date.now() - 365 * 24 * 60 * 60 * 1000), // Last year
        new Date(),
        userId
      )
      
      // Create a set of existing session IDs (using start_time + duration as unique identifier)
      const existingSessionKeys = new Set(
        existingSessions.map(s => `${s.startTime.toISOString()}_${s.duration}_${s.type}`)
      )
      
      console.log(`Found ${existingSessions.length} existing local sessions`)

      const { data: remoteSessions, error } = await supabase
        .from('sessions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(100) // Limit to recent sessions to avoid downloading everything

      if (!error && remoteSessions) {
        console.log(`Found ${remoteSessions.length} sessions on server`)
        
        let newSessionsCount = 0
        for (const remoteSession of remoteSessions) {
          // Create unique key for this remote session
          const sessionKey = `${remoteSession.start_time}_${remoteSession.duration}_${remoteSession.type}`
          
          // Only add if we don't already have this session locally
          if (!existingSessionKeys.has(sessionKey)) {
            console.log('📥 Adding new session from server:', {
              startTime: remoteSession.start_time,
              type: remoteSession.type,
              duration: remoteSession.duration
            })
            
            await dbHelpers.addSession({
              userId,
              startTime: new Date(remoteSession.start_time),
              endTime: remoteSession.end_time ? new Date(remoteSession.end_time) : undefined,
              duration: remoteSession.duration,
              type: remoteSession.type,
              tags: remoteSession.tags || [],
              completed: remoteSession.completed,
              notes: remoteSession.notes || undefined,
              synced: true
            })
            newSessionsCount++
          } else {
            console.log('⏭️ Skipping duplicate session:', sessionKey)
          }
        }
        
        console.log(`✅ Added ${newSessionsCount} new sessions from server`)
      }
    } catch (error) {
      console.error('❌ Failed to download sessions:', error)
    }
    } catch (error) {
      console.error('❌ Error during session sync:', error)
      
      // If there's a DataError, try to clean up corrupted data
      if (error instanceof Error && error.name === 'DataError') {
        console.log('🧹 DataError detected, attempting to clean up corrupted data...')
        await dbHelpers.cleanupCorruptedData(userId)
      }
    }
  }

  private async syncTags(userId: string): Promise<void> {
    // Upload unsynced local tags
    const unsyncedTags = await dbHelpers.getUnsyncedTags(userId)
    console.log(`Found ${unsyncedTags.length} unsynced tags to upload`)
    
    for (const tag of unsyncedTags) {
      try {
        console.log('Uploading tag:', { id: tag.id, name: tag.name, color: tag.color })
        
        const { data, error } = await supabase
          .from('tags')
          .insert({
            user_id: userId,
            name: tag.name,
            color: tag.color
          })
          .select()

        if (error) {
          console.error('Error uploading tag to Supabase:', error)
        } else {
          console.log('Successfully uploaded tag to Supabase:', data)
          if (tag.id) {
            await dbHelpers.markTagsSynced([tag.id])
            console.log(`Marked tag ${tag.id} as synced`)
          }
        }
      } catch (error) {
        console.error('Failed to sync tag:', error)
      }
    }

    // Download new tags from server
    try {
      const { data: remoteTags, error } = await supabase
        .from('tags')
        .select('*')
        .eq('user_id', userId)

      if (!error && remoteTags) {
        const localTags = await dbHelpers.getTags(userId)
        const localTagNames = new Set(localTags.map(t => t.name))

        for (const remoteTag of remoteTags) {
          if (!localTagNames.has(remoteTag.name)) {
            await dbHelpers.addTag({
              userId,
              name: remoteTag.name,
              color: remoteTag.color,
              synced: true
            })
          }
        }
      }
    } catch (error) {
      console.error('Failed to download tags:', error)
    }
  }

  private async syncSettings(userId: string): Promise<void> {
    try {
      console.log('🔄 Syncing settings for user:', userId)
      
      // First check if settings exist in Supabase
      const { data: remoteSettings, error: checkError } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', userId)
        .single()
      
      console.log('Remote settings check:', { exists: !!remoteSettings, error: checkError?.message })
      
      // Get local settings
      let localSettings = await dbHelpers.getSettings(userId)
      console.log('Local settings check:', { exists: !!localSettings })
      
      // Case 1: No local settings but remote settings exist
      if (!localSettings && remoteSettings) {
        console.log('📥 Creating local settings from remote data')
        await dbHelpers.updateSettings({
          pomodoroLength: remoteSettings.pomodoro_length || 25,
          shortBreakLength: remoteSettings.short_break_length || 5,
          longBreakLength: remoteSettings.long_break_length || 15,
          sessionsUntilLongBreak: remoteSettings.sessions_until_long_break || 4,
          autoStartBreaks: remoteSettings.auto_start_breaks || false,
          autoStartPomodoros: remoteSettings.auto_start_pomodoros || false,
          soundEnabled: remoteSettings.sound_enabled || true,
          soundType: remoteSettings.sound_type || 'beep',
          notificationsEnabled: remoteSettings.notifications_enabled || true
        }, userId)
        console.log('✅ Local settings created from remote data')
        return
      }
      
      // Case 2: No local settings and no remote settings
      if (!localSettings) {
        console.log('⚠️ No settings found locally or remotely. Creating default settings...')
        // Create default settings locally
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
        
        // Get the newly created local settings
        localSettings = await dbHelpers.getSettings(userId)
        if (!localSettings) {
          console.error('❌ Failed to create default settings locally')
          return
        }
      }
      
      // Case 3: Local settings exist, upload to Supabase
      console.log('📤 Uploading settings to Supabase for user:', userId)
      
      // Create a base settings object
      const baseSettings = {
        user_id: userId,
        pomodoro_length: localSettings.pomodoroLength,
        short_break_length: localSettings.shortBreakLength,
        long_break_length: localSettings.longBreakLength,
        sessions_until_long_break: localSettings.sessionsUntilLongBreak,
        auto_start_breaks: localSettings.autoStartBreaks,
        auto_start_pomodoros: localSettings.autoStartPomodoros,
        sound_enabled: localSettings.soundEnabled,
        notifications_enabled: localSettings.notificationsEnabled
      }
      
      // Try first without the sound_type field in case it doesn't exist in the database
      try {
        console.log('[DEBUG] Upserting settings to Supabase (without sound_type):', baseSettings)
        const { error, data } = await supabase
          .from('user_settings')
          .upsert(baseSettings, {
            onConflict: 'user_id'
          })
          .select()
        console.log('[DEBUG] Upsert response (without sound_type):', { error, data })
        if (!error) {
          console.log('✅ Settings synced to Supabase successfully (without sound_type)')
          return
        }
        // If that failed, try with the sound_type field included
        console.log('Trying with sound_type field included...')
        const settingsWithSound = {
          ...baseSettings,
          sound_type: localSettings.soundType || 'beep'
        }
        console.log('[DEBUG] Upserting settings to Supabase (with sound_type):', settingsWithSound)
        const { error: errorWithSound, data: dataWithSound } = await supabase
          .from('user_settings')
          .upsert(settingsWithSound, {
            onConflict: 'user_id'
          })
          .select()
        console.log('[DEBUG] Upsert response (with sound_type):', { error: errorWithSound, data: dataWithSound })
        if (!errorWithSound) {
          console.log('✅ Settings synced to Supabase successfully (with sound_type)')
          return
        }
        console.error('❌ Failed to sync settings to Supabase:', errorWithSound)
        // Try an insert if upsert failed (might be a permission issue)
        console.log('🔄 Attempting direct insert as fallback...')
        // Try insert without sound_type first
        console.log('[DEBUG] Inserting settings to Supabase (without sound_type):', baseSettings)
        const { error: insertError, data: insertData } = await supabase
          .from('user_settings')
          .insert(baseSettings)
        console.log('[DEBUG] Insert response (without sound_type):', { error: insertError, data: insertData })
        if (!insertError) {
          console.log('✅ Settings inserted to Supabase successfully (without sound_type)')
          return
        }
        // Try insert with sound_type
        console.log('[DEBUG] Inserting settings to Supabase (with sound_type):', settingsWithSound)
        const { error: insertErrorWithSound, data: insertDataWithSound } = await supabase
          .from('user_settings')
          .insert(settingsWithSound)
        console.log('[DEBUG] Insert response (with sound_type):', { error: insertErrorWithSound, data: insertDataWithSound })
        if (insertErrorWithSound) {
          console.error('❌ Direct insert with sound_type also failed:', insertErrorWithSound)
        }
        if (insertError) {
          console.error('❌ Direct insert also failed:', insertError)
        } else {
          console.log('✅ Successfully inserted settings via fallback method')
        }
      } catch (error) {
        console.error('❌ Error during settings sync:', error)
      }

      // Case 4: After upload, download latest remote settings to ensure consistency
      const { data: latestRemoteSettings, error: fetchError } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', userId)
        .single()
      
      if (!fetchError && latestRemoteSettings) {
        console.log('📥 Updating local settings with latest remote data')
        await dbHelpers.updateSettings({
          pomodoroLength: latestRemoteSettings.pomodoro_length,
          shortBreakLength: latestRemoteSettings.short_break_length,
          longBreakLength: latestRemoteSettings.long_break_length,
          sessionsUntilLongBreak: latestRemoteSettings.sessions_until_long_break,
          autoStartBreaks: latestRemoteSettings.auto_start_breaks,
          autoStartPomodoros: latestRemoteSettings.auto_start_pomodoros,
          soundEnabled: latestRemoteSettings.sound_enabled,
          soundType: latestRemoteSettings.sound_type || 'beep',
          notificationsEnabled: latestRemoteSettings.notifications_enabled
        }, userId)
      } else if (fetchError) {
        console.error('❌ Failed to fetch latest remote settings:', fetchError)
      }
    } catch (error) {
      console.error('❌ Failed to sync settings:', error)
    }
  }

  async syncProfile(userId: string, profile: {
    username?: string
    displayName?: string
    bio?: string
    profilePublic?: boolean
  }): Promise<void> {
    if (!this.isOnline) {
      return
    }

    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: userId,
          username: profile.username || null,
          display_name: profile.displayName || null,
          bio: profile.bio || null,
          profile_public: profile.profilePublic || false
        })

      if (error) {
        console.error('Failed to sync profile:', error)
      }
    } catch (error) {
      console.error('Failed to sync profile:', error)
    }
  }

  getConnectionStatus(): boolean {
    return this.isOnline
  }

  isSyncing(): boolean {
    return this.syncInProgress
  }
}

export const syncService = new SyncService()
