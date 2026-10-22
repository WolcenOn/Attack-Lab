const {test,expect}=require('@playwright/test');
const ids=["S1114","S1115","S1116","S1117","S1118","S1119","S1120","S1121","S1122","S1123","S1124","S1125","S1126","S1128","S1129","S1130","S1131","S1132","S1133","S1134","S1135","S1136","S1137","S1138","S1139","S1140","S1141","S1142","S1143","S1144","S1145","S1146","S1147","S1148","S1149","S1150","S1151","S1152","S1153","S1154","S1155","S1156","S1157","S1158","S1159","S1160","S1161","S1162","S1163","S1164","S1165","S1166","S1167","S1168","S1169","S1170","S1171","S1172","S1173","S1176"];
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
test('batch13 audits 60 real IDs, repeated footnotes and global/segment coverage',async({page})=>{
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
  return {source:source.length,found:found.length,newUnique:new Set(selected).size,total:s.ids.length,
   unique:new Set(s.ids).size,invalid,refsMispadu:refs(full.description('S1122')),
   refsMispaduEn:refs(source.find(x=>x.id==='S1122').description_en),
   next:full.entry('S0209'),software:s.coverage,global:full.coverage};
 },ids);
 expect(audit).toEqual({source:279,found:60,newUnique:60,total:973,unique:973,
  invalid:[],refsMispadu:'[1]|[2]|[2]|[2]|[3]|[4]',refsMispaduEn:'[1]|[2]|[2]|[2]|[3]|[4]',
  next:null,software:{software:973,totalSoftware:974},
  global:{datasources:42,assets:18,tactics:39,mitigations:109,campaigns:61,software:973,fullDescriptions:1242}});
});
test('FRP remains a legitimate reverse proxy; Spanish search and original English reversible',async({page})=>{
 const root=await enter(page);
 await expect(root.locator('#mitrelocalTranslationStats')).toContainText('S 973/974');
 await root.locator('#mitrelocalSearch').fill('herramienta disponible públicamente');
 await expect(root.locator('[data-local-id="S1144"]')).toHaveCount(1);
 await root.locator('[data-local-id="S1144"]').click();
 const detail=root.locator('#mitrelocalDetail');
 await expect(detail).toContainText('Fast Reverse Proxy');
 await expect(detail).toContainText('NAT');
 const english=detail.locator('details.mitrelocal-source-collapsed');
 await english.locator('summary').click();
 await expect(english).toContainText('Fast Reverse Proxy');
 await page.locator('#language').selectOption('en');
 await expect(detail).toContainText('Network Address Translation');
 await page.locator('#language').selectOption('es');
 await expect(detail).toContainText('cortafuegos');
});
test('AcidRain attribution, Pikabot caveat, FrostyGoop ICS and UPSTYLE observation remain precise',async({page})=>{
 const root=await enter(page),detail=root.locator('#mitrelocalDetail');
 for(const [id,phrases] of [
  ['S1125',['Gobierno ruso','Gobierno ucraniano','Sandworm Team']],
  ['S1145',['no existen pruebas suficientes','vínculo definitivo','QakBot']],
  ['S1165',['Modbus TCP','puerto 502','registros de retención']],
  ['S1164',['CVE-2024-3400','solo se ha observado','intentos de instalación']]]){
  await root.locator('#mitrelocalSearch').fill(id);
  await root.locator('[data-local-id="'+id+'"]').click();
  for(const phrase of phrases)await expect(detail).toContainText(phrase);
 }
});
test('Covenant and attrib remain tools, uncertain metadata preserved, S0209 is redirect-only',async({page})=>{
 const root=await enter(page),detail=root.locator('#mitrelocalDetail');
 for(const [id,phrase] of [
  ['S1155','pruebas de penetración e investigación de seguridad'],
  ['S1176','utilidad de Windows'],
  ['S1135','posible manipulación de los metadatos'],
  ['S1157','según las evaluaciones']]){
  await root.locator('#mitrelocalSearch').fill(id);
  await root.locator('[data-local-id="'+id+'"]').click();
  await expect(detail).toContainText(phrase);
 }
 await root.locator('#mitrelocalSearch').fill('S0209');
 await root.locator('[data-local-id="S0209"]').click();
 await expect(detail).not.toContainText('Descripción íntegra traducida');
});
