// Stundennachweis – Service Worker
// Sorgt dafür, dass die App auch ohne Internetverbindung öffnet
// (nutzt die zuletzt geladene Version aus dem Cache).

const CACHE_NAME = "stundennachweis-cache-v1";
const APP_SHELL_URL = "./index.html";

self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.add(APP_SHELL_URL).catch(() => {}))
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Strategie: Netzwerk zuerst (damit du immer die neueste Version bekommst,
// sobald Internet da ist), Cache als Rückfalloption ohne Internet.
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy)).catch(() => {});
        return response;
      })
      .catch(() =>
        caches.match(event.request).then((cached) => cached || caches.match(APP_SHELL_URL))
      )
  );
});
