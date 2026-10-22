const {test,expect}=require('@playwright/test');
const ids=["S1178","S1179","S1180","S1181","S1182","S1183","S1184","S1185","S1186","S1187","S1188","S1189","S1190","S1191","S1192","S1193","S1194","S1195","S1196","S1197","S1198","S1199","S1200","S1201","S1202","S1203","S1204","S1205","S1206","S1207","S1208","S1209","S1210","S1211","S1212","S1213","S1214","S1215","S1216","S1217","S1218","S1219","S1220","S1221","S1222","S1223","S1224","S1225","S1226","S1227","S1228","S1229","S1230","S1231","S1232","S1233","S1234","S1235","S1236","S1237"];
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
test('batch14 validates 60 actual source records, ordered footnotes, repeated citations and coverage',async({page})=>{
 await page.goto('/');
 const audit=await page.evaluate(async selected=>{
  const source=await(await fetch('data/mitre/v20/software-02.json')).json();
  const s=window.AttackSoftwareFullSpanishV20,full=window.AttackFullSpanishV20;
  const refs=t=>(t.match(/\[\d+\]/g)||[]).join('|');
  const found=source.filter(x=>selected.includes(x.id));
  const invalid=found.filter(x=>{
   const tr=full.entry(x.id);
   return !x.description_en||!tr||tr.status!=='draft_needs_review'||tr.scope!=='full_description'||
    tr.description===x.description_en||tr.description.length<25||refs(tr.description)!==refs(x.description_en);
  }).map(x=>x.id);
  return {shard:source.length,found:found.length,newUnique:new Set(selected).size,softwareCount:s.ids.length,
   unique:new Set(s.ids).size,invalid,repeatedTranslated:refs(full.description('S1201')),
   repeatedSource:refs(source.find(x=>x.id==='S1201').description_en),
   next:full.entry('S9052'),software:s.coverage,global:full.coverage};
 },ids);
 expect(audit).toEqual({shard:279,found:60,newUnique:60,softwareCount:960,unique:960,invalid:[],
  repeatedTranslated:'[1]|[1]',repeatedSource:'[1]|[1]',next:null,
  software:{software:960,totalSoftware:974},
  global:{datasources:42,assets:18,tactics:39,mitigations:109,campaigns:61,software:960,fullDescriptions:1229}});
});
test('Quick Assist is a consent-based utility; Spanish search and English source reversible',async({page})=>{
 const root=await enter(page);
 await expect(root.locator('#mitrelocalTranslationStats')).toContainText('S 960/974');
 await root.locator('#mitrelocalSearch').fill('aprobación del usuario final');
 await expect(root.locator('[data-local-id="S1209"]')).toHaveCount(1);
 await root.locator('[data-local-id="S1209"]').click();
 const detail=root.locator('#mitrelocalDetail');
 await expect(detail).toContainText('herramienta de asistencia remota');
 await expect(detail).toContainText('macOS');
 const english=detail.locator('details.mitrelocal-source-collapsed');
 await english.locator('summary').click();
 await expect(english).toContainText('end user approval');
 await page.locator('#language').selectOption('en');
 await expect(detail).toContainText('remote assistance tool');
 await page.locator('#language').selectOption('es');
 await expect(detail).toContainText('aprobación del usuario final');
});
test('RansomHub and Megazord keep uncertainty; BlackByte keys and BOLDMOVE scope stay distinct',async({page})=>{
 const root=await enter(page),detail=root.locator('#mitrelocalDetail');
 for(const [id,phrases] of [
  ['S1212',['podrían haber comprado','Knight','FreeBSD']],
  ['S1191',['posiblemente su uso no sea exclusivo','Akira']],
  ['S1180',['clave común','descifrador universal']],
  ['S1181',['no dispone de una clave común','BlackByte']],
  ['S1184',['solo abarca las variantes de Linux conocidas','CVE-2022-42475']]]){
  await root.locator('#mitrelocalSearch').fill(id);
  await root.locator('[data-local-id="'+id+'"]').click();
  for(const phrase of phrases)await expect(detail).toContainText(phrase);
 }
});
test('BitLocker and cipher.exe remain legitimate; Mustang Panda paths and S9052 pending',async({page})=>{
 const root=await enter(page),detail=root.locator('#mitrelocalDetail');
 for(const [id,phrase] of [
  ['S1178','aprovecha la aplicación legítima BitLocker'],
  ['S1205','utilidad nativa de Microsoft'],
  ['S1228','C:\\Users\\Public'],
  ['S1229','marco de código abierto de mando y control']]){
  await root.locator('#mitrelocalSearch').fill(id);
  await root.locator('[data-local-id="'+id+'"]').click();
  await expect(detail).toContainText(phrase);
 }
 await root.locator('#mitrelocalSearch').fill('S9052');
 await root.locator('[data-local-id="S9052"]').click();
 await expect(detail).not.toContainText('Descripción íntegra traducida');
});
