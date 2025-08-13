import { supabase } from './supabase'
import { dbHelpers } from './dbHelpers'
import { SettingsSyncService } from './settingsSyncService'
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
      await SettingsSyncService.syncUserSettings(userId)
    } catch (error) {
      console.error('❌ Settings sync failed:', error)
      throw error
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
