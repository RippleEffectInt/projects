import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
test('key screens have no automated WCAG A/AA violations', async ({ page }) => {
  async function check() {
    const result = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze();
    expect(result.violations).toEqual([]);
  }
  await page.goto('/');
  await check();
  await page.getByRole('button', { name: 'New project' }).click();
  await check();
  await page.keyboard.press('Escape');
  await page.getByRole('button', { name: 'Open Harvesting opportunity' }).click();
  await check();
  await page.getByRole('tab', { name: 'Overview', exact: true }).focus();
  await page.keyboard.press('ArrowRight');
  await expect(page.getByRole('tab', { name: /Approvals/ })).toBeFocused();
  await expect(page.getByRole('tab', { name: /Approvals/ })).toHaveAttribute(
    'aria-selected',
    'true',
  );
  await page.getByRole('button', { name: 'Prepare approval' }).click();
  await check();
  await page.keyboard.press('Escape');
  await page.getByRole('button', { name: 'Getting started', exact: true }).click();
  await check();
  await page.getByRole('button', { name: 'Approvals', exact: true }).click();
  await check();
});
