# Badge

Shows that something is new, or how many items need attention (M3). Error and on-error.

```html
<span class="s4-badge"></span>          <!-- small: 6dp dot -->
<span class="s4-badge">3</span>         <!-- large: 16dp, label-small -->
<span class="s4-badge">999+</span>

<!-- on an icon: the host wraps the 24dp icon -->
<button class="s4-icon-button" type="button" aria-label="Notifications, 3 new">
  <span class="s4-badge-host"><span class="s4-icon" data-icon="notifications"></span><span class="s4-badge" aria-hidden="true">3</span></span>
</button>
```

| Part | Values | Default |
|---|---|---|
| `.s4-badge` (empty) | small: 6dp dot | — |
| `.s4-badge` with text | large: 16 high, at least 16 wide, 4 side padding, label-small, tabular figures | — |
| `.s4-badge-host` | wraps an icon; the small dot sits in the icon's top-end corner, a large badge starts 12dp in from the icon's end with its bottom 14dp below the icon's top (M3 / Compose `BadgedBox` offsets) | — |

Outside a host the badge sits inline, e.g. after a label in a list item or tab.

**When to use what:** the **small** dot when the count doesn't matter ("something new"); the **large** badge for a count.
Cap counts at "999+" (write the capped text yourself).

**Do**
- Wrap the icon itself, not a 40dp icon button, so the offsets land on the icon.
- Put the count in the control's accessible name ("Bills, 6 due") and hide the badge itself with `aria-hidden`.

**Don't**
- Don't use a badge for status ("Paid", "Overdue"); use a [status](../status/) pill.
- Don't badge every item; reserve it for what needs attention now.

**Accessibility:** the badge doesn't take pointer events, so it never steals a click. A small dot has no text, so the
control's name has to say what's new. Forced-colors mode draws a border.

**Tokens:** `--md-sys-color-error`, `--md-sys-color-on-error`, `--md-sys-typescale-label-small-*`, `--s4-space-1`,
`--s4-space-3`, `--s4-space-4`, `--md-sys-shape-corner-full`.
