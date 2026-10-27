# Changelog

All notable changes to S4 Orion are recorded here. The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and the project uses [Semantic Versioning](https://semver.org/):

- **Major**: a token is renamed or removed, a component's markup or class names change, or a rule in the skill changes what existing apps should look like.
- **Minor**: new tokens, components, variants or skill guidance that existing apps can ignore.
- **Patch**: fixes that bring output back in line with the documented rules (contrast, bugs, docs).

## [1.0.0] - Unreleased

The first version of S4 Orion, a leaner rebuild of S4 Material 1.3 on Material 3 Expressive.

### Added

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
