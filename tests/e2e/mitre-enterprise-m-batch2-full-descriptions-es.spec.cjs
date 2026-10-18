const {test,expect}=require('@playwright/test');

const batch2=['M1015','M1016','M1018','M1019','M1022','M1024',
 'M1025','M1026','M1027','M1028','M1030','M1032'];

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

test('batch 2 adds exactly 12 distinct full translations, preserving originals and all footnote IDs',async({page})=>{
 await page.goto('/');
 const audit=await page.evaluate(async ids=>{
  const original=await(await fetch('data/mitre/v20/mitigations-00.json')).json();
  const entry=id=>window.AttackFullSpanishV20.entry(id);
  const refs=text=>(text.match(/\[\d+\]/g)||[]).sort().join('|');
  const invalid=original.filter(r=>ids.includes(r.id)).filter(r=>{
   const es=entry(r.id);
   return r.domain!=='enterprise'||!es||es.scope!=='full_description'||
    es.status!=='draft_needs_review'||es.description.length<100||
    es.description===r.description_en||refs(es.description)!==refs(r.description_en);
  }).map(r=>r.id);
  const first=original.filter(r=>r.domain==='enterprise'&&!!entry(r.id));
  return {found:original.filter(r=>ids.includes(r.id)).length,distinct:new Set(ids).size,invalid,
   enterpriseCovered:first.length,enterpriseStillPending:original.filter(r=>r.domain==='enterprise'&&!entry(r.id)).length,
   coverage:window.AttackFullSpanishV20.coverage,
   mitigationCoverage:window.AttackMitigationFullSpanishV20.coverage};
 },batch2);
 expect(audit).toEqual({
  found:12,distinct:12,invalid:[],enterpriseCovered:43,enterpriseStillPending:0,
  coverage:{datasources:42,assets:18,tactics:39,mitigations:109,campaigns:20,fullDescriptions:228},
  mitigationCoverage:{mitigations:109,totalMitigations:109,ics:53,mobile:13,enterprise:43}
 });
});

test('M1015 preserves Active Directory cases, authentication silos, and ES/EN/ES',async({page})=>{
 const root=await enter(page);
 await expect(root.locator('#mitrelocalTranslationStats')).toContainText('M 109/109');
 await root.locator('#mitrelocalSearch').fill('silos de autenticación');
 await expect(root.locator('[data-local-id="M1015"]')).toHaveCount(1);
 await root.locator('[data-local-id="M1015"]').click();
 const detail=root.locator('#mitrelocalDetail');
 for(const phrase of ['Protected Users','SQL Server','Group Policy Management Console',
  'PowerShell','AD Administrative Center','bases de datos financieras']){
  await expect(detail).toContainText(phrase);
 }
 await expect(detail).toContainText('Descripción íntegra de MITRE traducida al español');
 const orig=detail.locator('details.mitrelocal-source-collapsed');
 await expect(orig).toHaveJSProperty('open',false);
 await orig.locator('summary').click();
 await expect(orig).toContainText('Authentication Silos');
 await page.locator('#language').selectOption('en');
 await expect(detail).toContainText('Interactive Logon Restrictions');
 await expect(detail).not.toContainText('silos de autenticación');
 await page.locator('#language').selectOption('es');
 await expect(detail).toContainText('silos de autenticación');
 await expect(detail.locator('a.resource-link')).toHaveAttribute('href',/mitigations\/M1015\//);
});

test('M1016 includes cloud/network/web vulnerability scanning and fictional CVE examples',async({page})=>{
 const root=await enter(page);
 await root.locator('#mitrelocalSearch').fill('M1016');
 await root.locator('[data-local-id="M1016"]').click();
 const detail=root.locator('#mitrelocalDetail');
 for(const phrase of ['Nessus u OpenVAS','AWS Inspector','GCP Security Command Center',
 'CVE-XXXX-XXXX','CVE-XXXX-YYYY','OWASP ZAP','Burp Suite','CVSS de 9,8','Nmap con scripts NSE']){
  await expect(detail).toContainText(phrase);
 }
});

test('M1022 preserves filesystem paths and command samples without rewriting them',async({page})=>{
 const root=await enter(page);
 await root.locator('#mitrelocalSearch').fill('M1022');
 await root.locator('[data-local-id="M1022"]').click();
 const detail=root.locator('#mitrelocalDetail');
 for(const phrase of ['Tripwire, Wazuh u OSSEC','chmod 750 /etc/sensitive.conf',
  'chown root:admin /etc/sensitive.conf','C:\\Windows\\System32',
  'icacls "C:\\Windows\\System32" /inheritance:r /grant:r SYSTEM:(OI)(CI)F']){
  await expect(detail).toContainText(phrase);
 }
 await page.locator('#language').selectOption('en');
 await expect(detail).toContainText('Restrict Startup Directories');
});

test('M1024 and M1025 retain registry and privileged-process source command keys',async({page})=>{
 const root=await enter(page);
 const detail=root.locator('#mitrelocalDetail');
 await root.locator('#mitrelocalSearch').fill('M1024');
 await root.locator('[data-local-id="M1024"]').click();
 for(const phrase of ['RunOnce','SAM, SECURITY y SYSTEM',
  'auditpol /set /subcategory:"Registry" /success:enable /failure:enable',
  'Set-ItemProperty -Path "HKLM:\\Software\\Microsoft\\Windows\\CurrentVersion\\Run"',
  'Sysmon','GPMC'])await expect(detail).toContainText(phrase);
 await root.locator('#mitrelocalSearch').fill('M1025');
 await root.locator('[data-local-id="M1025"]').click();
 for(const phrase of ['RunAsPPL','HKEY_LOCAL_MACHINE\\SYSTEM\\CurrentControlSet\\Control\\Lsa\\RunAsPPL',
  'Control Flow Guard (CFG)','PatchGuard','Firejail','SELinux'])await expect(detail).toContainText(phrase);
});

test('M1027 retains pwunconv source claim without quietly substituting different instructions',async({page})=>{
 const root=await enter(page);
 await root.locator('#mitrelocalSearch').fill('M1027');
 await root.locator('[data-local-id="M1027"]').click();
 const detail=root.locator('#mitrelocalDetail');
 for(const phrase of ['pam_pwquality','pam_tally2','pam_faillock','pwunconv',
  'Have I Been Pwned','NIST SP 800-63B','24 contraseñas','Lynis']){
  await expect(detail).toContainText(phrase);
 }
 await page.locator('#language').selectOption('en');
 await expect(detail).toContainText('Use pwunconv to disable password reuse');
});

test('M1030 and M1032 cover network boundaries, MFA tools and conditional access',async({page})=>{
 const root=await enter(page);
 const detail=root.locator('#mitrelocalDetail');
 await root.locator('#mitrelocalSearch').fill('M1030');
 await root.locator('[data-local-id="M1030"]').click();
 for(const phrase of ['AWS Transit Gateway','Azure VNet','microsegmentación',
  'norte-sur','este-oeste','pruebas periódicas de penetración'])await expect(detail).toContainText(phrase);
 await root.locator('#mitrelocalSearch').fill('M1032');
 await root.locator('[data-local-id="M1032"]').click();
 for(const phrase of ['Algo que sabes','Algo que tienes','Algo que eres','Hybrid/Entra',
  'YubiKey','RSA SecurID','Thales SafeNet','RADIUS/NPS','TOTP'])await expect(detail).toContainText(phrase);
});

test('M1033 graduated to full translation; DS/A/TA still available',async({page})=>{
 const root=await enter(page);
 await root.locator('#mitrelocalSearch').fill('M1033');
 await root.locator('[data-local-id="M1033"]').click();
 const detail=root.locator('#mitrelocalDetail');
 await expect(detail).toContainText('Descripción íntegra traducida');
 const full=await page.evaluate(()=>({
  m:window.AttackFullSpanishV20.entry('M1033')?.scope,
  ds:window.AttackFullSpanishV20.entry('DS0001')?.scope,
  asset:window.AttackFullSpanishV20.entry('A0003')?.scope,
  ta:window.AttackFullSpanishV20.entry('TA0112')?.scope
 }));
 expect(full).toEqual({m:'full_description',ds:'full_description',asset:'full_description',ta:'full_description'});
});
