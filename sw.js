const CACHE_NAME = 'animalearn-v3.01.01'; // Change this version number anytime you make a huge update
const urlsToCache = [
  '/', 
  '/index.html', 
  '/styles.css',
  '/js/config.js',
  '/js/utils.js',
  '/js/auth.js',
  '/js/db.js',
  '/js/router.js',
  '/js/animations.js',
  '/js/pages.js',
  '/js/app.js'
];

self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.map(key => {
        if (key !== CACHE_NAME) return caches.delete(key);
      })
    ))
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  // For normal page loads, try network first, fall back to cache
  event.respondWith(
    fetch(event.request)
      .then(response => {
        // If successful, clone it, put it in the cache, and return the network response
        if (response && response.status === 200) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, responseClone));
        }
        return response;
      })
      .catch(() => {
        // If the network fails (user is offline), try to get it from the cache
        return caches.match(event.request);
      })
  );
});
