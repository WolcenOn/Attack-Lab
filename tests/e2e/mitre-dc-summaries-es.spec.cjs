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

test('105 new DC summaries and 15 existing DC summaries cover 120 unique source records',async({page})=>{
 await page.goto('/');
 const result=await page.evaluate(async()=>{
  const api=window.AttackComponentSpanishV20;
  const manifest=await (await fetch('data/mitre/v20/manifest.json')).json();
  const records=(await Promise.all(manifest.categories.components.shards.map(async name=>
    (await (await fetch('data/mitre/v20/'+name)).json())
  ))).flat();
  const noSummary=records.filter(r=>!(r.summary_es||api.summary(r.id)));
  const overlaps=records.filter(r=>r.summary_es&&api.summary(r.id)).map(r=>r.id);
  const invalid=records.filter(r=>!r.name_en||!r.description_en||!r.id.startsWith('DC')).map(r=>r.id);
  return {api:api.coverage,source:api.status,count:records.length,
   fromSource:records.filter(r=>!!r.summary_es).length,
   newSummary:records.filter(r=>!!api.summary(r.id)).length,
   noSummary:noSummary.map(r=>r.id),overlaps,invalid,
   missingApi:api.summary('DC9999')};
 });
 expect(result.count).toBe(120);
 expect(result.api).toEqual({educationalSummaries:105});
 expect(result.fromSource).toBe(15);
 expect(result.newSummary).toBe(105);
 expect(result.noSummary).toEqual([]);
 expect(result.overlaps).toEqual([]);
 expect(result.invalid).toEqual([]);
 expect(result.missingApi).toBe('');
 expect(result.source).toBe('draft_needs_review');
});

test('Spanish DC summary is primary; original MITRE source remains expandable and original in EN',async({page})=>{
 const root=await enter(page);
 await expect(root.locator('#mitrelocalTranslationStats')).toContainText('DC con resumen español 120/120');
 await root.locator('#mitrelocalType').selectOption('components');
 await root.locator('#mitrelocalSearch').fill('DC0035');
 await root.locator('[data-local-id="DC0035"]').click();
 const detail=root.locator('#mitrelocalDetail');
 await expect(detail.locator('h3')).toHaveText('Acceso a procesos');
 await expect(detail).toContainText('Intentos de un proceso de abrir o acceder a otro');
 await expect(detail).toContainText('Español provisional');
 const original=detail.locator('.mitrelocal-source-original');
 await expect(original).toHaveCount(1);
 await expect(original).toHaveJSProperty('open',false);
 await original.locator('summary').click();
 await expect(original).toHaveJSProperty('open',true);
 await expect(original).toContainText('Refers to an event where one process attempts to open another process');
 await page.locator('#language').selectOption('en');
 await expect(detail.locator('h3')).toHaveText('Process Access');
 await expect(detail.locator('.mitrelocal-source-collapsed')).toHaveCount(0);
 await expect(detail).toContainText('Refers to an event where one process attempts to open another process');
 await expect(detail).not.toContainText('Intentos de un proceso de abrir o acceder a otro');
 await page.locator('#language').selectOption('es');
 await expect(detail.locator('h3')).toHaveText('Acceso a procesos');
 await expect(detail.locator('.mitrelocal-source-collapsed')).toHaveJSProperty('open',false);
});

test('search also recognizes words present only in the Spanish DC summary',async({page})=>{
 const root=await enter(page);
 await root.locator('#mitrelocalType').selectOption('components');
 await root.locator('#mitrelocalSearch').fill('comunicación entre procesos');
 await expect(root.locator('[data-local-id="DC0048"]')).toHaveCount(1);
 await root.locator('[data-local-id="DC0048"]').click();
 await expect(root.locator('#mitrelocalDetail')).toContainText('Metadatos de tuberías con nombre');
 await expect(root.locator('#mitrelocalDetail')).toContainText('comunicación entre procesos');
});

test('untranslated DET stays transparent about missing Spanish content',async({page})=>{
 const root=await enter(page);
 await root.locator('#mitrelocalType').selectOption('detections');
 await root.locator('#mitrelocalSearch').fill('DET0002');
 await root.locator('[data-local-id="DET0002"]').click();
 const detail=root.locator('#mitrelocalDetail');
 await expect(detail).toContainText('Original en inglés');
 await expect(detail.locator('.mitrelocal-source-collapsed')).toHaveCount(0);
});
