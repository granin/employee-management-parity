# Employee Management Parity – Session Handoff

## 1. Context
- Repository: `~/git/client/employee-management-parity` (actively deployed to Vercel project `employee-management-parity`).
- Current state (Phase 1 complete): row clicks open the edit drawer, Ctrl/checkboxes manage selection, bulk-edit matrix mirrors WFM, tag manager is fully interactive, and task timelines capture bulk/manual notes.
- Latest production deploy: `https://employee-management-parity-9o205nrhz-granins-projects.vercel.app` (run `vercel deploy --prod --yes` from this repo for future releases).
- Evidence store: Desktop reports (`~/Desktop/2025-10-06_*.md`, `~/Desktop/2025-10-07_09-00_comprehensive-validation-report.markdown`), CH3/CH5/CH7 manuals, screenshot library (`docs/SCREENSHOT_INDEX.md`).
- Local verification this session: `npm run build`, `npm run test -- --reporter=list --project=chromium --workers=1`.

## 2. Required Reading Before Implementation
1. `docs/EMPLOYEE_MANAGEMENT_PARITY_PLAN.md` – roadmap/evidence inventory.
2. `docs/Tasks/parity-backlog-and-plan.md` – backlog & phase sequencing.
3. `docs/PRD_STATUS.md` – status of all PRDs; review `docs/SOP/prd-feedback-sop.md` for the conversion workflow.
4. `docs/SOP/ui-walkthrough-checklist.md` – validation steps (focus traps, matrix actions, exports, timeline checks).
5. Browser-agent parity report (`docs/AGENT_PARITY_REPORT.md`) and the latest bb audit on Desktop.
6. Required manuals/screenshots (CH3 Employees, CH5 Schedule*, CH7 Appendices, `docs/SCREENSHOT_INDEX.md`).
7. Phase 4 task list (`docs/Tasks/phase-4-accessibility-and-final-parity.md`) for detailed next steps.
8. `docs/TODO_AGENT.md` for focused follow-up items and command reminders.

## 3. Snapshot of Current Code
- `App.tsx`: Seeds employees with structured `EmployeeTask` timelines and work-scheme history samples, registers a global helper for quick-add (used by tests), and wires the tabbed shell (nav labels no longer carry “демо”).
- `EmployeeListContainer.tsx`: Production-style grid with filters (Esc shortcut), selection-mode toggle, dismiss/restore workflow, always-enabled tag manager, column settings, CSV/Отпуска/Теги exports, add/replace/remove matrix actions, tag-cap enforcement (≤4), extended import validation (extension + header checks), and focus restoration for every overlay trigger.
- `EmployeeEditDrawer.tsx`: Required/optional sections aligned with CH3; dismiss/restore controls append system timeline badges alongside manual/bulk edits; scheme history section renders read-only timeline of assignments; close button exposes a stable test id.
- `QuickAddEmployee.tsx`: Minimal login/password flow with validation, shared focus trap, labelled dialog semantics, and timeline defaults built via a shared task helper.
- `src/hooks/useFocusTrap.ts`: Shared trap utility used across all overlays (bulk edit, tag manager, column settings, quick add, edit drawer).
- `src/utils/task.ts`: Shared helper for timeline entries (manual/bulk/system sources).
- Tests (`tests/employee-list.spec.ts`): cover row/drawer parity, dismiss/restore, quick-add accessibility, tag export download, selection-mode entry, tag limit enforcement, and import validation (extension + header error + happy path).
- Deploy script is manual via Vercel CLI; ensure build/test succeed before promoting.

## 4. Evidence Checklist (complete before new work)
- [ ] Parity plan & backlog reviewed (`docs/EMPLOYEE_MANAGEMENT_PARITY_PLAN.md`, `docs/Tasks/parity-backlog-and-plan.md`).
- [ ] PRD index inspected (`docs/PRD_STATUS.md`); confirm which PRD you are updating/creating.
- [ ] Latest browser-agent output/bb report triaged; conflicts noted.
- [ ] Relevant manuals/screenshots opened for reference.
- [ ] SOPs consulted (`docs/SOP/prd-feedback-sop.md`, `docs/SOP/standard-operating-procedures.md`, `docs/SOP/ui-walkthrough-checklist.md`).

## 5. Implementation TODO (Forward Plan)
1. **Phase 4 – Accessibility & polish**: run NVDA/VoiceOver pass across selection mode, bulk edit, tag manager, import/export, quick add, and edit drawer; capture findings + fixes in this handoff.
2. **Phase 4 – Matrix/Import coverage**: extend Playwright scenarios for skills/reserve add/remove, and remaining CSV templates (employees/skills/schemes) per Appendix references.
3. **Docs & screenshots**: refresh walkthrough/plan/SOPs after each slice, capture updated screenshots (selection mode, tag manager alert), and log parity deltas in the PRD.
4. **Agent Loop**: after each slice, rerun the walkthrough, capture screenshots, update PRDs + status index, refresh `docs/SESSION_HANDOFF.md`.

## 6. Working Agreement
- Every new browser-agent delta must flow through `docs/SOP/prd-feedback-sop.md`: update or create PRD, log status (`docs/PRD_STATUS.md`), and document evidence in the PRD.
- Keep `docs/SOP/ui-walkthrough-checklist.md` and screenshot index aligned with UI changes.
- Run `npm run build` and `npm run test -- --reporter=list --project=chromium --workers=1` locally before committing or deploying.
- Only run `npm run preview -- --host 127.0.0.1 --port 4174` when requested by the repo owner; stop the server once checks finish.
- Document deployments (URL + purpose) in this handoff and/or parity plan.

## 7. Contact & Escalation Notes
- Legacy reference deployment: `https://employee-management-sigma-eight.vercel.app` (read-only).
- Production parity deployment: `https://employee-management-parity-9o205nrhz-granins-projects.vercel.app`.
- Coordinate credential usage (GitHub/Vercel) with the team; no direct pushes to `main` without approval.
- Log unresolved questions or blockers in `docs/SESSION_HANDOFF.md` under a new “Open Questions” sub-section if needed.
