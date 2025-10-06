# Employee Management Parity Plan

## 1. Purpose
- Align the `employee-management` demo with the real WFM Employee Management module so the UI can serve as an executable specification for back-end work.
- Provide a checklist and evidence map that browser agents can follow without context loss.
- Keep all build tooling (Vite config, npm scripts) untouched until the UI/ref data updates are complete and verified.

## 2. Evidence Inventory
- **Parity report** (browser agent output): `docs/AGENT_PARITY_REPORT.md` (mirrored from original `/home/oai/share/report.md`).
- **Internal documentation** (chapter extracts used by browser agent):
  - `/Users/m/Documents/replica/CH3_Employees.pdf`
  - `/Users/m/Documents/replica/CH5_Schedule_Advanced.pdf`
  - `/Users/m/Documents/replica/CH5_Schedule_Build.pdf`
  - `/Users/m/Documents/replica/CH6_Reports.pdf`
  - `/Users/m/Documents/replica/orchestrator/argus/imports/code/CH7_Appendices.md`
- **Screenshots** – see `docs/SCREENSHOT_INDEX.md` for alias ↔ filename mapping (all images live in `~/Desktop/shots epml mamgnt/`).
- **Prototype screenshots** (current mock UI in this repo, `~/Desktop/Screenshot 2025-10-05 ...`; open before coding to match spacing/labels):
  - `Screenshot 2025-10-05 at 21.46.05.png` – Quick-add modal step 1; shows progress tracker (1→3), required personal fields (Имя, Фамилия, Email, Телефон) and CTA copy («Далее», «Отмена»). Use as baseline when extending later steps.
  - `Screenshot 2025-10-05 at 21.46.01.png` – Performance dashboard mock; note KPI card order, goal captions, tab toggle (Обзор/Детали/Сравнение), sort dropdown text, and Chart.js placeholder wording.
  - `Screenshot 2025-10-05 at 21.45.57.png` – Photo gallery mock; confirms filter labels, settings toggles (Имена/Должности/Команды/Статусы) and stats footer layout.
  - `Screenshot 2025-10-05 at 21.45.54.png` – Photo gallery skeleton state; keep for loading UX parity.
- **Live product URLs** (require auth):
  - Base: `https://wfm-practice51.dc.oswfm.ru/`
  - Employees: `/employee`
  - Schedule graph: `/schedule/graph`
  - Shifts: `/schedule/shifts`
  - Schemes: `/schedule/schemes`
  - Requests: `/schedule/requests`
  - Reports: `/reports` (and subpaths)

## 3. Current Toolchain Status
- Repo path: `~/git/client/naumen/employee-management`
- Environment fix completed (proxy exports removed); `npm install`, `npm run build`, and `npm run preview -- --host 127.0.0.1 --port 4173` all succeed.
- Deployment flow: mirror this folder into `~/git/client/employee-management-parity` (GitHub repo `granin/employee-management-parity`) which is linked to the Vercel project of the same name.
- Build artefacts (`dist/`, `node_modules/`, `.vercel/`) remain ignored; run `npm install` after every fresh clone before invoking `npm run build`.

## 4. Current Implementation Snapshot (Code Audit)
- `src/App.tsx` renders the primary navigation (`Список сотрудников`, `Фото галерея (демо)`, `Показатели (демо)`, `Статусы (демо)`, `Сертификации (демо)`, `Навыки (демо)`) and hosts the global quick-add drawer. Demo tabs now expose explicit badges so parity reviewers know they are placeholders.
- `EmployeeListContainer.tsx` presents the full employee table with filters, icon toolbar (bulk edit/tag/import/export), selection state, and the edit drawer. Bulk edit currently opens a stub describing the upcoming flow.
- `QuickAddEmployee.tsx` mirrors WFM’s minimal flow (login + password), seeds a draft employee, and drives the edit drawer for the follow-up fields.
- `EmployeePhotoGallery.tsx`: fully styled gallery with filters, settings, statistics; currently backed by the same single mock employee dataset.
- `PerformanceMetricsView.tsx`: renders KPI cards, ranking table, and chart placeholder with random trend values; requires real data integration and alignment with actual reports.
- Supporting components (`EmployeeStatusManager`, `CertificationTracker`, etc.) still placeholders (to be reviewed later).
- `src/types/employee.ts` defines extensive data models but duplicates `ViewModes` and `BulkAction` at the bottom; cleanup needed when refactoring.

### Progress – 06 Oct 2025 parity sweep
- Seeded a realistic dataset of 10 mock employees with varied statuses/teams for list exercises.
- Converted quick add to the WFM-style minimal drawer (логин + пароль) and auto-open the full edit drawer for the new draft.
- Reworked the employee list toolbar to icon buttons, added a bulk-edit stub, and switched row click to selection mode while exposing the edit drawer via the name button.
- Labeled non-parity modules (галерея, показатели, статусы, сертификации, навыки) as demo-only so testers understand the current scope.


## 5. Feature Backlog (Delta vs Reality)
| Area | Target (Reality) | Current Mock | Evidence | Required Actions |
| ---- | ---------------- | ------------ | -------- | ---------------- |
| Row interaction & edit drawer | Row click opens drawer (obligatory + optional sections, edit/save/cancel, skills/tags panels) | Row click reloads page; drawer accessible only via direct import | Screenshots `638f...`, `6427...`; CH3 Employees | Wire row click + “Новый сотрудник” CTA to `EmployeeEditDrawer`; pre-fill data; stub save/reset actions |
| Tag management | Dedicated modal to create/assign/remove tags; updates list filters | Info modal only; no assignment | Screenshot `1a43...`; Appendix 6 | Implement mock tag CRUD + assignment state; persist for selected employees |
| Import / Export | File chooser for imports, downloadable CSV/XLSX respecting column visibility | Info modal only | Appendix 1/3/4/8 | Provide stubbed uploads (accept file, show success toast) & CSV download mirroring template headers |
| Quick Add step 3 | Org unit / office / time zone / hour norm editable; wizard advances | Inputs disabled; validation blocks progress | CH3 Quick Add; screenshots `638f...`, `6427...` | Enable fields, set sensible defaults from team, ensure validation passes |
| Quick Add credentials | Suggested WFM login derived from names; external logins captured | Always `ivanov.il`; external logins empty | CH3 Quick Add | Generate login from form data (transliteration), allow edit, capture external logins list |
| Quick Add completion | On success, summary shows data; employee added to list | Wizard cannot finish | Same as above | After step 4, push new mock employee into list state; show success toast |
| Skills UX | Display/prioritise skills & reserve skills; edit modals | Static text only | CH3 Employees; Appendix 3 | Render read-only pills in drawer + quick add summary; add placeholder edit modal with mock state |
| Toolbar persistence | Column visibility, dismissed toggle, active filter chips persist | Works per session only | Screenshots `1a43...` | Store settings in localStorage; display active filter chips matching real UI |
| Optional modules | Clarify status of Photo Gallery / Performance pages | Present as custom dashboards | Prototype screenshots | Document as demo-only until backend scope defined |

### Screenshot Parity Notes (2025-10-06 review)
- Toolbar baseline (`employee-toolbar-topbar.png`): dark header, icon order (display settings → tags → import → export), `51/51` counter, zebra rows, “Показывать уволенных” checkbox.
- Column picker drawer (`reference/column-picker-drawer.png`): title copy, field checklist, “Сохранить изменения” CTA.
- Employee drawer (`reference/edit-drawer-required-fields.png`, `reference/edit-drawer-optional-fields.png`, `reference/drawer-tags-detail.png`): split sections, inline tags render, skills/reserve skills summaries.
- Loading cues (`reference/employee-module-loader.png`, `edit-employee-loading.png`): semi-transparent overlay with spinner while list/drawer loads data.
- Import/export modals (`import-modal.png`, `export-modal.png`) and tag dialog (`tags-modal.png`) confirm current stub copy is aligned.

## 6. Prioritised Phases
1. **Employee card wiring**
   - Connect list row + “Новый сотрудник” CTA to `EmployeeEditDrawer` (mock save/cancel, tag/skill placeholders).
   - Ensure drawer highlights required vs optional blocks per real screenshots.
2. **Toolbar interactions**
   - Implement functional tag modal and import/export stubs; persist column/dismissed state.
3. **Quick add completion**
   - Fix Step 3 validation, improve login generation, render summary, append new mock employee on success.
4. **Skills presentation**
   - Expose skills/reserve skills read-only pills + placeholder edit modals in drawer and wizard summary.
5. **Agent feedback loop**
   - Rename screenshots for side-by-side comparisons; craft explicit checklist for next browser-agent run.

## 7. Agent Workstreams (next run)
- **Side-by-side delta check:** Require agents to open the real system and the new Vercel build in parallel, capture each screen (list, drawer, quick add steps, toolbar modals) and note only residual differences.
- **Evidence refresh:** If gaps remain, capture updated screenshots/templates to drop into the screenshot index for developers.
- **Golden journeys:** Re-run once the above blockers are addressed to confirm flows (create → edit → schedule → report).

## 8. Implementation Cadence
- Work in focused branches per phase (e.g., `feature/drawer-wiring`, `feature/quick-add-finish`).
- For each slice: update UI → `npm run build` → capture screenshots (store under meaningful names) → update docs → commit.
- Deploy to `employee-management-parity` Vercel project after each major slice; keep change log for agent handoff.

## 9. QA Checklist (expand per feature)
- [ ] Row click + “Новый сотрудник” open the edit drawer with correct data.
- [ ] Drawer save/cancel shows validation errors for required fields.
- [ ] Tag modal adds/removes tags and updates filter chips.
- [ ] Import modal accepts a file and reports success (no backend call).
- [ ] Export creates CSV with correct headers respecting column visibility.
- [ ] Quick add drawer (логин/пароль) creates a draft employee and opens the edit drawer.
- [ ] Drawer exposes required fields (Фамилия/Имя/Отчество/Логин WFM/Пароль/Оргструктура/Норма часов) with validation.
- [ ] Tag manager adds/removes tags across the current selection.

## 10. Open Questions
- Do we retain Photo Gallery and Performance tabs as custom additions?
- Which backend endpoints will be available first (employees CRUD, tags, import/export)?
- Do we have direct access to download templates from production system? (Appendix references listed.)
- Authentication process for agent testing on real system?
- How do CE MAGIC PROMPTS & HUMAN_LAYER scripts influence task execution?

## 11. Magic Prompt / Human Layer Integration
- Review orchestration guides before starting browser-agent runs:
  - `/Users/m/Downloads/sort later desktop/HUMAN_LAYER_COMPLETE.md`
  - `/Users/m/Documents/replica/orchestrator/argus/imports/code/CE_MAGIC_PROMPTS/EXECUTE-WITH-MAGIC-PROMPT.md`
  - `/Users/m/Documents/replica/orchestrator/argus/imports/code/CE_MAGIC_PROMPTS/PLAN-USING-MAGIC-PROMPT.md`
  - `/Users/m/Documents/replica/orchestrator/argus/imports/code/CE_MAGIC_PROMPTS/RESEARCH-FOLLOWING-MAGIC-PROMPT.md`
  - `/Users/m/Documents/replica/orchestrator/argus/imports/code/CE_MAGIC_PROMPTS/SIMPLE-INSTRUCTIONS.md`
- Incorporate any mandatory steps/macros/logging formats from these docs into agent task templates.

## 12. Next Immediate Steps
1. Confirm screenshot interpretations in Section 2 against parity report.
2. Clean proxy settings and confirm npm toolchain works.
3. Begin Phase 2: define shared form models and mock data.
4. Draft agent task templates using MAGIC PROMPTS/HUMAN_LAYER guidance.
