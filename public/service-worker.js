// File that will allow the user to use the site even when offline.
// ===============================================================

// Files to cache
const files_to_cache = ["/", "/index.html", "/index.js", "/styles.css"];

const cache_name = "static-cache";

// Installing the service worker
self.addEventListener("install", function (evt) {
  evt.waitUntil(
    caches.open(cache_name).then((cache) => {
      console.log("Your files were pre-cached successfully!");
      return cache.addAll(files_to_cache);
    })
  );

  self.skipWaiting();
});
