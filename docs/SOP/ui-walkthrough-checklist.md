# UI Walkthrough Checklist

Use this script to validate the parity demo in a browser session or with Playwright. Manual references: CH3 Employees (`/Users/m/Documents/.../CH3_Employees.md`), CH5 Schedule chapters, screenshots noted in `docs/SCREENSHOT_INDEX.md`.

## 0. Prep
- Open latest Vercel deployment or run `npm run preview -- --host 127.0.0.1 --port 4174`.
- Log in with `user20082025` / `user20082025` if prompted.
- Set viewport ≥ 1440×900 to match reference screenshots.

## 1. Toolbar & Filters (`image171.png`)
- Confirm button order and labels:
  1. Скрыть/Показать фильтры
  2. Массовое редактирование
  3. Теги
  4. Импорт
  5. Экспорт
  6. Колонки
  7. Новый сотрудник
- Toggle filters, verify counter (e.g., `9/10`), and check keyboard navigation (`Tab`, `Space`, `Esc`).

## 2. Row Selection & Drawer (`image180.png`)
- Click row → checkbox toggles, drawer stays closed.
- Press `Space` when row focused to toggle selection.
- Click employee name to open edit drawer; close with `Esc`.

## 3. Quick Add
- Open “Новый сотрудник”, fill login/password, submit. Drawer opens in create mode.
- Test validation (empty login). Continue to full drawer and note seeded defaults.

## 4. Edit Drawer Blocks
- Required fields: modify value, confirm validation.
- Additional fields: tags, scheme preferences, personnel number, actual address, tasks timeline.
- Save and confirm table reflects changes.

## 5. Bulk Edit (`image5.png`)
- Select two rows, open bulk edit.
- Change status to “В отпуске”, team to another value, add comment.
- Submit, expect success banner + row updates + new task entry.
- Negative: open drawer without changes, check error message.

## 6. Tag Manager (`image8.png`)
- With selections active, open tags modal.
- Add new tag, mark one for removal, apply; verify chips update.

## 7. Import / Export (`image13.png`)
- Open import modal, confirm checklist.
- Trigger export, ensure CSV download and column order respects visibility.

## 8. Column Settings
- Toggle column visibility, save, verify table update, close with `Esc`.

## 9. Demo Tabs
- Each tab (“Фото галерея (демо)”, etc.) shows “Демонстрационный модуль”.
- Photo gallery filters respond; performance tab toggles modes.

## 10. Accessibility
- Focus outline visible on toolbar buttons.
- Drawers/modals trap focus, close on `Esc`.
- Selection announcer (`aria-live`) reports current count.

Log discrepancies in `docs/SESSION_HANDOFF.md` and raise new tasks in `docs/Tasks/parity-backlog-and-plan.md`.
