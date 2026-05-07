const CACHE_NAME = 'kakeibo-v1';

// アプリシェルとして事前キャッシュするリソース
const PRECACHE_URLS = [
    '/',
    '/report',
];

// インストール: アプリシェルを事前キャッシュ
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS)),
    );
    // 既存の SW を待たずに即アクティブ化
    self.skipWaiting();
});

// アクティベート: 古いキャッシュを削除
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) =>
            Promise.all(
                keys
                    .filter((key) => key !== CACHE_NAME)
                    .map((key) => caches.delete(key)),
            ),
        ),
    );
    // 全クライアントの制御を即時引き継ぐ
    self.clients.claim();
});

// フェッチ: Network-first（オフライン時はキャッシュにフォールバック）
self.addEventListener('fetch', (event) => {
    const { request } = event;

    // POST / API リクエストはキャッシュしない
    if (
        request.method !== 'GET' ||
        request.url.includes('/api/') ||
        request.url.includes('/_next/webpack')
    ) {
        return;
    }

    // ナビゲーション（HTML）: Network-first
    if (request.mode === 'navigate') {
        event.respondWith(
            fetch(request)
                .then((response) => {
                    if (response.ok) {
                        const clone = response.clone();
                        caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
                    }
                    return response;
                })
                .catch(() => caches.match(request).then((cached) => cached ?? caches.match('/'))),
        );
        return;
    }

    // 静的アセット（JS/CSS/画像）: Cache-first
    if (
        request.url.includes('/_next/static') ||
        request.url.includes('/icon.svg')
    ) {
        event.respondWith(
            caches.match(request).then(
                (cached) =>
                    cached ??
                    fetch(request).then((response) => {
                        if (response.ok) {
                            const clone = response.clone();
                            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
                        }
                        return response;
                    }),
            ),
        );
    }
});
