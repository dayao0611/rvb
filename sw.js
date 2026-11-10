/* Service worker: cache the whole Unity build once, then serve it from disk.
   Repeat visits and offline play no longer touch the network. */
const VERSION = "rvb-v1";
const ASSETS = [
  "./",
  "./index.html",
  "./logo.png",
  "./TemplateData/style.css",
  "./Build/Builds.loader.js",
  "./Build/5dd137757f4984e6d91e534128dc3c0c.data.unityweb",
  "./Build/4add35dcb0a5affaf21600b73add9568.js.unityweb",
  "./Build/dc0d98b7d3c428710de3651998f4d8d2.wasm.unityweb",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(VERSION).then(async (cache) => {
      // Add one by one so a single missing file cannot abort the whole install.
      await Promise.all(
        ASSETS.map((url) => cache.add(new Request(url, { cache: "reload" })).catch(() => {}))
      );
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

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  if (url.pathname.endsWith("/sw.js")) return;

  // Directory navigation -> cached index.html
  if (req.mode === "navigate") {
    event.respondWith(
      caches.match("./index.html").then((hit) => hit || fetch(req).catch(() => caches.match("./index.html")))
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
