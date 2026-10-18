const {test,expect}=require('@playwright/test');

const batchIds=['C0001','C0002','C0004','C0005','C0006','C0007',
 'C0010','C0011','C0012','C0013','C0014','C0015','C0016',
 'C0017','C0018','C0020','C0021','C0022','C0023','C0024'];

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
 await root.locator('#mitrelocalType').selectOption('campaigns');
 return root;
}

test('first 20 campaign IDs remain valid while the campaign family reaches 61/61 and 269 full descriptions',async({page})=>{
 await page.goto('/');
 const audit=await page.evaluate(async ids=>{
  const original=await(await fetch('data/mitre/v20/campaigns-00.json')).json();
  const c=window.AttackCampaignFullSpanishV20;
  const all=window.AttackFullSpanishV20;
  const footnotes=s=>(s.match(/\[\d+\]/g)||[]).sort().join('|');
  const covered=original.filter(r=>ids.includes(r.id));
  const invalid=covered.filter(r=>{
   const es=all.entry(r.id);
   return !r.description_en||!es||es.scope!=='full_description'||
    es.status!=='draft_needs_review'||es.description.length<90||
    es.description===r.description_en||footnotes(es.description)!==footnotes(r.description_en)||
    c.searchText(r.id)!==es.description;
  }).map(r=>r.id);
  const missing=original.filter(r=>!all.entry(r.id)).map(r=>r.id);
  return {total:original.length,sourceCovered:covered.length,
   overlayIds:c.ids.length,unique:new Set(c.ids).size,invalid,missing,
   campaignCoverage:c.coverage,globalCoverage:all.coverage,
   firstNameUnchanged:original.find(r=>r.id==='C0001').name_en==='Frankenstein',
   translatedC0025:all.entry('C0025')?.scope};
 },batchIds);
 expect(audit).toEqual({
  total:61,sourceCovered:20,overlayIds:61,unique:61,invalid:[],missing:[],
  campaignCoverage:{campaigns:61,totalCampaigns:61},
  globalCoverage:{datasources:42,assets:18,tactics:39,mitigations:109,campaigns:61,fullDescriptions:269},
  firstNameUnchanged:true,translatedC0025:'full_description'
 });
});

test('C0024 SolarWinds translates full details, multiple attributions and English source reversibly',async({page})=>{
 const root=await enter(page);
 await expect(root.locator('#mitrelocalTranslationStats')).toContainText('C 61/61');
 await root.locator('#mitrelocalSearch').fill('C0024');
 await root.locator('[data-local-id="C0024"]').click();
 const detail=root.locator('#mitrelocalDetail');
 for(const phrase of ['Descripción íntegra traducida','SolarWinds Orion',
  'StellarParticle','UNC2452','NOBELIUM','Dark Halo','SolarStorm',
  'Servicio de Inteligencia Exterior ruso (SVR)','18.000 clientes',
  'un número mucho menor','[9] [10] [11]']){
  await expect(detail).toContainText(phrase);
 }
 await expect(detail.locator('a.resource-link')).toHaveAttribute('href',/campaigns\/C0024\//);
 const original=detail.locator('details.mitrelocal-source-collapsed');
 await expect(original).toHaveJSProperty('open',false);
 await original.locator('summary').click();
 await expect(original).toContainText('The SolarWinds Compromise was a sophisticated supply chain');
 await page.locator('#language').selectOption('en');
 await expect(detail).toContainText('approximately 18,000 affected public and private sector');
 await expect(detail).not.toContainText('Servicio de Inteligencia Exterior ruso');
 await page.locator('#language').selectOption('es');
 await expect(detail).toContainText('Servicio de Inteligencia Exterior ruso');
});

test('C0005: Spanish full description is searchable, preserves uncertainty and no false attribution to APT-C-36',async({page})=>{
 const root=await enter(page);
 await root.locator('#mitrelocalSearch').fill('diferencias suficientes para informar de esta actividad');
 await expect(root.locator('[data-local-id="C0005"]')).toHaveCount(1);
 await root.locator('[data-local-id="C0005"]').click();
 const detail=root.locator('#mitrelocalDetail');
 for(const phrase of ['Operation Spalax','APT-C-36','sin atribución',
  'abril de 2018','COVID-19','metalúrgico']){
  await expect(detail).toContainText(phrase);
 }
 await expect(detail).not.toContainText('Resumen educativo en español (no traducción literal)');
});

test('C0017 APT41 retains unknown motives, observed PII exfiltration and timing',async({page})=>{
 const root=await enter(page);
 await root.locator('#mitrelocalSearch').fill('C0017');
 await root.locator('[data-local-id="C0017"]').click();
 const detail=root.locator('#mitrelocalDetail');
 for(const phrase of ['mayo de 2021 y febrero de 2022',
  'al menos seis redes','día cero','en al menos dos casos',
  'Se desconocen los objetivos','información de identificación personal (PII)']){
  await expect(detail).toContainText(phrase);
 }
});

test('C0007 tentative Chinese attribution and C0022 Lazarus caveat remain qualified',async({page})=>{
 const root=await enter(page);
 const detail=root.locator('#mitrelocalDetail');
 await root.locator('#mitrelocalSearch').fill('C0007');
 await root.locator('[data-local-id="C0007"]').click();
 for(const phrase of ['presunta campaña china','posibles actores','Chinoxy','TAG-16','[1] [2] [3]']){
  await expect(detail).toContainText(phrase);
 }
 await root.locator('#mitrelocalSearch').fill('C0022');
 await root.locator('[data-local-id="C0022"]').click();
 for(const phrase of ['probablemente llevada a cabo','Lazarus Group',
  'compromiso del correo electrónico empresarial (BEC)',
  'Operation North Star','Operation Interception','[1] [2] [3] [4]']){
  await expect(detail).toContainText(phrase);
 }
});

test('C0020 ICS incident retains 2000 and 800,000 liters; C0025 is now fully translated',async({page})=>{
 const root=await enter(page);
 const detail=root.locator('#mitrelocalDetail');
 await root.locator('#mitrelocalSearch').fill('C0020');
 await root.locator('[data-local-id="C0020"]').click();
 await expect(detail).toContainText('800.000 litros de aguas residuales sin tratar');
 await expect(detail).toContainText('incidente de 2000');
 await root.locator('#mitrelocalSearch').fill('C0025');
 await root.locator('[data-local-id="C0025"]').click();
 await expect(detail).toContainText('Descripción íntegra de MITRE traducida al español');
 await expect(detail).toContainText('Descripción íntegra traducida');
 expect(await page.evaluate(()=>window.AttackFullSpanishV20.entry('C0025')?.scope)).toBe('full_description');
});

test('existing M, TA, DS and A translations remain available',async({page})=>{
 await page.goto('/');
 const v=await page.evaluate(()=>Object.fromEntries(
  ['M1055','TA0112','DS0001','A0003','C0014'].map(id=>[id,window.AttackFullSpanishV20.entry(id)?.scope])
 ));
 expect(v).toEqual({'M1055':'full_description','TA0112':'full_description',
  'DS0001':'full_description','A0003':'full_description','C0014':'full_description'});
});
