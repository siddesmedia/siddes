var staticCacheName = "siddes_pwa_cache_v_2";

self.addEventListener('push', async event => {
    var data = event.data.json();

    console.log(data)

    var body = data.body
    var link = data.link
    var title = data.title
    var icon = '/img/favicon.jpg'



    self.clients.matchAll().then(all => all.forEach(client => {
        client.postMessage({
            msg: {
                title: title,
                body: body,
                link: link
            }
        });
    }));

    self.registration.showNotification(title, {
        body: body,
        icon: icon
    })
});

self.addEventListener("install", function (e) {
    e.waitUntil(
        caches.open(staticCacheName).then(function (cache) {
            return cache.addAll(['/company/cachefallback.html']);
        })
    );
});

self.addEventListener('activate', function (event) {
    console.log('Activated', event);
    fetch('/notisw.js').then(response =>
        function () {
            console.log(response)
        });

    event.waitUntil(
        caches.keys().then(function (cacheNames) {
            return Promise.all(
                cacheNames.filter(function (cacheName) {
                    // Return true if you want to remove this cache,
                    // but remember that caches are shared across
                    // the whole origin
                }).map(function (cacheName) {
                    return caches.delete(cacheName);
                })
            );
        })
    );
});

self.addEventListener("fetch", function (event) {
    // console.log(event.request.url);

    event.respondWith(
        caches.match(event.request).then(function (response) {
            return response || fetch(event.request);
        })
    );
});