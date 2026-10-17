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
 await root.locator('#mitrelocalType').selectOption('techniques');
 return root;
}

test('new 78 sub-techniques correspond to MITRE v20 records and preserve old 74 translations',async({page})=>{
 await page.goto('/');
 const result=await page.evaluate(async()=>{
  const api=window.AttackSubtechniqueSpanishV20;
  const manifest=await (await fetch('data/mitre/v20/manifest.json')).json();
  const all=(await Promise.all(manifest.categories.techniques.shards.map(async s=>
   (await (await fetch('data/mitre/v20/'+s)).json())))).flat();
  const selected=all.filter(x=>!!api.entry(x.id));
  const ids=selected.map(x=>x.id);
  const problematic=selected.filter(x=>!x.id.includes('.')||!!x.description_es||
   !x.description_en||!api.summary(x.id)||!api.verify(x.id)||
   api.entry(x.id).status!=='draft_needs_review').map(x=>x.id);
  return {count:api.coverage.subtechniques,source:api.source,selected:selected.length,
   malformed:problematic,unique:new Set(ids).size,
   examples:['T1003.006','T1036.007','T1218.011','T1546.003','T1553.005'].map(id=>!!api.entry(id))};
 });
 expect(result.count).toBe(224);
 expect(result.source).toBe('draft_needs_review');
 expect(result.selected).toBe(224);
 expect(result.unique).toBe(224);
 expect(result.malformed).toEqual([]);
 expect(result.examples).toEqual([true,true,true,true,true]);
});

test('masquerading: double extension can be searched by Spanish educational summary',async({page})=>{
 const root=await enter(page);
 await expect(root.locator('#mitrelocalTranslationStats')).toContainText('T 224/935');
 await root.locator('#mitrelocalSearch').fill('documento.txt.exe');
 await expect(root.locator('[data-local-id="T1036.007"]')).toHaveCount(1);
 await root.locator('[data-local-id="T1036.007"]').click();
 const detail=root.locator('#mitrelocalDetail');
 await expect(detail.locator('h3')).toHaveText('Suplantación: doble extensión de archivo');
 await expect(detail).toContainText('Muestra todas las extensiones');
 const source=detail.locator('details.mitrelocal-source-collapsed');
 await expect(source).toHaveJSProperty('open',false);
 await source.locator('summary').click();
 await expect(source).toContainText('double extension');
 await page.locator('#language').selectOption('en');
 await expect(detail.locator('h3')).toHaveText('Masquerading: Double File Extension');
 await expect(detail).not.toContainText('Muestra todas las extensiones');
 await page.locator('#language').selectOption('es');
 await expect(detail.locator('h3')).toHaveText('Suplantación: doble extensión de archivo');
});

test('LOLBins: Spanish description of rundll32 explains signed executable limitations',async({page})=>{
 const root=await enter(page);
 await root.locator('#mitrelocalSearch').fill('T1218.011');
 await root.locator('[data-local-id="T1218.011"]').click();
 const detail=root.locator('#mitrelocalDetail');
 await expect(detail.locator('h3')).toHaveText('Ejecución mediante binarios del sistema: Rundll32');
 await expect(detail).toContainText('bibliotecas DLL');
 await expect(detail).toContainText('proceso padre');
 await expect(detail).toContainText('Español provisional');
 await page.locator('#language').selectOption('en');
 await expect(detail.locator('h3')).toHaveText('System Binary Proxy Execution: Rundll32');
});

test('event persistence: WMI subscription has a specific Spanish defense checklist',async({page})=>{
 const root=await enter(page);
 await root.locator('#mitrelocalSearch').fill('consumidores de eventos');
 await expect(root.locator('[data-local-id="T1546.003"]')).toHaveCount(1);
 await root.locator('[data-local-id="T1546.003"]').click();
 const detail=root.locator('#mitrelocalDetail');
 await expect(detail.locator('h3')).toHaveText('Persistencia por eventos: suscripción de WMI');
 await expect(detail).toContainText('filtros y consumidores de eventos WMI');
 await expect(detail).toContainText('Comprobación defensiva sugerida');
 await expect(detail).toContainText('algunos agentes utilizan automatización WMI');
});

test('identity discovery and code trust remain different techniques in both languages',async({page})=>{
 const root=await enter(page);
 await root.locator('#mitrelocalSearch').fill('T1087.002');
 await root.locator('[data-local-id="T1087.002"]').click();
 const detail=root.locator('#mitrelocalDetail');
 await expect(detail.locator('h3')).toHaveText('Descubrimiento de cuentas: cuentas de dominio');
 await expect(detail).toContainText('Active Directory');
 await root.locator('#mitrelocalSearch').fill('T1553.005');
 await root.locator('[data-local-id="T1553.005"]').click();
 await expect(detail.locator('h3')).toHaveText('Alteración de controles de confianza: Mark-of-the-Web');
 await expect(detail).toContainText('Zone.Identifier');
 await page.locator('#language').selectOption('en');
 await expect(detail.locator('h3')).toHaveText('Subvert Trust Controls: Mark-of-the-Web Bypass');
});
