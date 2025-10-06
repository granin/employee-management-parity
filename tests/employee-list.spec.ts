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

  test('bulk edit drawer updates status for selected employees', async ({ page }) => {
    const checkboxes = page.locator('tbody tr input[type="checkbox"]');
    await checkboxes.nth(0).click();
    await checkboxes.nth(1).click();

    const bulkEditButton = page.locator('[aria-label="Открыть массовое редактирование"]').first();
    await expect(bulkEditButton).toBeEnabled();
    await bulkEditButton.click();
    await expect(page.locator('#bulk-edit-status')).toBeVisible();

    await page.getByLabel('Новый статус').selectOption('vacation');
    await page.getByLabel('Комментарий / задача').fill('Назначено групповое обучение');
    await page.getByRole('button', { name: 'Применить изменения' }).click();

    await expect(page.locator('tbody tr').first().getByText('В отпуске')).toBeVisible();
    await expect(page.locator('tbody tr').nth(1).getByText('В отпуске')).toBeVisible();
  });
});
