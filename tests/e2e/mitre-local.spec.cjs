const {test,expect}=require('@playwright/test');
async function enter(page){
 await page.goto('/');
 const welcome=page.locator('.welcome-overlay:not([hidden])');
 await expect(welcome).toBeVisible();
 await welcome.locator('[data-welcome="skip"]').click();
 const nav=page.locator('#sidebar .nav-link[data-view="mitrelocal"]');
 await nav.locator('xpath=ancestor::details').evaluate(x=>{x.open=true});
 if(await page.locator('#menuButton').isVisible())await page.locator('#menuButton').click();
 await nav.click();
 await expect(page.locator('#mitrelocalView')).toBeVisible();
 await expect(page.locator('#mitrelocalView #mitrelocalSearch')).toBeVisible({timeout:15000});
}
test('MITRE local directory: cross-domain T and S search and source links',async({page})=>{
 await enter(page);
 const root=page.locator('#mitrelocalView');
 await expect(root.locator('.lesson-badge')).toContainText('5');
 await root.locator('#mitrelocalSearch').fill('T1059.001');
 await expect(root.locator('[data-local-id="T1059.001"]')).toHaveCount(1);
 await root.locator('[data-local-id="T1059.001"]').click();
 await expect(root.locator('#mitrelocalDetail')).toContainText('T1059.001');
 await expect(root.locator('#mitrelocalDetail')).toContainText('MITRE');
 await root.locator('#mitrelocalSearch').fill('S0366');
 await root.locator('[data-local-id="S0366"]').click();
 await expect(root.locator('#mitrelocalDetail')).toContainText('S0366');
 await expect(root.locator('#mitrelocalDetail a.resource-link')).toHaveAttribute('href',/attack\.mitre\.org/);
});
test('MITRE local directory: detections, analytics and Spanish/English',async({page})=>{
 await enter(page);
 const root=page.locator('#mitrelocalView');
 await root.locator('#mitrelocalSearch').fill('DET0001');
 await root.locator('[data-local-id="DET0001"]').click();
 await expect(root.locator('#mitrelocalDetail')).toContainText('AN0001');
 await expect(root.locator('#mitrelocalDetail')).toContainText('Fuentes de registro propuestas');
 await root.locator('#mitrelocalSearch').fill('AN0001');
 await root.locator('[data-local-id="AN0001"]').click();
 await expect(root.locator('#mitrelocalDetail')).toContainText('AN0001');
 await page.locator('#language').selectOption('en');
 await expect(root).toContainText('Integrated MITRE library');
 await expect(root.locator('#mitrelocalDetail')).toContainText('Analytic under DET');
});
test('MITRE local directory: ICS assets and campaign references are local and traceable',async({page})=>{
 await enter(page);
 const root=page.locator('#mitrelocalView');
 await root.locator('#mitrelocalType').selectOption('assets');
 await root.locator('#mitrelocalDomain').selectOption('ics');
 await root.locator('#mitrelocalSearch').fill('A0001');
 await root.locator('[data-local-id="A0001"]').click();
 await expect(root.locator('#mitrelocalDetail')).toContainText('A0001');
 await root.locator('#mitrelocalType').selectOption('campaigns');
 await root.locator('#mitrelocalDomain').selectOption('all');
 await root.locator('#mitrelocalSearch').fill('C0001');
 await root.locator('[data-local-id="C0001"]').click();
 await expect(root.locator('#mitrelocalDetail')).toContainText('Frankenstein');
});

test('MITRE local catalog: current DC sources and bilingual descriptions',async({page})=>{
 await enter(page);
 const root=page.locator('#mitrelocalView');
 await root.locator('#mitrelocalType').selectOption('components');
 await expect(root.locator('#mitrelocalCount')).toContainText('120 coincidencias');
 await root.locator('#mitrelocalSearch').fill('DC0002');
 await root.locator('[data-local-id="DC0002"]').click();
 const detail=root.locator('#mitrelocalDetail');
 await expect(detail).toContainText('Autenticación de cuentas');
 await expect(detail.locator('.mitrelocal-log-sources')).toContainText('auditd:AUTH');
 await expect(detail).toContainText('Estrategias asociadas');
 await page.locator('#language').selectOption('en');
 await expect(detail).toContainText('User Account Authentication');
 await expect(detail.locator('.mitrelocal-log-sources')).toContainText('Documented log sources and channels');
 await root.locator('#mitrelocalSearch').fill('DC0119');
 await root.locator('[data-local-id="DC0119"]').click();
 await expect(detail).toContainText('Application Assets');
});
test('MITRE local catalog: deprecated DS references are marked in Spanish and English',async({page})=>{
 await enter(page);
 const root=page.locator('#mitrelocalView');
 await root.locator('#mitrelocalType').selectOption('datasources');
 await expect(root.locator('#mitrelocalCount')).toContainText('42 coincidencias');
 await root.locator('#mitrelocalSearch').fill('DS0001');
 await root.locator('[data-local-id="DS0001"]').click();
 const detail=root.locator('#mitrelocalDetail');
 await expect(detail.locator('.mitrelocal-deprecated')).toContainText('obsoleta');
 await expect(detail).toContainText('Firmware');
 await expect(detail.locator('a.resource-link')).toHaveAttribute('href',/datasources\/DS0001/);
 await page.locator('#language').selectOption('en');
 await expect(detail.locator('.mitrelocal-deprecated')).toContainText('deprecated');
 await detail.locator('[data-local-modern]').click();
 await expect(root.locator('#mitrelocalType')).toHaveValue('components');
});

test('MITRE local groups: aliases, T-G-T navigation and bilingual names',async({page})=>{
 await enter(page);
 const root=page.locator('#mitrelocalView');
 await root.locator('#mitrelocalType').selectOption('groups');
 await expect(root.locator('#mitrelocalCount')).toContainText('191 coincidencias');
 await root.locator('#mitrelocalSearch').fill('COLDRIVER');
 await expect(root.locator('[data-local-id="G1033"]')).toHaveCount(1);
 await root.locator('[data-local-id="G1033"]').click();
 const detail=root.locator('#mitrelocalDetail');
 await expect(detail).toContainText('Star Blizzard');
 await expect(detail).toContainText('Otros nombres documentados');
 await expect(detail.locator('a.resource-link')).toHaveAttribute('href',/groups\/G1033/);
 await detail.locator('[data-local-link="T1550.004"]').click();
 await expect(detail).toContainText('T1550.004');
 await expect(detail).toContainText('Grupos documentados en MITRE');
 await detail.locator('[data-local-link="G1033"]').click();
 await expect(detail).toContainText('Star Blizzard');
 await page.locator('#language').selectOption('en');
 await expect(detail).toContainText('Documented aliases');
 await expect(root.locator('#mitrelocalType')).toHaveValue('all');
});
test('MITRE local groups: correct manifest counts and preserved DS/DC catalogs',async({page})=>{
 await enter(page);
 const m=await page.evaluate(async()=>{const r=await fetch('data/mitre/v20/manifest.json');return r.json()});
 expect(m.categories.groups.count).toBe(191);
 expect(m.categories.components.count).toBe(120);
 expect(m.categories.datasources.count).toBe(42);
 expect(m.index_shards).toContain('index-05.json');
 expect(m.group_link_shard).toBe('group-links.json');
});

test('MITRE local: Spanish draft translations improve T/M names while preserving English',async({page})=>{
 await enter(page);
 const root=page.locator('#mitrelocalView');
 await root.locator('#mitrelocalSearch').fill('T1059');
 await root.locator('[data-local-id="T1059"]').click();
 await expect(root.locator('#mitrelocalDetail h3')).toContainText('Intérprete de comandos y scripts');
 await expect(root.locator('#mitrelocalDetail')).toContainText('Resumen educativo en español');
 await expect(root.locator('#mitrelocalDetail')).toContainText('Español provisional');
 await expect(root.locator('#mitrelocalDetail')).toContainText('Descripción original en inglés');
 await root.locator('#mitrelocalSearch').fill('Detención de servicios');
 await expect(root.locator('[data-local-id="T1489"]')).toHaveCount(1);
 await root.locator('#mitrelocalSearch').fill('M1030');
 await root.locator('[data-local-id="M1030"]').click();
 await expect(root.locator('#mitrelocalDetail h3')).toContainText('Segmentación de red');
 await page.locator('#language').selectOption('en');
 await expect(root.locator('#mitrelocalDetail h3')).toContainText('Network Segmentation');
});
test('MITRE local: translation coverage filter and sub-technique composition',async({page})=>{
 await enter(page);
 const root=page.locator('#mitrelocalView');
 await expect(root.locator('#mitrelocalTranslationStats')).toContainText('títulos en español');
 await root.locator('#mitrelocalType').selectOption('techniques');
 await root.locator('#mitrelocalTranslation').selectOption('es');
 await root.locator('#mitrelocalSearch').fill('T1003.001');
 await expect(root.locator('[data-local-id="T1003.001"]')).toHaveCount(1);
 await root.locator('[data-local-id="T1003.001"]').click();
 await expect(root.locator('#mitrelocalDetail h3')).toContainText('Memoria de LSASS');
 await page.locator('#language').selectOption('en');
 await expect(root.locator('#mitrelocalDetail h3')).toContainText('OS Credential Dumping: LSASS Memory');
 await root.locator('#mitrelocalTranslation').selectOption('pending');
 await root.locator('#mitrelocalSearch').fill('T1003.001');
 await expect(root.locator('[data-local-id="T1003.001"]')).toHaveCount(0);
});

test('MITRE v20: all archived T and M identifiers have Spanish draft titles',async({page})=>{
 await page.goto('/');
 const count=await page.evaluate(async()=>{
  const names=[...Array.from({length:6},(_,i)=>'techniques-'+String(i).padStart(2,'0')+'.json'),'mitigations-00.json'];
  const sets=await Promise.all(names.map(async file=>{
   const res=await fetch('data/mitre/v20/'+file);
   if(!res.ok)throw Error('Missing MITRE shard: '+file);
   return await res.json();
  }));
  const T=sets.slice(0,6).flat(),M=sets[6];
  const translate=window.AttackSpanishV20.translate;
  const untranslated=[...T.map(r=>({id:r.id,name:r.name_en,type:'techniques'})),...M.map(r=>({id:r.id,name:r.name_en,type:'mitigations'}))]
    .filter(r=>!translate(r.id,r.name,r.type)).map(r=>r.id);
  return {techniques:T.length,mitigations:M.length,untranslated};
 });
 expect(count.techniques).toBe(935);
 expect(count.mitigations).toBe(109);
 expect(count.untranslated).toEqual([]);
});
