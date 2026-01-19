const CACHE_NAME = "quran-cache-v2";

const OFFLINE_URLS = [
  "/",
  "/index.html",
  "/manifest.json",
  "/quran-192.png",
  "/quran-512.png"
];

// INSTALL
self.addEventListener("install", e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(OFFLINE_URLS);
    })
  );
  self.skipWaiting();
});

// ACTIVATE
self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

// FETCH
self.addEventListener("fetch", e => {

  // صور القرآن
  if (e.request.url.includes("/hafs/")) {
    e.respondWith(
      caches.open(CACHE_NAME).then(cache =>
        cache.match(e.request).then(res => {
          return (
            res ||
            fetch(e.request).then(netRes => {
              cache.put(e.request, netRes.clone());
              return netRes;
            })
          );
        })
      )
    );
    return;
  }

  // باقي الملفات
  e.respondWith(
    caches.match(e.request).then(r => r || fetch(e.request))
  );
});