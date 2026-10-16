const {test,expect}=require('@playwright/test');
async function enter(page){
 await page.goto('/');
 const welcome=page.locator('.welcome-overlay:not([hidden])');
 await expect(welcome).toBeVisible();
 await welcome.locator('[data-welcome="skip"]').click();
 const nav=page.locator('#sidebar .nav-link[data-view="mitrehistory"]');
 await nav.locator('xpath=ancestor::details').evaluate(el=>{el.open=true});
 if(await page.locator('#menuButton').isVisible())await page.locator('#menuButton').click();
 await nav.click();
 await expect(page.locator('#mitrehistoryView')).toBeVisible();
 await expect(page.locator('#historySearch')).toBeVisible({timeout:15000});
}
test('MITRE version history: 28 transitions and source provenance',async({page})=>{
 await enter(page);
 const root=page.locator('#mitrehistoryView');
 await expect(root.locator('#historyRelease option')).toHaveCount(28);
 await expect(root).toContainText('15.430');
 await expect(root).toContainText('no en una fuente en vivo');
 await root.locator('#historyAction').selectOption('0');
 await expect(root.locator('#historyStatus')).toContainText('cambios');
 await root.locator('#historyDomain').selectOption('I');
 await expect(root.locator('#historyStatus')).toBeVisible();
});
test('MITRE history: search by code across releases and switch to English',async({page})=>{
 await enter(page);
 const root=page.locator('#mitrehistoryView');
 await root.locator('[data-history-scope="all"]').click();
 await root.locator('#historySearch').fill('T1059.001');
 await expect(root.locator('.mitrehistory-item').first()).toContainText('T1059.001');
 await page.locator('#language').selectOption('en');
 await expect(root).toContainText('What changed in MITRE');
 await expect(root.locator('.mitrehistory-item').first()).toContainText('Historical record, not current status');
 await root.locator('[data-history-open="T1059.001"]').first().click();
 await expect(page.locator('#mitrelocalView')).toBeVisible();
});
test('MITRE history: only JSON history is loaded and unknown codes do not generate records',async({page})=>{
 const requested=[];
 page.on('request',request=>{if(request.url().includes('/data/mitre/history/'))requested.push(request.url())});
 await enter(page);
 expect(requested.some(x=>x.endsWith('/manifest.json'))).toBe(true);
 expect(requested.filter(x=>/changes-\d{2}\.json/.test(x))).toHaveLength(1);
 const root=page.locator('#mitrehistoryView');
 await root.locator('#historySearch').fill('T9999.999');
 await expect(root.locator('#historyStatus')).toContainText('0 cambios coincidentes');
 await expect(root.getByText('No hay cambios coincidentes')).toBeVisible();
 await root.locator('[data-history-scope="all"]').click();
 await expect.poll(()=>requested.filter(x=>/changes-\d{2}\.json/.test(x)).length).toBe(7);
});
