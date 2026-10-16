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
const spanishTitle=r=>r.name_es||window.AttackSpanishV20?.translate(r.id,r.name_en,r.type)||'';
const normName=r=>enc()?r.name_en:(spanishTitle(r)||r.name_en);
const hasSpanishTitle=r=>!!spanishTitle(r);
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
 if(stats)stats.textContent=items.filter(hasSpanishTitle).length+' / '+items.length+' '+L('títulos en español, incluidos borradores educativos','Spanish titles, including educational drafts');
 const term=query.trim().toLocaleLowerCase();
 const all=items.filter(r=>(filter==='all'||r.type===filter)&&matchesDomain(r)&&matchesPlatform(r)&&(translation==='all'||(translation==='es')===hasSpanishTitle(r))&&(!term||[r.id,r.name_en,spanishTitle(r),...(r.aliases||[])].some(s=>String(s||'').toLocaleLowerCase().includes(term))));
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
function renderDetail(r,record){
 const langEn=enc(),status=record.translation_status||'pending',titleEn=record.name_en||record.title_en||record.name||r.name_en;
 const titleEs=record.name_es||record.title_es||window.AttackSpanishV20?.translate(r.id,titleEn,r.type)||'';
 const summary=record.summary_es||record.description_es||(r.type==='techniques'?window.AttackSpanishV20?.note(r.id):null)||'';
 const translated=!!(titleEs||summary);
 const quality=translated?(status==='reviewed_es'||status==='reviewed'?L('Traducción revisada','Reviewed translation'):L('Español provisional · pendiente de revisión','Spanish draft · review pending')):L('Original en inglés · traducción pendiente','English original · translation pending');
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
  const rel=links[r.id]||{};
  for(const type of ['detections','software','mitigations','campaigns','assets']){
   if(rel[type]?.length)extra+=listRelations(rel[type],typeName(type));
  }
  if(groupLinks[r.id]?.length)extra+=listRelations(groupLinks[r.id],L('Grupos documentados en MITRE','MITRE-documented groups'));

  if(record.tactics_en?.length)extra+=plainSection(L('Tácticas MITRE','MITRE tactics'),record.tactics_en.join(', '));
 }
 if(r.type==='detections'){
  const analytics=record.analytics||[];
  extra+=listRelations(analytics.map(a=>a.id).filter(Boolean),L('Analíticas','Analytics'));
  const first=analytics.slice(0,4);
  extra+=first.map(a=>`<section class="mitrelocal-analytic"><h4>${esc(a.id)} · ${L('Analítica asociada','Associated analytic')}</h4><p>${esc(a.description_en||'')}</p>${(a.log_sources||[]).length?`<strong>${L('Fuentes de registro propuestas','Suggested log sources')}</strong><ul>${a.log_sources.slice(0,6).map(s=>`<li>${esc([s.data_component_id,s.source,s.channel].filter(Boolean).join(' · '))}</li>`).join('')}</ul>`:''}</section>`).join('');
 }
 if(r.type==='analytics'){
  if(r.parent)extra+=listRelations([r.parent],L('Estrategia de detección','Detection strategy'));
  else extra+=plainSection(L('Vinculación a estrategia DET','DET strategy association'),L('No aparece un DET vinculado en el índice aportado: no se ha supuesto esa relación.','No linked DET was provided in the supplied index; none has been inferred.'));
  const logs=record.log_sources||[];
  if(logs.length)extra+=`<section><h4>${L('Fuentes de registro','Log sources')}</h4><ul>${logs.slice(0,12).map(s=>`<li>${esc([s.data_component_id,s.source,s.channel].filter(Boolean).join(' · '))}</li>`).join('')}</ul></section>`;
 }
 if(r.type==='components'){
 extra+=listRelations(record.strategy_ids||[],L('Estrategias asociadas','Associated strategies'));
 extra+=listRelations(record.technique_ids||[],L('Técnicas observables asociadas','Associated observed techniques'));
 extra+=componentEvidence(record);
}
if(r.type==='datasources')extra+=deprecatedInfo();
 if(r.type==='campaigns')extra+=listRelations(record.software||[],L('Software documentado','Documented software'));
 const subtitle=langEn?titleEn:(titleEs||titleEn);
 return `<div class="overline">${esc(r.id)} · ${esc(typeName(r.type))}${r.domain?' · '+esc(r.domain):''}</div><h3>${esc(subtitle)}</h3>
 <p class="mitrelocal-quality">${esc(quality)}</p>
 ${!langEn&&titleEs?`<p class="muted">${L('Nombre original MITRE','MITRE original name')}: ${esc(titleEn)}</p>`:''}
 ${!langEn&&summary?plainSection(L('Resumen educativo en español (no traducción literal)','Educational Spanish summary (not literal MITRE translation)'),summary):''}
 ${description?`<section><h4>${langEn?'MITRE source text':L('Descripción original en inglés','Original English description')}</h4><p>${esc(description)}</p></section>`:''}
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