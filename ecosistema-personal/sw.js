const CACHE = 'orbita-personal-shell-v2';
const FILES = [
  './','./index.html','./styles.css','./app-manifest.js','./portal.js','./manifest.webmanifest','./assets/icon.svg','./docs/orbita.html',
  './apps/basketbrain/index.html','./apps/pulso/index.html','./apps/juego-de-honor/index.html','./apps/calistenia/index.html','./apps/patinaje/index.html','./apps/atlas-fisioterapia/index.html','./apps/brasa/index.html'
];
self.addEventListener('install', event => event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(FILES)).then(() => self.skipWaiting())));
self.addEventListener('activate', event => event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key !== CACHE).map(key => caches.delete(key)))).then(() => self.clients.claim())));
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET' || new URL(event.request.url).origin !== self.location.origin) return;
  const isDocument = event.request.mode === 'navigate' || event.request.destination === 'document';
  if (isDocument) {
    // Network-first for HTML prevents stale app versions from being served after deployment.
    event.respondWith(fetch(event.request).then(response => {
      if (response.ok) {
        const copy = response.clone();
        event.waitUntil(caches.open(CACHE).then(cache => cache.put(event.request, copy)));
      }
      return response;
    }).catch(() => caches.match(event.request).then(cached => cached || caches.match('./index.html'))));
  } else {
    event.respondWith(caches.match(event.request).then(cached => cached || fetch(event.request).then(response => {
      if (response.ok) {
        const copy = response.clone();
        event.waitUntil(caches.open(CACHE).then(cache => cache.put(event.request, copy)));
      }
      return response;
    })));
  }
});