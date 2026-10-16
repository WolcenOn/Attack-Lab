/* ATT&CK LAB — static, versioned MITRE library. All source records are local JSON files. */
(()=>{'use strict';
const root=document.getElementById('mitrelocalView');if(!root)return;
const BASE='data/mitre/v20/';
const titles={all:['Todo','All'],techniques:['Técnicas T','Techniques T'],tactics:['Tácticas TA','Tactics TA'],software:['Software S','Software S'],detections:['Estrategias DET','Strategies DET'],analytics:['Analíticas AN','Analytics AN'],components:['Componentes DC','Components DC'],assets:['Activos ICS A','ICS assets A'],campaigns:['Campañas C','Campaigns C'],mitigations:['Mitigaciones M','Mitigations M']};
const enc=()=>document.getElementById('language')?.value==='en';
const L=(es,en)=>enc()?en:es;
const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&quot;',"'":'&#39;'}[c]));
const validPath=name=>/^(?:[a-z]+-\d{2}|manifest|links)\.json$/.test(name);
const fetchLocal=async name=>{if(!validPath(name))throw Error('Unexpected JSON path');const r=await fetch(BASE+name);if(!r.ok)throw Error('HTTP '+r.status+' · '+name);return r.json()};
let manifest=null,items=[],links={},selected=null,filter='all',domain='all',query='',loading=null,error=null,detailsEpoch=0;
const cache=new Map();
const normName=r=>enc()?r.name_en:(r.name_es||r.name_en);
const typeName=type=>titles[type]?.[enc()?1:0]||type;
function sourceLink(r,type){
 const paths={techniques:'techniques',tactics:'tactics',software:'software',detections:'detectionstrategies',analytics:'detectionstrategies',components:'datacomponents',campaigns:'campaigns',assets:'assets',mitigations:'mitigations'};
 const url=type==='analytics'&&r.parent?'https://attack.mitre.org/detectionstrategies/'+r.parent+'/':r.source_versioned_url||r.source?.version_url||r.url||'https://attack.mitre.org/'+(paths[type]||'techniques')+'/'+String(r.id||'').replace('.','/')+'/';
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
   manifest=m;items=raw;links=graph;
   render();
   if(selected)await show(selected);
  }catch(e){error=e;clear(L('No se han podido leer los JSON locales. Comprueba que publicaste la carpeta data/mitre/v20 completa.','Could not read local JSON files. Check that data/mitre/v20 was published completely.')+' ('+e.message+')');root.innerHTML+='<button type="button" class="outline-btn" data-local-retry>'+L('Reintentar','Retry')+'</button>'}
  finally{loading=null}
 })();
 return loading;
}
function render(){
 if(!manifest)return;
 const count=items.length;
 root.innerHTML=`<header class="section-head"><div><div class="overline">MITRE ATT&CK · v20 · ${L('ARCHIVOS DEL REPOSITORIO','REPOSITORY FILES')}</div><h2>${L('Biblioteca MITRE integrada','Integrated MITRE library')}</h2><p>${L('Consulta directamente los JSON incluidos en esta web. No hay descarga del STIX completo para esta sección.','Query the JSON files shipped with this site. No full STIX download is required for this section.')}</p></div><span class="lesson-badge">${count.toLocaleString(enc()?'en':'es')} IDs</span></header>
 <p class="mitrelocal-note">${L('Fotografía del material MITRE v20 aportado. Incluye Enterprise, Mobile e ICS. Algunas fichas están obsoletas; las traducciones españolas son borradores donde se indique.','Snapshot from user-supplied MITRE v20 material. Includes Enterprise, Mobile and ICS. Some entries are deprecated; Spanish drafts are marked.')}</p>
 <div class="mitrelocal-toolbar"><label>${L('Buscar identificador o nombre','Search ID or name')}<input type="search" id="mitrelocalSearch" autocomplete="off" placeholder="T1059.001 · DET0001 · AN0001 · S0002" value="${esc(query)}"></label><label>${L('Colección','Collection')}<select id="mitrelocalType">${Object.keys(titles).map(k=>`<option value="${k}" ${filter===k?'selected':''}>${esc(typeName(k))}</option>`).join('')}</select></label><label>${L('Dominio','Domain')}<select id="mitrelocalDomain">${['all','enterprise','mobile','ics'].map(k=>`<option value="${k}" ${domain===k?'selected':''}>${k==='all'?L('Todos','All'):k==='ics'?'ICS':k[0].toUpperCase()+k.slice(1)}</option>`).join('')}</select></label></div>
 <div class="mitrelocal-layout"><div class="mitrelocal-results"><p class="muted" id="mitrelocalCount"></p><div id="mitrelocalList" class="mitrelocal-list"></div></div><article id="mitrelocalDetail" class="mitrelocal-detail"><p>${L('Busca un código y selecciona una ficha para leerla.','Search an ID and select a record to read it.')}</p></article></div>
 <p class="mitrelocal-attribution">© 2026 The MITRE Corporation. This work is reproduced and distributed with the permission of The MITRE Corporation. <a href="https://attack.mitre.org/resources/terms-of-use/" target="_blank" rel="noopener noreferrer">MITRE ATT&CK · ${L('condiciones de uso','terms of use')} ↗</a></p>`;
 renderList();
}
function matchesDomain(r){const d=(r.domain||'').toLowerCase();return domain==='all'||d===domain||d.includes(domain)}
function renderList(){
 const el=root.querySelector('#mitrelocalList'),count=root.querySelector('#mitrelocalCount');if(!el)return;
 const term=query.trim().toLocaleLowerCase();
 const all=items.filter(r=>(filter==='all'||r.type===filter)&&matchesDomain(r)&&(!term||[r.id,r.name_en,r.name_es].some(s=>String(s||'').toLocaleLowerCase().includes(term))));
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
function renderDetail(r,record){
 const langEn=enc(),status=record.translation_status||'pending',titleEn=record.name_en||record.title_en||record.name||r.name_en;
 const titleEs=record.name_es||record.title_es||'';
 const summary=record.summary_es||record.description_es||'';
 const translated=!!(titleEs||summary);
 const quality=translated?(status==='reviewed_es'||status==='reviewed'?L('Traducción revisada','Reviewed translation'):L('Español provisional · pendiente de revisión','Spanish draft · review pending')):L('Original en inglés · traducción pendiente','English original · translation pending');
 const description=usefulEnglish(record);
 const link=sourceLink(record,r.type);
 let extra='';
 const techs=techniqueIds(record);
 if(techs.length)extra+=listRelations(techs,L('Técnicas relacionadas','Related techniques'));
 if(r.type==='techniques'){
  const rel=links[r.id]||{};
  for(const type of ['detections','software','mitigations','campaigns','assets']){
   if(rel[type]?.length)extra+=listRelations(rel[type],typeName(type));
  }
  if(record.tactics_en?.length)extra+=plainSection(L('Tácticas MITRE','MITRE tactics'),record.tactics_en.join(', '));
 }
 if(r.type==='detections'){
  const analytics=record.analytics||[];
  extra+=listRelations(analytics.map(a=>a.id).filter(Boolean),L('Analíticas','Analytics'));
  const first=analytics.slice(0,4);
  extra+=first.map(a=>`<section class="mitrelocal-analytic"><h4>${esc(a.id)} · ${L('Analítica asociada','Associated analytic')}</h4><p>${esc(a.description_en||'')}</p>${(a.log_sources||[]).length?`<strong>${L('Fuentes de registro propuestas','Suggested log sources')}</strong><ul>${a.log_sources.slice(0,6).map(s=>`<li>${esc([s.data_component_id,s.source,s.channel].filter(Boolean).join(' · '))}</li>`).join('')}</ul>`:''}</section>`).join('');
 }
 if(r.type==='analytics'){
  extra+=listRelations([r.parent],L('Estrategia de detección','Detection strategy'));
  const logs=record.log_sources||[];
  if(logs.length)extra+=`<section><h4>${L('Fuentes de registro','Log sources')}</h4><ul>${logs.slice(0,12).map(s=>`<li>${esc([s.data_component_id,s.source,s.channel].filter(Boolean).join(' · '))}</li>`).join('')}</ul></section>`;
 }
 if(r.type==='components')extra+=listRelations(record.strategy_ids||[],L('Estrategias asociadas','Associated strategies'));
 if(r.type==='campaigns')extra+=listRelations(record.software||[],L('Software documentado','Documented software'));
 const subtitle=langEn?titleEn:(titleEs||titleEn);
 return `<div class="overline">${esc(r.id)} · ${esc(typeName(r.type))}${r.domain?' · '+esc(r.domain):''}</div><h3>${esc(subtitle)}</h3>
 <p class="mitrelocal-quality">${esc(quality)}</p>
 ${!langEn&&titleEs?`<p class="muted">${L('Nombre original MITRE','MITRE original name')}: ${esc(titleEn)}</p>`:''}
 ${!langEn&&summary?plainSection(L('Explicación inicial en español','Initial Spanish explanation'),summary):''}
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
  let record=data.find(x=>x.id===(r.parent||r.id));
  if(!record)throw Error('Missing ID');
  if(r.type==='analytics'){
   const analytic=(record.analytics||[]).find(x=>x.id===r.id);
   if(!analytic)throw Error('Missing analytic');
   record={...analytic,id:r.id,name_en:r.name_en,description_en:analytic.description_en||'',translation_status:'pending'};
  }
  box.innerHTML=renderDetail(r,record);
 }catch(e){if(epoch===detailsEpoch)box.innerHTML='<p role="status">'+L('No se pudo leer el archivo de esta ficha.','Could not read this record file.')+' '+esc(e.message)+'</p>'}
}
root.addEventListener('input',e=>{if(e.target.id==='mitrelocalSearch'){query=e.target.value;renderList()}});
root.addEventListener('change',e=>{if(e.target.id==='mitrelocalType')filter=e.target.value;else if(e.target.id==='mitrelocalDomain')domain=e.target.value;else return;renderList()});
root.addEventListener('click',e=>{
 const button=e.target.closest('button');if(!button)return;
 if(button.hasAttribute('data-local-retry')){manifest=null;error=null;void ensure();return}
 if(button.dataset.localId){const record=lookup(button.dataset.localId,button.dataset.localType,button.dataset.localDomain);if(record)void show(record);return}
 if(button.dataset.localLink){const record=lookup(button.dataset.localLink);if(record){query=record.id;filter='all';domain='all';render();void show(record);}return}
});
document.addEventListener('click',e=>{if(e.target.closest('.nav-link[data-view="mitrelocal"]'))void ensure()});
document.getElementById('language')?.addEventListener('change',()=>{if(manifest){render();if(selected)void show(selected)}});
window.AttackLocalLibrary={open:async(id)=>{const btn=document.querySelector('.nav-link[data-view="mitrelocal"]');btn?.click();await ensure();const match=lookup(id);if(match){query=id;filter='all';domain='all';render();await show(match)}}};
})();