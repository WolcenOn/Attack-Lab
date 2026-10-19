const {test,expect}=require('@playwright/test');
const ids=['S0551','S0552','S0553','S0554','S0555','S0556','S0558','S0559','S0560','S0561','S0562','S0564','S0565','S0567','S0568','S0569','S0570','S0572','S0574','S0575','S0576','S0577','S0578','S0579','S0581','S0582','S0583','S0584','S0585','S0586','S0587','S0588','S0589','S0590','S0591','S0592','S0593','S0594','S0595','S0596','S0597','S0598','S0599','S0600','S0601','S0602','S0603','S0604','S0605','S0606','S0607','S0608','S0609','S0610','S0611','S0612','S0613','S0614','S0615','S0616'];
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
test('batch 9 audits 60 original entries, full ES source references and 600/974 coverage',async({page})=>{
 await page.goto('/');
 const audit=await page.evaluate(async chosen=>{
  const src=await(await fetch('data/mitre/v20/software-01.json')).json();
  const s=window.AttackSoftwareFullSpanishV20,all=window.AttackFullSpanishV20;
  const refs=t=>(t.match(/\[\d+\]/g)||[]).sort().join('|');
  const selected=src.filter(x=>chosen.includes(x.id));
  const bad=selected.filter(x=>{
   const tr=all.entry(x.id);
   return !x.description_en||!tr||tr.status!=='draft_needs_review'||tr.scope!=='full_description'||
    tr.description===x.description_en||tr.description.length<20||
    refs(tr.description)!==refs(x.description_en);
  }).map(x=>x.id);
  return {source:src.length,selected:selected.length,uniqueNew:new Set(chosen).size,
   total:s.ids.length,unique:new Set(s.ids).size,bad,
   next:all.entry('S0617'),software:s.coverage,global:all.coverage};
 },ids);
 expect(audit).toEqual({source:307,selected:60,uniqueNew:60,total:600,unique:600,bad:[],
  next:null,software:{software:600,totalSoftware:974},
  global:{datasources:42,assets:18,tactics:39,mitigations:109,campaigns:61,software:600,fullDescriptions:869}});
});
test('S0603 Stuxnet preserves ICS historical sequence, references and reversible English',async({page})=>{
 const root=await enter(page);
 await expect(root.locator('#mitrelocalTranslationStats')).toContainText('S 600/974');
 await root.locator('#mitrelocalSearch').fill('vulnerabilidades de día cero');
 await expect(root.locator('[data-local-id="S0603"]')).toHaveCount(1);
 await root.locator('[data-local-id="S0603"]').click();
 const detail=root.locator('#mitrelocalDetail');
 for(const t of ['sistemas de control industrial','numerosas vulnerabilidades de día cero','rootkit','2010','noviembre de 2008','[1] [2] [3] [4]'])await expect(detail).toContainText(t);
 const en=detail.locator('details.mitrelocal-source-collapsed');
 await en.locator('summary').click();
 await expect(en).toContainText('Stuxnet was the first publicly reported malware');
 await page.locator('#language').selectOption('en');
 await expect(detail).toContainText('industrial control systems devices');
 await page.locator('#language').selectOption('es');
 await expect(detail).toContainText('sistemas de control industrial');
});
test('S0578 SUPERNOVA remains unrelated to SolarWinds APT29 operation; ICS Industroyer details survive',async({page})=>{
 const root=await enter(page),detail=root.locator('#mitrelocalDetail');
 await root.locator('#mitrelocalSearch').fill('S0578');
 await root.locator('[data-local-id="S0578"]').click();
 for(const t of ['no estaba relacionada','SPIRAL','podría haber sido utilizada','[1] [2] [3] [4] [5]'])await expect(detail).toContainText(t);
 await root.locator('#mitrelocalSearch').fill('S0604');
 await root.locator('[data-local-id="S0604"]').click();
 for(const t of ['subestaciones eléctricas','diciembre de 2016','red eléctrica','[1]','[2]','[3]'])await expect(detail).toContainText(t);
});
test('S0591 legitimate ConnectWise; S0609 deprecated English source; S0617 still pending',async({page})=>{
 const root=await enter(page),detail=root.locator('#mitrelocalDetail');
 await root.locator('#mitrelocalSearch').fill('S0591');
 await root.locator('[data-local-id="S0591"]').click();
 await expect(detail).toContainText('herramienta legítima de administración remota');
 await root.locator('#mitrelocalSearch').fill('S0609');
 await root.locator('[data-local-id="S0609"]').click();
 await expect(detail).toContainText('se declaró obsoleta');
 await expect(detail).toContainText('ATT&CK for ICS');
 await root.locator('#mitrelocalSearch').fill('S0617');
 await root.locator('[data-local-id="S0617"]').click();
 await expect(detail).not.toContainText('Descripción íntegra traducida');
});
