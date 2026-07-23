const CACHE_NAME = 'rncmusic-cache-v1';
const AUDIO_CACHE = 'rncmusic-audio-cache-v1';

self.addEventListener('install', (event) => {
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
    const url = new URL(event.request.url);

    // 🔥 MESIN PENYEDOT AUDIO: Semua lagu yang diputer otomatis disimpen ke memori HP 🔥
    if (url.pathname.includes('/api/audio')) {
        event.respondWith(
            caches.match(event.request).then((cachedResponse) => {
                // Kalau kuota abis / offline, ambil dari memori HP!
                if (cachedResponse) {
                    return cachedResponse;
                }
                // Kalau ada kuota, ambil dari internet trus simpen diem-diem
                return fetch(event.request).then((networkResponse) => {
                    // Abaikan kalau gagal/error
                    if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'cors') {
                        return networkResponse;
                    }
                    const responseClone = networkResponse.clone();
                    caches.open(AUDIO_CACHE).then((cache) => {
                        cache.put(event.request, responseClone);
                    });
                    return networkResponse;
                }).catch(() => {
                    // Abaikan error pas offline
                });
            })
        );
    }
});