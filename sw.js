// BRASSERIE PARK KEUZE MAKER — Service Worker
const CACHE_VERSION = 'bp-choice-v1';

const PRECACHE_URLS = [
  './', './index.html', './admin.html', './config.js', './script.js',
  './style.css', './manifest.json',
  './menu/dagkaart.md', './menu/dinerkaart.md', './menu/dranken.md'
];

const RUNTIME_CACHE_PATTERNS = [
  /fonts\.googleapis\.com/, /fonts\.gstatic\.com/, /cdn\.tailwindcss\.com/
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION).then(cache => cache.addAll(PRECACHE_URLS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(key => key !== CACHE_VERSION).map(key => caches.delete(key))
    )).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;
  if (request.url.includes('posthog') || request.url.includes('analytics')) return;

  event.respondWith(
    caches.match(request).then(cached => {
      if (cached) {
        fetch(request).then(net => {
          if (net && net.status === 200) {
            const clone = net.clone();
            caches.open(CACHE_VERSION).then(cache => cache.put(request, clone));
          }
        }).catch(() => {});
        return cached;
      }
      return fetch(request).then(net => {
        const shouldCache = RUNTIME_CACHE_PATTERNS.some(p => p.test(request.url));
        if (shouldCache && net && net.status === 200) {
          const clone = net.clone();
          caches.open(CACHE_VERSION).then(cache => cache.put(request, clone));
        }
        return net;
      }).catch(() => {
        if (request.mode === 'navigate') return caches.match('./index.html');
        return new Response('Offline', { status: 503 });
      });
    })
  );
});
