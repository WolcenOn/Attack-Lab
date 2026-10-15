const {test,expect}=require('@playwright/test');
async function enter(page){
 await page.goto('/');
 const welcome=page.locator('.welcome-overlay:not([hidden])');
 await expect(welcome).toBeVisible();
 await welcome.locator('[data-welcome="skip"]').click();
 const nav=page.locator('#sidebar [data-view="explain"]');
 await nav.locator('xpath=ancestor::details').evaluate(el=>{el.open=true});
 if(await page.locator('#menuButton').isVisible())await page.locator('#menuButton').click();
 await nav.click();
 await expect(page.locator('#explainView')).toBeVisible();
}
test('evidence library preserves original lessons and offers code search',async({page})=>{
 await enter(page);
 const root=page.locator('#explainView');
 await expect(root.getByText('Biblioteca de evidencias explicadas')).toBeVisible();
 await root.locator('[data-exp-mode="catalog"]').click();
 await expect(root.getByText('Busca cualquier técnica Txxxx')).toBeVisible();
 await root.locator('#expCatalogSearch').fill('T9999.999');
 await expect(root.getByText(/No está en la muestra offline/)).toBeVisible();
 await root.locator('[data-exp-mode="lessons"]').click();
 await expect(root.locator('[data-exp-topic]').first()).toBeVisible();
});
test('official enterprise bundle makes technique and sub-technique IDs searchable',async({page})=>{
 const items=Array.from({length:105},(_,n)=>({
  id:'attack-pattern--synthetic-'+n,
  type:'attack-pattern',
  name:'Fictitious test behavior '+n,
  description:'Synthetic fixture for Playwright. Not a real ATT&CK record.',
  external_references:[{source_name:'mitre-attack',external_id:'T'+(1800+n)}],
  kill_chain_phases:[{kill_chain_name:'mitre-attack',phase_name:'execution'}],
  x_mitre_is_subtechnique:false
 }));
 items.push({
  id:'attack-pattern--synthetic-child',type:'attack-pattern',
  name:'Synthetic sub-technique in fixture',
  description:'Fixture description, never published MITRE evidence.',
  external_references:[{source_name:'mitre-attack',external_id:'T1800.001'}],
  kill_chain_phases:[{kill_chain_name:'mitre-attack',phase_name:'execution'}],
  x_mitre_is_subtechnique:true
 });
 await page.route('**/enterprise-attack.json',r=>r.fulfill({status:200,contentType:'application/json',body:JSON.stringify({type:'bundle',objects:items})}));
 await enter(page);
 const root=page.locator('#explainView');
 await root.locator('[data-exp-mode="catalog"]').click();
 await root.locator('[data-exp-load]').click();
 await expect(root).toContainText('FUENTE OFICIAL');
 await expect(root).toContainText('106 disponibles');
 await root.locator('#expCatalogSearch').fill('T1800.001');
 await expect(root.locator('[data-exp-id]')).toHaveCount(1);
 await expect(root.locator('.explained-full-detail')).toContainText('T1800.001');
 await expect(root.locator('.explained-full-detail')).toContainText('T1800');
 await expect(root.locator('.exp-official-desc')).toContainText('Synthetic fixture');
 await root.locator('[data-exp-open]').click();
 await expect(page.locator('#detail')).toBeVisible();
});
test('full catalog is bilingual without presenting template as a verified translation',async({page})=>{
 await enter(page);
 const root=page.locator('#explainView');
 await root.locator('[data-exp-mode="catalog"]').click();
 await root.locator('#expCatalogSearch').fill('T1595');
 await expect(root.locator('.explained-full-detail')).toContainText('T1595');
 await expect(root.locator('.exp-quality-note')).toContainText('no traducción literal');
 await page.locator('#language').selectOption('en');
 await expect(root).toContainText('Search any Txxxx technique');
 await expect(root.locator('.exp-quality-note')).toContainText('not a literal MITRE translation');
});
