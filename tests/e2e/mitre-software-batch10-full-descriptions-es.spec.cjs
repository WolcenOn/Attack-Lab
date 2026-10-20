const {test,expect}=require('@playwright/test');
const ids=["S0617","S0618","S0622","S0623","S0624","S0625","S0626","S0627","S0628","S0629","S0630","S0631","S0632","S0633","S0634","S0635","S0636","S0637","S0638","S0639","S0640","S0641","S0642","S0643","S0644","S0645","S0646","S0647","S0648","S0649","S0650","S0651","S0652","S0653","S0654","S0655","S0657","S0658","S0659","S0660","S0661","S0662","S0663","S0664","S0665","S0666","S0667","S0668","S0669","S0670","S0671","S0672","S0673","S0674","S0677","S0678","S0679","S0680","S0681","S0682"];
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
test('batch 10 covers 60 authentic IDs, exact reference sequences and 660/974',async({page})=>{
 await page.goto('/');
 const audit=await page.evaluate(async chosen=>{
  const source=await(await fetch('data/mitre/v20/software-01.json')).json();
  const s=window.AttackSoftwareFullSpanishV20,full=window.AttackFullSpanishV20;
  const refs=t=>(t.match(/\[\d+\]/g)||[]).join('|');
  const found=source.filter(x=>chosen.includes(x.id));
  const invalid=found.filter(x=>{
   const tr=full.entry(x.id);
   return !x.description_en||!tr||tr.status!=='draft_needs_review'||
    tr.scope!=='full_description'||tr.description===x.description_en||
    tr.description.length<25||refs(tr.description)!==refs(x.description_en);
  }).map(x=>x.id);
  return {source:source.length,found:found.length,newUnique:new Set(chosen).size,
   total:s.ids.length,unique:new Set(s.ids).size,invalid,pending:full.entry('S1178'),
   software:s.coverage,global:full.coverage};
 },ids);
 expect(audit).toEqual({source:307,found:60,newUnique:60,total:840,unique:840,
  invalid:[],pending:null,software:{software:840,totalSoftware:974},
  global:{datasources:42,assets:18,tactics:39,mitigations:109,campaigns:61,software:840,fullDescriptions:1109}});
});
test('Sliver is searchable in Spanish, preserves red-team context and reversible EN',async({page})=>{
 const root=await enter(page);
 await expect(root.locator('#mitrelocalTranslationStats')).toContainText('S 840/974');
 await root.locator('#mitrelocalSearch').fill('marco de mando y control');
 await expect(root.locator('[data-local-id="S0633"]')).toHaveCount(1);
 await root.locator('[data-local-id="S0633"]').click();
 const detail=root.locator('#mitrelocalDetail');
 await expect(detail).toContainText('código abierto y multiplataforma');
 await expect(detail).toContainText('«armory»');
 const english=detail.locator('details.mitrelocal-source-collapsed');
 await english.locator('summary').click();
 await expect(english).toContainText('Sliver is an open source');
 await page.locator('#language').selectOption('en');
 await expect(detail).toContainText('red team command and control');
 await page.locator('#language').selectOption('es');
 await expect(detail).toContainText('código abierto y multiplataforma');
});
test('Turian, GrimAgent, Tomiris and Lizar retain uncertainty qualifiers',async({page})=>{
 const root=await enter(page),detail=root.locator('#mitrelocalDetail');
 for(const [id,phrase] of [['S0647','probablemente esté relacionada'],['S0632','es probable'],['S0671','Los investigadores de seguridad consideran'],['S0681','Es probable']]){
  await root.locator('#mitrelocalSearch').fill(id);
  await root.locator('[data-local-id="'+id+'"]').click();
  await expect(detail).toContainText(phrase);
 }
});
test('Wevtutil and AADInternals remain utilities; S1178 is pending',async({page})=>{
 const root=await enter(page),detail=root.locator('#mitrelocalDetail');
 await root.locator('#mitrelocalSearch').fill('S0645');
 await root.locator('[data-local-id="S0645"]').click();
 await expect(detail).toContainText('permite a los administradores');
 await root.locator('#mitrelocalSearch').fill('S0677');
 await root.locator('[data-local-id="S0677"]').click();
 await expect(detail).toContainText('La herramienta está disponible públicamente en GitHub');
 await root.locator('#mitrelocalSearch').fill('S1178');
 await root.locator('[data-local-id="S1178"]').click();
 await expect(detail).not.toContainText('Descripción íntegra traducida');
});