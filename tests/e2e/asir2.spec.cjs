const {test,expect}=require('@playwright/test');
async function enter(page){
 await page.goto('/');
 const welcome=page.locator('.welcome-overlay:not([hidden])');
 await expect(welcome).toBeVisible();
 await welcome.locator('[data-welcome="skip"]').click();
 const button=page.locator('#sidebar [data-view="asir2"]');
 await button.locator('xpath=ancestor::details').evaluate(el=>{el.open=true});
 if(await page.locator('#menuButton').isVisible())await page.locator('#menuButton').click();
 await button.click();
 await expect(page.locator('#asir2View')).toBeVisible();
}
test('ASIR route offers five areas and saves reviewed units',async({page})=>{
 await enter(page);
 const root=page.locator('#asir2View');
 await expect(root.locator('[data-asir-area]')).toHaveCount(5);
 await expect(root.locator('[data-asir-unit]')).toHaveCount(3);
 await root.locator('[data-asir-answer]').click();
 await expect(root.locator('.asir2-answer')).toBeVisible();
 await root.locator('[data-asir-done]').click();
 await expect(root.locator('.asir2-progress')).toContainText('1/16');
 await page.reload();
 const nav=page.locator('#sidebar [data-view="asir2"]');
 await nav.locator('xpath=ancestor::details').evaluate(el=>{el.open=true});
 if(await page.locator('#menuButton').isVisible())await page.locator('#menuButton').click();
 await nav.click();
 await expect(root.locator('.asir2-progress')).toContainText('1/16');
 await root.locator('[data-asir-area="4"]').click();
 await expect(root.locator('[data-asir-unit]')).toHaveCount(4);
});
test('ASIR route translates and opens a connected lab',async({page})=>{
 await enter(page);
 const root=page.locator('#asir2View');
 await page.locator('#language').selectOption('en');
 await expect(root).toContainText('Technical path');
 await root.locator('[data-asir-area="3"]').click();
 await expect(root.locator('.asir2-lesson')).toContainText('Roles, users');
 await root.locator('[data-asir-practice]').click();
 await expect(page.locator('#queriesView')).toBeVisible();
});
