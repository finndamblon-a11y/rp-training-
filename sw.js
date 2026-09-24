// Hält alle Dateien der App im Cache, damit sie ohne Internet startet.
// Nach Änderungen an den Dateien die Versionsnummer erhöhen.
const CACHE = 'rp-training-v22';
const FILES = ['./', './index.html', './manifest.webmanifest',
               './app-icon-180-v3.png', './app-icon-192-v3.png', './app-icon-512-v3.png', './finn.jpg'];

// Beim Installieren am Browser-Cache vorbei laden, sonst landet eine bis zu
// 10 Minuten alte Fassung (GitHub Pages: max-age=600) im Offline-Speicher
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE)
    .then(c => c.addAll(FILES.map(f => new Request(f, { cache: 'reload' }))))
    .then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

// Erst beim Server nachfragen (no-cache: immer neueste Fassung), sonst aus dem Offline-Speicher
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET' || new URL(e.request.url).origin !== location.origin) return;
  e.respondWith(
    fetch(e.request, { cache: 'no-cache' })
      .then(res => { const copy = res.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); return res; })
      .catch(() => caches.match(e.request, { ignoreSearch: true }).then(r => r || caches.match('./index.html')))
  );
});
