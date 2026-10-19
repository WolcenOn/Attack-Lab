const {test,expect}=require('@playwright/test');

const finalIds=[
 'M1033','M1034','M1035','M1036','M1038','M1040',
 'M1043','M1044','M1045','M1046','M1047','M1048',
 'M1049','M1050','M1051','M1052','M1054','M1055','M1057'
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
 await root.locator('#mitrelocalType').selectOption('mitigations');
 return root;
}

test('all 109 MITRE v20 mitigation descriptions have full Spanish drafts, with original English and reference markers unchanged',async({page})=>{
 await page.goto('/');
 const audit=await page.evaluate(async ids=>{
  const original=await(await fetch('data/mitre/v20/mitigations-00.json')).json();
  const mitigation=window.AttackMitigationFullSpanishV20;
  const full=window.AttackFullSpanishV20;
  const refs=s=>(s.match(/\[\d+\]/g)||[]).sort().join('|');
  const invalid=original.filter(r=>{
   const entry=full.entry(r.id);
   return !r.description_en?.trim()||!entry||entry.scope!=='full_description'||
    entry.status!=='draft_needs_review'||entry.description.length<40||
    entry.description===r.description_en||refs(entry.description)!==refs(r.description_en)||
    mitigation.searchText(r.id)!==entry.description;
  }).map(r=>r.id);
  const pending=original.filter(r=>!mitigation.entry(r.id)).map(r=>r.id);
  const batch=original.filter(r=>ids.includes(r.id));
  return {total:original.length,overlayIds:mitigation.ids.length,
   unique:new Set(mitigation.ids).size,invalid,pending,
   finalBatch:batch.length,finalBatchUnique:new Set(ids).size,
   categories:['ics','mobile','enterprise'].map(domain=>
    original.filter(r=>r.domain===domain&&!!mitigation.entry(r.id)).length),
   mitigationCoverage:mitigation.coverage,fullCoverage:full.coverage,
   sourceM1057:original.find(r=>r.id==='M1057').description_en.includes('Data Loss Prevention (DLP)'),
   sourceM1055:original.find(r=>r.id==='M1055').description_en.includes('Do Not Mitigate')
  };
 },finalIds);
 expect(audit).toEqual({
  total:109,overlayIds:109,unique:109,invalid:[],pending:[],
  finalBatch:19,finalBatchUnique:19,categories:[53,13,43],
  mitigationCoverage:{mitigations:109,totalMitigations:109,ics:53,mobile:13,enterprise:43},
  fullCoverage:{datasources:42,assets:18,tactics:39,mitigations:109,campaigns:61,software:780,fullDescriptions:1049},
  sourceM1057:true,sourceM1055:true
 });
});

test('M1033 installation restrictions searchable in Spanish and reversible ES to EN to ES',async({page})=>{
 const root=await enter(page);
 await expect(root.locator('#mitrelocalTranslationStats')).toContainText('M 109/109');
 await root.locator('#mitrelocalSearch').fill('instalen software no autorizado');
 await expect(root.locator('[data-local-id="M1033"]')).toHaveCount(1);
 await root.locator('[data-local-id="M1033"]').click();
 const detail=root.locator('#mitrelocalDetail');
 for(const text of ['Descripción íntegra traducida','AppLocker','%AppData%','%Temp%',
  'identificador de evento de Windows 4688','11707','SCCM','OSQuery','Wazuh']){
  await expect(detail).toContainText(text);
 }
 const original=detail.locator('details.mitrelocal-source-collapsed');
 await expect(original).toHaveJSProperty('open',false);
 await original.locator('summary').click();
 await expect(original).toContainText('Prevent users or groups from installing unauthorized');
 await page.locator('#language').selectOption('en');
 await expect(detail).toContainText('Software Restriction Policies (SRP)');
 await expect(detail).not.toContainText('instalen software no autorizado');
 await page.locator('#language').selectOption('es');
 await expect(detail).toContainText('instalen software no autorizado');
});

test('M1036 account usage retains concrete lockouts, schedules, expired accounts and historical rotation',async({page})=>{
 const root=await enter(page);
 await root.locator('#mitrelocalSearch').fill('M1036');
 await root.locator('[data-local-id="M1036"]').click();
 const detail=root.locator('#mitrelocalDetail');
 for(const phrase of ['entre 3 y 5','15 minutos','de 8:00 a 18:00',
  'las 2:00','10-15 minutos','90 días','trabajadores temporales',
  'IAM','SIEM']){
  await expect(detail).toContainText(phrase);
 }
});

test('M1044/M1045/M1046 preserve signature, library loading and boot technical names',async({page})=>{
 const root=await enter(page),detail=root.locator('#mitrelocalDetail');
 for(const [id,phrases] of [
  ['M1044',['LD_PRELOAD','LD_LIBRARY_PATH','SafeDLLSearchMode','Signtool','Sysmon','ID de evento 7','Tripwire']],
  ['M1045',['Online Certificate Status Protocol (OCSP)','listas de revocación','PKI','CI/CD','hashes criptográficos']],
  ['M1046',['UEFI Secure Boot','TPM','cargador de arranque','núcleo','atestación']]
 ]){
  await root.locator('#mitrelocalSearch').fill(id);
  await root.locator('[data-local-id="'+id+'"]').click();
  for(const phrase of phrases)await expect(detail).toContainText(phrase);
 }
});

test('M1049 includes all five antivirus methods and M1050 technical mitigation examples',async({page})=>{
 const root=await enter(page),detail=root.locator('#mitrelocalDetail');
 await root.locator('#mitrelocalSearch').fill('M1049');
 await root.locator('[data-local-id="M1049"]').click();
 for(const phrase of ['Emotet','heurísticos','cifrado masivo de archivos','adjunto de correo',
  'día cero','EDR','Gestión centralizada'])await expect(detail).toContainText(phrase);
 await root.locator('#mitrelocalSearch').fill('M1050');
 await root.locator('[data-local-id="M1050"]').click();
 for(const phrase of ['Data Execution Prevention (DEP)','GRSEC',
  'ExploitProtectionExportSettings.exe','Parches virtuales','JScript','macros']){
  await expect(detail).toContainText(phrase);
 }
});

test('M1055 do-not-mitigate preserves the nuanced risks rather than inventing a recommended preventive control',async({page})=>{
 const root=await enter(page);
 await root.locator('#mitrelocalSearch').fill('compensaciones entre las medidas de mitigación');
 await expect(root.locator('[data-local-id="M1055"]')).toHaveCount(1);
 await root.locator('[data-local-id="M1055"]').click();
 const detail=root.locator('#mitrelocalDetail');
 for(const phrase of ['No mitigar','cortes de servicio no previstos',
  'visibilidad o eficacia','validación de certificados','man-in-the-middle',
  'transacciones en tiempo real']){
  await expect(detail).toContainText(phrase);
 }
 await page.locator('#language').selectOption('en');
 await expect(detail).toContainText('attempting to mitigate a specific technique may inadvertently increase');
});

test('M1057 retains original [1] reference and cloud, network and endpoint data protection details',async({page})=>{
 const root=await enter(page);
 await root.locator('#mitrelocalSearch').fill('M1057');
 await root.locator('[data-local-id="M1057"]').click();
 const detail=root.locator('#mitrelocalDetail');
 for(const phrase of ['datos sensibles','[1]','PII',
  'tarjetas de crédito','datos en tránsito','copiar y pegar',
  'Google Drive, OneDrive o AWS']){
  await expect(detail).toContainText(phrase);
 }
 await expect(detail.locator('a.resource-link')).toHaveAttribute('href',/mitigations\/M1057\//);
 await page.locator('#language').selectOption('en');
 await expect(detail).toContainText('Data Loss Prevention (DLP) involves implementing strategies');
});

test('all categories previously covered remain available and unknown identifiers return null',async({page})=>{
 await page.goto('/');
 const result=await page.evaluate(()=>({
  ds:window.AttackFullSpanishV20.entry('DS0001')?.scope,
  a:window.AttackFullSpanishV20.entry('A0003')?.scope,
  ta:window.AttackFullSpanishV20.entry('TA0112')?.scope,
  m:window.AttackFullSpanishV20.entry('M1055')?.scope,
  unknown:window.AttackFullSpanishV20.entry('M9999')
 }));
 expect(result).toEqual({ds:'full_description',a:'full_description',ta:'full_description',m:'full_description',unknown:null});
});
