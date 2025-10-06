# End-to-End UI Walkthrough

Use this script when validating the parity demo in a browser session (Playwright agent or manual). Follow the sequence to ensure every major interaction behaves like the WFM manual (CH3 Employees, CH5 Schedule). Screenshot aliases refer to `docs/SCREENSHOT_INDEX.md`.

## 0. Environment Prep
1. Open the latest Vercel deployment (see `SESSION_HANDOFF.md` for URL) or run `npm run preview -- --host 127.0.0.1 --port 4174` locally.
2. Authenticate with OIDC (`user20082025` / `user20082025`) if prompted.
3. Ensure the viewport is at least 1440×900 so layouts match reference screenshots (`image171.png`, `image180.png`).

## 1. Employee List Toolbar & Filters
- Confirm the header reads “Сотрудники” with the description underneath (`image171.png`).
- Verify toolbar buttons (icon + label):
  1. **Скрыть/Показать фильтры** – click to toggle the filter panel; press `Tab` then `Space` to check keyboard support.
  2. **Массовое редактирование** – remains disabled until at least one row is selected.
  3. **Теги** – opens the tag manager (disabled when no rows selected).
  4. **Импорт** – opens the import dropdown; press `Esc` to close.
  5. **Экспорт** – opens export dropdown; ensure options match manual (`рис.24`).
  6. **Колонки** – opens column settings drawer; use `Tab` to reach checkboxes.
  7. **Новый сотрудник** – launches quick add.
- Filters panel: expand it and tab through Search → Команда → Статус → etc. Toggle “Показывать уволенных” and confirm counter updates (e.g., `9/10`).

## 2. Row Selection & Drawer
- Click the first row; checkbox becomes checked, drawer stays closed (per parity).
- Press `Space` while the row is focused to toggle selection (keyboard support).
- Click the employee name button to open the edit drawer (should highlight matching data per `image180.png`).
- Close with `Esc` or the “✕” button.

## 3. Quick Add Flow
1. Click **Новый сотрудник**.
2. In the modal (`image180.png`), tab through:
   - `Логин WFM` – enter `demo.agent`.
   - `Пароль`, `Подтверждение` – enter the same string (≥6 chars).
3. Press `Enter` on “Создать черновик”. Drawer opens in create mode with the intro step.
4. Verify required field warnings appear if `Продолжить` is clicked with empty логин.
5. Fill the introduction step, continue to full drawer; confirm defaults (e.g., scaffolded address, tasks).

## 4. Edit Drawer Mandatory + Additional Blocks
- Navigate required fields (`Обязательные поля`): update a value to confirm validation.
- In `Дополнительные поля`, check:
  - Tags input + real-time tag chips (`рис.23.9`).
  - Preferences fields for shifts and scheme preferences (new additions).
  - Personnel number, actual address, tasks textarea (tasks list should show seeded items).
- Scroll to the bottom and press `Tab` to ensure focus moves to “Отмена” then “Сохранить изменения”.
- Save and confirm the table reflects changes (e.g., updated status, team, tasks timeline).

## 5. Bulk Edit Workflow
1. Select at least two employees (first two rows).
2. Click **Массовое редактирование**. Drawer opens talking about selected count.
3. Change:
   - Status → “В отпуске”.
   - Team → choose another team from dropdown.
   - Comment → “Назначено групповое обучение”.
4. Submit. Expect success toast above table and rows to update (status badge + tasks timeline).
5. Negative case: open drawer with no changes and confirm error message.

## 6. Tag Manager
1. Select multiple employees with existing tags.
2. Click **Теги** → ensure modal lists common tags and colour chips (`image8.png`).
3. Add a new tag, mark one for removal, apply.
4. Confirm chips update in the drawer for each employee.

## 7. Import & Export Modals
- **Импорт** → choose “Сотрудника”, open modal, ensure checklist matches manual (`рис.24`). Use dummy file selection (no upload executes).
- **Экспорт** → open modal, trigger CSV download, verify file name `employees_export_*`. Cross-check column order respects visibility.

## 8. Column Settings Drawer
- Open via **Колонки**.
- Toggle a column (e.g., “Дата найма”), save, and confirm table updates.
- Press `Esc` to close drawer.

## 9. Demo Tabs
- Switch to each tab and confirm badge “Демонстрационный модуль” displays.
- Photo gallery: filters respond, badges visible.
- Performance metrics: tab toggle (Обзор/Детали/Сравнение) works.
- Status manager & Certification tracker show banners + primary CTA disabled where appropriate.

## 10. Accessibility Quick Checks
- Ensure focus outline is visible when tabbing through toolbar buttons.
- Verify each modal/drawer traps focus and closes with `Esc`.
- Confirm `aria-live` region announces selection changes (inspect using screen reader if possible).

## References
- Manual screenshots: `image171.png`, `image180.png`, `image5.png`, `image13.png`, `image8.png`.
- Manual text: CH3 Employees (sections on quick add, edit drawer, bulk edit). CH5 Schedule (context for schemes/skills).

Document discrepancies in `docs/SESSION_HANDOFF.md` and raise new tasks in `docs/.agent/TASKS.md` when behaviour diverges.
