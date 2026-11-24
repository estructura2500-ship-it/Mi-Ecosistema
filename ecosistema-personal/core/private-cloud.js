/* Mi Ecosistema - private cloud sync v1. Data are never committed to GitHub. */
(() => {
  'use strict';
  const APP_KEYS = {
    brasa: ['brasa_eventos_tiempo_libre_multitema_v2'],
    basketbrain: ['basquetbrain_v1'],
    pulso: ['pulso_life_os_v2_datos_migrados_20261110'],
    'juego-de-honor': ['juego_de_honor_skill_lab_v6_state','juego_de_honor_skill_lab_v5_state','juego_de_honor_skill_lab_v4_state','juego_de_honor_skill_lab_v2_state'],
    calistenia: ['calistenia_skill_lab_gold_v1'],
    'atlas-fisioterapia': ['atlas-movimiento-v1'],
    patinaje: ['skate-skill-lab-2026-v1']
  };
  const CONFIG_KEY = 'ecosistema_cloud_config_v1';
  const SESSION_KEY = 'ecosistema_cloud_session_v1';
  const META_PREFIX = 'ecosistema_cloud_meta_v1:';
  const script = document.currentScript;
  const appId = script?.dataset?.ecosistemaApp || '';
  const allowed = Object.hasOwn(APP_KEYS, appId);
  const nativeSet = Storage.prototype.setItem;
  const nativeRemove = Storage.prototype.removeItem;
  const configured = window.ECOSISTEMA_CLOUD_CONFIG || {};
  const savedConfig = readJson(CONFIG_KEY);
  let config = savedConfig || {url: configured.url || '', key: configured.key || ''};
  let session = readJson(SESSION_KEY);
  let dialog = null, statusText = '', busy = false, timer = null, conflictRemote = null;
  let applying = false;

  function readJson(key) {
    try { return JSON.parse(localStorage.getItem(key) || 'null'); } catch { return null; }
  }
  function storeJson(key, value) { nativeSet.call(localStorage, key, JSON.stringify(value)); }
  function ready() { return document.readyState === 'loading' ? new Promise(r => document.addEventListener('DOMContentLoaded', r, {once:true})) : Promise.resolve(); }
  function escapeHtml(v) { return String(v ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
  function setStatus(message) { statusText = message; const n = document.querySelector('#ecosistema-cloud-status'); if(n) n.textContent = message; }
  function validConfig(c) {
    try {
      const u = new URL(c.url);
      return u.protocol === 'https:' && /^[a-z0-9-]+\.supabase\.co$/.test(u.hostname) && !u.username && !u.password && !u.pathname.replace(/\//g,'') && !!c.key && c.key.length > 12;
    } catch { return false; }
  }
  function origin() { return config.url.replace(/\/+$/,''); }
  async function api(path, opts={}) {
    if (!validConfig(config)) throw new Error('Primero configura el proyecto Supabase.');
    const h = {'apikey':config.key, 'Content-Type':'application/json'};
    if(opts.auth) h.Authorization = 'Bearer ' + await getToken();
    const response = await fetch(origin()+path, {method:opts.method||'GET',headers:h,body:opts.body===undefined?undefined:JSON.stringify(opts.body),cache:'no-store'});
    const raw = await response.text();
    let data = null; try { data = raw ? JSON.parse(raw) : null; } catch { data = raw; }
    if(!response.ok) {
      const message = (data && (data.msg || data.message || data.error_description || data.error)) || 'Error de conexión con Supabase ('+response.status+').';
      const error = new Error(message); error.status=response.status; throw error;
    }
    return data;
  }
  function persistSession(data) {
    session = {access_token:data.access_token,refresh_token:data.refresh_token,expires_at:Date.now()+Math.max(30,Number(data.expires_in||3600)-60)*1000,user:data.user};
    storeJson(SESSION_KEY,session);
  }
  async function getToken() {
    if(!session?.access_token) throw new Error('Inicia sesión para sincronizar.');
    if(Date.now()<Number(session.expires_at||0)) return session.access_token;
    const previous = session;
    const refreshed = await api('/auth/v1/token?grant_type=refresh_token',{method:'POST',body:{refresh_token:previous.refresh_token}});
    persistSession(refreshed);
    return session.access_token;
  }
  async function signIn(email,password) {
    const data = await api('/auth/v1/token?grant_type=password',{method:'POST',body:{email,password}});
    persistSession(data); conflictRemote=null; setStatus('Sesión iniciada.');
    if(allowed) await sync();
    return data;
  }
  async function signUp(email,password) {
    const data = await api('/auth/v1/signup',{method:'POST',body:{email,password}});
    if(data.access_token) { persistSession(data); if(allowed) await sync(); }
    return data;
  }
  function signOut() {
    nativeRemove.call(localStorage,SESSION_KEY); session=null; conflictRemote=null;
    setStatus('Sesión cerrada. Tus datos locales permanecen en este navegador.');
    renderDialog();
  }
  function getSnapshot() {
    if(!allowed)return null;
    const keys={};
    for(const key of APP_KEYS[appId]) {
      const raw = localStorage.getItem(key);
      if(raw!==null)keys[key]=raw;
    }
    return Object.keys(keys).length ? {schema:1,keys} : null;
  }
  function digest(data) {
    if(!data)return '';
    const str=JSON.stringify(data);
    let hash=2166136261;
    for(let i=0;i<str.length;i++){hash^=str.charCodeAt(i);hash=Math.imul(hash,16777619);}
    return (hash>>>0).toString(16) + ':' + str.length;
  }
  function metaKey(){return META_PREFIX+(session?.user?.id||'')+':'+appId;}
  function saveMeta(revision,payload) {storeJson(metaKey(),{revision,digest:digest(payload),updatedAt:new Date().toISOString()});}
  async function remoteGet(){
    const params = '?app_id=eq.'+encodeURIComponent(appId)+'&select=revision,payload&limit=1';
    const data=await api('/rest/v1/app_snapshots'+params,{auth:true});
    return data?.[0]||null;
  }
  async function remotePut(payload,expected){
    if(JSON.stringify(payload).length>3000000)throw new Error('Los datos superan 3 MB; descarga un respaldo antes de continuar.');
    const revision=await api('/rest/v1/rpc/save_app_snapshot',{auth:true,method:'POST',body:{p_app_id:appId,p_payload:payload,p_expected_revision:expected}});
    saveMeta(Number(revision),payload);
    setStatus('Sincronizado con tu cuenta · '+new Date().toLocaleTimeString('es-CO'));
  }
  function exportEmergency(payload){
    if(!payload)return;
    const blob=new Blob([JSON.stringify(payload,null,2)],{type:'application/json'});
    const u=URL.createObjectURL(blob),a=document.createElement('a');
    a.href=u;a.download='Ecosistema_'+appId+'_copia_local_'+new Date().toISOString().slice(0,10)+'.json';
    document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),2000);
  }
  function applyRemote(row){
    if(!row?.payload?.keys)throw new Error('El respaldo remoto no tiene una estructura válida.');
    const previous=getSnapshot();
    if(previous && digest(previous)!==digest(row.payload))exportEmergency(previous);
    applying=true;
    for(const key of APP_KEYS[appId]) {
      if(typeof row.payload.keys[key] === 'string')nativeSet.call(localStorage,key,row.payload.keys[key]);
    }
    saveMeta(row.revision,row.payload);
    applying=false;
    setStatus('Datos de la cuenta recuperados.');
    location.reload();
  }
  function showConflict(row) {
    conflictRemote=row;
    setStatus('Hay dos versiones de tus datos. Elige cuál conservar desde «Mi cuenta».');
    renderDialog();
  }
  async function sync(){
    if(!allowed || !session || !validConfig(config) || busy || !navigator.onLine)return;
    busy=true;
    try {
      const remote=await remoteGet(), local=getSnapshot(), prior=readJson(metaKey());
      if(!remote){
        if(local)await remotePut(local,0);else setStatus('Sesión activa. Aún no hay registros para subir.');
      } else if(!local){
        applyRemote(remote);
      } else if(digest(local)===digest(remote.payload)){
        saveMeta(remote.revision,remote.payload); setStatus('Datos al día.');
      } else if(prior && prior.digest===digest(local) && remote.revision>prior.revision){
        applyRemote(remote);
      } else if(prior && prior.revision===remote.revision && prior.digest!==digest(local)){
        await remotePut(local,remote.revision);
      } else {
        showConflict(remote);
      }
    }catch(err) {setStatus('No se pudo sincronizar: '+err.message);}
    finally {busy=false;renderDialog();}
  }
  function queueSync(){
    if(!allowed || applying || !session || !validConfig(config))return;
    clearTimeout(timer);timer=setTimeout(()=>sync(),1300);
  }
  // Do not intercept internal cloud keys. Only the exact whitelisted app keys trigger a sync.
  if(allowed){
    Storage.prototype.setItem=function(key,value){
      const result=nativeSet.call(this,key,value);
      if(this===localStorage && APP_KEYS[appId].includes(String(key)))queueSync();
      return result;
    };
    window.addEventListener('storage', event => {
      if(event.storageArea===localStorage && APP_KEYS[appId].includes(event.key))queueSync();
    });
  }
  window.addEventListener('online',()=>sync());
  window.addEventListener('focus',()=>{if(allowed && !conflictRemote)sync();});

  function closeDialog(){if(dialog)dialog.hidden=true;}
  function renderDialog(){
    if(!dialog||dialog.hidden)return;
    const area=dialog.querySelector('#ecosistema-cloud-body');
    const configuredOK=validConfig(config);
    const conf='<h3>Configurar nube privada</h3><p class="ecs-muted">Este paso se hace una vez, después de crear el proyecto y activar las políticas de seguridad.</p><form id="ecs-config-form"><label>URL de Supabase<input name="url" type="url" placeholder="https://tu-proyecto.supabase.co" required></label><label>Clave pública (publishable/anon)<input name="key" autocomplete="off" required></label><button type="submit">Guardar conexión</button></form><p class="ecs-muted">Nunca ingreses aquí una clave service_role o secret. No se envían datos a GitHub.</p>';
    const login='<h3>Tu cuenta privada</h3><p class="ecs-muted">Inicia sesión para proteger y sincronizar tus registros.</p><form id="ecs-login-form"><label>Correo<input name="email" type="email" autocomplete="username" required></label><label>Contraseña<input name="password" type="password" autocomplete="current-password" minlength="8" required></label><div class="ecs-actions"><button type="submit">Iniciar sesión</button><button type="button" id="ecs-register">Crear cuenta</button></div></form><button type="button" id="ecs-reconfigure" class="ecs-secondary">Cambiar proyecto Supabase</button>';
    const account='<h3>Cuenta conectada</h3><p>'+escapeHtml(session.user?.email||'Cuenta privada')+'</p><p class="ecs-muted">'+(allowed?'Aplicación: '+escapeHtml(appId):'Abre una aplicación para sincronizar sus registros.')+'</p><div class="ecs-actions"><button id="ecs-sync" type="button" '+(allowed?'':'disabled')+'>Sincronizar ahora</button><button id="ecs-signout" type="button" class="ecs-secondary">Cerrar sesión</button></div>';
    const conflicted=conflictRemote ? '<div class="ecs-warning"><strong>Dos versiones distintas</strong><p>Hay datos locales y en la nube. No reemplazaremos ninguno sin tu elección. Al recuperar la nube se descargará una copia de seguridad local antes del cambio.</p><div class="ecs-actions"><button id="ecs-use-cloud" type="button">Usar datos de la nube</button><button id="ecs-use-local" type="button" class="ecs-secondary">Subir mis datos locales</button></div></div>' : '';
    area.innerHTML= !configuredOK?conf:!session?login:account+conflicted;
    const form=area.querySelector('#ecs-config-form');
    if(form){form.elements.url.value=config.url||'';form.elements.key.value=config.key||'';form.onsubmit=e=>{e.preventDefault();const next={url:form.elements.url.value.trim().replace(/\/+$/,''),key:form.elements.key.value.trim()};if(!validConfig(next)){setStatus('La URL y la clave pública no tienen el formato esperado.');return;}config=next;storeJson(CONFIG_KEY,config);signOut();setStatus('Conexión guardada; inicia sesión.');renderDialog();};}
    const loginForm=area.querySelector('#ecs-login-form');
    if(loginForm){
      loginForm.onsubmit=async e=>{e.preventDefault();setStatus('Iniciando sesión…');try{await signIn(loginForm.elements.email.value.trim(),loginForm.elements.password.value);renderDialog();}catch(err){setStatus('No se pudo entrar: '+err.message);}};
      area.querySelector('#ecs-register').onclick=async()=>{setStatus('Creando cuenta…');try{const data=await signUp(loginForm.elements.email.value.trim(),loginForm.elements.password.value);setStatus(data.access_token?'Cuenta creada.':'Cuenta creada. Revisa el correo para verificarla y luego entra.');renderDialog();}catch(err){setStatus('No se pudo crear la cuenta: '+err.message);}};
      area.querySelector('#ecs-reconfigure').onclick=()=>{config={url:'',key:''};nativeRemove.call(localStorage,CONFIG_KEY);signOut();renderDialog();};
    }
    if(session){
      area.querySelector('#ecs-signout')?.addEventListener('click',signOut);
      area.querySelector('#ecs-sync')?.addEventListener('click',()=>sync());
      area.querySelector('#ecs-use-cloud')?.addEventListener('click',()=>{if(confirm('¿Restaurar la versión de la nube en esta aplicación? Se descargará una copia de tus datos locales antes de sustituirlos.'))applyRemote(conflictRemote);});
      area.querySelector('#ecs-use-local')?.addEventListener('click',async()=>{if(!confirm('¿Reemplazar la versión en la nube por los datos de este navegador?'))return;try{await remotePut(getSnapshot(),conflictRemote.revision);conflictRemote=null;renderDialog();}catch(err){setStatus('Conflicto o error al guardar. Vuelve a sincronizar: '+err.message);}});
    }
  }
  function openDialog(){
    if(!dialog){
      const style=document.createElement('style');
      style.textContent='.ecs-open{position:fixed;right:16px;bottom:18px;z-index:99998;background:#172636;color:white;border:1px solid #557d9d;border-radius:100px;padding:10px 15px;cursor:pointer;font:600 13px system-ui;box-shadow:0 5px 20px #0006}.ecs-backdrop{position:fixed;inset:0;z-index:99999;background:#0009;display:grid;place-items:center;padding:16px}.ecs-backdrop[hidden]{display:none}.ecs-panel{width:min(480px,100%);max-height:90vh;overflow:auto;background:#111c29;color:#fafafa;border:1px solid #526171;border-radius:18px;padding:24px;font:14px/1.5 system-ui;box-shadow:0 20px 70px #0008}.ecs-panel h2{margin:0 0 4px;font-size:22px}.ecs-panel h3{font-size:17px;margin:10px 0}.ecs-panel label{display:grid;gap:6px;margin:11px 0}.ecs-panel input{font:inherit;box-sizing:border-box;width:100%;border:1px solid #708195;border-radius:8px;background:#26354a;color:#fff;padding:10px}.ecs-panel button{font:inherit;background:#2a7ec6;color:#fff;border:0;border-radius:8px;padding:10px 13px;cursor:pointer}.ecs-panel button.ecs-secondary{background:#34465a}.ecs-panel button[disabled]{opacity:.5;cursor:default}.ecs-muted{color:#c1cbd8;font-size:12px}.ecs-actions{display:flex;gap:10px;flex-wrap:wrap;margin:13px 0}.ecs-warning{border:1px solid #a97532;border-radius:9px;padding:12px;margin-top:14px;background:#362616}.ecs-close{float:right}.ecs-panel #ecosistema-cloud-status{margin-top:16px;color:#b3dfb8;font-size:12px;min-height:16px}';
      document.head.appendChild(style);
      dialog=document.createElement('div');dialog.className='ecs-backdrop';dialog.hidden=true;
      dialog.innerHTML='<div class="ecs-panel" role="dialog" aria-modal="true" aria-label="Cuenta privada del ecosistema"><button type="button" class="ecs-close ecs-secondary" aria-label="Cerrar">✕</button><h2>Mi Ecosistema · Nube privada</h2><div id="ecosistema-cloud-body"></div><div id="ecosistema-cloud-status" role="status"></div></div>';
      dialog.querySelector('.ecs-close').onclick=closeDialog;
      dialog.addEventListener('click',e=>{if(e.target===dialog)closeDialog();});
      document.addEventListener('keydown',e=>{if(e.key==='Escape' && !dialog.hidden)closeDialog();});
      document.body.appendChild(dialog);
    }
    dialog.hidden=false;renderDialog();setStatus(statusText || (session?'Sesión conectada.':'Los datos actuales seguirán en este navegador.'));
  }
  ready().then(()=>{
    const button=document.createElement('button');button.type='button';button.className='ecs-open';
    button.textContent='☁ Mi cuenta';button.title='Almacenamiento y sincronización privados';button.addEventListener('click',openDialog);document.body.appendChild(button);
    if(allowed && session && validConfig(config))sync();
  });
  window.EcosistemaCloud={open:openDialog,sync,appId,connected:()=>!!session,configured:()=>validConfig(config)};
})();