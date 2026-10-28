# Component conventions

Every S4 Orion component follows these rules, so components look and behave like one system. The [button](button/) is
the reference implementation: copy its structure.

## Files
Each component lives in `components/<name>/`:

| File | Contents |
|---|---|
| `<name>.css` | All rules inside `@layer s4.components { … }`. |
| `<name>.js` | Only if it needs behaviour: `S4.register('<name>', function (scope) { … })`, wiring every instance in `scope` once (`S4.util.once`). No globals besides `S4`. |
| `<name>.html` | The reference page: every variant and state, real content, using `../index.css`, `../_example/example.css`, and the scripts `../assets/icons.js`, `../core/core.js`, the component's own JS, `../button-group/button-group.js`, `../_example/example.js` (in that order). |
| `README.md` | Markup, attributes table, when to use what, Do / Don't, accessibility, tokens used (see button/README.md). |

## Markup
- Class per part, prefixed `s4-`: `.s4-card`, `.s4-card-media`, `.s4-card-actions`.
- Options are data attributes: `data-variant`, `data-size` (`xs|s|m|l|xl`), `data-shape`, `data-color`. Defaults need no attribute.
- State is ARIA: `aria-pressed`, `aria-selected`, `aria-current`, `aria-expanded`, `aria-checked`, `aria-disabled`, `aria-invalid`. Never `.is-active` classes.
- Native elements underneath every custom control (real `<button>`, `<input type="checkbox">`, `<dialog>`, `<a>`).
- Icons: `<span class="s4-icon" data-icon="search"></span>` with names from `icons/names.json`. Icon-only controls need `aria-label`.
- Labels in Title Case; sentences (helper text, messages) in sentence case.

## CSS
- **Tokens only.** Colors are `--md-sys-color-*` roles; sizes `--s4-size-*`, spacing `--s4-space-*`, corners `--s4-shape-*` / `--md-sys-shape-corner-*`, type `--md-sys-typescale-*`, elevation `--md-sys-elevation-*`, motion `--md-sys-motion-spring-*` (and `-duration`), state `--md-sys-state-*`. No hex, rgb, raw ms or cubic-bezier. Raw px only for 0, 1px hairlines and 2px/3px indicator strokes M3 specifies; if you need another dimension, compute it from tokens with `calc()` or ask for a token.
- **"Fully round" on an element whose corners change (press, toggle, connected groups) is half its height (`calc(var(--_h) / 2)`), never `--md-sys-shape-corner-full`.** 9999px makes the browser scale all the element's corners down together and makes radius transitions look delayed then abrupt. `corner-full` is fine on shapes that never mix or morph (badges, switches, pills).
- Internals use `--_name` custom properties set on the component and overridden by variants (see button.css). Public knobs, if any, are `--s4-<component>-*`.
- **State layers come from base.css.** If your component is interactive, it must be in the shared list in `base/base.css` (`.s4-chip`, `.s4-tab`, `a.s4-list-item`, …); don't write your own hover overlay. Tint it with `--_state-color` if M3 uses a non-content color.
- Selected/active states use M3 roles (usually `secondary-container` / `on-secondary-container`), never an outline in an accent color.
- Disabled: container `on-surface` at `--md-sys-state-disabled-container-opacity`, content at `--md-sys-state-disabled-content-opacity` via `color-mix`.
- Touch targets ≥ `--s4-size-touch-target` (48): use a `::after` hit area like the button when the visual is smaller.
- Motion: transitions use spring tokens (spatial for movement and size, effects for color and opacity). Reduced motion is handled by the tokens; don't add your own media query.
- Forced colors: anything drawn only with `box-shadow` or background must get a real `border` or `outline` in `@media (forced-colors: active)`.
- No `!important` (except `[hidden]` in base). Don't style bare elements (`h2`, `p`, `button`) outside your component's class.
- **Glass is not your job.** Chrome and overlay components (top app bar, nav bar, nav rail, toolbar, search, menus, sheets, dialogs, tooltips) get a **solid** M3 surface role here; `glass/glass.css` adds glass on top in its own layer.
- Responsive with container queries where the component adapts to its space, viewport media queries only for page-level shell rules. Compact < 600, medium 600–839, expanded ≥ 840.

## Behaviour (JS)
- Use `S4.motion.animate(el, keyframes, 'spatial')` for animations and `S4.motion.spring(name)` for timings: never hard-code durations.
- Fire bubbling `CustomEvent`s with `S4.util.emit(el, 's4-change', detail)`: `s4-change`, `s4-select`, `s4-toggle`, `s4-open`, `s4-close`.
- Keyboard: follow the WAI-ARIA Authoring Practices pattern for the component (tabs: arrows + Home/End; radio-like groups: arrows; menus: arrows, Escape).
