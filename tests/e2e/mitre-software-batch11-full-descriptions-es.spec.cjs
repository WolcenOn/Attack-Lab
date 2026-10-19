const {test,expect}=require('@playwright/test');
const shard1=["S0683","S0684","S0685","S0686","S0687"];
const shard2=["S0688","S0689","S0690","S0691","S0692","S0693","S0694","S0695","S0696","S0697","S0698","S0699","S1000","S1006","S1009","S1010","S1011","S1012","S1013","S1014","S1015","S1016","S1017","S1018","S1019","S1020","S1021","S1022","S1023","S1024","S1025","S1026","S1027","S1028","S1029","S1030","S1031","S1032","S1033","S1034","S1035","S1037","S1039","S1040","S1041","S1042","S1043","S1044","S1045","S1046","S1047","S1048","S1049","S1050","S1051"];
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
test('batch11 validates 5+55 exact source records, footnotes, unique IDs and coverage',async({page})=>{
 await page.goto('/');
 const audit=await page.evaluate(async ({ids1,ids2})=>{
  const [s1,s2]=await Promise.all(['software-01.json','software-02.json'].map(async file=>await(await fetch('data/mitre/v20/'+file)).json()));
  const api=window.AttackSoftwareFullSpanishV20,all=window.AttackFullSpanishV20;
  const refs=s=>(s.match(/\[\d+\]/g)||[]).join('|');
  const source=[...s1.filter(x=>ids1.includes(x.id)),...s2.filter(x=>ids2.includes(x.id))];
  const missingOrInvalid=source.filter(x=>{
   const t=all.entry(x.id);
   return !x.description_en||!t||t.status!=='draft_needs_review'||t.scope!=='full_description'||t.description===x.description_en||t.description.length<25||refs(t.description)!==refs(x.description_en);
  }).map(x=>x.id);
  return {shards:[s1.length,s2.length],selected:source.length,from1:s1.filter(x=>ids1.includes(x.id)).length,
   from2:s2.filter(x=>ids2.includes(x.id)).length,newUnique:new Set([...ids1,...ids2]).size,
   total:api.ids.length,unique:new Set(api.ids).size,missingOrInvalid,
   s1023References:refs(all.description('S1023')),originalS1023:refs(s2.find(x=>x.id==='S1023').description_en),
   next:all.entry('S1052'),software:api.coverage,global:all.coverage};
 },{ids1:shard1,ids2:shard2});
 expect(audit).toEqual({shards:[307,279],selected:60,from1:5,from2:55,newUnique:60,total:720,unique:720,
  missingOrInvalid:[],s1023References:'[1]|[1]',originalS1023:'[1]|[1]',next:null,
  software:{software:720,totalSoftware:974},
  global:{datasources:42,assets:18,tactics:39,mitigations:109,campaigns:61,software:720,fullDescriptions:989}});
});
test('Peirates and ROADTools stay legitimate tools and ES search/EN original are reversible',async({page})=>{
 const root=await enter(page);
 await expect(root.locator('#mitrelocalTranslationStats')).toContainText('S 720/974');
 await root.locator('#mitrelocalSearch').fill('recopilar tokens de cuentas de servicio');
 await expect(root.locator('[data-local-id="S0683"]')).toHaveCount(1);
 await root.locator('[data-local-id="S0683"]').click();
 const detail=root.locator('#mitrelocalDetail');
 await expect(detail).toContainText('disponible públicamente en GitHub');
 const english=detail.locator('details.mitrelocal-source-collapsed');
 await english.locator('summary').click();
 await expect(english).toContainText('post-exploitation Kubernetes exploitation framework');
 await page.locator('#language').selectOption('en');
 await expect(detail).toContainText('service account tokens');
 await page.locator('#language').selectOption('es');
 await expect(detail).toContainText('recopilar tokens de cuentas de servicio');
 await root.locator('#mitrelocalSearch').fill('S0684');
 await root.locator('[data-local-id="S0684"]').click();
 await expect(detail).toContainText('enumerar entornos de Azure Active Directory');
});
test('ICS and uncertain attribution keep caveats in Cyclops Blink, Meteor and INCONTROLLER',async({page})=>{
 const root=await enter(page),detail=root.locator('#mitrelocalDetail');
 for(const [id,phrases] of [
  ['S0687',['Se considera que','VPNFilter','WatchGuard','[1] [2] [3]']],
  ['S0688',['Es probable','según los informes','Indra']],
  ['S1010',['Modbus SCADA','Se evaluó','Cyclops Blink']],
  ['S1045',['OPC UA','CODESYS','algunos investigadores de seguridad','CHERNOVITE']]]){
  await root.locator('#mitrelocalSearch').fill(id);
  await root.locator('[data-local-id="'+id+'"]').click();
  for(const p of phrases)await expect(detail).toContainText(p);
 }
});
test('DCSrv has no ransom demand; Rclone remains a command-line tool; next S1052 is pending',async({page})=>{
 const root=await enter(page),detail=root.locator('#mitrelocalDetail');
 await root.locator('#mitrelocalSearch').fill('S1033');
 await root.locator('[data-local-id="S1033"]').click();
 await expect(detail).toContainText('no exige ningún rescate ni ofrece una clave de descifrado');
 await root.locator('#mitrelocalSearch').fill('S1040');
 await root.locator('[data-local-id="S1040"]').click();
 await expect(detail).toContainText('programa de línea de comandos para sincronizar archivos');
 await root.locator('#mitrelocalSearch').fill('S1052');
 await root.locator('[data-local-id="S1052"]').click();
 await expect(detail).not.toContainText('Descripción íntegra traducida');
});
