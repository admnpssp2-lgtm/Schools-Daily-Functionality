const CACHE_NAME =
  "schools-daily-functionality-v3";


const FILES_TO_CACHE = [

  "./",

  "./index.html",

  "./manifest.json",

  "./service-worker.js"

];



/* ============================================================
   INSTALL
   ============================================================ */

self.addEventListener(
  "install",
  event => {

    event.waitUntil(

      caches.open(
        CACHE_NAME
      )
      .then(
        cache =>
          cache.addAll(
            FILES_TO_CACHE
          )
      )

    );


    self.skipWaiting();

  }
);



/* ============================================================
   ACTIVATE
   ============================================================ */

self.addEventListener(
  "activate",
  event => {

    event.waitUntil(

      caches.keys()
        .then(
          cacheNames =>

            Promise.all(

              cacheNames
                .filter(
                  cacheName =>
                    cacheName !==
                    CACHE_NAME
                )
                .map(
                  cacheName =>
                    caches.delete(
                      cacheName
                    )
                )

            )
        )

    );


    self.clients.claim();

  }
);



/* ============================================================
   FETCH
   ============================================================ */

self.addEventListener(
  "fetch",
  event => {

    /*
     * POST requests ko cache nahi karna.
     * Apps Script requests direct server par jayengi.
     */

    if (
      event.request.method !==
      "GET"
    ) {

      return;

    }


    event.respondWith(

      fetch(
        event.request
      )
      .then(
        networkResponse => {

          /*
           * Latest network version ko cache
           * mein save kar dein.
           */

          if (
            networkResponse &&
            networkResponse.ok
          ) {

            const copy =
              networkResponse.clone();


            caches.open(
              CACHE_NAME
            )
            .then(
              cache => {

                cache.put(
                  event.request,
                  copy
                );

              }
            );

          }


          return networkResponse;

        }
      )
      .catch(
        () => {

          /*
           * Internet unavailable ho to
           * cached version use hogi.
           */

          return caches.match(
            event.request
          )
          .then(
            cachedResponse => {

              if (
                cachedResponse
              ) {

                return cachedResponse;

              }


              return caches.match(
                "./index.html"
              );

            }
          );

        }
      )

    );

  }
);
