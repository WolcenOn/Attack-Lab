const {test,expect}=require('@playwright/test');
const finalIds=["S9052","S9053","S9057","S9058","S9059","S9060","S9061","S9062","S9063","S9064","S9065","S9066","S9067"];
async function enter(page){
 await page.goto('/');
 const welcome=page.locator('.welcome-overlay:not([hidden])');
 await expect(welcome).toBeVisible();
 await welcome.locator('[data-welcome="skip"]').click();
 const nav=page.locator('#sidebar .nav-link[data-view="mitrelocal"]');
 await nav.locator('xpath=ancestor::details').evaluate(el=>{el.open=true});
 if(await page.locator('#menuButton').isVisible())await page.locator('#menuButton').click();
 await nav.click();
 const root=page.locator('#mitrelocalView');
 await expect(root.locator('#mitrelocalSearch')).toBeVisible({timeout:15000});
 await root.locator('#mitrelocalType').selectOption('software');
 return root;
}
test('all 973 English software descriptions in four shards are translated and 1 redirect is exempt',async({page})=>{
 await page.goto('/');
 const audit=await page.evaluate(async selected=>{
  const shards=await Promise.all([0,1,2,3].map(async i=>await(await fetch('data/mitre/v20/software-0'+i+'.json')).json()));
  const source=shards.flat(),describable=source.filter(x=>typeof x.description_en==='string'&&x.description_en.length>0);
  const redirects=source.filter(x=>x.status==='redirect');
  const s=window.AttackSoftwareFullSpanishV20,full=window.AttackFullSpanishV20;
  const refs=t=>(t.match(/\[\d+\]/g)||[]).join('|');
  const invalid=describable.filter(x=>{
   const tr=full.entry(x.id);
   return !tr||tr.scope!=='full_description'||tr.status!=='draft_needs_review'||
    tr.description===x.description_en||tr.description.length<25||refs(tr.description)!==refs(x.description_en);
  }).map(x=>x.id);
  const redirect=source.find(x=>x.id==='S0209'),mini=source.find(x=>x.id==='S9053');
  return {shardCounts:shards.map(a=>a.length),source:source.length,describable:describable.length,
   redirects:redirects.map(x=>x.id),redirectTo:redirect.redirect_to,
   redirectEnglish:redirect.description_en||null,redirectTranslated:full.entry('S0209'),
   sourceTarget:!!source.find(x=>x.id==='S0012'&&x.description_en),translatedTarget:!!full.entry('S0012'),
   finalIds:new Set(selected).size,finalFound:describable.filter(x=>selected.includes(x.id)).length,
   finalMiniRefs:refs(full.description('S9053')),originalMiniRefs:refs(mini.description_en),
   invalid,total:s.ids.length,unique:new Set(s.ids).size,software:s.coverage,global:full.coverage};
 },finalIds);
 expect(audit).toEqual({shardCounts:[359,307,279,29],source:974,describable:973,redirects:['S0209'],
  redirectTo:'S0012',redirectEnglish:null,redirectTranslated:null,sourceTarget:true,translatedTarget:true,
  finalIds:13,finalFound:13,finalMiniRefs:'[1]|[1]|[1]',originalMiniRefs:'[1]|[1]|[1]',
  invalid:[],total:973,unique:973,software:{software:973,totalSoftware:974},
  global:{datasources:42,assets:18,tactics:39,mitigations:109,campaigns:61,software:973,fullDescriptions:1242}});
});
test('MiniFast Spanish discovery and English original remain reversible',async({page})=>{
 const root=await enter(page);
 await expect(root.locator('#mitrelocalTranslationStats')).toContainText('S 973/974');
 await root.locator('#mitrelocalSearch').fill('sospecha que fue generado');
 await expect(root.locator('[data-local-id="S9052"]')).toHaveCount(1);
 await root.locator('[data-local-id="S9052"]').click();
 const detail=root.locator('#mitrelocalDetail');
 await expect(detail).toContainText('inteligencia artificial');
 await expect(detail).toContainText('NIMBUS MANTICORE');
 const original=detail.locator('details.mitrelocal-source-collapsed');
 await original.locator('summary').click();
 await expect(original).toContainText('suspected of being generated using artificial intelligence');
 await page.locator('#language').selectOption('en');
 await expect(detail).toContainText('long-term persistence');
 await page.locator('#language').selectOption('es');
 await expect(detail).toContainText('persistencia a largo plazo');
});
test('MiniBus, LIGHTRAIL and DEEPROOT preserve technical interfaces and historical nuance',async({page})=>{
 const root=await enter(page),detail=root.locator('#mitrelocalDetail');
 for(const [id,phrases] of [
  ['S9060',['Azure','predecesor MiniBike','agosto de 2023']],
  ['S9061',['WebSocket SOCKS4A','[1] [2]']],
  ['S9063',['Linux','Golang','enumerar sistemas']],
  ['S9066',['parámetros URI','C2']]]){
  await root.locator('#mitrelocalSearch').fill(id);
  await root.locator('[data-local-id="'+id+'"]').click();
  for(const p of phrases)await expect(detail).toContainText(p);
 }
});
test('S0209 remains a redirect without fabricated content while S0012 has its translation',async({page})=>{
 const root=await enter(page),detail=root.locator('#mitrelocalDetail');
 const api=await page.evaluate(()=>({redirect:window.AttackFullSpanishV20.entry('S0209'),
   target:window.AttackFullSpanishV20.entry('S0012')?.scope||null}));
 expect(api).toEqual({redirect:null,target:'full_description'});
 await root.locator('#mitrelocalSearch').fill('S0209');
 await root.locator('[data-local-id="S0209"]').click();
 await expect(detail).not.toContainText('Descripción íntegra traducida');
});
