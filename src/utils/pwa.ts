/**
 * PWA Utilities
 *
 * Helper functions for Progressive Web App features
 */

/**
 * Register service worker
 */
export const registerServiceWorker = async (): Promise<ServiceWorkerRegistration | null> => {
  if (!('serviceWorker' in navigator)) {
    console.warn('Service Worker not supported in this browser')
    return null
  }

  try {
    const registration = await navigator.serviceWorker.register('/service-worker.js', {
      scope: '/',
    })

    console.log('Service Worker registered successfully:', registration)

    // Check for updates
    registration.addEventListener('updatefound', () => {
      const newWorker = registration.installing
      if (newWorker) {
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            // New service worker available
            console.log('New Service Worker available')
            showUpdateNotification()
          }
        })
      }
    })

    return registration
  } catch (error) {
    console.error('Service Worker registration failed:', error)
    return null
  }
}

/**
 * Show update notification to user
 */
const showUpdateNotification = () => {
  // You can implement a custom UI notification here
  if (confirm('A new version is available! Reload to update?')) {
    window.location.reload()
  }
}

/**
 * Request push notification permission
 */
export const requestNotificationPermission = async (): Promise<NotificationPermission> => {
  if (!('Notification' in window)) {
    console.warn('Notifications not supported')
    return 'denied'
  }

  if (Notification.permission === 'granted') {
    return 'granted'
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission()
    return permission
  }

  return Notification.permission
}

/**
 * Subscribe to push notifications
 */
export const subscribeToPushNotifications = async (
  registration: ServiceWorkerRegistration,
  vapidPublicKey: string
): Promise<PushSubscription | null> => {
  try {
    const permission = await requestNotificationPermission()
    if (permission !== 'granted') {
      console.warn('Push notification permission denied')
      return null
    }

    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
    })

    console.log('Push subscription created:', subscription)
    return subscription
  } catch (error) {
    console.error('Failed to subscribe to push notifications:', error)
    return null
  }
}

/**
 * Convert VAPID key to Uint8Array
 */
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')

  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }

  return outputArray
}

/**
 * Check if app is running as PWA
 */
export const isPWA = (): boolean => {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as any).standalone === true ||
    document.referrer.includes('android-app://')
  )
}

/**
 * Check if app can be installed
 */
export const canInstall = (): boolean => {
  return 'BeforeInstallPromptEvent' in window
}

/**
 * Prompt user to install app
 */
let deferredPrompt: any = null

export const setupInstallPrompt = () => {
  window.addEventListener('beforeinstallprompt', e => {
    e.preventDefault()
    deferredPrompt = e
    console.log('Install prompt ready')
  })

  window.addEventListener('appinstalled', () => {
    console.log('PWA installed successfully')
    deferredPrompt = null
  })
}

export const promptInstall = async (): Promise<boolean> => {
  if (!deferredPrompt) {
    console.warn('Install prompt not available')
    return false
  }

  deferredPrompt.prompt()
  const { outcome } = await deferredPrompt.userChoice

  console.log(`Install prompt outcome: ${outcome}`)
  deferredPrompt = null

  return outcome === 'accepted'
}

/**
 * Check online/offline status
 */
export const isOnline = (): boolean => {
  return navigator.onLine
}

export const onOnline = (callback: () => void) => {
  window.addEventListener('online', callback)
  return () => window.removeEventListener('online', callback)
}

export const onOffline = (callback: () => void) => {
  window.addEventListener('offline', callback)
  return () => window.removeEventListener('offline', callback)
}

/**
 * Send message to service worker
 */
export const sendMessageToSW = async (message: any): Promise<void> => {
  if (!navigator.serviceWorker.controller) {
    console.warn('No active service worker')
    return
  }

  navigator.serviceWorker.controller.postMessage(message)
}

/**
 * Clear all caches
 */
export const clearAllCaches = async (): Promise<void> => {
  await sendMessageToSW({ type: 'CLEAR_CACHE' })
}

/**
 * Check for app updates
 */
export const checkForUpdates = async (): Promise<boolean> => {
  if (!navigator.serviceWorker.controller) {
    return false
  }

  const registration = await navigator.serviceWorker.getRegistration()
  if (!registration) {
    return false
  }

  await registration.update()
  return true
}
