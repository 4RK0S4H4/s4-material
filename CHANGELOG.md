# Changelog

All notable changes to S4 Orion are recorded here. The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and the project uses [Semantic Versioning](https://semver.org/):

- **Major**: a token is renamed or removed, a component's markup or class names change, or a rule in the skill changes what existing apps should look like.
- **Minor**: new tokens, components, variants or skill guidance that existing apps can ignore.
- **Patch**: fixes that bring output back in line with the documented rules (contrast, bugs, docs).

## [1.0.0] - Unreleased

The first version of S4 Orion, a leaner rebuild of S4 Material 1.3 on Material 3 Expressive.

### Changed (glass edge, 2026-11-07, decision 0013)

- Glass: a 1px frost line (white at 20%, `--s4-glass-highlight-*`) replaces the elevation shadow on glass surfaces; the shadow returns wherever glass is solid. Fill and contrast guarantee unchanged.
- Glass: color boost through the backdrop reduced from 180% to 120% (decision 0014); blur and tint unchanged.
- Glass: items on glass (decision 0015): buttons, chips and text fields keep their own color at full fill (`--s4-glass-item-fill`), text fields and the unchecked switch lose their outline at rest, outline-only items (outlined button, unselected chip) get the frost line (`--s4-glass-item-outline`).
- Review labs: a picked card or chip can be tapped again to deselect.

### Explored (not part of 1.0.0 yet)

- Liquid Glass Lab (`explore/liquid-glass.html`, engine in `explore/lib/liquid-glass.js`): glass that refracts like a thick slab with curved edges (squircle bevel, Snell's law), light blur, specular rim, soft shadow, shapes that melt together and a magnifying lens on the nav bar. WebGL2 engine (all browsers, over app-drawn backdrops) and SVG `backdrop-filter` engine (Chromium, over any DOM). Proposes an adaptive tint that keeps text at AA per pixel. Awaiting the owner's picks. After the first look: no color split (no rainbow fringes on white), a slight blur that's always on, and extra softening along the rim where the bend stretches content, so it never pixelates. Owner picks recorded in decision 0006 (extra liquid, adaptive tint, melt, every glass surface); added the frosted extra liquid material (more blur, firmer base tint, calmer colors, 7:1 text target, clearer outer rim) and a Frost Level question. Second round (owner: Material first, refraction and transparency only): new Material Liquid material (Liquid bend with a soft, seamless edge; frosted; no melting, lens, edge highlight or glow), M3 layout in the lab (full-width bars bend only along the content-facing edge), and a question on which raised surfaces get it. 0006 rewritten. Then shelved by the owner: today's glass (0004) already gives raised surfaces the transparency and depth wanted; liquid glass is not adopted.

### Changed (owner critique round 2, 2026-11-07, decision 0010)

- Progress: no stop dot at the end of the linear track.
- Snackbar: pill shaped, arrives with a small rise and fade.
- Menus: more rounded, quieter open. Tabs: fully rounded tray and pill.
- Nav bar and rail: a rounded highlight covering icon and label slides between items.

### Changed (Style Lab, 2026-11-07, decision 0009)

- Text fields are the Quiet Box: label above a thin-outlined box, ink focus ring; the filled and outlined variants, the floating label and the notch are gone (`data-variant` is ignored).
- Checkboxes are Soft Squares (20dp, 6dp corners, thin outline).
- Tabs are a Segmented Tray: a flat ink pill slides between tabs in a soft tray (secondary: a quiet pill, no tray).

### Changed (owner critique, 2026-11-07, decision 0008)

- Motion is much quicker and tighter: spatial 260 ms (was 415), fast-spatial 220, slow-spatial 340, effects 120, fast-effects 90; far less bounce.
- Glass surfaces opened by a container transform turn to glass during the last part of the move instead of after landing.
- Menus grow out of their anchor like a container transform; clicking an open menu's button closes it (menus are `popover="manual"` with their own outside-click).
- Table sorting uses the calm spring (no overshoot). Checkbox mark fades out on uncheck. Slider has no end-of-track dot (dots only with `data-stops`).

### Fixed (2026-11-07)

- Removed the light hairline on the top edge of glass surfaces (menus, tooltips, sheets, bars).

### Changed (owner review, 2026-11-04)

- Connected button groups are angular again: inner corners use the M3 Expressive values (xs 4, s and m 8, l 16, xl 20; tighter while pressed) and the selected button morphs fully round. The "too sharp" look from 2026-10-28 came from the 9999px bug, fixed then, not from the small corners.
- App shell: from 840 a FAB in the rail's slot hides the views' pinned (`data-fixed`) FABs, which otherwise floated over list content. The demo has a rail FAB.
- List: a trailing value followed by an icon sits on one line instead of stacking.
- Container transform: parts of the source hidden by its context (the label of a FAB in a collapsed rail) stay hidden in the carried copy.
- Page checker: also audits every app-shell view that was hidden on load (contrast, names, sideways scroll, glass on content), not just the first one.
- Icon Lab (`explore/icons.html`): plain or boxed glyphs for add, close, check and menu; awaiting the owner's pick.

### Fixed (end-to-end review, 2026-11-03: "symbols moving around" in the container transform)

- The surface now travels from the source (transform + clip) instead of being revealed by a clip window moving across still content, so icons and labels ride on the container instead of sliding through it.
- A source outside the surface's box (FAB beside a centered sheet on desktop, a button below a dialog, a wide row opening a narrower dialog) is now where the morph starts; before, it started from the surface's edge and the label was clipped away. Parts of the source reaching past the box are painted by a spread shadow in the container color.
- Closing: the carried label no longer inherits the hidden source's `visibility: hidden`; it fades back in instead of the real source popping in at the end. Content is gone by 20% of the close.
- Glass surfaces stay solid (no blur) while the shape moves and turn to glass once landed; the page behind no longer shows through sharp mid-morph, and `clip-path` never moves over `backdrop-filter`. The shadow rises after landing.
- Colors given as `oklab()` / `color-mix()` are read correctly (through a 1px canvas), so list rows start from the color the eye sees. Corners are taken per corner (sheets keep their square bottom), and spring overshoot no longer applies to the container's edges.
- Gallery theme bar: the Color, Theme and Contrast groups follow theme changes made elsewhere (swatches, a saved theme).

### Fixed (owner review of the demo: animations glitchy, button group corners too sharp)

- Root cause of the "sharp angles" and of jumpy press/toggle animations: buttons used a literal 9999px for "fully round". Browsers scale all of an element's corner radii down together when two on one side add up to more than the side, so in a connected group the inner corners collapsed to square whatever their value, and press/toggle morphs between 9999px and 8-28px sat unseen until their last few percent and then snapped. Buttons, icon buttons and group buttons now use half their height as "full".
- Tabs: no more filled slab behind the tab row (it read as a square cut-out); the row and each tab have soft top corners.
- Radio and checkbox groups in a `<fieldset>`: a soft outlined box (medium corners) instead of the browser's square one.
- Demo: KPI status pills hug their label instead of stretching across the card.

- Container transform: a transparent source (outlined or text button, list row) no longer makes the morphing surface see-through; it starts from the color the eye sees there. An outlined source keeps its ring until it fades. The clip now leaves room for the surface's shadow, so the shadow no longer pops in when the morph ends (same for menus). Glass surfaces fade their blur in with the color instead of switching it on at the end.
- Container transform: the source's label and icon no longer shift when the morph starts. The carried copy keeps the source's own classes (icon size, gap, letter spacing), so it lays out exactly like the real button.
- Shared axis: the app bar title and the scroll reset now happen at the moment of the swap, so the old view no longer jumps to the top while it fades out (`sharedAxis` takes an optional `onSwap`).
- Connected button groups: inner corners are large (xs medium, l extra-large, xl extra-extra-large) instead of small, so they sit softly next to the fully round selected button. (Reverted 2026-11-04: angular inner corners again, see above.)

### Added

- `demo/`: Pocket Ledger, a personal finance app that uses every component, built from the skill alone (Phase 6). Review in `docs/decisions/0005-phase-6-review.md`.
- Skill: "Build notes" in `patterns.md` (rail FAB, list/detail, sheet validation, search empty state, charts in hidden panels).

- Repo structure: `tokens/`, `components/`, `docs/`, `skill/`, `demo/`, `explore/`, `scripts/`, `LICENSES/`.
- Decision log: [0001](docs/decisions/0001-phase-1-audit.md) (audit and design decisions), [0002](docs/decisions/0002-repo-structure.md) (repo structure).
- Review labs on GitHub Pages (`explore/`): States and Shape, Motion Lab, Transitions Lab, with a saved questionnaire.
- Tokens ([0003](docs/decisions/0003-tokens.md)): 291 tokens in W3C DTCG format across color (49 M3 roles × 4 modes), typography, shape, spacing and size, elevation, state, motion (9 springs) and glass.
- `scripts/build-tokens.mjs`: generates `tokens.css` (every mode, zero-specificity blocks in `@layer s4.tokens`), `tokens.ts` and `tokens.json`; validates aliases and types; checks WCAG AA on 42 color pairs per mode.
- `scripts/generate-color.mjs`: default color roles from a seed with Material Color Utilities.
- CI workflow running `npm run check`.
- Tokens reference page (`tokens/index.html`) and foundation docs for color, typography, shape, spacing, elevation and motion.

- Glass layer ([0004](docs/decisions/0004-glass.md)): very clear 60% glass on chrome and overlays with a backdrop compression that guarantees AA text over any backdrop for every seed (`scripts/check-glass.mjs`), hairline edge, two-layer limit, solid fallbacks.
- 33 components with reference pages and READMEs: button, icon button, button group, FAB, app shell, top app bar, nav bar, nav rail, tabs, toolbar, search, card, pane, list, divider, table, text field, chips, switch, checkbox, radio, slider, swatches, badge, status, progress, menu, dialog, bottom and side sheets, snackbar, tooltips.
- Runtime (`orion.js`): auto-init, theme (seed, mode, contrast, saving), icons, and the transition patterns (container transform, unfold, shared axis, slide from edge).
- Set-neutral icon vocabulary (`components/icons/names.json`) built from Solar.
- `scripts/build.mjs`: bundles `components/orion.css` and `orion.js` and copies assets into the skill.
- The S4 Orion skill (`skill/s4-orion/`, packaged as `skill/dist/s4-orion.skill`), replacing the S4 Material skill:
  `SKILL.md` (trigger, philosophy, page shape, decision rules, common mistakes, worked example), hand-written
  `references/patterns.md` (screen patterns, theme controls, saving data, theming API), and references generated from
  the repo (components, tokens, icons, foundations).
- `skill/s4-orion/scripts/check.mjs`: loads a page at 390px dark and 1280px light and reports console errors, unknown
  icons, sideways scroll, rendered contrast (including worst case on glass), unnamed controls, glass on content, and app
  CSS that breaks the rules; warns on extra filled buttons and non-Title Case labels; saves screenshots.
- `skill/s4-orion/scripts/inline.mjs`: turns a page into one self-contained HTML file (CSS, JS, icons, font, color).
- Three eval cases for the skill (`skill/s4-orion/evals/`).

### Fixed (during 1.0.0)

- A fixed FAB inside the app shell now floats above the nav bar instead of covering it (`--s4-app-inset-bottom`).

### Fixed (from S4 Material 1.3)

- Reduced motion now wins over every motion scheme; medium/high contrast no longer leaks into other looks; the no-blur fallback now applies in dark mode. All mode blocks share zero specificity and a fixed order.

### Decided (from S4 Material 1.3)

- Stock M3 states (secondary focus ring) and the stock M3 Expressive shape scale, replacing S4 Material's softer corners.
- Default color is monochrome; any app can set its own seed.
- M3 Expressive springs replace S4 Material's Fluid motion.
- Origin motion (scaling a surface out of its source) is replaced by container transform, unfold, shared axis and slide from edge.
- Glass only on floating chrome; cards, panes, lists and fields become solid tinted surfaces.
