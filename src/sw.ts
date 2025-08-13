/// <reference lib="webworker" />
import { clientsClaim } from 'workbox-core'
import { precacheAndRoute, createHandlerBoundToURL } from 'workbox-precaching'
import { registerRoute } from 'workbox-routing'
import { StaleWhileRevalidate, CacheFirst, NetworkFirst } from 'workbox-strategies'
import { ExpirationPlugin } from 'workbox-expiration'

declare const self: ServiceWorkerGlobalScope

// Set up service worker to claim clients
clientsClaim()

// Skip waiting for installation
self.skipWaiting()

// Precache all assets
const manifest = self.__WB_MANIFEST
precacheAndRoute(manifest)

// Handle navigation requests with a network-first strategy
registerRoute(
  ({ request }) => request.mode === 'navigate',
  new NetworkFirst({
    cacheName: 'pages',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 50,
      }),
    ],
  })
)

// Cache CSS, JS, and Web Worker requests with a Stale While Revalidate strategy
registerRoute(
  ({ request }) => 
    request.destination === 'style' ||
    request.destination === 'script' ||
    request.destination === 'worker',
  new StaleWhileRevalidate({
    cacheName: 'assets',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 60,
        maxAgeSeconds: 30 * 24 * 60 * 60, // 30 Days
      }),
    ],
  })
)

// Cache images with a Cache First strategy
registerRoute(
  ({ request }) => request.destination === 'image',
  new CacheFirst({
    cacheName: 'images',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 60,
        maxAgeSeconds: 30 * 24 * 60 * 60, // 30 Days
      }),
    ],
  })
)

// Cache font files with a Stale While Revalidate strategy
registerRoute(
  ({ url }) => url.origin === self.location.origin && url.pathname.endsWith('.woff2'),
  new StaleWhileRevalidate({
    cacheName: 'fonts',
  })
)

// Cache Supabase API requests with a Network First strategy
registerRoute(
  ({ url }) => url.href.includes('.supabase.co'),
  new NetworkFirst({
    cacheName: 'api-cache',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 50,
        maxAgeSeconds: 24 * 60 * 60, // 24 hours
      }),
    ],
  })
)

// Set up offline fallback
const offlineFallbackPage = '/index.html'
registerRoute(
  ({ request }) => request.mode === 'navigate',
  async () => {
    try {
      return await fetch(request)
    } catch (error) {
      return caches.match(offlineFallbackPage)
    }
  }
)
