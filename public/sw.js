const CACHE_NAME = 'proventa-pwa-cache-v2';
const DYNAMIC_CACHE = 'proventa-dynamic-cache-v2';

const ASSETS = [
  '/',
  '/manifest.json',
  '/icon.svg',
  '/login'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME && key !== DYNAMIC_CACHE)
            .map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  if (event.request.url.includes('/api/')) return; // Skip API caching

  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        return caches.open(DYNAMIC_CACHE).then((cache) => {
          cache.put(event.request.url, networkResponse.clone());
          return networkResponse;
        });
      })
      .catch(() => {
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          // Offline fallback html
          if (event.request.mode === 'navigate') {
            return new Response(`
              <!DOCTYPE html>
              <html>
              <head>
                <title>Offline | Proventa</title>
                <style>
                  body { font-family: system-ui, -apple-system, sans-serif; background: #060a12; color: #fff; text-align: center; padding: 4rem; margin: 0; }
                  h1 { color: #2563eb; }
                  .container { max-width: 600px; margin: 0 auto; border: 1px solid rgba(255,255,255,0.1); padding: 3rem; border-radius: 12px; background: #0a0a0b; }
                </style>
              </head>
              <body>
                <div class="container">
                  <h1>No Connection</h1>
                  <p>You are currently offline. Please check your internet connection to continue accessing Proventa Credit Intelligence.</p>
                  <button onclick="window.location.reload()" style="background:#2563eb;color:#fff;border:none;padding:12px 24px;border-radius:6px;cursor:pointer;margin-top:1rem;font-weight:bold;">Try Again</button>
                </div>
              </body>
              </html>
            `, { headers: { 'Content-Type': 'text/html' } });
          }
          return new Response('', { status: 404, statusText: 'Not Found' });
        });
      })
  );
});
