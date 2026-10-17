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

test('72 further ATT&CK v20 sub-techniques expand the module to 224 verified entries',async({page})=>{
 await page.goto('/');
 const result=await page.evaluate(async()=>{
  const api=window.AttackSubtechniqueSpanishV20;
  const manifest=await (await fetch('data/mitre/v20/manifest.json')).json();
  const all=(await Promise.all(manifest.categories.techniques.shards.map(async shard=>
   (await (await fetch('data/mitre/v20/'+shard)).json())))).flat();
  const covered=all.filter(r=>!!api.entry(r.id));
  const bad=covered.filter(r=>!r.id.includes('.')||!r.description_en||!!r.description_es||
   !api.title(r.id)||!api.summary(r.id)||!api.verify(r.id)||
   api.entry(r.id).status!=='draft_needs_review').map(r=>r.id);
  return {moduleCoverage:api.coverage,total:all.length,covered:covered.length,
   unique:new Set(covered.map(x=>x.id)).size,bad,
   current:['T1027.006','T1055.012','T1548.003','T1574.009','T1564.008','T1204.004','T1071.004'].map(id=>!!api.entry(id)),
   previous:['T1003.006','T1036.007','T1546.003'].map(id=>!!api.entry(id)),
   absent:api.entry('T9999.999'),status:api.source};
 });
 expect(result.moduleCoverage).toEqual({subtechniques:224});
 expect(result.total).toBe(935);
 expect(result.covered).toBe(224);
 expect(result.unique).toBe(224);
 expect(result.bad).toEqual([]);
 expect(result.current).toEqual([true,true,true,true,true,true,true]);
 expect(result.previous).toEqual([true,true,true]);
 expect(result.absent).toBeNull();
 expect(result.status).toBe('draft_needs_review');
});

test('HTML smuggling: Spanish guidance, original English expandable, language switch',async({page})=>{
 const root=await enter(page);
 await expect(root.locator('#mitrelocalTranslationStats')).toContainText('T 224/935');
 await root.locator('#mitrelocalSearch').fill('objetos Blob');
 await expect(root.locator('[data-local-id="T1027.006"]')).toHaveCount(1);
 await root.locator('[data-local-id="T1027.006"]').click();
 const detail=root.locator('#mitrelocalDetail');
 await expect(detail.locator('h3')).toHaveText('Ofuscación de archivos: contrabando mediante HTML');
 await expect(detail).toContainText('funciones del navegador');
 await expect(detail).toContainText('Comprobación defensiva sugerida');
 const source=detail.locator('details.mitrelocal-source-collapsed');
 await expect(source).toHaveJSProperty('open',false);
 await source.locator('summary').click();
 await expect(source).toContainText('Adversaries may smuggle data and files');
 await page.locator('#language').selectOption('en');
 await expect(detail.locator('h3')).toHaveText('Obfuscated Files or Information: HTML Smuggling');
 await expect(detail.locator('details.mitrelocal-source-collapsed')).toHaveCount(0);
 await expect(detail).not.toContainText('Comprobación defensiva sugerida');
 await page.locator('#language').selectOption('es');
 await expect(detail.locator('h3')).toHaveText('Ofuscación de archivos: contrabando mediante HTML');
 await expect(detail.locator('details.mitrelocal-source-collapsed')).toHaveJSProperty('open',false);
});

test('process hollowing and DLL search order are distinct defensive lessons',async({page})=>{
 const root=await enter(page);
 const detail=root.locator('#mitrelocalDetail');
 await root.locator('#mitrelocalSearch').fill('T1055.012');
 await root.locator('[data-local-id="T1055.012"]').click();
 await expect(detail.locator('h3')).toHaveText('Inyección de procesos: vaciado de procesos');
 await expect(detail).toContainText('creación suspendida');
 await root.locator('#mitrelocalSearch').fill('T1574.009');
 await root.locator('[data-local-id="T1574.009"]').click();
 await expect(detail.locator('h3')).toHaveText('Secuestro del flujo de ejecución: ruta sin comillas');
 await expect(detail).toContainText('permisos de escritura');
});

test('hidden email rules and malicious copy-paste have separate ES explanations',async({page})=>{
 const root=await enter(page);
 const detail=root.locator('#mitrelocalDetail');
 await root.locator('#mitrelocalSearch').fill('reglas de bandeja');
 await root.locator('[data-local-id="T1564.008"]').click();
 await expect(detail.locator('h3')).toHaveText('Ocultación de artefactos: reglas de correo');
 await expect(detail).toContainText('privacidad y autorizaciones');
 await root.locator('#mitrelocalSearch').fill('T1204.004');
 await root.locator('[data-local-id="T1204.004"]').click();
 await expect(detail.locator('h3')).toHaveText('Ejecución por el usuario: copia y pegado malicioso');
 await expect(detail).toContainText('historial y procesos resultantes');
});

test('sudo and DNS C2 are in Spanish, with the original MITRE terminology in EN',async({page})=>{
 const root=await enter(page);
 const detail=root.locator('#mitrelocalDetail');
 await root.locator('#mitrelocalSearch').fill('T1548.003');
 await root.locator('[data-local-id="T1548.003"]').click();
 await expect(detail.locator('h3')).toHaveText('Elevación de privilegios: sudo y caché sudo');
 await expect(detail).toContainText('sudoers');
 await root.locator('#mitrelocalSearch').fill('T1071.004');
 await root.locator('[data-local-id="T1071.004"]').click();
 await expect(detail.locator('h3')).toHaveText('Protocolo de aplicación: DNS');
 await expect(detail).toContainText('patrones de subdominios');
 await page.locator('#language').selectOption('en');
 await expect(detail.locator('h3')).toHaveText('Application Layer Protocol: DNS');
 await expect(detail).not.toContainText('patrones de subdominios');
});
