const { test, expect } = require('@playwright/test');

// Real user journeys on local synthetic cases; no real tools or network requests.
async function openSection(page, section) {
  const sidebar = page.locator('#sidebar');
  const link = sidebar.locator('[data-view="' + section + '"]');
  const group = link.locator('xpath=ancestor::details');
  await group.evaluate(el => { el.open = true; });
  const menu = page.locator('#menuButton');
  if (await menu.isVisible() && !(await sidebar.evaluate(el => el.classList.contains('open')))) await menu.click();
  await link.click();
  await expect(page.locator('#' + section + 'View')).toBeVisible();
}

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#exploreView')).toBeVisible();
});

test('integrated case: inspect evidence, answer, save notes and export report', async ({ page }) => {
  await openSection(page, 'integrated');
  const root = page.locator('#integratedView');
  await expect(root.locator('#ig-case')).toBeVisible();
  // Open two sources: this is required before the assessment can be checked.
  await root.locator('[data-ig-open="0"]').click();
  await root.locator('[data-ig-open="1"]').click();
  await expect(root.locator('.ig-code')).toHaveCount(4);
  const options = root.locator('input[name="ig-answer"]');
  await options.first().check();
  await expect(root.locator('#ig-check')).toBeEnabled();
  await root.locator('#ig-check').click();
  await expect(root.getByText(/Respuesta respaldada|Repasemos|Evidence-supported|Review the answer/).first()).toBeVisible();
  await root.locator('#ig-note').fill('Hechos: dos registros revisados. Hipótesis: requiere corroboración. Próximos pasos: más contexto.');
  const dl = page.waitForEvent('download');
  await root.locator('#ig-export').click();
  const download = await dl;
  expect(download.suggestedFilename()).toMatch(/^attacklab-v33-.*\.json$/);
  const fs = require('node:fs/promises');
  const report = JSON.parse(await fs.readFile(await download.path(), 'utf8'));
  expect(report.academy).toBe('ATT&CK LAB');
  expect(report.sources).toHaveLength(2);
  expect(report.reviewed).toBe(true);
  expect(report.notes).toContain('Hechos:');
});

test('integrated case: evidence and notes persist after reload', async ({ page }) => {
  await openSection(page, 'integrated');
  const root = page.locator('#integratedView');
  await root.locator('[data-ig-open="0"]').click();
  await root.locator('#ig-note').fill('Nota de persistencia E2E');
  await page.reload();
  await openSection(page, 'integrated');
  await expect(root.locator('[data-ig-open="0"]')).toHaveAttribute('aria-expanded', 'true');
  await expect(root.locator('#ig-note')).toHaveValue('Nota de persistencia E2E');
});

test('case academy: notes can be saved on a case', async ({ page }) => {
  await openSection(page, 'caseacademy');
  const root = page.locator('#caseacademyView');
  await expect(root.locator('#caseNotes')).toBeVisible();
  await root.locator('#caseNotes').fill('Revisar evidencias y valorar hipótesis alternativas.');
  await root.locator('[data-case="save"]').click();
  await expect(root.locator('#caseNotes')).toHaveValue('Revisar evidencias y valorar hipótesis alternativas.');
});

test('decision lab: narrative is editable and save action responds', async ({ page }) => {
  await openSection(page, 'decisions');
  const root = page.locator('#decisionsView');
  await expect(root.locator('#decisionNotes')).toBeVisible();
  await root.locator('#decisionNotes').fill('Analizar antes de contener; documentar incertidumbres.');
  await root.locator('[data-dec="save"]').click();
  await expect(root.locator('#decisionNotes')).toHaveValue('Analizar antes de contener; documentar incertidumbres.');
});
