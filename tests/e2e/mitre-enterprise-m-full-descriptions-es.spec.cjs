const {test,expect}=require('@playwright/test');

const enterpriseDraftIds=["M1015","M1016","M1017","M1018","M1019","M1020","M1021","M1022","M1024","M1025","M1026","M1027","M1028","M1029","M1030","M1031","M1032","M1033","M1034","M1035","M1036","M1037","M1038","M1039","M1040","M1041","M1042","M1043","M1044","M1045","M1046","M1047","M1048","M1049","M1050","M1051","M1052","M1053","M1054","M1055","M1056","M1057","M1060"];

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
 await root.locator('#mitrelocalType').selectOption('mitigations');
 return root;
}

test('all 43 Enterprise mitigation descriptions have exact IDs, full-draft status and preserved references',async({page})=>{
 await page.goto('/');
 const found=await page.evaluate(async ids=>{
  const original=await(await fetch('data/mitre/v20/mitigations-00.json')).json();
  const m=window.AttackMitigationFullSpanishV20;
  const all=window.AttackFullSpanishV20;
  const english=original.filter(r=>r.domain==='enterprise');
  const invalid=english.filter(r=>{
   const entry=all.entry(r.id);
   const expected=ids.includes(r.id);
   if(expected!==!!entry)return true;
   if(!expected)return false;
   const getRefs=s=>(s.match(/\[\d+\]/g)||[]).sort().join('|');
   return entry.scope!=='full_description'||entry.status!=='draft_needs_review'||
    entry.description.length<50||entry.description===r.description_en||
    getRefs(entry.description)!==getRefs(r.description_en)||m.searchText(r.id)!==entry.description;
  }).map(r=>r.id);
  return {enterpriseTotal:english.length,enterpriseTranslated:english.filter(r=>!!m.entry(r.id)).length,
   idsCount:ids.length,unique:new Set(ids).size,invalid,
   coverage:m.coverage,global:all.coverage,englishPreserved:
   original.find(r=>r.id==='M1029').description_en.includes('nc <remote-log-server> 514')};
 },enterpriseDraftIds);
 expect(found).toEqual({
  enterpriseTotal:43,enterpriseTranslated:43,idsCount:43,unique:43,invalid:[],
  coverage:{mitigations:109,totalMitigations:109,ics:53,mobile:13,enterprise:43},
  global:{datasources:42,assets:18,tactics:39,mitigations:109,campaigns:20,fullDescriptions:228},
  englishPreserved:true
 });
});

test('M1029 keeps full remote-log examples and incomplete source sample; ES to EN to ES',async({page})=>{
 const root=await enter(page);
 await expect(root.locator('#mitrelocalTranslationStats')).toContainText('M 109/109');
 await root.locator('#mitrelocalSearch').fill('M1029');
 await root.locator('[data-local-id="M1029"]').click();
 const detail=root.locator('#mitrelocalDetail');
 await expect(detail).toContainText('Descripción íntegra traducida');
 for(const text of ['pruebas forenses','Splunk, Graylog o Security Onion',
   'sudo auditd | tee /var/log/audit/audit.log | nc <remote-log-server> 514',
   'outputs: type: syslog protocol: tls address:','AWS S3 Object Lock','TLS 1.2']){
  await expect(detail).toContainText(text);
 }
 await expect(detail.locator('a.resource-link')).toHaveAttribute('href',/mitigations\/M1029\//);
 const english=detail.locator('details.mitrelocal-source-collapsed');
 await expect(english).toHaveJSProperty('open',false);
 await english.locator('summary').click();
 await expect(english).toContainText('Remote Data Storage focuses on moving critical data');
 await page.locator('#language').selectOption('en');
 await expect(detail).toContainText('Immutable Backup Configurations');
 await expect(detail).not.toContainText('pruebas forenses');
 await page.locator('#language').selectOption('es');
 await expect(detail).toContainText('pruebas forenses');
});

test('M1020 inspection preserves privacy constraints and technical names',async({page})=>{
 const root=await enter(page);
 await root.locator('#mitrelocalSearch').fill('sitios financieros o sanitarios');
 await expect(root.locator('[data-local-id="M1020"]')).toHaveCount(1);
 await root.locator('[data-local-id="M1020"]').click();
 const detail=root.locator('#mitrelocalDetail');
 for(const phrase of ['volver a cifrar','puntos críticos de concentración',
   'indicadores de compromiso conocidos (IOC)','SIEM y NDR',
   'Splunk y Darktrace','autoridades de certificación (CA)','falsos positivos']){
  await expect(detail).toContainText(phrase);
 }
});

test('M1041 encrypt sensitive information retains all five cases and product names',async({page})=>{
 const root=await enter(page);
 await root.locator('#mitrelocalSearch').fill('M1041');
 await root.locator('[data-local-id="M1041"]').click();
 const detail=root.locator('#mitrelocalDetail');
 for(const phrase of ['datos almacenados','FileVault','STARTTLS','AES-256',
   'HashiCorp Vault','AWS Secrets Manager','cifrado transparente de datos (TDE)','MySQL']){
  await expect(detail).toContainText(phrase);
 }
 await expect(detail).not.toContainText('Resumen educativo en español (no traducción literal)');
});

test('M1053 complete data backup guidance is searchable and preserves WORM and the recovery test',async({page})=>{
 const root=await enter(page);
 await root.locator('#mitrelocalSearch').fill('copias incrementales diarias y copias completas semanales');
 await expect(root.locator('[data-local-id="M1053"]')).toHaveCount(1);
 await root.locator('[data-local-id="M1053"]').click();
 const detail=root.locator('#mitrelocalDetail');
 for(const phrase of ['escritura única y lectura múltiple (WORM)','AES-256',
   'AWS S3 o Azure Backup','procesos de restauración','recuperarse con rapidez']){
  await expect(detail).toContainText(phrase);
 }
});

test('M1033 now displays the full Spanish draft and retains original English',async({page})=>{
 const root=await enter(page);
 await root.locator('#mitrelocalSearch').fill('M1033');
 await root.locator('[data-local-id="M1033"]').click();
 const detail=root.locator('#mitrelocalDetail');
 await expect(detail).toContainText('Limit Software Installation');
 await expect(detail).toContainText('Descripción íntegra de MITRE traducida al español');
 await expect(detail).toContainText('Microsoft AppLocker');
 const entry=await page.evaluate(()=>window.AttackFullSpanishV20.entry('M1033'));
 expect(entry.scope).toBe('full_description');
 expect(entry.status).toBe('draft_needs_review');
});
