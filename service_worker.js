//Copyright (C) 2017-2018, ViXiV Technologies - vixivtech@gmail.com

var CACHE = 'ViXiV-DynamicCache';
const OFFLINE = 'offline.html';

var blacklist = ['admin/'];
var precacheFiles = [
];
precacheOriginal = precacheFiles;

self.addEventListener('message', function(event) {
	data = event.data;
	console.log("Message Received from site!");
	console.log("Data: %o", data);
	precacheFiles = precacheOriginal;
        data.Cache_Files.forEach(function(item) {
		var loop = 0;
		console.log('Checking ', item);
		for (loop = 0; loop < blacklist.length; loop++) {
			console.log('	against blacklist:', blacklist[loop]);
			if (item.indexOf(blacklist[loop]) !== -1) { console.log("Not Caching Blacklisted URL:", item); return; }
		}
		//console.log("Adding non-blacklisted url to cache:", item);
		precacheFiles.push(item);
	});
        //console.log("Precache Files Updated from Site Message: %o", precacheFiles);
	precache();
});
self.addEventListener('install', function(event) {
  //console.log('[ViXiV] The service worker is being installed.');
  event.waitUntil(precache().then(function() {
    console.log('[ViXiV] Skip waiting on install');
    return self.skipWaiting();
  }));
});
self.addEventListener('activate', function(event) {
  return self.clients.claim();
});
self.addEventListener('fetch', function(event) {

    var responseBody = {
      body: '',
      id: event.request.url
    };

    var responseInit = {
      	status: 200,
	ok:'true',
	type:'basic',
	url:event.request.url,
	redirected:'false',
      	statusText: 'OK',
      	headers: {
        'Content-Type': 'application/json',
        'X-Mock-Response': 'yes'
      }
    };
    var mockResponse = new Response(JSON.stringify(responseBody), responseInit);
    var item;
    for (item = 0; item < blacklist.length; item++) {
	if (event.request.url.indexOf(blacklist[item]) !== -1) { console.log("Request Blocked due to Cache Blacklist: ",event.request.url); return mockResponse; }
    }
    event.respondWith(fromCache(event.request).catch(fromServer(event.request.clone())));
    event.waitUntil(update(event.request.clone()));
});

function precache() {
  return caches.open(CACHE).then(function (cache) {
    //console.log("Updating Cache for: ", precacheFiles);
    return cache.addAll(precacheFiles);
  });
}

function fromCache(request) {
  return caches.open(CACHE).then(function (cache) {
    //console.log("Checking Cache:", cache);
    //console.log("Checking %o", CACHE);
    //console.log("	against request:", request);
    return cache.match(request, {
      ignoreSearch: true
    }).then(function (matching) {
    	//console.log("Match:", matching);
	//return matching || Promise.reject('no-match');
        if(matching){
                return matching;
        }
        throw Error('No Local Cache Matching Request: ');

    }).catch(function(e) {
        //console.log(e, request, "Forwarding request to Network...");
        return fromServer(request);
     });

  });
}

function update(request) {
  return caches.open(CACHE).then(function (cache) {
    return fetch(request).then(function (response) {
      //console.log('Updated Response Received for Cache:', response);
      if(request.method === 'GET'){
	   cache.put(request, response);
	   return response;
      }
    });
  });
}

function fromServer(request){
  return fetch(request).then(function(response){ /*console.log('Updated Response Received from Network:', response);*/ if(response){return response;}else{throw Error('Offline');}}).catch(function(error){ return caches.match(OFFLINE); });
}
