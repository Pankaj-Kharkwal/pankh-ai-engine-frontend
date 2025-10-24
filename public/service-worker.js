/**
 * Service Worker for Pankh AI Engine PWA
 *
 * Features:
 * - Offline support with cache-first strategy
 * - Background sync for failed requests
 * - Push notifications
 * - Asset caching
 */

const CACHE_VERSION = 'pankh-v1'
const STATIC_CACHE = `${CACHE_VERSION}-static`
const DYNAMIC_CACHE = `${CACHE_VERSION}-dynamic`
const API_CACHE = `${CACHE_VERSION}-api`

// Assets to cache on install
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/offline.html',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
]

// Install event - cache static assets
self.addEventListener('install', event => {
  console.log('[Service Worker] Installing...')

  event.waitUntil(
    caches.open(STATIC_CACHE).then(cache => {
      console.log('[Service Worker] Caching static assets')
      return cache.addAll(STATIC_ASSETS)
    })
  )

  // Force the waiting service worker to become the active service worker
  self.skipWaiting()
})

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  console.log('[Service Worker] Activating...')

  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames
          .filter(
            name =>
              name.startsWith('pankh-') &&
              name !== STATIC_CACHE &&
              name !== DYNAMIC_CACHE &&
              name !== API_CACHE
          )
          .map(name => {
            console.log('[Service Worker] Deleting old cache:', name)
            return caches.delete(name)
          })
      )
    })
  )

  // Take control of all pages immediately
  self.clients.claim()
})

// Fetch event - serve from cache or network
self.addEventListener('fetch', event => {
  const { request } = event
  const url = new URL(request.url)

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return
  }

  // API requests - network first, cache fallback
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(networkFirstStrategy(request, API_CACHE))
    return
  }

  // Static assets - cache first, network fallback
  if (isStaticAsset(url.pathname)) {
    event.respondWith(cacheFirstStrategy(request, STATIC_CACHE))
    return
  }

  // HTML pages - network first, cache fallback, offline page as last resort
  if (request.headers.get('accept').includes('text/html')) {
    event.respondWith(htmlStrategy(request))
    return
  }

  // Default - cache first for everything else
  event.respondWith(cacheFirstStrategy(request, DYNAMIC_CACHE))
})

/**
 * Cache-first strategy: Check cache first, then network
 */
async function cacheFirstStrategy(request, cacheName) {
  const cachedResponse = await caches.match(request)

  if (cachedResponse) {
    console.log('[Service Worker] Serving from cache:', request.url)
    return cachedResponse
  }

  try {
    const networkResponse = await fetch(request)

    // Cache successful responses
    if (networkResponse && networkResponse.status === 200) {
      const cache = await caches.open(cacheName)
      cache.put(request, networkResponse.clone())
      console.log('[Service Worker] Cached new resource:', request.url)
    }

    return networkResponse
  } catch (error) {
    console.error('[Service Worker] Fetch failed:', error)
    throw error
  }
}

/**
 * Network-first strategy: Try network first, fallback to cache
 */
async function networkFirstStrategy(request, cacheName) {
  try {
    const networkResponse = await fetch(request)

    // Cache successful API responses (with TTL consideration)
    if (networkResponse && networkResponse.status === 200) {
      const cache = await caches.open(cacheName)
      cache.put(request, networkResponse.clone())
      console.log('[Service Worker] Cached API response:', request.url)
    }

    return networkResponse
  } catch (error) {
    console.log('[Service Worker] Network failed, trying cache:', request.url)

    const cachedResponse = await caches.match(request)
    if (cachedResponse) {
      return cachedResponse
    }

    // Return error response if no cache available
    return new Response(JSON.stringify({ error: 'Network unavailable and no cached data' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}

/**
 * HTML strategy: Network first, cache fallback, offline page as last resort
 */
async function htmlStrategy(request) {
  try {
    const networkResponse = await fetch(request)

    if (networkResponse && networkResponse.status === 200) {
      const cache = await caches.open(DYNAMIC_CACHE)
      cache.put(request, networkResponse.clone())
    }

    return networkResponse
  } catch (error) {
    const cachedResponse = await caches.match(request)
    if (cachedResponse) {
      return cachedResponse
    }

    // Return offline page
    const offlinePage = await caches.match('/offline.html')
    if (offlinePage) {
      return offlinePage
    }

    // Fallback response if offline page not cached
    return new Response('<h1>Offline</h1><p>No internet connection available.</p>', {
      status: 503,
      headers: { 'Content-Type': 'text/html' },
    })
  }
}

/**
 * Check if URL is a static asset
 */
function isStaticAsset(pathname) {
  const staticExtensions = [
    '.js',
    '.css',
    '.png',
    '.jpg',
    '.jpeg',
    '.svg',
    '.woff',
    '.woff2',
    '.ttf',
    '.ico',
  ]
  return staticExtensions.some(ext => pathname.endsWith(ext))
}

// Background sync - retry failed requests
self.addEventListener('sync', event => {
  console.log('[Service Worker] Background sync:', event.tag)

  if (event.tag === 'sync-workflows') {
    event.waitUntil(syncWorkflows())
  }
})

async function syncWorkflows() {
  console.log('[Service Worker] Syncing workflows...')
  // Implementation for syncing queued workflow operations
  // This would integrate with IndexedDB to queue operations while offline
}

// Push notifications
self.addEventListener('push', event => {
  console.log('[Service Worker] Push notification received')

  const data = event.data ? event.data.json() : {}
  const title = data.title || 'Pankh AI Engine'
  const options = {
    body: data.body || 'Workflow execution completed',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    data: data.data || {},
    actions: [
      { action: 'view', title: 'View' },
      { action: 'dismiss', title: 'Dismiss' },
    ],
  }

  event.waitUntil(self.registration.showNotification(title, options))
})

// Notification click
self.addEventListener('notificationclick', event => {
  console.log('[Service Worker] Notification clicked:', event.action)

  event.notification.close()

  if (event.action === 'view') {
    const url = event.notification.data.url || '/'
    event.waitUntil(clients.openWindow(url))
  }
})

// Message handling
self.addEventListener('message', event => {
  console.log('[Service Worker] Message received:', event.data)

  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }

  if (event.data && event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches.keys().then(cacheNames => {
        return Promise.all(cacheNames.map(name => caches.delete(name)))
      })
    )
  }
})
