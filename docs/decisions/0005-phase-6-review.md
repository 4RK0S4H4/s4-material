# 0005: Phase 6 review (demo built from the skill)

Date: 2026-10-27. Status: built, awaiting owner review.

A fresh agent built `demo/` ("Pocket Ledger") using only `skill/s4-orion/`. `check.mjs`: 0 errors, 0 warnings. Flows
tested by hand at 390 dark and 1280 light (all four views, every overlay, undo, theme controls, tabs, sortable table,
sheet validation); no console errors, no horizontal scroll.

## Fixed

| # | Finding | Fix |
|---|---|---|
| 1 | Theme controls pattern used `data-value` and the group reads the `value` attribute, so mode became "Dark" and contrast `NaN` | `patterns.md` now uses `value` |
| 2 | A compact fullscreen dialog needs both the normal headline + actions and a `.s4-dialog-bar`; the docs never said so | Dialog README (and generated `components.md`) now describe both |
| 3 | Snackbar covered a FAB that sits above the nav bar (lift only counted elements flush with the screen edge) | `snackbar.js` lifts above anything fixed in the lower half |
| 4 | Guesses the skill left open: rail FAB, list/detail split, validating before a sheet closes, search empty state vs first-run empty state, canvas charts in hidden panels, pills stretching in panes | New "Build notes" in `patterns.md` |

## Open (not fixed, for the owner)

- The checker only inspects the view visible on load; other views are not contrast-checked at runtime.
- The demo uses the container-transform dialog for bill detail at every width; the wide-screen split pattern is not shown.
- The demo has no rail FAB on desktop (the build note now says to add one).
- Playwright's reduced-transparency emulation had no effect; `data-glass="off"` was checked by computed style only.
- Reduced-motion was only partly exercised; Safari/WebKit untested (please try on the iPhone).
- Minor: sort and export icons read poorly at small sizes; KPI status pills stretch on phone.
