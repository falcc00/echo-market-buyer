// Service worker Echo UA (TANPA cache / offline). Tugasnya:
//  1) Menampilkan notifikasi perangkat (di Android/Chrome `new Notification()` dilarang,
//     harus lewat registration.showNotification()).
//  2) Menerima Web Push dari server -> notifikasi tampil walau toko sedang ditutup.
//  3) Saat notifikasi diklik, fokus ke tab/app toko (atau buka baru).
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()));

// Handler kosong: supaya Chrome menganggap situs ini "installable". Semua request tetap lewat jaringan.
self.addEventListener('fetch', () => {});

self.addEventListener('push', (event) => {
    let data = {};
    try {
        data = event.data ? event.data.json() : {};
    } catch (e) {
        data = { body: event.data ? event.data.text() : '' };
    }
    const title = data.title || 'Echo UA';
    const options = {
        body: data.body || '',
        icon: 'echo_logo.png',
        data: { url: data.url || '/' }
    };
    // Tag yang sama dengan notifikasi dari halaman -> saling menggantikan, tidak dobel.
    if (data.tag) options.tag = data.tag;
    event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    const url = (event.notification.data && event.notification.data.url) || '/';
    event.waitUntil((async () => {
        const wins = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
        for (const w of wins) {
            if ('focus' in w) return w.focus();
        }
        if (self.clients.openWindow) return self.clients.openWindow(url);
    })());
});
