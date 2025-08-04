import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { dbHelpers } from '../services/dbHelpers'
import { UserSettings } from '../services/database'
import { checkUsernameAvailability } from '../utils/helpers'
import { User, Globe, Lock, Save, ExternalLink } from 'lucide-react'
import toast from 'react-hot-toast'

export default function ProfilePage() {
  const { user, updateProfile } = useAuth()
  const [settings, setSettings] = useState<UserSettings | null>(null)
  const [formData, setFormData] = useState({
    username: '',
    displayName: '',
    bio: '',
    profilePublic: false
  })
  const [hasChanges, setHasChanges] = useState(false)
  const [loading, setLoading] = useState(true)
  const [usernameValidation, setUsernameValidation] = useState<{
    isChecking: boolean
    isValid: boolean
    message: string
  }>({ isChecking: false, isValid: true, message: '' })

  useEffect(() => {
    loadUserSettings()
  }, [user])

  useEffect(() => {
    if (settings) {
      const newFormData = {
        username: settings.username || '',
        displayName: settings.displayName || '',
        bio: settings.bio || '',
        profilePublic: settings.profilePublic
      }
      setFormData(newFormData)
    }
  }, [settings])

  useEffect(() => {
    if (settings) {
      const hasChanges = 
        formData.username !== (settings.username || '') ||
        formData.displayName !== (settings.displayName || '') ||
        formData.bio !== (settings.bio || '') ||
        formData.profilePublic !== settings.profilePublic
      setHasChanges(hasChanges)
    }
  }, [formData, settings])

  const loadUserSettings = async () => {
    if (!user) return

    try {
      const userSettings = await dbHelpers.getSettings(user.id)
      setSettings(userSettings || null)
    } catch (error) {
      console.error('Failed to load user settings:', error)
    } finally {
      setLoading(false)
    }
  }

  // Debounced username validation
  const validateUsernameAsync = async (username: string) => {
    if (!username) {
      setUsernameValidation({ isChecking: false, isValid: true, message: '' })
      return
    }

    setUsernameValidation({ isChecking: true, isValid: false, message: 'Checking availability...' })
    
    try {
      const result = await checkUsernameAvailability(username, user?.id)
      setUsernameValidation({
        isChecking: false,
        isValid: result.available,
        message: result.error || (result.available ? 'Username is available!' : '')
      })
    } catch (error) {
      setUsernameValidation({
        isChecking: false,
        isValid: false,
        message: 'Failed to check username availability'
      })
    }
  }

  const handleInputChange = (field: keyof typeof formData, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    setHasChanges(true)
  }

  // Debounced username validation effect
  useEffect(() => {
    if (formData.username) {
      const timeoutId = setTimeout(() => {
        validateUsernameAsync(formData.username)
      }, 500)
      
      return () => clearTimeout(timeoutId)
    } else {
      setUsernameValidation({ isChecking: false, isValid: true, message: '' })
    }
  }, [formData.username])

  const handleSave = async () => {
    if (!user) return

    // Check if username validation is in progress
    if (usernameValidation.isChecking) {
      toast.error('Please wait for username validation to complete')
      return
    }

    // Check if username is invalid
    if (formData.username && !usernameValidation.isValid) {
      toast.error(usernameValidation.message || 'Please choose a different username')
      return
    }

    // Final validation check if username was changed
    if (formData.username && formData.username !== (settings?.username || '')) {
      const result = await checkUsernameAvailability(formData.username, user.id)
      if (!result.available) {
        toast.error(result.error || 'Username is not available')
        setUsernameValidation({
          isChecking: false,
          isValid: false,
          message: result.error || 'Username is not available'
        })
        return
      }
    }

    try {
      await updateProfile(formData)
      await loadUserSettings() // Reload to get updated data
      setHasChanges(false)
      toast.success('Profile updated successfully!')
    } catch (error) {
      console.error('Failed to update profile:', error)
      toast.error('Failed to update profile')
    }
  }

  const handleReset = () => {
    if (settings) {
      setFormData({
        username: settings.username || '',
        displayName: settings.displayName || '',
        bio: settings.bio || '',
        profilePublic: settings.profilePublic
      })
      setHasChanges(false)
      setUsernameValidation({ isChecking: false, isValid: true, message: '' })
    }
  }

  const getProfileUrl = () => {
    if (formData.username) {
      return `${window.location.origin}/u/${formData.username}`
    }
    return null
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
        
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

      {/* Profile Information */}
      <div className="card">
        <div className="flex items-center space-x-3 mb-6">
          <User className="w-6 h-6 text-gray-600" />
          <h2 className="text-xl font-semibold text-gray-900">Profile Information</h2>
        </div>
        
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Username
            </label>
            <div className="relative">
              <input
                type="text"
                value={formData.username}
                onChange={(e) => handleInputChange('username', e.target.value)}
                placeholder="Enter a unique username"
                className={`input-field pr-10 ${
                  formData.username && !usernameValidation.isValid && !usernameValidation.isChecking
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                    : formData.username && usernameValidation.isValid && !usernameValidation.isChecking
                    ? 'border-green-300 focus:border-green-500 focus:ring-green-500'
                    : ''
                }`}
              />
              {formData.username && (
                <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                  {usernameValidation.isChecking ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400"></div>
                  ) : usernameValidation.isValid ? (
                    <div className="w-4 h-4 text-green-500">✓</div>
                  ) : (
                    <div className="w-4 h-4 text-red-500">✗</div>
                  )}
                </div>
              )}
            </div>
            <div className="mt-1 space-y-1">
              <p className="text-xs text-gray-500">
                3-20 characters, letters, numbers, hyphens, and underscores only
              </p>
              {formData.username && usernameValidation.message && (
                <p className={`text-xs ${
                  usernameValidation.isValid ? 'text-green-600' : 'text-red-600'
                }`}>
                  {usernameValidation.message}
                </p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Display Name
            </label>
            <input
              type="text"
              value={formData.displayName}
              onChange={(e) => handleInputChange('displayName', e.target.value)}
              placeholder="Your display name"
              className="input-field"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Bio
            </label>
            <textarea
              value={formData.bio}
              onChange={(e) => handleInputChange('bio', e.target.value)}
              placeholder="Tell others about yourself..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
            />
            <p className="text-xs text-gray-500 mt-1">
              {formData.bio.length}/200 characters
            </p>
          </div>
        </div>
      </div>

      {/* Privacy Settings */}
      <div className="card">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Privacy Settings</h2>
        
        <div className="space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-3">
              {formData.profilePublic ? (
                <Globe className="w-5 h-5 text-green-600 mt-0.5" />
              ) : (
                <Lock className="w-5 h-5 text-gray-600 mt-0.5" />
              )}
              <div>
                <h3 className="text-sm font-medium text-gray-900">Public Profile</h3>
                <p className="text-sm text-gray-600">
                  {formData.profilePublic 
                    ? 'Your profile is visible to everyone'
                    : 'Your profile is private'
                  }
                </p>
                {formData.profilePublic && getProfileUrl() && (
                  <div className="mt-2">
                    <a
                      href={getProfileUrl()!}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center space-x-1 text-sm text-primary-600 hover:text-primary-700"
                    >
                      <span>{getProfileUrl()}</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.profilePublic}
                onChange={(e) => handleInputChange('profilePublic', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
            </label>
          </div>

          {formData.profilePublic && !formData.username && (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                You need to set a username to make your profile public.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Account Information */}
      <div className="card">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Account Information</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <p className="text-sm text-gray-900">{user?.email}</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Account Created
            </label>
            <p className="text-sm text-gray-900">
              {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'Unknown'}
            </p>
          </div>
        </div>
      </div>

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
