const { test, expect } = require('@playwright/test');

test.beforeEach(async ({ page }) => {
  // Avoid fetching the large MITRE dataset: test the self-contained demo.
  await page.goto('/');
  await expect(page.locator('#exploreView')).toBeVisible();
  await expect(page.locator('#sidebar')).toBeAttached();
});

async function navigate(page, view) {
  const btn = page.locator('#sidebar .nav-link[data-view="' + view + '"]');
  const group = btn.locator('xpath=ancestor::details[contains(@class,"nav-group")]');
  await group.evaluate(node => { node.open = true; });
  if (await page.locator('#menuButton').isVisible()) {
    // Mobile sidebar must be opened through its real toggle.
    if (!(await page.locator('#sidebar').evaluate(node => node.classList.contains('open')))) {
      await page.locator('#menuButton').click();
    }
  }
  await btn.click();
  await expect(page.locator('#' + view + 'View')).toBeVisible();
  await expect(btn).toHaveClass(/active/);
}

test('changing navigation views works and never sticks on explore', async ({ page }) => {
  for (const view of ['dashboard', 'courses', 'siem', 'integrated', 'expert', 'explore']) {
    await navigate(page, view);
    await expect(page.locator('.view:not([hidden])')).toHaveCount(1);
  }
});

test('all sidebar navigation targets open the corresponding view', async ({ page }) => {
  const views = await page.locator('#sidebar .nav-link[data-view]').evaluateAll(els => els.map(x => x.dataset.view));
  expect(views.length).toBeGreaterThan(30);
  expect(new Set(views).size).toBe(views.length);
  for (const view of views) await navigate(page, view);
});

test('accordion groups expand, collapse and open active section', async ({ page }) => {
  const group = page.locator('#sidebar details[data-nav-group="soc"]');
  await group.locator('summary').click();
  const wasOpen = await group.evaluate(node => node.open);
  await group.locator('summary').click();
  expect(await group.evaluate(node => node.open)).not.toBe(wasOpen);
  await navigate(page, 'siem');
  await expect(group).toHaveAttribute('open', '');
});

test('language selector updates visible interface', async ({ page }) => {
  await page.locator('#language').selectOption('en');
  await expect(page.locator('#language')).toHaveValue('en');
  await expect(page.locator('#breadcrumb')).toContainText(/Explore|Matrix|Explore matrix/i);
  await page.locator('#language').selectOption('es');
  await expect(page.locator('#breadcrumb')).toContainText(/Explorar/i);
});

test('main interactions do not cause uncaught JS errors', async ({ page }) => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  for (const view of ['explore', 'learn', 'dashboard', 'labs', 'decisions', 'integrated', 'toolkit']) await navigate(page, view);
  expect(errors, errors.join('\n')).toEqual([]);
});

test('menu toggle still works on mobile', async ({ page, isMobile }) => {
  test.skip(!isMobile, 'Mobile-only test');
  const sidebar = page.locator('#sidebar');
  await page.locator('#menuButton').click();
  await expect(sidebar).toHaveClass(/open/);
  await navigate(page, 'dashboard');
  await expect(sidebar).not.toHaveClass(/open/);
});
