const CACHE_VERSION = 'v2';
const CACHE_NAME = `ito-portfolio-${CACHE_VERSION}`;
const RUNTIME_CACHE = `runtime-cache-${CACHE_VERSION}`;
const API_CACHE = `api-cache-${CACHE_VERSION}`;
const IMAGE_CACHE = `image-cache-${CACHE_VERSION}`;

const PRECACHE_URLS = [
  '/',
  '/blog',
  '/admin',
  '/offline.html',
  '/manifest.json'
];

const API_ENDPOINTS_TO_CACHE = [
  '/profile/get_profile',
  '/profile/manage_blog',
  '/profile/manage_skills',
  '/profile/manage_projects',
  '/profile/manage_social_media',
  '/profile/manage_testimonials',
  '/profile/manage_client_logos'
];

const CACHE_MAX_AGE = {
  api: 5 * 60 * 1000,
  image: 7 * 24 * 60 * 60 * 1000,
  page: 24 * 60 * 60 * 1000
};

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => {
            return name.startsWith('ito-portfolio-') && name !== CACHE_NAME &&
                   name !== RUNTIME_CACHE && name !== API_CACHE && name !== IMAGE_CACHE;
          })
          .map((name) => caches.delete(name))
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  if (request.method === 'POST' && !navigator.onLine) {
    event.respondWith(handleOfflinePost(request));
    return;
  }

  if (request.method !== 'GET') {
    return;
  }

  if (url.pathname.includes('/api/') || url.pathname.startsWith('/profile/')) {
    event.respondWith(handleApiRequest(request));
    return;
  }

  if (request.destination === 'image') {
    event.respondWith(handleImageRequest(request));
    return;
  }

  event.respondWith(handlePageRequest(request));
});

async function handleApiRequest(request) {
  const url = new URL(request.url);
  const isCriticalEndpoint = API_ENDPOINTS_TO_CACHE.some(endpoint => url.pathname.includes(endpoint));

  if (!isCriticalEndpoint) {
    return fetch(request).catch(() => caches.match(request));
  }

  const cache = await caches.open(API_CACHE);
  const cachedResponse = await cache.match(request);

  const fetchPromise = fetch(request).then(async (networkResponse) => {
    if (networkResponse.ok) {
      const responseToCache = networkResponse.clone();
      const headers = new Headers(responseToCache.headers);
      headers.set('sw-cache-time', Date.now().toString());
      
      const modifiedResponse = new Response(await responseToCache.blob(), {
        status: responseToCache.status,
        statusText: responseToCache.statusText,
        headers: headers
      });
      
      cache.put(request, modifiedResponse);
    }
    return networkResponse;
  }).catch((error) => {
    console.log('Network request failed, falling back to cache:', error);
    return cachedResponse || new Response(JSON.stringify({ error: 'Offline' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' }
    });
  });

  if (cachedResponse) {
    const cacheTime = cachedResponse.headers.get('sw-cache-time');
    const age = cacheTime ? Date.now() - parseInt(cacheTime) : Infinity;
    
    if (age < CACHE_MAX_AGE.api) {
      fetchPromise.catch(() => {});
      return cachedResponse;
    }
  }

  return fetchPromise;
}

async function handleImageRequest(request) {
  const cache = await caches.open(IMAGE_CACHE);
  const cachedResponse = await cache.match(request);

  if (cachedResponse) {
    const cacheTime = cachedResponse.headers.get('sw-cache-time');
    const age = cacheTime ? Date.now() - parseInt(cacheTime) : 0;
    
    if (age < CACHE_MAX_AGE.image) {
      return cachedResponse;
    }
  }

  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const responseToCache = networkResponse.clone();
      const headers = new Headers(responseToCache.headers);
      headers.set('sw-cache-time', Date.now().toString());
      
      const modifiedResponse = new Response(await responseToCache.blob(), {
        status: responseToCache.status,
        statusText: responseToCache.statusText,
        headers: headers
      });
      
      cache.put(request, modifiedResponse);
    }
    return networkResponse;
  } catch (error) {
    return cachedResponse || new Response('', { status: 404 });
  }
}

async function handlePageRequest(request) {
  const cache = await caches.open(RUNTIME_CACHE);
  const cachedResponse = await cache.match(request);

  if (cachedResponse) {
    const cacheTime = cachedResponse.headers.get('sw-cache-time');
    const age = cacheTime ? Date.now() - parseInt(cacheTime) : 0;
    
    if (age < CACHE_MAX_AGE.page) {
      fetch(request).then(async (networkResponse) => {
        if (networkResponse.ok) {
          const headers = new Headers(networkResponse.headers);
          headers.set('sw-cache-time', Date.now().toString());
          
          const modifiedResponse = new Response(await networkResponse.clone().blob(), {
            status: networkResponse.status,
            statusText: networkResponse.statusText,
            headers: headers
          });
          
          cache.put(request, modifiedResponse);
        }
      }).catch(() => {});
      
      return cachedResponse;
    }
  }

  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const headers = new Headers(networkResponse.headers);
      headers.set('sw-cache-time', Date.now().toString());
      
      const modifiedResponse = new Response(await networkResponse.clone().blob(), {
        status: networkResponse.status,
        statusText: networkResponse.statusText,
        headers: headers
      });
      
      cache.put(request, modifiedResponse);
    }
    return networkResponse;
  } catch (error) {
    if (request.mode === 'navigate') {
      const offlineResponse = await caches.match('/offline.html');
      if (offlineResponse) return offlineResponse;
    }
    return cachedResponse || new Response('Offline', { status: 503 });
  }
}

async function handleOfflinePost(request) {
  const formData = await request.clone().text();
  
  if ('sync' in self.registration) {
    const url = new URL(request.url);
    
    const db = await openDB();
    const tx = db.transaction(['pending-requests'], 'readwrite');
    const store = tx.objectStore('pending-requests');
    
    await store.add({
      url: request.url,
      method: request.method,
      headers: Object.fromEntries([...request.headers.entries()]),
      body: formData,
      timestamp: Date.now()
    });
    
    await self.registration.sync.register('sync-pending-requests');
    
    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Request queued for sync when online',
      queued: true
    }), {
      status: 202,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  return new Response(JSON.stringify({ 
    error: 'Offline and background sync not supported' 
  }), {
    status: 503,
    headers: { 'Content-Type': 'application/json' }
  });
}

self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-pending-requests') {
    event.waitUntil(syncPendingRequests());
  }
});

async function syncPendingRequests() {
  const db = await openDB();
  const tx = db.transaction(['pending-requests'], 'readonly');
  const store = tx.objectStore('pending-requests');
  const requests = await store.getAll();
  
  for (const req of requests) {
    try {
      const response = await fetch(req.url, {
        method: req.method,
        headers: req.headers,
        body: req.body
      });
      
      if (response.ok) {
        const deleteTx = db.transaction(['pending-requests'], 'readwrite');
        const deleteStore = deleteTx.objectStore('pending-requests');
        await deleteStore.delete(req.id);
        
        await notifyClients({
          type: 'SYNC_SUCCESS',
          url: req.url,
          timestamp: req.timestamp
        });
      }
    } catch (error) {
      console.error('Failed to sync request:', error);
    }
  }
}

self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : {};
  
  const options = {
    body: data.body || 'New content available',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    vibrate: [200, 100, 200],
    data: {
      url: data.url || '/',
      timestamp: Date.now()
    },
    actions: [
      { action: 'view', title: 'View' },
      { action: 'dismiss', title: 'Dismiss' }
    ],
    tag: data.tag || 'notification',
    requireInteraction: false
  };
  
  event.waitUntil(
    self.registration.showNotification(data.title || 'New Update', options)
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  if (event.action === 'view' || !event.action) {
    const url = event.notification.data.url;
    
    event.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true })
        .then((clientList) => {
          for (const client of clientList) {
            if (client.url === url && 'focus' in client) {
              return client.focus();
            }
          }
          if (clients.openWindow) {
            return clients.openWindow(url);
          }
        })
    );
  }
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((name) => caches.delete(name))
        );
      })
    );
  }
  
  if (event.data && event.data.type === 'GET_PENDING_SYNCS') {
    event.waitUntil(
      openDB().then(async (db) => {
        const tx = db.transaction(['pending-requests'], 'readonly');
        const store = tx.objectStore('pending-requests');
        const requests = await store.getAll();
        
        event.ports[0].postMessage({
          type: 'PENDING_SYNCS',
          count: requests.length,
          requests: requests
        });
      }).catch(() => {
        event.ports[0].postMessage({
          type: 'PENDING_SYNCS',
          count: 0,
          requests: []
        });
      })
    );
  }
});

async function notifyClients(message) {
  const clients = await self.clients.matchAll({ includeUncontrolled: true });
  clients.forEach((client) => client.postMessage(message));
}

async function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('sw-db', 1);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      
      if (!db.objectStoreNames.contains('pending-requests')) {
        const store = db.createObjectStore('pending-requests', { 
          keyPath: 'id', 
          autoIncrement: true 
        });
        store.createIndex('timestamp', 'timestamp', { unique: false });
      }
    };
  });
}
