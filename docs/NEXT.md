# Where S4 Orion stands (resume here)

Last updated: 2026-11-07 (liquid glass: Lab 4 diagnostics, see 0012) (owner liked the demo; button groups angular again, plan reviewed; see below). **Phase 6 demo built and published; awaiting the owner's iPhone check, then release 1.0.0.** Working notes for Claude are in [`/CLAUDE.md`](../CLAUDE.md).

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
headers): **Style Lab answered and applied (0009):** Quiet Box text fields, Soft Square checkboxes, Segmented Tray tabs. **Tables undecided:** the owner wants more exploration and context (where tables appear); build a Tables Lab with tables in their real places (Activity view, phone list reflow, selection, sort) and 2-3 directions. Still open: the iPhone check (Safari: glass during container transforms, menus, new tabs). 1.0.0 waits for these.

## Style Lab 2 answers applied (2026-11-07, [0011](decisions/0011-style-lab-2.md))

Notched button groups and the centered-card phone sheet are in. Sliders and glass edge stay undecided. The owner wants to
explore liquid glass aspects to replace the blur sections. Correction to what Lab 3 implied: the WebGL engine can run over a real page if a snapshot of the DOM is the texture (the glass canvas is transparent outside the glass shapes). **[Liquid Glass Lab 4](../explore/liquid4.html)** proves that in Chromium (live DOM, SVG-foreignObject snapshot, same engine); the open risk is Safari/WebKit and keeping the snapshot fresh (animations, hover, images, fonts). If it works on the iPhone: build it as `S4.glass` for a few chrome surfaces (nav bar, toolbar, menu, dialog) with blur as fallback. **[Liquid Glass Lab 3](../explore/liquid3.html)** tries a
DOM-only way (a live copy of the content inside the glass; blurred middle, magnified rim) that should run on iPhone. Needs
the owner's pick and an iPhone check (performance, Safari). If liked: build `S4.glass` enhancement for a few chrome
surfaces (nav bar, toolbar, menu), with today's blur as the fallback. Real WebGL refraction only works over canvases.

## Owner critique round 2 (2026-11-07, earlier), see [0010](decisions/0010-owner-critique-round-2.md)

Done: no progress stop dot, pill snackbar with a quiet arrival, rounder and quieter menus, fully round tabs, sliding nav
highlight (bar and rail). **Awaiting the owner's picks in [Style Lab 2](../explore/style2.html):** button groups (unique
look), sliders (own look with glass/transparency), sheets on a phone (floating card, full page, centered card vs bottom
sheet), glass edge (CSS thick-pane rim; note real refraction over DOM is Chromium-only, so it is CSS-only here). Then
implement, record in 0011. Tables still need their own lab (owner asked for context on where tables appear).

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

- 2026-11-07 (late): Liquid Glass Lab 4 (WebGL glass over real DOM via snapshot) published for the owner's iPhone check.
- 2026-11-07 (Lab 2 answers): Notched groups + centered-card phone sheets (0011); Liquid Glass Lab 3 published. Next: owner's pick and iPhone check; sliders/glass edge undecided; Tables Lab; 1.0.0.
- 2026-11-07 (round 2): 0010 fixes shipped; Style Lab 2 published (groups, sliders, sheets, glass edge). Next: owner picks, then implement; Tables Lab; iPhone check; 1.0.0.
- 2026-11-07 (Style Lab): applied Quiet Box fields, Soft Square checkboxes, tray tabs (0009). Next: Tables Lab, iPhone check, 1.0.0.
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


## Liquid Glass workstream (2026-11-07, [0012](decisions/0012-liquid-glass-webkit.md))

Lab 4 glitched on iPhone, most likely because WebKit taints canvases that drew an SVG foreignObject. Lab 4 now shows a one-line status and falls back to plain blur. **Waiting on the owner:** open `explore/liquid4.html` on the iPhone and report the status line; then pick an option in 0012. Don't build `S4.glass` before that.

**Owner decision (2026-11-07):** real edge refraction over normal pages is not feasible on iPhone; fine to drop it. Next: **[Transparency Lab](../explore/transparency.html)** (CSS-only, now 10 options A-J: clearer panes and many thin light-catching edges; the owner wants a thin edge that catches light). Waiting on the owner's picks, then record as 0013 and apply to `glass.css` tokens (must keep the AA guarantee; re-run `check-glass`). The WebGL path stays an optional canvas-backdrop extra, not built.

**Transparency Lab 2 (2026-11-07):** the owner rejected the shiny/glowing edges (Lab 1 A-J) and wants a **super thin line, slightly more frosted than the glass**, like other apps. [Lab 2](../explore/transparency2.html) has 7 variants of exactly that. Waiting on the pick.
Owner picked a mix of C (thinness) and D (inner fade): Lab 2 now has H/I/J combos. Next: pick one, record as 0013, apply to glass.css (tokens: edge line + inner fade; re-run check-glass).
Lab 3 (transparency3.html) shows the C+D edge (H/I/J) on real Orion components with the real glass tokens. Waiting on the pick, then 0013 and glass.css.
Lab 3 reworked (2026-11-07): thin frost line only (no fade), 20-50% strengths + outer hairline, four real screens (library, menu, dialog, bottom sheet). Waiting on the pick, then 0013 and glass.css.
Lab 3 now has a Shadow toggle (default none): the owner does not want shadows under raised things; transparency must convey depth. Finding: without shadows the toolbar nearly vanishes over white content in light mode; the outer hairline option or a firmer tint there may be needed.

**Applied 2026-11-07 ([0013](decisions/0013-glass-edge-and-no-shadow.md)):** glass has a 1px 20% frost line and no shadow (shadow returns where glass is solid). Review labs: cards can be deselected. **Next:** Transparency Lab 4 (translucent items on glass: text fields, chips, rows). Open: drop shadows on cards/FAB system-wide? Ask the owner when relevant.
Lab 4 (transparency4.html) live: six treatments for items on glass (text fields, chips). Waiting on the pick; whichever wins must re-pass the glass text-contrast check (items add light fills on the glass).
Owner on Lab 4: combine D and E for items that already had an outline (outline becomes the frost line). Added as option G in Lab 4; waiting on confirmation, then apply to glass.css + extend check-glass for item fills.
Lab 4 rebuilt (owner note 2026-11-07): items keep their OWN color made translucent (70/55/40%), recessed variants deepen toward text color; only previously outlined items (fields, unselected chips, outlined buttons) get the 1px frost line. Waiting on the pick; then apply in glass.css (item rules inside glass surfaces, :where, s4.glass layer) and extend check-glass to the translucent filled buttons (on-primary text).
Lab 5 (transparency5.html): owner wants glass more frosted / calmer color (colors came through too hard). Blur and saturation do not affect the check-glass guarantee (it depends on tint + contrast/brightness squeeze only), so frostier is free; lowering tint is not. Waiting on the pick, then set --s4-glass-blur-float / saturation tokens and re-run Lab 4 items on the new glass.

**Applied ([0014](decisions/0014-calmer-glass-color.md)):** glass saturation 180% to 120% (owner picked Lab 5 B). **Next:** the owner judges Lab 4 (items on glass) on the calmer glass and picks; then apply item rules to glass.css and extend check-glass for translucent filled buttons.
Lab 4 reworked again (owner: frost lines only on a very few items, own UI stays main): items keep own design and outline, fill 70/55% translucent; D/E add a frost line on fields (and outlined button). Waiting on pick; then item rules in glass.css + check-glass for translucent filled buttons.
Lab 4 final form (owner: no outlines/frost lines on items unless outline-only with no fill): rule + What I Will Build summary on the page; waiting on owner confirmation (B vs C for outline-only items; fill 70/55/40) before building as 0015. Watch: the off switch loses its ring and nearly vanishes on glass.

**Applied 2026-11-07 ([0015](decisions/0015-items-on-glass.md)):** items on glass keep own color at full fill, no outlines at rest (outline-only items get the frost line). `--s4-glass-item-fill` is the dial (lower it only after extending check-glass to translucent filled buttons). The glass look-and-feel round is done (0013, 0014, 0015). Not decided: a faint ring on the off switch. Needs the owner's iPhone check of the real glass (gallery, demo). Then back to the other open items in this file (tables, sliders, 1.0.0).
NOTE: demo/ keeps its own copy of orion.css/orion.js; `npm run build` now regenerates them (and the ?v= stamps in demo/index.html) and `npm run check` fails if stale. It was stale until 2026-11-07.

**0016 (2026-11-07):** after the owner's iPhone check: frost line 0.5px at 28% and only on the content-facing edge of full-width bars. **Open:** the owner says the menu drop-down animation looks bad again on the iPhone; I could not reproduce it in Chromium (frames at 30% and 100% match the earlier look apart from the missing shadow). Ask what exactly looks wrong (flicker, double image, pop at the end, wrong direction) and on which menu. Prime suspect: Safari with clip-path over backdrop-filter, now without the elevation shadow that used to soften the reveal.

**0017 (2026-11-07):** all shadows removed system-wide (elevation tokens flat). Watch solid dialogs/menus (glass off, high contrast, reduced transparency) for lost edge cues.

**Menu motion (2026-11-07):** the owner remembered wanting the drop-down to feel like a container transform (0008 had it growing from the button; 0010 made it quieter, which is what ships). [Menu Motion Lab](../explore/menu-motion.html) has the real menus in three modes (`data-motion` on the menu, or `S4.menuMotion`): quiet unfold (default, today), `grow` (0008) and `transform` (S4.transition.containerTransform from the button), `transform-keep` (same, the button stays), `edge` (a strip grows out of the button edge) and `inplace` (the button shape expands into the menu as one solid piece, the button label stays as the first row; owner's latest idea). Waiting on the owner's pick, then make it the default and record as 0018. The 'bad again' report is probably this (the 0010 quieter version).

**0018 (2026-11-07):** menus emerge from underneath their button by default (owner picked D + 'from underneath, only the shape, text stays'). Waiting on the owner's iPhone look. Cache busting is automatic: `npm run build` stamps every `?v=` on local assets in `index.html`, `demo/`, `tokens/` and `explore/*.html` with the file's content hash; links sent to the owner carry `?v=<commit>`.

**0018 rebuilt (2026-11-07):** the owner's iPhone check of the first `emerge` (carried button copy): symbol moved, button changed shape for a split second, blur choppy. Rebuilt with no copy, clip-only from a lip under the button, and blur never animated. Waiting for the owner's second iPhone look.

**Safari finding (2026-11-07):** clip-path does not clip backdrop-filter in WebKit. `emerge` (menus) now animates the box instead. The **container transform for dialogs and sheets still uses clip-path over glass** and very likely has the same problem on iPhone (the owner reported it earlier as choppy). Next: the same fix there (animate the box, or keep the surface solid and unblurred while it moves and only turn on glass after landing, which it already tries), then ask the owner to check.

**Scrubber (2026-11-07):** `explore/lib/scrub.js` is one slim bar: Freeze and a slider. Tap Freeze, open a menu (it stops at 0%), drag or tap the bar to any moment and screenshot. It sits above a bottom nav if the page has one and does its own hit-testing, so open menus and modal dialogs neither close nor ignore it. The owner found earlier versions glitchy, then too complicated: keep it this simple. Add the script to any new motion lab.
