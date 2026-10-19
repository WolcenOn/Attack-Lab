const {test,expect}=require('@playwright/test');

const batch6=Array.from({length:121},(_,i)=>'S'+String(i+303).padStart(4,'0')).filter(id=>id!=='S0392');

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

test('recover fifth batch and add 120 full S drafts from both MITRE software shards with exact numbered notes',async({page})=>{
 await page.goto('/');
 const result=await page.evaluate(async ids=>{
  const shards=await Promise.all(['00','01'].map(async n=>(await(await fetch('data/mitre/v20/software-'+n+'.json')).json())));
  const source=shards.flat(),api=window.AttackSoftwareFullSpanishV20,full=window.AttackFullSpanishV20;
  const refs=t=>(t.match(/\[\d+\]/g)||[]).sort().join('|');
  const batch=source.filter(x=>ids.includes(x.id));
  const bad=batch.filter(x=>{
   const e=full.entry(x.id);
   return !x.description_en||!e||e.scope!=='full_description'||e.status!=='draft_needs_review'||
    e.description.length<20||e.description===x.description_en||
    refs(e.description)!==refs(x.description_en)||e.description!==api.searchText(x.id);
  }).map(x=>x.id);
  return {
   shards:shards.map(x=>x.length),idsCount:ids.length,sourceMatched:batch.length,
   ids:api.ids.length,unique:new Set(api.ids).size,bad,
   recoveredS0302:full.entry('S0302')?.scope,
   lastS0423:full.entry('S0423')?.scope,
   missingS0392:source.find(x=>x.id==='S0392')??null,
   untranslatedS0551:full.entry('S0551'),
   coverage:api.coverage,global:full.coverage,
   originalEnglish:source.find(x=>x.id==='S0368').description_en.includes('attackers never intended')
  };
 },batch6);
 expect(result).toEqual({
  shards:[359,307],idsCount:120,sourceMatched:120,ids:480,unique:540,bad:[],
  recoveredS0302:'full_description',lastS0423:'full_description',
  missingS0392:null,untranslatedS0551:null,
  coverage:{software:540,totalSoftware:974},
  global:{datasources:42,assets:18,tactics:39,mitigations:109,campaigns:61,software:540,fullDescriptions:809},
  originalEnglish:true
 });
});

test('NotPetya S0368 retains explicit destructive purpose, date, exploits and ES to EN to ES',async({page})=>{
 const root=await enter(page);
 await expect(root.locator('#mitrelocalTranslationStats')).toContainText('S 540/974');
 await root.locator('#mitrelocalSearch').fill('los atacantes nunca pretendieron');
 await expect(root.locator('[data-local-id="S0368"]')).toHaveCount(1);
 await root.locator('[data-local-id="S0368"]').click();
 const detail=root.locator('#mitrelocalDetail');
 for(const term of ['Descripción íntegra traducida','Sandworm Team','27 de junio de 2017',
  'los atacantes nunca pretendieron','EternalBlue','EternalRomance','SMBv1','[1] [2] [3] [4]']){
  await expect(detail).toContainText(term);
 }
 await expect(detail.locator('a.resource-link')).toHaveAttribute('href',/software\/S0368\//);
 const en=detail.locator('details.mitrelocal-source-collapsed');
 await expect(en).toHaveJSProperty('open',false);
 await en.locator('summary').click();
 await expect(en).toContainText('NotPetya is malware');
 await page.locator('#language').selectOption('en');
 await expect(detail).toContainText('attackers never intended');
 await expect(detail).not.toContainText('los atacantes nunca pretendieron');
 await page.locator('#language').selectOption('es');
 await expect(detail).toContainText('los atacantes nunca pretendieron');
});

test('dual-use Microsoft RawDisk S0364 and esentutl S0404 preserve legitimate tool classification',async({page})=>{
 const root=await enter(page),detail=root.locator('#mitrelocalDetail');
 await root.locator('#mitrelocalSearch').fill('S0364');
 await root.locator('[data-local-id="S0364"]').click();
 for(const phrase of ['controlador comercial legítimo','EldoS Corporation',
  'modo usuario','seguridad del sistema operativo Windows']){
  await expect(detail).toContainText(phrase);
 }
 await root.locator('#mitrelocalSearch').fill('S0404');
 await root.locator('[data-local-id="S0404"]').click();
 for(const phrase of ['herramienta de línea de comandos','Windows Extensible Storage Engine']){
  await expect(detail).toContainText(phrase);
 }
});

test('Mobile malware S0314 and S0407 preserve qualified intelligence claims and version constraints',async({page})=>{
 const root=await enter(page),detail=root.locator('#mitrelocalDetail');
 await root.locator('#mitrelocalSearch').fill('S0314');
 await root.locator('[data-local-id="S0314"]').click();
 for(const phrase of ['artillería','Según los informes','probablemente podía indicar',
  'CHOPSTICK']){
  await expect(detail).toContainText(phrase);
 }
 await root.locator('#mitrelocalSearch').fill('S0407');
 await root.locator('[data-local-id="S0407"]').click();
 for(const phrase of ['Android','podría estar en desarrollo una versión para iOS']){
  await expect(detail).toContainText(phrase);
 }
});

test('S0413 MailSniper permission boundaries and S0423 Ginp targeting Spanish banks retained',async({page})=>{
 const root=await enter(page),detail=root.locator('#mitrelocalDetail');
 await root.locator('#mitrelocalSearch').fill('S0413');
 await root.locator('[data-local-id="S0413"]').click();
 for(const phrase of ['herramienta de pruebas de penetración','Microsoft Exchange',
  'usuario sin privilegios administrativos','administrador de Exchange']){
  await expect(detail).toContainText(phrase);
 }
 await root.locator('#mitrelocalSearch').fill('S0423');
 await root.locator('[data-local-id="S0423"]').click();
 for(const phrase of ['troyano bancario para Android','bancos españoles',
  'código se tomó directamente de Anubis']){
  await expect(detail).toContainText(phrase);
 }
});

test('S0551 remains pending and earlier DS/A/TA/M/C/S drafts stay accessible',async({page})=>{
 const root=await enter(page);
 await root.locator('#mitrelocalSearch').fill('S0551');
 await root.locator('[data-local-id="S0551"]').click();
 await expect(root.locator('#mitrelocalDetail')).not.toContainText('Descripción íntegra traducida');
 const scopes=await page.evaluate(()=>Object.fromEntries(
  ['DS0001','A0003','TA0112','M1055','C0066','S0181','S0302','S0368','S0423','S0551'].map(id=>
   [id,window.AttackFullSpanishV20.entry(id)?.scope||null])
 ));
 expect(scopes).toEqual({DS0001:'full_description',A0003:'full_description',
  TA0112:'full_description',M1055:'full_description',C0066:'full_description',
  S0181:'full_description',S0302:'full_description',S0368:'full_description',
  S0423:'full_description',S0551:null});
});
