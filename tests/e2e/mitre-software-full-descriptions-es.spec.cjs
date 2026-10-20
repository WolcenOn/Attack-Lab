const {test,expect}=require('@playwright/test');

const first60=Array.from({length:60},(_,i)=>'S'+String(i+1).padStart(4,'0'));

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

test('60 software descriptions faithfully correspond to the first source shard, with numbered references unchanged',async({page})=>{
 await page.goto('/');
 const audit=await page.evaluate(async ids=>{
  const source=await(await fetch('data/mitre/v20/software-00.json')).json();
  const s=window.AttackSoftwareFullSpanishV20;
  const all=window.AttackFullSpanishV20;
  const refs=text=>(text.match(/\[\d+\]/g)||[]).sort().join('|');
  const selected=source.filter(x=>ids.includes(x.id));
  const invalid=selected.filter(x=>{
   const e=all.entry(x.id);
   return !x.description_en||!e||e.scope!=='full_description'||e.status!=='draft_needs_review'||
     e.description.length<24||e.description===x.description_en||
     refs(e.description)!==refs(x.description_en)||s.searchText(x.id)!==e.description;
  }).map(x=>x.id);
  return {
   sourceShard:source.length,selected:selected.length,first60:ids.length,unique:new Set(s.ids).size,
   ids:s.ids.slice(0,60),invalid,softwareCoverage:s.coverage,fullCoverage:all.coverage,
   s1178:all.entry('S1178'),sourceS0039:source.find(x=>x.id==='S0039').description_en.includes('net1.exe'),
   oldCampaign:all.entry('C0066')?.scope
  };
 },first60);
 expect(audit).toEqual({
  sourceShard:359,selected:60,first60:60,unique:840,
  ids:first60,invalid:[],softwareCoverage:{software:840,totalSoftware:974},
  fullCoverage:{datasources:42,assets:18,tactics:39,mitigations:109,campaigns:61,software:840,fullDescriptions:1109},
  s1178:null,sourceS0039:true,oldCampaign:'full_description'
 });
});

test('Mimikatz S0002 displays full Spanish draft, original references and ES to EN to ES',async({page})=>{
 const root=await enter(page);
 await expect(root.locator('#mitrelocalTranslationStats')).toContainText('S 840/974');
 await root.locator('#mitrelocalSearch').fill('contraseñas de cuentas Windows en texto claro');
 await expect(root.locator('[data-local-id="S0002"]')).toHaveCount(1);
 await root.locator('[data-local-id="S0002"]').click();
 const detail=root.locator('#mitrelocalDetail');
 for(const term of ['Descripción íntegra traducida','Mimikatz','texto claro',
   'probar la seguridad de las redes','[1] [2]']){
  await expect(detail).toContainText(term);
 }
 await expect(detail.locator('a.resource-link')).toHaveAttribute('href',/software\/S0002\//);
 const original=detail.locator('details.mitrelocal-source-collapsed');
 await expect(original).toHaveJSProperty('open',false);
 await original.locator('summary').click();
 await expect(original).toContainText('Mimikatz is a credential dumper capable of obtaining plaintext');
 await page.locator('#language').selectOption('en');
 await expect(detail).toContainText('along with many other features');
 await expect(detail).not.toContainText('contraseñas de cuentas Windows en texto claro');
 await page.locator('#language').selectOption('es');
 await expect(detail).toContainText('contraseñas de cuentas Windows en texto claro');
});

test('Uroburos S0022 preserves all platforms, FSB attribution, Turla, and 2003 timeline',async({page})=>{
 const root=await enter(page);
 await root.locator('#mitrelocalSearch').fill('S0022');
 await root.locator('[data-local-id="S0022"]').click();
 const detail=root.locator('#mitrelocalDetail');
 for(const term of ['herramienta de ciberespionaje escrita en C','FSB','Turla','2003',
   'nodos de una red objetivo expuestos al exterior','Windows, Linux y macOS',
   'implantes interoperables','[1] [2]']){
  await expect(detail).toContainText(term);
 }
});

test('China Chopper S0020 keeps reverse access explanation without inventing callback traffic',async({page})=>{
 const root=await enter(page);
 await root.locator('#mitrelocalSearch').fill('S0020');
 await root.locator('[data-local-id="S0020"]').click();
 const detail=root.locator('#mitrelocalDetail');
 for(const term of ['China Chopper','webshell alojada en servidores web',
  'red empresarial','sin depender de que un sistema infectado',
  'servidor remoto de mando y control','[2] [3] [4] [5]']){
  await expect(detail).toContainText(term);
 }
});

test('S0039 Net utility and S0056 Net Crawler keep original command/tool distinctions',async({page})=>{
 const root=await enter(page),detail=root.locator('#mitrelocalDetail');
 await root.locator('#mitrelocalSearch').fill('S0039');
 await root.locator('[data-local-id="S0039"]').click();
 for(const term of ['Windows','usuarios, grupos, servicios','SMB','net use',
  'net1.exe','net.exe','net1 user']){
  await expect(detail).toContainText(term);
 }
 await root.locator('#mitrelocalSearch').fill('S0056');
 await root.locator('[data-local-id="S0056"]').click();
 for(const term of ['gusano de intranet','credenciales','SMB',
  'por fuerza bruta','PsExec','Net Crawler']){
  await expect(detail).toContainText(term);
 }
});

test('S0029 describes PsExec as a dual-use Microsoft tool, not inherently malicious',async({page})=>{
 const root=await enter(page);
 await root.locator('#mitrelocalSearch').fill('S0029');
 await root.locator('[data-local-id="S0029"]').click();
 const detail=root.locator('#mitrelocalDetail');
 for(const term of ['herramienta gratuita de Microsoft','otro equipo',
  'administradores de TI como atacantes']){
  await expect(detail).toContainText(term);
 }
});

test('S1178 remains untranslated and earlier families preserve full-description status',async({page})=>{
 const root=await enter(page);
 await root.locator('#mitrelocalSearch').fill('S1178');
 await root.locator('[data-local-id="S1178"]').click();
 const detail=root.locator('#mitrelocalDetail');
 await expect(detail).not.toContainText('Descripción íntegra de MITRE traducida al español');
 await expect(detail).not.toContainText('Descripción íntegra traducida');
 const result=await page.evaluate(()=>Object.fromEntries(
  ['S1178','DS0001','A0003','TA0112','M1055','C0066'].map(id=>[id,window.AttackFullSpanishV20.entry(id)?.scope||null])
 ));
 expect(result).toEqual({
  S1178:null,DS0001:'full_description',A0003:'full_description',
  TA0112:'full_description',M1055:'full_description',C0066:'full_description'
 });
});
