// アプリ本体のファイルだけを保存します。CSVなどの利用者のデータは扱いません。
// index.html などを更新したら、VERSION の数字を上げてください。
const VERSION = 1;
const CACHE = 'kakeibo-v' + VERSION;
const ASSETS = ['./', './index.html', './manifest.webmanifest', './icons/icon-192.png', './icons/icon-512.png', './icons/icon-maskable-512.png', './icons/apple-touch-icon.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// 保存済みのファイルをすぐ返し、裏で最新版に更新します（同じ場所のファイルだけ）。
self.addEventListener('fetch', e => {
  const r = e.request;
  if (r.method !== 'GET' || new URL(r.url).origin !== location.origin) return;
  e.respondWith(
    caches.match(r, { ignoreSearch: true }).then(hit => {
      const net = fetch(r)
        .then(res => { if (res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(r, copy)); } return res; })
        .catch(() => hit || (r.mode === 'navigate' ? caches.match('./index.html') : undefined));
      return hit || net;
    })
  );
});
