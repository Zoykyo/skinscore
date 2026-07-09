/* SkinScore service worker — offline app shell + push + notification click handling */
const CACHE = 'skinscore-v6';
const ASSETS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-maskable-512.png',
  './icons/apple-touch-icon.png'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Cache-first for app shell, network-first fallback, offline-safe.
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  // App shell (navigations + index.html) network-first so content/config updates land without a SW bump.
  if (e.request.mode === 'navigate' || /\/(index\.html)?$/.test(new URL(e.request.url).pathname)) {
    e.respondWith(
      fetch(e.request)
        .then((res) => { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(e.request, copy)).catch(() => {}); return res; })
        .catch(() => caches.match(e.request).then((c) => c || caches.match('./index.html')))
    );
    return;
  }
  // The research data file is network-first so weekly updates propagate; cache is the offline fallback.
  if (new URL(e.request.url).pathname.endsWith('skinscore-data.json')) {
    e.respondWith(
      fetch(e.request)
        .then((res) => { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(e.request, copy)).catch(() => {}); return res; })
        .catch(() => caches.match(e.request))
    );
    return;
  }
  e.respondWith(
    caches.match(e.request).then((cached) => {
      if (cached) return cached;
      return fetch(e.request)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(e.request, copy)).catch(() => {});
          return res;
        })
        .catch(() => caches.match('./index.html'));
    })
  );
});

// Server-sent daily recommendation (Web Push). Payload: {title, body, url}.
self.addEventListener('push', (e) => {
  let data = { title: 'SkinScore', body: 'Your daily skin plan is ready.', url: './index.html' };
  try { if (e.data) data = Object.assign(data, e.data.json()); } catch (_) {}
  e.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: './icons/icon-192.png',
      badge: './icons/icon-192.png',
      tag: 'skinscore-daily',
      data: { url: data.url || './index.html' }
    })
  );
});

self.addEventListener('notificationclick', (e) => {
  e.notification.close();
  const url = (e.notification.data && e.notification.data.url) || './index.html';
  e.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
      for (const c of clients) { if ('focus' in c) return c.focus(); }
      if (self.clients.openWindow) return self.clients.openWindow(url);
    })
  );
});
