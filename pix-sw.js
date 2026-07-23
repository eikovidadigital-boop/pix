/* Service worker do Gerador de Pix — guarda tudo para funcionar offline */
var CACHE = "gerador-pix-v1";
var ARQUIVOS = [
  "pix.html",
  "pix-manifest.json",
  "https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js"
];

self.addEventListener("install", function(e){
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE).then(function(c){
      // cacheia o que der; se algum item externo falhar, não quebra a instalação
      return Promise.all(ARQUIVOS.map(function(url){
        return c.add(url).catch(function(){});
      }));
    })
  );
});

self.addEventListener("activate", function(e){
  e.waitUntil(
    caches.keys().then(function(keys){
      return Promise.all(keys.map(function(k){ if(k!==CACHE) return caches.delete(k); }));
    }).then(function(){ return self.clients.claim(); })
  );
});

self.addEventListener("fetch", function(e){
  // estratégia: cache primeiro, rede como reserva (e guarda o que baixar)
  e.respondWith(
    caches.match(e.request).then(function(hit){
      if(hit) return hit;
      return fetch(e.request).then(function(resp){
        try{
          var copy = resp.clone();
          caches.open(CACHE).then(function(c){ c.put(e.request, copy); });
        }catch(_){}
        return resp;
      }).catch(function(){ return hit; });
    })
  );
});
