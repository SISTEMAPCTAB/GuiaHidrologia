(function(){
 const id=(window.AMH_CONFIG||{}).GA4_MEASUREMENT_ID||'';
 if(!/^G-[A-Z0-9]+$/i.test(id)||id==='G-XXXXXXXXXX') return;
 const s=document.createElement('script');s.async=true;s.src='https://www.googletagmanager.com/gtag/js?id='+encodeURIComponent(id);document.head.appendChild(s);
 window.dataLayer=window.dataLayer||[];window.gtag=function(){dataLayer.push(arguments)};gtag('js',new Date());
 gtag('config',id,{send_page_view:true,allow_google_signals:false});
 window.amhTrack=function(name,params={}){try{gtag('event',name,params)}catch(_){}};
})();
