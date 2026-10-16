/* ATT&CK LAB — Historical MITRE ATT&CK changes, derived from archived MITRE changelogs. */
(()=>{'use strict';
const root=document.getElementById('mitrehistoryView');if(!root)return;
const BASE='data/mitre/history/';
const lang=()=>document.getElementById('language')?.value==='en';
const tr=(es,en)=>lang()?en:es;
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const actions=[['Incorporado','Added'],['Cambio mayor','Major version change'],['Cambio menor','Minor version change'],['Otro cambio de versión','Other version change'],['Corrección','Patch'],['Revocado','Revoked'],['Obsoleto','Deprecated'],['Eliminado','Deleted']];
const categories=[['Técnicas','Techniques'],['Software','Software'],['Grupos','Groups'],['Campañas','Campaigns'],['Activos ICS','ICS assets'],['Mitigaciones','Mitigations'],['Fuentes de datos','Data sources'],['Componentes de datos','Data components'],['Estrategias de detección','Detection strategies'],['Analíticas','Analytics']];
const domains={E:['Enterprise','Enterprise'],M:['Mobile','Mobile'],I:['ICS','ICS']};
let manifest=null,history=new Map(),selection='',query='',scope='release',domain='all',category='all',action='all',loadPromise=null,revision=0,displayed=[];
const allowed=file=>/^changes-\d{2}\.json$/.test(file)||file==='manifest.json';
async function readJson(file){if(!allowed(file))throw Error('Invalid history file');const response=await fetch(BASE+file);if(!response.ok)throw Error('HTTP '+response.status);return response.json()}
const currentVersion=()=>manifest?.versions?.find(v=>v.id===selection);
function panel(message){root.innerHTML='<header class="section-head"><div><div class="overline">MITRE ATT&CK · HISTORICAL CHANGELOG</div><h2>'+tr('Historial de versiones MITRE','MITRE version history')+'</h2></div></header><p role="status">'+esc(message)+'</p>'}
async function load(){
 if(manifest)return;
 if(loadPromise)return loadPromise;
 panel(tr('Preparando el historial local del repositorio…','Loading local history from the repository…'));
 loadPromise=(async()=>{
  try{
   const m=await readJson('manifest.json');
   if(!Array.isArray(m.shards)||m.shards.length<1||!Array.isArray(m.releases))throw Error('Incomplete manifest');
   manifest=m;selection=m.releases.at(-1)?.id||'';
   draw();await ensureSelected();
  }catch(e){panel(tr('No se ha podido abrir el historial. Comprueba data/mitre/history/.','Could not open history. Check data/mitre/history/.')+' '+e.message);
   root.innerHTML+='<button type="button" data-history-retry class="outline-btn">'+tr('Reintentar','Retry')+'</button>'}
  finally{loadPromise=null}
 })();return loadPromise;
}
async function loadShard(shard){
 if(history.has(shard.file))return history.get(shard.file);
 const data=await readJson(shard.file);
 if(!data||typeof data!=='object'||Array.isArray(data))throw Error('Invalid history data');
 history.set(shard.file,data);return data;
}
async function ensureSelected(){
 if(!manifest)return;
 const epoch=++revision;
 const status=root.querySelector('#historyStatus');if(status)status.textContent=tr('Leyendo cambios…','Reading changes…');
 try{
  const subset=scope==='all'?manifest.shards:manifest.shards.filter(shard=>shard.releases.includes(selection));
  const data=await Promise.all(subset.map(loadShard));
  if(epoch!==revision)return;
  displayed=subset.flatMap((shard,n)=>shard.releases.flatMap(release=>(data[n][release]||[]).map(row=>[release,...row])));
  renderResults();
 }catch(e){if(epoch===revision){const el=root.querySelector('#historyStatus');if(el)el.textContent=tr('Error al leer el historial: ','Could not read history: ')+e.message}}
}
function draw(){
 if(!manifest)return;
 root.innerHTML=`<header class="section-head"><div><div class="overline">MITRE ATT&CK · ${esc(manifest.scope)} · ${tr('ARCHIVO HISTÓRICO','HISTORICAL ARCHIVE')}</div><h2>${tr('Qué cambió en MITRE','What changed in MITRE')}</h2><p>${tr('Consulta cuándo se incorporó, revisó o retiró un código entre versiones. Se basa en los changelogs archivados, no en una fuente en vivo.','Explore when an ID was added, revised or retired between releases. Based on archived changelogs, not a live feed.')}</p></div><span class="lesson-badge">${manifest.events.toLocaleString(lang()?'en':'es')} ${tr('cambios','changes')}</span></header>
 <div class="mitrehistory-note">${tr('Las versiones cambian las clasificaciones y el contenido. Un código ausente de un changelog NO significa que no existiera. Una entrada histórica tampoco determina su estado actual.','Taxonomy and content evolve. An ID missing from a changelog does NOT mean it did not exist. A historical event does not establish its current status.')}</div>
 <div class="mitrehistory-filters">
 <label>${tr('Cambio entre versiones','Release transition')}<select id="historyRelease">${manifest.releases.map(v=>`<option value="${esc(v.id)}" ${selection===v.id?'selected':''}>${esc(v.id.replace('-',' → '))} · ${v.total}</option>`).join('')}</select></label>
 <label>${tr('Buscar identificador o nombre','Search ID or name')}<input id="historySearch" type="search" autocomplete="off" placeholder="T1059.001 · DET0001 · AN0001" value="${esc(query)}"></label>
 <label>${tr('Dominio','Domain')}<select id="historyDomain"><option value="all">${tr('Todos','All')}</option>${Object.entries(domains).map(([k,t])=>`<option value="${k}" ${domain===k?'selected':''}>${t[lang()?1:0]}</option>`).join('')}</select></label>
 <label>${tr('Tipo','Category')}<select id="historyCategory"><option value="all">${tr('Todos','All')}</option>${categories.map((v,i)=>`<option value="${i}" ${category===String(i)?'selected':''}>${v[lang()?1:0]}</option>`).join('')}</select></label>
 <label>${tr('Cambio','Change')}<select id="historyAction"><option value="all">${tr('Todos','All')}</option>${actions.map((v,i)=>`<option value="${i}" ${action===String(i)?'selected':''}>${v[lang()?1:0]}</option>`).join('')}</select></label>
 </div>
 <div class="mitrehistory-scopes" role="group" aria-label="${tr('Intervalo de búsqueda','Search scope')}"><button type="button" class="outline-btn" data-history-scope="release" aria-pressed="${scope==='release'}">${tr('Solo esta versión','Selected release')}</button><button type="button" class="outline-btn" data-history-scope="all" aria-pressed="${scope==='all'}">${tr('Buscar en 28 transiciones','Search all 28 transitions')}</button></div>
 <p id="historyStatus" role="status"></p><div class="mitrehistory-results" id="historyResults"></div>
 <details class="mitrehistory-note"><summary>${tr('Otros materiales del archivo original','Other materials in the uploaded archive')}</summary><p>${tr('El archivo incluye 444 hojas Excel históricas, 21 materiales de formación CTI y una tabla de equivalencias de subtécnicas móviles. Esta entrega conserva metadatos de cambios y la tabla de equivalencias, pero no publica los PDF ni las hojas Excel de cientos de MB.','The uploaded archive includes 444 historical Excel files, 21 CTI training resources and a mobile sub-technique crosswalk. This release keeps change metadata and the crosswalk, but does not republish the much larger PDFs or spreadsheets.')}</p><p>${tr('Consulta el inventario y el procedimiento en docs/MITRE_HISTORIAL.md.','See the inventory and methodology in docs/MITRE_HISTORIAL.md.')}</p></details>
 <p class="mitrelocal-attribution">${esc(manifest.license)} · <a href="https://attack.mitre.org/resources/versions/" rel="noopener noreferrer" target="_blank">MITRE ATT&CK · ${tr('versiones oficiales','official versions')} ↗</a></p>`;
}
function renderResults(){
 const count=root.querySelector('#historyStatus'),out=root.querySelector('#historyResults');if(!count||!out)return;
 const q=query.toLocaleLowerCase().trim();
 const items=displayed.filter(r=>{
  const [rel,id,d,c,a,name]=r;
  return (scope==='all'||rel===selection)&&(domain==='all'||d===domain)&&(category==='all'||String(c)===category)&&(action==='all'||String(a)===action)&&(!q||id.toLocaleLowerCase().includes(q)||String(name).toLocaleLowerCase().includes(q));
 });
 const cap=100;
 count.textContent=`${items.length.toLocaleString(lang()?'en':'es')} ${tr('cambios coincidentes','matching changes')}${items.length>cap?' · '+tr('mostrando 100; concreta la búsqueda','showing 100; narrow the search'):''}`;
 out.innerHTML=items.slice(0,cap).map(([release,id,d,c,a,name])=>`<article class="mitrehistory-item"><div class="mitrehistory-row"><strong>${esc(id)}</strong><span>${esc(release.replace('-',' → '))}</span><span class="mitrehistory-change">${esc(actions[a]?.[lang()?1:0]||'')}</span></div><h4>${esc(name)}</h4><p>${esc(categories[c]?.[lang()?1:0]||'')} · ${esc(domains[d]?.[lang()?1:0]||d)} · ${tr('Dato histórico, no estado actual','Historical record, not current status')}</p><button type="button" class="outline-btn" data-history-open="${esc(id)}">${tr('Consultar ID en catálogo local','Find ID in local library')} ↗</button></article>`).join('')||'<p>'+tr('No hay cambios coincidentes en los datos archivados para esos filtros.','No matching historical changes in the archived data for those filters.')+'</p>';
}
root.addEventListener('input',e=>{if(e.target.id==='historySearch'){query=e.target.value;renderResults()}});
root.addEventListener('change',e=>{
 const id=e.target.id;
 if(id==='historyRelease'){selection=e.target.value;if(scope==='release')void ensureSelected();else renderResults();return}
 if(id==='historyDomain')domain=e.target.value;
 else if(id==='historyCategory')category=e.target.value;
 else if(id==='historyAction')action=e.target.value;
 else return;
 renderResults();
});
root.addEventListener('click',e=>{const btn=e.target.closest('button');if(!btn)return;
 if(btn.hasAttribute('data-history-retry')){manifest=null;void load();return}
 if(btn.dataset.historyScope){scope=btn.dataset.historyScope;draw();void ensureSelected();return}
 if(btn.dataset.historyOpen){void window.AttackLocalLibrary?.open(btn.dataset.historyOpen);return}
});
document.addEventListener('click',e=>{if(e.target.closest('.nav-link[data-view="mitrehistory"]'))void load()});
document.getElementById('language')?.addEventListener('change',()=>{if(manifest){draw();renderResults()}});
window.AttackHistory={open:async id=>{document.querySelector('.nav-link[data-view="mitrehistory"]')?.click();await load();query=id;scope='all';draw();await ensureSelected()}};
})();
