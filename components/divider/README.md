# Divider

A thin line that groups content (M3). 1px outline-variant.

```html
<hr class="s4-divider">
<hr class="s4-divider" data-inset="start">
<hr class="s4-divider" data-inset="middle">
<hr class="s4-divider" data-orientation="vertical">
```

| Attribute | Values | Default |
|---|---|---|
| `data-inset` | `start` (16 at the start), `middle` (16 at both ends); on a vertical divider, 8 at the top (and bottom) | full width |
| `data-orientation` | `vertical`: a line between items in a flex or grid row; stretches to the row's height (24 minimum) | horizontal |
| `--s4-divider-inset` | the inset length, e.g. `calc(var(--s4-space-4) * 2 + var(--s4-space-10))` (72) to line up with list text after an avatar | 16 |

**When to use what:** prefer space and surface color to separate things. Use a full-width divider between groups, an
inset divider between items of a list, and a vertical one between figures in a row. For lines between every list item,
use the list's `data-dividers` instead.

**Do**
- Use a real `<hr>` when it separates sections of content; it's announced as a separator.

**Don't**
- Don't stack a divider against a surface edge or another divider.
- Don't color dividers; they are always outline-variant.

**Accessibility:** `<hr>` has the `separator` role. A purely decorative vertical divider in a toolbar can take
`aria-hidden="true"`. The line is a real border, so it survives forced-colors mode.

**Tokens:** `--s4-size-divider`, `--md-sys-color-outline-variant`, `--s4-space-2`, `--s4-space-4`, `--s4-space-6`.
