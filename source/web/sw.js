/*
 * Offline shell for Text Crush.
 *
 * This file is served from the site ROOT, not from web/, because the game is split across two
 * directories: the page lives in web/ and the engine it loads lives in ../game/. A worker sitting at
 * web/sw.js is only allowed to answer requests under web/, so the engine would fall back to the
 * network and the game would not start offline. tools/stage-site.sh puts it where its scope covers
 * both, which is also where the page registers it from: navigator.serviceWorker.register("../sw.js").
 *
 * Strategy: answer from the cache and refresh it in the background. A new build therefore lands on a
 * visitor's second load, while a visitor in flight mode still gets the game.
 */

const VERSION = "textcrush-v1";

const SHELL = [
  "./",
  "./web/index.html",
  "./web/manifest.webmanifest",
  "./web/icons/icon-192.png",
  "./web/icons/icon-512.png",
  "./web/icons/icon-maskable-512.png",
  "./web/icons/apple-touch-icon-180.png",
  "./game/classes/model/Util.js",
  "./game/classes/model/Symbol.js",
  "./game/classes/model/Neighbor.js",
  "./game/classes/model/Position.js",
  "./game/classes/model/Board.js",
  "./game/classes/model/Game.js",
  "./game/classes/model/Sprite.js",
  "./game/classes/view/Tile.js",
  "./game/classes/view/Display.js"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(VERSION)
      // one missing file must not fail the whole install
      .then((cache) => Promise.all(SHELL.map((url) => cache.add(url).catch(() => null))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys
        .filter((key) => key !== VERSION)
        .map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;

  if (request.method !== "GET") {
    return;
  }

  const url = new URL(request.url);

  if (url.origin !== self.location.origin) {
    return;
  }

  event.respondWith(
    caches.match(request).then((cached) => {
      const network = fetch(request).then((response) => {
        if (response && response.ok) {
          const copy = response.clone();
          caches.open(VERSION).then((cache) => cache.put(request, copy));
        }
        return response;
      }).catch(() => cached);

      return cached || network;
    })
  );
});
