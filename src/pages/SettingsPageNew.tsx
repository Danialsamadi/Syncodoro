import { useState, useEffect } from 'react'
import { useTimer } from '../contexts/TimerContext'
import { useAuth } from '../contexts/AuthContext'
import MobileLayout from '../components/MobileLayout'
import { 
  Clock, 
  Volume2, 
  VolumeX, 
  Bell, 
  BellOff, 
  User, 
  LogOut, 
  ChevronRight,
  Download,
  Smartphone,
  Moon,
  Play
} from 'lucide-react'
import toast from 'react-hot-toast'

export default function SettingsPageNew() {
  const { settings, updateSettings } = useTimer()
  const { user, signOut } = useAuth()
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

  const SettingSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className="bg-surface-level-2 rounded-2xl border border-border-secondary overflow-hidden">
      <div className="px-6 py-4 border-b border-border-secondary">
        <h3 className="text-lg font-semibold text-text-primary">{title}</h3>
      </div>
      <div className="divide-y divide-border-secondary">
        {children}
      </div>
    </div>
  )

  const SettingItem = ({ 
    icon: Icon, 
    title, 
    subtitle, 
    children, 
    action 
  }: {
    icon: any
    title: string
    subtitle?: string
    children?: React.ReactNode
    action?: React.ReactNode
  }) => (
    <div className="flex items-center space-x-4 px-6 py-4 hover:bg-surface-level-3 transition-colors">
      <div className="p-2 bg-primary-600/10 text-primary-600 rounded-lg">
        <Icon className="w-5 h-5" />
      </div>
      <div className="flex-1">
        <div className="font-medium text-text-primary">{title}</div>
        {subtitle && (
          <div className="text-sm text-text-secondary">{subtitle}</div>
        )}
        {children}
      </div>
      {action && <div>{action}</div>}
    </div>
  )

  const Toggle = ({ checked, onChange }: { checked: boolean; onChange: (checked: boolean) => void }) => (
    <button
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
        checked ? 'bg-primary-600' : 'bg-surface-level-4'
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
          checked ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  )

  const TimeInput = ({ value, onChange, min = 1, max = 120 }: {
    value: number
    onChange: (value: number) => void
    min?: number
    max?: number
  }) => (
    <div className="flex items-center space-x-3">
      <button
        onClick={() => onChange(Math.max(min, value - 1))}
        className="w-8 h-8 rounded-full bg-surface-level-3 flex items-center justify-center text-text-primary hover:bg-surface-level-4 transition-colors"
      >
        -
      </button>
      <span className="w-12 text-center font-mono text-text-primary">{value}</span>
      <button
        onClick={() => onChange(Math.min(max, value + 1))}
        className="w-8 h-8 rounded-full bg-surface-level-3 flex items-center justify-center text-text-primary hover:bg-surface-level-4 transition-colors"
      >
        +
      </button>
    </div>
  )

  return (
    <MobileLayout title="Settings" showSettings={false}>
      <div className="px-6 pb-6 space-y-6">
        {/* Timer Settings */}
        <SettingSection title="Timer Settings">
          <SettingItem
            icon={Clock}
            title="Focus Duration"
            subtitle={`${localSettings.pomodoroLength} minutes`}
            action={
              <TimeInput
                value={localSettings.pomodoroLength}
                onChange={(value) => handleSettingChange('pomodoroLength', value)}
                min={5}
                max={60}
              />
            }
          />
          <SettingItem
            icon={Clock}
            title="Short Break"
            subtitle={`${localSettings.shortBreakLength} minutes`}
            action={
              <TimeInput
                value={localSettings.shortBreakLength}
                onChange={(value) => handleSettingChange('shortBreakLength', value)}
                min={1}
                max={30}
              />
            }
          />
          <SettingItem
            icon={Clock}
            title="Long Break"
            subtitle={`${localSettings.longBreakLength} minutes`}
            action={
              <TimeInput
                value={localSettings.longBreakLength}
                onChange={(value) => handleSettingChange('longBreakLength', value)}
                min={5}
                max={60}
              />
            }
          />
          <SettingItem
            icon={Clock}
            title="Long Break Interval"
            subtitle={`Every ${localSettings.sessionsUntilLongBreak} focus sessions`}
            action={
              <TimeInput
                value={localSettings.sessionsUntilLongBreak}
                onChange={(value) => handleSettingChange('sessionsUntilLongBreak', value)}
                min={2}
                max={10}
              />
            }
          />
        </SettingSection>

        {/* Sound & Notifications */}
        <SettingSection title="Sound & Notifications">
          <SettingItem
            icon={localSettings.soundEnabled ? Volume2 : VolumeX}
            title="Sound Effects"
            subtitle="Play sound when timer completes"
            action={
              <Toggle
                checked={localSettings.soundEnabled}
                onChange={(checked) => handleSettingChange('soundEnabled', checked)}
              />
            }
          />
          {localSettings.soundEnabled && (
            <SettingItem
              icon={Volume2}
              title="Sound Type"
              subtitle={localSettings.soundType}
            >
              <div className="mt-3">
                <select
                  value={localSettings.soundType}
                  onChange={(e) => handleSettingChange('soundType', e.target.value)}
                  className="input-field text-sm"
                >
                  <option value="beep">Beep</option>
                  <option value="chime">Chime</option>
                  <option value="bell">Bell</option>
                  <option value="notification">Notification</option>
                  <option value="success">Success</option>
                </select>
              </div>
            </SettingItem>
          )}
          <SettingItem
            icon={localSettings.notificationsEnabled ? Bell : BellOff}
            title="Push Notifications"
            subtitle="Get notified when timer completes"
            action={
              <Toggle
                checked={localSettings.notificationsEnabled}
                onChange={(checked) => handleSettingChange('notificationsEnabled', checked)}
              />
            }
          />
        </SettingSection>

        {/* Automation */}
        <SettingSection title="Automation">
          <SettingItem
            icon={Play}
            title="Auto-start Breaks"
            subtitle="Automatically start break timers"
            action={
              <Toggle
                checked={localSettings.autoStartBreaks}
                onChange={(checked) => handleSettingChange('autoStartBreaks', checked)}
              />
            }
          />
          <SettingItem
            icon={Play}
            title="Auto-start Focus"
            subtitle="Automatically start focus sessions"
            action={
              <Toggle
                checked={localSettings.autoStartPomodoros}
                onChange={(checked) => handleSettingChange('autoStartPomodoros', checked)}
              />
            }
          />
        </SettingSection>

        {/* Account */}
        {user && (
          <SettingSection title="Account">
            <SettingItem
              icon={User}
              title="Profile"
              subtitle={user.email}
              action={<ChevronRight className="w-5 h-5 text-text-tertiary" />}
            />
            <SettingItem
              icon={Download}
              title="Export Data"
              subtitle="Download your session data"
              action={<ChevronRight className="w-5 h-5 text-text-tertiary" />}
            />
            <SettingItem
              icon={LogOut}
              title="Sign Out"
              subtitle="Sign out of your account"
              action={
                <button
                  onClick={signOut}
                  className="text-error-500 font-medium"
                >
                  Sign Out
                </button>
              }
            />
          </SettingSection>
        )}

        {/* App Info */}
        <SettingSection title="App">
          <SettingItem
            icon={Smartphone}
            title="Install App"
            subtitle="Add to home screen for better experience"
            action={<ChevronRight className="w-5 h-5 text-text-tertiary" />}
          />
          <SettingItem
            icon={Moon}
            title="Theme"
            subtitle="Dark theme enabled"
            action={<ChevronRight className="w-5 h-5 text-text-tertiary" />}
          />
        </SettingSection>

        {/* Save Button */}
        {hasChanges && (
          <div className="sticky bottom-6">
            <div className="flex space-x-3">
              <button
                onClick={handleReset}
                className="btn-secondary flex-1"
              >
                Reset
              </button>
              <button
                onClick={handleSave}
                className="btn-primary flex-1"
              >
                Save Changes
              </button>
            </div>
          </div>
        )}
      </div>
    </MobileLayout>
  )
}
