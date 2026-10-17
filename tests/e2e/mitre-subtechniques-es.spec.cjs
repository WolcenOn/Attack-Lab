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

test('224 technique summaries and checks reference unique real MITRE v20 IDs',async({page})=>{
 await page.goto('/');
 const result=await page.evaluate(async()=>{
  const api=window.AttackSubtechniqueSpanishV20;
  const manifest=await (await fetch('data/mitre/v20/manifest.json')).json();
  const all=(await Promise.all(manifest.categories.techniques.shards.map(async shard=>
   (await (await fetch('data/mitre/v20/'+shard)).json())))).flat();
  const selected=all.filter(r=>!!api.entry(r.id));
  const orphan=selected.filter(r=>!r.description_en||r.description_es||r.summary_es).map(r=>r.id);
  const malformed=selected.filter(r=>!r.id.includes('.')||api.entry(r.id).status!=='draft_needs_review'||
   !api.title(r.id)||!api.summary(r.id)||!api.verify(r.id)).map(r=>r.id);
  return {coverage:api.coverage,source:api.source,
   total:all.length,selected:selected.length,orphan,malformed,
   outside:api.entry('T9999.999'),noParent:api.entry('T1003')};
 });
 expect(result.coverage).toEqual({subtechniques:224});
 expect(result.source).toBe('draft_needs_review');
 expect(result.total).toBe(935);
 expect(result.selected).toBe(224);
 expect(result.orphan).toEqual([]);
 expect(result.malformed).toEqual([]);
 expect(result.outside).toBeNull();
 expect(result.noParent).toBeNull();
});

test('T1003.006 DCSync: Spanish verification is searchable, original English stays readable',async({page})=>{
 const root=await enter(page);
 await root.locator('#mitrelocalType').selectOption('techniques');
 await root.locator('#mitrelocalSearch').fill('solicitudes de replicación');
 await expect(root.locator('[data-local-id="T1003.006"]')).toHaveCount(1);
 await root.locator('[data-local-id="T1003.006"]').click();
 const detail=root.locator('#mitrelocalDetail');
 await expect(detail.locator('h3')).toContainText('DCSync');
 await expect(detail).toContainText('interfaces de replicación de Active Directory');
 await expect(detail).toContainText('Comprobación defensiva sugerida');
 await expect(detail).toContainText('Acceso a credenciales');
 await expect(detail).toContainText('Español provisional');
 const original=detail.locator('details.mitrelocal-source-collapsed');
 await expect(original).toHaveJSProperty('open',false);
 await original.locator('summary').click();
 await expect(original).toHaveJSProperty('open',true);
 await expect(original).toContainText('simulate the replication process');
 await page.locator('#language').selectOption('en');
 await expect(detail.locator('h3')).toHaveText('OS Credential Dumping: DCSync');
 await expect(detail).toContainText('simulate the replication process');
 await expect(detail).toContainText('Credential Access');
 await expect(detail).not.toContainText('Comprobación defensiva sugerida');
 await page.locator('#language').selectOption('es');
 await expect(detail.locator('h3')).toContainText('DCSync');
 await expect(detail.locator('details.mitrelocal-source-collapsed')).toHaveJSProperty('open',false);
});

test('T1059.001: PowerShell explanations and audit hints respect language switch',async({page})=>{
 const root=await enter(page);
 await expect(root.locator('#mitrelocalTranslationStats')).toContainText('T 224/935');
 await root.locator('#mitrelocalType').selectOption('techniques');
 await root.locator('#mitrelocalSearch').fill('T1059.001');
 await root.locator('[data-local-id="T1059.001"]').click();
 const detail=root.locator('#mitrelocalDetail');
 await expect(detail.locator('h3')).toHaveText('Intérprete de comandos: PowerShell');
 await expect(detail).toContainText('4103/4104');
 await expect(detail).toContainText('Ejecución');
 await expect(detail).toContainText('scripts');
 await expect(detail.locator('details.mitrelocal-source-collapsed')).toHaveCount(1);
 await page.locator('#language').selectOption('en');
 await expect(detail.locator('h3')).toHaveText('Command and Scripting Interpreter: PowerShell');
 await expect(detail).toContainText('Adversaries may abuse PowerShell commands');
 await expect(detail).not.toContainText('4103/4104');
});

test('credential spraying, stuffing and Kerberoasting are distinct ES records',async({page})=>{
 const root=await enter(page);
 await root.locator('#mitrelocalType').selectOption('techniques');
 const check=async(id,expected)=>{
  await root.locator('#mitrelocalSearch').fill(id);
  await root.locator('[data-local-id="'+id+'"]').click();
  await expect(root.locator('#mitrelocalDetail')).toContainText(expected);
 };
 await check('T1110.003','muchas cuentas');
 await check('T1110.004','filtraciones anteriores');
 await check('T1558.003','tickets de servicio Kerberos');
 await check('T1550.004','cookie de sesión web');
});

test('phishing, remote SSH and alternate services have ES summaries while other originals remain available',async({page})=>{
 const root=await enter(page);
 await root.locator('#mitrelocalType').selectOption('techniques');
 await root.locator('#mitrelocalSearch').fill('llamada de voz dirigida');
 await root.locator('[data-local-id="T1566.004"]').click();
 const detail=root.locator('#mitrelocalDetail');
 await expect(detail.locator('h3')).toHaveText('Phishing: llamada de voz dirigida');
 await expect(detail).toContainText('registros de soporte');
 await root.locator('#mitrelocalSearch').fill('T1021.004');
 await root.locator('[data-local-id="T1021.004"]').click();
 await expect(detail.locator('h3')).toHaveText('Servicios remotos: SSH');
 await expect(detail).toContainText('registros de sshd');
 await root.locator('#mitrelocalSearch').fill('T1001');
 await root.locator('[data-local-id="T1001"]').click();
 await expect(detail).toContainText('MITRE');
 await expect(detail.locator('h3')).toContainText('Ofuscación de datos');
});
