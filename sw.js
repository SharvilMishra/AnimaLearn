const CACHE_NAME = 'animalearn-v2'; // <-- CHANGE THIS NUMBER EVERY TIME YOU UPDATE YOUR CODE!
const urlsToCache = ['/', '/index.html', '/styles.css'];

self.addEventListener('install', event => {
  // Tell the browser to activate the new worker immediately instead of waiting
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('activate', event => {
  // Delete old caches
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
    ))
  );
  // Take control of all open tabs immediately
  event.waitUntil(clients.claim());
});

self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});
