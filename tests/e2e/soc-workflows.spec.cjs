const { test, expect } = require('@playwright/test');
const fs = require('node:fs/promises');

// Each test follows the real first-time welcome and navigates using visible controls.
async function openSOC(page, view) {
  await page.goto('/');
  const welcome = page.locator('.welcome-overlay:not([hidden])');
  await expect(welcome).toBeVisible();
  await welcome.locator('[data-welcome="skip"]').click();
  await expect(welcome).toBeHidden();
  const button = page.locator('#sidebar [data-view="' + view + '"]');
  await button.locator('xpath=ancestor::details').evaluate(el => { el.open = true; });
  if (await page.locator('#menuButton').isVisible()) await page.locator('#menuButton').click();
  await button.click();
  await expect(page.locator('#' + view + 'View')).toBeVisible();
}

test('SIEM: notes, evaluation and downloadable analyst report', async ({ page }) => {
  await openSOC(page, 'siem');
  const root = page.locator('#siemView');
  await expect(root.locator('#siemQuery')).toBeVisible();
  await root.locator('#siemNotes').fill('E2E: evidencia sintética, verificar contexto antes de contener.');
  await root.locator('#siemEvaluate').click();
  await expect(root.locator('.siem-feedback')).toBeVisible();
  const pending = page.waitForEvent('download');
  await root.locator('#siemReport').click();
  const downloaded = await pending;
  expect(downloaded.suggestedFilename()).toMatch(/^siem-.*-informe\.json$/);
  const report = JSON.parse(await fs.readFile(await downloaded.path(), 'utf8'));
  expect(report.simulation).toBe(true);
  expect(report.reviewed).toBe(true);
  expect(report.analystNotes).toContain('E2E: evidencia sintética');
  expect(report.evaluation).not.toBeNull();
});

test('Query Academy: choose a language and simulate a search', async ({ page }) => {
  await openSOC(page, 'queries');
  const root = page.locator('#queriesView');
  await root.locator('#queryLang').selectOption('kql');
  await expect(root.locator('.query-code')).not.toBeEmpty();
  await root.locator('#queryRun').click();
  await expect(root.getByText(/eventos coincidentes entre|matching events among/)).toBeVisible();
  await expect(root.locator('.soc-table')).toBeVisible();
});

test('Threat Hunting: hypothesis, evaluation and JSON export', async ({ page }) => {
  await openSOC(page, 'hunting');
  const root = page.locator('#huntingView');
  await root.locator('[data-hunt="hypothesis"]').fill('E2E: comprobar eventos antes de atribuir intenciones.');
  await root.locator('[data-hunt="conclusion"]').fill('E2E: hipótesis pendiente de confirmación.');
  await root.locator('[data-hunt-action="evaluate"]').click();
  await expect(root.locator('.det-metrics')).toBeVisible();
  const pending = page.waitForEvent('download');
  await root.locator('[data-hunt-action="export"]').click();
  const downloaded = await pending;
  expect(downloaded.suggestedFilename()).toMatch(/^attacklab-hunt-.*\.json$/);
  const report = JSON.parse(await fs.readFile(await downloaded.path(), 'utf8'));
  expect(report.kind).toBe('synthetic-hunt');
  expect(report.reviewed).toBe(true);
  expect(report.hypothesis).toContain('E2E: comprobar eventos');
  expect(report.metrics).not.toBeNull();
});
