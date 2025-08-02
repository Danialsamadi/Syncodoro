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

  async syncData(userId?: string): Promise<void> {
    if (!this.isOnline || this.syncInProgress || !userId) {
      return
    }

    this.syncInProgress = true

    try {
      // Sync sessions
      await this.syncSessions(userId)
      
      // Sync tags
      await this.syncTags(userId)
      
      // Sync settings
      await this.syncSettings(userId)
      
      console.log('✅ Data sync completed successfully')
      console.log(`📊 Synced sessions, tags, and settings for user: ${userId}`)
    } catch (error) {
      console.error('Sync failed:', error)
    } finally {
      this.syncInProgress = false
    }
  }

  private async syncSessions(userId: string): Promise<void> {
    // Upload unsynced local sessions
    const unsyncedSessions = await dbHelpers.getUnsyncedSessions(userId)
    
    for (const session of unsyncedSessions) {
      try {
        const { error } = await supabase
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

        if (!error && session.id) {
          await dbHelpers.markSessionsSynced([session.id])
        }
      } catch (error) {
        console.error('Failed to sync session:', error)
      }
    }

    // Download new sessions from server
    try {
      const lastSyncedSession = await dbHelpers.getRecentSessions(1, userId)
      const lastSyncTime = lastSyncedSession[0]?.updatedAt || new Date(0)

      const { data: remoteSessions, error } = await supabase
        .from('sessions')
        .select('*')
        .eq('user_id', userId)
        .gt('updated_at', lastSyncTime.toISOString())

      if (!error && remoteSessions) {
        for (const remoteSession of remoteSessions) {
          await dbHelpers.addSession({
            userId,
            startTime: new Date(remoteSession.start_time),
            endTime: remoteSession.end_time ? new Date(remoteSession.end_time) : undefined,
            duration: remoteSession.duration,
            type: remoteSession.type,
            tags: remoteSession.tags,
            completed: remoteSession.completed,
            notes: remoteSession.notes || undefined,
            synced: true
          })
        }
      }
    } catch (error) {
      console.error('Failed to download sessions:', error)
    }
  }

  private async syncTags(userId: string): Promise<void> {
    // Upload unsynced local tags
    const unsyncedTags = await dbHelpers.getUnsyncedTags(userId)
    
    for (const tag of unsyncedTags) {
      try {
        const { error } = await supabase
          .from('tags')
          .insert({
            user_id: userId,
            name: tag.name,
            color: tag.color
          })

        if (!error && tag.id) {
          await dbHelpers.markTagsSynced([tag.id])
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
      const localSettings = await dbHelpers.getSettings(userId)
      
      if (localSettings) {
        // Upload local settings
        const { error } = await supabase
          .from('user_settings')
          .upsert({
            user_id: userId,
            pomodoro_length: localSettings.pomodoroLength,
            short_break_length: localSettings.shortBreakLength,
            long_break_length: localSettings.longBreakLength,
            sessions_until_long_break: localSettings.sessionsUntilLongBreak,
            auto_start_breaks: localSettings.autoStartBreaks,
            auto_start_pomodoros: localSettings.autoStartPomodoros,
            sound_enabled: localSettings.soundEnabled,
            notifications_enabled: localSettings.notificationsEnabled
          })

        if (error) {
          console.error('Failed to sync settings:', error)
        }
      }

      // Download settings from server
      const { data: remoteSettings, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (!error && remoteSettings) {
        await dbHelpers.updateSettings({
          pomodoroLength: remoteSettings.pomodoro_length,
          shortBreakLength: remoteSettings.short_break_length,
          longBreakLength: remoteSettings.long_break_length,
          sessionsUntilLongBreak: remoteSettings.sessions_until_long_break,
          autoStartBreaks: remoteSettings.auto_start_breaks,
          autoStartPomodoros: remoteSettings.auto_start_pomodoros,
          soundEnabled: remoteSettings.sound_enabled,
          notificationsEnabled: remoteSettings.notifications_enabled
        }, userId)
      }
    } catch (error) {
      console.error('Failed to sync settings:', error)
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
