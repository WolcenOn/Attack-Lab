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

test('MITRE v20: all 120 DC, 42 historical DS and 18 ICS A have Spanish draft titles',async({page})=>{
 await page.goto('/');
 const result=await page.evaluate(async()=>{
  const api=window.AttackCatalogSpanishV20;
  const manifest=await (await fetch('data/mitre/v20/manifest.json')).json();
  const files={
   components:manifest.categories.components.shards,
   datasources:manifest.categories.datasources.shards,
   assets:manifest.categories.assets.shards
  };
  const missing={},counts={};
  for(const [type,shards] of Object.entries(files)){
   const records=(await Promise.all(shards.map(async s=>{
    const response=await fetch('data/mitre/v20/'+s);
    if(!response.ok)throw Error('missing '+s);
    return response.json();
   }))).flat();
   counts[type]=records.length;
   missing[type]=records.filter(r=>!(r.name_es||api.title(r.id,r.name_en,type))).map(r=>r.id);
  }
  return {counts,missing,coverage:api.coverage,source:api.source};
 });
 expect(result.counts).toEqual({components:120,datasources:42,assets:18});
 expect(result.coverage).toEqual({components:120,datasources:42,assets:18});
 expect(result.missing).toEqual({components:[],datasources:[],assets:[]});
 expect(result.source).toBe('draft_needs_review');
});

test('DC: Spanish title is searchable and original English is preserved',async({page})=>{
 const root=await enter(page);
 await root.locator('#mitrelocalType').selectOption('components');
 await root.locator('#mitrelocalSearch').fill('Creación de procesos');
 await root.locator('[data-local-id="DC0032"]').click();
 const detail=root.locator('#mitrelocalDetail');
 await expect(detail.locator('h3')).toContainText('Creación de procesos');
 await expect(detail).toContainText('Nombre original MITRE: Process Creation');
 await expect(detail).toContainText('Español provisional');
 await expect(detail).toContainText('Descripción original en inglés');
 await page.locator('#language').selectOption('en');
 await expect(detail.locator('h3')).toHaveText('Process Creation');
 await expect(detail).not.toContainText('Creación de procesos');
 await page.locator('#language').selectOption('es');
 await expect(detail.locator('h3')).toHaveText('Creación de procesos');
});

test('DS: historical source translations are summaries and still clearly deprecated',async({page})=>{
 const root=await enter(page);
 await root.locator('#mitrelocalType').selectOption('datasources');
 await root.locator('#mitrelocalSearch').fill('DS0029');
 await root.locator('[data-local-id="DS0029"]').click();
 const detail=root.locator('#mitrelocalDetail');
 await expect(detail.locator('h3')).toHaveText('Tráfico de red');
 await expect(detail).toContainText('Resumen educativo en español');
 await expect(detail).toContainText('Fuente histórica obsoleta');
 await expect(detail).toContainText('Network Traffic');
 await page.locator('#language').selectOption('en');
 await expect(detail.locator('h3')).toHaveText('Network Traffic');
 await expect(detail).not.toContainText('Resumen educativo en español');
 await expect(detail).toContainText('Deprecated historical source');
});

test('ICS A: educational summary and English source remain separately available',async({page})=>{
 const root=await enter(page);
 await root.locator('#mitrelocalType').selectOption('assets');
 await root.locator('#mitrelocalDomain').selectOption('ics');
 await root.locator('#mitrelocalSearch').fill('Controlador lógico programable');
 await root.locator('[data-local-id="A0003"]').click();
 const detail=root.locator('#mitrelocalDetail');
 await expect(detail.locator('h3')).toHaveText('Controlador lógico programable (PLC)');
 await expect(detail).toContainText('Resumen educativo en español');
 await expect(detail).toContainText('modos de operación');
 await expect(detail).toContainText('Programmable Logic Controller (PLC)');
 await page.locator('#language').selectOption('en');
 await expect(detail.locator('h3')).toHaveText('Programmable Logic Controller (PLC)');
 await expect(detail).not.toContainText('Resumen educativo en español');
});

test('translation filter includes newly localized titles without claiming reviewed quality',async({page})=>{
 const root=await enter(page);
 await expect(root.locator('#mitrelocalTranslationStats')).toContainText('DC 120/120');
 await expect(root.locator('#mitrelocalTranslationStats')).toContainText('DS 42/42');
 await expect(root.locator('#mitrelocalTranslationStats')).toContainText('A 18/18');
 await root.locator('#mitrelocalType').selectOption('assets');
 await root.locator('#mitrelocalTranslation').selectOption('es');
 await expect(root.locator('#mitrelocalCount')).toContainText('18 coincidencias');
 await root.locator('#mitrelocalSearch').fill('A0018');
 await root.locator('[data-local-id="A0018"]').click();
 const detail=root.locator('#mitrelocalDetail');
 await expect(detail.locator('h3')).toContainText('Controlador de automatización programable');
 await expect(detail).toContainText('pendiente de revisión');
 await expect(detail).not.toContainText('Traducción revisada');
});
