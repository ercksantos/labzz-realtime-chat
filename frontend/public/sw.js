/// <reference lib="webworker" />

const CACHE_NAME = 'labzz-chat-v1';
const STATIC_CACHE = 'labzz-static-v1';
const DYNAMIC_CACHE = 'labzz-dynamic-v1';

// Assets para cache imediato
const STATIC_ASSETS = [
    '/',
    '/login',
    '/register',
    '/chat',
    '/offline',
    '/manifest.json',
];

// Install - cachear assets estáticos
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(STATIC_CACHE).then((cache) => {
            return cache.addAll(STATIC_ASSETS);
        })
    );
    // Ativar imediatamente
    self.skipWaiting();
});

// Activate - limpar caches antigos
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames
                    .filter((name) => name !== STATIC_CACHE && name !== DYNAMIC_CACHE)
                    .map((name) => {
                        return caches.delete(name);
                    })
            );
        })
    );
    // Assumir controle de todos os clientes
    self.clients.claim();
});

// Fetch - estratégias de cache
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Ignorar requests não-GET
    if (request.method !== 'GET') {
        return;
    }

    // Ignorar API - sempre buscar na rede
    if (url.pathname.startsWith('/api')) {
        return;
    }

    // Ignorar WebSocket
    if (url.protocol === 'ws:' || url.protocol === 'wss:') {
        return;
    }

    // Network-first para páginas HTML
    if (request.headers.get('accept')?.includes('text/html')) {
        event.respondWith(networkFirst(request));
        return;
    }

    // Cache-first para assets estáticos
    if (isStaticAsset(url.pathname)) {
        event.respondWith(cacheFirst(request));
        return;
    }

    // Stale-while-revalidate para demais requests
    event.respondWith(staleWhileRevalidate(request));
});

// Estratégia: Network First (HTML)
async function networkFirst(request) {
    try {
        const networkResponse = await fetch(request);
        if (networkResponse.ok) {
            const cache = await caches.open(DYNAMIC_CACHE);
            cache.put(request, networkResponse.clone());
        }
        return networkResponse;
    } catch (error) {
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }
        // Página offline como fallback
        return caches.match('/offline');
    }
}

// Estratégia: Cache First (assets estáticos)
async function cacheFirst(request) {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
        return cachedResponse;
    }
    try {
        const networkResponse = await fetch(request);
        if (networkResponse.ok) {
            const cache = await caches.open(STATIC_CACHE);
            cache.put(request, networkResponse.clone());
        }
        return networkResponse;
    } catch (error) {
        // Placeholder SVG para imagens
        if (request.destination === 'image') {
            return new Response(
                '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><rect fill="#ddd" width="200" height="200"/></svg>',
                { headers: { 'Content-Type': 'image/svg+xml' } }
            );
        }
        throw error;
    }
}

// Estratégia: Stale While Revalidate
async function staleWhileRevalidate(request) {
    const cache = await caches.open(DYNAMIC_CACHE);
    const cachedResponse = await cache.match(request);

    const fetchPromise = fetch(request).then((networkResponse) => {
        if (networkResponse.ok) {
            cache.put(request, networkResponse.clone());
        }
        return networkResponse;
    });

    return cachedResponse || fetchPromise;
}

// Verifica se é asset estático
function isStaticAsset(pathname) {
    const staticExtensions = [
        '.js',
        '.css',
        '.png',
        '.jpg',
        '.jpeg',
        '.gif',
        '.svg',
        '.ico',
        '.woff',
        '.woff2',
        '.ttf',
        '.eot',
    ];
    return staticExtensions.some((ext) => pathname.endsWith(ext));
}

// Push notifications
self.addEventListener('push', (event) => {
    if (!event.data) return;

    const data = event.data.json();
    const options = {
        body: data.body,
        icon: '/icons/icon-192x192.png',
        badge: '/icons/badge-72x72.png',
        vibrate: [100, 50, 100],
        data: {
            url: data.url || '/chat',
        },
        actions: [
            { action: 'open', title: 'Abrir' },
            { action: 'close', title: 'Fechar' },
        ],
    };

    event.waitUntil(self.registration.showNotification(data.title, options));
});

// Click na notificação
self.addEventListener('notificationclick', (event) => {
    event.notification.close();

    if (event.action === 'close') return;

    const url = event.notification.data?.url || '/chat';

    event.waitUntil(
        self.clients.matchAll({ type: 'window' }).then((clientList) => {
            // Foca janela existente se aberta
            for (const client of clientList) {
                if (client.url.includes(url) && 'focus' in client) {
                    return client.focus();
                }
            }
            // Abrir nova janela
            return self.clients.openWindow(url);
        })
    );
});

// Background sync para mensagens offline
self.addEventListener('sync', (event) => {
    if (event.tag === 'sync-messages') {
        event.waitUntil(syncMessages());
    }
});

async function syncMessages() {
    // Sincronizar mensagens pendentes do IndexedDB
    console.log('[SW] Sincronizando mensagens offline...');
}
