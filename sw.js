const CACHE_NAME = 'oshioki-btn-v1';
const ASSETS_TO_CACHE = [
    './',
    './index.html',
    './assets/SmartphoneBase.png',
    './assets/ExecutionButton_Base.png',
    './assets/ExecutionButton_Frame.png',
    './assets/ExecutionButton_CheckIcon.png',
    './assets/press.wav',
    './assets/complete.wav'
];

// 安装事件：预缓存资源
self.addEventListener('install', (event) => {
    console.log('[SW] Installing...');
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('[SW] Caching assets');
            return cache.addAll(ASSETS_TO_CACHE);
        }).then(() => {
            return self.skipWaiting(); // 立即激活新 SW
        })
    );
});

// 激活事件：清理旧缓存
self.addEventListener('activate', (event) => {
    console.log('[SW] Activating...');
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('[SW] Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => {
            return self.clients.claim(); // 立即控制所有页面
        })
    );
});

// 拦截请求：缓存优先策略
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
            if (cachedResponse) {
                return cachedResponse;
            }

            // 未缓存则从网络获取
            return fetch(event.request).then((networkResponse) => {
                // 只缓存成功的 GET 请求
                if (
                    event.request.method === 'GET' &&
                    networkResponse &&
                    networkResponse.status === 200
                ) {
                    const responseToCache = networkResponse.clone();
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(event.request, responseToCache);
                    });
                }
                return networkResponse;
            }).catch(() => {
                // 网络失败且无缓存，返回离线页面（可选）
                console.warn('[SW] Fetch failed and no cache:', event.request.url);
            });
        })
    );
});
