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
  const sampleDET=['DET0003','DET0008','DET0021','DET0034','DET0054','DET0072','DET0104','DET0107','DET0160','DET0183','DET0234','DET0236','DET0259','DET0327','DET0440','DET0451','DET0455','DET0463'];
  const sampleAN=['AN0006','AN0017','AN0061','AN0199','AN0287','AN0449','AN0516','AN0648','AN0655','AN0714','AN0931','AN1220','AN1245','AN1252','AN1275'];
  return {
   coverage:api.coverage,detCount:det.length,anCount:an.length,
   missing:sampleDET.filter(id=>!det.some(d=>d.id===id)||!api.strategy(id)),
   missingAN:sampleAN.filter(id=>!an.some(a=>a.id===id)||!api.analytic(id)),
   unrelated:api.strategy('DET0002'),unrelatedAN:api.analytic('AN2070'),
   status:api.analytic('AN1252').status
  };
 });
 expect(result.coverage).toEqual({detections:18,analytics:35});
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
 await expect(detail).toContainText('Descripción original en inglés');
 await page.locator('#language').selectOption('en');
 await expect(detail.locator('h3')).toContainText('Abuse of PowerShell for Arbitrary Execution');
 await expect(detail).toContainText('MITRE source text');
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
 await expect(detail.locator('h3')).toContainText('Analytic AN1252');
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
 await expect(detail.locator('h3')).toContainText('Analytic AN0006');
 await expect(detail).toContainText('Adversary uses built-in tools');
});

test('DET/AN untranslated entries retain English originals and do not claim review',async({page})=>{
 const root=await enter(page);
 await expect(root.locator('#mitrelocalTranslationStats')).toContainText('DET 18/933');
 await expect(root.locator('#mitrelocalTranslationStats')).toContainText('AN 35/2283');
 await root.locator('#mitrelocalType').selectOption('detections');
 await root.locator('#mitrelocalSearch').fill('DET0002');
 await root.locator('[data-local-id="DET0002"]').click();
 const detail=root.locator('#mitrelocalDetail');
 await expect(detail.locator('h3')).toContainText('Behavioral Detection of Publish/Subscribe');
 await expect(detail).toContainText('Original en inglés');
 await expect(detail).not.toContainText('Guía de investigación para ASIR');
 await root.locator('#mitrelocalSearch').fill('DET0463');
 await root.locator('[data-local-id="DET0463"]').click();
 await expect(detail).toContainText('Español provisional');
 await expect(detail).not.toContainText('Traducción revisada');
});
