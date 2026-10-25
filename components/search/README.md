# Search

A search bar that filters the current page as you type. M3 search bar (no full-screen search view).

```html
<div class="s4-search" role="search" data-filter="#bill-list" data-filter-empty="#bill-empty">
  <span class="s4-icon" data-icon="search"></span>
  <input class="s4-search-input" type="search" placeholder="Search Bills" aria-label="Search bills">
  <button class="s4-icon-button s4-search-clear" type="button" aria-label="Clear Search" hidden><span class="s4-icon" data-icon="close"></span></button>
  <button class="s4-icon-button" type="button" aria-label="Account"><span class="s4-search-avatar">AS</span></button>
</div>
```

| Attribute / part | Purpose |
|---|---|
| `.s4-search` | 56dp, full radius, surface-container-high, up to 720 wide. `role="search"`. |
| leading `.s4-icon` or `.s4-icon-button` | the search icon, or a menu / back button |
| `.s4-search-input` | `type="search"`, body-large, placeholder in on-surface-variant |
| `.s4-search-clear` | shown while there's text; clears and refocuses |
| trailing `.s4-icon-button` / `.s4-search-avatar` | optional actions or the account avatar (32dp initials or `<img>`) |
| `data-filter="<selector>"` | hide the target's children that don't contain the text (case and accent insensitive); `data-filter-skip` on a child keeps it |
| `data-filter-empty="<selector>"` | element shown when nothing matches |

**Behaviour (`search.js`):** every edit fires `s4-change { value, matches }` on `.s4-search` (`matches` is the visible
count with `data-filter`, else `null`). Escape clears. Clicking the bar's empty space focuses the input.

**Do**
- Say what's searched in the placeholder: "Search Bills", "Search Vendors".
- Show a short empty message when nothing matches.

**Don't**
- Don't add a Search button; results update as you type.
- Don't use a search bar as a general text field.

**Accessibility:** a `search` landmark; the input needs `aria-label` (the placeholder isn't a label). The M3 focus ring
wraps the whole bar. The clear button is a real button with a label. Forced colors: the bar gets a border.

**Tokens:** `--s4-size-text-field` (56), `--s4-shape-search`, `--md-sys-color-surface-container-high`,
`--md-sys-typescale-body-large-*`, `--s4-layout-list-width` (×2 = 720 max).
