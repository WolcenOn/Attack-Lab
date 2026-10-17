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

test('32 DET strategies and 57 AN annotations are real, related MITRE v20 records',async({page})=>{
 await page.goto('/');
 const result=await page.evaluate(async()=>{
  const api=window.AttackDetectionSpanishV20;
  const source=await(await fetch('data/mitre/v20/detections-00.json')).json();
  const det=source.filter(r=>api.strategy(r.id));
  const an=source.flatMap(d=>d.analytics.map(a=>({...a,parent:d.id}))).filter(a=>api.analytic(a.id));
  const mislinked=an.filter(a=>!api.strategy(a.parent)).map(a=>a.id);
  const invalidDet=det.filter(d=>api.strategy(d.id).status!=='draft_needs_review'||
   !api.strategy(d.id).signals||!api.strategy(d.id).telemetry||!api.strategy(d.id).limitations||!api.strategy(d.id).question).map(d=>d.id);
  const invalidAn=an.filter(a=>api.analytic(a.id).status!=='draft_needs_review'||
   !a.description_en||!api.analytic(a.id).summary||!api.analytic(a.id).verify).map(a=>a.id);
  return {coverage:api.coverage,localDet:det.length,localAn:an.length,
   uniqueDET:new Set(det.map(d=>d.id)).size,uniqueAN:new Set(an.map(a=>a.id)).size,
   mislinked,invalidDet,invalidAn,
   sourceDET:source.length,
   old:!!api.strategy('DET0455')&&!!api.analytic('AN1252')};
 });
 expect(result.coverage).toEqual({detections:51,analytics:140});
 expect(result.localDet).toBe(32);
 expect(result.localAn).toBe(57);
 expect(result.uniqueDET).toBe(32);
 expect(result.uniqueAN).toBe(57);
 expect(result.mislinked).toEqual([]);
 expect(result.invalidDet).toEqual([]);
 expect(result.invalidAn).toEqual([]);
 expect(result.sourceDET).toBe(62);
 expect(result.old).toBe(true);
});

test('metadata API DET0001: Spanish-only search, guide and EN fallback',async({page})=>{
 const root=await enter(page);
 await expect(root.locator('#mitrelocalTranslationStats')).toContainText('DET 51/933');
 await expect(root.locator('#mitrelocalTranslationStats')).toContainText('AN 140/2283');
 await root.locator('#mitrelocalType').selectOption('detections');
 await root.locator('#mitrelocalSearch').fill('servicios de metadatos de instancias IaaS');
 await expect(root.locator('[data-local-id="DET0001"]')).toHaveCount(1);
 await root.locator('[data-local-id="DET0001"]').click();
 const detail=root.locator('#mitrelocalDetail');
 await expect(detail.locator('h3')).toHaveText('Acceso sospechoso a metadatos de instancias cloud');
 await expect(detail).toContainText('169.254.169.254');
 await expect(detail).toContainText('Qué NO demuestra una señal aislada');
 await expect(detail).toContainText('Guía de investigación para ASIR');
 await expect(detail).toContainText('AN0001');
 await page.locator('#language').selectOption('en');
 await expect(detail.locator('h3')).toHaveText('Detect Access to Cloud Instance Metadata API (IaaS)');
 await expect(detail).not.toContainText('Guía de investigación para ASIR');
 await page.locator('#language').selectOption('es');
 await expect(detail.locator('h3')).toHaveText('Acceso sospechoso a metadatos de instancias cloud');
});

test('AN0002: process and MQTT evidence retains Sysmon sources and original English',async({page})=>{
 const root=await enter(page);
 await root.locator('#mitrelocalSearch').fill('AN0002');
 await root.locator('[data-local-id="AN0002"]').click();
 const detail=root.locator('#mitrelocalDetail');
 await expect(detail.locator('h3')).toHaveText('Mensajería pub/sub inesperada desde procesos Windows');
 await expect(detail).toContainText('Sysmon');
 await expect(detail).toContainText('Qué comprobar en la práctica');
 await expect(detail).toContainText('MQTT');
 await expect(detail.locator('.mitrelocal-params')).toContainText('UnusualProcessList');
 const source=detail.locator('details.mitrelocal-source-collapsed');
 await expect(source).toHaveJSProperty('open',false);
 await source.locator('summary').click();
 await expect(source).toContainText('non-standard processes');
 await page.locator('#language').selectOption('en');
 await expect(detail.locator('h3')).toContainText('AN0002');
 await expect(detail).toContainText('non-standard processes');
 await expect(detail).not.toContainText('Qué comprobar en la práctica');
});

test('DET0014 data staging links to AN0040 and retains forensic context',async({page})=>{
 const root=await enter(page);
 await root.locator('#mitrelocalSearch').fill('acopio de archivos previo');
 await expect(root.locator('[data-local-id="DET0014"]')).toHaveCount(1);
 await root.locator('[data-local-id="DET0014"]').click();
 const detail=root.locator('#mitrelocalDetail');
 await expect(detail.locator('h3')).toContainText('Acopio de archivos');
 await expect(detail).toContainText('respaldos');
 await expect(detail.locator('[data-local-link="AN0040"]')).toHaveCount(1);
 await detail.locator('[data-local-link="AN0040"]').click();
 await expect(detail.locator('h3')).toHaveText('Acopio y compresión de archivos sensibles en Windows');
 await expect(detail).toContainText('WinEventLog:Security');
 await expect(detail.locator('[data-local-link="DET0014"]')).toHaveCount(1);
});

test('DET0030 conditional access and AN0088 identity provider are distinct ES explanations',async({page})=>{
 const root=await enter(page);
 await root.locator('#mitrelocalType').selectOption('detections');
 await root.locator('#mitrelocalSearch').fill('DET0030');
 await root.locator('[data-local-id="DET0030"]').click();
 const detail=root.locator('#mitrelocalDetail');
 await expect(detail.locator('h3')).toHaveText('Cambios no autorizados en políticas de acceso condicional');
 await expect(detail).toContainText('MFA');
 await expect(detail.locator('[data-local-link="AN0088"]')).toHaveCount(1);
 await detail.locator('[data-local-link="AN0088"]').click();
 await expect(detail.locator('h3')).toHaveText('Acceso condicional o MFA debilitado en proveedor de identidad');
 await expect(detail).toContainText('Update conditionalAccessPolicy');
 await page.locator('#language').selectOption('en');
 await expect(detail.locator('h3')).toContainText('AN0088');
 await expect(detail).toContainText('conditional access');
});

test('untranslated DET still uses English original and is not presented as reviewed',async({page})=>{
 const root=await enter(page);
 await root.locator('#mitrelocalType').selectOption('detections');
 await root.locator('#mitrelocalSearch').fill('DET0041');
 await root.locator('[data-local-id="DET0041"]').click();
 const detail=root.locator('#mitrelocalDetail');
 await expect(detail.locator('h3')).toContainText('Detection of Lifecycle Policy Modifications');
 await expect(detail).toContainText('Original en inglés');
 await expect(detail).not.toContainText('Guía de investigación para ASIR');
 await expect(detail).not.toContainText('Traducción revisada');
});
