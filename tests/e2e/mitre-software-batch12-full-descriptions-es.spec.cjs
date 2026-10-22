const {test,expect}=require('@playwright/test');
const ids=["S1052","S1053","S1054","S1055","S1056","S1058","S1059","S1060","S1061","S1062","S1063","S1064","S1065","S1066","S1067","S1068","S1069","S1070","S1071","S1072","S1073","S1074","S1075","S1076","S1077","S1078","S1079","S1080","S1081","S1082","S1083","S1084","S1085","S1086","S1087","S1088","S1089","S1090","S1091","S1092","S1093","S1094","S1095","S1096","S1097","S1099","S1100","S1101","S1102","S1103","S1104","S1105","S1106","S1107","S1108","S1109","S1110","S1111","S1112","S1113"];
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
test('batch12 verifies 60 exact original IDs and references without invented entries',async({page})=>{
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
   unique:new Set(s.ids).size,invalid,next:full.entry('S9052'),software:s.coverage,global:full.coverage};
 },ids);
 expect(audit).toEqual({source:279,found:60,newUnique:60,total:960,unique:960,
  invalid:[],next:null,software:{software:960,totalSoftware:974},
  global:{datasources:42,assets:18,tactics:39,mitigations:109,campaigns:61,software:960,fullDescriptions:1229}});
});
test('Brute Ratel C4 keeps legitimate simulation purpose and reversible Spanish-English access',async({page})=>{
 const root=await enter(page);
 await expect(root.locator('#mitrelocalTranslationStats')).toContainText('S 960/974');
 await root.locator('#mitrelocalSearch').fill('simulación de ataques adversarios');
 await expect(root.locator('[data-local-id="S1063"]')).toHaveCount(1);
 await root.locator('[data-local-id="S1063"]').click();
 const detail=root.locator('#mitrelocalDetail');
 await expect(detail).toContainText('herramienta comercial de ejercicios de equipo rojo');
 await expect(detail).toContainText('versión pirateada');
 const english=detail.locator('details.mitrelocal-source-collapsed');
 await english.locator('summary').click();
 await expect(english).toContainText('commercial red-teaming');
 await page.locator('#language').selectOption('en');
 await expect(detail).toContainText('adversarial attack simulation');
 await page.locator('#language').selectOption('es');
 await expect(detail).toContainText('simulación de ataques adversarios');
});
test('Industroyer2 did not impact substations; Black Basta, Royal and COATHANGER retain attribution uncertainty',async({page})=>{
 const root=await enter(page),detail=root.locator('#mitrelocalDetail');
 for(const [id,phrases] of [
  ['S1072',['IEC-104','descubierta antes de su despliegue','no produjo ningún impacto']],
  ['S1070',['podrían incluir miembros actuales o antiguos','Conti']],
  ['S1073',['una posible conexión','Conti']],
  ['S1105',['evaluación de alta confianza','CVE-2022-42475','She took his coat and hung it up']]]){
  await root.locator('#mitrelocalSearch').fill(id);
  await root.locator('[data-local-id="'+id+'"]').click();
  for(const p of phrases)await expect(detail).toContainText(p);
 }
});
test('Pacu and AsyncRAT are open-source tools, FlyTrap estimates preserved and S9052 remains pending',async({page})=>{
 const root=await enter(page),detail=root.locator('#mitrelocalDetail');
 for(const [id,phrase] of [
  ['S1091','marco de explotación de AWS de código abierto'],
  ['S1087','herramienta de acceso remoto de código abierto'],
  ['S1093','se cree que afectó a más de 10.000 víctimas en al menos 140 países'],
  ['S1106','tecnología legítima NKN']]){
  await root.locator('#mitrelocalSearch').fill(id);
  await root.locator('[data-local-id="'+id+'"]').click();
  await expect(detail).toContainText(phrase);
 }
 await root.locator('#mitrelocalSearch').fill('S9052');
 await root.locator('[data-local-id="S9052"]').click();
 await expect(detail).not.toContainText('Descripción íntegra traducida');
});
