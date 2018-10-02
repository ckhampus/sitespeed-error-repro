/* global process */
const ASSETS_CACHE = `demo-assets-cache-v1`;

const cacheWhitelist = [ASSETS_CACHE];

self.addEventListener("install", () => {
  console.log("[ServiceWorker] Installed version", VERSION); // eslint-disable-line no-console
  return self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(cacheNames.map((cacheName) => {
        if (!/^demo-/.test(cacheName)) return;
        if (cacheWhitelist.indexOf(cacheName) === -1) {
          console.log("[ServiceWorker] Deleting old cache:", cacheName); // eslint-disable-line no-console
          return caches.delete(cacheName);
        }
      }))
    ).then(() => {
      return self.clients.claim();
    })
  );
});

self.addEventListener("fetch", (event) => {
  // Parse the URL:
  const requestURL = new URL(event.request.url);
  // Routing for local URLs
  if (requestURL.origin === location.origin && /\.(js|css|woff2?)$/.test(requestURL.pathname)) {
    // Try cache first, falling back to network
    event.respondWith(
      fetchFromAssetsCache(event.request)
        .catch((cache) => updateCacheFromNetwork(cache, event.request))
    );
    return;
  }
});

function fetchFromCache(cacheName, request) {
  return caches.open(cacheName).then((cache) => {
    return cache.match(request).then((response) => {
      return response || Promise.reject(cache);
    });
  });
}

function fetchFromAssetsCache(request) {
  return fetchFromCache(ASSETS_CACHE, request);
}

function updateCacheFromNetwork(cache, request) {
  return fetch(request).then((response) => {
    cache.put(request, response.clone());
    return response;
  });
}
