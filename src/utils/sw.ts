import { Workbox } from 'workbox-window'

export function registerSW() {
  if ('serviceWorker' in navigator) {
    const wb = new Workbox('/sw.js')

    wb.addEventListener('controlling', () => {
      window.location.reload()
    })

    wb.addEventListener('waiting', () => {
      // Show update available notification
      if (confirm('New version available! Click OK to update.')) {
        wb.messageSkipWaiting()
      }
    })

    wb.register()
  }
}
