const CACHE_NAME = 'oshioki-btn-v2';
const ASSETS_TO_CACHE = [
    './index.html',
    './manifest.json',
    './sw.js',
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
    const req = event.request;

    // 对导航请求采用 网络优先 + 离线回退，避免返回被重定向的响应
    if (req.mode === 'navigate') {
        event.respondWith(
            fetch(req).then((networkResponse) => {
                // 仅缓存非重定向的 200 响应
                if (networkResponse && networkResponse.status === 200 && !networkResponse.redirected) {
                    const copy = networkResponse.clone();
                    caches.open(CACHE_NAME).then((cache) => cache.put(req, copy));
                }
                return networkResponse;
            }).catch(async () => {
                const cache = await caches.open(CACHE_NAME);
                return cache.match('./index.html');
            })
        );
        return;
    }

    // 其他资源：缓存优先
    event.respondWith(
        caches.match(req).then((cached) => {
            if (cached) return cached;
            return fetch(req).then((networkResponse) => {
                if (
                    req.method === 'GET' &&
                    networkResponse &&
                    networkResponse.status === 200 &&
                    !networkResponse.redirected
                ) {
                    const copy = networkResponse.clone();
                    caches.open(CACHE_NAME).then((cache) => cache.put(req, copy));
                }
                return networkResponse;
            });
        })
    );
});
