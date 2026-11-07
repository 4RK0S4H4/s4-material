# Where S4 Orion stands (resume here)

Last updated: 2026-11-04 (owner liked the demo; button groups angular again, plan reviewed; see below). **Phase 6 demo built and published; awaiting the owner's iPhone check, then release 1.0.0.** Working notes for Claude are in [`/CLAUDE.md`](../CLAUDE.md).

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
| 6 | Demo built only from the skill + tokens; review against the skill; fix the skill wording where output drifted | Built 2026-10-27, awaiting owner review ([0005](decisions/0005-phase-6-review.md)) |

After Phase 6: release 1.0.0 (see "Release" below).

## Phase 6 plan (steps 1-4 done; open items are in 0005)

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

## Owner feedback on the demo (2026-10-28) and what was done

"Some animations seem glitchy; button group angles too sharp; feels unpolished." Fixed in motion.js, app.js and
button-group.css (see CHANGELOG "Fixed"). Verified in Chromium only, by pausing animations and stepping frames. **Still
needs the iPhone check**: Safari handling of `clip-path` over `backdrop-filter` (the glass sheet/dialog morph) is the
remaining suspect. If it still flickers there, the fallback is to make the surface solid for the duration of the morph.
Ask the owner which animations felt worst (sheet from the FAB, dialog, menu, view switch) if any remain.

## End-to-end review (2026-11-03) and what's next

Done in Chromium (Playwright), 390 dark and 1280 light, animations paused and stepped frame by frame: every overlay in
the demo and in the dialog/menu/sheet reference pages opened and closed (also under reduced motion), view switches,
list to detail, theme seed/mode/contrast, reduced transparency (CDP emulation: glass turns solid). Page checker clean on
the gallery, the demo and all 31 reference pages (the only hits are the deliberate colorful backdrops on the glass pages).

**Root cause of "symbols moving around" in the container transform** (fixed in `components/motion/motion.js`):
1. The surface's content sat still at its final layout while the clip window travelled across it, so icons and labels
   seemed to slide through the container. Now the whole surface travels from the source (transform + clip) and the
   content and carried label ride on it.
2. A source outside the surface's box (FAB beside a centered sheet, button below a dialog, wide row into a narrower
   dialog) could only be drawn where it overlapped the box: the morph started from the surface's edge and the label
   was clipped away. Fixed by 1, plus a spread shadow in the container color for any part reaching past the box.
3. Closing, the carried label copied the hidden source's inline `visibility: hidden`, so it never faded back and the
   real source popped in at the end.
4. Glass went see-through before its blur was on, so the page behind showed through sharp (double image). The surface
   now stays solid with no blur while the shape moves and turns to glass after landing. This also takes `clip-path`
   over `backdrop-filter` (the Safari suspect from 2026-10-28) out of the moving part entirely.
5. `oklab()`/`color-mix()` colors weren't parsed, so list rows started from the wrong color.

**Couldn't check here:** Safari/WebKit (not available in the sandbox). Everything above is Chromium only.

## Owner critique (2026-11-07), see [0008](decisions/0008-owner-critique-2026-11-07.md)

Fixed and published: faster springs, glass timing in container transforms, no white glass edge, menu toggle + menu motion,
table sort, checkbox uncheck, slider end dot. **Open:** "still looks very Material" (text fields, checkboxes, tables, tab
headers): **Style Lab built** (`explore/style.html`: text fields, checkboxes, tables, tabs; A is today). Waiting for the owner's picks, then restyle the components, add buttons/chips/sliders in a second round if wanted, record in 0009. Still needs the iPhone
check for the glass-during-transform change (Safari). 1.0.0 waits for this.

## Owner review (2026-11-04) and plan review

Owner: likes the demo; connected button groups felt too rounded (should be angular, round when selected). Done: inner
corners back to the M3 Expressive values. Also found and fixed in the review: the pinned FAB floated over list content on
desktop (rail FAB now replaces it), a trailing value + chevron stacked awkwardly, the copied label of a collapsed rail
FAB showed its hidden text during the morph; the page checker now audits every view.

Plan review: the six phases still hold; nothing in the plan needs to change except what's left before 1.0.0, which is
now short. Glass (0004) and motion decisions stand. Liquid glass stays shelved (0006).

**Next (in order):**
1. Owner: try the demo on the iPhone (FAB to sheet, row to detail, Delete All Data to dialog, menus, view switches,
   the button groups). Safari/WebKit is still unchecked by us.
2. ~~Icon Lab~~ answered 2026-11-07: menu button = Dots (done, [0007](decisions/0007-icons.md)); add/close/check glyphs
   unanswered, left boxed.
3. Release 1.0.0 (below).

Optional, not blocking 1.0.0: the wide-screen list/detail split in the demo (0005); restyle the hub with orion.css; the
labs could load `components/assets/` instead of their own copies.

## Backlog (open items, not blocking)

- Filled toggle buttons (unselected = surface-container) look faint on surface-container-low in dark mode.
- Possible tokens: connected-group gap 2px, 18dp checkbox/chip check size, switch track 52, FAB-m 80, slider handle 44.
- Container queries use literal 600/840px (var() isn't allowed in @container conditions).
- Untested in Safari/WebKit (not available in the build sandbox): container transform, `display: contents` nav pills,
  popover menus. The owner uses iOS: ask them to try the demo on their phone in Phase 6.
- The review labs in `explore/` still load their own copies of m3color/Inter; could switch to `components/assets/`.
- Future idea from the owner: try Phosphor Duotone as an alternative icon set (names.json already supports a set switch).

## Settled questions

- Name: **S4 Orion** (the repo was renamed from `s4-material` to `s4-orion`; Pages is now https://4rk0s4h4.github.io/s4-orion/). It replaces the S4 Material skill.
- S4 Glass is unrelated. The Orion skill claims "my design system" only for apps already on S4 Orion / S4 Material.
- Owner's picks so far: one seed per app, monochrome default; Inter; Solar duotone + linear mix; Title Case; stock M3
  states and M3 Expressive shapes; solid cards; M3 sizes everywhere; web only; M3 Expressive springs; container
  transform / unfold / shared axis / slide (no origin scaling); very clear 60% glass with guaranteed AA.

## Session log

- 2026-11-07 (later): owner critique fixes (0008). Next: Style Lab for a less-Material look, then iPhone check, then 1.0.0.
- 2026-11-07: repo renamed to s4-orion (links updated, skill re-packaged); Icon Lab answered, `menu` now menu-dots (0007). Next: owner's iPhone check, then 1.0.0; optional items meanwhile.
- 2026-11-04: button groups angular (M3E inner corners), rail FAB replaces pinned FABs on wide screens, list trailing value + icon in a row, checker audits all views, Icon Lab added. Next: owner's iPhone check and Icon Lab, then 1.0.0.
- 2026-11-03 (review): end-to-end review in Chromium; container transform rebuilt (content and label ride on the container, starts on the source even outside the surface's box, label fades back on close, glass solid while moving); gallery theme bar follows swatches. Next: owner's iPhone check, then 1.0.0.
- 2026-10-25: Phases 1–4 published.
- 2026-10-27: Phase 5 (skill, references, check.mjs, inline.mjs, evals, packaged `.skill`); FAB-above-nav-bar fix;
  trigger narrowed; approved by the owner, who installed the skill. Owner will continue in new sessions (different model).
- 2026-10-27: Phase 6: Pocket Ledger demo built from the skill alone, reviewed; skill/docs/snackbar fixes; hub linked. Next: owner reviews demo on iPhone, then fix the open items in 0005, run the evals (optional), release 1.0.0.
- 2026-11-03 (end): liquid glass shelved by the owner (0006 not adopted). Next: end-to-end review + bug fixing in a new session.
- 2026-11-03 (later): round 2: Material-first liquid glass (refraction + frost only), 0006 rewritten; FAB question pending.
- 2026-11-03: Liquid glass picks recorded (0006); frosted extra liquid material + Frost Level question added. Next: owner picks frost, then build into the system.
- 2026-10-31: Liquid Glass Lab built (WebGL + SVG refraction engines); awaiting owner picks and an iPhone check. Phase 6 / 1.0.0 status unchanged.
- 2026-10-28: polish pass on motion and connected button group corners after owner review (see above); demo bundle refreshed. Next: owner re-checks on iPhone, then 0005 open items, evals, release 1.0.0.
