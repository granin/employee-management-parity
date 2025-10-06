# Employee Management Overview

## UI Modules
- **Employee list (`src/components/EmployeeListContainer.tsx`)** – toolbar, filters, bulk edit, import/export, column settings, quick add trigger.
- **Employee edit drawer (`src/components/EmployeeEditDrawer.tsx`)** – required/additional blocks, scheme & skill panels, task timeline, create intro step.
- **Quick add (`src/components/QuickAddEmployee.tsx`)** – login/password stub feeding the edit drawer.
- **Demo tabs** – Photo gallery, performance metrics, status manager, certification tracker marked as demo-only.

## Data Model Highlights
- Seed data in `src/App.tsx` includes: skills, reserve skills, tags, preferences with `schemePreferences`, `personnelNumber`, `actualAddress`, `tasks` log.
- Shared types defined in `src/types/employee.ts` (ensure new fields stay in sync).

## Tests
- `tests/employee-list.spec.ts` covers row interactions, quick add, bulk edit workflow, general accessibility checks.

## References
- Manual: CH3 Employees, CH5 Schedule chapters (Advanced, Shifts, Build).
- Screenshots: see `docs/SCREENSHOT_INDEX.md` for toolbar (`image171.png`), drawer (`image180.png`), bulk edit (`image5.png`).

Keep this document updated when modules or data contracts change.
