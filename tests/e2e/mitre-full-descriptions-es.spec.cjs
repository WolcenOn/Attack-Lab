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

test('60 full Spanish description drafts cover exactly every historical DS and ICS A source record',async({page})=>{
 await page.goto('/');
 const result=await page.evaluate(async()=>{
  const api=window.AttackFullSpanishV20;
  const [ds,a]=await Promise.all(['datasources','assets'].map(async type=>
   (await(await fetch('data/mitre/v20/'+type+'-00.json')).json())));
  const entries=[...ds,...a];
  const bad=entries.filter(x=>!x.description_en||
   !api.entry(x.id)||api.entry(x.id).status!=='draft_needs_review'||
   api.entry(x.id).scope!=='full_description'||
   api.description(x.id).length<30).map(x=>x.id);
  return {coverage:api.coverage,source:api.source,ds:ds.length,assets:a.length,
   unique:new Set(entries.map(x=>x.id)).size,bad,
   originalReferences:api.description('A0003').includes('IEC 61131 [1]'),
   unknown:api.entry('M9999'),oldEnglishRetained:entries.every(x=>x.description_en.length>30)};
 });
 expect(result.coverage).toEqual({datasources:42,assets:18,tactics:39,mitigations:109,campaigns:61,software:180,fullDescriptions:449});
 expect(result.source).toBe('draft_needs_review');
 expect(result.ds).toBe(42);
 expect(result.assets).toBe(18);
 expect(result.unique).toBe(60);
 expect(result.bad).toEqual([]);
 expect(result.originalReferences).toBe(true);
 expect(result.unknown).toBeNull();
 expect(result.oldEnglishRetained).toBe(true);
});

test('deprecated source DS0021: complete ES description corrects online persona meaning and retains EN',async({page})=>{
 const root=await enter(page);
 await expect(root.locator('#mitrelocalTranslationStats')).toContainText('Descripción íntegra ES DS 42/42 · A 18/18');
 await root.locator('#mitrelocalType').selectOption('datasources');
 await root.locator('#mitrelocalSearch').fill('DS0021');
 await root.locator('[data-local-id="DS0021"]').click();
 const detail=root.locator('#mitrelocalDetail');
 await expect(detail.locator('h3')).toHaveText('Perfil ficticio en línea');
 await expect(detail).toContainText('Descripción íntegra traducida');
 await expect(detail).toContainText('Descripción íntegra de MITRE traducida al español');
 await expect(detail).toContainText('Perfil malicioso en línea');
 await expect(detail).not.toContainText('Resumen educativo en español (no traducción literal)');
 const original=detail.locator('details.mitrelocal-source-collapsed');
 await expect(original).toHaveJSProperty('open',false);
 await original.locator('summary').click();
 await expect(original).toContainText('A malicious online profile representing a user');
 await page.locator('#language').selectOption('en');
 await expect(detail.locator('h3')).toHaveText('Persona');
 await expect(detail).toContainText('A malicious online profile representing a user');
 await expect(detail).not.toContainText('Perfil malicioso en línea');
 await page.locator('#language').selectOption('es');
 await expect(detail.locator('h3')).toHaveText('Perfil ficticio en línea');
});

test('asset A0006: long full translation is indexed and English source remains available',async({page})=>{
 const root=await enter(page);
 await root.locator('#mitrelocalType').selectOption('assets');
 await root.locator('#mitrelocalSearch').fill('transferir datos de forma segura entre las redes ICS');
 await expect(root.locator('[data-local-id="A0006"]')).toHaveCount(1);
 await root.locator('[data-local-id="A0006"]').click();
 const detail=root.locator('#mitrelocalDetail');
 await expect(detail).toContainText('historiadores de nivel inferior');
 await expect(detail).toContainText('Descripción íntegra de MITRE traducida al español');
 await expect(detail).not.toContainText('Resumen educativo en español (no traducción literal)');
 await expect(detail.locator('details.mitrelocal-source-collapsed')).toHaveJSProperty('open',false);
 await page.locator('#language').selectOption('en');
 await expect(detail.locator('h3')).toHaveText('Data Historian');
 await expect(detail).toContainText('Many data historian vendors have designed their software');
 await expect(detail).not.toContainText('historiadores de nivel inferior');
});

test('full description for process source and ICS gateway is not truncated to a short summary',async({page})=>{
 const root=await enter(page);
 const detail=root.locator('#mitrelocalDetail');
 await root.locator('#mitrelocalType').selectOption('datasources');
 await root.locator('#mitrelocalSearch').fill('DS0009');
 await root.locator('[data-local-id="DS0009"]').click();
 await expect(detail).toContainText('las regiones de memoria asignadas');
 await expect(detail).toContainText('estructuras de datos específicas de la aplicación');
 await root.locator('#mitrelocalType').selectOption('assets');
 await root.locator('#mitrelocalSearch').fill('A0009');
 await root.locator('[data-local-id="A0009"]').click();
 await expect(detail).toContainText('Traducción de protocolos:');
 await expect(detail).toContainText('Conversión de medios:');
 await expect(detail).toContainText('Agregación de datos:');
 await expect(detail).toContainText('Replicación de datos:');
 await expect(detail).not.toContainText('**');
});

test('newly covered M1033 is correctly labeled as full translation',async({page})=>{
 const root=await enter(page);
 await root.locator('#mitrelocalType').selectOption('mitigations');
 await root.locator('#mitrelocalSearch').fill('M1033');
 await root.locator('[data-local-id="M1033"]').click();
 const detail=root.locator('#mitrelocalDetail');
 await expect(detail).toContainText('Limit Software Installation');
 await expect(detail).toContainText('Descripción íntegra de MITRE traducida al español');
 await expect(detail).toContainText('Descripción íntegra traducida');
});

test('historical DS warning and MITRE source URL survive the new full-description workflow',async({page})=>{
 const root=await enter(page);
 await root.locator('#mitrelocalType').selectOption('datasources');
 await root.locator('#mitrelocalSearch').fill('DS0001');
 await root.locator('[data-local-id="DS0001"]').click();
 const detail=root.locator('#mitrelocalDetail');
 await expect(detail).toContainText('BIOS o UEFI/EFI');
 await expect(detail).toContainText('obsolet');
 await expect(detail.locator('a.resource-link')).toHaveAttribute('href',/DS0001/);
 await page.locator('#language').selectOption('en');
 await expect(detail).toContainText('Computer software that provides low-level control');
});
