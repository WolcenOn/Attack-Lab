const {test,expect}=require('@playwright/test');
async function enter(page){
 await page.goto('/');
 const welcome=page.locator('.welcome-overlay:not([hidden])');
 await expect(welcome).toBeVisible();
 await welcome.locator('[data-welcome="skip"]').click();
 const nav=page.locator('#sidebar .nav-link[data-view="mitrelocal"]');
 await nav.locator('xpath=ancestor::details').evaluate(x=>{x.open=true});
 if(await page.locator('#menuButton').isVisible())await page.locator('#menuButton').click();
 await nav.click();
 await expect(page.locator('#mitrelocalView')).toBeVisible();
 await expect(page.locator('#mitrelocalView #mitrelocalSearch')).toBeVisible({timeout:15000});
}
test('MITRE local directory: cross-domain T and S search and source links',async({page})=>{
 await enter(page);
 const root=page.locator('#mitrelocalView');
 await expect(root.locator('.lesson-badge')).toContainText('5');
 await root.locator('#mitrelocalSearch').fill('T1059.001');
 await expect(root.locator('[data-local-id="T1059.001"]')).toHaveCount(1);
 await root.locator('[data-local-id="T1059.001"]').click();
 await expect(root.locator('#mitrelocalDetail')).toContainText('T1059.001');
 await expect(root.locator('#mitrelocalDetail')).toContainText('MITRE');
 await root.locator('#mitrelocalSearch').fill('S0366');
 await root.locator('[data-local-id="S0366"]').click();
 await expect(root.locator('#mitrelocalDetail')).toContainText('S0366');
 await expect(root.locator('#mitrelocalDetail a.resource-link')).toHaveAttribute('href',/attack\.mitre\.org/);
});
test('MITRE local directory: detections, analytics and Spanish/English',async({page})=>{
 await enter(page);
 const root=page.locator('#mitrelocalView');
 await root.locator('#mitrelocalSearch').fill('DET0001');
 await root.locator('[data-local-id="DET0001"]').click();
 await expect(root.locator('#mitrelocalDetail')).toContainText('AN0001');
 await expect(root.locator('#mitrelocalDetail')).toContainText('Fuentes de registro propuestas');
 await root.locator('#mitrelocalSearch').fill('AN0001');
 await root.locator('[data-local-id="AN0001"]').click();
 await expect(root.locator('#mitrelocalDetail')).toContainText('AN0001');
 await page.locator('#language').selectOption('en');
 await expect(root).toContainText('Integrated MITRE library');
 await expect(root.locator('#mitrelocalDetail')).toContainText('Analytic under DET');
});
test('MITRE local directory: ICS assets and campaign references are local and traceable',async({page})=>{
 await enter(page);
 const root=page.locator('#mitrelocalView');
 await root.locator('#mitrelocalType').selectOption('assets');
 await root.locator('#mitrelocalDomain').selectOption('ics');
 await root.locator('#mitrelocalSearch').fill('A0001');
 await root.locator('[data-local-id="A0001"]').click();
 await expect(root.locator('#mitrelocalDetail')).toContainText('A0001');
 await root.locator('#mitrelocalType').selectOption('campaigns');
 await root.locator('#mitrelocalDomain').selectOption('all');
 await root.locator('#mitrelocalSearch').fill('C0001');
 await root.locator('[data-local-id="C0001"]').click();
 await expect(root.locator('#mitrelocalDetail')).toContainText('Frankenstein');
});