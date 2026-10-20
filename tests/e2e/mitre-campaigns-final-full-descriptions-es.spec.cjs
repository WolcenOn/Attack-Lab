const {test,expect}=require('@playwright/test');

const finalIds=[
 'C0025','C0026','C0027','C0028','C0029','C0030','C0031','C0032',
 'C0033','C0034','C0035','C0036','C0037','C0038','C0039',
 'C0040','C0041','C0042','C0043','C0044','C0045','C0046','C0047',
 'C0048','C0049','C0050','C0051','C0052','C0053',
 'C0054','C0055','C0056','C0057','C0058','C0059','C0060',
 'C0061','C0062','C0063','C0064','C0066'
];

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
 await root.locator('#mitrelocalType').selectOption('campaigns');
 return root;
}

test('all 61 campaign full descriptions are present, exact reference markers and English sources preserved',async({page})=>{
 await page.goto('/');
 const audit=await page.evaluate(async ids=>{
  const original=await(await fetch('data/mitre/v20/campaigns-00.json')).json();
  const api=window.AttackCampaignFullSpanishV20;
  const unified=window.AttackFullSpanishV20;
  const refs=s=>(s.match(/\[\d+\]/g)||[]).sort().join('|');
  const invalid=original.filter(r=>{
   const entry=unified.entry(r.id);
   return !r.description_en||!entry||entry.scope!=='full_description'||
    entry.status!=='draft_needs_review'||entry.description.length<90||
    entry.description===r.description_en||refs(entry.description)!==refs(r.description_en)||
    api.searchText(r.id)!==entry.description;
  }).map(r=>r.id);
  return {
   total:original.length,overlayIds:api.ids.length,unique:new Set(api.ids).size,
   invalid,untranslated:original.filter(r=>!api.entry(r.id)).map(r=>r.id),
   newIds:original.filter(r=>ids.includes(r.id)).length,newUnique:new Set(ids).size,
   coverage:api.coverage,global:unified.coverage,
   firstSeenUnmodified:original.find(r=>r.id==='C0001').first_seen==='January 2019 [1]',
   originalEnglishUnmodified:original.find(r=>r.id==='C0066').description_en.includes('has not been formally attributed')
  };
 },finalIds);
 expect(audit).toEqual({
  total:61,overlayIds:61,unique:61,invalid:[],untranslated:[],
  newIds:41,newUnique:41,coverage:{campaigns:61,totalCampaigns:61},
  global:{datasources:42,assets:18,tactics:39,mitigations:109,campaigns:61,software:900,fullDescriptions:1169},
  firstSeenUnmodified:true,originalEnglishUnmodified:true
 });
});

test('C0066 water utilities retain operational details and explicitly unconfirmed attribution ES-EN-ES',async({page})=>{
 const root=await enter(page);
 await expect(root.locator('#mitrelocalTranslationStats')).toContainText('C 61/61');
 await root.locator('#mitrelocalSearch').fill('atribución específica de las intrusiones de Minnesota');
 await expect(root.locator('[data-local-id="C0066"]')).toHaveCount(1);
 await root.locator('[data-local-id="C0066"]').click();
 const detail=root.locator('#mitrelocalDetail');
 for(const phrase of ['Descripción íntegra traducida','27 de julio de 2026','más de 30',
  'MicroLogix 1100 y 1400','presión de agua','no se ha atribuido formalmente',
  'sigue sin confirmarse','[1] [2]']){
  await expect(detail).toContainText(phrase);
 }
 await expect(detail.locator('a.resource-link')).toHaveAttribute('href',/campaigns\/C0066\//);
 const english=detail.locator('details.mitrelocal-source-collapsed');
 await expect(english).toHaveJSProperty('open',false);
 await english.locator('summary').click();
 await expect(english).toContainText('The campaign has not been formally attributed');
 await page.locator('#language').selectOption('en');
 await expect(detail).toContainText('attribution for the Minnesota intrusions specifically remains unconfirmed');
 await expect(detail).not.toContainText('sigue sin confirmarse');
 await page.locator('#language').selectOption('es');
 await expect(detail).toContainText('sigue sin confirmarse');
});

test('C0043 avoids inventing OT access; C0045 preserves vendor dispute about Ray vulnerability',async({page})=>{
 const root=await enter(page),detail=root.locator('#mitrelocalDetail');
 await root.locator('#mitrelocalSearch').fill('C0043');
 await root.locator('[data-local-id="C0043"]').click();
 for(const phrase of ['no hay pruebas','entornos OT','TAG38',
  'posiblemente','República Popular China']){
  await expect(detail).toContainText(phrase);
 }
 await root.locator('#mitrelocalSearch').fill('C0045');
 await root.locator('[data-local-id="C0045"]').click();
 for(const phrase of ['CVE-2023-48022','no corregida','cuestionada por el fabricante',
  'red estrictamente controlado']){
  await expect(detail).toContainText(phrase);
 }
});

test('C0055 botnet technical identifiers and C0057 two-stage 3CX supply-chain details survive translation',async({page})=>{
 const root=await enter(page),detail=root.locator('#mitrelocalDetail');
 await root.locator('#mitrelocalSearch').fill('C0055');
 await root.locator('[data-local-id="C0055"]').click();
 for(const phrase of ['CovertNetwork-1658','7777','xlogin','63256','alogin',
  'Storm-0940','[1] [2]']){
  await expect(detail).toContainText(phrase);
 }
 await root.locator('#mitrelocalSearch').fill('C0057');
 await root.locator('[data-local-id="C0057"]').click();
 for(const phrase of ['dos etapas','X_Trader','UNC4736','Windows y macOS',
  '600.000 clientes','12 millones','Gopuram','marzo de 2023']){
  await expect(detail).toContainText(phrase);
 }
});

test('C0059 distinguishes UNC6040 and UNC6240 without asserting a direct tie to The Com',async({page})=>{
 const root=await enter(page);
 await root.locator('#mitrelocalSearch').fill('relación operativa directa');
 await expect(root.locator('[data-local-id="C0059"]')).toHaveCount(1);
 await root.locator('[data-local-id="C0059"]').click();
 const detail=root.locator('#mitrelocalDetail');
 for(const phrase of ['UNC6040','UNC6240','ShinyHunters','The Com',
  'no indican necesariamente una relación operativa directa']){
  await expect(detail).toContainText(phrase);
 }
});

test('C0062 AI-orchestrated campaign and C0064 Mexico breach keep scoped claims and limitations',async({page})=>{
 const root=await enter(page),detail=root.locator('#mitrelocalDetail');
 await root.locator('#mitrelocalSearch').fill('C0062');
 await root.locator('[data-local-id="C0062"]').click();
 for(const phrase of ['GTG-1002','Claude Code','MCP','aproximadamente 30 entidades',
  'intervención humana mínima']){
  await expect(detail).toContainText(phrase);
 }
 await root.locator('#mitrelocalSearch').fill('C0064');
 await root.locator('[data-local-id="C0064"]').click();
 for(const phrase of ['OpenAI GPT-4.1','Servicio de Administración Tributaria',
  'Instituto Nacional Electoral','Agua y Drenaje','no debe considerarse exhaustiva']){
  await expect(detail).toContainText(phrase);
 }
});

test('C0063 Poland attacks preserve non-impact on generation and competing attribution assessments',async({page})=>{
 const root=await enter(page);
 await root.locator('#mitrelocalSearch').fill('no afectaron a la generación de electricidad');
 await expect(root.locator('[data-local-id="C0063"]')).toHaveCount(1);
 await root.locator('[data-local-id="C0063"]').click();
 const detail=root.locator('#mitrelocalDetail');
 for(const phrase of ['más de 30 parques','no afectaron a la generación de electricidad',
  'DynoWiper','LazyWiper','desde al menos marzo de 2025',
  'FSB','STATIC TUNDRA','GRU','ELECTRUM','Sandworm Team']){
  await expect(detail).toContainText(phrase);
 }
});

test('MITRE v20 full Spanish source contract still includes DS, A, TA and M and rejects unknown C IDs',async({page})=>{
 await page.goto('/');
 const audit=await page.evaluate(()=>({
  ds:window.AttackFullSpanishV20.entry('DS0001')?.scope,
  asset:window.AttackFullSpanishV20.entry('A0003')?.scope,
  ta:window.AttackFullSpanishV20.entry('TA0112')?.scope,
  mitigation:window.AttackFullSpanishV20.entry('M1055')?.scope,
  campaign:window.AttackFullSpanishV20.entry('C0025')?.scope,
  unknown:window.AttackFullSpanishV20.entry('C9999')
 }));
 expect(audit).toEqual({ds:'full_description',asset:'full_description',ta:'full_description',
  mitigation:'full_description',campaign:'full_description',unknown:null});
});
