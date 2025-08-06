import { useState, useEffect } from 'react'
import { useTimer } from '../contexts/TimerContext'
import { useAuth } from '../contexts/AuthContext'
import { Save, Bell, Volume2, VolumeX, Download, Smartphone, Wifi, WifiOff, HardDrive } from 'lucide-react'
import toast from 'react-hot-toast'
import { usePWAInstall, useOfflineStatus } from '../components/OfflineIndicator'
import { pwaManager, PWAManager } from '../utils/pwa'
import { offlineSyncService } from '../services/offlineSync'

export default function SettingsPage() {
  const { settings, updateSettings } = useTimer()
  const { user } = useAuth()
  const [localSettings, setLocalSettings] = useState(settings)
  const [hasChanges, setHasChanges] = useState(false)

  useEffect(() => {
    setLocalSettings(settings)
  }, [settings])

  useEffect(() => {
    const hasChanges = JSON.stringify(localSettings) !== JSON.stringify(settings)
    setHasChanges(hasChanges)
  }, [localSettings, settings])

  const handleSettingChange = (key: keyof typeof settings, value: any) => {
    setLocalSettings(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const handleSave = async () => {
    try {
      await updateSettings(localSettings)
      toast.success('Settings saved successfully!')
      setHasChanges(false)
    } catch (error) {
      toast.error('Failed to save settings')
      console.error('Failed to save settings:', error)
    }
  }

  const handleReset = () => {
    setLocalSettings(settings)
    setHasChanges(false)
  }

  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission()
      if (permission === 'granted') {
        handleSettingChange('notificationsEnabled', true)
        toast.success('Notifications enabled!')
      } else {
        toast.error('Notification permission denied')
      }
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        
        {hasChanges && (
          <div className="flex space-x-2">
            <button
              onClick={handleReset}
              className="btn-secondary"
            >
              Reset
            </button>
            <button
              onClick={handleSave}
              className="btn-primary flex items-center space-x-2"
            >
              <Save className="w-4 h-4" />
              <span>Save Changes</span>
            </button>
          </div>
        )}
      </div>

      {/* Timer Settings */}
      <div className="card">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Timer Settings</h2>
        
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Pomodoro Length (minutes)
              </label>
              <input
                type="number"
                min="1"
                max="60"
                value={localSettings.pomodoroLength}
                onChange={(e) => handleSettingChange('pomodoroLength', parseInt(e.target.value))}
                className="input-field"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Short Break (minutes)
              </label>
              <input
                type="number"
                min="1"
                max="30"
                value={localSettings.shortBreakLength}
                onChange={(e) => handleSettingChange('shortBreakLength', parseInt(e.target.value))}
                className="input-field"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Long Break (minutes)
              </label>
              <input
                type="number"
                min="1"
                max="60"
                value={localSettings.longBreakLength}
                onChange={(e) => handleSettingChange('longBreakLength', parseInt(e.target.value))}
                className="input-field"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sessions until Long Break
            </label>
            <input
              type="number"
              min="2"
              max="10"
              value={localSettings.sessionsUntilLongBreak}
              onChange={(e) => handleSettingChange('sessionsUntilLongBreak', parseInt(e.target.value))}
              className="input-field max-w-xs"
            />
          </div>
        </div>
      </div>

      {/* Auto-start Settings */}
      <div className="card">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Auto-start Settings</h2>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-900">Auto-start Breaks</h3>
              <p className="text-sm text-gray-600">Automatically start break timers</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={localSettings.autoStartBreaks}
                onChange={(e) => handleSettingChange('autoStartBreaks', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-900">Auto-start Pomodoros</h3>
              <p className="text-sm text-gray-600">Automatically start focus timers after breaks</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={localSettings.autoStartPomodoros}
                onChange={(e) => handleSettingChange('autoStartPomodoros', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Notifications & Sound */}
      <div className="card">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Notifications & Sound</h2>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Bell className="w-5 h-5 text-gray-600" />
              <div>
                <h3 className="text-sm font-medium text-gray-900">Browser Notifications</h3>
                <p className="text-sm text-gray-600">Get notified when timers complete</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {!('Notification' in window) ? (
                <span className="text-sm text-gray-500">Not supported</span>
              ) : Notification.permission === 'denied' ? (
                <span className="text-sm text-red-500">Blocked</span>
              ) : Notification.permission === 'default' ? (
                <button
                  onClick={requestNotificationPermission}
                  className="btn-outline text-sm"
                >
                  Enable
                </button>
              ) : (
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={localSettings.notificationsEnabled}
                    onChange={(e) => handleSettingChange('notificationsEnabled', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                </label>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {localSettings.soundEnabled ? (
                <Volume2 className="w-5 h-5 text-gray-600" />
              ) : (
                <VolumeX className="w-5 h-5 text-gray-600" />
              )}
              <div>
                <h3 className="text-sm font-medium text-gray-900">Sound Alerts</h3>
                <p className="text-sm text-gray-600">Play sound when timers complete</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={localSettings.soundEnabled}
                onChange={(e) => handleSettingChange('soundEnabled', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
            </label>
          </div>

          {/* Sound Type Selection */}
          {localSettings.soundEnabled && (
            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
              <div className="flex items-center space-x-3">
                <Volume2 className="w-5 h-5 text-gray-600" />
                <div>
                  <h3 className="text-sm font-medium text-gray-900">Sound Type</h3>
                  <p className="text-sm text-gray-600">Choose your notification sound</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <select
                  value={(localSettings as any).soundType || 'beep'}
                  onChange={(e) => handleSettingChange('soundType', e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="beep">Beep</option>
                  <option value="chime">Chime</option>
                  <option value="bell">Bell</option>
                  <option value="notification">Notification</option>
                  <option value="success">Success</option>
                </select>
                <button
                  onClick={() => {
                    // Test the selected sound
                    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
                    const soundType = (localSettings as any).soundType || 'beep'
                    
                    const playTestSound = (type: string) => {
                      switch (type) {
                        case 'beep':
                          const osc = audioContext.createOscillator()
                          const gain = audioContext.createGain()
                          osc.connect(gain)
                          gain.connect(audioContext.destination)
                          osc.frequency.value = 800
                          osc.type = 'sine'
                          gain.gain.setValueAtTime(0.3, audioContext.currentTime)
                          gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5)
                          osc.start(audioContext.currentTime)
                          osc.stop(audioContext.currentTime + 0.5)
                          break
                        case 'chime':
                          [523.25, 659.25, 783.99].forEach((freq, index) => {
                            const osc = audioContext.createOscillator()
                            const gain = audioContext.createGain()
                            osc.connect(gain)
                            gain.connect(audioContext.destination)
                            osc.frequency.value = freq
                            osc.type = 'sine'
                            const startTime = audioContext.currentTime + (index * 0.2)
                            gain.gain.setValueAtTime(0.2, startTime)
                            gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.8)
                            osc.start(startTime)
                            osc.stop(startTime + 0.8)
                          })
                          break
                        case 'bell':
                          const osc2 = audioContext.createOscillator()
                          const gain2 = audioContext.createGain()
                          osc2.connect(gain2)
                          gain2.connect(audioContext.destination)
                          osc2.frequency.value = 1000
                          osc2.type = 'triangle'
                          gain2.gain.setValueAtTime(0.4, audioContext.currentTime)
                          gain2.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 1.5)
                          osc2.start(audioContext.currentTime)
                          osc2.stop(audioContext.currentTime + 1.5)
                          break
                        case 'notification':
                          [440, 554.37].forEach((freq, index) => {
                            const osc = audioContext.createOscillator()
                            const gain = audioContext.createGain()
                            osc.connect(gain)
                            gain.connect(audioContext.destination)
                            osc.frequency.value = freq
                            osc.type = 'square'
                            const startTime = audioContext.currentTime + (index * 0.15)
                            gain.gain.setValueAtTime(0.15, startTime)
                            gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.3)
                            osc.start(startTime)
                            osc.stop(startTime + 0.3)
                          })
                          break
                        case 'success':
                          [261.63, 329.63, 392.00, 523.25].forEach((freq, index) => {
                            const osc = audioContext.createOscillator()
                            const gain = audioContext.createGain()
                            osc.connect(gain)
                            gain.connect(audioContext.destination)
                            osc.frequency.value = freq
                            osc.type = 'sine'
                            const startTime = audioContext.currentTime + (index * 0.1)
                            gain.gain.setValueAtTime(0.2, startTime)
                            gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.4)
                            osc.start(startTime)
                            osc.stop(startTime + 0.4)
                          })
                          break
                      }
                    }
                    
                    playTestSound(soundType)
                  }}
                  className="px-3 py-2 bg-primary-500 text-white rounded-lg text-sm hover:bg-primary-600 transition-colors"
                >
                  Test
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* PWA & Offline Settings */}
      <PWASettings />

      {/* Account Settings */}
      {user && (
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Account</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <p className="text-sm text-gray-900">{user.email}</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Account Created
              </label>
              <p className="text-sm text-gray-900">
                {new Date(user.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Save Button for Mobile */}
      {hasChanges && (
        <div className="md:hidden">
          <button
            onClick={handleSave}
            className="w-full btn-primary flex items-center justify-center space-x-2"
          >
            <Save className="w-4 h-4" />
            <span>Save Changes</span>
          </button>
        </div>
      )}
    </div>
  )
}

// PWA Settings Component
function PWASettings() {
  const { isInstallable, installPWA } = usePWAInstall()
  const isOnline = useOfflineStatus()
  const [cacheInfo, setCacheInfo] = useState<{ size: string; entries: number } | null>(null)
  const [syncStatus, setSyncStatus] = useState(offlineSyncService.getSyncStatus())

  useEffect(() => {
    // Load cache info
    pwaManager.getCacheSize().then(({ size, entries }) => {
      setCacheInfo({
        size: PWAManager.formatCacheSize(size),
        entries
      })
    })

    // Subscribe to sync status updates
    const unsubscribe = offlineSyncService.onSyncStatusChange(() => {
      setSyncStatus(offlineSyncService.getSyncStatus())
    })

    return unsubscribe
  }, [])

  const handleInstallPWA = async () => {
    const success = await installPWA()
    if (success) {
      toast.success('App installed successfully!')
    }
  }

  const handleForceSync = async () => {
    try {
      await offlineSyncService.forcSync()
      toast.success('Sync completed!')
    } catch (error) {
      toast.error('Sync failed. Check your connection.')
    }
  }

  const handleClearCache = async () => {
    try {
      await pwaManager.clearOldCaches()
      toast.success('Cache cleared successfully!')
      // Reload cache info
      const { size, entries } = await pwaManager.getCacheSize()
      setCacheInfo({
        size: PWAManager.formatCacheSize(size),
        entries
      })
    } catch (error) {
      toast.error('Failed to clear cache')
    }
  }

  return (
    <div className="card">
      <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center space-x-2">
        <Smartphone className="w-5 h-5" />
        <span>App & Offline</span>
      </h2>
      
      <div className="space-y-6">
        {/* Connection Status */}
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-3">
            {isOnline ? (
              <Wifi className="w-5 h-5 text-green-500" />
            ) : (
              <WifiOff className="w-5 h-5 text-orange-500" />
            )}
            <div>
              <p className="font-medium text-gray-900">
                {isOnline ? 'Online' : 'Offline'}
              </p>
              <p className="text-sm text-gray-500">
                {isOnline ? 'Connected to internet' : 'Working offline'}
              </p>
            </div>
          </div>
        </div>

        {/* PWA Installation */}
        {isInstallable && (
          <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <Download className="w-5 h-5 text-blue-500" />
              <div>
                <p className="font-medium text-gray-900">Install App</p>
                <p className="text-sm text-gray-500">
                  Install Syncodoro for a better experience
                </p>
              </div>
            </div>
            <button
              onClick={handleInstallPWA}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600 transition-colors"
            >
              Install
            </button>
          </div>
        )}

        {/* Sync Status */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-gray-900">Data Sync</h3>
            <button
              onClick={handleForceSync}
              disabled={!isOnline || syncStatus.isSyncing}
              className="px-3 py-1 bg-primary-500 text-white rounded text-sm hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {syncStatus.isSyncing ? 'Syncing...' : 'Sync Now'}
            </button>
          </div>
          
          <div className="text-sm text-gray-600">
            {syncStatus.queueLength > 0 ? (
              <p>{syncStatus.queueLength} items pending sync</p>
            ) : (
              <p>All data synced</p>
            )}
            {syncStatus.lastSync && (
              <p>Last sync: {new Date(syncStatus.lastSync).toLocaleString()}</p>
            )}
          </div>
        </div>

        {/* Cache Info */}
        {cacheInfo && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-gray-900 flex items-center space-x-2">
                <HardDrive className="w-4 h-4" />
                <span>Offline Storage</span>
              </h3>
              <button
                onClick={handleClearCache}
                className="px-3 py-1 bg-gray-500 text-white rounded text-sm hover:bg-gray-600 transition-colors"
              >
                Clear Cache
              </button>
            </div>
            
            <div className="text-sm text-gray-600">
              <p>{cacheInfo.entries} cached files</p>
              <p>Using {cacheInfo.size} of storage</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
