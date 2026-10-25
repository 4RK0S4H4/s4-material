# Navigation Rail

Top-level destinations at the side of expanded windows (840 and up). M3 Expressive rail: collapsed (96dp) or expanded,
with an optional menu button and FAB. Uses the same `.s4-nav-item` as the [navigation bar](../nav-bar/) (styles in
`nav-bar.css`).

```html
<nav class="s4-nav-rail" aria-label="Main">
  <div class="s4-nav-rail-header">
    <button class="s4-icon-button" type="button" data-rail-toggle aria-expanded="false" aria-label="Expand Navigation"
            data-label-expand="Expand Navigation" data-label-collapse="Collapse Navigation"><span class="s4-icon" data-icon="menu"></span></button>
    <button class="s4-fab" type="button" aria-label="Add Bill"><span class="s4-icon" data-icon="add"></span><span class="s4-fab-label">Add Bill</span></button>
  </div>
  <div class="s4-nav-rail-items">
    <a class="s4-nav-item" href="#home" aria-current="page"><span class="s4-nav-indicator"><span class="s4-icon" data-icon="home"></span></span><span class="s4-nav-label">Home</span></a>
    …
  </div>
</nav>
```

| Attribute / part | Purpose |
|---|---|
| `data-expanded` | Expanded rail: wider (`--s4-nav-rail-expanded-width`, default 240), labels beside icons, label-large, a 56dp pill spanning icon and label, surface-container. |
| `[data-rail-toggle]` | Button that flips `data-expanded`; `aria-expanded` and the optional `data-label-expand/collapse` labels follow. |
| `.s4-nav-rail-header` | Menu button and FAB slot. In the collapsed rail the FAB's label is hidden (icon FAB); expanded it shows (extended FAB). |
| `.s4-nav-rail-items` | The destinations (`.s4-nav-item`, see nav bar). |

**Behaviour (`nav-rail.js`):** item clicks move `aria-current` and fire `s4-change { item, index, value }`; the toggle
fires `s4-toggle { expanded }`. The width animates on the spatial spring, labels fade in on effects; icons stay in place
because the expanded pill starts where the collapsed one did. In an [app shell](../app/) the rail is sticky at full
height from 840 and mirrors the nav bar.

**Do**
- Put the screen's main action in the FAB slot; give the FAB an `aria-label` (the label is hidden when collapsed).
- Keep destinations identical to the nav bar.

**Don't**
- Don't put secondary actions or settings toggles in the rail.
- Don't use the rail on compact windows; use the nav bar.

**Accessibility:** `nav` landmark with `aria-label`; `aria-current="page"`; the toggle exposes `aria-expanded`. Items keep
≥ 48dp targets. Forced colors: the rail gets an end border.

**Tokens:** `--s4-size-nav-rail`, `--s4-size-nav-indicator-*`, `--s4-shape-nav-indicator`, `--s4-size-icon-button`,
`--md-sys-color-surface` / `-surface-container`, `--md-sys-typescale-label-large-*`, `--md-sys-motion-spring-spatial`.
