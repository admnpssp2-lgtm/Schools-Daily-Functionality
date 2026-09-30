const CACHE_NAME = "schools-daily-functionality-v2";

const FILES_TO_CACHE = [
  "./",
  "./index.html",
  "./manifest.json",
  "./service-worker.js"
];


/* ============================================================
   INSTALL
   ============================================================ */

self.addEventListener("install", event => {

  event.waitUntil(

    caches.open(CACHE_NAME)
      .then(cache => {

        return cache.addAll(
          FILES_TO_CACHE
        );

      })

  );

  self.skipWaiting();

});


/* ============================================================
   ACTIVATE
   ============================================================ */

self.addEventListener("activate", event => {

  event.waitUntil(

    caches.keys()
      .then(cacheNames => {

        return Promise.all(

          cacheNames
            .filter(
              cacheName =>
                cacheName !== CACHE_NAME
            )
            .map(
              cacheName =>
                caches.delete(cacheName)
            )

        );

      })

  );

  self.clients.claim();

});


/* ============================================================
   FETCH
   ============================================================ */

self.addEventListener("fetch", event => {

  /*
   * POST requests ko Service Worker cache nahi karega.
   * Apps Script API request directly server par jayegi.
   */

  if (
    event.request.method !== "GET"
  ) {

    return;

  }


  event.respondWith(

    caches.match(event.request)
      .then(cachedResponse => {

        /*
         * Agar cache mein file available hai
         * to pehle cache response.
         */

        if (cachedResponse) {

          /*
           * Saath background mein latest version
           * network se update karne ki koshish.
           */

          fetch(event.request)
            .then(networkResponse => {

              if (
                networkResponse &&
                networkResponse.ok
              ) {

                caches.open(
                  CACHE_NAME
                ).then(cache => {

                  cache.put(
                    event.request,
                    networkResponse.clone()
                  );

                });

              }

            })
            .catch(() => {
              /*
               * Offline hai to kuch nahi karna.
               */
            });


          return cachedResponse;

        }


        /*
         * Cache mein nahi hai to network se load.
         */

        return fetch(event.request)
          .then(networkResponse => {

            if (
              networkResponse &&
              networkResponse.ok
            ) {

              const responseClone =
                networkResponse.clone();


              caches.open(
                CACHE_NAME
              ).then(cache => {

                cache.put(
                  event.request,
                  responseClone
                );

              });

            }


            return networkResponse;

          })
          .catch(() => {

            /*
             * Agar offline ho aur page cache mein
             * available ho to index.html return.
             */

            return caches.match(
              "./index.html"
            );

          });

      })

  );

});
