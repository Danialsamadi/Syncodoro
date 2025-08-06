// PWA utilities for service worker registration and management

export interface PWAUpdateInfo {
  updateAvailable: boolean
  registration?: ServiceWorkerRegistration
}

export class PWAManager {
  private static instance: PWAManager
  private registration: ServiceWorkerRegistration | null = null
  private updateCallbacks: Array<(info: PWAUpdateInfo) => void> = []

  static getInstance(): PWAManager {
    if (!PWAManager.instance) {
      PWAManager.instance = new PWAManager()
    }
    return PWAManager.instance
  }

  async initialize(): Promise<void> {
    if (!('serviceWorker' in navigator)) {
      console.warn('Service Workers not supported')
      return
    }

    try {
      // Register service worker
      this.registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      })

      console.log('Service Worker registered successfully:', this.registration)

      // Handle updates
      this.registration.addEventListener('updatefound', () => {
        const newWorker = this.registration?.installing
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New update available
              this.notifyUpdateAvailable()
            }
          })
        }
      })

      // Handle messages from service worker
      navigator.serviceWorker.addEventListener('message', (event) => {
        this.handleServiceWorkerMessage(event)
      })

      // Check for existing updates
      if (this.registration.waiting) {
        this.notifyUpdateAvailable()
      }

    } catch (error) {
      console.error('Service Worker registration failed:', error)
    }
  }

  private handleServiceWorkerMessage(event: MessageEvent): void {
    const { data } = event
    
    switch (data?.type) {
      case 'SW_UPDATE_AVAILABLE':
        this.notifyUpdateAvailable()
        break
      case 'SW_CACHE_UPDATED':
        console.log('Cache updated:', data.payload)
        break
      case 'SW_OFFLINE_READY':
        console.log('App ready for offline use')
        break
      default:
        console.log('Unknown SW message:', data)
    }
  }

  private notifyUpdateAvailable(): void {
    const updateInfo: PWAUpdateInfo = {
      updateAvailable: true,
      registration: this.registration || undefined
    }
    
    this.updateCallbacks.forEach(callback => callback(updateInfo))
  }

  onUpdateAvailable(callback: (info: PWAUpdateInfo) => void): () => void {
    this.updateCallbacks.push(callback)
    
    // Return unsubscribe function
    return () => {
      const index = this.updateCallbacks.indexOf(callback)
      if (index > -1) {
        this.updateCallbacks.splice(index, 1)
      }
    }
  }

  async skipWaiting(): Promise<void> {
    if (this.registration?.waiting) {
      this.registration.waiting.postMessage({ type: 'SKIP_WAITING' })
    }
  }

  async checkForUpdates(): Promise<void> {
    if (this.registration) {
      await this.registration.update()
    }
  }

  getRegistration(): ServiceWorkerRegistration | null {
    return this.registration
  }

  // Cache management utilities
  async clearOldCaches(): Promise<void> {
    if ('caches' in window) {
      const cacheNames = await caches.keys()
      const currentVersion = this.getCurrentCacheVersion()
      const oldCaches = cacheNames.filter(name => 
        name.includes('workbox') && !name.includes(currentVersion)
      )
      
      await Promise.all(
        oldCaches.map(cacheName => caches.delete(cacheName))
      )
    }
  }

  private getCurrentCacheVersion(): string {
    // This would typically come from your build process
    return 'v1'
  }

  // Network status utilities
  static isOnline(): boolean {
    return navigator.onLine
  }

  static onNetworkChange(callback: (isOnline: boolean) => void): () => void {
    const handleOnline = () => callback(true)
    const handleOffline = () => callback(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }

  // Installation utilities
  static async canInstall(): Promise<boolean> {
    if (!('serviceWorker' in navigator)) return false
    
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      return false
    }

    return true
  }

  // Cache size utilities
  async getCacheSize(): Promise<{ size: number; entries: number }> {
    if (!('caches' in window)) {
      return { size: 0, entries: 0 }
    }

    let totalSize = 0
    let totalEntries = 0

    const cacheNames = await caches.keys()
    
    for (const cacheName of cacheNames) {
      const cache = await caches.open(cacheName)
      const requests = await cache.keys()
      totalEntries += requests.length

      for (const request of requests) {
        const response = await cache.match(request)
        if (response) {
          const blob = await response.blob()
          totalSize += blob.size
        }
      }
    }

    return { size: totalSize, entries: totalEntries }
  }

  // Format cache size for display
  static formatCacheSize(bytes: number): string {
    if (bytes === 0) return '0 B'
    
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }
}

// Initialize PWA manager
export const pwaManager = PWAManager.getInstance()

// Auto-initialize when module loads
if (typeof window !== 'undefined') {
  pwaManager.initialize().catch(console.error)
}
