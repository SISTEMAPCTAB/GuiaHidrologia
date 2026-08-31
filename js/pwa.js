(function(){
 let deferredPrompt=null;
 function network(){
  let b=document.getElementById('offlineBanner');
  if(!navigator.onLine){if(!b){b=document.createElement('div');b.id='offlineBanner';b.className='offline-banner';b.textContent='Sin conexión · el avance, examen y diploma requieren conexión al servidor.';document.body.appendChild(b)}} else if(b)b.remove();
  const n=document.getElementById('networkStatus');if(n)n.textContent=navigator.onLine?'Conectado · avance sincronizado con Supabase':'Sin conexión · las acreditaciones quedan bloqueadas';
 }
 addEventListener('online',network);addEventListener('offline',network);document.addEventListener('DOMContentLoaded',network);
 addEventListener('beforeinstallprompt',e=>{e.preventDefault();deferredPrompt=e;const b=document.getElementById('installAppBtn');if(b)b.hidden=false});
 document.addEventListener('click',async e=>{if(e.target?.id==='installAppBtn'&&deferredPrompt){deferredPrompt.prompt();await deferredPrompt.userChoice;deferredPrompt=null;e.target.hidden=true}});
 if('serviceWorker' in navigator){addEventListener('load',async()=>{try{const reg=await navigator.serviceWorker.register('./service-worker.js',{scope:'./'});reg.addEventListener('updatefound',()=>{const w=reg.installing;w?.addEventListener('statechange',()=>{if(w.state==='installed'&&navigator.serviceWorker.controller)showUpdate(w)})})}catch(e){console.error('SW',e)}})}
 function showUpdate(worker){if(document.getElementById('updateBanner'))return;const d=document.createElement('div');d.id='updateBanner';d.className='update-banner';d.innerHTML='<span>Hay una nueva versión de la aplicación disponible.</span><button class="btn-primary" id="applyUpdate">Actualizar ahora</button>';document.body.appendChild(d);d.querySelector('#applyUpdate').onclick=()=>{worker.postMessage({type:'SKIP_WAITING'})}}
 navigator.serviceWorker?.addEventListener('controllerchange',()=>location.reload());
})();
