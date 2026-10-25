# Navigation Bar

Switches between 3 to 5 top-level destinations on compact and medium windows (under 840). M3 navigation bar, with M3
Expressive horizontal items from 600 wide.

```html
<nav class="s4-nav-bar" aria-label="Main">
  <a class="s4-nav-item" href="#home" data-view="home" aria-current="page">
    <span class="s4-nav-indicator"><span class="s4-icon" data-icon="home"></span></span>
    <span class="s4-nav-label">Home</span>
  </a>
  <a class="s4-nav-item" href="#bills" data-view="bills">
    <span class="s4-nav-indicator"><span class="s4-badge-host"><span class="s4-icon" data-icon="bills"></span><span class="s4-badge">3</span></span></span>
    <span class="s4-nav-label">Bills</span>
  </a>
  …
</nav>
```

| Part / attribute | Purpose |
|---|---|
| `.s4-nav-item` | `a` (navigates) or `button` (same page). 3 to 5 per bar. |
| `aria-current="page"` | The current destination: secondary-container pill, on-secondary-container icon (solid), on-surface emphasized label. |
| `.s4-nav-indicator` | The 56×32 pill around the icon; carries the state layer and focus ring. |
| `.s4-nav-label` | label-medium; on-surface-variant when not current. |
| `.s4-badge-host` + `.s4-badge` | Optional badge on the icon (see [badge](../badge/)). |
| `data-view` | Ties the item to an `.s4-view` in an [app shell](../app/). |

**Layout:** 80dp on surface-container. Under 600 the icon sits over the label; from 600 (the bar is its own container)
the icon and label sit side by side inside a 40dp pill. Inside `.s4-app` the bar is sticky at the bottom, pads for the
home indicator and hides from 840, where the [nav rail](../nav-rail/) takes over.

**Behaviour (`nav-bar.js`):** clicking an item moves `aria-current` to it and fires `s4-change { item, index, value }`
on the bar (`value` = `data-view`, else `href`). `preventDefault()` in a click handler vetoes it. The new pill expands
from half width and fades in (spatial / effects springs, pure CSS, so changing `aria-current` from code animates too).

**Do**
- Use short, one-word Title Case labels; always show labels.
- Keep the same destinations and order as the rail.

**Don't**
- Don't use it for actions (use a FAB or toolbar) or for more than 5 destinations.
- Don't hide labels on unselected items.

**Accessibility:** a `nav` landmark with `aria-label`; `aria-current="page"` announces the current destination. Every
item is a full-height cell (≥ 48dp target). The focus ring wraps the pill. Forced colors: the current pill uses
Highlight and the bar gets a top border.

**Tokens:** `--s4-size-nav-bar`, `--s4-size-nav-indicator-width/height`, `--s4-shape-nav-indicator`,
`--md-sys-color-surface-container`, `--md-sys-color-secondary-container`, `--md-sys-typescale-label-medium-*`,
`--md-sys-state-*`, `--md-sys-motion-spring-spatial`, `--md-sys-motion-spring-effects`.
