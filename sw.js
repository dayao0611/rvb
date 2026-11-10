/* Service worker: keep the Unity build on the device.
   - shell (html/css/loader) is cached during install
   - the big Build files are cached right after the game finishes loading,
     reusing the browser HTTP cache so nothing is downloaded twice
   - afterwards every request is served from Cache Storage (works offline) */
const VERSION = "rvb-v2";
const SHELL = [
  "./",
  "./index.html",
  "./logo.png",
  "./TemplateData/style.css",
  "./Build/Builds.loader.js",
];
const BUILD = [
  "./Build/5dd137757f4984e6d91e534128dc3c0c.data.unityweb",
  "./Build/4add35dcb0a5affaf21600b73add9568.js.unityweb",
  "./Build/dc0d98b7d3c428710de3651998f4d8d2.wasm.unityweb",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(VERSION).then(async (cache) => {
      await Promise.all(SHELL.map((url) => cache.add(url).catch(() => {})));
      await self.skipWaiting();
    })
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("message", (event) => {
  if (!event.data || event.data.type !== "precache-build") return;
  event.waitUntil(
    caches.open(VERSION).then(async (cache) => {
      // No cache:"reload" here: the files were just fetched by Unity and are
      // still in the HTTP cache, so this normally costs no extra traffic.
      await Promise.all(BUILD.map((url) => cache.add(url).catch(() => {})));
    })
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  if (url.pathname.endsWith("/sw.js")) return;

  if (req.mode === "navigate") {
    event.respondWith(
      caches
        .match("./index.html", { ignoreSearch: true })
        .then((hit) => hit || fetch(req).catch(() => caches.match("./index.html", { ignoreSearch: true })))
    );
    return;
  }

  event.respondWith(
    caches.match(req, { ignoreSearch: true }).then((hit) => {
      if (hit) return hit;
      return fetch(req).then((resp) => {
        if (resp && resp.ok && resp.type === "basic") {
          const copy = resp.clone();
          caches.open(VERSION).then((c) => c.put(req, copy)).catch(() => {});
        }
        return resp;
      });
    })
  );
});
