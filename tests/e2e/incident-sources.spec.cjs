const {test,expect}=require('@playwright/test');
async function enter(page) {
 await page.goto('/');
 const welcome=page.locator('.welcome-overlay:not([hidden])');
 await expect(welcome).toBeVisible();
 await welcome.locator('[data-welcome="skip"]').click();
 const link=page.locator('#sidebar [data-view="incidents"]');
 await link.locator('xpath=ancestor::details').evaluate(e=>{e.open=true;});
 if(await page.locator('#menuButton').isVisible())await page.locator('#menuButton').click();
 await link.click();
 for(let n=0;n<2;n++)await page.locator('[data-story-step="next"]').click();
}
test('eight stories reveal sources before decisions and allow reset',async({page})=>{
 await enter(page);
 const ids=await page.locator('[data-incident]').evaluateAll(els=>els.map(el=>el.dataset.incident));
 expect(ids).toHaveLength(8);
 for (const id of ids) {
  await page.locator('[data-incident="'+id+'"]').click();
  for(let n=0;n<2;n++)await page.locator('[data-story-step="next"]').click();
  await expect(page.locator('.incident-evidence-progress')).toContainText('0/3');
  await expect(page.locator('[data-story-decision]')).toHaveCount(0);
  await page.locator('[data-story-evidence="0"]').click();
  await page.locator('[data-story-evidence="1"]').click();
  await expect(page.locator('.incident-evidence-detail')).toHaveCount(2);
  await expect(page.locator('[data-story-decision]')).toHaveCount(3);
  await page.locator('[data-story-decision="0"]').click();
  await expect(page.locator('.incident-decision [role="status"]')).toBeVisible();
  await page.locator('[data-story-reset]').click();
  await expect(page.locator('.incident-evidence-progress')).toContainText('0/3');
 }
});
test('source reviews persist after reload and display English explanation',async({page})=>{
 await enter(page);
 await page.locator('[data-story-evidence="0"]').click();
 await page.locator('[data-story-evidence="1"]').click();
 await page.reload();
 const link=page.locator('#sidebar [data-view="incidents"]');
 await link.locator('xpath=ancestor::details').evaluate(e=>{e.open=true;});
 if(await page.locator('#menuButton').isVisible())await page.locator('#menuButton').click();
 await link.click();
 for(let n=0;n<2;n++)await page.locator('[data-story-step="next"]').click();
 await expect(page.locator('.incident-evidence-progress')).toContainText('2/3');
 await page.locator('#language').selectOption('en');
 await expect(page.locator('.incident-evidence-progress')).toContainText('sources reviewed');
 await expect(page.locator('[data-story-decision]')).toHaveCount(3);
});
