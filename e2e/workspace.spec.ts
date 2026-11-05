import { test, expect } from '@playwright/test';
test('create, edit, persist, preview and reset a fictional project', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto('/');
  await page.getByRole('button', { name: 'New project' }).click();
  const dialog = page.getByRole('dialog');
  await dialog.getByLabel('Project name', { exact: true }).fill('Fictional community gardens');
  await expect(dialog.getByLabel('Project code', { exact: true })).toHaveValue('DEMO-KEXX00109');
  await expect(dialog.getByLabel('Project code', { exact: true })).toHaveAttribute('readonly', '');
  await dialog.getByLabel('Budget (GBP)', { exact: true }).fill('123000');
  await dialog.getByLabel('Planned participants', { exact: true }).fill('800');
  await dialog.getByLabel('Planned start date', { exact: true }).fill('2027-01-01');
  await dialog.getByLabel('Planned end date', { exact: true }).fill('2028-12-31');
  await dialog
    .getByLabel('Project summary', { exact: true })
    .fill('A fictional project for browser testing.');
  await dialog.getByRole('button', { name: 'Create demo project' }).click();
  await expect(
    page.getByRole('heading', { name: 'Fictional community gardens', exact: true }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Edit project', exact: true }).click();
  await dialog.getByLabel('Project name', { exact: true }).fill('Fictional garden learning');
  await dialog.getByRole('button', { name: 'Save demo changes' }).click();
  await page.getByRole('button', { name: 'Prepare approval' }).click();
  await dialog.getByLabel('Submission comments').fill('This is a demo approval preview.');
  await dialog.getByRole('button', { name: 'Review preview' }).click();
  await expect(dialog).toContainText('Approval Project Outline');
  await dialog.getByRole('button', { name: 'Save demo preview' }).click();
  await page.getByRole('tab', { name: /Approvals/ }).click();
  await expect(page.getByRole('tabpanel')).toContainText('Preview only — not submitted');
  await page.reload();
  await page.getByRole('textbox', { name: 'Search projects' }).fill('DEMO-KEXX00109');
  await page.getByRole('button', { name: 'Open Fictional garden learning' }).click();
  await expect(
    page.getByRole('heading', { name: 'Fictional garden learning', exact: true }),
  ).toBeVisible();
  await page.getByRole('tab', { name: 'Activity' }).click();
  await expect(page.getByRole('tabpanel')).toContainText('Outline preview saved');
  await page.getByRole('button', { name: 'Getting started', exact: true }).click();
  await page.getByRole('button', { name: 'Reset demo data', exact: true }).last().click();
  await dialog.getByRole('button', { name: 'Reset demo data', exact: true }).click();
  await page.getByRole('button', { name: 'Projects', exact: true }).click();
  await page.getByRole('textbox', { name: 'Search projects' }).fill('DEMO-KEXX00109');
  await expect(page.getByRole('heading', { name: 'No projects match your filters' })).toBeVisible();
  expect(errors).toEqual([]);
});
test('design checks and duration are required, pending projects are locked', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Open Harvesting opportunity' }).click();
  await page.getByRole('button', { name: 'Prepare approval' }).click();
  const d = page.getByRole('dialog');
  await d.getByRole('button', { name: 'Review preview' }).click();
  await expect(d.getByRole('alert')).toContainText('Confirm the three design readiness checks.');
  for (const name of [
    'Thematic review completed',
    'Monitoring & evaluation review completed',
    'Budget reviewed',
  ])
    await d.getByLabel(name, { exact: true }).check();
  await d.getByLabel('Up to three years', { exact: true }).check();
  await d.getByLabel('Over three years', { exact: true }).check();
  await expect(d.getByLabel('Up to three years', { exact: true })).not.toBeChecked();
  await d.getByLabel('Submission comments').fill('Fictional design review.');
  await d.getByRole('button', { name: 'Review preview' }).click();
  await expect(d).toContainText('“2”');
  await page.keyboard.press('Escape');
  await expect(d).not.toBeVisible();
  await page.getByRole('button', { name: 'All projects', exact: true }).click();
  await page.getByRole('button', { name: 'Open Water for a brighter future' }).click();
  await expect(page.getByRole('button', { name: 'Edit project', exact: true })).toBeDisabled();
  await expect(page.getByRole('button', { name: 'Prepare approval' })).toHaveCount(0);
});
test('filters and navigation fit the viewport', async ({ page }) => {
  await page.goto('/');
  await page.getByLabel('Filter by country').selectOption('Kenya');
  await page.getByLabel('Filter by record type').selectOption('CAST');
  await expect(
    page.getByRole('button', { name: 'Open Landscape learning assessment' }),
  ).toBeVisible();
  await expect(
    page.getByRole('button', { name: 'Open Growing resilient communities' }),
  ).toHaveCount(0);
  await page.getByRole('button', { name: 'Card view' }).click();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= document.documentElement.clientWidth,
    ),
  ).toBe(true);
  await page.getByRole('button', { name: 'Getting started', exact: true }).click();
  await expect(
    page.getByRole('heading', { name: 'Start with a little exploration.' }),
  ).toBeVisible();
});

test('an open edit form detects changes from another tab', async ({ page, context }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Open Growing resilient communities' }).click();
  await page.getByRole('button', { name: 'Edit project', exact: true }).click();
  const dialog = page.getByRole('dialog');
  await dialog.getByLabel('Project name', { exact: true }).fill('Stale fictional edit');
  const second = await context.newPage();
  await second.goto('/');
  await second.getByRole('button', { name: 'Open Growing resilient communities' }).click();
  await second.getByRole('button', { name: 'Edit project', exact: true }).click();
  await second
    .getByRole('dialog')
    .getByLabel('Project name', { exact: true })
    .fill('Updated in another tab');
  await second.getByRole('button', { name: 'Save demo changes', exact: true }).click();
  await expect(
    page.getByRole('heading', { name: 'Updated in another tab', exact: true }),
  ).toBeVisible();
  await dialog.getByRole('button', { name: 'Save demo changes', exact: true }).click();
  await expect(dialog.getByRole('alert')).toContainText('changed in another tab');
  await second.close();
});

test('XX and MC codes share one global number across countries', async ({ page }) => {
  await page.goto('/');
  const dialog = page.getByRole('dialog');
  async function create(name: string, country: string, multi: boolean, expectedCode: string) {
    await page.getByRole('button', { name: 'New project' }).click();
    await dialog.getByLabel('Project name', { exact: true }).fill(name);
    await dialog.getByLabel('Country', { exact: true }).selectOption(country);
    await dialog.getByLabel('Multi-country project', { exact: true }).setChecked(multi);
    await expect(dialog.getByLabel('Project code', { exact: true })).toHaveValue(expectedCode);
    await dialog.getByLabel('Planned start date', { exact: true }).fill('2027-01-01');
    await dialog.getByLabel('Planned end date', { exact: true }).fill('2028-01-01');
    await dialog
      .getByLabel('Project summary', { exact: true })
      .fill('Fictional project for testing global code numbering.');
    await dialog.getByRole('button', { name: 'Create demo project' }).click();
    await expect(page.getByRole('heading', { name, exact: true })).toBeVisible();
    await page.getByRole('button', { name: 'All projects', exact: true }).click();
  }
  await create('Fictional single-country project', 'Kenya', false, 'DEMO-KEXX00109');
  await create('Fictional multi-country project', 'Rwanda', true, 'DEMO-RWMC00110');
});
