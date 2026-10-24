# 0001: Phase 1 audit of S4 Material 1.3.x and the S4 Orion decisions

Status: accepted (the glass backdrop is decided in Phase 4)
Date: 2026-10-24

S4 Orion is the successor to the **S4 Material** skill (1.3.x). It's a leaner rebuild with the same lineage: Material 3 Expressive as the foundation and a glass layer as the personal change. **S4 Glass** stays a separate look and isn't part of Orion.

## What S4 Material 1.3.x is

- `s4m.css` is 2,243 lines and 217 KB. `s4m.js` is 1,681 lines and 170 KB (`window.S4M`). Colour comes from `m3color.js` (Material Color Utilities 0.4.0, 2025 spec). The font is Inter 4 variable. Icons are Solar Bold Duotone (1,522 icons in a 2 MB JSON).
- There are about 45 components. They use official M3 token names: 49 colour roles, a 15-role type scale, the shape scale 0/4/8/12/16/20/28/32/48/full, six springs in three schemes (Fluid, which is the S4 default, plus Expressive and Standard), and state layers (hover .08, focus .10, pressed .10, dragged .16).
- Looks are set with `data-style`: `glass` (the default), `vibrant` or `m3e`, plus the `compact` density.
- Glass has three levels:
  - **pane**: 36% (38% in dark), blur 24, saturate 1.9.
  - **float**: 84% (82% in dark), blur 32.
  - **fill**: 56% (64% in dark), no blur.
- The glass frosts the `.s4-backdrop` blooms, whose lightness is kept inside a band.
- Default colour is monochrome. Any seed builds every role through MCU, at contrast levels 0, 0.5 and 1.
- Tooling: `check.py` (Playwright: rendered contrast, overflow, shadows on glass, tabular figures) and `contrast.py` (per-pixel contrast over glass).

## Bugs found (confirmed in the source)

1. **Reduced motion is ignored in the glass and vibrant looks.** The Fluid block `:root:not(…):not(…):not(…)` has specificity (0,4,0). The reduced-motion override `:root:root:root` has (0,3,0) and sits in the same layer, so the Fluid block wins. The JS spring table also has no Fluid entry, so shape morphs and the loading indicator overshoot.
2. **`data-contrast="medium"` outranks `m3e`.** `(0,3,0)` beats `(0,2,0)`, so stock M3E turns translucent. It also adds a 6% primary tint to plain glass.
3. **The no-`backdrop-filter` fallback is overridden.** It sits in the tokens layer at `:root`, so the dark blocks and the vibrant blocks override it. The result is 38–84% transparent surfaces with no blur.
4. **JS bugs:**
   - The docked date picker throws a TypeError on arrow keys.
   - Dragging a sheet closed leaves its FAB hidden.
   - Dialogs focus the last action, which is the destructive confirm.
   - Tooltips delete the author's `aria-describedby`.
   - `aria-invalid=""` is written where it should be `"true"`.
5. **No `forced-colors` support.** Checkbox, radio and outlined rings are drawn with `box-shadow` and disappear in forced-colors mode.

## Drift and inconsistencies

- Versions disagree: CSS 1.3.1, JS 1.3.0, docs "1.3". There's no changelog and no LICENSE files. Inter's OFL licence isn't shipped, and the Solar CC BY credit is missing from generated pages.
- The docs contradict SKILL.md on three points:
  - Float glass opacity: 74% in the docs, 84% in the CSS.
  - Overshoot: the docs say springs "may overshoot"; SKILL.md says Fluid never does.
  - Icons on selection: the docs say they fill; SKILL.md says they never change.
- Duplicated blocks:
  - The dark tokens, the vibrant dark block and compact-touch are each written twice.
  - The glass `color-mix` formula is inlined 28 times.
  - The JS repeats the spring table, the 840px breakpoint and the exit durations.
- In compact, "softer corners" collapses the shape scale: extra-small = small, and small = medium.

## Hard-coded values that should be tokens

- About 1,020 raw `px` values, including about 40 radii.
- 17 raw durations in CSS and about 35 in JS.
- The disabled opacity `.38` is written raw 8 times. The scrim `.32` is written raw 4 times.
- Raw type values: 61 line-heights, 26 letter-spacings and 34 font-weights.
- Six different focus-ring geometries.
- Z-index values 20–110 with no scale.
- The `--s4-space-*` tokens are defined but never used.

## Decisions

| Topic | Decision |
|---|---|
| Name and scope | S4 Orion replaces the S4 Material skill. Web only: W3C JSON tokens, plus generated `tokens.css` and TS tokens for React. S4 Glass stays separate. |
| Approach | **Leaner rebuild**, borrowing from S4 Material rather than evolving its 390 KB of CSS and JS |
| Foundation | M3 Expressive structure: colour roles, type scale, shape scale, springs, state layers |
| Colour | One seed per app, generated with MCU. Neutrals are tinted by the seed, with a `mono` opt-out. |
| Glass | Only on floating and chrome layers. **Cards, panes, lists and fields are solid** tinted M3 surface containers. |
| Highlights | Flat M3: no gradient nav pill, no glows on controls. Whether to keep the backdrop blooms is decided in Phase 4. |
| Sizes | M3 sizes everywhere: 48px targets, 40px buttons, 16px body text |
| Labels | Title Case for labels, sentence case for sentences |
| Type | Inter |
| Icons | Solar: Bold Duotone where the icon carries the screen, Linear for small and inline icons. Icons sit behind a set-neutral name layer, so Phosphor Duotone can be swapped in later. |
| States | **A: stock M3.** State layers in the content colour (hover 8%, press 10%), a 3dp secondary focus ring, and selection in the secondary container. |
| Shape | **A: stock M3 Expressive.** Pill buttons that square off on press, 12dp cards, 4dp list rows, filled fields with square bottom corners, 28dp dialogs and 16dp FAB. |
| Default colour | **Mono:** black and white (MCU monochrome). Mono + Red was explored as an option. |
| Motion springs | **D: M3 Expressive** (Google's stock springs; fast spatial overshoots about 9%). This replaces S4 Material's Fluid default. |
| Transitions | Origin as S4 Material did it (scaling the whole surface) is **dropped**: too intense. Per surface: **menus Unfold** (the shape opens down from its top edge), **dialogs Container Transform**, **bottom sheets Container Transform** from a FAB (and Slide From Edge when not opened from one), **switching views Shared Axis**, **list to detail Container Transform**, **snackbars Slide From Edge**. |
| Container transform | The source *becomes* the container: it starts and ends with the source's rect, radius, colour and label, and morphs at real size (no stretching). Collapse runs on a critically damped ("calm") version of the spring, so it never passes the source, and colour crossfades on an effects spring. |
| Review tooling | Review demos live in `/explore` on GitHub Pages and use a separate "review blue" UI with saved answers. They aren't part of the design system. |
