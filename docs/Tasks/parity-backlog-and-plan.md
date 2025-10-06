# Parity Backlog & Implementation Plan

Manual references: CH3 Employees, CH5 Schedule (Advanced, Shifts, Build), screenshots `image5.png`, `image8.png`, `image13.png`, `image171.png`, `image180.png`.

## Phase 1 – Bulk Edit Enhancements (Severity A/B)
1. **Matrix actions (Add/Replace/Delete)**
   - Update `src/components/EmployeeListContainer.tsx`, `src/types/employee.ts`, `tests/employee-list.spec.ts`.
   - Match manual `рис.23.11–23.13`: provide controls per field for “Добавить всем / Заменить всем / Удалить всем”.
   - Handle fields: статус, команда, схемы, навыки, резервные навыки, теги, норма часов.
   - Extend Playwright coverage with one scenario per action type.

2. **Tag manager parity**
   - Ensure modal mirrors manual (common tags, colour chips, removal badges, 4-tag limit).
   - Support add/replace/remove semantics synced with bulk edit selections.

3. **Task timeline integration**
   - Record bulk-edit comments as dated timeline entries in employee drawer.
   - Display historical tasks with newest first, allow copy-to-clipboard for agents.

## Phase 2 – Manager & Scheme UX (Severity B)
4. **Directory-backed manager picker**
   - Replace free-text manager field with searchable dropdown referencing seeded managers; support fallback entry.
   - Update manual references and Playwright to cover assignment.

5. **Work scheme history/preview**
   - Add component showing current vs historical schemes (`рис.23.2` behaviour).
   - Allow adding/removing schemes with effective dates.

## Phase 3 – Documentation & Observability (Severity C)
6. **Docs refresh after features**
   - Update parity plan, SOPs, UI walkthrough, screenshot index. Capture new screenshots for matrix actions and manager picker.

7. **Session SOP enforcement**
   - Ensure README/AGENTS highlight new doc paths (docs/SOP, docs/System, docs/Tasks).
   - Add reminders to clean `test-results/` and run smoke steps after each slice.

## Completed (06 Oct 2025)
- Seeded realistic employee dataset with extended fields.
- Converted quick add to minimal login/password plus auto drawer.
- Rebuilt toolbar with icon+label buttons.
- Added bulk edit flow for status/team/comment with Playwright coverage.
- Expanded edit drawer with scheme preferences, tasks, personnel number, actual address.
- Added agent documentation structure (SOP/System/Tasks) and UI walkthrough.
