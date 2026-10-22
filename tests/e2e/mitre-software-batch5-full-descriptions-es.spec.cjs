const {test,expect}=require('@playwright/test');

const fifthBatch=Array.from({length:61},(_,i)=>'S'+String(i+242).padStart(4,'0')).filter(id=>id!=='S0296');

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

test('batch 5 adds 60 genuine software descriptions, no S0296 source, 300 IDs and full ES coverage 569',async({page})=>{
 await page.goto('/');
 const result=await page.evaluate(async ids=>{
  const source=await(await fetch('data/mitre/v20/software-00.json')).json();
  const api=window.AttackSoftwareFullSpanishV20;
  const full=window.AttackFullSpanishV20;
  const refs=t=>(t.match(/\[\d+\]/g)||[]).sort().join('|');
  const selected=source.filter(x=>ids.includes(x.id));
  const wrong=selected.filter(x=>{
   const e=full.entry(x.id);
   return !x.description_en||!e||e.scope!=='full_description'||
    e.status!=='draft_needs_review'||e.description.length<20||
    e.description===x.description_en||refs(e.description)!==refs(x.description_en)||
    e.description!==api.searchText(x.id);
  }).map(x=>x.id);
  return {shard:source.length,selected:selected.length,expected:new Set(ids).size,
   software:api.ids.length,unique:new Set(api.ids).size,wrong,
   gapS0296:source.find(x=>x.id==='S0296')??null,
   noS0209:full.entry('S0209'),noS0296:full.entry('S0296'),
   translatedS0302:full.entry('S0302')?.scope,pendingS0209:full.entry('S0209'),
   coverage:api.coverage,global:full.coverage};
 },fifthBatch);
 expect(result).toEqual({
  shard:359,selected:60,expected:60,software:973,unique:973,wrong:[],
  gapS0296:null,noS0209:null,noS0296:null,translatedS0302:'full_description',
  pendingS0209:null,coverage:{software:973,totalSoftware:974},
  global:{datasources:42,assets:18,tactics:39,mitigations:109,campaigns:61,software:973,fullDescriptions:1242}
 });
});

test('TrickBot S0266 maintains early Dyre uncertainty and ransomware evolution in ES to EN to ES',async({page})=>{
 const root=await enter(page);
 await expect(root.locator('#mitrelocalTranslationStats')).toContainText('S 973/974');
 await root.locator('#mitrelocalSearch').fill('posible sucesor de Dyre');
 await expect(root.locator('[data-local-id="S0266"]')).toHaveCount(1);
 await root.locator('[data-local-id="S0266"]').click();
 const detail=root.locator('#mitrelocalDetail');
 for(const phrase of ['Descripción íntegra traducida','TrickBot','septiembre de 2016',
  'posible sucesor de Dyre','Wizard Spider','Norteamérica','Australia',
  'big game hunting','[1] [2] [3] [4]']){
  await expect(detail).toContainText(phrase);
 }
 await expect(detail.locator('a.resource-link')).toHaveAttribute('href',/software\/S0266\//);
 const en=detail.locator('details.mitrelocal-source-collapsed');
 await expect(en).toHaveJSProperty('open',false);
 await en.locator('summary').click();
 await expect(en).toContainText('TrickBot is a Trojan spyware program');
 await page.locator('#language').selectOption('en');
 await expect(detail).toContainText('possible successor to Dyre');
 await expect(detail).not.toContainText('posible sucesor de Dyre');
 await page.locator('#language').selectOption('es');
 await expect(detail).toContainText('posible sucesor de Dyre');
});

test('ZergHelper S0287 retains explicit absence of identified malicious features',async({page})=>{
 const root=await enter(page);
 await root.locator('#mitrelocalSearch').fill('S0287');
 await root.locator('[data-local-id="S0287"]').click();
 const detail=root.locator('#mitrelocalDetail');
 for(const phrase of ['software de riesgo','iOS','App Store de Apple',
  'No se identificó ninguna funcionalidad maliciosa','riesgos de seguridad']){
  await expect(detail).toContainText(phrase);
 }
});

test('Pegasus for iOS S0289 preserves reportedly attributed NSO link and separate Android entry',async({page})=>{
 const root=await enter(page);
 await root.locator('#mitrelocalSearch').fill('S0289');
 await root.locator('[data-local-id="S0289"]').click();
 const detail=root.locator('#mitrelocalDetail');
 for(const phrase of ['Pegasus for iOS','según los informes','NSO Group',
   'víctimas de alto valor','Pegasus for Android','[1] [2]']){
  await expect(detail).toContainText(phrase);
 }
});

test('AndroRAT S0292 keeps location, calls, SMS, camera, GitHub and repeated [2] references',async({page})=>{
 const root=await enter(page);
 await root.locator('#mitrelocalSearch').fill('S0292');
 await root.locator('[data-local-id="S0292"]').click();
 const detail=root.locator('#mitrelocalDetail');
 for(const phrase of ['código abierto','ubicación del dispositivo',
  'registros de llamadas','mensajes SMS','tomar fotografías',
  'The404Hacking','[1] [2] [3]']){
  await expect(detail).toContainText(phrase);
 }
 const refs=await page.evaluate(()=>window.AttackFullSpanishV20.entry('S0292').description.match(/\[2\]/g)?.length);
 expect(refs).toBe(2);
});

test('UPPERCUT S0275 retains earlier exclusivity assumption and later MirrorFace sightings',async({page})=>{
 const root=await enter(page);
 await root.locator('#mitrelocalSearch').fill('S0275');
 await root.locator('[data-local-id="S0275"]').click();
 const detail=root.locator('#mitrelocalDetail');
 for(const phrase of ['HTTP de 32 bits','menuPass','desde al menos 2017',
  'en un principio se consideraba exclusiva','MirrorFace','Operation AkaiRyū']){
  await expect(detail).toContainText(phrase);
 }
});

test('dual-use Koadic and short mobile entries show full drafts; S0209 remains a source redirect',async({page})=>{
 const root=await enter(page);
 const detail=root.locator('#mitrelocalDetail');
 await root.locator('#mitrelocalSearch').fill('S0250');
 await root.locator('[data-local-id="S0250"]').click();
 for(const phrase of ['posexplotación de Windows','pruebas de penetración',
  'GitHub','Windows Script Host','[1] [2] [3]']){
  await expect(detail).toContainText(phrase);
 }
 await root.locator('#mitrelocalSearch').fill('S0302');
 await root.locator('[data-local-id="S0302"]').click();
 await expect(detail).toContainText('redes sociales');
 await expect(detail).toContainText('Descripción íntegra traducida');
 await root.locator('#mitrelocalSearch').fill('S0209');
 await root.locator('[data-local-id="S0209"]').click();
 await expect(detail).not.toContainText('Descripción íntegra de MITRE traducida al español');
 await expect(detail).not.toContainText('Descripción íntegra traducida');
});
