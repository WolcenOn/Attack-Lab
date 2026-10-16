const {test,expect}=require('@playwright/test');
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
 return root;
}
test('platform matrix filtering covers Windows and Android without mixing domains',async({page})=>{
 const root=await enter(page);
 await expect(root.locator('#mitrelocalPlatform option')).toHaveCount(19);
 await root.locator('#mitrelocalPlatform').selectOption('enterprise-windows');
 await expect(root.locator('#mitrelocalType')).toHaveValue('techniques');
 await expect(root.locator('#mitrelocalDomain')).toHaveValue('enterprise');
 await expect(root.locator('.mitrelocal-platform-note a')).toHaveAttribute('href',/attack\.mitre\.org\/matrices\/enterprise\/windows/);
 await root.locator('#mitrelocalSearch').fill('T1059.001');
 await expect(root.locator('[data-local-id="T1059.001"]')).toHaveCount(1);
 await root.locator('#mitrelocalPlatform').selectOption('mobile-android');
 await expect(root.locator('#mitrelocalDomain')).toHaveValue('mobile');
 await root.locator('#mitrelocalSearch').fill('T1059.001');
 await expect(root.getByText('No hay resultados.')).toBeVisible();
 await root.locator('#mitrelocalType').selectOption('software');
 await expect(root.locator('#mitrelocalPlatform')).toHaveValue('all');
});
test('MITRE official learning guides offer independent bilingual study summaries',async({page})=>{
 const root=await enter(page);
 await expect(root.locator('.mitrelocal-resources summary')).toContainText('Guías oficiales de estudio');
 await root.locator('.mitrelocal-resources summary').click();
 await expect(root.locator('.mitrelocal-resource-grid article')).toHaveCount(12);
 await expect(root.locator('.mitrelocal-resource-grid')).toContainText('Formación en inteligencia de amenazas');
 const href=await root.locator('.mitrelocal-resource-grid a').first().getAttribute('href');
 expect(href).toMatch(/^https:\/\/attack\.mitre\.org\/resources\//);
 await page.locator('#language').selectOption('en');
 await expect(root.locator('.mitrelocal-resources summary')).toContainText('Official learning guides');
 await root.locator('.mitrelocal-resources summary').click();
 await expect(root.locator('.mitrelocal-resource-grid')).toContainText('Threat Intelligence');
 await expect(root.locator('.mitrelocal-resources')).toContainText('Study summaries, not official literal translations');
});
test('15 nonduplicated AN items found in MITRE analytics index are searchable',async({page})=>{
 const root=await enter(page);
 await root.locator('#mitrelocalSearch').fill('AN0667');
 await root.locator('[data-local-id="AN0667"]').click();
 await expect(root.locator('#mitrelocalDetail')).toContainText('DET0239');
 await expect(root.locator('#mitrelocalDetail')).toContainText('registry');
 await root.locator('#mitrelocalSearch').fill('AN2070');
 await root.locator('[data-local-id="AN2070"]').click();
 await expect(root.locator('#mitrelocalDetail')).toContainText('No aparece un DET vinculado');
 await expect(root.locator('#mitrelocalDetail a.resource-link')).toHaveAttribute('href','https://attack.mitre.org/analytics/');
 await page.locator('#language').selectOption('en');
 await expect(root.locator('#mitrelocalDetail')).toContainText('No linked DET was provided');
});
