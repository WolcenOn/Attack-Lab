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
 await root.locator('#mitrelocalType').selectOption('mitigations');
 return root;
}

test('M full-description coverage covers all 109 ICS, Mobile and Enterprise descriptions',async({page})=>{
 await page.goto('/');
 const result=await page.evaluate(async()=>{
  const original=await(await fetch('data/mitre/v20/mitigations-00.json')).json();
  const m=window.AttackMitigationFullSpanishV20;
  const full=window.AttackFullSpanishV20;
  const translated=original.filter(r=>r.domain!=='enterprise'||m.entry(r.id));
  const pending=original.filter(r=>r.domain==='enterprise'&&!m.entry(r.id));
  const invalid=translated.filter(r=>{
   const entry=full.entry(r.id);
   return !r.description_en?.trim()||!entry||entry.status!=='draft_needs_review'||
    entry.scope!=='full_description'||entry.description.length<40||
    entry.description===r.description_en||
    (entry.description.match(/\[\d+\]/g)||[]).sort().join('|')!==(r.description_en.match(/\[\d+\]/g)||[]).sort().join('|');
  }).map(r=>r.id);
  return {total:original.length,translated:translated.length,ids:m.ids.length,
   unique:new Set(m.ids).size,byDomain:{
    ics:translated.filter(r=>r.domain==='ics').length,
    mobile:translated.filter(r=>r.domain==='mobile').length,
    enterprise:translated.filter(r=>r.domain==='enterprise').length,enterprisePending:pending.length},
   invalid,unexpectedPending:pending.filter(r=>full.entry(r.id)).map(r=>r.id),
   localCoverage:m.coverage,globalCoverage:full.coverage,
   sourceTextRetained:original.find(r=>r.id==='M0800').description_en.startsWith('The device or system should restrict') &&
    original.find(r=>r.id==='M1013').description_en.includes('Threat Modeling in the Design Phase')
  };
 });
 expect(result).toEqual({
  total:109,translated:109,ids:109,unique:109,
  byDomain:{ics:53,mobile:13,enterprise:43,enterprisePending:0},
  invalid:[],unexpectedPending:[],
  localCoverage:{mitigations:109,totalMitigations:109,ics:53,mobile:13,enterprise:43},
  globalCoverage:{datasources:42,assets:18,tactics:39,mitigations:109,campaigns:61,software:240,fullDescriptions:509},
  sourceTextRetained:true
 });
});

test('ICS M0930: complete network segmentation draft, English source, relationships and MITRE link',async({page})=>{
 const root=await enter(page);
 await expect(root.locator('#mitrelocalTranslationStats')).toContainText('M 109/109');
 await root.locator('#mitrelocalSearch').fill('M0930');
 await root.locator('[data-local-id="M0930"]').click();
 const detail=root.locator('#mitrelocalDetail');
 await expect(detail).toContainText('Descripción íntegra traducida');
 await expect(detail).toContainText('zona desmilitarizada (DMZ)');
 await expect(detail).toContainText('un conducto');
 await expect(detail).toContainText('IEC 62443');
 await expect(detail).toContainText('[1] [2]');
 await expect(detail).not.toContainText('Resumen educativo en español (no traducción literal)');
 await expect(detail.locator('a.resource-link')).toHaveAttribute('href',/mitigations\/M0930\//);
 await expect(detail).toContainText('Técnicas relacionadas');
 const original=detail.locator('details.mitrelocal-source-collapsed');
 await expect(original).toHaveJSProperty('open',false);
 await original.locator('summary').click();
 await expect(original).toContainText('Architect sections of the network to isolate critical systems');
 await page.locator('#language').selectOption('en');
 await expect(detail).toContainText('In addition, prevent systems from other networks');
 await expect(detail).not.toContainText('zona desmilitarizada (DMZ)');
 await page.locator('#language').selectOption('es');
 await expect(detail).toContainText('zona desmilitarizada (DMZ)');
});

test('ICS M0937 full text is searchable by a Spanish phrase absent from educational summaries',async({page})=>{
 const root=await enter(page);
 await root.locator('#mitrelocalSearch').fill('secuencias de comunicación aceptables');
 await expect(root.locator('[data-local-id="M0937"]')).toHaveCount(1);
 await root.locator('[data-local-id="M0937"]').click();
 const detail=root.locator('#mitrelocalDetail');
 await expect(detail).toContainText('capa 7 del modelo OSI');
 await expect(detail).toContainText('inspección profunda de paquetes (DPI)');
 await expect(detail).toContainText('protocolos específicos de automatización o SCADA');
});

test('Mobile M1013 preserves all five mitigation examples, implementation tools and original English',async({page})=>{
 const root=await enter(page);
 await root.locator('#mitrelocalSearch').fill('M1013');
 await root.locator('[data-local-id="M1013"]').click();
 const detail=root.locator('#mitrelocalDetail');
 for(const phrase of ['consultas parametrizadas','cross-site scripting (XSS)','banca móvil',
  'credenciales incrustadas','STRIDE','secuestro de sesiones','Burp Suite',
  'OWASP ZAP','Spring Security']){
  await expect(detail).toContainText(phrase);
 }
 await expect(detail).not.toContainText('Resumen educativo en español (no traducción literal)');
 await page.locator('#language').selectOption('en');
 await expect(detail).toContainText('Tools for Implementation');
 await expect(detail).toContainText('Static Code Analysis in the Build Pipeline');
 await expect(detail).not.toContainText('credenciales incrustadas');
 await page.locator('#language').selectOption('es');
 await expect(detail).toContainText('credenciales incrustadas');
});

test('Mobile M1009 retains dated future-language, official footnotes and technical names',async({page})=>{
 const root=await enter(page);
 await root.locator('#mitrelocalSearch').fill('M1009');
 await root.locator('[data-local-id="M1009"]').click();
 const detail=root.locator('#mitrelocalDetail');
 await expect(detail).toContainText('Apple tiene previsto exigir');
 await expect(detail).toContainText('App Transport Security [1]');
 await expect(detail).toContainText('Network Security Configuration');
 await expect(detail).toContainText('[2]');
 await expect(detail).toContainText('IPsec');
 await page.locator('#language').selectOption('en');
 await expect(detail).toContainText('Apple intends to mandate use');
});

test('Enterprise M1033 is now fully translated, while old DS/A/TA overlays remain available',async({page})=>{
 const root=await enter(page);
 await root.locator('#mitrelocalSearch').fill('M1033');
 await root.locator('[data-local-id="M1033"]').click();
 const detail=root.locator('#mitrelocalDetail');
 await expect(detail).toContainText('Limit Software Installation');
 await expect(detail).toContainText('Descripción íntegra de MITRE traducida al español');
 await expect(detail).toContainText('Descripción íntegra traducida');
 const all=await page.evaluate(()=>({
  ds:window.AttackFullSpanishV20.entry('DS0021')?.scope,
  a:window.AttackFullSpanishV20.entry('A0003')?.scope,
  ta:window.AttackFullSpanishV20.entry('TA0112')?.scope,
  m:window.AttackFullSpanishV20.entry('M0816')?.scope
 }));
 expect(all).toEqual({ds:'full_description',a:'full_description',ta:'full_description',m:'full_description'});
});
