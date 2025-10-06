# Targeted Follow-Up Tasks (Parity Delta 06 Oct 2025)

This checklist maps directly to the outstanding gaps called out in `/Users/m/Desktop/aa.md`. Work inside `~/git/client/employee-management-parity` only. Follow the Magic Prompt guidelines in `AGENTS.md` before you start a run.

## Completed 06 Oct 2025
- Seeded the employee list with 10 diverse mock profiles and updated Playwright coverage.
- Swapped quick add to the WFM-style login/password drawer and auto-opened the full edit drawer.
- Reworked toolbar to icon actions, introduced a bulk-edit stub, and switched row click to selection mode.
- Marked optional modules as demo-only and refreshed docs/tests (`AGENTS.md`, parity plan, Playwright spec).
- Expanded the edit drawer with WFM-only fields (смены, схемы, задачи, номер) and tuned the create intro flow.
- Delivered a functional bulk-edit drawer (status/team + комментарий) with optimistic updates and test coverage.

## Next Focus Areas

### 1. Manager Directory & Picker (Severity B)
- **Files**: `src/components/EmployeeEditDrawer.tsx`, `src/types/employee.ts`.
- Replace the free-text manager field with a searchable selector backed by the seeded teams/mentors.
- Surface helper copy for cases where the manager is outside the current directory.
- Extend tests to cover manager reassignment.

### 2. Tag Manager Enhancements (Severity B)
- **Files**: `src/components/EmployeeListContainer.tsx`, inline tag manager section.
- Introduce quick filters (по цвету/по тегу) and ensure removal badges are announced via `aria-live`.
- Persist the tag catalogue between sessions so agents keep curated colors.

### 3. Tasks Timeline & Notes (Severity C)
- **Files**: `src/components/EmployeeEditDrawer.tsx`, `src/App.tsx`.
- Render the task list as a timeline with created/updated timestamps and allow reordering (drag handles optional).
- Add unit extenders so new bulk-edit comments display immediately in the drawer.

### 4. Documentation & Observability
- Update `SESSION_HANDOFF.md` with new bulk-edit + drawer flows.
- Capture fresh screenshots for the screenshot index once timelines/manager picker are live.
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
