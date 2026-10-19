const {test,expect}=require('@playwright/test');

const fourthBatch=Array.from({length:61},(_,i)=>'S'+String(i+181).padStart(4,'0')).filter(id=>id!=='S0209');

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

test('software batch 4 has 60 complete translations, all source references, 240 unique IDs and S0209 missing in source',async({page})=>{
 await page.goto('/');
 const audit=await page.evaluate(async ids=>{
  const original=await(await fetch('data/mitre/v20/software-00.json')).json();
  const api=window.AttackSoftwareFullSpanishV20;
  const full=window.AttackFullSpanishV20;
  const refs=s=>(s.match(/\[\d+\]/g)||[]).sort().join('|');
  const chosen=original.filter(x=>ids.includes(x.id));
  const invalid=chosen.filter(r=>{
   const tr=full.entry(r.id);
   return !r.description_en||!tr||tr.scope!=='full_description'||
    tr.status!=='draft_needs_review'||tr.description.length<20||
    tr.description===r.description_en||refs(tr.description)!==refs(r.description_en)||
    tr.description!==api.searchText(r.id);
  }).map(x=>x.id);
  return {
   sourceCount:original.length,selected:chosen.length,expectedUnique:new Set(ids).size,
   translated:api.ids.length,unique:new Set(api.ids).size,
   invalid,s0209Source:original.find(x=>x.id==='S0209')?.description_en??null,
   s0209Translated:full.entry('S0209'),s0241:full.entry('S0241')?.scope,
   s0551:full.entry('S0551'),coverage:api.coverage,global:full.coverage,
   oldS:full.entry('S0002')?.scope,oldC:full.entry('C0066')?.scope
  };
 },fourthBatch);
 expect(audit).toEqual({
  sourceCount:359,selected:60,expectedUnique:60,translated:540,unique:540,
  invalid:[],s0209Source:null,s0209Translated:null,s0241:'full_description',
  s0551:null,coverage:{software:540,totalSoftware:974},
  global:{datasources:42,assets:18,tactics:39,mitigations:109,campaigns:61,software:540,fullDescriptions:809},
  oldS:'full_description',oldC:'full_description'
 });
});

test('Tor S0183 retains onion routing and is available in full Spanish and original English',async({page})=>{
 const root=await enter(page);
 await expect(root.locator('#mitrelocalTranslationStats')).toContainText('S 540/974');
 await root.locator('#mitrelocalSearch').fill('enrutamiento cebolla');
 await expect(root.locator('[data-local-id="S0183"]')).toHaveCount(1);
 await root.locator('[data-local-id="S0183"]').click();
 const detail=root.locator('#mitrelocalDetail');
 for(const phrase of ['Descripción íntegra traducida','Tor','mayor anonimato',
  'múltiples saltos','cifrado en varias capas','enrutamiento cebolla',
  'siguiente nodo','[1]']){
  await expect(detail).toContainText(phrase);
 }
 await expect(detail.locator('a.resource-link')).toHaveAttribute('href',/software\/S0183\//);
 const en=detail.locator('details.mitrelocal-source-collapsed');
 await expect(en).toHaveJSProperty('open',false);
 await en.locator('summary').click();
 await expect(en).toContainText('Tor is a software suite and network');
 await page.locator('#language').selectOption('en');
 await expect(detail).toContainText('Onion Routing');
 await expect(detail).not.toContainText('enrutamiento cebolla');
 await page.locator('#language').selectOption('es');
 await expect(detail).toContainText('enrutamiento cebolla');
});

test('Pupy S0192 preserves repeated [1] markers, four platforms and multiple payload packaging options',async({page})=>{
 const root=await enter(page);
 await root.locator('#mitrelocalSearch').fill('S0192');
 await root.locator('[data-local-id="S0192"]').click();
 const detail=root.locator('#mitrelocalDetail');
 for(const phrase of ['Windows, Linux, OSX y Android','Python','PowerShell',
  'ejecutable ELF','APK','Rubber Ducky','GitHub']){
  await expect(detail).toContainText(phrase);
 }
 const count=await page.evaluate(()=>window.AttackFullSpanishV20.entry('S0192').description.match(/\[1\]/g)?.length);
 expect(count).toBe(3);
});

test('Hydraq S0203 preserves Operation Aurora, 2009, qualified APT17 attribution and 8 references',async({page})=>{
 const root=await enter(page);
 await root.locator('#mitrelocalSearch').fill('S0203');
 await root.locator('[data-local-id="S0203"]').click();
 const detail=root.locator('#mitrelocalDetail');
 for(const phrase of ['Elderwood','2009','Operation Aurora',
   'posiblemente entre ellos APT17','[1] [2] [3] [4] [5] [6] [7] [8]']){
  await expect(detail).toContainText(phrase);
 }
});

test('Havij S0224 and sqlmap S0225 retain legitimate penetration-testing usage',async({page})=>{
 const root=await enter(page);
 const detail=root.locator('#mitrelocalDetail');
 await root.locator('#mitrelocalSearch').fill('S0224');
 await root.locator('[data-local-id="S0224"]').click();
 for(const phrase of ['ITSecTeam','inyección SQL',
   'profesionales de pruebas de penetración como por adversarios']){
  await expect(detail).toContainText(phrase);
 }
 await root.locator('#mitrelocalSearch').fill('S0225');
 await root.locator('[data-local-id="S0225"]').click();
 for(const phrase of ['sqlmap','código abierto','pruebas de penetración',
   'detección y explotación de fallos de inyección SQL']){
  await expect(detail).toContainText(phrase);
 }
});

test('Invoke-PSImage S0231 preserves the whole image embedding and macro-triggered password-dumping example',async({page})=>{
 const root=await enter(page);
 await root.locator('#mitrelocalSearch').fill('S0231');
 await root.locator('[data-local-id="S0231"]').click();
 const detail=root.locator('#mitrelocalDetail');
 for(const phrase of ['script de PowerShell','píxeles de una imagen PNG',
  'comando de una sola línea','Invoke-Mimikatz',
  'desde una macro','descarga la imagen','vuelca las contraseñas']){
  await expect(detail).toContainText(phrase);
 }
});

test('S0209 without an English source is not fabricated; S0241 complete and S0551 pending',async({page})=>{
 const root=await enter(page);
 await root.locator('#mitrelocalSearch').fill('S0241');
 await root.locator('[data-local-id="S0241"]').click();
 const detail=root.locator('#mitrelocalDetail');
 for(const phrase of ['RATANKBA','instituciones financieras','Polonia, México, Uruguay',
  'interfaz gráfica de usuario','[1] [2]']){
  await expect(detail).toContainText(phrase);
 }
 await root.locator('#mitrelocalSearch').fill('S0551');
 await root.locator('[data-local-id="S0551"]').click();
 await expect(detail).not.toContainText('Descripción íntegra de MITRE traducida al español');
 await expect(detail).not.toContainText('Descripción íntegra traducida');
 expect(await page.evaluate(()=>window.AttackFullSpanishV20.entry('S0209'))).toBeNull();
 expect(await page.evaluate(()=>window.AttackFullSpanishV20.entry('S0551'))).toBeNull();
});
