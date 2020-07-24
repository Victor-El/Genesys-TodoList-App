const CACHE_NAME = "todo-app-site-cache-v1";

const URLS_TO_CACHE = [
  '/',
  '/style.css',
  '/script.js',
  '/favicon.png'
];

self.addEventListener('install', function (event) {
  console.log("Service Worker Installed");
  console.log(event);

  event.waitUntil(caches.open(CACHE_NAME).then(function (cache) {
    console.log("Opened cache");
    cache.keys().then(function (keys) {
      keys.forEach((request) => {
        cache.delete(request);
      });
    });
    return cache.addAll(URLS_TO_CACHE);
  }));
});

self.addEventListener('activate', function () {
  console.log("Activated");
});

self.addEventListener('fetch', function (event) {
  event.respondWith(caches.match(event.request).then(function (response) {
    if (response) {
      return response;
    }

    return fetch(event.request).then(function (response) {
      if (!response || response.status !== 200 || response.type !== 'basic') {
        return response;
      }

      const clonedResponse = response.clone();
      caches.open(CACHE_NAME).then(function (cache) {
        cache.put(event.request, clonedResponse);
      });

      return response;
    });
  }));
});