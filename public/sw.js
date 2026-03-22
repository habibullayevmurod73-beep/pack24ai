// Service Worker for Push Notifications
// Bu fayl public/ papkasida bo'lishi kerak: public/sw.js

self.addEventListener('push', function(event) {
    if (!event.data) return;

    let data = { title: 'Pack24', body: 'Yangi xabar', icon: '/favicon.ico', badge: '/favicon.ico', url: '/' };
    try {
        data = { ...data, ...event.data.json() };
    } catch {
        data.body = event.data.text();
    }

    event.waitUntil(
        self.registration.showNotification(data.title, {
            body:  data.body,
            icon:  data.icon  || '/favicon.ico',
            badge: data.badge || '/favicon.ico',
            data:  { url: data.url || '/' },
            vibrate: [200, 100, 200],
            requireInteraction: false,
        })
    );
});

self.addEventListener('notificationclick', function(event) {
    event.notification.close();
    const url = event.notification.data?.url || '/';
    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(clientList) {
            for (const client of clientList) {
                if (client.url === url && 'focus' in client) return client.focus();
            }
            if (clients.openWindow) return clients.openWindow(url);
        })
    );
});

self.addEventListener('install', function(event) {
    self.skipWaiting();
});

self.addEventListener('activate', function(event) {
    event.waitUntil(clients.claim());
});
