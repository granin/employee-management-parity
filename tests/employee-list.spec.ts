import { test, expect, Page } from '@playwright/test';

const ROW_SELECTOR = 'tbody tr';
const DRAWER_TEXT = 'Редактирование данных сотрудника';
const getFirstRowCheckbox = (page: Page) => page.locator('tbody tr input[type="checkbox"]').first();
const SELECTION_MODIFIER: 'Meta' | 'Control' = process.platform === 'darwin' ? 'Meta' : 'Control';

test.describe('Employee list interactions', () => {
  test.beforeEach(async ({ page }) => {
    page.on('pageerror', (error) => {
      throw error;
    });
    page.on('console', (message) => {
      if (message.type() === 'error') {
        // eslint-disable-next-line no-console
        console.error('Console error:', message.text());
      }
    });
    await page.goto('/');
    await expect(page.locator(ROW_SELECTOR).first()).toBeVisible();
  });

  test('clicking row opens drawer without toggling selection', async ({ page }) => {
    const row = page.locator(ROW_SELECTOR).first();

    await row.click();
    await expect(page.getByText(DRAWER_TEXT)).toBeVisible();
    await page.getByTestId('drawer-close-button').click();
    await expect(page.getByText(DRAWER_TEXT)).not.toBeVisible();
    await page.waitForTimeout(50);
    await expect(row).toBeFocused();
    await expect(row).not.toHaveClass(/border-l-4/);
  });

  test('view button within row opens edit drawer', async ({ page }) => {
    const viewButton = page.getByRole('button', { name: /Абдуллаева Динара/i });
    await viewButton.click();
    await expect(page.getByText(DRAWER_TEXT)).toBeVisible();
    await page.getByLabel('Закрыть').first().click();
    await expect(page.getByText(DRAWER_TEXT)).not.toBeVisible();
  });

  test('row checkbox toggles selection without forcing drawer', async ({ page }) => {
    const selectionButton = page.locator('button:has-text("Массовое редактирование")').first();
    await selectionButton.click();
    const checkbox = getFirstRowCheckbox(page);
    await expect(checkbox).toBeVisible();
    await checkbox.click();
    await expect(checkbox).toBeChecked();
    await expect(page.getByText(DRAWER_TEXT)).not.toBeVisible();
  });

  test('modifier click enters selection mode without opening drawer', async ({ page }) => {
    const secondRow = page.locator(ROW_SELECTOR).nth(1);
    const headerCheckbox = page.locator('thead input[type="checkbox"]');
    await secondRow.click({ modifiers: [SELECTION_MODIFIER] });
    await expect(headerCheckbox).toHaveCount(1);
    await expect(headerCheckbox).toBeVisible();
    await expect(page.getByText(DRAWER_TEXT)).not.toBeVisible();
    await expect(secondRow).toHaveClass(/bg-blue-50/);

    await secondRow.click({ modifiers: [SELECTION_MODIFIER] });
    await expect(secondRow).not.toHaveClass(/bg-blue-50/);
  });

  test('space key toggles selection mode for focused row', async ({ page }) => {
    const thirdRow = page.locator(ROW_SELECTOR).nth(2);
    const headerCheckbox = page.locator('thead input[type="checkbox"]');
    await thirdRow.focus();
    await page.keyboard.press('Space');
    await expect(headerCheckbox).toHaveCount(1);
    await expect(headerCheckbox).toBeVisible();
    await expect(thirdRow).toHaveClass(/bg-blue-50/);

    await page.keyboard.press('Space');
    await expect(thirdRow).not.toHaveClass(/bg-blue-50/);
  });

  test('escape exits selection mode when no overlays are open', async ({ page }) => {
    const bulkEditButton = page.locator('button:has-text("Массовое редактирование")').first();
    await bulkEditButton.click();
    const firstRow = page.locator(ROW_SELECTOR).first();
    const headerCheckbox = page.locator('thead input[type="checkbox"]');
    await firstRow.click();
    await expect(firstRow).toHaveClass(/bg-blue-50/);

    await page.keyboard.press('Escape');
    await expect(headerCheckbox).toHaveCount(0);
    await expect(firstRow).not.toHaveClass(/bg-blue-50/);
  });

  test('dismiss and restore employee updates status and visibility', async ({ page }) => {
    const employeeName = /Абдуллаева Динара/i;

    await page.locator(ROW_SELECTOR).first().click();
    await page.getByRole('button', { name: 'Уволить' }).click();
    await expect(page.getByText(/переведён в статус «Уволен»/i)).toBeVisible();

    const showInactiveToggle = page.getByRole('checkbox', { name: 'Показывать уволенных' });
    await showInactiveToggle.check();

    const employeeButton = page.getByRole('button', { name: employeeName }).first();
    await employeeButton.click();
    await expect(page.getByRole('button', { name: 'Восстановить' })).toBeVisible();
    await page.getByRole('button', { name: 'Восстановить' }).click();
    await expect(page.getByText(/восстановлен из увольнения/i)).toBeVisible();
    await expect(page.getByText(DRAWER_TEXT)).not.toBeVisible();
    await showInactiveToggle.uncheck();

    await page.locator(ROW_SELECTOR).first().click();
    await expect(page.getByRole('button', { name: 'Восстановить' })).not.toBeVisible();
    await expect(page.getByRole('button', { name: 'Уволить' })).toBeVisible();
    await page.getByTestId('drawer-close-button').click();
  });

  test('scheme history appears in edit drawer', async ({ page }) => {
    await page.locator(ROW_SELECTOR).first().click();
    await expect(page.getByText('История схем работы')).toBeVisible();
    await expect(page.getByText('Административный график', { exact: false }).first()).toBeVisible();
    await expect(page.getByText('Гибкий график').first()).toBeVisible();
    await page.getByTestId('drawer-close-button').click();
  });

  test('bulk edit drawer updates status for selected employees', async ({ page }) => {
    const bulkEditButton = page.locator('button:has-text("Массовое редактирование")').first();
    await bulkEditButton.click();

    const checkboxes = page.locator('tbody tr input[type="checkbox"]');
    await expect(checkboxes.first()).toBeVisible();
    await checkboxes.nth(0).click();
    await checkboxes.nth(1).click();

    await bulkEditButton.click();
    await expect(page.locator('#bulk-edit-status')).toBeVisible();

    const statusSelect = page.locator('#bulk-edit-status');
    await page.getByTestId('matrix-action-status-replace').click();
    await expect(statusSelect).toBeEnabled();
    await statusSelect.selectOption('vacation');
    await page.locator('#bulk-edit-comment').fill('Назначено групповое обучение');
    await page.getByRole('button', { name: 'Применить изменения' }).click();

    await expect(page.locator('tbody tr').first().getByText('В отпуске')).toBeVisible();
    await expect(page.locator('tbody tr').nth(1).getByText('В отпуске')).toBeVisible();

    const viewButton = page.getByRole('button', { name: /Абдуллаева Динара/i });
    await viewButton.click();
    await expect(page.getByText('Редактирование данных сотрудника')).toBeVisible();
    await expect(page.getByText('Назначено групповое обучение').first()).toBeVisible();
    await page.getByLabel('Закрыть').first().click();
  });

  test('bulk edit tags enforces four-tag limit', async ({ page }) => {
    const bulkEditButton = page.locator('button:has-text("Массовое редактирование")').first();
    await bulkEditButton.click();

    const firstRowCheckbox = page.locator('tbody tr input[type="checkbox"]').first();
    await firstRowCheckbox.click();

    await bulkEditButton.click();
    await page.getByTestId('matrix-action-tags-replace').click();
    await page.locator('textarea[placeholder="VIP, Новичок"]').fill('Тег 1\nТег 2\nТег 3\nТег 4\nТег 5');
    await page.getByRole('button', { name: 'Применить изменения' }).click();

    await expect(page.getByRole('alert').first()).toContainText('не более 4 тегов');
    await page.getByRole('button', { name: 'Закрыть массовое редактирование' }).click();
  });

  test('bulk edit skills and reserve skills replace entries', async ({ page }) => {
    const bulkEditButton = page.locator('button:has-text("Массовое редактирование")').first();
    await bulkEditButton.click();

    const firstRowCheckbox = page.locator('tbody tr input[type="checkbox"]').first();
    await firstRowCheckbox.click();

    await bulkEditButton.click();
    await page.getByTestId('matrix-action-skills-replace').click();
    await page.locator('textarea[placeholder="CRM, Работа с возражениями"]').fill('Тестовый навык 1\nТестовый навык 2');

    await page.getByTestId('matrix-action-reserveSkills-replace').click();
    await page.locator('textarea[placeholder="Английский, Чаты"]').fill('Резерв 1');

    await page.getByRole('button', { name: 'Применить изменения' }).click();

    await page.getByRole('button', { name: /Абдуллаева Динара/i }).click();
    await expect(page.getByText('Тестовый навык 1', { exact: false })).toBeVisible();
    await expect(page.getByText('Резерв 1', { exact: false })).toBeVisible();
    await page.getByTestId('drawer-close-button').click();
  });

  test('quick add modal restores focus to toolbar trigger on cancel', async ({ page }) => {
    const quickAddButton = page.getByTestId('toolbar-new-employee');
    await quickAddButton.click();
    await expect(page.getByRole('dialog', { name: /Быстрое добавление сотрудника/i })).toBeVisible();
    await page.getByRole('button', { name: 'Отмена' }).click();
    await expect(page.getByRole('dialog', { name: /Быстрое добавление сотрудника/i })).not.toBeVisible();
    await expect(quickAddButton).toBeFocused();
  });

  test('export tags downloads CSV with tag data', async ({ page }) => {
    await page.locator('[title="Экспортировать"]').first().click();
    await page.getByRole('button', { name: 'Теги' }).click();
    const downloadPromise = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Скачать CSV' }).click();
    const download = await downloadPromise;
    const filename = download.suggestedFilename();
    expect(filename).toContain('employees_tags');
    const stream = await download.createReadStream();
    let csv = '';
    if (stream) {
      for await (const chunk of stream) {
        csv += chunk.toString();
      }
    }
    expect(csv).toContain('Тег');
    await page.getByLabel('Закрыть экспорт').click();
  });

  test('import validation rejects unsupported tag file', async ({ page }) => {
    await page.locator('[title="Импортировать"]').first().click();
    await page.locator('button:has-text("Теги")').nth(1).click();
    await expect(page.getByText('Импорт сотрудников')).toBeVisible();

    await page.setInputFiles('input[type="file"]', {
      name: 'tags.txt',
      mimeType: 'text/plain',
      buffer: Buffer.from('sample'),
    });

    await expect(page.locator('text=Импорт «Теги» поддерживает форматы: csv').first()).toBeVisible();
    await page.getByLabel('Закрыть импорт').click();
  });

  test('import validation rejects csv with missing headers', async ({ page }) => {
    await page.locator('[title="Импортировать"]').first().click();
    await page.locator('button:has-text("Теги")').nth(1).click();
    await expect(page.getByText('Импорт сотрудников')).toBeVisible();

    const csvContent = 'login,ФИО\nuser1,Иванов Иван';
    await page.setInputFiles('input[type="file"]', {
      name: 'tags.csv',
      mimeType: 'text/csv',
      buffer: Buffer.from(csvContent, 'utf-8'),
    });

    await expect(page.locator('text=Отсутствуют обязательные колонки: Тег.').first()).toBeVisible();
    await page.getByLabel('Закрыть импорт').click();
  });

  test('import validation accepts csv with required headers', async ({ page }) => {
    await page.locator('[title="Импортировать"]').first().click();
    await page.locator('button:has-text("Теги")').nth(1).click();
    await expect(page.getByText('Импорт сотрудников')).toBeVisible();

    const csvContent = 'login,ФИО,Тег\nuser1,Иванов Иван,VIP';
    await page.setInputFiles('input[type="file"]', {
      name: 'tags.csv',
      mimeType: 'text/csv',
      buffer: Buffer.from(csvContent, 'utf-8'),
    });

    await expect(page.locator('text=Файл «tags.csv» принят для раздела «Теги»').first()).toBeVisible();
    await page.getByLabel('Закрыть импорт').click();
  });

  test('import validation rejects vacation csv with missing headers', async ({ page }) => {
    await page.locator('[title="Импортировать"]').first().click();
    const importMenuItems = page.locator('button:has-text("Отпуска")');
    await expect(importMenuItems.first()).toBeVisible();
    await importMenuItems.first().click();
    await expect(page.getByText('Импорт сотрудников')).toBeVisible();

    const csvContent = 'login,ФИО,Статус,Команда\nuser1,Иванов Иван,В отпуске,Группа поддержки';
    await page.setInputFiles('input[type="file"]', {
      name: 'vacations.csv',
      mimeType: 'text/csv',
      buffer: Buffer.from(csvContent, 'utf-8'),
    });

    await expect(page.locator('text=Отсутствуют обязательные колонки: Комментарий.').first()).toBeVisible();
    await page.getByLabel('Закрыть импорт').click();
  });

  test('import validation accepts vacation csv with required headers', async ({ page }) => {
    await page.locator('[title="Импортировать"]').first().click();
    const importMenuItems = page.locator('button:has-text("Отпуска")');
    await expect(importMenuItems.first()).toBeVisible();
    await importMenuItems.first().click();
    await expect(page.getByText('Импорт сотрудников')).toBeVisible();

    const csvContent = 'login,ФИО,Статус,Команда,Комментарий\nuser1,Иванов Иван,В отпуске,Группа поддержки,Отпуск по графику';
    await page.setInputFiles('input[type="file"]', {
      name: 'vacations.csv',
      mimeType: 'text/csv',
      buffer: Buffer.from(csvContent, 'utf-8'),
    });

    await expect(page.locator('text=Файл «vacations.csv» принят для раздела «Отпуска»').first()).toBeVisible();
    await page.getByLabel('Закрыть импорт').click();
  });
});
