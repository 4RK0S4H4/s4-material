# Where S4 Orion stands (resume here)

Last updated: 2026-10-27. **Phase 5 approved. Next: Phase 6.** Working notes for Claude are in [`/CLAUDE.md`](../CLAUDE.md).

## The brief (original plan, six phases)

Build S4 Orion as a versioned design system repo plus a Claude skill that applies it consistently: M3 Expressive with a
Liquid Glass–inspired transparency layer. Pause for the owner's approval after Phases 1, 3 and 5. Commit after each phase.

| Phase | What | State |
|---|---|---|
| 1 | Audit of S4 Material 1.3 and decisions | Done, approved ([0001](decisions/0001-phase-1-audit.md)) |
| 2 | Repo structure (`/tokens /components /docs /skill /demo`, README, CHANGELOG at 1.0.0) | Done ([0002](decisions/0002-repo-structure.md)) |
| 3 | Tokens (W3C JSON → tokens.css/ts/json; color light/dark/contrast, shape, type, spacing, elevation, springs, glass) | Done, approved ([0003](decisions/0003-tokens.md)) |
| 4 | Components and the glass layer (33 components, glass only on chrome, AA guaranteed, fallbacks) | Done ([0004](decisions/0004-glass.md)) |
| 5 | Rewrite the skill (SKILL.md < 500 lines, trigger, philosophy, rules, references, mistakes, worked example) | Done, approved 2026-10-27 |
| 6 | Demo built only from the skill + tokens; review against the skill; fix the skill wording where output drifted | **Next** |

After Phase 6: release 1.0.0 (see "Release" below).

## Phase 6 plan (do this next)

1. **Build the demo with only the skill.** Spawn a fresh agent (or work strictly from `skill/s4-orion/` yourself) with
   the prompt: build `demo/index.html` (+ `demo/demo.css`, `demo/demo.js` if needed) as one realistic app that uses
   every component, using only `skill/s4-orion/SKILL.md`, its `references/` and its `assets/` (copied into `demo/`).
   Suggested app: a personal finance / bills app ("Pocket Ledger") with views Overview (dashboard panes, KPIs, chart),
   Bills (search, filter chips, segmented list, FAB → bottom sheet, container transform to a detail), Activity
   (sortable table), Settings (theme controls pattern: mode, swatches, contrast; switches; destructive pane). Must
   include: menu, dialog, side sheet, snackbar with Undo, tooltips, tabs, toolbar, slider, checkbox, radio, progress,
   badge, status, divider, button group, icon buttons, nav bar + rail.
2. **Check it:** `node skill/s4-orion/scripts/check.mjs demo/index.html` → zero errors; look at both screenshots;
   also test the flows by hand in Playwright at 390 (dark) and 1280 (light): open/close every overlay, switch views,
   change theme seed/mode/contrast, reduced motion and reduced transparency emulation.
3. **Review against the skill:** go through every decision rule and the common-mistakes table in `SKILL.md` and note
   each place the demo drifted (or had to guess). Fix the **skill wording** (or `patterns.md` / component READMEs) so the
   next build wouldn't drift; fix the system only where it's a real component bug (as with the FAB inset in Phase 5).
   Record the findings in `docs/decisions/0005-phase-6-review.md`.
4. **Publish:** link the demo from the hub (`index.html`, replace the "soon" Demo card), rebuild, re-package the skill,
   update README phase table, CHANGELOG, this file; commit; push to `s4-orion` and `main`; send the owner the link.
5. Optional, if budget allows: run the three evals in `skill/s4-orion/evals/` (with and without the skill) and report.

## Release 1.0.0 (after Phase 6)

- Set the CHANGELOG date for 1.0.0, tag `v1.0.0`, re-package `skill/dist/s4-orion.skill`, tell the owner to re-download it.
- Consider restyling the hub `index.html` with orion.css (it still uses hand-written pre-Orion styles).

## Backlog (open items, not blocking)

- Filled toggle buttons (unselected = surface-container) look faint on surface-container-low in dark mode.
- `components/_example/example.js` Color group doesn't follow swatch clicks (swatches do follow the bar).
- Possible tokens: connected-group gap 2px, 18dp checkbox/chip check size, switch track 52, FAB-m 80, slider handle 44.
- Container queries use literal 600/840px (var() isn't allowed in @container conditions).
- Untested in Safari/WebKit (not available in the build sandbox): container transform, `display: contents` nav pills,
  popover menus. The owner uses iOS: ask them to try the demo on their phone in Phase 6.
- The review labs in `explore/` still load their own copies of m3color/Inter; could switch to `components/assets/`.
- Future idea from the owner: try Phosphor Duotone as an alternative icon set (names.json already supports a set switch).

## Settled questions

- Name: **S4 Orion** (repo name `s4-material` is historical). It replaces the S4 Material skill.
- S4 Glass is unrelated. The Orion skill claims "my design system" only for apps already on S4 Orion / S4 Material.
- Owner's picks so far: one seed per app, monochrome default; Inter; Solar duotone + linear mix; Title Case; stock M3
  states and M3 Expressive shapes; solid cards; M3 sizes everywhere; web only; M3 Expressive springs; container
  transform / unfold / shared axis / slide (no origin scaling); very clear 60% glass with guaranteed AA.

## Session log

- 2026-10-25: Phases 1–4 published.
- 2026-10-27: Phase 5 (skill, references, check.mjs, inline.mjs, evals, packaged `.skill`); FAB-above-nav-bar fix;
  trigger narrowed; approved by the owner, who installed the skill. Owner will continue in new sessions (different model).
