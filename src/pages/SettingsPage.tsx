import { useState, useEffect } from 'react'
import { useTimer } from '../contexts/TimerContext'
import { useAuth } from '../contexts/AuthContext'
import { Save, Bell, Volume2, VolumeX } from 'lucide-react'
import toast from 'react-hot-toast'

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
        </div>
      </div>

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
