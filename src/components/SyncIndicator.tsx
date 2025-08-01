import { useSync } from '../contexts/SyncContext'
import { Wifi, WifiOff, RefreshCw, CheckCircle, XCircle } from 'lucide-react'

export default function SyncIndicator() {
  const { isOnline, isSyncing, syncStatus, lastSyncTime, syncNow } = useSync()

  const getStatusIcon = () => {
    if (!isOnline) {
      return <WifiOff className="w-4 h-4 text-gray-500" />
    }
    
    if (isSyncing) {
      return <RefreshCw className="w-4 h-4 text-blue-500 animate-spin" />
    }
    
    switch (syncStatus) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'error':
        return <XCircle className="w-4 h-4 text-red-500" />
      default:
        return <Wifi className="w-4 h-4 text-green-500" />
    }
  }

  const getStatusText = () => {
    if (!isOnline) {
      return 'Offline'
    }
    
    if (isSyncing) {
      return 'Syncing...'
    }
    
    switch (syncStatus) {
      case 'success':
        return 'Synced'
      case 'error':
        return 'Sync failed'
      default:
        return 'Online'
    }
  }

  const getStatusColor = () => {
    if (!isOnline) {
      return 'bg-gray-100 text-gray-700'
    }
    
    if (isSyncing) {
      return 'bg-blue-100 text-blue-700'
    }
    
    switch (syncStatus) {
      case 'success':
        return 'bg-green-100 text-green-700'
      case 'error':
        return 'bg-red-100 text-red-700'
      default:
        return 'bg-green-100 text-green-700'
    }
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div
        className={`flex items-center space-x-2 px-3 py-2 rounded-lg shadow-lg cursor-pointer transition-all ${getStatusColor()}`}
        onClick={isOnline && !isSyncing ? syncNow : undefined}
        title={
          lastSyncTime 
            ? `Last synced: ${lastSyncTime.toLocaleTimeString()}`
            : 'Click to sync'
        }
      >
        {getStatusIcon()}
        <span className="text-sm font-medium">{getStatusText()}</span>
      </div>
    </div>
  )
}
