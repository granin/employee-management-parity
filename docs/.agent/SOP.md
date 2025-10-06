# Standard Operating Procedures

## UI / Feature Work
1. Read `docs/EMPLOYEE_MANAGEMENT_PARITY_PLAN.md`, `docs/.agent/TASKS.md`, and relevant manual chapters (CH3/CH5) before coding.
2. Implement changes with accessible controls (aria labels, keyboard traps).
3. Update screenshots (`docs/SCREENSHOT_INDEX.md`) when visual states change. Store images under `docs/reference/screenshots/`.
4. Document behaviour deltas in `docs/EMPLOYEE_MANAGEMENT_PARITY_PLAN.md` and update the backlog in `docs/.agent/TASKS.md`.
5. Run `npm run build` and `npm run test`. Clean `test-results/` before committing.
6. Record testing + manual verification notes in `docs/SESSION_HANDOFF.md`.

## Playwright / Test Work
1. Prefer Playwright for end-to-end UI flows; keep selectors resilient (labels/data attributes).
2. New scenarios should assert both visual state and data changes.
3. Delete `test-results/` artefacts after running the suite.
4. Mention coverage updates in `docs/EMPLOYEE_MANAGEMENT_PARITY_PLAN.md`.

## Documentation
- `AGENTS.md` – keep smoke checklist current whenever flows change.
- `docs/TODO_AGENT.md` – reflects next focus areas after every major merge.
- `.agent` docs – update `SYSTEM.md` when modules/data evolve; revise `SOP.md` if workflow changes.

## Deployments
1. Ensure main is clean, commit with descriptive message.
2. `git push origin main`.
3. `vercel deploy --prod --yes`; capture resulting URL in handoff notes.
