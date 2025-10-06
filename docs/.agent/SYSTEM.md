# System Overview

## UI Modules
- **Employee list (`src/components/EmployeeListContainer.tsx`)** – Table with filters, toolbar (filters, bulk edit, tags, import/export, columns, quick-add). Selection drives bulk edit flows.
- **Employee edit drawer (`src/components/EmployeeEditDrawer.tsx`)** – Required/additional blocks with WFM-specific fields (schemes, skills, tasks, personnel number). Auto-opens after quick add.
- **Quick add drawer (`src/components/QuickAddEmployee.tsx`)** – Minimal login/password flow that seeds a draft employee and triggers the full edit drawer.
- **Demo tabs** – Photo gallery, performance, status manager, certification tracker remain marked “Демонстрационный модуль”.

## Data Model
- Employees seeded in `src/App.tsx` with rich metadata: skills, reserve skills, tags, preferences, scheme preferences, personnel numbers, task log.
- Shared types in `src/types/employee.ts` now include `personnelNumber`, `actualAddress`, `tasks`, `preferences.schemePreferences`.

## Tests
- Playwright suite in `tests/employee-list.spec.ts` covers: row interactions, quick add, bulk edit happy path.

## Manual References
- CH3 Employees (`/Users/m/Documents/replica/estimation/processing_manual/process/chapters/CH3_Employees.md`)
- CH5 Schedule Advanced / Shifts / Build (`/Users/m/Documents/replica/estimation/processing_manual/process/chapters/CH5_*`)
- Screenshot anchors noted in `docs/SCREENSHOT_INDEX.md` (e.g., `image171.png` for toolbar, `image5.png` for bulk edit matrix).

## Environments
- Local: `npm run preview -- --host 127.0.0.1 --port 4174`
- Production: Vercel project `employee-management-parity` (see latest URL in deployment log).

Keep this file updated when new modules or data fields are introduced.
