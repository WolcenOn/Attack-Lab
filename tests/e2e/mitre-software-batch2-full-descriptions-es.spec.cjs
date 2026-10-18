const {test,expect}=require('@playwright/test');

const batch2=Array.from({length:60},(_,i)=>'S'+String(i+61).padStart(4,'0'));

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

test('second 60 full S drafts preserve every source footnote and bring global coverage to 389',async({page})=>{
 await page.goto('/');
 const result=await page.evaluate(async ids=>{
  const source=await(await fetch('data/mitre/v20/software-00.json')).json();
  const s=window.AttackSoftwareFullSpanishV20;
  const all=window.AttackFullSpanishV20;
  const refs=text=>(text.match(/\[\d+\]/g)||[]).sort().join('|');
  const subset=source.filter(x=>ids.includes(x.id));
  const issues=subset.filter(x=>{
   const e=all.entry(x.id);
   return !x.description_en||!e||e.scope!=='full_description'||
    e.status!=='draft_needs_review'||e.description.length<24||
    e.description===x.description_en||refs(e.description)!==refs(x.description_en)||
    s.searchText(x.id)!==e.description;
  }).map(x=>x.id);
  return {shardRecords:source.length,total:s.ids.length,unique:new Set(s.ids).size,
   selected:subset.length,newUnique:new Set(ids).size,issues,
   missing:source.filter(x=>ids.includes(x.id)&&!all.entry(x.id)).map(x=>x.id),
   pendingS0242:all.entry('S0242'),softwareCoverage:s.coverage,global:all.coverage,
   legacy:all.entry('M1055')?.scope};
 },batch2);
 expect(result).toEqual({
  shardRecords:359,total:240,unique:240,selected:60,newUnique:60,
  issues:[],missing:[],pendingS0242:null,
  softwareCoverage:{software:240,totalSoftware:974},
  global:{datasources:42,assets:18,tactics:39,mitigations:109,campaigns:61,software:240,fullDescriptions:509},
  legacy:'full_description'
 });
});

test('BlackEnergy S0089 keeps historical evolution, Georgia 2008 and Ukrainian targets in ES/EN',async({page})=>{
 const root=await enter(page);
 await expect(root.locator('#mitrelocalTranslationStats')).toContainText('S 240/974');
 await root.locator('#mitrelocalSearch').fill('conjunto de herramientas de malware');
 await expect(root.locator('[data-local-id="S0089"]')).toHaveCount(1);
 await root.locator('[data-local-id="S0089"]').click();
 const detail=root.locator('#mitrelocalDetail');
 for(const phrase of ['Descripción íntegra traducida','BlackEnergy','2007','DDoS',
   'Georgia y Rusia de 2008','instituciones ucranianas','BlackEnergy 2 y BlackEnergy 3']){
  await expect(detail).toContainText(phrase);
 }
 await expect(detail.locator('a.resource-link')).toHaveAttribute('href',/software\/S0089\//);
 const original=detail.locator('details.mitrelocal-source-collapsed');
 await expect(original).toHaveJSProperty('open',false);
 await original.locator('summary').click();
 await expect(original).toContainText('BlackEnergy is a malware toolkit');
 await page.locator('#language').selectOption('en');
 await expect(detail).toContainText('originally designed to create botnets');
 await expect(detail).not.toContainText('instituciones ucranianas');
 await page.locator('#language').selectOption('es');
 await expect(detail).toContainText('instituciones ucranianas');
});

test('ZLib S0086 is malware and explicitly not the legitimate compression library',async({page})=>{
 const root=await enter(page);
 await root.locator('#mitrelocalSearch').fill('S0086');
 await root.locator('[data-local-id="S0086"]').click();
 const detail=root.locator('#mitrelocalDetail');
 for(const phrase of ['puerta trasera con numerosas funciones',
   'segunda fase','Operation Dust Storm','desde al menos 2014',
   'no debe confundirse con la biblioteca legítima de compresión']){
  await expect(detail).toContainText(phrase);
 }
});

test('Reg S0075, ftp S0095, cmd S0106 and dsquery S0105 preserve ordinary admin tools',async({page})=>{
 const root=await enter(page),detail=root.locator('#mitrelocalDetail');
 for(const [id,phrases] of [
  ['S0075',['utilidad de Windows','Registro de Windows','consultar, añadir, modificar y eliminar','[1]','[2]']],
  ['S0095',['disponible habitualmente en los sistemas operativos','Protocolo de Transferencia de Archivos (FTP)','exfiltrar datos']],
  ['S0105',['Active Directory','Windows Server','Remote Server Administration Tools']],
  ['S0106',['intérprete de línea de comandos de Windows','Cmd.exe','dir [2]','del [3]','copy [4]']]
 ]){
  await root.locator('#mitrelocalSearch').fill(id);
  await root.locator('[data-local-id="'+id+'"]').click();
  for(const phrase of phrases)await expect(detail).toContainText(phrase);
 }
});

test('OwaAuth S0072 and Backdoor.Oldrea S0093 preserve targeting and industrial capabilities',async({page})=>{
 const root=await enter(page),detail=root.locator('#mitrelocalDetail');
 await root.locator('#mitrelocalSearch').fill('S0072');
 await root.locator('[data-local-id="S0072"]').click();
 for(const term of ['Microsoft Exchange','robo de credenciales','al parecer',
  'exclusivamente Threat Group-3390'])await expect(detail).toContainText(term);
 await root.locator('#mitrelocalSearch').fill('S0093');
 await root.locator('[data-local-id="S0093"]').click();
 for(const term of ['Dragonfly','2013','cadena de suministro','sistemas de control industrial (ICS)','[1] [2] [3]']){
  await expect(detail).toContainText(term);
 }
});

test('UACMe S0116 keeps legitimate assessment characterization and XTunnel S0117 attribution caveat',async({page})=>{
 const root=await enter(page),detail=root.locator('#mitrelocalDetail');
 await root.locator('#mitrelocalSearch').fill('S0116');
 await root.locator('[data-local-id="S0116"]').click();
 for(const term of ['herramienta de evaluación de código abierto',
  'Control de cuentas de usuario (UAC)','distintas versiones']){
  await expect(detail).toContainText(term);
 }
 await root.locator('#mitrelocalSearch').fill('S0117');
 await root.locator('[data-local-id="S0117"]').click();
 for(const term of ['similar a una VPN','servidor de mando y control (C2)',
  'mayo de 2013','según los informes','Comité Nacional Demócrata']){
  await expect(detail).toContainText(term);
 }
});

test('S0242 stays pending; completed DS/A/TA/M/C/S contracts remain accessible',async({page})=>{
 const root=await enter(page);
 await root.locator('#mitrelocalSearch').fill('S0242');
 await root.locator('[data-local-id="S0242"]').click();
 const detail=root.locator('#mitrelocalDetail');
 await expect(detail).not.toContainText('Descripción íntegra de MITRE traducida al español');
 await expect(detail).not.toContainText('Descripción íntegra traducida');
 const ids=await page.evaluate(()=>Object.fromEntries(
  ['DS0001','A0003','TA0112','M1055','C0066','S0061','S0120','S0242'].map(id=>
  [id,window.AttackFullSpanishV20.entry(id)?.scope||null])
 ));
 expect(ids).toEqual({DS0001:'full_description',A0003:'full_description',
  TA0112:'full_description',M1055:'full_description',C0066:'full_description',
  S0061:'full_description',S0120:'full_description',S0242:null});
});
