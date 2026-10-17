/* ATT&CK LAB — standalone bilingual viewer for proposed ICS asset translations. */
(()=>{'use strict';
const root=document.getElementById('assetCatalog');if(!root)return;
const language=document.getElementById('assetLanguage');
const search=document.getElementById('assetSearch');
const results=document.getElementById('assetResults');
const detail=document.getElementById('assetDetail');
const coverage=document.getElementById('assetCoverage');
const overlay=window.AttackAssetDescriptionSpanishV20;
const titles=window.AttackCatalogSpanishV20;
const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[c]));
let items=[],selected='A0001';
const english=()=>language.value==='en';
const L=(es,en)=>english()?en:es;
const translated=r=>overlay?.entry(r.id);
const title=r=>english()?r.name_en:(titles?.title(r.id,r.name_en,'assets')||r.name_en);
const summary=r=>titles?.summary(r.id,r.name_en,'assets')||'';
const safeUrl=r=>/^https:\/\/attack\.mitre\.org\//.test(r.url||'')?r.url:'https://attack.mitre.org/assets/';
function renderDetail(){
 const r=items.find(x=>x.id===selected);if(!r){detail.textContent=L('Selecciona un activo.','Select an asset.');return}
 const draft=translated(r);
 const original='<section><h3>'+L('Descripción original MITRE (inglés)','Original MITRE description (English)')+'</h3><p>'+esc(r.description_en)+'</p></section>';
 detail.innerHTML='<h2>'+esc(r.id)+' · '+esc(title(r))+'</h2>'+
 (!english()?'<p><strong>'+esc(draft?'Traducción propuesta íntegra · revisión humana pendiente':'Descripción sin traducir · original inglés')+'</strong></p><p>'+esc(r.name_en)+'</p>':'')+
 (!english()&&summary(r)?'<section><h3>Resumen educativo (no traducción literal)</h3><p>'+esc(summary(r))+'</p></section>':'')+
 (!english()&&draft?'<section data-asset-translation><h3>Traducción propuesta de la descripción MITRE (revisión pendiente)</h3><p>'+esc(draft.description)+'</p></section><details data-asset-original><summary>Consultar descripción original MITRE (inglés)</summary>'+original+'</details>':original)+
 '<p>'+L('Dominio','Domain')+': '+esc(r.domain)+' · '+L('Estado','Status')+': '+esc(r.status)+'</p>'+
 '<a href="'+esc(safeUrl(r))+'" target="_blank" rel="noopener noreferrer">MITRE ATT&CK '+esc(r.id)+' ↗</a>';
}
function render(){
 const n=items.filter(r=>translated(r)).length;
 coverage.textContent=n+'/'+items.length+' '+L('descripciones traducidas en borrador; ninguna revisada','draft description translations; none reviewed');
 const term=search.value.trim().toLocaleLowerCase();
 const matched=items.filter(r=>[r.id,r.name_en,titles?.title(r.id,r.name_en,'assets'),summary(r),overlay?.searchText(r.id)].some(s=>String(s||'').toLocaleLowerCase().includes(term)));
 results.innerHTML=matched.map(r=>'<button type="button" data-asset-id="'+esc(r.id)+'" aria-pressed="'+(r.id===selected)+'">'+esc(r.id)+' · '+esc(title(r))+' '+(translated(r)?'✓':'')+'</button>').join('')||'<p>'+L('Sin resultados.','No matches.')+'</p>';
 renderDetail();
}
results.addEventListener('click',e=>{const b=e.target.closest('[data-asset-id]');if(!b)return;selected=b.dataset.assetId;render()});
search.addEventListener('input',render);
language.addEventListener('change',render);
fetch('data/mitre/v20/assets-00.json').then(r=>{if(!r.ok)throw Error('HTTP '+r.status);return r.json()}).then(data=>{
 if(!Array.isArray(data)||data.length!==18)throw Error('Unexpected v20 asset count');
 items=data;render();
}).catch(e=>{root.textContent=L('No se pudo cargar el catálogo de activos.','Could not load the asset catalog.')+' '+e.message});
})();