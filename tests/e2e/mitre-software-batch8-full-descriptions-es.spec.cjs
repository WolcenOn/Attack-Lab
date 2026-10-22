const {test,expect}=require('@playwright/test');
const ids=['S0486','S0487','S0488','S0489','S0490','S0491','S0492','S0493','S0494','S0495','S0496','S0497','S0498','S0499','S0500','S0501','S0502','S0503','S0504','S0505','S0506','S0507','S0508','S0509','S0511','S0512','S0513','S0514','S0515','S0516','S0517','S0518','S0519','S0520','S0521','S0522','S0524','S0525','S0526','S0527','S0528','S0529','S0530','S0531','S0532','S0533','S0534','S0535','S0536','S0537','S0538','S0539','S0540','S0543','S0544','S0545','S0546','S0547','S0549','S0550'];
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
 await root.locator('#mitrelocalType').selectOption('software');
 return root;
}
test('S0486–S0550: 60 original source descriptions, no invented IDs or dropped reference markers',async({page})=>{
 await page.goto('/');
 const audit=await page.evaluate(async chosen=>{
  const src=await(await fetch('data/mitre/v20/software-01.json')).json();
  const s=window.AttackSoftwareFullSpanishV20,all=window.AttackFullSpanishV20;
  const refs=t=>(t.match(/\[\d+\]/g)||[]).sort().join('|');
  const batch=src.filter(x=>chosen.includes(x.id));
  const errors=batch.filter(x=>{
   const t=all.entry(x.id);
   return !x.description_en||!t||t.scope!=='full_description'||t.status!=='draft_needs_review'||
    t.description.length<20||t.description===x.description_en||refs(t.description)!==refs(x.description_en)||
    s.searchText(x.id)!==t.description;
  }).map(x=>x.id);
  return {source:src.length,batch:batch.length,chosen:chosen.length,uniqueNew:new Set(chosen).size,
   ids:s.ids.length,unique:new Set(s.ids).size,errors,coverage:s.coverage,global:all.coverage,
   next:all.entry('S9052')};
 },ids);
 expect(audit).toEqual({source:307,batch:60,chosen:60,uniqueNew:60,ids:960,unique:960,errors:[],
  coverage:{software:960,totalSoftware:974},
  global:{datasources:42,assets:18,tactics:39,mitigations:109,campaigns:61,software:960,fullDescriptions:1229},
  next:null});
});
test('ngrok is legitimate dual-use, searchable in Spanish with original EN available',async({page})=>{
 const root=await enter(page);
 await expect(root.locator('#mitrelocalTranslationStats')).toContainText('S 960/974');
 await root.locator('#mitrelocalSearch').fill('proxy inverso');
 await expect(root.locator('[data-local-id="S0508"]')).toHaveCount(1);
 await root.locator('[data-local-id="S0508"]').click();
 const detail=root.locator('#mitrelocalDetail');
 for(const t of ['Descripción íntegra traducida','herramienta legítima','túnel seguro','movimiento lateral','exfiltración de datos','[1] [2] [3] [4]'])await expect(detail).toContainText(t);
 const original=detail.locator('details.mitrelocal-source-collapsed');
 await original.locator('summary').click();
 await expect(original).toContainText('ngrok is a legitimate reverse proxy tool');
 await page.locator('#language').selectOption('en');
 await expect(detail).toContainText('legitimate reverse proxy');
 await page.locator('#language').selectOption('es');
 await expect(detail).toContainText('herramienta legítima');
});
test('REvil S0496, SLOTHFULMEDIA S0533 preserve uncertainty and repeated footnotes',async({page})=>{
 const root=await enter(page),detail=root.locator('#mitrelocalDetail');
 await root.locator('#mitrelocalSearch').fill('S0496');
 await root.locator('[data-local-id="S0496"]').click();
 for(const t of ['GOLD SOUTHFIELD','ransomware como servicio','GandCrab','[1] [2] [3]'])await expect(detail).toContainText(t);
 await root.locator('#mitrelocalSearch').fill('S0533');
 await root.locator('[data-local-id="S0533"]').click();
 for(const t of ['no identificado','IAmTheKing','PowerPool','[1] [2]','[3] [4]','[5]'])await expect(detail).toContainText(t);
 const count=await page.evaluate(()=>window.AttackFullSpanishV20.entry('S0533').description.match(/\[4\]/g)?.length);
 expect(count).toBe(2);
});
test('GoldenSpy, BloodHound and AdFind keep tool-specific claims; S9052 is pending',async({page})=>{
 const root=await enter(page),detail=root.locator('#mitrelocalDetail');
 for(const [id,terms] of [
  ['S0493',['Intelligent Tax','Aisino Credit Information','impuestos locales']],
  ['S0521',['BloodHound','Active Directory','rutas de ataque']],
  ['S0550',['DoubleAgent','2013','Gobierno chino']]
 ]){
  await root.locator('#mitrelocalSearch').fill(id);
  await root.locator('[data-local-id="'+id+'"]').click();
  for(const term of terms)await expect(detail).toContainText(term);
 }
 await root.locator('#mitrelocalSearch').fill('S9052');
 await root.locator('[data-local-id="S9052"]').click();
 await expect(detail).not.toContainText('Descripción íntegra traducida');
});
