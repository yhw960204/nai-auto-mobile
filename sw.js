/* NAI Auto Mobile 서비스 워커 — 빌드할 때 vite.config.ts가 목록과 버전을 채운다.
 *
 * - 앱 셸은 설치할 때 전부 캐시한다 → 홈 화면 앱이 오프라인에서도 열린다.
 * - HTML은 네트워크 우선(새 버전을 바로 받는다), 나머지 자기 출처 파일은 캐시 우선.
 * - NovelAI API 같은 다른 출처 요청은 절대 건드리지 않는다.
 * - 새 버전은 기다렸다가, 앱이 "업데이트" 버튼으로 SKIP_WAITING을 보내면 교체된다.
 */
const CACHE = "nai-mobile-9b8556665ce8";
const PRECACHE = ["./",".git/COMMIT_EDITMSG",".git/HEAD",".git/config",".git/description",".git/hooks/applypatch-msg.sample",".git/hooks/commit-msg.sample",".git/hooks/fsmonitor-watchman.sample",".git/hooks/post-update.sample",".git/hooks/pre-applypatch.sample",".git/hooks/pre-commit.sample",".git/hooks/pre-merge-commit.sample",".git/hooks/pre-push.sample",".git/hooks/pre-rebase.sample",".git/hooks/pre-receive.sample",".git/hooks/prepare-commit-msg.sample",".git/hooks/push-to-checkout.sample",".git/hooks/sendemail-validate.sample",".git/hooks/update.sample",".git/index",".git/info/exclude",".git/logs/HEAD",".git/logs/refs/heads/gh-pages",".git/objects/12/325bec513b8c6e82f71bc3f97859db4c5e8654",".git/objects/16/e3a98ebae05f056540cce03c3ee1a7ba34c780",".git/objects/3e/d641bd0fa6b025f14fceeca30ed8b3af6827de",".git/objects/48/6373dc4483d3c50f145b3d748a9d709de66baa",".git/objects/49/b21ae8e1722c87acdb87f2b4d6cf4ccdbe8811",".git/objects/5b/3f755044579febaaa720fffb3dedc6451cac26",".git/objects/68/e16f9afc6ffc2283d19c7ec6dc27d4589b4e7c",".git/objects/75/aeda92be0dddc61db93f526198a4429c5fe111",".git/objects/84/a46b01686bc84729e231c9f6c94a8e4d959d30",".git/objects/86/6af2d13a6410eafd56ecae245c1f321cb4110c",".git/objects/9b/95730a2a2ce0df824e592d02599618456bb728",".git/objects/b4/f3622fe53ce9a2b36c22ebbdd2aed0bba7c043",".git/objects/b6/5dd8b7630d017e98f063e2a3fff384f20010fc",".git/objects/b8/5b5f298ae59558edb4ef514fd9d61f8da3b284",".git/objects/cf/0ec3a7617f4a49bfa96516c3ecea1ac9305350",".git/objects/d1/bccfd162f728f1c8830f117eb3788b841491c1",".git/objects/e6/9de29bb2d1d6434b8b29ae775ad8c2e48c5391",".git/objects/fd/b5a2bc6a93622664aaf225fcddd5e1bd4ab48e",".git/refs/heads/gh-pages","LICENSE","README.md","assets/index-CG2tchVd.js","assets/index-D07Yv27V.css","icons/apple-touch-icon.png","icons/favicon-64.png","icons/icon-192.png","icons/icon-512.png","icons/icon-maskable-512.png","manifest.webmanifest","tags.csv"];

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
