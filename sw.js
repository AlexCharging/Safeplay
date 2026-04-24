// =============================================
// SafePlay — Service Worker (FIXED)
// GitHub Pages + iOS safe version
// =============================================

const CACHE_NAME = 'safeplay-v2';

// Files to cache (ALL RELATIVE PATHS)
const FILES_TO_CACHE = [
  './',
  './index.html',
  './css/main.css',
  './manifest.json',

  './games/solitaire/index.html',
  './games/solitaire/solitaire.css',
  './games/solitaire/solitaire.js',

  './games/sudoku/index.html',
  './games/sudoku/sudoku.css',
  './games/sudoku/sudoku.js'
];

// INSTALL
self.addEventListener('install', (event) => {
  self.skipWaiting(); // force activation of new SW

  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(FILES_TO_CACHE);
    })
  );
});

// ACTIVATE
self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      // delete old caches
      const keys = await caches.keys();
      await Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );

      // take control immediately
      return self.clients.claim();
    })()
  );
});

// FETCH (network first, fallback to cache = more stable for updates)
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // update cache in background
        const responseClone = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseClone);
        });
        return response;
      })
      .catch(() => {
        return caches.match(event.request);
      })
  );
});
