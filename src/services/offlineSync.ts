import { supabase } from './supabase'
import { PomodoroSession, UserSettings } from './database'

export interface SyncQueueItem {
  id: string
  type: 'session' | 'settings' | 'profile'
  action: 'create' | 'update' | 'delete'
  data: any
  timestamp: number
  retries: number
}

export class OfflineSyncService {
  private static instance: OfflineSyncService
  private syncQueue: SyncQueueItem[] = []
  private isSyncing = false
  private maxRetries = 3
  private syncCallbacks: Array<(status: SyncStatus) => void> = []

  static getInstance(): OfflineSyncService {
    if (!OfflineSyncService.instance) {
      OfflineSyncService.instance = new OfflineSyncService()
    }
    return OfflineSyncService.instance
  }

  constructor() {
    this.loadSyncQueue()
    this.setupNetworkListeners()
  }

  private setupNetworkListeners(): void {
    window.addEventListener('online', () => {
      console.log('Network back online, starting sync...')
      this.syncWhenOnline()
    })

    // Auto-sync every 5 minutes when online
    setInterval(() => {
      if (navigator.onLine && !this.isSyncing) {
        this.syncWhenOnline()
      }
    }, 5 * 60 * 1000)
  }

  private async loadSyncQueue(): Promise<void> {
    try {
      const stored = localStorage.getItem('syncQueue')
      if (stored) {
        this.syncQueue = JSON.parse(stored)
      }
    } catch (error) {
      console.error('Failed to load sync queue:', error)
      this.syncQueue = []
    }
  }

  private saveSyncQueue(): void {
    try {
      localStorage.setItem('syncQueue', JSON.stringify(this.syncQueue))
    } catch (error) {
      console.error('Failed to save sync queue:', error)
    }
  }

  // Add item to sync queue
  addToQueue(item: Omit<SyncQueueItem, 'id' | 'timestamp' | 'retries'>): void {
    const queueItem: SyncQueueItem = {
      ...item,
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      retries: 0
    }

    this.syncQueue.push(queueItem)
    this.saveSyncQueue()

    // Try to sync immediately if online
    if (navigator.onLine) {
      this.syncWhenOnline()
    }
  }

  // Sync when network is available
  async syncWhenOnline(): Promise<void> {
    if (!navigator.onLine || this.isSyncing || this.syncQueue.length === 0) {
      return
    }

    this.isSyncing = true
    this.notifySync({ status: 'syncing', progress: 0, total: this.syncQueue.length })

    try {
      const results = await this.processSyncQueue()
      const successful = results.filter(r => r.success).length
      const failed = results.filter(r => !r.success).length

      this.notifySync({
        status: 'completed',
        progress: successful,
        total: this.syncQueue.length,
        successful,
        failed
      })

      // Remove successful items from queue
      this.syncQueue = this.syncQueue.filter((_, index) => !results[index]?.success)
      this.saveSyncQueue()

    } catch (error) {
      console.error('Sync failed:', error)
      this.notifySync({ status: 'error', error: error as Error })
    } finally {
      this.isSyncing = false
    }
  }

  private async processSyncQueue(): Promise<Array<{ success: boolean; error?: Error }>> {
    const results: Array<{ success: boolean; error?: Error }> = []
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      throw new Error('User not authenticated')
    }

    for (let i = 0; i < this.syncQueue.length; i++) {
      const item = this.syncQueue[i]
      
      try {
        await this.syncItem(item, user.id)
        results.push({ success: true })
        
        this.notifySync({
          status: 'syncing',
          progress: i + 1,
          total: this.syncQueue.length
        })
      } catch (error) {
        console.error(`Failed to sync item ${item.id}:`, error)
        
        // Increment retry count
        item.retries++
        
        if (item.retries >= this.maxRetries) {
          console.error(`Max retries reached for item ${item.id}, removing from queue`)
          results.push({ success: true }) // Remove from queue
        } else {
          results.push({ success: false, error: error as Error })
        }
      }
    }

    return results
  }

  private async syncItem(item: SyncQueueItem, userId: string): Promise<void> {
    switch (item.type) {
      case 'session':
        await this.syncSession(item, userId)
        break
      case 'settings':
        await this.syncSettings(item, userId)
        break
      case 'profile':
        await this.syncProfile(item, userId)
        break
      default:
        throw new Error(`Unknown sync type: ${item.type}`)
    }
  }

  private async syncSession(item: SyncQueueItem, userId: string): Promise<void> {
    const session: PomodoroSession = item.data

    switch (item.action) {
      case 'create':
        const { error: insertError } = await supabase
          .from('pomodoro_sessions')
          .insert({
            id: session.id,
            user_id: userId,
            start_time: session.startTime.toISOString(),
            end_time: session.endTime?.toISOString(),
            duration: session.duration,
            type: session.type,
            completed: session.completed,
            tags: session.tags,
            notes: session.notes
          })
        
        if (insertError) throw insertError
        break

      case 'update':
        const { error: updateError } = await supabase
          .from('pomodoro_sessions')
          .update({
            end_time: session.endTime?.toISOString(),
            duration: session.duration,
            completed: session.completed,
            tags: session.tags,
            notes: session.notes
          })
          .eq('id', session.id)
          .eq('user_id', userId)
        
        if (updateError) throw updateError
        break

      case 'delete':
        const { error: deleteError } = await supabase
          .from('pomodoro_sessions')
          .delete()
          .eq('id', session.id)
          .eq('user_id', userId)
        
        if (deleteError) throw deleteError
        break
    }
  }

  private async syncSettings(item: SyncQueueItem, userId: string): Promise<void> {
    const settings: UserSettings = item.data

    const { error } = await supabase
      .from('user_settings')
      .upsert({
        user_id: userId,
        pomodoro_length: settings.pomodoroLength,
        short_break_length: settings.shortBreakLength,
        long_break_length: settings.longBreakLength,
        sessions_until_long_break: settings.sessionsUntilLongBreak,
        auto_start_breaks: settings.autoStartBreaks,
        auto_start_pomodoros: settings.autoStartPomodoros,
        sound_enabled: settings.soundEnabled,
        sound_type: settings.soundType,
        notifications_enabled: settings.notificationsEnabled,
        username: settings.username,
        display_name: settings.displayName,
        bio: settings.bio,
        profile_public: settings.profilePublic
      })

    if (error) throw error
  }

  private async syncProfile(item: SyncQueueItem, userId: string): Promise<void> {
    const profile = item.data

    const { error } = await supabase
      .from('profiles')
      .upsert({
        id: userId,
        username: profile.username,
        display_name: profile.displayName,
        bio: profile.bio,
        profile_public: profile.profilePublic,
        updated_at: new Date().toISOString()
      })

    if (error) throw error
  }

  // Get sync status
  getSyncStatus(): {
    queueLength: number
    isSyncing: boolean
    lastSync?: number
  } {
    return {
      queueLength: this.syncQueue.length,
      isSyncing: this.isSyncing,
      lastSync: this.getLastSyncTime()
    }
  }

  private getLastSyncTime(): number | undefined {
    const lastSync = localStorage.getItem('lastSyncTime')
    return lastSync ? parseInt(lastSync) : undefined
  }

  private setLastSyncTime(): void {
    localStorage.setItem('lastSyncTime', Date.now().toString())
  }

  // Subscribe to sync status updates
  onSyncStatusChange(callback: (status: SyncStatus) => void): () => void {
    this.syncCallbacks.push(callback)
    
    return () => {
      const index = this.syncCallbacks.indexOf(callback)
      if (index > -1) {
        this.syncCallbacks.splice(index, 1)
      }
    }
  }

  private notifySync(status: SyncStatus): void {
    if (status.status === 'completed') {
      this.setLastSyncTime()
    }
    
    this.syncCallbacks.forEach(callback => callback(status))
  }

  // Manual sync trigger
  async forcSync(): Promise<void> {
    if (navigator.onLine) {
      await this.syncWhenOnline()
    } else {
      throw new Error('Cannot sync while offline')
    }
  }

  // Clear sync queue (for testing/debugging)
  clearQueue(): void {
    this.syncQueue = []
    this.saveSyncQueue()
  }
}

export interface SyncStatus {
  status: 'syncing' | 'completed' | 'error' | 'idle'
  progress?: number
  total?: number
  successful?: number
  failed?: number
  error?: Error
}

// Export singleton instance
export const offlineSyncService = OfflineSyncService.getInstance()
