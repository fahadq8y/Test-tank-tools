// 🔒 Tank Tools Service Worker - Enhanced PWA
// Developer: Fahad - 17877 
// Version: 3.1.1 - Fixed integrity issues
// Last Updated: 2025-09-27

const CACHE_NAME = 'tanktools-v3.1.1';
const CACHE_VERSION = '3.1.1';

// Files to cache for offline functionality
const CORE_ASSETS = [
  '/',
  '/login.html',
  '/dashboard.html', 
  '/index.html',
  '/plcr.html',
  '/NMOGASBL.html',
  '/notifications.html',
  '/icon.png',
  '/background.jpg',
  '/manifest.json'
];

// Network-first resources (always try network first)
const NETWORK_FIRST_PATTERNS = [
  '/api/',
  'https://cdn.jsdelivr.net/',
  'https://fonts.googleapis.com/',
  'https://wa.me/'
];

// Cache-first resources (try cache first, fallback to network)
const CACHE_FIRST_PATTERNS = [
  '/icon.png',
  '/background.jpg',
  '.css',
  '.js',
  '.png',
  '.jpg',
  '.jpeg',
  '.gif',
  '.webp'
];

// Install event - cache core assets
self.addEventListener('install', event => {
  console.log('🔧 Tank Tools SW: Installing...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('📦 Tank Tools SW: Caching core assets');
        return cache.addAll(CORE_ASSETS);
      })
      .then(() => {
        console.log('✅ Tank Tools SW: Installation complete');
        return self.skipWaiting();
      })
      .catch(error => {
        console.error('❌ Tank Tools SW: Installation failed', error);
      })
  );
});

// Activate event - cleanup old caches
self.addEventListener('activate', event => {
  console.log('🚀 Tank Tools SW: Activating...');
  
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheName !== CACHE_NAME) {
              console.log('🗑️ Tank Tools SW: Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('✅ Tank Tools SW: Activation complete');
        return self.clients.claim();
      })
  );
});

// Fetch event - handle network requests
self.addEventListener('fetch', event => {
  const request = event.request;
  const url = new URL(request.url);
  
  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }
  
  // Skip chrome-extension and other non-http requests
  if (!url.protocol.startsWith('http')) {
    return;
  }
  
  // Handle different caching strategies
  event.respondWith(handleRequest(request));
});

// Main request handler with intelligent caching
async function handleRequest(request) {
  const url = new URL(request.url);
  
  try {
    // Network-first strategy for dynamic content
    if (shouldUseNetworkFirst(url.pathname)) {
      return await networkFirst(request);
    }
    
    // Cache-first strategy for static assets
    if (shouldUseCacheFirst(url.pathname)) {
      return await cacheFirst(request);
    }
    
    // Default: stale-while-revalidate for HTML pages
    return await staleWhileRevalidate(request);
    
  } catch (error) {
    console.error('🚨 Tank Tools SW: Request failed:', error);
    return await handleOfflineFallback(request);
  }
}

// Network-first strategy
async function networkFirst(request) {
  try {
    const networkResponse = await fetch(request);
    const responseForCache = networkResponse.clone();
    const responseForClient = networkResponse.clone();
    
    if (responseForCache.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, responseForCache);
    }
    
    return responseForClient;
  } catch (error) {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    throw error;
  }
}

// Cache-first strategy  
async function cacheFirst(request) {
  const cachedResponse = await caches.match(request);
  
  if (cachedResponse) {
    // Update cache in background
    fetch(request).then(networkResponse => {
      if (networkResponse.ok) {
        caches.open(CACHE_NAME).then(cache => {
          cache.put(request, networkResponse.clone());
        });
      }
    }).catch(() => {
      // Ignore network errors for background updates
    });
    
    return cachedResponse;
  }
  
  const networkResponse = await fetch(request);
  
  if (networkResponse.ok) {
    const cache = await caches.open(CACHE_NAME);
    cache.put(request, networkResponse.clone());
  }
  
  return networkResponse;
}

// Stale-while-revalidate strategy
async function staleWhileRevalidate(request) {
  const cachedResponse = await caches.match(request);
  
  const networkResponsePromise = fetch(request).then(networkResponse => {
    if (networkResponse.ok) {
      caches.open(CACHE_NAME).then(cache => {
        cache.put(request, networkResponse.clone());
      });
    }
    return networkResponse;
  }).catch(() => {
    // Return cached response if network fails
    return cachedResponse;
  });
  
  return cachedResponse || await networkResponsePromise;
}

// Check if URL should use network-first strategy
function shouldUseNetworkFirst(pathname) {
  return NETWORK_FIRST_PATTERNS.some(pattern => 
    pathname.includes(pattern) || pathname.startsWith(pattern)
  );
}

// Check if URL should use cache-first strategy
function shouldUseCacheFirst(pathname) {
  return CACHE_FIRST_PATTERNS.some(pattern => 
    pathname.includes(pattern) || pathname.endsWith(pattern)
  );
}

// Offline fallback handler
async function handleOfflineFallback(request) {
  const url = new URL(request.url);
  
  // Try to return cached version
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }
  
  // For HTML pages, return offline page if available
  if (request.destination === 'document') {
    const offlinePage = await caches.match('/login.html');
    if (offlinePage) {
      return offlinePage;
    }
  }
  
  // For images, return placeholder if available
  if (request.destination === 'image') {
    const placeholderImage = await caches.match('/icon.png');
    if (placeholderImage) {
      return placeholderImage;
    }
  }
  
  // Return basic offline response
  return new Response(
    `<!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Offline - Tank Tools</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
          margin: 0;
          text-align: center;
        }
        .offline-container {
          background: rgba(255, 255, 255, 0.1);
          padding: 40px;
          border-radius: 20px;
          backdrop-filter: blur(10px);
        }
        .offline-icon {
          font-size: 4rem;
          margin-bottom: 20px;
        }
        .retry-btn {
          padding: 12px 24px;
          background: #4CAF50;
          color: white;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-size: 16px;
          margin-top: 20px;
        }
      </style>
    </head>
    <body>
      <div class="offline-container">
        <div class="offline-icon">📡</div>
        <h1>You're Offline</h1>
        <p>Tank Tools is not available offline.<br>Please check your internet connection.</p>
        <button class="retry-btn" onclick="window.location.reload()">Try Again</button>
      </div>
    </body>
    </html>`,
    {
      headers: {
        'Content-Type': 'text/html',
        'Cache-Control': 'no-cache'
      },
      status: 503,
      statusText: 'Service Unavailable'
    }
  );
}

// Handle background sync for offline actions
self.addEventListener('sync', event => {
  console.log('🔄 Tank Tools SW: Background sync triggered:', event.tag);
  
  if (event.tag === 'tanktools-sync') {
    event.waitUntil(syncOfflineData());
  }
});

// Sync offline data when connection is restored
async function syncOfflineData() {
  console.log('📤 Tank Tools SW: Syncing offline data...');
  
  try {
    // Get offline data from IndexedDB or localStorage
    const offlineData = await getOfflineData();
    
    if (offlineData && offlineData.length > 0) {
      // Send data to server when online
      for (const data of offlineData) {
        await fetch('/api/sync', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(data)
        });
      }
      
      // Clear offline data after successful sync
      await clearOfflineData();
      console.log('✅ Tank Tools SW: Offline data synced successfully');
    }
  } catch (error) {
    console.error('❌ Tank Tools SW: Sync failed:', error);
  }
}

// Get offline data (placeholder - implement based on your needs)
async function getOfflineData() {
  // Implementation depends on how you store offline data
  return [];
}

// Clear offline data after sync
async function clearOfflineData() {
  // Implementation depends on your storage method
}

// Handle push notifications
self.addEventListener('push', event => {
  console.log('🔔 Tank Tools SW: Push notification received');
  
  let notificationData = {};
  
  if (event.data) {
    try {
      notificationData = event.data.json();
    } catch (e) {
      notificationData = { title: event.data.text() };
    }
  }
  
  const options = {
    title: notificationData.title || 'Tank Tools - منبه',
    body: notificationData.body || 'لديك تنبيه جديد من Tank Tools',
    icon: '/icon.png',
    badge: '/icon.png',
    tag: notificationData.tag || 'tanktools-notification',
    requireInteraction: notificationData.persistent || false,
    silent: false,
    timestamp: Date.now(),
    actions: [
      {
        action: 'open',
        title: 'فتح التطبيق',
        icon: '/icon.png'
      },
      {
        action: 'snooze',
        title: 'تأجيل 5 دقائق',
        icon: '/icon.png'
      },
      {
        action: 'dismiss',
        title: 'إغلاق'
      }
    ],
    data: {
      url: notificationData.url || '/notifications.html',
      persistent: notificationData.persistent || false,
      alarmId: notificationData.alarmId
    },
    vibrate: [200, 100, 200, 100, 200] // اهتزاز للهواتف
  };
  
  event.waitUntil(
    self.registration.showNotification(options.title, options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', event => {
  console.log('👆 Tank Tools SW: Notification clicked, action:', event.action);
  
  const notification = event.notification;
  const action = event.action;
  const data = notification.data || {};
  
  if (action === 'dismiss') {
    event.notification.close();
    return;
  }
  
  if (action === 'snooze') {
    event.notification.close();
    
    // جدولة تنبيه جديد بعد 5 دقائق
    setTimeout(() => {
      self.registration.showNotification('Tank Tools - منبه مؤجل', {
        body: 'انتهت فترة التأجيل - ' + (notification.body || ''),
        icon: '/icon.png',
        badge: '/icon.png',
        tag: 'snoozed-' + Date.now(),
        requireInteraction: data.persistent || false,
        vibrate: [200, 100, 200, 100, 200],
        actions: [
          {
            action: 'open',
            title: 'فتح التطبيق'
          },
          {
            action: 'snooze',
            title: 'تأجيل 5 دقائق أخرى'
          },
          {
            action: 'dismiss',
            title: 'إغلاق'
          }
        ],
        data: data
      });
    }, 5 * 60 * 1000); // 5 دقائق
    
    return;
  }
  
  // الإجراء الافتراضي أو فتح التطبيق
  event.notification.close();
  
  const urlToOpen = data.url || '/notifications.html';
  
  event.waitUntil(
    clients.matchAll({
      type: 'window',
      includeUncontrolled: true
    }).then(clientList => {
      // البحث عن نافذة مفتوحة للتطبيق
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          return client.focus().then(() => {
            // إرسال رسالة للعميل لفتح صفحة التنبيهات
            client.postMessage({
              type: 'NOTIFICATION_CLICKED',
              url: urlToOpen,
              data: data
            });
          });
        }
      }
      
      // إذا لم توجد نافذة مفتوحة، افتح نافذة جديدة
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});

// Handle messages from main thread
self.addEventListener('message', event => {
  console.log('💬 Tank Tools SW: Message received:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({
      version: CACHE_VERSION,
      cacheName: CACHE_NAME
    });
  }
});

// Error handling
self.addEventListener('error', event => {
  console.error('❌ Tank Tools SW: Error occurred:', event.error);
});

self.addEventListener('unhandledrejection', event => {
  console.error('❌ Tank Tools SW: Unhandled promise rejection:', event.reason);
});

// Persistent alarm functionality
let persistentAlarmInterval = null;

// Handle periodic background sync for persistent alarms
self.addEventListener('sync', event => {
  console.log('🔄 Tank Tools SW: Background sync triggered:', event.tag);
  
  if (event.tag === 'tanktools-sync') {
    event.waitUntil(syncOfflineData());
  }
  
  if (event.tag === 'tanktools-alarm-check') {
    event.waitUntil(checkScheduledAlarms());
  }
});

// Check and trigger scheduled alarms
async function checkScheduledAlarms() {
  try {
    // This would typically fetch alarm data from IndexedDB or similar
    console.log('🕐 Checking scheduled alarms...');
    
    // For now, this is a placeholder
    // In a full implementation, you would:
    // 1. Read scheduled alarms from storage
    // 2. Check which ones should trigger now
    // 3. Show notifications for due alarms
    
  } catch (error) {
    console.error('❌ Error checking alarms:', error);
  }
}

// Enhanced notification for persistent alarms
function showPersistentAlarm(title, body, alarmId) {
  const options = {
    title: title || 'Tank Tools - منبه',
    body: body || 'حان وقت المنبه!',
    icon: '/icon.png',
    badge: '/icon.png',
    tag: 'persistent-alarm-' + alarmId,
    requireInteraction: true,
    silent: false,
    persistent: true,
    timestamp: Date.now(),
    actions: [
      {
        action: 'stop',
        title: 'إيقاف المنبه'
      },
      {
        action: 'snooze',
        title: 'تأجيل 5 دقائق'
      }
    ],
    data: {
      url: '/notifications.html',
      persistent: true,
      alarmId: alarmId,
      startTime: Date.now()
    },
    vibrate: [500, 200, 500, 200, 500]
  };
  
  return self.registration.showNotification(options.title, options);
}

// Handle background message for alarms
self.addEventListener('message', event => {
  console.log('💬 Tank Tools SW: Message received:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({
      version: CACHE_VERSION,
      cacheName: CACHE_NAME
    });
  }
  
  if (event.data && event.data.type === 'SET_PERSISTENT_ALARM') {
    const { title, body, alarmId, duration } = event.data;
    
    // Store alarm in service worker
    persistentAlarmInterval = setInterval(() => {
      showPersistentAlarm(title, body, alarmId);
    }, duration || 30000); // كل 30 ثانية بشكل افتراضي
    
    // Initial alarm
    showPersistentAlarm(title, body, alarmId);
  }
  
  if (event.data && event.data.type === 'STOP_PERSISTENT_ALARM') {
    if (persistentAlarmInterval) {
      clearInterval(persistentAlarmInterval);
      persistentAlarmInterval = null;
    }
  }
});

console.log('🚀 Tank Tools Service Worker v3.1.0 loaded successfully');
console.log('🔔 Enhanced with persistent notifications and mobile support');
console.log('🔒 Developed by Fahad - 17877');
console.log('🏢 Kuwait National Petroleum Company');