const CACHE='amh-hidrologia-v4.1.8';
const CORE=["./", "./index.html", "./manifest.webmanifest", "./config.js", "./js/cloud.js", "./js/analytics.js", "./js/pwa.js", "./icons/icon-192.png", "./icons/icon-512.png", "./icons/apple-touch-icon.png", "./favicon.ico", "./images/img_01.webp", "./images/img_02.jpg", "./images/img_03.webp", "./images/img_04.webp", "./images/img_05.webp", "./images/img_06.webp", "./images/img_07.webp", "./images/img_08.webp", "./images/img_09.webp", "./images/img_10.webp", "./images/img_11.webp", "./images/img_12.webp", "./images/img_13.webp", "./images/img_14.webp", "./images/img_15.webp", "./images/img_16.webp", "./images/img_17.webp", "./images/img_18.jpg", "./images/img_19.webp", "./images/img_20.webp", "./images/img_21.webp", "./images/img_22.webp", "./images/img_23.webp", "./images/img_24.webp", "./images/img_25.webp", "./images/img_26.webp"];

self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(CORE)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('message',e=>{if(e.data?.type==='SKIP_WAITING')self.skipWaiting()});
self.addEventListener('fetch',e=>{
 const u=new URL(e.request.url);
 if(e.request.method!=='GET') return;
 if(u.hostname.includes('supabase.co')||u.hostname.includes('google-analytics.com')||u.hostname.includes('googletagmanager.com')) return;
 if(u.origin!==location.origin) return;
 if(e.request.mode==='navigate'){
   e.respondWith(fetch(e.request).then(r=>{const c=r.clone();caches.open(CACHE).then(x=>x.put(e.request,c));return r}).catch(()=>caches.match('./index.html')));return;
 }
 e.respondWith(caches.match(e.request).then(hit=>hit||fetch(e.request).then(r=>{if(r.ok){const c=r.clone();caches.open(CACHE).then(x=>x.put(e.request,c))}return r})));
});
