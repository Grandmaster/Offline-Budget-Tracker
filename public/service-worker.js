// File that will allow the user to use the site even when offline.
// ===============================================================

// Test comment

// Files to cache
const files_to_cache = ["/", "/index.html", "/js/index.js", "/styles.css"];

const cache_name = "static-cache";
const data_cache_name = "data-cache";

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

// Activating the current service worker
self.addEventListener("activate", function (evt) {
  evt.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(
        keyList.map((key) => {
          if (key !== cache_name && key !== data_cache_name) {
            console.log("Removing old cache data", key);
            return caches.delete(key);
          }
        })
      );
    })
  );

  self.clients.claim();
});

// Fetching using the service worker
self.addEventListener("fetch", function (event) {
  // Fetching data
  if (event.request.url.includes("/api/")) {
    event.waitUntil(
      caches.open(data_cache_name).then((cache) => {
        return fetch(event.request)
          .then((response) => {
            // Clones data into data_cache if request was successful
            if (response.status == 200) {
              cache.put(event.request, response.clone());
            }
          })
          .catch((err) => {
            // If request was unsuccessful, tries to grab data from cache, in case it is there
            console.log(err);
            return cache.match(event.request);
          });
      })
    );
    return;
  }
  // Fetching files
  event.respondWith(
    caches.open(cache_name).then((cache) => {
      return cache.match(event.request).then((response) => {
        // fetches using the network if resource is not in the cache
        return response || fetch(event.request);
      });
    })
  );
});
