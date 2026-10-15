const {test,expect}=require('@playwright/test');
function fixture(){
 const objects=Array.from({length:105},(_,n)=>({
  id:'attack-pattern--fixture-'+n,type:'attack-pattern',name:'Synthetic Test '+n,
  description:'Synthetic source text only.',
  external_references:[{source_name:'mitre-attack',external_id:'T'+(1800+n)}],
  kill_chain_phases:[{kill_chain_name:'mitre-attack',phase_name:'execution'}],
  x_mitre_is_subtechnique:false
 }));
 objects.push({id:'attack-pattern--fixture-sub',type:'attack-pattern',name:'Synthetic sub-technique',description:'Synthetic sub description.',
  external_references:[{source_name:'mitre-attack',external_id:'T1800.001'}],
  kill_chain_phases:[{kill_chain_name:'mitre-attack',phase_name:'execution'}],x_mitre_is_subtechnique:true});
 objects.push({id:'attack-pattern--fixture-known',type:'attack-pattern',name:'Command and Scripting Interpreter',description:'Original English source text for the demonstration.',
  external_references:[{source_name:'mitre-attack',external_id:'T1059'}],
  kill_chain_phases:[{kill_chain_name:'mitre-attack',phase_name:'execution'}]});
 return {type:'bundle',objects};
}
async function toCatalog(page){
 const welcome=page.locator('.welcome-overlay:not([hidden])');
 if(await welcome.isVisible())await welcome.locator('[data-welcome="skip"]').click();
 const nav=page.locator('#sidebar [data-view="explain"]');
 await nav.locator('xpath=ancestor::details').evaluate(el=>{el.open=true});
 if(await page.locator('#menuButton').isVisible())await page.locator('#menuButton').click();
 await nav.click();
 await expect(page.locator('#explainView')).toBeVisible();
 await page.locator('#explainView [data-exp-mode="catalog"]').click();
}
test('MITRE Enterprise loads automatically, caches and supports offline reload',async({page})=>{
 let requests=0;
 await page.route('**/enterprise-attack.json',r=>{requests++;return r.fulfill({status:200,contentType:'application/json',body:JSON.stringify(fixture())})});
 await page.goto('/');
 await expect(page.locator('#sourceChip')).toHaveClass(/loaded/,{timeout:15000});
 expect(requests).toBe(1);
 await toCatalog(page);
 const root=page.locator('#explainView');
 await root.locator('#expCatalogSearch').fill('T1800.001');
 await expect(root.locator('.explained-full-detail')).toContainText('Synthetic sub-technique');
 await expect(root.locator('.exp-official-desc')).toContainText('Synthetic sub description.');
 await expect.poll(async()=>page.evaluate(async()=>{
  return await new Promise(resolve=>{
   const req=indexedDB.open('attacklab-mitre-cache',1);
   req.onsuccess=()=>{
    const db=req.result;
    const get=db.transaction('bundles','readonly').objectStore('bundles').get('enterprise');
    get.onsuccess=()=>{resolve(!!get.result?.savedAt);db.close()};
    get.onerror=()=>resolve(false);
   };req.onerror=()=>resolve(false);
  });
 })).toBe(true);
 await page.route('**/enterprise-attack.json',r=>r.abort('failed'));
 await page.reload();
 await expect(page.locator('#sourceChip')).toHaveClass(/loaded/);
 expect(requests).toBe(1);
 await toCatalog(page);
 await page.locator('#explainView #expCatalogSearch').fill('T1800.001');
 await expect(page.locator('#explainView .explained-full-detail')).toContainText('Synthetic sub-technique');
});
test('Spanish study summary changes to English original name and text',async({page})=>{
 const errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 await page.route('**/enterprise-attack.json',r=>r.fulfill({status:200,contentType:'application/json',body:JSON.stringify(fixture())}));
 await page.goto('/');
 await expect(page.locator('#sourceChip')).toHaveClass(/loaded/);
 await toCatalog(page);
 const root=page.locator('#explainView');
 await root.locator('#expCatalogSearch').fill('T1059');
 await expect(root.locator('.explained-full-detail')).toContainText('Uso de intérpretes para ejecutar instrucciones.');
 await expect(root.locator('[data-exp-id]')).toContainText('Intérpretes de comandos y scripts');
 await page.locator('#language').selectOption('en');
 await expect(root.locator('[data-exp-id]')).toContainText('Command and Scripting Interpreter');
 await expect(root.locator('[data-exp-id]')).not.toContainText('Intérpretes de comandos');
 await expect(root.locator('.exp-official-desc')).toContainText('Original English source text');
 expect(errors).toEqual([]);
});
