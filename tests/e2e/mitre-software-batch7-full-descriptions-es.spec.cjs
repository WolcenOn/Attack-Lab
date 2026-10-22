const {test,expect}=require('@playwright/test');

const seventhBatch=Array.from({length:62},(_,i)=>'S'+String(i+424).padStart(4,'0'))
 .filter(id=>id!=='S0429'&&id!=='S0474');

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

test('batch 7 adds 60 full descriptions from source software-01 and retains every numbered reference',async({page})=>{
 await page.goto('/');
 const result=await page.evaluate(async ids=>{
  const source=await(await fetch('data/mitre/v20/software-01.json')).json();
  const api=window.AttackSoftwareFullSpanishV20;
  const all=window.AttackFullSpanishV20;
  const refs=t=>(t.match(/\[\d+\]/g)||[]).sort().join('|');
  const selected=source.filter(x=>ids.includes(x.id));
  const invalid=selected.filter(x=>{
   const e=all.entry(x.id);
   return !x.description_en||!e||e.scope!=='full_description'||
    e.status!=='draft_needs_review'||e.description.length<20||
    e.description===x.description_en||refs(e.description)!==refs(x.description_en)||
    api.searchText(x.id)!==e.description;
  }).map(x=>x.id);
  return {shard:source.length,selected:selected.length,expected:new Set(ids).size,
   translated:api.ids.length,unique:new Set(api.ids).size,invalid,
   missingS0429:source.find(x=>x.id==='S0429')??null,
   missingS0474:source.find(x=>x.id==='S0474')??null,
   pendingS1238:all.entry('S1238'),
   priorS0423:all.entry('S0423')?.scope,
   coverage:api.coverage,global:all.coverage};
 },seventhBatch);
 expect(result).toEqual({
  shard:307,selected:60,expected:60,translated:900,unique:900,invalid:[],
  missingS0429:null,missingS0474:null,pendingS1238:null,
  priorS0423:'full_description',
  coverage:{software:900,totalSoftware:974},
  global:{datasources:42,assets:18,tactics:39,mitigations:109,campaigns:61,software:900,fullDescriptions:1169}
 });
});

test('PoetRAT S0428 shows ICS/SCADA and Azerbaijan details and source EN remains accessible',async({page})=>{
 const root=await enter(page);
 await expect(root.locator('#mitrelocalTranslationStats')).toContainText('S 900/974');
 await root.locator('#mitrelocalSearch').fill('STIBNITE');
 await expect(root.locator('[data-local-id="S0428"]')).toHaveCount(1);
 await root.locator('[data-local-id="S0428"]').click();
 const detail=root.locator('#mitrelocalDetail');
 for(const term of ['Descripción íntegra traducida','abril de 2020','Azerbaiyán',
  'ICS y SCADA','sector energético','William Shakespeare','[1] [2] [3]']){
  await expect(detail).toContainText(term);
 }
 await expect(detail.locator('a.resource-link')).toHaveAttribute('href',/software\/S0428\//);
 const en=detail.locator('details.mitrelocal-source-collapsed');
 await expect(en).toHaveJSProperty('open',false);
 await en.locator('summary').click();
 await expect(en).toContainText('PoetRAT is a remote access trojan');
 await page.locator('#language').selectOption('en');
 await expect(detail).toContainText('including ICS and SCADA systems');
 await expect(detail).not.toContainText('Azerbaiyán');
 await page.locator('#language').selectOption('es');
 await expect(detail).toContainText('Azerbaiyán');
});

test('PLEAD S0435 and TSCookie S0436 do not assert obsolete equivalence and keep repeat references',async({page})=>{
 const root=await enter(page),detail=root.locator('#mitrelocalDetail');
 for(const [id,phrases] of [
  ['S0435',['BlackTech','probablemente se trata de dos herramientas distintas','[1] [2]','[3] [2]']],
  ['S0436',['BlackTech','ambas herramientas son distintas','[1] [2]','[3] [2]']]
 ]){
  await root.locator('#mitrelocalSearch').fill(id);
  await root.locator('[data-local-id="'+id+'"]').click();
  for(const phrase of phrases)await expect(detail).toContainText(phrase);
  const repeats=await page.evaluate(x=>window.AttackFullSpanishV20.entry(x).description.match(/\[2\]/g)?.length,id);
  expect(repeats).toBe(2);
 }
});

test('TrickMo S0427 two TAN references and Mandrake S0485 selective activation preserved',async({page})=>{
 const root=await enter(page),detail=root.locator('#mitrelocalDetail');
 await root.locator('#mitrelocalSearch').fill('S0427');
 await root.locator('[data-local-id="S0427"]').click();
 for(const phrase of ['autenticación de dos factores (2FA)',
  'muy probablemente','Alemania','números de autorización de transacciones (TAN)']){
  await expect(detail).toContainText(phrase);
 }
 const count=await page.evaluate(()=>window.AttackFullSpanishV20.entry('S0427').description.match(/\[1\]/g)?.length);
 expect(count).toBe(2);
 await root.locator('#mitrelocalSearch').fill('S0485');
 await root.locator('[data-local-id="S0485"]').click();
 for(const phrase of ['Android','desde al menos 2016','aplicaciones legítimas sin anuncios',
  'solo se activa cuando los operadores emiten una orden específica']){
  await expect(detail).toContainText(phrase);
 }
});

test('USBferry S0452 retains air-gap limitations and EventBot S0478 Android accessibility abuse',async({page})=>{
 const root=await enter(page),detail=root.locator('#mitrelocalDetail');
 await root.locator('#mitrelocalSearch').fill('S0452');
 await root.locator('[data-local-id="S0452"]').click();
 for(const phrase of ['Tropic Trooper','Taiwán y Filipinas',
  'aislados físicamente','YAHOYAH','malware independiente']){
  await expect(detail).toContainText(phrase);
 }
 await root.locator('#mitrelocalSearch').fill('S0478');
 await root.locator('[data-local-id="S0478"]').click();
 for(const phrase of ['servicio de accesibilidad de Android','más de 200',
  'bancos europeos','[1]']){
  await expect(detail).toContainText(phrase);
 }
 const refs=await page.evaluate(()=>window.AttackFullSpanishV20.entry('S0478').description.match(/\[1\]/g)?.length);
 expect(refs).toBe(2);
});

test('no fabricated S0429 or S0474; S1238 pending, earlier DS/A/TA/M/C/S overlays retained',async({page})=>{
 const root=await enter(page);
 await root.locator('#mitrelocalSearch').fill('S1238');
 await root.locator('[data-local-id="S1238"]').click();
 await expect(root.locator('#mitrelocalDetail')).not.toContainText('Descripción íntegra traducida');
 const result=await page.evaluate(()=>Object.fromEntries(
  ['DS0001','A0003','TA0112','M1055','C0066','S0241','S0302','S0423','S0485','S0429','S0474','S1238']
  .map(id=>[id,window.AttackFullSpanishV20.entry(id)?.scope||null])
 ));
 expect(result).toEqual({DS0001:'full_description',A0003:'full_description',
  TA0112:'full_description',M1055:'full_description',C0066:'full_description',
  S0241:'full_description',S0302:'full_description',S0423:'full_description',
  S0485:'full_description',S0429:null,S0474:null,S1238:null});
});
