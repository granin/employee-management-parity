import { test, expect, Page } from '@playwright/test';

const ROW_SELECTOR = 'tbody tr';
const DRAWER_TEXT = 'Редактирование данных сотрудника';
const QUICK_ADD_LOGIN = 'test.agent';

const getFirstRowCheckbox = (page: Page) => page.locator('tbody tr input[type="checkbox"]').first();

test.describe('Employee list interactions', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await expect(page.locator(ROW_SELECTOR).first()).toBeVisible();
  });

  test('clicking row toggles selection without opening drawer', async ({ page }) => {
    const row = page.locator(ROW_SELECTOR).first();
    const checkbox = getFirstRowCheckbox(page);

    await row.click();
    await expect(checkbox).toBeChecked();
    await expect(page.getByText(DRAWER_TEXT)).not.toBeVisible();
  });

  test('view button within row opens edit drawer', async ({ page }) => {
    const viewButton = page.getByRole('button', { name: /Абдуллаева Динара/i });
    await viewButton.click();
    await expect(page.getByText(DRAWER_TEXT)).toBeVisible();
    await page.locator('button:has-text("✕")').first().click();
    await expect(page.getByText(DRAWER_TEXT)).not.toBeVisible();
  });

  test('row checkbox toggles selection without forcing drawer', async ({ page }) => {
    const checkbox = getFirstRowCheckbox(page);
    await checkbox.click();
    await expect(checkbox).toBeChecked();
    await expect(page.getByText(DRAWER_TEXT)).not.toBeVisible();
  });

  test('quick add creates a draft employee via minimal drawer', async ({ page }) => {
    await page.getByLabel('Добавить нового сотрудника').click();
    await expect(page.getByRole('heading', { name: 'Быстрое добавление сотрудника' })).toBeVisible();

    await page.getByLabel('Логин WFM').fill(QUICK_ADD_LOGIN);
    await page.getByLabel('Пароль').fill('secret1');
    await page.getByLabel('Подтверждение').fill('secret1');
    await page.getByRole('button', { name: 'Создать черновик' }).click();

    await expect(page.getByText(DRAWER_TEXT)).toBeVisible();
    await expect(page.getByText(`Логин WFM: ${QUICK_ADD_LOGIN}`)).toBeVisible();
    await page.locator('button:has-text("✕")').first().click();
  });
});
