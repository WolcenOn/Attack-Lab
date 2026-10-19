const {test,expect}=require('@playwright/test');

const batch3=Array.from({length:60},(_,i)=>'S'+String(i+121).padStart(4,'0'));

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

test('S0121–S0180 are 60 unique complete ES descriptions with exact MITRE v20 footnotes',async({page})=>{
 await page.goto('/');
 const v=await page.evaluate(async ids=>{
  const original=await(await fetch('data/mitre/v20/software-00.json')).json();
  const s=window.AttackSoftwareFullSpanishV20,full=window.AttackFullSpanishV20;
  const refs=text=>(text.match(/\[\d+\]/g)||[]).sort().join('|');
  const batch=original.filter(x=>ids.includes(x.id));
  const wrong=batch.filter(x=>{
   const es=full.entry(x.id);
   return !x.description_en||!es||es.scope!=='full_description'||
    es.status!=='draft_needs_review'||!es.description||es.description.length<24||
    es.description===x.description_en||refs(es.description)!==refs(x.description_en)||
    es.description!==s.searchText(x.id);
  }).map(x=>x.id);
  return {shard:original.length,selected:batch.length,distinct:new Set(ids).size,
   translated:s.ids.length,unique:new Set(s.ids).size,wrong,
   pending:full.entry('S1178'),S0175Footnotes:refs(full.entry('S0175')?.description||''),
   software:s.coverage,all:full.coverage,old:full.entry('S0002')?.scope,
   c:full.entry('C0066')?.scope};
 },batch3);
 expect(v).toEqual({shard:359,selected:60,distinct:60,translated:840,unique:840,
  wrong:[],pending:null,S0175Footnotes:'',
  software:{software:840,totalSoftware:974},
  all:{datasources:42,assets:18,tactics:39,mitigations:109,campaigns:61,software:840,fullDescriptions:1109},
  old:'full_description',c:'full_description'});
});

test('S0140 Shamoon retains incident chronology, artifacts and name ambiguity in ES↔EN',async({page})=>{
 const root=await enter(page);
 await expect(root.locator('#mitrelocalTranslationStats')).toContainText('S 840/974');
 await root.locator('#mitrelocalSearch').fill('Cutting Sword of Justice');
 await expect(root.locator('[data-local-id="S0140"]')).toHaveCount(1);
 await root.locator('[data-local-id="S0140"]').click();
 const detail=root.locator('#mitrelocalDetail');
 for(const phrase of ['Descripción íntegra traducida','2012','Shamoon 2 y Shamoon 3',
  '2016 y 2018','RawDisk','Filerase','Kwampirs','al propio malware','[2] [3] [4] [5]']){
  await expect(detail).toContainText(phrase);
 }
 await expect(detail.locator('a.resource-link')).toHaveAttribute('href',/software\/S0140\//);
 const en=detail.locator('details.mitrelocal-source-collapsed');
 await expect(en).toHaveJSProperty('open',false);
 await en.locator('summary').click();
 await expect(en).toContainText('Shamoon is wiper malware');
 await page.locator('#language').selectOption('en');
 await expect(detail).toContainText('Other versions known as Shamoon 2');
 await expect(detail).not.toContainText('malware de borrado destructivo');
 await page.locator('#language').selectOption('es');
 await expect(detail).toContainText('malware de borrado destructivo');
});

test('S0154 Cobalt Strike remains a commercial dual-use tool with both source references',async({page})=>{
 const root=await enter(page);
 await root.locator('#mitrelocalSearch').fill('software de simulación de adversarios');
 await expect(root.locator('[data-local-id="S0154"]')).toHaveCount(1);
 await root.locator('[data-local-id="S0154"]').click();
 const detail=root.locator('#mitrelocalDetail');
 for(const phrase of ['herramienta comercial de acceso remoto','simulación de adversarios',
   'acciones posteriores a la explotación','todas las tácticas de ATT&CK',
   'Metasploit','Mimikatz','[1]']){
  await expect(detail).toContainText(phrase);
 }
 const refs=await page.evaluate(()=>window.AttackFullSpanishV20.entry('S0154').description.match(/\[1\]/g)?.length);
 expect(refs).toBe(2);
});

test('S0136 USBStealer preserves isolation and no-Internet limitations',async({page})=>{
 const root=await enter(page);
 await root.locator('#mitrelocalSearch').fill('S0136');
 await root.locator('[data-local-id="S0136"]').click();
 const detail=root.locator('#mitrelocalDetail');
 for(const phrase of ['APT28','2005','redes aisladas físicamente',
  'No dispone de capacidad para comunicarse por Internet','ADVSTORESHELL','[1] [2]']){
  await expect(detail).toContainText(phrase);
 }
});

test('S0126 and S0153 preserve suspected origins and qualified relationships',async({page})=>{
 const root=await enter(page),detail=root.locator('#mitrelocalDetail');
 await root.locator('#mitrelocalSearch').fill('S0126');
 await root.locator('[data-local-id="S0126"]').click();
 for(const phrase of ['se sospecha que desciende de Agent.btz','Turla',
  '2007','[1] [2] [3]']){
  await expect(detail).toContainText(phrase);
 }
 await root.locator('#mitrelocalSearch').fill('S0153');
 await root.locator('[data-local-id="S0153"]').click();
 for(const phrase of ['menuPass','coincidencias con PlugX',
  'podría estar basada','Trochilus','[1] [2]']){
  await expect(detail).toContainText(phrase);
 }
});

test('S0174 Responder retains exact authentication protocols; S0175 has no invented footnotes',async({page})=>{
 const root=await enter(page),detail=root.locator('#mitrelocalDetail');
 await root.locator('#mitrelocalSearch').fill('S0174');
 await root.locator('[data-local-id="S0174"]').click();
 for(const phrase of ['LLMNR, NBT-NS y MDNS','HTTP/SMB/MSSQL/FTP/LDAP',
  'NTLMv1/NTLMv2/LMv2','NTLMSSP','autenticación HTTP básica']){
  await expect(detail).toContainText(phrase);
 }
 await root.locator('#mitrelocalSearch').fill('S0175');
 await root.locator('[data-local-id="S0175"]').click();
 await expect(detail).toContainText('complemento de Tor de código abierto');
 await expect(detail).toContainText('conexiones HTTPS');
 const description=await page.evaluate(()=>window.AttackFullSpanishV20.entry('S0175').description);
 expect(description).not.toMatch(/\[\d+\]/);
});

test('S1178 is pending, while S0180 and all earlier translated families remain intact',async({page})=>{
 const root=await enter(page);
 await root.locator('#mitrelocalSearch').fill('S1178');
 await root.locator('[data-local-id="S1178"]').click();
 const detail=root.locator('#mitrelocalDetail');
 await expect(detail).not.toContainText('Descripción íntegra de MITRE traducida al español');
 await expect(detail).not.toContainText('Descripción íntegra traducida');
 const audit=await page.evaluate(()=>Object.fromEntries(
  ['DS0001','A0003','TA0112','M1055','C0066','S0002','S0121','S0180','S1178'].map(id=>
    [id,window.AttackFullSpanishV20.entry(id)?.scope||null])
 ));
 expect(audit).toEqual({DS0001:'full_description',A0003:'full_description',
  TA0112:'full_description',M1055:'full_description',C0066:'full_description',
  S0002:'full_description',S0121:'full_description',S0180:'full_description',S1178:null});
});
