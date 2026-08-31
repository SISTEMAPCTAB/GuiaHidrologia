(function(){
 let deferredPrompt=null;

 const isStandalone=()=>(
   window.matchMedia?.('(display-mode: standalone)').matches ||
   window.navigator.standalone === true
 );

 const isIOS=()=>/iphone|ipad|ipod/i.test(navigator.userAgent);

 function installButton(){
   return document.getElementById('installAppBtn');
 }

 function setInstallButton(){
   const b=installButton();
   if(!b)return;
   if(isStandalone()){
     b.hidden=true;
     return;
   }
   // En iPhone/iPad no existe beforeinstallprompt; mostramos el botón
   // para explicar cómo agregar la PWA a la pantalla de inicio.
   if(isIOS()){
     b.hidden=false;
     b.textContent='Instalar aplicación';
   }
 }

 function showIOSInstallHelp(){
   if(document.getElementById('iosInstallHelp'))return;

   const overlay=document.createElement('div');
   overlay.id='iosInstallHelp';
   overlay.setAttribute('role','dialog');
   overlay.setAttribute('aria-modal','true');
   overlay.style.cssText=[
     'position:fixed','inset:0','z-index:9999',
     'background:rgba(2,21,38,.62)','display:flex',
     'align-items:center','justify-content:center','padding:20px'
   ].join(';');

   overlay.innerHTML=`
     <div style="width:min(520px,100%);background:#fff;border-radius:20px;padding:24px;box-shadow:0 24px 60px rgba(0,0,0,.28);color:#08243b">
       <div style="font-size:24px;font-weight:800;margin-bottom:10px">Instalar en iPhone o iPad</div>
       <div style="font-size:16px;line-height:1.55">
         En iOS la instalación no se abre con una ventana automática.
         Para instalar la guía:
         <ol style="padding-left:22px;margin:14px 0">
           <li>Toca <b>Compartir</b> <span aria-hidden="true">⬆️</span> en el navegador.</li>
           <li>Selecciona <b>Añadir a pantalla de inicio</b>.</li>
           <li>Toca <b>Añadir</b>.</li>
         </ol>
         Después podrás abrir <b>Guía de Hidrología AMH</b> como una aplicación.
       </div>
       <button id="closeIOSInstallHelp" type="button" style="margin-top:12px;border:0;border-radius:999px;background:#062b49;color:#fff;padding:11px 20px;font-weight:800;cursor:pointer">Entendido</button>
     </div>`;

   document.body.appendChild(overlay);
   overlay.querySelector('#closeIOSInstallHelp').onclick=()=>overlay.remove();
   overlay.addEventListener('click',e=>{if(e.target===overlay)overlay.remove()});
 }

 function network(){
  let b=document.getElementById('offlineBanner');
  if(!navigator.onLine){
    if(!b){
      b=document.createElement('div');
      b.id='offlineBanner';
      b.className='offline-banner';
      b.textContent='Sin conexión · el avance, examen y diploma requieren conexión al servidor.';
      document.body.appendChild(b)
    }
  } else if(b)b.remove();
  const n=document.getElementById('networkStatus');
  if(n)n.textContent=navigator.onLine
    ?'Conectado · avance sincronizado con Supabase'
    :'Sin conexión · las acreditaciones quedan bloqueadas';
 }

 addEventListener('online',network);
 addEventListener('offline',network);

 document.addEventListener('DOMContentLoaded',()=>{
   network();
   setInstallButton();
 });

 addEventListener('beforeinstallprompt',e=>{
   e.preventDefault();
   deferredPrompt=e;
   const b=installButton();
   if(b && !isStandalone()) b.hidden=false;
 });

 document.addEventListener('click',async e=>{
   if(e.target?.id!=='installAppBtn')return;

   if(isStandalone()){
     e.target.hidden=true;
     return;
   }

   if(deferredPrompt){
     deferredPrompt.prompt();
     await deferredPrompt.userChoice;
     deferredPrompt=null;
     e.target.hidden=true;
     return;
   }

   if(isIOS()){
     showIOSInstallHelp();
     return;
   }

   // Algunos navegadores móviles no exponen beforeinstallprompt.
   alert('Para instalar la guía, abre el menú del navegador y selecciona “Instalar aplicación” o “Añadir a pantalla de inicio”.');
 });

 addEventListener('appinstalled',()=>{
   deferredPrompt=null;
   const b=installButton();
   if(b)b.hidden=true;
 });

 if('serviceWorker' in navigator){
   addEventListener('load',async()=>{
     try{
       const reg=await navigator.serviceWorker.register('./service-worker.js',{scope:'./'});
       reg.addEventListener('updatefound',()=>{
         const w=reg.installing;
         w?.addEventListener('statechange',()=>{
           if(w.state==='installed'&&navigator.serviceWorker.controller)showUpdate(w)
         })
       })
     }catch(e){
       console.error('SW',e)
     }
   })
 }

 function showUpdate(worker){
   if(document.getElementById('updateBanner'))return;
   const d=document.createElement('div');
   d.id='updateBanner';
   d.className='update-banner';
   d.innerHTML='<span>Hay una nueva versión de la aplicación disponible.</span><button class="btn-primary" id="applyUpdate">Actualizar ahora</button>';
   document.body.appendChild(d);
   d.querySelector('#applyUpdate').onclick=()=>worker.postMessage({type:'SKIP_WAITING'})
 }

 navigator.serviceWorker?.addEventListener('controllerchange',()=>location.reload());
})();