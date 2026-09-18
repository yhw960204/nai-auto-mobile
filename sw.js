/* NAI Auto Mobile 서비스 워커 — 빌드할 때 vite.config.ts가 목록과 버전을 채운다.
 *
 * - 앱 셸은 설치할 때 전부 캐시한다 → 홈 화면 앱이 오프라인에서도 열린다.
 * - HTML은 네트워크 우선(새 버전을 바로 받는다), 나머지 자기 출처 파일은 캐시 우선.
 * - NovelAI API 같은 다른 출처 요청은 절대 건드리지 않는다.
 * - 새 버전은 기다렸다가, 앱이 "업데이트" 버튼으로 SKIP_WAITING을 보내면 교체된다.
 */
const CACHE = "nai-mobile-6e107b83a076";
const PRECACHE = ["./","assets/index-CtMj7W4k.css","assets/index-K-up86an.js","icons/apple-touch-icon.png","icons/favicon-64.png","icons/icon-192.png","icons/icon-512.png","icons/icon-maskable-512.png","manifest.webmanifest","tags.csv"];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(PRECACHE)));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k.startsWith("nai-mobile-") && k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("message", (event) => {
  if (event.data === "SKIP_WAITING") self.skipWaiting();
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE).then((cache) => cache.put("./", copy));
          return response;
        })
        .catch(() => caches.match("./").then((cached) => cached || Response.error())),
    );
    return;
  }

  event.respondWith(caches.match(request).then((cached) => cached || fetch(request)));
});
