
const CACHE_NAME = "nexora-ai-v3";

const FILES = [
  "/NEXORA-AI-/",
  "/NEXORA-AI-/index.html",
  "/NEXORA-AI-/manifest.json",
  "/NEXORA-AI-/icons/icon-192.png",
  "/NEXORA-AI-/icons/icon-512.png"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(FILES))
  );
  self.skipWaiting();
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key =>
            key.startsWith("nexora-ai-") &&
            key !== CACHE_NAME
          )
          .map(key => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;

  const url = new URL(event.request.url);

  if (url.origin !== self.location.origin) return;

  event.respondWith(
    fetch(event.request)
      .then(response => {
        if (response.ok) {
          const copy = response.clone();

          event.waitUntil(
            caches.open(CACHE_NAME)
              .then(cache => cache.put(event.request, copy))
          );
        }

        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
