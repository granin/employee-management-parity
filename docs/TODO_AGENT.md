# Targeted Follow-Up Tasks (Post 9o205nrhz Validation)

This checklist summarises the outstanding gaps from the comprehensive parity review (`~/Desktop/2025-10-07_09-00_comprehensive-validation-report.markdown`). Work inside `~/git/client/employee-management-parity` only. Follow the Magic Prompt guidelines in `AGENTS.md` before starting.

## Completed to Date
- Phase 1 (Bulk edit & tag parity) – dataset expansion, quick add login/password flow, toolbar + edit drawer parity.
- Phase 2 (Interaction polish) – selection mode, scheme history readout, dismiss/restore parity, navigation labels aligned.
- Phase 3 (CRUD/data parity) – bulk-edit matrix across all sections, tag-cap enforcement, import validation (extensions + headers), Playwright coverage for selection/tags/imports.

## Outstanding Work – Phase 4 Focus

### 1. Accessibility Sweep (Severity A)
- **Files**: `src/components/EmployeeListContainer.tsx` (overlays), `src/components/EmployeeEditDrawer.tsx`, `src/components/QuickAddEmployee.tsx`, `src/hooks/useFocusTrap.ts`.
- Run NVDA/VoiceOver across filters, edit drawer, bulk edit, tag manager, import/export, quick add.
- Capture findings + fixes in `docs/SESSION_HANDOFF.md` and update SOPs with any copy/focus notes.

### 2. Bulk Edit Matrix Coverage (Severity B)
- **Files**: `src/components/EmployeeListContainer.tsx:1100-1280`, `tests/employee-list.spec.ts:169-230`.
- Extend Playwright to cover add/remove flows for skills and reserve skills, ensuring timeline comments remain intact.
- Confirm error messages for empty submissions and tag-limit violations remain accessible (`aria-live`).

### 3. Import / Export Templates (Severity B)
- **Files**: `src/components/EmployeeListContainer.tsx:1490-1640`, `tests/employee-list.spec.ts:219-300`.
- Validate Appendix templates beyond Теги/Отпуска (employees, skills, schemes). Add tests where feasible; document manual steps otherwise.

### 4. Documentation & Evidence Refresh (Severity C)
- Update `docs/AGENT_PARITY_REPORT.md`, `docs/EMPLOYEE_MANAGEMENT_PARITY_PLAN.md`, `docs/SESSION_HANDOFF.md`, and SOPs with Phase 4 results.
- Archive legacy Desktop reports (see `/Users/m/Desktop/2025-10-06_*.md`) with a “pre-Oct 07” banner and link forward to the comprehensive report.
- Append new screenshots (selection banner, dismiss/restore timeline, tag alerts) to `docs/SCREENSHOT_INDEX.md` with Desktop aliases.

## Operational Checklist
```bash
npm run build
npm run test -- --reporter=list --project=chromium --workers=1
# Run preview only on request: npm run preview -- --host 127.0.0.1 --port 4174
```

## Reference Materials
- Phase 4 task detail: `docs/Tasks/phase-4-accessibility-and-final-parity.md`
- Comprehensive validation report: `~/Desktop/2025-10-07_09-00_comprehensive-validation-report.markdown`
- Previous audits (now archived): `~/Desktop/2025-10-06_*` (link from `docs/Archive/` after facelift)
- Magic Prompt process: `AGENTS.md`
- Environment guardrails: `docs/ENVIRONMENT_FIX_TODO.md`

Maintain a clean working tree—commit or stash between slices so the diff history stays readable.
