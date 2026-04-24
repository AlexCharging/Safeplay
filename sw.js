// =============================================
// SafePlay — Service Worker
// This file makes the app work offline.
// Once the user has visited the site once,
// all the game files are saved on their device
// so it works even without an internet connection.
// =============================================

const CACHE_NAME = 'safeplay-v1';

// All the files we want to save for offline use
const FILES_TO_CACHE = [
  '/',
  '/index.html',
  '/css/main.css',
  '/manifest.json',
  '/games/solitaire/index.html',
  '/games/solitaire/solitaire.css',
  '/games/solitaire/solitaire.js',
  '/games/sudoku/index.html',
  '/games/sudoku/sudoku.css',
  '/games/sudoku/sudoku.js',
];

// When the service worker installs, cache all files
self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      console.log('SafePlay: caching files for offline use');
      return cache.addAll(FILES_TO_CACHE);
    })
  );
});

// When the app requests a file, serve it from cache if available
self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request).then(function(response) {
      // Return cached version if we have it, otherwise fetch from network
      return response || fetch(event.request);
    })
  );
});

// Clean up old caches when a new version is deployed
self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(keyList) {
      return Promise.all(
        keyList.map(function(key) {
          if (key !== CACHE_NAME) {
            console.log('SafePlay: removing old cache', key);
            return caches.delete(key);
          }
        })
      );
    })
  );
});
