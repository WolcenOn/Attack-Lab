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

test('TA source coverage is exactly 39/41; missing English TA0038 and TA0039 remain pending',async({page})=>{
 await page.goto('/');
 const found=await page.evaluate(async()=>{
  const source=await(await fetch('data/mitre/v20/tactics-00.json')).json();
  const ta=window.AttackTacticFullSpanishV20;
  const all=window.AttackFullSpanishV20;
  const sourceWithEnglish=source.filter(r=>r.description_en?.trim());
  const translated=source.filter(r=>ta.entry(r.id));
  const missing=source.filter(r=>!r.description_en?.trim()).map(r=>r.id);
  const invalid=sourceWithEnglish.filter(r=>{
   const entry=all.entry(r.id);
   return !entry||entry.scope!=='full_description'||entry.status!=='draft_needs_review'||
    !entry.description||entry.description.length<75||entry.description===r.description_en;
  }).map(r=>r.id);
  const unexpected=translated.filter(r=>!r.description_en?.trim()).map(r=>r.id);
  return {sourceCount:source.length,sourceEnglish:sourceWithEnglish.length,
   translatedCount:translated.length,unique:new Set(ta.ids).size,
   missing,invalid,unexpected,taCoverage:ta.coverage,globalCoverage:all.coverage,
   missingEntries:missing.map(id=>all.entry(id)),englishUnmodified:
   sourceWithEnglish.every(r=>r.description_en.startsWith(r.short_en))};
 });
 expect(found).toEqual({
  sourceCount:41,sourceEnglish:39,translatedCount:39,unique:39,
  missing:['TA0038','TA0039'],invalid:[],unexpected:[],
  taCoverage:{tactics:39,totalTactics:41,sourceDescriptions:39},
  globalCoverage:{datasources:42,assets:18,tactics:39,mitigations:90,fullDescriptions:189},
  missingEntries:[null,null],englishUnmodified:true
 });
});

test('ICS TA0107 displays full Spanish draft, original EN and returns to ES',async({page})=>{
 const root=await enter(page);
 await expect(root.locator('#mitrelocalTranslationStats')).toContainText('TA 39/41');
 await root.locator('#mitrelocalType').selectOption('tactics');
 await root.locator('#mitrelocalSearch').fill('TA0107');
 await root.locator('[data-local-id="TA0107"]').click();
 const detail=root.locator('#mitrelocalDetail');
 await expect(detail).toContainText('Descripción íntegra traducida');
 await expect(detail).toContainText('pérdidas de vidas');
 await expect(detail).toContainText('una denegación de servicio');
 await expect(detail).toContainText('pueden ser más intrusivas');
 await expect(detail).not.toContainText('Resumen educativo en español (no traducción literal)');
 const original=detail.locator('details.mitrelocal-source-collapsed');
 await expect(original).toHaveJSProperty('open',false);
 await original.locator('summary').click();
 await expect(original).toContainText('The adversary is trying to prevent your safety');
 await page.locator('#language').selectOption('en');
 await expect(detail.locator('h3')).toHaveText('Inhibit Response Function');
 await expect(detail).toContainText('Unlike Evasion');
 await expect(detail).not.toContainText('pérdidas de vidas');
 await page.locator('#language').selectOption('es');
 await expect(detail).toContainText('pérdidas de vidas');
});

test('long Mobile TA0037 translation is searchable by Spanish-only wording',async({page})=>{
 const root=await enter(page);
 await root.locator('#mitrelocalType').selectOption('tactics');
 await root.locator('#mitrelocalSearch').fill('detectar intrusiones a través de protocolos de mando y control');
 await expect(root.locator('[data-local-id="TA0037"]')).toHaveCount(1);
 await root.locator('[data-local-id="TA0037"]').click();
 const detail=root.locator('#mitrelocalDetail');
 await expect(detail).toContainText('sin conocimientos previos');
 await expect(detail).toContainText('servicio de mensajes cortos (SMS)');
 await expect(detail).toContainText('límites de datos');
 await page.locator('#language').selectOption('en');
 await expect(detail).toContainText('Short Message Service (SMS)');
 await expect(detail).not.toContainText('sin conocimientos previos');
});

test('Enterprise TA0042 retains resource examples and original MITRE URL',async({page})=>{
 const root=await enter(page);
 await root.locator('#mitrelocalType').selectOption('tactics');
 await root.locator('#mitrelocalSearch').fill('TA0042');
 await root.locator('[data-local-id="TA0042"]').click();
 const detail=root.locator('#mitrelocalDetail');
 await expect(detail).toContainText('dominios comprados');
 await expect(detail).toContainText('certificados de firma de código robados');
 await expect(detail.locator('a.resource-link')).toHaveAttribute('href',/tactics\/TA0042/);
 await expect(detail).toContainText('Descripción íntegra de MITRE traducida al español');
});

test('empty Mobile source TA0038 and TA0039 use educational summaries without full-translation claims',async({page})=>{
 const root=await enter(page);
 await root.locator('#mitrelocalType').selectOption('tactics');
 const detail=root.locator('#mitrelocalDetail');
 for(const id of ['TA0038','TA0039']){
  await root.locator('#mitrelocalSearch').fill(id);
  await root.locator('[data-local-id="'+id+'"]').click();
  await expect(detail).toContainText('Resumen educativo en español (no traducción literal)');
  await expect(detail).not.toContainText('Descripción íntegra de MITRE traducida al español');
  await expect(detail).not.toContainText('Descripción íntegra traducida');
  await page.locator('#language').selectOption('en');
  await expect(detail).not.toContainText('Resumen educativo en español');
  await page.locator('#language').selectOption('es');
 }
});

test('TA integration keeps DS/A full-description coverage and original English',async({page})=>{
 await page.goto('/');
 const v=await page.evaluate(()=>{
  const full=window.AttackFullSpanishV20;
  return {ds:full.entry('DS0021'),ics:full.entry('A0003'),
   tactics:full.entry('TA0112'),nonTactic:full.entry('M1033')};
 });
 expect(v.ds?.description).toContain('Perfil malicioso en línea');
 expect(v.ds?.scope).toBe('full_description');
 expect(v.ics?.description).toContain('IEC 61131 [1]');
 expect(v.tactics?.description).toContain('sistemas defensivos');
 expect(v.nonTactic).toBeNull();
});
