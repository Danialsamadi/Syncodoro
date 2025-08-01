import React, { createContext, useContext, useEffect, useState } from 'react'
import { syncService } from '../services/syncService'
import { useAuth } from './AuthContext'

interface SyncContextType {
  isOnline: boolean
  isSyncing: boolean
  lastSyncTime: Date | null
  syncNow: () => Promise<void>
  syncStatus: 'idle' | 'syncing' | 'success' | 'error'
}

const SyncContext = createContext<SyncContextType | undefined>(undefined)

export function useSync() {
  const context = useContext(SyncContext)
  if (context === undefined) {
    throw new Error('useSync must be used within a SyncProvider')
  }
  return context
}

interface SyncProviderProps {
  children: React.ReactNode
}

export function SyncProvider({ children }: SyncProviderProps) {
  const { user } = useAuth()
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [isSyncing, setIsSyncing] = useState(false)
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null)
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle')

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true)
      if (user) {
        syncNow()
      }
    }

    const handleOffline = () => {
      setIsOnline(false)
      setSyncStatus('idle')
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [user])

  // Auto-sync every 5 minutes when online and user is logged in
  useEffect(() => {
    if (!user || !isOnline) return

    const interval = setInterval(() => {
      syncNow()
    }, 5 * 60 * 1000) // 5 minutes

    return () => clearInterval(interval)
  }, [user, isOnline])

  const syncNow = async () => {
    if (!user || !isOnline || isSyncing) {
      return
    }

    setIsSyncing(true)
    setSyncStatus('syncing')

    try {
      await syncService.syncData(user.id)
      setLastSyncTime(new Date())
      setSyncStatus('success')
      
      // Reset status after 3 seconds
      setTimeout(() => {
        setSyncStatus('idle')
      }, 3000)
    } catch (error) {
      console.error('Sync failed:', error)
      setSyncStatus('error')
      
      // Reset status after 5 seconds
      setTimeout(() => {
        setSyncStatus('idle')
      }, 5000)
    } finally {
      setIsSyncing(false)
    }
  }

  const value: SyncContextType = {
    isOnline,
    isSyncing,
    lastSyncTime,
    syncNow,
    syncStatus
  }

  return (
    <SyncContext.Provider value={value}>
      {children}
    </SyncContext.Provider>
  )
}
