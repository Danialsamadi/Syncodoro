import { supabase } from './supabase'
import { dbHelpers } from './dbHelpers'
import { sanitizeSoundType, type SoundType } from '../utils/soundValidation'

/**
 * Simplified and robust settings sync service
 * Handles synchronization of user settings between local IndexedDB and Supabase
 */
export class SettingsSyncService {
  /**
   * Main sync method - handles all settings sync scenarios
   */
  static async syncUserSettings(userId: string): Promise<void> {
    try {
      console.log('🔄 Syncing settings for user:', userId)
      
      // Get local and remote settings in parallel
      const [localSettings, { data: remoteSettings, error: remoteError }] = await Promise.all([
        dbHelpers.getSettings(userId),
        supabase
          .from('user_settings')
          .select('*')
          .eq('user_id', userId)
          .single()
      ])
      
      console.log('Settings sync status:', { 
        hasLocal: !!localSettings, 
        hasRemote: !!remoteSettings, 
        remoteError: remoteError?.code 
      })
      
      // Scenario 1: No local settings, but remote settings exist
      if (!localSettings && remoteSettings) {
        console.log('📥 Downloading settings from server')
        const sanitizedSettings = this.sanitizeRemoteSettings(remoteSettings)
        await dbHelpers.updateSettings(sanitizedSettings, userId)
        console.log('✅ Local settings created from remote data')
        return
      }
      
      // Scenario 2: No settings anywhere - create defaults
      if (!localSettings && (!remoteSettings || remoteError?.code === 'PGRST116')) {
        console.log('⚠️ No settings found. Creating defaults...')
        const defaultSettings = this.getDefaultSettings()
        
        // Create locally first
        await dbHelpers.updateSettings(defaultSettings, userId)
        
        // Then upload to server
        await this.uploadSettingsToServer(userId, defaultSettings)
        console.log('✅ Default settings created and synced')
        return
      }
      
      // Scenario 3: Local settings exist - ensure they're synced to server
      if (localSettings) {
        console.log('📤 Uploading local settings to server')
        
        // Validate local settings before upload
        const validatedSettings = this.validateLocalSettings(localSettings)
        
        // Upload to server
        await this.uploadSettingsToServer(userId, validatedSettings)
        
        // Update local settings with validated values if they changed
        if (JSON.stringify(validatedSettings) !== JSON.stringify(localSettings)) {
          await dbHelpers.updateSettings(validatedSettings, userId)
          console.log('📝 Local settings updated with validated values')
        }
        
        console.log('✅ Settings synced to server successfully')
      }
      
    } catch (error) {
      console.error('❌ Settings sync failed:', error)
      throw error
    }
  }

  /**
   * Sanitize remote settings from Supabase format to local format
   */
  private static sanitizeRemoteSettings(remoteSettings: any) {
    return {
      pomodoroLength: Math.max(1, Math.min(120, remoteSettings.pomodoro_length || 25)),
      shortBreakLength: Math.max(1, Math.min(60, remoteSettings.short_break_length || 5)),
      longBreakLength: Math.max(1, Math.min(120, remoteSettings.long_break_length || 15)),
      sessionsUntilLongBreak: Math.max(1, Math.min(10, remoteSettings.sessions_until_long_break || 4)),
      autoStartBreaks: Boolean(remoteSettings.auto_start_breaks),
      autoStartPomodoros: Boolean(remoteSettings.auto_start_pomodoros),
      soundEnabled: remoteSettings.sound_enabled !== false, // Default to true
      soundType: sanitizeSoundType(remoteSettings.sound_type),
      notificationsEnabled: remoteSettings.notifications_enabled !== false // Default to true
    }
  }

  /**
   * Get default settings
   */
  private static getDefaultSettings() {
    return {
      pomodoroLength: 25,
      shortBreakLength: 5,
      longBreakLength: 15,
      sessionsUntilLongBreak: 4,
      autoStartBreaks: false,
      autoStartPomodoros: false,
      soundEnabled: true,
      soundType: 'beep' as SoundType,
      notificationsEnabled: true
    }
  }

  /**
   * Validate and sanitize local settings
   */
  private static validateLocalSettings(settings: any) {
    return {
      pomodoroLength: Math.max(1, Math.min(120, settings.pomodoroLength || 25)),
      shortBreakLength: Math.max(1, Math.min(60, settings.shortBreakLength || 5)),
      longBreakLength: Math.max(1, Math.min(120, settings.longBreakLength || 15)),
      sessionsUntilLongBreak: Math.max(1, Math.min(10, settings.sessionsUntilLongBreak || 4)),
      autoStartBreaks: Boolean(settings.autoStartBreaks),
      autoStartPomodoros: Boolean(settings.autoStartPomodoros),
      soundEnabled: Boolean(settings.soundEnabled ?? true),
      soundType: sanitizeSoundType(settings.soundType),
      notificationsEnabled: Boolean(settings.notificationsEnabled ?? true)
    }
  }

  /**
   * Upload settings to Supabase server
   */
  private static async uploadSettingsToServer(userId: string, settings: any): Promise<void> {
    const settingsData = {
      user_id: userId,
      pomodoro_length: settings.pomodoroLength,
      short_break_length: settings.shortBreakLength,
      long_break_length: settings.longBreakLength,
      sessions_until_long_break: settings.sessionsUntilLongBreak,
      auto_start_breaks: settings.autoStartBreaks,
      auto_start_pomodoros: settings.autoStartPomodoros,
      sound_enabled: settings.soundEnabled,
      sound_type: sanitizeSoundType(settings.soundType),
      notifications_enabled: settings.notificationsEnabled
    }

    console.log('📤 Uploading settings to server:', settingsData)

    const { error } = await supabase
      .from('user_settings')
      .upsert(settingsData, { onConflict: 'user_id' })

    if (error) {
      console.error('❌ Failed to upload settings to server:', error)
      throw new Error(`Settings upload failed: ${error.message}`)
    }

    console.log('✅ Settings uploaded to server successfully')
  }

  /**
   * Force download settings from server (useful for debugging)
   */
  static async forceDownloadSettings(userId: string): Promise<void> {
    console.log('🔄 Force downloading settings from server...')
    
    const { data: remoteSettings, error } = await supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (error) {
      console.error('❌ Failed to download settings:', error)
      throw error
    }

    if (remoteSettings) {
      const sanitizedSettings = this.sanitizeRemoteSettings(remoteSettings)
      await dbHelpers.updateSettings(sanitizedSettings, userId)
      console.log('✅ Settings force downloaded and updated locally')
    } else {
      console.log('⚠️ No remote settings found to download')
    }
  }

  /**
   * Force upload local settings to server (useful for debugging)
   */
  static async forceUploadSettings(userId: string): Promise<void> {
    console.log('🔄 Force uploading local settings to server...')
    
    const localSettings = await dbHelpers.getSettings(userId)
    
    if (!localSettings) {
      console.log('⚠️ No local settings found to upload')
      return
    }

    const validatedSettings = this.validateLocalSettings(localSettings)
    await this.uploadSettingsToServer(userId, validatedSettings)
    
    console.log('✅ Settings force uploaded to server')
  }
}

// Export for backward compatibility
export const settingsSyncService = SettingsSyncService
