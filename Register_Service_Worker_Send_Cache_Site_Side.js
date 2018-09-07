
var Cache_Files = [];

Cache_Files = learn_page();

if (navigator.serviceWorker.controller) {
    console.log('Service Worker Already Registered')
    navigator.serviceWorker.controller.postMessage({Cache_Files});

} else {
    navigator.serviceWorker.register('service_worker.js', {
            scope: './'
    }).then(function(registered) {
        console.log('Service Worker Registered for scope:'+ registered.scope);
        registered.active.postMessage({Cache_Files});
    });
}
function learn_page() {
    var scripts_links = [];
    var link_rel = [];
    var img_links = [];
    $('script').each(function(index) {
        if (this.src) {
            scripts_links.push(this.src)
        }
    });
    $('style').each(function(index) {});
    $('link').each(function(index) {
        if (this.rel) {
            link_rel.push(this.href)
        }
    });
    $('img').each(function(index) {
        if (this.src) {
            img_links.push(this.src)
        }
        if (this.href) {
            img_links.push(this.href)
        }
    });
    var cache_files = [];
    scripts_links.forEach(function(item) {
        cache_files.push(item)
    });
    link_rel.forEach(function(item) {
        cache_files.push(item)
    });
    img_links.forEach(function(item) {
        cache_files.push(item)
    });
    return cache_files
}
