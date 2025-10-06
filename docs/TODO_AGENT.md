# Targeted Follow-Up Tasks (Parity Delta 06 Oct 2025)

This checklist maps directly to the outstanding gaps called out in `/Users/m/Desktop/aa.md`. Work inside `~/git/client/employee-management-parity` only. Follow the Magic Prompt guidelines in `AGENTS.md` before you start a run.

## Completed 06 Oct 2025
- Seeded the employee list with 10 diverse mock profiles and updated Playwright coverage.
- Swapped quick add to the WFM-style login/password drawer and auto-opened the full edit drawer.
- Reworked toolbar to icon actions, introduced a bulk-edit stub, and switched row click to selection mode.
- Marked optional modules as demo-only and refreshed docs/tests (`AGENTS.md`, parity plan, Playwright spec).

## Next Focus Areas

### 1. Expand Employee Edit Drawer (Severity A)
- **Files**: `src/components/EmployeeEditDrawer.tsx`, `src/types/employee.ts`.
- Mirror the WFM drawer fields: shift preferences, tasks, personnel number, actual address, manager picker, etc.
- Ensure inline edit + read-only blocks match WFM layout; add missing validation and helper copy.
- Update tests to cover saving a subset of the new fields.

### 2. Bulk Actions & Tag Manager UX (Severity B)
- **Files**: `src/components/EmployeeListContainer.tsx`, `src/components/TagManager` (inline), `tests/employee-list.spec.ts`.
- Replace the bulk-edit stub with actionable controls (status changes, team transfer) or clearly scope the demo use cases.
- Align the tag manager with WFM behaviour (tag catalogue, add/remove flows, shared state with selection mode).
- Revisit selection affordances for keyboard users (focus states, helper hints).

### 3. Demo Module Scope Notes (Severity C)
- **Files**: `src/components/EmployeePhotoGallery.tsx`, `src/components/PerformanceMetricsView.tsx`, `src/components/EmployeeStatusManager.tsx`, `src/components/CertificationTracker.tsx`.
- For each demo-only module, add concise banners/tooltips explaining what is mocked versus parity-ready.
- Ensure the parity plan tracks these scopes so reviewers know they are intentionally non-parity.

### 4. Documentation & QA
- Document the next milestones in `docs/EMPLOYEE_MANAGEMENT_PARITY_PLAN.md` and surface any open questions in `SESSION_HANDOFF.md`.
- Extend Playwright coverage for bulk edit once functionality is ready.
- Standard run before handoff:
  ```bash
  npm run build
  npm run test
  npm run preview -- --host 127.0.0.1 --port 4174
  ```
  (Stop preview once manual checks are complete.)

## Reference
- Delta report: `/Users/m/Desktop/aa.md`
- Magic Prompt process: `AGENTS.md`
- Screenshot sets: `docs/reference/screenshots/**/*`

Keep the working tree clean—commit or stash between tasks so the diff history stays readable.
