/* 日记 · 离线缓存（网络优先：有网就拿最新的，没网才用缓存） */
const CACHE = "riji-v1.1.3";

const CORE = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./version.json",
  "./assets/css/app.css",
  "./assets/js/main.js",
  "./assets/js/store.js",
  "./assets/js/views.js",
  "./assets/icons/icon-192.png",
  "./assets/icons/icon-512.png",
  "./assets/icons/apple-touch-icon.png",
  "./assets/icons/favicon-64.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE);
      await cache.addAll(CORE).catch(() => {});
      await self.skipWaiting();
    })()
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key)));
      await self.clients.claim();
    })()
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== location.origin) return;

  event.respondWith(
    (async () => {
      const cache = await caches.open(CACHE);
      try {
        const fresh = await fetch(request);
        if (fresh && fresh.ok) cache.put(request, fresh.clone());
        return fresh;
      } catch {
        const cached = await cache.match(request, { ignoreSearch: true });
        if (cached) return cached;
        if (request.mode === "navigate") {
          const shell = await cache.match("./index.html");
          if (shell) return shell;
        }
        return Response.error();
      }
    })()
  );
});
