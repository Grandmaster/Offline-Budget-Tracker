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
self.addEventListener("fetch", async function (event) {
  // Fetching data from indexedDB
  if (event.request.url.includes("/api/")) {
    await getDBData(event, (result) => {
      console.log(result);
      event.respondWith(result);
    });
  }
  // Fetching data from cache
  // if (event.request.url.includes("/api/")) {
  //   event.waitUntil(
  //     caches.open(data_cache_name).then((cache) => {
  //       return fetch(event.request)
  //         .then((response) => {
  //           // Clones data into data_cache if request was successful
  //           if (response.status == 200) {
  //             cache.put(event.request, response.clone());
  //           }
  //         })
  //         .catch((err) => {
  //           // If request was unsuccessful, tries to grab data from cache, in case it is there
  //           console.log(err);
  //           return cache.match(event.request);
  //         });
  //     })
  //   );
  //   return;
  // }
  // Fetching files
  // event.respondWith(
  //   caches.open(cache_name).then((cache) => {
  //     return cache.match(event.request).then((response) => {
  //       // fetches using the network if resource is not in the cache
  //       return response || fetch(event.request);
  //     });
  //   })
  // );
});

var getDBData = async function (event, cb) {
  var request = await indexedDB.open("transactionStore", 1);
  request.onupgradeneeded = function (event) {
    var db = event.target.result;
    var objectStore = db.createObjectStore("Finances", {
      autoIncrement: true,
    });
  };
  request.onsuccess = function (event) {
    console.log("I opened indexedDB from the service worker!");
    var db = event.target.result;
    var objectStore = db.transaction(["Finances"]).objectStore("Finances");
    var storeRequest = objectStore.getAll();

    storeRequest.onsuccess = function (event) {
      console.log("Got all results from indexedDB");
      console.log(storeRequest.result);
      cb(storeRequest.result);
    };
  };
};
