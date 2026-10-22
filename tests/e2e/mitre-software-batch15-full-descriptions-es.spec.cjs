const {test,expect}=require('@playwright/test');
const ids2=["S1238","S1239","S1240","S1241","S1242","S1243","S1244","S1245","S1246","S1247","S1248","S1249","S9001","S9002","S9003","S9004","S9005","S9006","S9007","S9008","S9009","S9010","S9011","S9012","S9013","S9014","S9015","S9016","S9017","S9018","S9019","S9020","S9021","S9022","S9023","S9024","S9025","S9026","S9027","S9028","S9029","S9030","S9031","S9032"];
const ids3=["S9033","S9034","S9035","S9036","S9037","S9038","S9039","S9040","S9041","S9042","S9043","S9044","S9045","S9046","S9050","S9051"];
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
test('batch15 audits all 44+16 source entries, footnotes, duplication and 973/974 coverage',async({page})=>{
 await page.goto('/');
 const audit=await page.evaluate(async ({ids2,ids3})=>{
  const [two,three]=await Promise.all(['software-02.json','software-03.json'].map(async name=>await(await fetch('data/mitre/v20/'+name)).json()));
  const s=window.AttackSoftwareFullSpanishV20,full=window.AttackFullSpanishV20;
  const refs=t=>(t.match(/\[\d+\]/g)||[]).join('|');
  const found2=two.filter(x=>ids2.includes(x.id)),found3=three.filter(x=>ids3.includes(x.id));
  const invalid=[...found2,...found3].filter(x=>{
   const tr=full.entry(x.id);
   return !x.description_en||!tr||tr.status!=='draft_needs_review'||tr.scope!=='full_description'||
    tr.description===x.description_en||tr.description.length<25||refs(tr.description)!==refs(x.description_en);
  }).map(x=>x.id);
  return {shards:[two.length,three.length],sources:[found2.length,found3.length],
   newUnique:new Set([...ids2,...ids3]).size,total:s.ids.length,unique:new Set(s.ids).size,
   invalid,redlineRefs:refs(full.description('S1240')),
   originalRedlineRefs:refs(two.find(x=>x.id==='S1240').description_en),
   next:full.entry('S0209'),software:s.coverage,global:full.coverage};
 },{ids2,ids3});
 expect(audit).toEqual({shards:[279,29],sources:[44,16],newUnique:60,total:973,unique:973,
  invalid:[],redlineRefs:'[1]|[2]|[3]|[1]|[4]|[5]|[4]',
  originalRedlineRefs:'[1]|[2]|[3]|[1]|[4]|[5]|[4]',
  next:null,software:{software:973,totalSoftware:974},
  global:{datasources:42,assets:18,tactics:39,mitigations:109,campaigns:61,software:973,fullDescriptions:1242}});
});
test('TruffleHog remains a security tool and Spanish discovery with English source is reversible',async({page})=>{
 const root=await enter(page);
 await expect(root.locator('#mitrelocalTranslationStats')).toContainText('S 973/974');
 await root.locator('#mitrelocalSearch').fill('descubrir secretos');
 await expect(root.locator('[data-local-id="S9009"]')).toHaveCount(1);
 await root.locator('[data-local-id="S9009"]').click();
 const detail=root.locator('#mitrelocalDetail');
 await expect(detail).toContainText('herramienta de código abierto');
 await expect(detail).toContainText('claves de API');
 const english=detail.locator('details.mitrelocal-source-collapsed');
 await english.locator('summary').click();
 await expect(english).toContainText('secrets-discovery tool');
 await page.locator('#language').selectOption('en');
 await expect(detail).toContainText('search for credentials');
 await page.locator('#language').selectOption('es');
 await expect(detail).toContainText('descubrir secretos');
});
test('DCHSpy, VajraSpy, LazyWiper and NGate preserve assessments and legitimate-tool nuance',async({page})=>{
 const root=await enter(page),detail=root.locator('#mitrelocalDetail');
 for(const [id,phrases] of [
  ['S1243',['probablemente por MuddyWater','VPN']],
  ['S9006',['alta confianza a Patchwork','Pakistán']],
  ['S9039',['se cree que fue generado','WriteRandomBytes()']],
  ['S9040',['herramienta legítima llamada NFCGate','posiblemente con código generado por IA','PIN']]]){
  await root.locator('#mitrelocalSearch').fill(id);
  await root.locator('[data-local-id="'+id+'"]').click();
  for(const phrase of phrases)await expect(detail).toContainText(phrase);
 }
});
test('Diskpart preserves dual-use, supply-chain records and next S0209 redirect-only',async({page})=>{
 const root=await enter(page),detail=root.locator('#mitrelocalDetail');
 for(const [id,phrase] of [
  ['S9002','utilidad de línea de comandos de Windows'],
  ['S9008','flujos de trabajo codificados de GitHub Actions'],
  ['S9043','tokens robados de npm y GitHub OIDC'],
  ['S9046','sospecha una vinculación']]){
  await root.locator('#mitrelocalSearch').fill(id);
  await root.locator('[data-local-id="'+id+'"]').click();
  await expect(detail).toContainText(phrase);
 }
 await root.locator('#mitrelocalSearch').fill('S0209');
 await root.locator('[data-local-id="S0209"]').click();
 await expect(detail).not.toContainText('Descripción íntegra traducida');
});
