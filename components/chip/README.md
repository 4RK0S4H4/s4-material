# Chip

Compact elements for filters, entered values, quick actions and suggestions. M3 assist, filter, input and suggestion
chips in a chip set.

```html
<div class="s4-chip-set" aria-label="Categories">
  <button class="s4-chip" data-type="filter" type="button" aria-pressed="true">Utilities</button>
  <button class="s4-chip" data-type="filter" type="button">Office</button>
</div>
<div class="s4-chip-set" data-select="single" data-scroll aria-label="Status"> … filter chips … </div>
<div class="s4-chip-set" aria-label="Tags">
  <span class="s4-chip" data-type="input">Travel<button class="s4-chip-remove" type="button" aria-label="Remove Travel"></button></span>
  <span class="s4-chip" data-type="input"><span class="s4-chip-avatar">MR</span>Maya Rossi<button class="s4-chip-remove" type="button" aria-label="Remove Maya Rossi"></button></span>
</div>
<button class="s4-chip" type="button"><span class="s4-icon" data-icon="calendar"></span>Add to Calendar</button>
<button class="s4-chip" data-type="suggestion" type="button">Pay in Full</button>
```

| Attribute | Values | Default |
|---|---|---|
| `data-type` | `assist`, `filter`, `input`, `suggestion` | `assist` |
| `aria-pressed` | filter chip state | `false` |
| `data-elevated` | surface-container-low + level 1 shadow instead of the outline | — |
| `disabled` / `aria-disabled="true"` | disabled | — |
| `.s4-chip-set[data-select="single"]` | exactly one filter chip pressed | multi |
| `.s4-chip-set[data-scroll]` | one horizontally scrolling row | wraps |

32dp, corner `--s4-shape-chip`, label-large, 1dp outline-variant outline, 18dp icons. Selected filter chips are
secondary-container / on-secondary-container with no outline, and a check slides in (fast-spatial width animation),
replacing a leading icon if there is one. Assist icons are primary.

**Behaviour** (`chip.js`): filter chips toggle `aria-pressed` and fire `s4-change { pressed }` on the chip. Input chips:
`.s4-chip-remove` gets a close icon; a click (or Delete / Backspace on it) fires a cancelable `s4-remove { chip }`
(call `preventDefault()` to keep the chip), then the chip collapses and is removed and focus moves to its neighbour.

**When to use what:** filter chips to narrow a list; input chips for values someone entered (tags, people);
assist chips for a related action ("Add to Calendar"); suggestion chips for likely values or replies.

**Do:** Title Case labels, 1–3 words; give each remove button an `aria-label` naming the chip.
**Don't:** use chips as primary actions (use buttons) or for navigation (use tabs).

**Accessibility:** filter, assist and suggestion chips are `<button>`s (`aria-pressed` for filters); the remove control is
its own button; 48dp touch targets; forced-colors mode draws borders.

**Tokens:** `--s4-size-chip`, `--s4-shape-chip`, `--md-sys-color-secondary-container`, `outline-variant`,
`surface-container-low`, `--md-sys-elevation-level1/2`, `--md-sys-typescale-label-large-*`,
`--md-sys-motion-spring-fast-spatial`, `--md-sys-state-*`.
