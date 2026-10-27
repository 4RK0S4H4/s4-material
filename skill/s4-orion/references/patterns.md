# S4 Orion screen patterns

How the components combine into screens. Each pattern names the components and why; markup details for each
component are in `components.md`. Live demo app: https://4rk0s4h4.github.io/s4-material/demo/

## Contents

- Layout helpers
- Dashboard
- List and detail
- Settings
- Forms
- Empty, loading and error states
- Theme controls
- Saving data
- Theming API

## Layout helpers

| Class | What it does |
|---|---|
| `.s4-page-header` | Title on the left, actions on the right, wraps on phones. Put the screen's headline and its filled/tonal buttons here. |
| `.s4-section` + `.s4-section-title` | A vertical group with its own heading (title-medium, emphasized). |
| `.s4-stack` | Column with the layout gap. `--s4-gap` changes it (a `--s4-space-*` token). |
| `.s4-row` | Wrapping row, 8 apart, centered. For button rows and chip-like groups. |
| `.s4-grid` | Responsive grid of equal columns, at least `--s4-min` (280px) wide. For cards and dashboard panes. |

Write the app's own layout with these and tokens. Need something else (a two-column detail split)? Write a small grid in
the app's CSS with `--s4-space-*` gaps and a container query on `.s4-app` at 840:

```css
.ledger-split { display: grid; gap: var(--s4-layout-gap); }
@container s4-app (width >= 840px) { .ledger-split { grid-template-columns: minmax(0, 2fr) minmax(0, 3fr); } }
```

## Dashboard

```
page header: "Overview" + period button group (connected, single)
grid of panes: KPI panes (label, emphasized number, delta status) · a chart pane · a short list pane ("Due This Week")
```

- KPI tiles are `.s4-pane`s in an `.s4-grid` (`--s4-min: 200px` for small tiles). Label in `.s4-label-large`
  `.s4-on-surface-variant`, value in `.s4-headline-small .s4-emphasized .s4-num`, change as a `.s4-status` with a tone.
- Period or scope switch: a **connected button group** with `data-select="single"` in the page header, not tabs.
  Tabs are for sibling content inside one screen.
- Charts: draw with role colors read at run time (`S4.util.css('--md-sys-color-primary')`), redraw on the `s4-theme`
  event. Series beyond two: `primary`, `tertiary`, `secondary`, `error` in that order. Gridlines `outline-variant`.
- A dashboard has no FAB unless one action clearly dominates the app.

## List and detail

- **Phone:** the list is the view; tapping a row opens the detail as its own view or a full-screen dialog
  (`S4.transition.containerTransform(detail, row)` grows it out of the row). Back closes it.
- **Expanded (≥ 840):** list and detail side by side (the `.ledger-split` above); selecting a row fills the detail pane
  with a shared axis or fade, never a container transform (nothing moves between panes).
- The list is a `role="listbox"` `.s4-list` when it drives a detail pane (arrow keys, `aria-selected`), and plain links
  when each row navigates.
- Detail header: title, a `.s4-status`, and the item's actions as one filled button + icon buttons with a `more-vert`
  menu for the rest.
- Search and filters sit above the list: `.s4-search` then a filter `.s4-chip-set`, both scrolling with the content.

## Settings

- Group settings into `.s4-pane`s, one per topic, each with a `.s4-pane-title` and an optional `.s4-pane-supporting`.
- Inside a pane, a `.s4-list` of rows: a switch as the trailing element for on/off, a trailing value + chevron for a
  choice that opens a dialog or menu.
- Switches apply immediately (no Save button). Confirm with nothing, or a snackbar only when the effect is invisible.
- A destructive setting goes last, in a pane with `data-color="error"`, with an outlined error button that opens a
  confirm dialog.
- Appearance settings: see **Theme controls**.

## Forms

- One column, fields at full width up to about 560px (`max-width: 35rem` on the form). Group long forms into sections.
- Filled text fields by default; outlined when the form sits on a busy surface or in a table row.
- Labels in Title Case, helper text and errors as sentences. Validate on blur and on submit, not on every keystroke;
  set `data-error="Enter an amount above $0.00."` and move focus to the first invalid field on submit.
- Actions at the end, end-aligned: Cancel (text) then the main action (filled), named by what it does ("Save Bill").
- In a dialog or sheet the same rules apply; the actions go in `.s4-dialog-actions` / `.s4-sheet-actions` with
  `data-close` values, and the code handles `s4-close`.
- Required fields: mark the optional ones "(Optional)" instead when most fields are required.

## Empty, loading and error states

**Empty** (nothing yet, or no search results), centered in the space the content would fill:

```html
<div class="s4-stack" style="--s4-gap: var(--s4-space-3); align-items: center; text-align: center; padding-block: var(--s4-space-12);">
  <span class="s4-icon" data-icon="bills" style="--s4-icon-size: var(--s4-size-icon-large)"></span>
  <h2 class="s4-title-large">No Bills Yet</h2>
  <p class="s4-body-medium s4-on-surface-variant">Bills you add or forward to your inbox show up here.</p>
  <button class="s4-button" data-variant="tonal" type="button">Add Bill</button>
</div>
```

(In app code, put those inline styles on an app class.) No search results: say what was searched and offer to clear
filters; no illustration.

**Loading:** under a second, show nothing. Longer: a linear indeterminate `.s4-progress` at the top of the area being
loaded (or under the top app bar for the whole screen); keep the old content visible when refreshing. A button that
starts work can show a circular progress in place of its icon and `aria-disabled="true"`.

**Error:** inline where the content would be, as a sentence plus a Retry button ("Couldn't load bills. Check your
connection and try again."). A failed background action: snackbar with Retry. Never a dialog for a recoverable error.

## Theme controls

An app that offers appearance settings uses exactly these, so every app feels the same:

```html
<section class="s4-pane" aria-labelledby="appearance">
  <h2 class="s4-pane-title" id="appearance">Appearance</h2>
  <div class="s4-stack">
    <div class="s4-button-group" data-connected data-select="single" aria-label="Theme" id="mode">
      <button class="s4-button" type="button" value="system" aria-pressed="true">System</button>
      <button class="s4-button" type="button" value="light" aria-pressed="false">Light</button>
      <button class="s4-button" type="button" value="dark" aria-pressed="false">Dark</button>
    </div>
    <div class="s4-swatches" data-theme-seed aria-label="Theme Color">
      <button class="s4-swatch" type="button" data-seed="#000000" aria-label="Mono"></button>
      <button class="s4-swatch" type="button" data-seed="#4f46e5" aria-label="Indigo"></button>
      <button class="s4-swatch" type="button" data-seed="#00796b" aria-label="Teal"></button>
      <button class="s4-swatch" type="button" data-seed="#c2185b" aria-label="Rose"></button>
    </div>
    <div class="s4-button-group" data-connected data-select="single" aria-label="Contrast" id="contrast">
      <button class="s4-button" type="button" value="0" aria-pressed="true">Standard</button>
      <button class="s4-button" type="button" value="0.5" aria-pressed="false">Medium</button>
      <button class="s4-button" type="button" value="1" aria-pressed="false">High</button>
    </div>
  </div>
</section>
<script>
  document.getElementById('mode').addEventListener('s4-change', (e) => S4.theme({ mode: e.detail.value }));
  document.getElementById('contrast').addEventListener('s4-change', (e) => S4.theme({ contrast: +e.detail.value }));
  /* reflect the restored theme in the groups */
  const t = S4.theme();
  document.querySelectorAll('#mode [value]').forEach((b) => b.setAttribute('aria-pressed', b.value === t.mode));
  document.querySelectorAll('#contrast [value]').forEach((b) => b.setAttribute('aria-pressed', +b.value === t.contrast));
</script>
```

- Mono is always the first swatch. Offer 3–6 seeds; the app's own seed (if it has one) is second.
- Swatches with `data-theme-seed` call `S4.theme` themselves and stay in sync.
- `S4.theme.restore(key, defaults)` at start-up (see the page shape in SKILL.md) makes every change save under that key.
  Use the same key in the head script that sets `data-theme` before first paint.
- A single quick toggle in the top app bar (light-mode / dark-mode icon button) is fine for small tools; it calls
  `S4.theme({ mode })` and swaps its icon with `S4.icon.set(el, name)`.

## Saving data

- Small apps: `localStorage` under one key per app (`'<app-name>-data'`), JSON, written after each change. Wrap reads in
  try/catch and fall back to defaults; storage can be blocked.
- Use the same app-name prefix for the theme key, so an app's settings are easy to find and clear.
- Anything bigger, shared or sensitive belongs on a server; say so rather than storing it in the browser.
- After a destructive change, keep the removed item in memory until the Undo snackbar times out.

## Theming API

```js
S4.theme()                                     // → { seed, variant, mode, contrast }
S4.theme({ seed: '#2e7d32' })                  // generate every role from a seed (variant 'vibrant' by default)
S4.theme({ seed: '#e4002b', variant: 'fidelity' })   // brand color shown as is: 'fidelity' | 'tonal' | 'vibrant' | 'expressive'
S4.theme({ seed: null })                       // back to monochrome
S4.theme({ mode: 'system' | 'light' | 'dark' })
S4.theme({ contrast: 0 | 0.5 | 1 })            // standard, medium, high
S4.theme.restore('app-theme', { mode: 'system' })   // apply the saved theme or defaults, keep saving under the key
document.addEventListener('s4-theme', (e) => redrawCharts(e.detail))   // after any change
S4.util.css('--md-sys-color-primary')          // read a token's current value (for canvas, charts)
```

Set the seed once at start-up for an app with a brand color: `S4.theme.restore('app-theme', { seed: '#2e7d32', mode: 'system' })`.
Color is generated with Material Color Utilities (`m3color.js`, loaded on demand from next to `orion.js`); it writes
the same zero-specificity blocks as the token file, so dark mode, high contrast and glass keep working.

## Build notes (from the Phase 6 demo)

- **Rail FAB:** in the app shell the view's FAB is `data-fixed` inside its view. On wide screens put the same action in the
  rail's FAB slot instead of a second FAB (the rail's slot is the only second place it may appear).
- **List and detail on wide screens:** a list with a detail pane splits side by side from 840; below that the detail is a
  container-transform dialog opened with `S4.dialog.open(id, { from: row })`.
- **Validating before a sheet closes:** `data-close="save"` closes at once. To validate first, give Save no `data-close`,
  check the fields, then call `S4.sheet.close(id, 'save')`.
- **Search plus your own filters:** `data-filter-empty` needs an element of its own ("No bills match “zzz”"); keep the
  first-run empty state in a different element. After re-rendering a filtered list, dispatch `input` on the search field.
- **Charts in tabs or hidden views:** a canvas in a hidden panel has zero size; redraw on `s4-theme`, on tab change, or
  with a `ResizeObserver`. Take sizes and colors from tokens (`S4.util.css`); don't hard-code pixels in canvas code.
- **Status pills in panes:** a pane stacks its children, so a pill stretches; wrap it in `.s4-row` to keep it inline.
- The page checker only inspects the view that is visible on load. Check the other views by hand.
