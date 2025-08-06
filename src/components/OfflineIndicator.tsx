import { useState, useEffect } from 'react'
import { Wifi, WifiOff, Download, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'

interface OfflineIndicatorProps {
  className?: string
}

export default function OfflineIndicator({ className = '' }: OfflineIndicatorProps) {
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [updateAvailable, setUpdateAvailable] = useState(false)
  const [installing, setInstalling] = useState(false)

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true)
      toast.success('Back online! Data will sync automatically.', {
        icon: '🌐',
        duration: 3000
      })
    }

    const handleOffline = () => {
      setIsOnline(false)
      toast('You\'re offline. The app will continue to work!', {
        icon: '📱',
        duration: 4000
      })
    }

    // Service Worker update handling
    const handleSWUpdate = () => {
      setUpdateAvailable(true)
      toast('App update available! Click to update.', {
        icon: '🔄',
        duration: 6000
      })
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    
    // Listen for service worker updates
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data && event.data.type === 'SW_UPDATE_AVAILABLE') {
          handleSWUpdate()
        }
      })
    }

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const handleUpdate = async () => {
    if ('serviceWorker' in navigator) {
      setInstalling(true)
      try {
        const registration = await navigator.serviceWorker.getRegistration()
        if (registration?.waiting) {
          registration.waiting.postMessage({ type: 'SKIP_WAITING' })
          window.location.reload()
        }
      } catch (error) {
        console.error('Failed to update service worker:', error)
        toast.error('Failed to update app')
      } finally {
        setInstalling(false)
      }
    }
  }

  const getStatusColor = () => {
    if (!isOnline) return 'text-orange-500'
    if (updateAvailable) return 'text-blue-500'
    return 'text-green-500'
  }

  const getStatusIcon = () => {
    if (installing) return <Download className="w-4 h-4 animate-spin" />
    if (!isOnline) return <WifiOff className="w-4 h-4" />
    if (updateAvailable) return <AlertCircle className="w-4 h-4" />
    return <Wifi className="w-4 h-4" />
  }

  const getStatusText = () => {
    if (installing) return 'Updating...'
    if (!isOnline) return 'Offline'
    if (updateAvailable) return 'Update available'
    return 'Online'
  }

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <div className={`flex items-center space-x-1 ${getStatusColor()}`}>
        {getStatusIcon()}
        <span className="text-sm font-medium">{getStatusText()}</span>
      </div>
      
      {updateAvailable && !installing && (
        <button
          onClick={handleUpdate}
          className="text-xs bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600 transition-colors"
        >
          Update Now
        </button>
      )}
    </div>
  )
}

// Hook for offline status
export function useOfflineStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine)

  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  return isOnline
}

// Hook for PWA installation
export function usePWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [isInstallable, setIsInstallable] = useState(false)

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setIsInstallable(true)
    }

    const handleAppInstalled = () => {
      setDeferredPrompt(null)
      setIsInstallable(false)
      toast.success('App installed successfully!', {
        icon: '📱',
        duration: 3000
      })
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [])

  const installPWA = async () => {
    if (!deferredPrompt) return false

    try {
      deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      
      if (outcome === 'accepted') {
        toast.success('Installing app...', { icon: '📱' })
      }
      
      setDeferredPrompt(null)
      setIsInstallable(false)
      return outcome === 'accepted'
    } catch (error) {
      console.error('Failed to install PWA:', error)
      return false
    }
  }

  return { isInstallable, installPWA }
}
