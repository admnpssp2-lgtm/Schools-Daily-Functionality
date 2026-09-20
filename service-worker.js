const CACHE_NAME =
  "schools-daily-functionality-v1";


const APP_FILES = [

  "./",

  "./index.html",

  "./manifest.json",

  "./service-worker.js"

];


/* =====================================================
   INSTALL
===================================================== */

self.addEventListener(
  "install",
  function(event) {

    event.waitUntil(

      caches
        .open(
          CACHE_NAME
        )
        .then(
          function(cache) {

            return cache.addAll(
              APP_FILES
            );

          }
        )

    );


    self.skipWaiting();

  }
);


/* =====================================================
   ACTIVATE
===================================================== */

self.addEventListener(
  "activate",
  function(event) {

    event.waitUntil(

      caches
        .keys()
        .then(
          function(cacheNames) {

            return Promise.all(

              cacheNames
                .filter(
                  function(cacheName) {

                    return (
                      cacheName !==
                      CACHE_NAME
                    );

                  }
                )
                .map(
                  function(cacheName) {

                    return caches.delete(
                      cacheName
                    );

                  }
                )

            );

          }
        )

    );


    self.clients.claim();

  }
);


/* =====================================================
   FETCH
===================================================== */

self.addEventListener(
  "fetch",
  function(event) {


    /*
      POST requests such as
      Apps Script submissions
      must go directly to server.
    */

    if (
      event.request.method !==
      "GET"
    ) {

      return;

    }


    event.respondWith(

      caches
        .match(
          event.request
        )
        .then(
          function(cachedResponse) {


            if (
              cachedResponse
            ) {

              return cachedResponse;

            }


            return fetch(
              event.request
            )
            .then(
              function(networkResponse) {


                if (
                  networkResponse &&
                  networkResponse.status === 200
                ) {

                  const responseClone =
                    networkResponse.clone();


                  caches
                    .open(
                      CACHE_NAME
                    )
                    .then(
                      function(cache) {

                        cache.put(
                          event.request,
                          responseClone
                        );

                      }
                    );

                }


                return networkResponse;

              }
            );

          }
        )

    );

  }
);