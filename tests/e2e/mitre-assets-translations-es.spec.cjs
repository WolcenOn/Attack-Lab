const {test,expect}=require('@playwright/test');

test('ICS asset overlay covers exactly 12 distinct v20 records without mutating originals',async({page})=>{
 await page.goto('/assets-es-v20.html');
 const data=await page.evaluate(async()=>{
  const rows=await (await fetch('data/mitre/v20/assets-00.json')).json();
  const api=window.AttackAssetDescriptionSpanishV20;
  const selected=rows.filter(r=>api.entry(r.id));
  return {total:rows.length,coverage:api.coverage.assets,ids:api.ids,
   selected:selected.map(r=>r.id),statuses:selected.map(r=>api.entry(r.id).status),
   kinds:selected.map(r=>api.entry(r.id).kind),
   allOriginals:rows.every(r=>r.description_en&&r.translation_status==='pending'&&!r.description_es),
   untranslated:api.entry('A0013'),noUnknown:api.entry('A9999')};
 });
 expect(data.total).toBe(18);
 expect(data.coverage).toBe(12);
 expect(data.ids).toHaveLength(12);
 expect(new Set(data.ids).size).toBe(12);
 expect(data.selected).toEqual(data.ids);
 expect(data.statuses.every(s=>s==='draft_needs_review')).toBe(true);
 expect(data.kinds.every(s=>s==='proposed_full_translation')).toBe(true);
 expect(data.allOriginals).toBe(true);
 expect(data.untranslated).toBeNull();
 expect(data.noUnknown).toBeNull();
});

test('ICS asset search, proposed full description, English original and ES/EN toggle',async({page})=>{
 await page.goto('/assets-es-v20.html');
 await expect(page.locator('#assetCoverage')).toContainText('12/18');
 await page.locator('#assetSearch').fill('historiadores');
 await expect(page.locator('[data-asset-id="A0006"]')).toHaveCount(1);
 await page.locator('[data-asset-id="A0006"]').click();
 const detail=page.locator('#assetDetail');
 await expect(detail).toContainText('Traducción propuesta de la descripción MITRE');
 await expect(detail.locator('[data-asset-translation]')).toContainText('red corporativa');
 await expect(detail).toContainText('Resumen educativo (no traducción literal)');
 const original=detail.locator('details[data-asset-original]');
 await expect(original).toHaveJSProperty('open',false);
 await original.locator('summary').click();
 await expect(original).toContainText('Data historians');
 await page.locator('#assetLanguage').selectOption('en');
 await expect(detail).toContainText('Data Historian');
 await expect(detail).toContainText('Data historians');
 await expect(detail.locator('[data-asset-translation]')).toHaveCount(0);
 await page.locator('#assetLanguage').selectOption('es');
 await expect(detail.locator('[data-asset-translation]')).toHaveCount(1);
});

test('untranslated ICS asset still displays the full English original',async({page})=>{
 await page.goto('/assets-es-v20.html');
 await expect(page.locator('#assetCoverage')).toContainText('12/18');
 await page.locator('#assetSearch').fill('A0013');
 await page.locator('[data-asset-id="A0013"]').click();
 const detail=page.locator('#assetDetail');
 await expect(detail).toContainText('Descripción sin traducir');
 await expect(detail).toContainText('Field I/O');
 await expect(detail.locator('[data-asset-translation]')).toHaveCount(0);
 await expect(detail).toContainText('Input data may include readings');
});
