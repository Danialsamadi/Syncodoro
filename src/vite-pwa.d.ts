/// <reference types="vite-plugin-pwa/client" />

declare module 'virtual:pwa-register/react' {
  import type { Ref } from 'react'

  export interface RegisterSWOptions {
    immediate?: boolean
    onNeedRefresh?: () => void
    onOfflineReady?: () => void
    onRegistered?: (registration: ServiceWorkerRegistration | undefined) => void
    onRegisterError?: (error: any) => void
  }

  export function useRegisterSW(options?: RegisterSWOptions): {
    needRefresh: [boolean, Ref<boolean>]
    offlineReady: [boolean, Ref<boolean>]
    updateServiceWorker: (reloadPage?: boolean) => Promise<void>
  }
}
