/* Guía Hidrología AMH v4 - participante + Supabase */
(function(){
 const cfg=window.AMH_CONFIG||{}; let sb=null; let cloudProgress={done:[],activities:{}}; let cloudCertificate=null;
 const REQUIRED={
  0:[['mini','Mini evaluación']],
  1:[['mini','Mini evaluación'],['lluvia','Interpretación de lluvia']],
  2:[['mini','Mini evaluación'],['enos','Actividad ENOS']],
  3:[['mini','Mini evaluación']],4:[['mini','Mini evaluación']],
  5:[['mini','Mini evaluación'],['comparator','Comparador regional']],
  6:[['mini','Mini evaluación'],['route','Ruta del agua']],
  7:[['mini','Mini evaluación'],['route','Ruta del agua'],['time','Tiempo de tránsito']],
  8:[['mini','Mini evaluación'],['lluvia','Interpretación de lluvia'],['scenario','Escenario hidrológico']],
  9:[['mini','Mini evaluación'],['chontalpa','Clasificador Chontalpa']],
  10:[['mini','Mini evaluación'],['scenario','Escenario hidrológico'],['water','Permanencia del agua']],
  11:[['mini','Mini evaluación'],['comparator','Comparador regional']],
  12:[['mini','Mini evaluación'],['hydro','Lectura de hidrograma']],
  13:[['mini','Mini evaluación'],['scenario','Construcción de escenario']],
  14:[['mini','Mini evaluación']],
  15:[['mini','Mini evaluación'],['cases','Casos prácticos']],
  16:[['mini','Mini evaluación'],['tools','Herramientas interactivas']],
  17:[['mini','Mini evaluación']]
 };
 function configured(){return cfg.SUPABASE_URL&&cfg.SUPABASE_ANON_KEY&&!cfg.SUPABASE_URL.includes('TU-PROYECTO')&&!cfg.SUPABASE_ANON_KEY.includes('TU-ANON-KEY')}
 function client(){if(!configured())return null;if(!sb&&window.supabase?.createClient)sb=window.supabase.createClient(cfg.SUPABASE_URL,cfg.SUPABASE_ANON_KEY,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});return sb}
 function esc(v){return String(v??'').replace(/[&<>"']/g,s=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[s]))}
 function notice(){return '<div class="warn"><b>Configuración pendiente.</b><br>Debes colocar SUPABASE_URL y SUPABASE_ANON_KEY en <code>config.js</code> antes de publicar.</div>'}
 async function loadProfile(u){const {data,error}=await client().from('profiles').select('*').eq('id',u.id).single();if(error)throw error;return data}
 async function touch(){try{await client().rpc('touch_last_access')}catch(_){}}
 async function loadProgress(){
  const c=client(); const {data:p,error}=await c.from('course_progress').select('completed_modules,updated_at').eq('user_id',currentUser.id).single();if(error)throw error;
  const {data:a}=await c.from('activity_completions').select('module_index,activity_id,completed_at').eq('user_id',currentUser.id);
  const acts={};(a||[]).forEach(x=>{(acts[x.module_index]??=new Set()).add(x.activity_id)});
  const {data:att}=await c.from('exam_attempts').select('score,correct_count,total_questions,approved,created_at').eq('user_id',currentUser.id).order('created_at',{ascending:false}).limit(1).maybeSingle();
  cloudProgress={done:(p?.completed_modules||[]).map(Number),activities:acts,finalScore:att?.score,finalCorrect:att?.correct_count,finalTotal:att?.total_questions||20,finalApproved:!!att?.approved,finalDate:att?.created_at}; return cloudProgress;
 }
 async function loadCert(){const {data}=await client().from('certificates').select('*').eq('user_id',currentUser.id).eq('course_code',cfg.COURSE_CODE||'AMH-HID-2026').maybeSingle();cloudCertificate=data||null;return cloudCertificate}
 async function enter(u,p){currentUser={id:u.id,email:u.email,name:p.full_name,role:p.role_title,inst:p.institution,mun:p.municipality,tel:p.phone,user:p.username};adminMode=false;guestMode=false;await Promise.all([loadProgress(),loadCert(),touch()]);startApp();renderNavCloud();renderModuleCloud(firstAvailable())}
 window.getProgress=()=>cloudProgress;window.setProgress=p=>{cloudProgress=p||{done:[],activities:{}}};
 window.togglePassword=function(inputId,button){const input=document.getElementById(inputId);if(!input||!button)return;const showing=input.type==='text';input.type=showing?'password':'text';button.textContent=showing?'👁 Mostrar':'🙈 Ocultar';button.setAttribute('aria-label',showing?'Mostrar contraseña':'Ocultar contraseña');button.setAttribute('aria-pressed',showing?'false':'true')};
 window.showRegister=function(){
  document.getElementById('hero').classList.add('hidden');
  const a=document.getElementById('authArea');a.classList.remove('hidden');
  a.innerHTML=`<h2>Crear cuenta</h2>${configured()?'':notice()}<div class="grid2"><div><label>Nombre completo</label><input id="rName" autocomplete="name"></div><div><label>Cargo o perfil</label><input id="rRole"></div><div><label>Institución / dependencia</label><input id="rInst"></div><div><label>Municipio</label><input id="rMun"></div><div><label>Correo electrónico</label><input id="rEmail" type="email" autocomplete="email"></div><div><label>Teléfono opcional</label><input id="rTel" autocomplete="tel"></div><div><label>Usuario</label><input id="rUser" autocomplete="username"></div><div><label>Contraseña</label><div class="password-wrap"><input id="rPass" type="password" minlength="8" autocomplete="new-password"><button class="password-toggle" type="button" onclick="togglePassword('rPass',this)" aria-label="Mostrar contraseña" aria-pressed="false">👁 Mostrar</button></div></div></div><button class="btn-green" id="registerBtn" type="button">Crear cuenta</button> <button class="btn-light" type="button" onclick="showLogin()">Ya tengo cuenta</button><div id="authMsg"></div><p class="small">El avance académico se conserva centralmente en Supabase.</p>`;
  document.getElementById('registerBtn').addEventListener('click',window.amhRegister);
 };
 window.showLogin=function(){
  document.getElementById('hero').classList.add('hidden');
  const a=document.getElementById('authArea');a.classList.remove('hidden');
  a.innerHTML=`<h2>Ingresar</h2>${configured()?'':notice()}<label>Correo electrónico</label><input id="loginUser" type="email" autocomplete="email"><label>Contraseña</label><div class="password-wrap"><input id="loginPass" type="password" autocomplete="current-password"><button class="password-toggle" type="button" onclick="togglePassword('loginPass',this)" aria-label="Mostrar contraseña" aria-pressed="false">👁 Mostrar</button></div><button class="btn-green" id="loginBtnParticipant" type="button">Ingresar</button> <button class="btn-light" type="button" onclick="showRegister()">Crear cuenta</button><div id="authMsg"></div><p class="small">El registro es obligatorio para cursar, conservar avance, presentar el examen y obtener diploma.</p>`;
  document.getElementById('loginBtnParticipant').addEventListener('click',window.amhLogin);
  document.getElementById('loginPass').addEventListener('keydown',e=>{if(e.key==='Enter')window.amhLogin()});
 };
 function setAuthMessage(text,type='warn'){
  const el=document.getElementById('authMsg');if(el)el.innerHTML=text?`<div class="${type}">${esc(text)}</div>`:'';
 }
 function setBusy(id,busy,label){const b=document.getElementById(id);if(!b)return;b.disabled=busy;b.textContent=busy?'Procesando…':label;}
 window.amhRegister=async function(){
  const c=client();if(!c){setAuthMessage('No fue posible conectar con Supabase.');return}
  const $=id=>document.getElementById(id);
  const meta={full_name:$('rName').value.trim(),role_title:$('rRole').value.trim(),institution:$('rInst').value.trim(),municipality:$('rMun').value.trim(),phone:$('rTel').value.trim(),username:$('rUser').value.trim()};
  const email=$('rEmail').value.trim().toLowerCase(),password=$('rPass').value;
  if(!meta.full_name||!email||!meta.username||password.length<8){setAuthMessage('Completa nombre, correo, usuario y contraseña de al menos 8 caracteres.');return}
  setBusy('registerBtn',true,'Crear cuenta');setAuthMessage('');
  try{
   const emailRedirectTo=new URL('./',document.baseURI).href;
   const {data,error}=await c.auth.signUp({email,password,options:{data:meta,emailRedirectTo}});
   if(error){setAuthMessage('No fue posible crear la cuenta: '+error.message);return}
   if(!data.session){document.getElementById('authArea').innerHTML='<h2>Cuenta creada</h2><div class="note">Revisa tu correo para confirmar tu cuenta y después inicia sesión.</div><button class="btn-green" type="button" onclick="showLogin()">Ingresar</button>';return}
   await enter(data.user,await loadProfile(data.user));window.amhTrack?.('sign_up',{method:'email'});
  }catch(e){console.error('Registro:',e);setAuthMessage('Ocurrió un problema al crear la cuenta. Intenta nuevamente.')}finally{setBusy('registerBtn',false,'Crear cuenta')}
 };
 window.amhLogin=async function(){
  const c=client();if(!c){setAuthMessage('No fue posible conectar con Supabase.');return}
  const email=document.getElementById('loginUser')?.value.trim().toLowerCase()||'';
  const password=document.getElementById('loginPass')?.value||'';
  if(!email||!password){setAuthMessage('Escribe tu correo electrónico y contraseña.');return}
  setBusy('loginBtnParticipant',true,'Ingresar');setAuthMessage('');
  try{
   const {data,error}=await c.auth.signInWithPassword({email,password});
   if(error||!data?.user){setAuthMessage('Correo o contraseña incorrectos.');return}
   let profile;
   try{profile=await loadProfile(data.user)}catch(pe){console.error('Perfil:',pe);await c.auth.signOut();setAuthMessage('La cuenta fue autenticada, pero no se pudo cargar su perfil. Contacta al administrador.');return}
   if(profile.is_admin){await c.auth.signOut();setAuthMessage('Esta cuenta corresponde al área administrativa. Ingresa desde el panel de administración.');return}
   await enter(data.user,profile);window.amhTrack?.('login',{method:'email'});
  }catch(e){console.error('Ingreso:',e);setAuthMessage('No fue posible completar el ingreso. Revisa tu conexión e intenta nuevamente.')}finally{setBusy('loginBtnParticipant',false,'Ingresar')}
 };
 // Alias de compatibilidad. Se mantienen, pero los botones usan nombres AMH propios
 // para evitar colisiones con funciones antiguas del HTML.
 window.register=window.amhRegister;
 window.login=window.amhLogin;
 window.logout=async()=>{if(client())await client().auth.signOut();location.reload()};
 function firstAvailable(){const d=cloudProgress.done||[];for(let i=0;i<(cfg.REQUIRED_MODULES||18);i++)if(!d.includes(i))return i;return cloudCertificate?19:18}
 function isComplete(i){return (cloudProgress.done||[]).includes(i)}
 function isUnlocked(i){if(i===0)return true;if(i<18)return isComplete(i-1);if(i===18)return Array.from({length:18},(_,x)=>x).every(isComplete);if(i===19)return !!cloudCertificate;return false}
 function actDone(i,id){return cloudProgress.activities?.[i]?.has?.(id)||false}
 function missing(i){return (REQUIRED[i]||[]).filter(([id])=>!actDone(i,id))}
 window.renderNavCloud=function(){const nav=document.getElementById('nav');nav.innerHTML=modules.map((m,i)=>{const locked=!isUnlocked(i),done=isComplete(i)||(i===18&&cloudProgress.finalApproved)||(i===19&&cloudCertificate);return `<button id="nav${i}" class="${locked?'locked':''} ${done?'done':''}" ${locked?'disabled':''} onclick="renderModuleCloud(${i});document.getElementById('sidebar').classList.remove('open')">${m.short}</button>`}).join('')+`<button onclick="showCertificate()">Diploma digital</button><button onclick="logout()">Salir</button>`};
 function reqBox(i){if(i>=18)return '';const miss=missing(i);const req=REQUIRED[i]||[];return `<div id="moduleReqBox" data-module="${i}" class="${miss.length?'activity-lock':'activity-ok'}"><b>${miss.length?'Actividades obligatorias':'Módulo completado'}</b><div class="req-list">${req.map(([id,label])=>`<div class="req-item"><span class="state">${actDone(i,id)?'✓':'○'}</span><span>${esc(label)}</span></div>`).join('')}</div>${miss.length?'<span>Realiza todas las actividades indicadas para habilitar el siguiente apartado.</span>':'<span>Tu avance quedó registrado en el servidor.</span>'}</div>`}
 function refreshModuleCompletionUI(i){
  if(currentModule!==i)return;
  const req=document.getElementById('moduleReqBox');
  if(req){const holder=document.createElement('div');holder.innerHTML=reqBox(i);const fresh=holder.firstElementChild;if(fresh)req.replaceWith(fresh)}
  const nextBtn=document.getElementById('nextModuleBtn');
  if(nextBtn)nextBtn.disabled=(i<18&&!isComplete(i))||(i===18&&!cloudProgress.finalApproved)||(i===19);
 }
 window.renderModuleCloud=function(i,options){if(!isUnlocked(i)){showToast('🔒 Completa el apartado anterior antes de continuar','info');return}const opts=options||{};const preserve=!!opts.preserveScroll;const savedY=Number.isFinite(opts.scrollY)?opts.scrollY:window.scrollY;currentModule=i;document.querySelectorAll('.nav button').forEach(x=>x.classList.remove('active'));document.getElementById('nav'+i)?.classList.add('active');let next=i+1;const nextDisabled=(i<18&&!isComplete(i))||(i===18&&!cloudProgress.finalApproved)||(i===19);document.getElementById('content').innerHTML=`<section class="module">${wrapTables(modules[i].html)}${i<18?miniEvalBlock(i):''}${reqBox(i)}<div class="footerNav"><button class="btn-light" ${i===0?'disabled':''} onclick="renderModuleCloud(${Math.max(0,i-1)})">Anterior</button><button id="nextModuleBtn" class="btn-primary" ${nextDisabled?'disabled':''} onclick="renderModuleCloud(${Math.min(modules.length-1,next)})">Siguiente</button></div></section>`;if(preserve){requestAnimationFrame(()=>window.scrollTo({top:savedY,left:0,behavior:'auto'}))}else{window.scrollTo({top:0,left:0,behavior:'auto'})}if(modules[i].short==='Glosario')searchGlossary();updateProgressCloud();if(!preserve)window.amhTrack?.('module_view',{module_index:i,module_name:modules[i].short})};
 window.renderModule=window.renderModuleCloud;
 window.updateProgressCloud=function(){if(!currentUser)return;const done=(cloudProgress.done||[]).filter(x=>x<18).length,pct=Math.round(done/18*100);const bar=document.getElementById('progBar'),txt=document.getElementById('progText');if(bar)bar.style.width=pct+'%';if(txt)txt.textContent=pct+'% · '+done+' de 18 apartados formativos';renderNavCloud()};
 window.updateProgress=window.updateProgressCloud;
 async function completeActivity(id){if(!navigator.onLine){showToast('Sin conexión: esta actividad no puede acreditarse todavía.','info');return false}const c=client();if(!c)return false;const moduleAtStart=currentModule;const savedY=window.scrollY;const beforeComplete=isComplete(moduleAtStart);const {data,error}=await c.rpc('complete_activity',{input_module:moduleAtStart,input_activity:id});if(error){console.error(error);showToast('No fue posible registrar la actividad.','info');return false}await loadProgress();const afterComplete=isComplete(moduleAtStart);updateProgressCloud();if(afterComplete)showToast('✓ Módulo completado y guardado','success');else showToast('✓ Actividad guardada','success');if(currentModule===moduleAtStart){refreshModuleCompletionUI(moduleAtStart);requestAnimationFrame(()=>window.scrollTo({top:savedY,left:0,behavior:'auto'}))}return true}
 // Mini evaluación: solo acredita cuando se responde correctamente. La pantalla conserva su posición.
 const originalMini=window.miniAnswer;window.miniAnswer=async function(btn,idx,ans){originalMini(btn,idx,ans);if(idx===ans&&currentModule<18){await completeActivity('mini')}};
 // Activity hooks keep original academic interactions and add server completion after real interaction.
 function hook(name,id,predicate=()=>true){const f=window[name];if(typeof f!=='function')return;window[name]=function(...args){const r=f.apply(this,args);try{if(predicate(args,r))completeActivity(id)}catch(_){}return r}}
 hook('interpretRain','lluvia');hook('quickFeedback','enos',a=>a[1]===true);hook('compareRegions','comparator');hook('nextRoute','route',a=>{const id=a[0],steps=getRouteSteps(id);return steps.length>0&&(window[id+'_idx']||0)===steps.length-1});hook('timeInfo','time');hook('buildScenario','scenario');hook('classifyChontalpa','chontalpa');hook('whyWaterStays','water');hook('selectHydro','hydro');hook('gradeCaseEvaluation','cases');
 // Herramientas: any substantive tool completion; wrappers below cover existing functions.
 ['calcSemaphore','showRegionalCase','readBulletin','checkRelations','calcPermanence','simulateFloodType'].forEach(n=>hook(n,'tools'));
 window.gradeFinalEvaluationCloud=async function(){if(!navigator.onLine){document.getElementById('evalOut').innerHTML='<div class="warn"><b>Sin conexión.</b><br>El examen oficial solo puede calificarse con conexión al servidor.</div>';return}if(!Array.from({length:18},(_,x)=>x).every(isComplete)){document.getElementById('evalOut').innerHTML='<div class="warn"><b>Evaluación bloqueada.</b><br>Debes completar el 100% de los apartados formativos.</div>';return}const answers=[...document.querySelectorAll('.final-question')].map(q=>q.dataset.selected!==undefined?Number(q.dataset.selected):null);if(answers.some(x=>x===null)){const n=answers.filter(x=>x!==null).length;document.getElementById('evalOut').innerHTML=`<div class="warn"><b>Evaluación incompleta.</b><br>Respondiste ${n} de ${answers.length} preguntas.</div>`;return}const {data:{session}}=await client().auth.getSession();if(!session){showLogin();return}document.getElementById('evalOut').innerHTML='<div class="note">Calificando de forma segura en el servidor…</div>';const resp=await fetch(`${cfg.SUPABASE_URL}/functions/v1/grade-exam`,{method:'POST',headers:{'Content-Type':'application/json','Authorization':`Bearer ${session.access_token}`,'apikey':cfg.SUPABASE_ANON_KEY},body:JSON.stringify({answers})});const result=await resp.json().catch(()=>({error:'Respuesta inválida'}));if(!resp.ok){document.getElementById('evalOut').innerHTML=`<div class="warn"><b>No se pudo calificar.</b><br>${esc(result.error||'Error')}</div>`;return}cloudProgress.finalScore=result.score;cloudProgress.finalCorrect=result.correct;cloudProgress.finalTotal=result.total;cloudProgress.finalApproved=result.approved;cloudProgress.finalDate=result.created_at;if(result.certificate)cloudCertificate=result.certificate;document.getElementById('evalOut').innerHTML=result.approved?`<div class="note"><b>Evaluación acreditada: ${result.score}%</b><br>${result.correct} de ${result.total} aciertos. Diploma único emitido con folio <b>${esc(result.certificate.folio)}</b>.</div><button class="btn-green" onclick="showCertificate()">Ver diploma</button>`:`<div class="warn"><b>Resultado no acreditado: ${result.score}%</b><br>${result.correct} de ${result.total} aciertos. Se requiere mínimo ${cfg.PASSING_SCORE||80}%.</div>`;updateProgressCloud();window.amhTrack?.('exam_submit',{score:result.score,approved:result.approved})};
 window.gradeFinalEvaluation=window.gradeFinalEvaluationCloud;
 window.showCertificate=async function(){if(!navigator.onLine&&!cloudCertificate){showToast('Conéctate para recuperar tu diploma','info');return}if(!cloudCertificate)await loadCert();const cert=cloudCertificate;if(!cert){document.getElementById('content').innerHTML='<section class="module"><h2>Diploma digital</h2><div class="warn"><b>Diploma no disponible.</b><br>Completa el curso y acredita la evaluación final.</div></section>';return}const logoSrc=document.querySelector('.hero-logo')?.src||document.querySelector('.sidebar-logo')?.src||'';const verifyUrl=new URL('verificar/?folio='+encodeURIComponent(cert.folio),location.href);document.getElementById('content').innerHTML=`<section class="module"><div class="note"><b>Capacitación acreditada</b><br>Este es tu diploma oficial. Si vuelves a consultarlo, conservará el mismo folio, fecha y QR.</div><div class="diploma-digital">${logoSrc?`<img src="${logoSrc}" alt="Logo AMH Sección Tabasco" class="diploma-logo">`:''}<div class="diploma-title">Diploma Digital</div><div class="diploma-subtitle">Asociación Mexicana de Hidráulica · Sección Tabasco</div><p class="diploma-text">Otorga el presente diploma a</p><div class="diploma-name">${esc(currentUser.name)}</div><p class="diploma-text">por haber aprobado satisfactoriamente la</p><h3>${esc(cfg.COURSE_NAME||'Guía Interactiva de Hidrología e Inundaciones de Tabasco')}</h3><p><b>Resultado:</b> ${cert.score}% &nbsp; | &nbsp; <b>Folio:</b> ${esc(cert.folio)}</p><p><b>Fecha de acreditación:</b> ${new Date(cert.issued_at).toLocaleDateString('es-MX')}</p><div id="certificateQr" style="display:flex;justify-content:center;margin:18px 0"></div><p class="small">Escanea el QR para verificar la autenticidad del diploma.</p><div class="signature-box"><div class="signature-name">Gilberto Segovia Quintero</div><div class="signature-line">Gilberto Segovia Quintero</div><div class="signature-role">Presidente de la Sección Tabasco de la AMH</div></div></div><div class="actions noPrint"><button class="btn-green" onclick="window.print()">Imprimir / guardar PDF</button><a class="btn btn-light" href="${verifyUrl}" target="_blank" rel="noopener">Verificar folio</a></div></section>`;if(window.QRCode)new QRCode(document.getElementById('certificateQr'),{text:verifyUrl.toString(),width:160,height:160});window.amhTrack?.('certificate_view')};
 document.addEventListener('DOMContentLoaded',async()=>{if(!configured())return;const c=client();const {data:{session}}=await c.auth.getSession();if(!session?.user)return;try{const p=await loadProfile(session.user);if(p.is_admin){await c.auth.signOut();return}await enter(session.user,p)}catch(e){console.error(e)}});
})();
