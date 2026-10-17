const {test,expect}=require('@playwright/test');

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
 return root;
}

test('DET/AN: educational draft IDs and coverage are specific to MITRE v20',async({page})=>{
 await page.goto('/');
 const result=await page.evaluate(async()=>{
  const api=window.AttackDetectionSpanishV20;
  const manifests=await (await fetch('data/mitre/v20/manifest.json')).json();
  const names=manifests.index_shards;
  const all=(await Promise.all(names.map(async n=>(await (await fetch('data/mitre/v20/'+n)).json())))).flat();
  const det=all.filter(r=>r.type==='detections'),an=all.filter(r=>r.type==='analytics');
  const sampleDET=['DET0460','DET0003','DET0008','DET0021','DET0034','DET0054','DET0072','DET0104','DET0107','DET0160','DET0183','DET0234','DET0236','DET0259','DET0327','DET0440','DET0451','DET0455','DET0463'];
  const sampleAN=['AN1270','AN1268','AN0350','AN0188','AN0590','AN0008','AN0006','AN0017','AN0061','AN0199','AN0287','AN0449','AN0516','AN0648','AN0655','AN0714','AN0931','AN1220','AN1245','AN1252','AN1275'];
  return {
   coverage:api.coverage,detCount:det.length,anCount:an.length,
   missing:sampleDET.filter(id=>!det.some(d=>d.id===id)||!api.strategy(id)),
   missingAN:sampleAN.filter(id=>!an.some(a=>a.id===id)||!api.analytic(id)),
   unrelated:api.strategy('DET9999'),unrelatedAN:api.analytic('AN2070'),
   status:api.analytic('AN1252').status
  };
 });
 expect(result.coverage).toEqual({detections:51,analytics:140});
 expect(result.detCount).toBe(933);
 expect(result.anCount).toBe(2283);
 expect(result.missing).toEqual([]);
 expect(result.missingAN).toEqual([]);
 expect(result.unrelated).toBeNull();
 expect(result.unrelatedAN).toBeNull();
 expect(result.status).toBe('draft_needs_review');
});

test('DET: Spanish search, PowerShell educational guide, English original and return to ES',async({page})=>{
 const root=await enter(page);
 await root.locator('#mitrelocalType').selectOption('detections');
 await root.locator('#mitrelocalSearch').fill('abuso de PowerShell');
 await expect(root.locator('[data-local-id="DET0455"]')).toHaveCount(1);
 await root.locator('[data-local-id="DET0455"]').click();
 const detail=root.locator('#mitrelocalDetail');
 await expect(detail.locator('h3')).toContainText('PowerShell');
 await expect(detail).toContainText('Guía de investigación para ASIR');
 await expect(detail).toContainText('Qué NO demuestra una señal aislada');
 await expect(detail).toContainText('Pregunta razonada');
 await expect(detail).toContainText('Español provisional');
 await expect(detail).toContainText('Nombre original MITRE: Abuse of PowerShell for Arbitrary Execution');
 await page.locator('#language').selectOption('en');
 await expect(detail.locator('h3')).toContainText('Abuse of PowerShell for Arbitrary Execution');
 await expect(detail.locator('a.resource-link')).toHaveAttribute('href',/detectionstrategies\/DET0455/);
 await expect(detail).not.toContainText('Guía de investigación para ASIR');
 await page.locator('#language').selectOption('es');
 await expect(detail).toContainText('Telemetría y comprobaciones');
});

test('AN: translated title and summary retain original log IDs and mutable field names',async({page})=>{
 const root=await enter(page);
 await root.locator('#mitrelocalSearch').fill('AN1252');
 await root.locator('[data-local-id="AN1252"]').click();
 const detail=root.locator('#mitrelocalDetail');
 await expect(detail.locator('h3')).toContainText('PowerShell con argumentos');
 await expect(detail).toContainText('Qué comprobar en la práctica');
 await expect(detail).toContainText('WinEventLog:PowerShell');
 await expect(detail).toContainText('EventCode=4103, 4104');
 await expect(detail.locator('.mitrelocal-params')).toContainText('ParentProcessName');
 await expect(detail.locator('.mitrelocal-params')).toContainText('MITRE (EN):');
 await page.locator('#language').selectOption('en');
 await expect(detail.locator('h3')).toContainText('AN1252');
 await expect(detail).toContainText('Detects behavioral chains where PowerShell');
 await expect(detail.locator('.mitrelocal-params')).toContainText('Analytic tuning parameters');
 await expect(detail).not.toContainText('Qué comprobar en la práctica');
});

test('DET to AN navigation, domain accounts and bilingual evidence interpretation',async({page})=>{
 const root=await enter(page);
 await root.locator('#mitrelocalSearch').fill('creación de cuentas de dominio');
 await expect(root.locator('[data-local-id="DET0003"]')).toHaveCount(1);
 await root.locator('[data-local-id="DET0003"]').click();
 const detail=root.locator('#mitrelocalDetail');
 await expect(detail).toContainText('4720');
 await expect(detail).toContainText('AN0006');
 await detail.locator('[data-local-link="AN0006"]').click();
 await expect(detail.locator('h3')).toContainText('Alta de usuario de dominio');
 await expect(detail).toContainText('EventCode=4720');
 await page.locator('#language').selectOption('en');
 await expect(detail.locator('h3')).toContainText('AN0006');
 await expect(detail).toContainText('Adversary uses built-in tools');
});

test('DET/AN untranslated entries retain English originals and do not claim review',async({page})=>{
 const root=await enter(page);
 await expect(root.locator('#mitrelocalTranslationStats')).toContainText('DET 51/933');
 await expect(root.locator('#mitrelocalTranslationStats')).toContainText('AN 140/2283');
 await root.locator('#mitrelocalType').selectOption('detections');
 await root.locator('#mitrelocalSearch').fill('DET0041');
 await root.locator('[data-local-id="DET0041"]').click();
 const detail=root.locator('#mitrelocalDetail');
 await expect(detail.locator('h3')).toContainText('Detection of Lifecycle Policy Modifications');
 await expect(detail).toContainText('Original en inglés');
 await expect(detail).not.toContainText('Guía de investigación para ASIR');
 await root.locator('#mitrelocalSearch').fill('DET0463');
 await root.locator('[data-local-id="DET0463"]').click();
 await expect(detail).toContainText('Español provisional');
 await expect(detail).not.toContainText('Traducción revisada');
});


test('all analytics linked to the 18 prioritized DET strategies and four additional strategies have Spanish drafts',async({page})=>{
 await page.goto('/');
 const details=await page.evaluate(async()=>{
  const ids=['DET0003','DET0008','DET0021','DET0034','DET0054','DET0072','DET0104','DET0107','DET0160','DET0183','DET0234','DET0236','DET0259','DET0327','DET0440','DET0451','DET0455','DET0463','DET0070','DET0126','DET0210','DET0460'];
  const names=['00','01','02','03','04','05','07'];
  const docs=(await Promise.all(names.map(async n=>await (await fetch('data/mitre/v20/detections-'+n+'.json')).json()))).flat();
  const byId=new Map(docs.map(d=>[d.id,d]));
  const api=window.AttackDetectionSpanishV20;
  return ids.map(id=>({id,count:byId.get(id)?.analytics?.length??-1,
    pending:(byId.get(id)?.analytics||[]).map(x=>x.id).filter(a=>!api.analytic(a))}));
 });
 expect(details).toHaveLength(22);
 for(const item of details){
  expect(item.count,item.id+' missing').toBeGreaterThan(0);
  expect(item.pending,item.id+' analytics pending').toEqual([]);
 }
});

test('AN to DC and back navigation preserves IDs, logs and original fields',async({page})=>{
 const root=await enter(page);
 await root.locator('#mitrelocalSearch').fill('AN1275');
 await root.locator('[data-local-id="AN1275"]').click();
 const detail=root.locator('#mitrelocalDetail');
 await expect(detail.locator('[data-local-link="DC0002"]')).toHaveCount(1);
 await detail.locator('[data-local-link="DC0002"]').click();
 await expect(detail.locator('h3')).toContainText('Autenticación de cuentas');
 await expect(detail.locator('.mitrelocal-telemetry-education')).toContainText('Dónde comprobarla');
 await expect(detail).toContainText('Analíticas relacionadas con el componente');
 await detail.locator('[data-local-link="AN1275"]').click();
 await expect(detail.locator('h3')).toContainText('Fallos y éxito de autenticación');
 await expect(detail).toContainText('WinEventLog:Security');
 await expect(detail).toContainText('EventCode=4776, 4625');
 await page.locator('#language').selectOption('en');
 await expect(detail.locator('h3')).toContainText('AN1275');
 await expect(detail.locator('[data-local-link="DC0002"]')).toHaveCount(1);
 await detail.locator('[data-local-link="DC0002"]').click();
 await expect(detail.locator('h3')).toContainText('User Account Authentication');
 await expect(detail).not.toContainText('Cómo investigar esta telemetría');
});

test('credential stuffing draft and AN bilingual search do not claim exposed passwords were proved',async({page})=>{
 const root=await enter(page);
 await root.locator('#mitrelocalSearch').fill('credenciales reutilizadas');
 await expect(root.locator('[data-local-id="DET0460"]')).toHaveCount(1);
 await root.locator('[data-local-id="DET0460"]').click();
 const detail=root.locator('#mitrelocalDetail');
 await expect(detail.locator('h3')).toContainText('credenciales reutilizadas');
 await expect(detail).toContainText('9 / 9 analíticas');
 await expect(detail).toContainText('no puede verificarse');
 await detail.locator('[data-local-link="AN1268"]').click();
 await expect(detail.locator('h3')).toContainText('contenedores');
 await expect(detail).toContainText('kubernetes:apiserver');
 await expect(detail.locator('.mitrelocal-params')).toContainText('CredentialSetSize');
 await page.locator('#language').selectOption('en');
 await expect(detail.locator('h3')).toContainText('AN1268');
 await expect(detail).toContainText('Credential stuffing attempts against Kubernetes API');
 await expect(detail).not.toContainText('Qué comprobar en la práctica');
});

test('AN and DC guides are drafts in Spanish and preserve originals after language switch',async({page})=>{
 const root=await enter(page);
 await root.locator('#mitrelocalSearch').fill('AN0350');
 await root.locator('[data-local-id="AN0350"]').click();
 const detail=root.locator('#mitrelocalDetail');
 await expect(detail.locator('h3')).toContainText('Inserción de claves SSH');
 await expect(detail).toContainText('authorized_keys');
 await expect(detail).toContainText('Español provisional');
 await page.locator('#language').selectOption('en');
 await expect(detail.locator('h3')).toContainText('AN0350');
 await expect(detail).toContainText('Adversary attempts to gain persistence');
 await expect(detail).not.toContainText('Orientación defensiva educativa');
 await page.locator('#language').selectOption('es');
 await expect(detail).toContainText('Qué comprobar en la práctica');
});
