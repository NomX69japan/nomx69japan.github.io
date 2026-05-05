// club 道〜TAO〜 ライト版 Service Worker
// Web Push 通知の受信とクリック時の遷移を担当

const CACHE_NAME = 'tao-lite-v1';

// インストール時：すぐ activate へ進ませる
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

// アクティベート時：すぐ全クライアントを掌握
self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// プッシュ通知受信
self.addEventListener('push', (event) => {
  let data = { title: '通知', body: '', tag: 'tao-default', url: '/', type: 'info' };

  if (event.data) {
    try {
      data = Object.assign(data, event.data.json());
    } catch (e) {
      // ペイロード破損時はテキストとして
      try {
        data.body = event.data.text();
      } catch (_) {}
    }
  }

  // 通知種別による絵文字付きタイトル（Workerからtitleに既に含めて送ってる場合はそのまま）
  const opts = {
    body: data.body || '',
    tag: data.tag || 'tao-' + Date.now(),
    icon: '/club-tao-icon-192.png', // アイコンが無くてもブラウザがデフォルト表示
    badge: '/club-tao-icon-192.png',
    data: { url: data.url || '/club-tao.html', type: data.type || 'info' },
    requireInteraction: false,
    renotify: true,
    vibrate: [200, 100, 200],
  };

  event.waitUntil(
    self.registration.showNotification(data.title || 'club 道〜TAO〜', opts)
  );
});

// 通知クリック時：アプリを開く
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = (event.notification.data && event.notification.data.url) || '/club-tao.html';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // すでに開いているタブがあればそれにフォーカス
      for (const client of clientList) {
        if (client.url.includes('club-tao.html') && 'focus' in client) {
          return client.focus();
        }
      }
      // なければ新規で開く
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
    })
  );
});
