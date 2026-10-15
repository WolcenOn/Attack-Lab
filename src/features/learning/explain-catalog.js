/* ATT&CK LAB — Live MITRE ATT&CK Enterprise evidence study catalog. */
(function explainCatalogModule(){
'use strict';
const hostView=document.getElementById('explainView');
if(!hostView)return;
const dictionary=window.AttackTranslations?.names||{};
const tactics={
reconnaissance:['Reconocimiento','Reconnaissance','Se intenta reunir información previa sobre una organización, sus personas o sistemas. No demuestra todavía acceso a sus activos.','The behavior gathers information about a target and does not itself prove access.','Registros de solicitudes públicas, consultas repetidas, peticiones a servicios y variaciones temporales.','Public requests, repeated lookups, service requests and their timing.','Consultar una página pública puede ser legítimo; comprueba frecuencia, objetivo y contexto.','Public browsing can be normal; check frequency, target and context.','event.kind=web.request | target=public-site | requests=58 | window=2m'],
'resource-development':['Preparación de recursos','Resource development','Se preparan recursos que podrían emplearse en una operación. La existencia de infraestructura no atribuye por sí sola una intrusión.','Resources can be prepared for later operations; infrastructure alone is not proof of compromise.','Cambios de dominios, certificados, infraestructura y reputación contextual.','Changes to domains, certificates, infrastructure and reputation context.','Un dominio recién registrado puede ser legítimo. Contrasta titularidad y actividad.','Newly registered domains can be legitimate. Correlate ownership and behavior.','event.kind=dns.observed | domain=example.test | first_seen=recent'],
'initial-access':['Acceso inicial','Initial access','Describe vías con las que se podría obtener el primer acceso a un entorno. Una tentativa no equivale a una sesión comprometida.','Describes possible entry to an environment. An attempt does not prove a successful compromise.','Autenticaciones, correo, cambios en aplicaciones expuestas y actividad tras el acceso.','Authentication events, mail, exposed-app changes and post-access activity.','Los fallos de login pueden deberse a un error humano. Busca una sesión posterior y su contexto.','Failed logins can be human error. Correlate successful sessions and context.','event.kind=auth.login | user=employee | source_ip=192.0.2.17 | result=failed'],
execution:['Ejecución','Execution','La técnica se relaciona con ejecutar instrucciones o procesos. El mismo proceso puede ser administrativo o sospechoso según su origen.','The technique concerns running commands or processes, which may be legitimate or suspicious depending on context.','Proceso padre e hijo, línea de comandos, cuenta y hora; correlaciona con cambios posteriores.','Parent/child processes, command line, identity and time; correlate later changes.','Encontrar un intérprete de comandos no demuestra por sí solo malware.','A command interpreter alone is not malware evidence.','event.kind=process.start | parent=app.exe | child=shell.exe | user=analyst'],
persistence:['Persistencia','Persistence','Se buscan formas de mantener acceso después de reinicios u otros cambios. No todo elemento de inicio automático es malicioso.','Describes ways to retain access across restarts or changes; not every autostart entry is malicious.','Nuevos servicios, tareas, claves de arranque, cuentas y responsables del cambio.','New services, jobs, startup entries, accounts and change ownership.','Una tarea programada puede ser mantenimiento autorizado. Contrasta propietario y fecha.','Scheduled jobs can be authorized maintenance. Check ownership and timing.','event.kind=service.created | host=SRV-2 | actor=svc-admin'],
'privilege-escalation':['Elevación de privilegios','Privilege escalation','Se pretende disponer de más permisos de los que tenía una identidad o proceso. Valida la concesión real de permisos antes de afirmarlo.','Describes attempts to gain more permissions. Verify actual grants before concluding escalation.','Cambios de grupos, elevación de procesos, sesiones privilegiadas y tickets administrativos.','Group changes, process elevation, privileged sessions and admin change records.','Una ejecución como administrador puede ser prevista y estar autorizada.','Admin execution may be expected and authorized.','event.kind=group.member_added | group=admins | actor=helpdesk'],
'defense-evasion':['Evasión de defensas','Defense evasion','Se intenta reducir visibilidad o eludir controles. Ausencia de alertas no significa ausencia de actividad.','Attempts to reduce monitoring or evade controls. No alert does not mean no activity.','Estado de agentes, configuración de auditoría, modificaciones de seguridad y huecos temporales.','Agent status, audit changes, security settings and telemetry gaps.','Una caída del sensor puede ser accidental. Investiga causa y cambios previos.','Sensor outages can be accidental. Investigate the cause and prior changes.','event.kind=security.agent_state | host=PC-1 | status=stopped'],
'credential-access':['Acceso a credenciales','Credential access','Se trata de obtener secretos de autenticación. Leer una fuente sensible no confirma que se haya extraído una contraseña.','Concerns obtaining authentication secrets. Access to sensitive resources does not by itself prove theft.','Acceso a secretos, procesos con privilegios, intentos de autenticación y cambios de cuentas.','Secret access, privileged processes, authentication attempts and account changes.','No atribuyas robo de credenciales sin corroborar acceso y uso posterior.','Do not claim credential theft without corroborating access and later use.','event.kind=credential_store.access | actor=process-7 | outcome=allowed'],
discovery:['Descubrimiento','Discovery','Se consultan características del entorno para entender usuarios, equipos, redes o servicios. Muchas consultas también son parte del soporte TI.','Describes queries to understand users, hosts, networks and services; many are normal IT administration.','Consultas de directorio, inventario, comandos de información y frecuencias atípicas.','Directory searches, inventory queries and unusual command frequency.','Una enumeración aislada puede ser una comprobación rutinaria.','A single enumeration can be routine administration.','event.kind=directory.query | scope=hosts | actor=tech-support'],
'lateral-movement':['Movimiento lateral','Lateral movement','Se intenta acceder a otros equipos o cuentas desde un punto ya alcanzado. Una conexión remota no demuestra control no autorizado.','Describes access attempts toward other hosts; remote connections are not automatically unauthorized control.','Conexiones entre hosts, origen, identidad, método y actividad en destino.','Host-to-host sessions, source, identity, method and destination events.','Una conexión de administración es legítima si corresponde a un cambio autorizado.','Remote administration may be legitimate when change-authorized.','event.kind=remote.logon | source=PC-5 | target=SRV-9 | user=admin'],
collection:['Recopilación','Collection','La actividad agrupa o reúne información que podría usarse después. Reunir archivos no prueba su salida del entorno.','Describes gathering information for possible later use. Gathering files does not prove exfiltration.','Accesos a archivos, exportaciones, archivos comprimidos, procesos y permisos.','File access, exports, archives, processes and permissions.','Un backup también reúne muchos datos; confirma tarea, propietario y destino.','Backups also gather lots of data; verify job, owner and destination.','event.kind=file.read | files=230 | process=backup-task'],
'command-and-control':['Mando y control','Command and control','Se busca comunicación remota para coordinar actividad. El tráfico hacia Internet no es por sí solo malicioso.','Describes communication channels for coordinating activity. Internet traffic alone is not malicious.','DNS, conexiones salientes, certificados, patrón temporal y proceso iniciador.','DNS, outbound connections, certificates, timing and originating process.','Una conexión repetida puede proceder de telemetría o actualizaciones legítimas.','Repeated connections can be normal telemetry or updates.','event.kind=net.connect | host=PC-2 | remote=198.51.100.3 | count=24'],
exfiltration:['Exfiltración','Exfiltration','Se plantea extraer información fuera del límite autorizado. Mucho tráfico no confirma por sí solo una fuga de datos.','Describes transferring information beyond authorized boundaries. High volume alone is not proof of theft.','Volumen y destino de transferencias, accesos previos, usuario y legitimidad del flujo.','Transfer size, destination, earlier access, identity and authorized business purpose.','Una sincronización legítima puede producir el mismo patrón.','Authorized synchronization can look similar.','event.kind=net.transfer | dest=203.0.113.5 | bytes=48000000'],
impact:['Impacto','Impact','Se busca alterar la disponibilidad, integridad o funcionamiento de sistemas. Distingue acción técnica del atacante y decisiones de contención.','Describes changes to availability or integrity. Separate attacker actions from defensive shutdowns.','Borrados, modificaciones masivas, indisponibilidad, servicios detenidos y recuperación.','Deletes, mass edits, outages, stopped services and recovery operations.','Una caída operativa no confirma por sí sola el cifrado ni la causa.','An outage alone does not prove encryption or its cause.','event.kind=file.change | host=FILE-1 | count=900 | window=1m']
};
const fallback=['Contexto defensivo','Defensive context','MITRE describe un comportamiento; necesita evidencia contextual para determinar si ocurrió en un sistema.','MITRE describes a behavior. Context is required to determine whether it happened in a specific system.','Identidad, hora, equipo, evento de origen y actividad posterior.','Identity, time, host, source event and follow-on activity.','Una alerta aislada no demuestra que el comportamiento haya ocurrido.','An isolated alert does not prove the behavior occurred.','event.kind=security.alert | host=LAB-1 | status=needs-review'];
let host=null,query='',selected=null,loading=false,loadError=false;
const english=()=>document.getElementById('language')?.value==='en';
const tr=(es,en)=>english()?en:es;
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const officialUrl=id=>'https://attack.mitre.org/techniques/'+id.replace('.','/')+'/';
function snapshot(){
 const getter=window.AttackLabCatalog?.snapshot;
 return typeof getter==='function'?getter():{loaded:false,techniques:[]};
}
function render(){
 if(!host?.isConnected)return;
 const data=snapshot(),items=data.techniques;
 const q=query.toLowerCase().trim();
 const matches=items.filter(t=>!q||[t.attackId,t.name,t.es,dictionary[t.attackId],...(t.phases||[])].some(x=>String(x||'').toLowerCase().includes(q)));
 const exact=matches.find(t=>t.attackId.toLowerCase()===q);
 const current=exact||matches.find(t=>t.attackId===selected)||matches[0];
 if(current)selected=current.attackId;
 const max=65,shown=matches.slice(0,max);
 const loaded=data.loaded,hasMissing=q&&!matches.length;
 host.innerHTML=`<div class="section-head"><div><div class="overline">MITRE ATT&CK · ENTERPRISE</div><h2>${tr('Busca cualquier técnica Txxxx','Search any Txxxx technique')}</h2><p>${tr('Todas las técnicas activas del catálogo oficial, cuando se carga. Las fichas automáticas explican contexto defensivo; las lecciones comentadas siguen disponibles aparte.','All active techniques from the official catalog once loaded. Generated cards provide defensive context; detailed annotated lessons remain available separately.')}</p></div><span class="lesson-badge">${loaded?tr('FUENTE OFICIAL','OFFICIAL SOURCE'):tr('MODO DEMOSTRACIÓN','DEMO MODE')}</span></div>
 <div class="chain-note">${loaded?tr('Dataset MITRE Enterprise cargado. No incluye técnicas retiradas ni dominios Mobile/ICS.','MITRE Enterprise loaded. Retired techniques and Mobile/ICS are excluded.'):tr('Se muestra una muestra local mientras se obtiene automáticamente el catálogo MITRE. Si la descarga falla, prueba «Actualizar ahora».','Showing a local sample while the MITRE catalog loads automatically. If the download fails, select Refresh.')}</div>
 <div class="explained-catalog-toolbar"><label for="expCatalogSearch">${tr('Código T, nombre o táctica','T ID, name or tactic')}<input id="expCatalogSearch" type="search" autocomplete="off" placeholder="T1059.001, PowerShell…" value="${esc(query)}"></label>${`<button type="button" class="primary-btn" data-exp-load ${loading?'disabled':''}>${loading?tr('Actualizando MITRE…','Updating MITRE…'):loaded?tr('Actualizar MITRE ahora','Refresh MITRE now'):tr('Reintentar o actualizar ahora','Retry or refresh now')}</button>`}</div>
 ${loadError?`<p class="incident-disclaimer" role="status">${tr('No se pudo cargar el catálogo. Comprueba tu conexión e inténtalo de nuevo.','Could not load the catalog. Check your connection and try again.')}</p>`:''}
 <p class="muted" role="status">${matches.length} ${tr('códigos encontrados','matching IDs')} / ${items.length} ${tr('disponibles','available')}${matches.length>max?' · '+tr('Se muestran los primeros 65; escribe un código más específico.','Showing first 65; refine the search.'):''}</p>
 ${hasMissing?`<p class="chain-note">${loaded?tr('Ese ID no está entre las técnicas activas de Enterprise. Comprueba si es un ID retirado o pertenece a Mobile o ICS.','This ID is not among active Enterprise techniques. Check retired, Mobile or ICS datasets.'):tr('Todavía no aparece en la muestra. Espera la sincronización o pulsa actualizar.','Not yet in the local sample. Wait for synchronization or select Refresh.')}</p>`:''}
 <div class="academy-layout"><div class="lesson-catalog explained-tech-list">${shown.map(o=>`<button type="button" class="lesson-selector ${o.attackId===current?.attackId?'chosen':''}" data-exp-id="${esc(o.attackId)}"><span class="tech-id">${esc(o.attackId)}</span><span>${esc(english()?o.name:(dictionary[o.attackId]||o.es||o.name))}${!english()&&(dictionary[o.attackId]||o.es)?`<small class="exp-original">${esc(o.name)}</small>`:''}</span><b>${o.sub?'↳':'→'}</b></button>`).join('')||`<p class="muted">${tr('Sin coincidencias.','No matches.')}</p>`}</div>
 <article class="study-panel explained-full-detail">${current?detail(current,loaded):`<p>${tr('Escribe un código para consultar su ficha.','Enter an ID to view its study card.')}</p>`}</article></div>`;
}
function detail(o,loaded){
 const id=o.attackId,phases=o.phases?.length?o.phases:['unknown'];
 const tactic=tactics[phases[0]]||fallback;
 const spanish=dictionary[id]||o.es||'',official=loaded&&o.source==='official';
 const snippet=String(o.description||'').replace(/<[^>]*>/g,' ').replace(/\s+/g,' ').trim().slice(0,1150);
 const title=english()?o.name:(spanish||o.name);
 const teaching=window.AttackTranslations?.summaries?.[id]||'';
 const additional=(o.phases||[]).slice(1).map(k=>tactics[k]?tactics[k][english()?1:0]:k).join(', ');
 return `<div class="overline">${esc(id)} · ${o.sub?tr('SUBTÉCNICA','SUB-TECHNIQUE'):tr('TÉCNICA','TECHNIQUE')}</div><h3>${esc(title)}</h3>
 ${spanish&&!english()?`<p class="muted">${tr('Nombre original MITRE','Original MITRE name')}: ${esc(o.name)}</p>`:!english()?`<p class="muted">${tr('Nombre original en inglés: traducción individual pendiente de revisión.','Original English name: individual translation under review.')}</p>`:''}
 <p class="exp-quality-note">${tr('Ficha introductoria por táctica, no traducción literal de MITRE ni evaluación específica de detección.','Tactic-based introductory card; not a literal MITRE translation or technique-specific detection assessment.')}</p>
 <h4>1 · ${tr('¿Qué significa en contexto?','What does it mean?')}</h4><p>${!english()&&teaching?esc(teaching):`${tr('La técnica','Technique')} <strong>${esc(id)}</strong> (${esc(o.name)}) ${tr('se relaciona con','is related to')} <strong>${esc(tactic[english()?1:0])}</strong>. ${esc(tactic[english()?3:2])}`}</p>
 ${additional?`<p class="muted">${tr('También relacionada con','Also associated with')}: ${esc(additional)}</p>`:''}
 ${o.parent?`<p>${tr('Técnica principal','Parent technique')}: <button type="button" class="outline-btn" data-exp-parent="${esc(o.parent)}">${esc(o.parent)} ↗</button></p>`:''}
 <h4>2 · ${tr('¿Qué evidencias buscaría un SOC?','Which evidence would an SOC look for?')}</h4><p>${esc(tactic[english()?5:4])}</p>
 <pre class="chain-log"><code>${esc(tactic[8])}</code></pre><p class="exp-synthetic">${tr('Ejemplo genérico inventado, NO un registro publicado de MITRE. Los campos son ilustrativos, no universales.','Invented generic example, NOT an event log published by MITRE. Fields are illustrative, not universal.')}</p>
 <h4>3 · ${tr('¿Qué NO demuestra esta señal?','What does this signal NOT prove?')}</h4><p>${esc(tactic[english()?7:6])}</p>
 <h4>4 · ${tr('¿Qué comprobar después?','What should you verify next?')}</h4><p>${tr('Reconstruye una cronología con hora, equipo y cuenta; compara con cambios autorizados y busca otra fuente independiente antes de concluir que ocurrió una intrusión.','Build a timeline using time, host and identity; compare authorized changes and seek an independent source before concluding an intrusion occurred.')}</p>
 <h4>5 · ${tr('Fuente oficial y descripción','Official source and description')}</h4>
 ${official?`<p class="exp-official-desc">${tr('Extracto del texto oficial de MITRE (en inglés, sin traducción automática):','Excerpt from MITRE’s official English description:')} ${esc(snippet||tr('Sin descripción textual en el objeto descargado.','No description in the downloaded record.'))}${String(o.description||'').length>1150?'…':''}</p>`:`<p>${tr('Este registro es una muestra de la academia. La descripción MITRE aparecerá después de la sincronización.','This is an academy sample. The MITRE description will appear after synchronization.')}</p>`}
 <div class="chain-actions"><a class="resource-link" target="_blank" rel="noopener noreferrer" href="${esc(officialUrl(id))}">MITRE ATT&CK · ${esc(id)} ↗</a><button type="button" class="outline-btn" data-exp-open="${esc(id)}">${tr('Ver ficha completa en explorador','Open full explorer detail')} ↗</button></div>`;
}
function mount(el){
 host=el;
 el.addEventListener('input',e=>{
  if(e.target.id!=='expCatalogSearch')return;
  const pos=e.target.selectionStart;
  query=e.target.value;selected=null;render();
  const input=host?.querySelector('#expCatalogSearch');
  if(input){input.focus();if(typeof pos==='number')input.setSelectionRange(pos,pos);}
 });
 el.addEventListener('click',async e=>{
  const b=e.target.closest('button');if(!b)return;
  if(b.dataset.expId){selected=b.dataset.expId;render();return}
  if(b.dataset.expParent){query=b.dataset.expParent;selected=b.dataset.expParent;render();return}
  if(b.dataset.expOpen){window.AttackLabCatalog?.openTechnique(b.dataset.expOpen);return}
  if(b.hasAttribute('data-exp-load')){
   if(loading)return;
   loading=true;loadError=false;render();
   try{await window.AttackLabCatalog.loadOfficial();const state=snapshot();loadError=!state.loaded;}
   catch{loadError=true;}
   finally{loading=false;render();}
  }
 });
 render();
}
document.addEventListener('attacklab:catalog-updated',render);
document.addEventListener('attacklab:catalog-sync',render);
window.AttackExplainCatalog={mount};
})();
