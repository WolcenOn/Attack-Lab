/* ATT&CK LAB — static, versioned MITRE library. All source records are local JSON files. */
(()=>{'use strict';
const root=document.getElementById('mitrelocalView');if(!root)return;
const BASE='data/mitre/v20/';
const titles={all:['Todo','All'],techniques:['Técnicas T','Techniques T'],tactics:['Tácticas TA','Tactics TA'],software:['Software S','Software S'],detections:['Estrategias DET','Strategies DET'],analytics:['Analíticas AN','Analytics AN'],components:['Componentes DC','Components DC'],datasources:['Fuentes DS históricas','Historical DS sources'],groups:['Grupos G','Groups G'],assets:['Activos ICS A','ICS assets A'],campaigns:['Campañas C','Campaigns C'],mitigations:['Mitigaciones M','Mitigations M']};
const enc=()=>document.getElementById('language')?.value==='en';
const L=(es,en)=>enc()?en:es;
const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&quot;',"'":'&#39;'}[c]));
const validPath=name=>/^(?:[a-z]+-\d{2}|manifest|links|group-links|platform-matrices|study-resources|analytics-appendix)\.json$/.test(name);
const fetchLocal=async name=>{if(!validPath(name))throw Error('Unexpected JSON path');const r=await fetch(BASE+name);if(!r.ok)throw Error('HTTP '+r.status+' · '+name);return r.json()};
let manifest=null,items=[],links={},groupLinks={},platforms=[],guides=[],selected=null,filter='all',domain='all',platform='all',translation='all',query='',loading=null,error=null,detailsEpoch=0;
const cache=new Map();
// Educational Spanish drafts never overwrite the original MITRE data.
const spanishTitle=r=>r.name_es||window.AttackFullSpanishV20?.title(r.id)||(r.type==='techniques'?window.AttackSubtechniqueSpanishV20?.title(r.id):'')||window.AttackSpanishV20?.translate(r.id,r.name_en,r.type)||window.AttackDetectionSpanishV20?.title(r.id,r.type)||window.AttackCatalogSpanishV20?.title(r.id,r.name_en,r.type)||'';
const normName=r=>enc()?r.name_en:(spanishTitle(r)||r.name_en);
const hasSpanishTitle=r=>!!spanishTitle(r);
// A Spanish heading alone is not a translated description; count summaries separately.
const hasSpanishDCSummary=r=>r.type==='components'&&!!(window.AttackComponentSpanishV20?.summary(r.id));
const typeName=type=>titles[type]?.[enc()?1:0]||type;
function sourceLink(r,type){
 const paths={techniques:'techniques',tactics:'tactics',software:'software',detections:'detectionstrategies',analytics:'detectionstrategies',components:'datacomponents',datasources:'datasources',groups:'groups',campaigns:'campaigns',assets:'assets',mitigations:'mitigations'};
 const url=type==='analytics'&&!r.parent?'https://attack.mitre.org/analytics/':type==='analytics'&&r.parent?'https://attack.mitre.org/detectionstrategies/'+r.parent+'/':r.source_versioned_url||r.source?.version_url||r.url||'https://attack.mitre.org/'+(paths[type]||'techniques')+'/'+String(r.id||'').replace('.','/')+'/';
 return /^https:\/\/attack\.mitre\.org\//.test(url)?url:'https://attack.mitre.org/';
}
function clear(msg){root.innerHTML='<div class="section-head"><div><div class="overline">MITRE ATT&CK · v20 · '+L('CATÁLOGO LOCAL','LOCAL CATALOG')+'</div><h2>'+L('Biblioteca MITRE integrada','Integrated MITRE library')+'</h2></div></div><p class="mitrelocal-status" role="status">'+esc(msg)+'</p>'}
async function ensure(){
 if(manifest)return;
 if(loading)return loading;
 clear(L('Leyendo índices JSON del repositorio…','Reading repository JSON indexes…'));
 loading=(async()=>{
  try{
   const m=await fetchLocal('manifest.json');
   if(!Array.isArray(m.index_shards)||!m.index_shards.length)throw Error('Index manifest is incomplete');
   const shards=await Promise.all(m.index_shards.map(fetchLocal));
   if(shards.some(a=>!Array.isArray(a)))throw Error('Invalid index');
   const raw=shards.flat();
   const graph=await fetchLocal('links.json');
   const groupGraph=m.categories?.groups?.count?await fetchLocal('group-links.json'):{};
   const matrixData=await fetchLocal('platform-matrices.json');
   const guideData=await fetchLocal('study-resources.json');
   if(!Array.isArray(matrixData.matrices)||!Array.isArray(guideData.items))throw Error('Invalid matrix or resources index');
   manifest=m;items=raw;links=graph;groupLinks=groupGraph;platforms=matrixData.matrices;guides=guideData.items;
   render();
   if(selected)await show(selected);
  }catch(e){error=e;clear(L('No se han podido leer los JSON locales. Comprueba que publicaste la carpeta data/mitre/v20 completa.','Could not read local JSON files. Check that data/mitre/v20 was published completely.')+' ('+e.message+')');root.innerHTML+='<button type="button" class="outline-btn" data-local-retry>'+L('Reintentar','Retry')+'</button>'}
  finally{loading=null}
 })();
 return loading;
}

function platformMarkup(){
 const chosen=platforms.find(x=>x.id===platform);
 const options=platforms.map(x=>'<option value="'+esc(x.id)+'" '+(platform===x.id?'selected':'')+'>'+esc(enc()?x.name_en:x.name_es)+' · '+x.technique_ids.length+'</option>').join('');
 const link=chosen&&/^https:\/\/attack\.mitre\.org\/matrices\//.test(chosen.source_url)?
  ' <a href="'+esc(chosen.source_url)+'" target="_blank" rel="noopener noreferrer">'+L('Matriz MITRE original','Original MITRE matrix')+' ↗</a>':'';
 return '<label>'+L('Plataforma (técnicas T)','Platform (T techniques)')+'<select id="mitrelocalPlatform"><option value="all">'+L('Todas las plataformas','All platforms')+'</option>'+options+'</select></label>'+
 (chosen?'<p class="mitrelocal-platform-note">'+L('Filtro por matriz de plataforma de la copia MITRE v20.','Platform matrix filter from the archived MITRE v20 snapshot.')+link+'</p>':'');
}
function guidesMarkup(){
 if(!guides.length)return '';
 return '<details class="mitrelocal-resources"><summary>'+L('Guías oficiales de estudio','Official learning guides')+' · '+guides.length+' <span class="muted">'+L('Resúmenes educativos en español','Spanish study summaries')+'</span></summary>'+
 '<div class="mitrelocal-resource-grid">'+guides.map(g=>{
  const url=/^https:\/\/attack\.mitre\.org\/resources\//.test(g.url)?g.url:'https://attack.mitre.org/resources/';
  return '<article><strong>'+esc(enc()?g.title_en:g.title_es)+'</strong><p>'+esc(enc()?g.summary_en:g.summary_es)+'</p><a href="'+esc(url)+'" target="_blank" rel="noopener noreferrer">'+L('Abrir fuente oficial (inglés)','Official source (English)')+' ↗</a></article>';
 }).join('')+'</div><p class="mitrelocal-note">'+L('Resúmenes redactados para estudiar; no son traducciones oficiales literales.','Study summaries, not official literal translations.')+'</p></details>';
}
function matchesPlatform(r){
 if(platform==='all')return true;
 const matrix=platforms.find(x=>x.id===platform);
 return r.type==='techniques'&&!!matrix&&matrix.technique_ids.includes(r.id);
}

function render(){
 if(!manifest)return;
 const count=items.length;
 root.innerHTML=`<header class="section-head"><div><div class="overline">MITRE ATT&CK · v20 · ${L('ARCHIVOS DEL REPOSITORIO','REPOSITORY FILES')}</div><h2>${L('Biblioteca MITRE integrada','Integrated MITRE library')}</h2><p>${L('Consulta directamente los JSON incluidos en esta web. No hay descarga del STIX completo para esta sección.','Query the JSON files shipped with this site. No full STIX download is required for this section.')}</p></div><span class="lesson-badge">${count.toLocaleString(enc()?'en':'es')} IDs</span></header>
 <p class="mitrelocal-note">${L('Fotografía del material MITRE v20 aportado. Incluye Enterprise, Mobile e ICS. Las 42 fuentes DS son históricas y obsoletas; los 120 DC son componentes actuales. Las traducciones disponibles son borradores salvo revisión.','Snapshot from user-supplied MITRE v20 material. Includes Enterprise, Mobile and ICS. All 42 DS sources are historic and deprecated; the 120 DC records describe current components. Spanish drafts are marked.')}</p>
 <div class="mitrelocal-toolbar"><label>${L('Buscar identificador o nombre','Search ID or name')}<input type="search" id="mitrelocalSearch" autocomplete="off" placeholder="T1059.001 · DET0001 · AN0001 · S0002" value="${esc(query)}"></label><label>${L('Colección','Collection')}<select id="mitrelocalType">${Object.keys(titles).map(k=>`<option value="${k}" ${filter===k?'selected':''}>${esc(typeName(k))}</option>`).join('')}</select></label><label>${L('Dominio','Domain')}<select id="mitrelocalDomain">${['all','enterprise','mobile','ics'].map(k=>`<option value="${k}" ${domain===k?'selected':''}>${k==='all'?L('Todos','All'):k==='ics'?'ICS':k[0].toUpperCase()+k.slice(1)}</option>`).join('')}</select></label></div>
 <div class="mitrelocal-toolbar"><label>${L('Traducción española','Spanish translation')}<select id="mitrelocalTranslation"><option value="all" ${translation==='all'?'selected':''}>${L('Todas las fichas','All records')}</option><option value="es" ${translation==='es'?'selected':''}>${L('Título español disponible','Spanish title available')}</option><option value="pending" ${translation==='pending'?'selected':''}>${L('Título pendiente','Title pending')}</option></select></label><p class="muted" id="mitrelocalTranslationStats"></p></div>
 <div class="mitrelocal-toolbar mitrelocal-platform-toolbar">${platformMarkup()}</div>
 ${guidesMarkup()}
 <div class="mitrelocal-layout"><div class="mitrelocal-results"><p class="muted" id="mitrelocalCount"></p><div id="mitrelocalList" class="mitrelocal-list"></div></div><article id="mitrelocalDetail" class="mitrelocal-detail"><p>${L('Busca un código y selecciona una ficha para leerla.','Search an ID and select a record to read it.')}</p></article></div>
 <p class="mitrelocal-attribution">© 2026 The MITRE Corporation. This work is reproduced and distributed with the permission of The MITRE Corporation. <a href="https://attack.mitre.org/resources/terms-of-use/" target="_blank" rel="noopener noreferrer">MITRE ATT&CK · ${L('condiciones de uso','terms of use')} ↗</a></p>`;
 renderList();
}
function matchesDomain(r){const d=(r.domain||'').toLowerCase();return domain==='all'||d===domain||d.includes(domain)}
function renderList(){
 const el=root.querySelector('#mitrelocalList'),count=root.querySelector('#mitrelocalCount');if(!el)return;
 const stats=root.querySelector('#mitrelocalTranslationStats');
 if(stats){const coverage=window.AttackDetectionSpanishV20?.coverage;const more=window.AttackCatalogSpanishV20?.coverage;stats.textContent=items.filter(hasSpanishTitle).length+' / '+items.length+' '+L('títulos en español, incluidos borradores educativos','Spanish titles, including educational drafts')+(coverage?' · DET '+coverage.detections+'/'+items.filter(r=>r.type==='detections').length+' · AN '+coverage.analytics+'/'+items.filter(r=>r.type==='analytics').length+' '+L('fichas educativas nuevas en borrador','new educational drafts'):'')+(more?' · DC '+items.filter(r=>r.type==='components'&&hasSpanishTitle(r)).length+'/120 · DS '+items.filter(r=>r.type==='datasources'&&hasSpanishTitle(r)).length+'/42 · A '+items.filter(r=>r.type==='assets'&&hasSpanishTitle(r)).length+'/18 '+L('títulos localizados','localized titles'):'');}
 if(stats){const complete=15+items.filter(hasSpanishDCSummary).length;stats.textContent+=' · '+L('DC con resumen español','DC with Spanish summaries')+' '+complete+'/120';const covered=window.AttackSubtechniqueSpanishV20?.coverage.subtechniques;if(covered)stats.textContent+=' · T '+covered+'/935 '+L('subtécnicas con explicación educativa nueva','sub-techniques with new educational explanations');const full=window.AttackFullSpanishV20?.coverage;if(full)stats.textContent+=' · '+L('Descripción íntegra ES','Full ES description')+' DS '+full.datasources+'/42 · A '+full.assets+'/18 · TA '+full.tactics+'/41';}
 const term=query.trim().toLocaleLowerCase();
 const all=items.filter(r=>(filter==='all'||r.type===filter)&&matchesDomain(r)&&matchesPlatform(r)&&(translation==='all'||(translation==='es')===hasSpanishTitle(r))&&(!term||[r.id,r.name_en,spanishTitle(r),window.AttackDetectionSpanishV20?.searchText(r.id,r.type),window.AttackComponentSpanishV20?.searchText(r.id),window.AttackCatalogSpanishV20?.summary(r.id,r.name_en,r.type),window.AttackSubtechniqueSpanishV20?.searchText(r.id),window.AttackFullSpanishV20?.searchText(r.id),...(r.aliases||[])].some(s=>String(s||'').toLocaleLowerCase().includes(term))));
 count.textContent=all.length+' '+L('coincidencias','matches')+(all.length>60?' · '+L('se muestran las primeras 60; concreta la búsqueda','first 60 shown; refine your search'):'');
 el.innerHTML=all.slice(0,60).map(r=>`<button type="button" class="mitrelocal-item" data-local-id="${esc(r.id)}" data-local-type="${esc(r.type)}" data-local-domain="${esc(r.domain||'')}" aria-pressed="${selected?.id===r.id&&selected.type===r.type}"><strong>${esc(r.id)}</strong><span>${esc(normName(r))}</span><small>${esc(typeName(r.type))}${r.domain?' · '+esc(r.domain):''}</small></button>`).join('')||'<p>'+L('No hay resultados.','No results.')+'</p>';
}
function lookup(id,type,domainHint){
 return items.find(r=>r.id===id&&(!type||r.type===type)&&(!domainHint||r.domain===domainHint)) || items.find(r=>r.id===id&&(!type||r.type===type)) || null;
}
function chip(id,label){return `<button type="button" class="outline-btn mitrelocal-chip" data-local-link="${esc(id)}">${esc(label||id)}</button>`}
function listRelations(ids,title){if(!ids?.length)return '';return `<section><h4>${esc(title)} (${ids.length})</h4><div class="mitrelocal-chips">${ids.slice(0,35).map(x=>chip(typeof x==='string'?x:x.id)).join('')}</div>${ids.length>35?`<p class="muted">${L('Se muestran 35 de','Showing 35 of')} ${ids.length}</p>`:''}</section>`}
function plainSection(label,value){return value?`<section><h4>${esc(label)}</h4><p>${esc(value)}</p></section>`:''}
function usefulEnglish(item){return item.description_en||item.description||item.short_en||''}
function techniqueIds(obj){
 const rel=obj.techniques||[];
 if(Array.isArray(rel))return [...new Set(rel.map(x=>typeof x==='string'?x:x.id).filter(Boolean))];
 if(typeof rel==='object')return [...new Set(Object.values(rel).flat().filter(x=>typeof x==='string'))];
 return [];
}
function componentEvidence(record){
 const logs=record.log_sources||[];
 const count=logs.length;
 return `<section class="mitrelocal-log-sources"><h4>${L('Fuentes y canales de registro documentados','Documented log sources and channels')} (${count})</h4>
 <p class="mitrelocal-note">${L('Estos canales son referencias de telemetría de MITRE, no eventos reales ni detecciones confirmadas de tu red. Comprueba si dispones de cada fuente antes de diseñar una regla.','These are MITRE telemetry references, not live events or confirmed detections from your network. Verify coverage before designing a rule.')}</p>
 ${logs.length?`<ul>${logs.slice(0,24).map(x=>`<li><strong>${esc(x.source)}</strong> · ${esc(x.channel)}</li>`).join('')}</ul>`:`<p>${L('Esta página no enumera canales concretos.','This page does not enumerate specific log channels.')}</p>`}
 ${count>24?`<p class="muted">${L('Mostrando 24 de','Showing 24 of')} ${count}. ${L('Consulta el enlace MITRE para ver el listado completo.','See MITRE for the full list.')}</p>`:''}</section>`;
}
function deprecatedInfo(){
 return `<section class="mitrelocal-deprecated" role="status"><h4>${L('Fuente histórica obsoleta','Deprecated historical source')}</h4><p>${L('MITRE marcó esta categoría DS como obsoleta. Para diseñar detecciones actuales, explora los componentes DC y sus estrategias DET. No se supone ninguna equivalencia directa DS → DC.','MITRE marked this DS category as deprecated. For current detections, explore DC components and related DET strategies. No direct DS → DC correspondence is assumed.')}</p><button type="button" class="outline-btn" data-local-modern>${L('Explorar componentes DC','Explore DC components')} →</button></section>`;
}

/* MITRE field identifiers and English definitions are immutable; these notes are pedagogical tuning suggestions. */
const parameterNotesEs={
 TimeWindow:'Ajusta la ventana temporal a la operación normal y al volumen real de eventos.',
 UserContext:'Contrasta cuentas de servicio, administradores y usuarios finales por separado.',
 ParentProcessName:'Considera los procesos padres esperados en despliegues y administración.',
 ParentImage:'Valida qué aplicación o servicio inició el proceso.',
 ProcessList:'Lista de procesos que se considerarán relevantes tras el acceso.',
 FailureThreshold:'Calibra el umbral de fallos con una línea base por origen y cuenta.',
 GeoAnomaly:'La geolocalización por IP no equivale a ubicación exacta del usuario.',
 CommandLinePattern:'Examina el patrón de argumentos sin tratar una coincidencia como prueba concluyente.',
 CommandLineRegex:'Comprueba también cadenas codificadas y el contexto del intérprete.',
 MonitoredPaths:'Limita la supervisión a rutas relevantes, evitando accesos normales.',
 ProfilePathList:'Incluye los perfiles de PowerShell realmente usados por la organización.',
 TimeWindowThreshold:'Revisa la duración para no perder actividad espaciada.',
 SourceIPScope:'Agrupa por IP o red según el uso de VPN, NAT y proxies.',
 UserGroup:'Distingue las identidades privilegiadas y los accesos de mantenimiento.',
 LoginSource:'Diferencia accesos SSH, consola y servicios automatizados.',
 IPWhitelist:'Documenta exclusiones justificadas; no ignores todo el tráfico de una red.',
 MFAProvider:'Comprueba la plataforma que emite los retos y el resultado de cada uno.',
 ProcessNameExclusions:'Excluye solo procesos cuyo uso legítimo esté documentado.'
};
function analyticParameters(record,langEn){
 const fields=record.mutable_elements||[];
 if(!fields.length)return '';
 return '<section class="mitrelocal-params"><h4>'+L('Parámetros de ajuste de la analítica','Analytic tuning parameters')+'</h4>'+
 '<p class="mitrelocal-note">'+L('Los identificadores y las definiciones originales de MITRE permanecen en inglés; cuando existe, la orientación española es educativa y requiere validación antes de desplegar una regla.','Field IDs and original MITRE definitions remain unchanged; validate parameters before deploying detection logic.')+'</p>'+
 '<ul>'+fields.slice(0,16).map(f=>'<li><code>'+esc(f.field)+'</code>'+
 (!langEn&&parameterNotesEs[f.field]?'<p>'+esc(parameterNotesEs[f.field])+'</p>':'')+
 (f.description_en?'<p class="muted">'+(!langEn?'MITRE (EN): ':'')+esc(f.description_en)+'</p>':'')+'</li>').join('')+'</ul></section>';
}
const localTelemetryNotesEs={"DC0002":["Relaciona accesos correctos y fallidos con cuenta, origen y aplicación.","Consulta Security en Windows, auditd/journal/sshd en Linux y auditoría del IdP; comprueba primero qué registros están habilitados.","Un fallo no confirma fuerza bruta y un éxito no identifica por sí solo al operador."],"DC0032":["Ofrece el proceso creado, usuario, argumentos y padre-hijo, si el sensor los recoge.","Revisa Sysmon EventCode=1 o Security 4688 configurados en Windows, y auditd EXECVE en Linux.","PowerShell y bash se usan para administración; una ejecución no prueba intrusión."],"DC0064":["Permite contextualizar comandos y scripts ejecutados, cuando hay auditoría de instrucciones.","Revisa PowerShell 4103/4104 en sistemas configurados; en Linux, reglas auditd execve según disponibilidad.","No todos los comandos quedan registrados y una cadena codificada no basta para determinar intencionalidad."],"DC0067":["Sitúa las sesiones de acceso y los metadatos disponibles de usuario, sistema y origen.","Correlaciona Security 4624, RDP o registros del IdP con accesos posteriores.","La IP puede pertenecer a un proxy o un bastión; un inicio correcto no prueba abuso."],"DC0082":["Permite identificar conexiones y destinos y relacionarlos con procesos cuando el sensor lo permite.","Consulta Sysmon EventCode=3, registros de cortafuegos, NetFlow o proxy según el despliegue.","Una conexión frecuente o inusual no prueba por sí sola mando y control."]};
function telemetryEducation(record,langEn){
 if(langEn)return '';
 const n=localTelemetryNotesEs[record.id];if(!n)return '';
 return '<section class="mitrelocal-draft mitrelocal-telemetry-education"><h4>Cómo investigar esta telemetría · borrador educativo</h4>'+
 plainSection('Para qué sirve',n[0])+plainSection('Dónde comprobarla en un laboratorio autorizado',n[1])+
 plainSection('Qué no demuestra',n[2])+
 '<p class="mitrelocal-note">Guía propia de ATT&CK LAB, pendiente de revisión. Son ejemplos de fuentes, no garantía de que el sensor registre estos campos.</p></section>';
}
function logSourceMarkup(s){
 const id=s.data_component_id||'';
 const dc=id?lookup(id,'components'):null;
 return '<li>'+(dc?chip(id,id):id?esc(id)+' · ':'')+
 esc([s.source,s.channel].filter(Boolean).join(' · '))+'</li>';
}

function educationalGuide(r,langEn){
 if(langEn)return '';
 const guide=r.type==='detections'?window.AttackDetectionSpanishV20?.strategy(r.id):
  r.type==='analytics'?window.AttackDetectionSpanishV20?.analytic(r.id):null;
 if(!guide)return '';
 if(r.type==='analytics')return '<section class="mitrelocal-draft"><h4>Orientación defensiva educativa (borrador)</h4>'+
  plainSection('Qué comprobar en la práctica',guide.verify)+
  '<p class="mitrelocal-note">Interpretación elaborada por ATT&CK LAB, pendiente de revisión humana. No constituye detección verificada ni regla SIEM de producción.</p></section>';
 return '<section class="mitrelocal-draft"><h4>Guía de investigación para ASIR · borrador</h4>'+
  plainSection('Señales que investigar',guide.signals)+
  plainSection('Telemetría y comprobaciones',guide.telemetry)+
  plainSection('Qué NO demuestra una señal aislada',guide.limitations)+
  plainSection('Pregunta razonada',guide.question)+
  '<p class="mitrelocal-note">Explicación propia propuesta a partir de la estrategia MITRE v20; no es una traducción oficial ni un incidente observado.</p></section>';
}

function renderDetail(r,record){
 const langEn=enc(),status=record.translation_status||'pending',titleEn=record.name_en||record.title_en||record.name||r.name_en;
 const titleEs=record.name_es||record.title_es||window.AttackFullSpanishV20?.title(r.id)||(r.type==='techniques'?window.AttackSubtechniqueSpanishV20?.title(r.id):'')||window.AttackSpanishV20?.translate(r.id,titleEn,r.type)||window.AttackDetectionSpanishV20?.title(r.id,r.type)||window.AttackCatalogSpanishV20?.title(r.id,titleEn,r.type)||'';
 const summary=record.summary_es||record.description_es||(r.type==='techniques'?window.AttackSubtechniqueSpanishV20?.summary(r.id)||window.AttackSpanishV20?.note(r.id):null)||window.AttackDetectionSpanishV20?.summary(r.id,r.type)||window.AttackCatalogSpanishV20?.summary(r.id,titleEn,r.type)||window.AttackComponentSpanishV20?.summary(r.id)||'';
 const completeES=window.AttackFullSpanishV20?.entry(r.id);
 const spanishBody=completeES?.description||summary;
 const translated=!!(titleEs||spanishBody);
 const quality=completeES?L('Descripción íntegra traducida · borrador pendiente de revisión','Full translated description · review pending'):translated?(status==='reviewed_es'||status==='reviewed'?L('Traducción revisada','Reviewed translation'):L('Español provisional · pendiente de revisión','Spanish draft · review pending')):L('Original en inglés · traducción pendiente','English original · translation pending');
 const description=usefulEnglish(record);
 const link=sourceLink(record,r.type);
 let extra='';
 const techs=techniqueIds(record);
 if(techs.length)extra+=listRelations(techs,L('Técnicas relacionadas','Related techniques'));
 if(r.type==='groups'){
  if(record.aliases?.length)extra+=plainSection(L('Otros nombres documentados','Documented aliases'),record.aliases.join(', '));
  extra+=listRelations(record.software||[],L('Software documentado por MITRE','MITRE-documented software'));
  extra+=listRelations(record.campaigns||[],L('Campañas relacionadas','Related campaigns'));
 }
 if(r.type==='techniques'){
  if(!langEn){const v=window.AttackSubtechniqueSpanishV20?.verify(r.id);if(v)extra+=plainSection('Comprobación defensiva sugerida · borrador educativo',v);}
  const rel=links[r.id]||{};
  for(const type of ['detections','software','mitigations','campaigns','assets']){
   if(rel[type]?.length)extra+=listRelations(rel[type],typeName(type));
  }
  if(groupLinks[r.id]?.length)extra+=listRelations(groupLinks[r.id],L('Grupos documentados en MITRE','MITRE-documented groups'));

  if(record.tactics_en?.length){const tactical=record.tactics_en.map(t=>{if(langEn)return t;const match=items.find(x=>x.type==='tactics'&&x.name_en===t&&x.domain===r.domain)||items.find(x=>x.type==='tactics'&&x.name_en===t);return match?.name_es||t;});extra+=plainSection(L('Tácticas MITRE','MITRE tactics'),tactical.join(', '));}
 }
 if(r.type==='detections'){
  const analytics=record.analytics||[];
  extra+=listRelations(analytics.map(a=>a.id).filter(Boolean),L('Analíticas','Analytics'));
  if(!langEn&&window.AttackDetectionSpanishV20){const c=analytics.filter(a=>!!window.AttackDetectionSpanishV20.analytic(a.id)).length;if(c)extra+=plainSection('Cobertura educativa de estas analíticas (borradores)',c+' / '+analytics.length+' analíticas con explicación propia en español');}
  const first=analytics.slice(0,4);
  extra+=first.map(a=>`<section class="mitrelocal-analytic"><h4>${esc(a.id)} · ${L('Analítica asociada','Associated analytic')}</h4><p>${esc(!langEn?(window.AttackDetectionSpanishV20?.analytic(a.id)?.summary||a.description_en||''):(a.description_en||''))}</p>${(a.log_sources||[]).length?`<strong>${L('Fuentes de registro propuestas','Suggested log sources')}</strong><ul>${a.log_sources.slice(0,6).map(logSourceMarkup).join('')}</ul>`:''}</section>`).join('');
 }
 if(r.type==='analytics'){
  if(r.parent)extra+=listRelations([r.parent],L('Estrategia de detección','Detection strategy'));
  else extra+=plainSection(L('Vinculación a estrategia DET','DET strategy association'),L('No aparece un DET vinculado en el índice aportado: no se ha supuesto esa relación.','No linked DET was provided in the supplied index; none has been inferred.'));
  const logs=record.log_sources||[];
  if(logs.length)extra+=`<section><h4>${L('Fuentes de registro','Log sources')}</h4><ul>${logs.slice(0,12).map(logSourceMarkup).join('')}</ul></section>`;
 }
 if(r.type==='analytics')extra+=analyticParameters(record,langEn);
 if(r.type==='components'){
 extra+=listRelations(record.strategy_ids||[],L('Estrategias asociadas','Associated strategies'));
 const componentAnalytics=record.analytic_ids||[];
 const withDraft=componentAnalytics.filter(id=>!!window.AttackDetectionSpanishV20?.analytic(id));
 const withoutDraft=componentAnalytics.filter(id=>!window.AttackDetectionSpanishV20?.analytic(id));
 extra+=listRelations([...withDraft,...withoutDraft],L('Analíticas relacionadas con el componente (borradores primero)','Analytics linked to this component (drafts first)'));
 extra+=listRelations(record.technique_ids||[],L('Técnicas observables asociadas','Associated observed techniques'));
 extra+=componentEvidence(record);
 extra+=telemetryEducation(record,langEn);
}
if(r.type==='datasources')extra+=deprecatedInfo();
 if(r.type==='campaigns')extra+=listRelations(record.software||[],L('Software documentado','Documented software'));
 extra+=educationalGuide(r,langEn);
 const subtitle=langEn?titleEn:(titleEs||titleEn);
 return `<div class="overline">${esc(r.id)} · ${esc(typeName(r.type))}${r.domain?' · '+esc(r.domain):''}</div><h3>${esc(subtitle)}</h3>
 <p class="mitrelocal-quality">${esc(quality)}</p>
 ${!langEn&&titleEs?`<p class="muted">${L('Nombre original MITRE','MITRE original name')}: ${esc(titleEn)}</p>`:''}
 ${!langEn&&spanishBody?plainSection(completeES?'Descripción íntegra de MITRE traducida al español (borrador)':L('Resumen educativo en español (no traducción literal)','Educational Spanish summary (not literal MITRE translation)'),spanishBody):''}
 ${description?(langEn||!spanishBody?`<section class="mitrelocal-source-original"><h4>${langEn?'MITRE source text':L('Descripción original en inglés','Original English description')}</h4><p>${esc(description)}</p></section>`:`<details class="mitrelocal-source-original mitrelocal-source-collapsed"><summary>${L('Consultar descripción original MITRE (inglés)','View original MITRE description (English)')}</summary><section><h4>${L('Descripción original en inglés','Original English description')}</h4><p>${esc(description)}</p></section></details>`):''}
 ${r.type==='analytics'?plainSection(L('Analítica asociada a DET','Analytic under DET'),r.parent):''}
 ${extra}
 <p class="mitrelocal-note">${L('Fuente archivada MITRE v20. Los vínculos no demuestran por sí solos un incidente real ni constituyen una regla SIEM lista para producción.','Archived MITRE v20 source. Relationships alone do not prove a real incident or provide a production-ready SIEM rule.')}</p>
 <a class="resource-link" href="${esc(link)}" rel="noopener noreferrer" target="_blank">MITRE ATT&CK ${esc(r.id)} ↗</a>`;
}
async function show(r){
 selected=r;
 const box=root.querySelector('#mitrelocalDetail');if(!box)return;
 renderList();box.innerHTML='<p role="status">'+L('Cargando ficha…','Loading record…')+'</p>';
 const epoch=++detailsEpoch;
 try{
  let data=cache.get(r.shard);
  if(!data){data=await fetchLocal(r.shard);if(!Array.isArray(data))throw Error('Invalid JSON array');cache.set(r.shard,data)}
  if(epoch!==detailsEpoch)return;
  let record=data.find(x=>x.id===(r.shard==='analytics-appendix.json'?r.id:(r.parent||r.id)));
  if(!record)throw Error('Missing ID');
  if(r.type==='analytics'){
   if(r.shard==='analytics-appendix.json'){
    record={...record,name_en:r.name_en,description_en:record.description_en||'',translation_status:'pending'};
   }else{
    const analytic=(record.analytics||[]).find(x=>x.id===r.id);
    if(!analytic)throw Error('Missing analytic');
    record={...analytic,id:r.id,name_en:r.name_en,description_en:analytic.description_en||'',translation_status:'pending'};
   }
  }
  box.innerHTML=renderDetail(r,record);
 }catch(e){if(epoch===detailsEpoch)box.innerHTML='<p role="status">'+L('No se pudo leer el archivo de esta ficha.','Could not read this record file.')+' '+esc(e.message)+'</p>'}
}
root.addEventListener('input',e=>{if(e.target.id==='mitrelocalSearch'){query=e.target.value;renderList()}});
root.addEventListener('change',e=>{if(e.target.id==='mitrelocalType'){filter=e.target.value;if(filter!=='techniques')platform='all';render();return}
 else if(e.target.id==='mitrelocalDomain'){domain=e.target.value;if(platform!=='all'&&platforms.find(x=>x.id===platform)?.domain!==domain)platform='all';render();return}
 else if(e.target.id==='mitrelocalPlatform'){
  platform=e.target.value;
  if(platform!=='all'){
   const matrix=platforms.find(x=>x.id===platform);
   if(matrix){filter='techniques';domain=matrix.domain;query='';selected=null;render();return}
  }
  render();return;
  }else if(e.target.id==='mitrelocalTranslation'){translation=e.target.value;renderList();return}
 else return;renderList()});
root.addEventListener('click',e=>{
 const button=e.target.closest('button');if(!button)return;
 if(button.hasAttribute('data-local-modern')){filter='components';domain='all';query='';selected=null;render();return}
 if(button.hasAttribute('data-local-retry')){manifest=null;error=null;void ensure();return}
 if(button.dataset.localId){const record=lookup(button.dataset.localId,button.dataset.localType,button.dataset.localDomain);if(record)void show(record);return}
 if(button.dataset.localLink){const record=lookup(button.dataset.localLink);if(record){query=record.id;filter='all';domain='all';render();void show(record);}return}
});
document.addEventListener('click',e=>{if(e.target.closest('.nav-link[data-view="mitrelocal"]'))void ensure()});
document.getElementById('language')?.addEventListener('change',()=>{if(manifest){render();if(selected)void show(selected)}});
window.AttackLocalLibrary={open:async(id)=>{const btn=document.querySelector('.nav-link[data-view="mitrelocal"]');btn?.click();await ensure();const match=lookup(id);if(match){query=id;filter='all';domain='all';render();await show(match)}}};
})();