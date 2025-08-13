import { dbHelpers } from '../services/dbHelpers'
import { SettingsSyncService } from '../services/settingsSyncService'
import { supabase } from '../services/supabase'

/**
 * Debug utilities for testing settings sync
 */
export class SettingsDebugUtils {
  /**
   * Get current user settings from both local and remote sources
   */
  static async getSettingsStatus(userId: string) {
    try {
      console.log('🔍 Checking settings status for user:', userId)
      
      // Get local settings
      const localSettings = await dbHelpers.getSettings(userId)
      
      // Get remote settings
      const { data: remoteSettings, error: remoteError } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', userId)
        .single()
      
      const status = {
        userId,
        timestamp: new Date().toISOString(),
        local: {
          exists: !!localSettings,
          settings: localSettings,
        },
        remote: {
          exists: !!remoteSettings,
          error: remoteError?.message,
          settings: remoteSettings,
        },
        soundTypeComparison: {
          local: localSettings?.soundType,
          remote: remoteSettings?.sound_type,
          match: localSettings?.soundType === remoteSettings?.sound_type
        }
      }
      
      console.table([
        {
          Source: 'Local',
          Exists: status.local.exists ? '✅' : '❌',
          SoundType: status.local.settings?.soundType || 'N/A',
          SoundEnabled: status.local.settings?.soundEnabled ? '✅' : '❌',
          NotificationsEnabled: status.local.settings?.notificationsEnabled ? '✅' : '❌'
        },
        {
          Source: 'Remote',
          Exists: status.remote.exists ? '✅' : '❌',
          SoundType: status.remote.settings?.sound_type || 'N/A',
          SoundEnabled: status.remote.settings?.sound_enabled ? '✅' : '❌',
          NotificationsEnabled: status.remote.settings?.notifications_enabled ? '✅' : '❌'
        }
      ])
      
      if (status.soundTypeComparison.local !== status.soundTypeComparison.remote) {
        console.warn('⚠️ Sound type mismatch detected!')
        console.log('Local:', status.soundTypeComparison.local)
        console.log('Remote:', status.soundTypeComparison.remote)
      } else {
        console.log('✅ Sound types match between local and remote')
      }
      
      return status
    } catch (error) {
      console.error('❌ Error checking settings status:', error)
      return null
    }
  }

  /**
   * Force sync settings and show before/after comparison
   */
  static async testSettingsSync(userId: string) {
    console.log('🧪 Testing settings sync for user:', userId)
    
    // Get status before sync
    console.log('--- BEFORE SYNC ---')
    const beforeSync = await this.getSettingsStatus(userId)
    
    try {
      // Perform sync
      console.log('--- PERFORMING SYNC ---')
      await SettingsSyncService.syncUserSettings(userId)
      
      // Get status after sync
      console.log('--- AFTER SYNC ---')
      const afterSync = await this.getSettingsStatus(userId)
      
      // Compare results
      console.log('--- SYNC RESULTS ---')
      if (beforeSync && afterSync) {
        const changes = {
          localSoundTypeChanged: beforeSync.local.settings?.soundType !== afterSync.local.settings?.soundType,
          remoteSoundTypeChanged: beforeSync.remote.settings?.sound_type !== afterSync.remote.settings?.sound_type,
          syncFixed: !beforeSync.soundTypeComparison.match && afterSync.soundTypeComparison.match
        }
        
        if (changes.syncFixed) {
          console.log('🎉 Sync fixed the sound type mismatch!')
        } else if (afterSync.soundTypeComparison.match) {
          console.log('✅ Sound types are already in sync')
        } else {
          console.warn('⚠️ Sound types still not in sync after sync operation')
        }
        
        return { beforeSync, afterSync, changes }
      }
    } catch (error) {
      console.error('❌ Sync test failed:', error)
      throw error
    }
  }

  /**
   * Simulate sound type change and test sync
   */
  static async testSoundTypeChange(userId: string, newSoundType: 'beep' | 'chime' | 'bell' | 'notification' | 'success') {
    console.log(`🔄 Testing sound type change to: ${newSoundType}`)
    
    try {
      // Get current settings
      const currentSettings = await dbHelpers.getSettings(userId)
      if (!currentSettings) {
        throw new Error('No local settings found')
      }
      
      // Update sound type locally
      await dbHelpers.updateSettings({
        ...currentSettings,
        soundType: newSoundType
      }, userId)
      
      console.log(`📝 Updated local sound type to: ${newSoundType}`)
      
      // Test sync
      return await this.testSettingsSync(userId)
      
    } catch (error) {
      console.error('❌ Sound type change test failed:', error)
      throw error
    }
  }

  /**
   * Reset settings to defaults and test sync
   */
  static async resetAndTestSync(userId: string) {
    console.log('🔄 Resetting settings to defaults and testing sync...')
    
    try {
      // Delete local settings
      await dbHelpers.clearUserData(userId)
      
      // Delete remote settings
      await supabase
        .from('user_settings')
        .delete()
        .eq('user_id', userId)
      
      console.log('🗑️ Cleared both local and remote settings')
      
      // Test sync (should create defaults)
      return await this.testSettingsSync(userId)
      
    } catch (error) {
      console.error('❌ Reset and sync test failed:', error)
      throw error
    }
  }
}

// Add to window for easy debugging in browser console
if (typeof window !== 'undefined') {
  (window as any).SettingsDebug = SettingsDebugUtils
}
