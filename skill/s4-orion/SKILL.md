---
name: s4-orion
description: "S4 Orion, the user's own design system: Material 3 Expressive (M3 color roles from one seed, M3 type and shape scales, springs) with a very clear, contrast-guaranteed glass layer on floating chrome, Inter, Solar icons, Title Case labels, monochrome by default. Ships orion.css + orion.js with 33 components (app shell, nav bar/rail, top app bar, buttons, FAB, cards, lists, tables, fields, chips, menus, dialogs, sheets, snackbars…), tokens, and a page checker. Use it whenever the user wants a web app, tool, dashboard, page, prototype or mockup built or restyled in S4 Orion, S4 Material, Material / Material You / M3 / M3E or a Google/Android look, or asks to apply their design system to an app that already uses S4 Orion or S4 Material. It replaces the S4 Material skill. Not for S4 Glass or S4 Flat, and not for documents, slides or charts on their own."
---

# S4 Orion

S4 Orion is the user's design system for web apps and pages. It **is** Material 3 Expressive: the same color roles,
type scale, shape scale, state layers, springs and components, under M3's own names. The personal layer on top is short
and deliberate:

- **Inter** as the typeface, **Solar** icons (Bold Duotone, Linear arrows) behind neutral names.
- **Title Case** labels; sentences stay sentence case.
- **Monochrome by default.** An app that wants color sets one seed; every role is generated from it.
- **Very clear glass on floating chrome only** (app bars over scrolled content, nav bar, toolbars, menus, dialogs, sheets),
  with a contrast floor that keeps text WCAG AA over any backdrop. Content is always solid.
- **Motion that comes from somewhere, quietly:** container transform, unfold, shared axis, slide from edge.

When a question isn't answered here or in the references, do what stock Material 3 Expressive does. That keeps every app
predictable and lets M3 guidance apply directly. Inventing new components, colors or radii is how a design system drifts.

## Get the files

Everything ships in this skill's `assets/` folder: `orion.css` (tokens, every component, glass, motion), `orion.js`
(runtime), `icons.js` (icon registry), `m3color.js` (seed → roles, loaded on demand), `inter-variable.woff2`.

- **App or repo:** copy the five files next to the page (or into the project's static folder) and link them as below.
- **One self-contained HTML file** (only when asked for a single file): build the page with the normal links, then run
  `node <skill>/scripts/inline.mjs page.html` to inline the CSS, JS, icons and font. Run it again after edits.
- **Never edit `orion.css` for one app.** Everything sits in `@layer s4.*`, so the app's own unlayered CSS wins; override
  with tokens and documented attributes instead. The source of truth is the repo (github.com/4rk0s4h4/s4-material).

## Page shape

```html
<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>Pocket Ledger</title>
<script>/* theme before first paint: no flash of the wrong mode */
(function (k) { try { var t = JSON.parse(localStorage.getItem(k) || 'null'); if (t && t.mode && t.mode !== 'system') document.documentElement.dataset.theme = t.mode; } catch (e) {} })('pocket-ledger-theme');
</script>
<link rel="preload" href="inter-variable.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="orion.css">
<style>/* the app's own layout, tokens only */</style>
</head>
<body>
<div class="s4-app">
  <nav class="s4-nav-rail" aria-label="Main">…same items as the nav bar…</nav>        <!-- shown from 840 -->
  <div class="s4-app-body">
    <header class="s4-top-app-bar">
      <div class="s4-app-bar-title-group"><h1 class="s4-app-bar-title">Bills</h1></div>
      <div class="s4-app-bar-actions"><button class="s4-icon-button" aria-label="Search" type="button"><span class="s4-icon" data-icon="search"></span></button></div>
    </header>
    <main class="s4-content">
      <section class="s4-view" data-view="bills" data-title="Bills">…</section>
      <section class="s4-view" data-view="budget" data-title="Budget" hidden>…</section>
    </main>
  </div>
  <nav class="s4-nav-bar" aria-label="Main">                                          <!-- shown under 840 -->
    <a class="s4-nav-item" href="#bills" data-view="bills" aria-current="page"><span class="s4-nav-indicator"><span class="s4-icon" data-icon="bills"></span></span><span class="s4-nav-label">Bills</span></a>
    <a class="s4-nav-item" href="#budget" data-view="budget"><span class="s4-nav-indicator"><span class="s4-icon" data-icon="wallet"></span></span><span class="s4-nav-label">Budget</span></a>
  </nav>
</div>
<script src="icons.js"></script>
<script src="orion.js"></script>
<script>S4.theme.restore('pocket-ledger-theme', { mode: 'system' });   /* then the app's own script */</script>
</body>
</html>
```

- The window scrolls; the top app bar, rail and nav bar are sticky. The top app bar turns to glass by itself when content
  scrolls under it. Don't add your own fixed bars or an inner full-height scroller.
- Window classes are container queries on `.s4-app`: compact < 600 (nav bar), medium 600–839 (nav bar), expanded ≥ 840
  (rail). A one-screen tool drops both navs and keeps the top app bar.
- Markup works without app code: `orion.js` wires every component on load and anything added later.
- Read `references/patterns.md` for screen patterns (dashboard, list and detail, settings, forms, empty states, theming).

## Decision rules

**Color**
- No seed unless the user names a color or brand. Monochrome is the default look, not a placeholder.
- A named color ("make it green"): `S4.theme({ seed: '#2e7d32', variant: 'vibrant' })`. An exact brand hex that must show as
  is: `variant: 'fidelity'`. Subtle or photo-derived: `'tonal'`.
- Use roles, never hex: page `surface`; cards and panes `surface-container-low`; menus and nav `surface-container`;
  dialogs `surface-container-high`; filled fields `surface-container-highest`; text `on-surface`, secondary text
  `on-surface-variant`; selection `secondary-container`; the one main action `primary`; standout container (FAB)
  `primary-container`; errors `error`. If you're reaching for a hex value, there is a role for it.
- Raise contrast with `S4.theme({ contrast: 0.5 | 1 })`, never by darkening one color.

**Actions**
- One **filled** button per area for the main action; **tonal** for a strong second; **outlined** or **text** for the rest.
- A **FAB** only when one action dominates a screen (Add Bill); never two FABs.
- Icon-only actions are icon buttons with `aria-label` and usually a `data-tooltip`.
- Related choices: a **connected button group** for 2–5 short options; **filter chips** for more, or for multi-select.
- Destructive confirm buttons get `data-color="error"`; a per-row delete stays a plain icon button.

**Showing data**
- Items people scan and open: a **list** (`data-style="segmented"` for grouped rows on a card-like surface).
- Rows people compare across columns: a **table** (it stacks into rows on phones by itself). Right-align numbers.
- A few rich, independent things: **cards** in an `.s4-grid`. Sections of settings or a dashboard: **panes**.
- State of a thing: a **status** pill with a tone and a word ("Overdue"), never color alone.

**Overlays**
- A short list of choices from a button: **menu**. A decision or a short input: **dialog**. A short task without leaving:
  **bottom sheet** (phones, quick add) or **side sheet** (filters, details on wide screens). Confirmation after an
  action: **snackbar** with Undo. Naming an icon: **tooltip**.
- Confirm only what can't be undone. Prefer Undo in a snackbar.

**Motion** (built in; use the APIs, never hand-write durations or easings)
- Something opened from what you touched (dialog from a button, sheet from a FAB, detail from a row): **container transform**
  (`[data-dialog]`, `[data-sheet]`, or `S4.transition.containerTransform(surface, source)`).
- Menus **unfold**; sibling views and tabs use **shared axis**; sheets not from a FAB and snackbars **slide from the edge**.
- Never scale a surface's content to make it appear (it stretches text). Bounce is fine on movement; fades never bounce.
- Custom animation: `S4.motion.animate(el, keyframes, 'spatial')` (reads the spring tokens and reduced motion).

**Glass** (read `references/glass.md` before adding any)
- Only floating chrome and overlays get glass, and the components already have it. Content is never glass.
- Text on glass is `on-surface`; at most two glass layers overlap; `data-glass="off"` keeps one element solid.
- A custom floating panel can opt in with `class="s4-glass"`; a card can't.

**Type and writing**
- Use the type scale classes (`.s4-headline-small`, `.s4-title-medium`, `.s4-body-medium`, `.s4-label-large`…) or the
  `--md-sys-typescale-*` tokens; add `.s4-emphasized` for the M3 Expressive weight on a key number or title.
- Numbers people compare (amounts, counts, dates, IDs) get `.s4-num` (tabular figures). Tables and inputs already do.
- **Title Case** for labels: buttons, tabs, headings, column headers, menu items, field labels, chips, nav labels.
  Sentence case for sentences: helper and error text, snackbars, dialog questions ("Delete this bill?"), empty states.
- Name actions by what happens ("Pay Bill", "Export to Excel"), and keep the same word through the flow (Archive → "Bill archived").

**Icons**
- `<span class="s4-icon" data-icon="name"></span>` with names from `references/icons.md` (or `S4.icon.names()` in the
  console). Common: home, search, bills, wallet, settings, add, edit, delete, more, more-vert,
  close, check, chevron-down/up/left/right, back, forward, notifications, account, calendar, filter, sort, export,
  download, upload, copy, share, info, warning, error, star, favorite, chart, dashboard, document, card, history, lock,
  visible, hidden, light-mode, dark-mode, menu, refresh, undo, sparkle, mail, chat. Unknown names log a console warning.
- Need another Solar icon: `S4.icon.add({ name: '<svg body>' })`. Credit "Solar icons by 480 Design (CC BY 4.0)" in the
  page footer or about screen.

## Common mistakes

| Mistake | Why it's wrong | Instead |
|---|---|---|
| Hex or rgb colors in app CSS | Breaks dark mode, seeds and contrast levels | A `--md-sys-color-*` role |
| `backdrop-filter` or `.s4-glass` on cards, lists, panes | Glass is for floating chrome; it hurts legibility and performance | Solid `surface-container-*` |
| Two filled buttons side by side | Nothing reads as the main action | One filled, one tonal or text |
| Grey text with `opacity` or alpha colors | Fails contrast unpredictably | `on-surface-variant` |
| Inventing radii, sizes or durations | Drift from the system | `--md-sys-shape-corner-*`, `--s4-size-*`, `--s4-space-*`, spring tokens |
| `position: fixed` app bars or a full-height scrolling `main` | Fights the shell's sticky bars and phone browser behavior | The `.s4-app` shell, window scroll |
| Sentence-case buttons ("Save changes") or Title Case sentences | Breaks the house writing style | "Save Changes"; "Your changes are saved." |
| Status shown only by color | Fails for color-blind users | `.s4-status` with a word |
| Icon-only button without `aria-label` | Unusable with a screen reader | Add `aria-label` (and `data-tooltip`) |
| Styling bare elements (`button {}`, `h2 {}`) in app CSS | Leaks into components | Style the app's own classes |
| Editing `orion.css` / copying component CSS into the app | Forks the system | App CSS with tokens; ask to change the system |
| A seed color "because it looks nicer" | Monochrome is the user's chosen default | Seed only when asked |
| Hand-written `transition: all .3s ease` | Wrong curve, ignores reduced motion | `var(--md-sys-motion-spring-spatial-duration) var(--md-sys-motion-spring-spatial)` |

## Worked example

Request: "Add a screen to my expenses app listing this month's bills, with a way to add one."

```html
<section class="s4-view" data-view="bills" data-title="Bills">
  <div class="s4-page-header">
    <h2 class="s4-headline-small">October</h2>
    <span class="s4-num s4-title-large s4-emphasized">$4,459.13</span>
  </div>
  <div class="s4-chip-set" data-select="single" aria-label="Filter bills">
    <button class="s4-chip" data-type="filter" aria-pressed="true" type="button"><span class="s4-chip-check"></span>All</button>
    <button class="s4-chip" data-type="filter" aria-pressed="false" type="button"><span class="s4-chip-check"></span>Due</button>
    <button class="s4-chip" data-type="filter" aria-pressed="false" type="button"><span class="s4-chip-check"></span>Overdue</button>
  </div>
  <ul class="s4-list" data-style="segmented">
    <li class="s4-list-subheader">This Week <span class="s4-list-subtotal">$1,629.95</span></li>
    <li><a class="s4-list-item" href="#bill-10482">
      <span class="s4-list-leading"><span class="s4-avatar">IM</span></span>
      <span class="s4-list-content"><span class="s4-list-headline">Iron Mountain</span><span class="s4-list-supporting">Due Oct 28</span></span>
      <span class="s4-list-trailing"><span class="s4-list-amount">$1,240.00</span><span class="s4-status" data-tone="error">Overdue</span></span>
    </a></li>
  </ul>
  <button class="s4-fab" data-fixed data-sheet="add-bill" type="button"><span class="s4-icon" data-icon="add"></span><span class="s4-fab-label">Add Bill</span></button>
</section>
<dialog class="s4-bottom-sheet" id="add-bill" aria-labelledby="add-bill-h">
  <span class="s4-sheet-handle" aria-hidden="true"></span>
  <h2 class="s4-sheet-title" id="add-bill-h">Add Bill</h2>
  <div class="s4-sheet-content">
    <div class="s4-text-field"><input id="vendor"><label for="vendor">Vendor</label></div>
    <div class="s4-text-field"><span class="s4-text-field-affix" data-prefix>$</span><input id="amount" inputmode="decimal"><label for="amount">Amount</label></div>
  </div>
  <div class="s4-sheet-actions"><button class="s4-button" data-variant="text" data-close="cancel" type="button">Cancel</button><button class="s4-button" data-close="save" type="button">Save Bill</button></div>
</dialog>
```

Why it looks like this: a list (scan and open), grouped with a subtotal; a status word, not a red row; one FAB for the one
dominant action, inside its view so it floats above the nav bar and leaves with the screen, and it grows into the sheet
(container transform) because the sheet opens from it; Title Case labels,
sentence-case nothing here; amounts in tabular figures; no colors, sizes or motion written by hand. Handle
`s4-close` on the sheet (`e.detail.value === 'save'`) and confirm with `S4.snackbar({ text: 'Bill added', action: 'Undo' })`.

## Check before handing over

Run `node <skill>/scripts/check.mjs page.html` (Playwright). It loads the page as a 390px dark phone and a 1280px light
desktop and reports console errors, unknown icons, sideways scroll, text below WCAG AA as rendered (including on glass),
and app CSS that breaks the rules above (hex colors, `!important`, glass on content, raw durations, bare element
selectors). Look at the two screenshots it saves too. Fix what it reports, run it once more, then hand over.

Also check by eye: one filled button per area, Title Case labels, status words, the nav bar on a phone and the rail on a
desktop, and both themes.

## References (read when needed)

| File | Read it when |
|---|---|
| `references/components.md` | Writing markup for any component: classes, attributes, events, do/don't. Search it for the class you need (e.g. `s4-table`, `data-select`) rather than reading it all. |
| `references/patterns.md` | Laying out a screen: dashboards, list and detail, settings, forms, empty and loading states, theme controls, saving data. |
| `references/icons.md` | Picking an icon name. |
| `references/tokens.md` | You need a token name or value (color roles, type, shape, spacing, sizes, z-index, springs, glass). |
| `references/glass.md` | Anything about glass, transparency, blur or overlays. |
| `references/motion.md` | Choosing or writing an animation or transition. |
| `references/color.md`, `typography.md`, `shape.md`, `spacing.md`, `elevation.md` | The reasoning and rules behind each foundation. |
| `references/accessibility.md` | What the system guarantees and what the app must still do. |
