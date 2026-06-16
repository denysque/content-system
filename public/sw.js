// Минимальный service worker для PWA.
// Цель: устанавливаемость + аккуратный офлайн-фолбэк для навигации.
// НЕ кэширует страницы агрессивно (чтобы не залипала старая версия) и
// НЕ трогает /api/* и авторизацию.

const CACHE = "cs-shell-v1";
const OFFLINE_URL = "/offline.html";

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE).then((c) => c.add(OFFLINE_URL)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  // динамику и аналитику не перехватываем
  if (url.pathname.startsWith("/api/") || url.pathname.startsWith("/_vercel/")) {
    return;
  }

  // Навигация: сначала сеть, при офлайне — запасная страница.
  if (request.mode === "navigate") {
    event.respondWith(fetch(request).catch(() => caches.match(OFFLINE_URL)));
  }
});
