# Toolbar

Actions for the current page or selection. M3 Expressive floating and docked toolbars.

```html
<div class="s4-toolbar" role="toolbar" aria-label="Bill Actions">
  <button class="s4-icon-button" type="button" aria-label="Edit Bill"><span class="s4-icon" data-icon="edit"></span></button>
  <button class="s4-icon-button" type="button" aria-label="Share"><span class="s4-icon" data-icon="share"></span></button>
  <span class="s4-toolbar-divider" role="separator"></span>
  <button class="s4-icon-button" type="button" aria-label="Delete Bill"><span class="s4-icon" data-icon="delete"></span></button>
</div>

<div class="s4-toolbar-dock" data-position="bottom">
  <div class="s4-toolbar" role="toolbar" aria-label="List Actions">…</div>
  <button class="s4-fab" type="button" aria-label="Add Bill"><span class="s4-icon" data-icon="add"></span></button>
</div>
```

| Attribute / part | Values | Default |
|---|---|---|
| `data-color` | `vibrant` (primary-container) | standard (surface-container) |
| `data-orientation` | `vertical` | horizontal |
| `data-type` | `docked`: full width, 64dp, square corners, no shadow, home-indicator padding | floating: 64dp pill, elevation 3 |
| `.s4-toolbar-divider` | a separator between groups | — |
| `.s4-toolbar-dock` | toolbar + FAB in a row; `data-position="bottom"` floats the pair centered above the bottom (and above the nav bar in an app shell) | — |

**When to use what:** **floating** over scrolling content for a handful of page actions, often beside the FAB;
**vibrant** when the toolbar is the main thing to act on (an editor, a selection). **Docked** for a page with no nav bar
that needs persistent actions at the bottom (an invoice viewer). **Vertical** at the side of a wide screen.

**Behaviour (`toolbar.js`, only with `role="toolbar"`):** the toolbar is one tab stop; Left / Right (Up / Down when
vertical) move between enabled controls, wrapping; Home / End jump to the ends.

**Do**
- Use icon buttons with `aria-label`; one tonal or filled button is fine for the key action.
- Keep 3 to 6 actions; move the rest into a "More Options" menu.

**Don't**
- Don't put navigation destinations in a toolbar (use the nav bar or rail).
- Don't stack a docked toolbar and a nav bar.

**Accessibility:** WAI-ARIA toolbar pattern with `aria-label`; disabled controls are skipped. Forced colors: the toolbar
gets a border (its shape is otherwise only a background).

**Tokens:** `--s4-shape-toolbar`, `--s4-size-top-app-bar` (64), `--md-sys-color-surface-container`,
`--md-sys-color-primary-container`, `--md-sys-elevation-level3`, `--s4-z-fab`.
