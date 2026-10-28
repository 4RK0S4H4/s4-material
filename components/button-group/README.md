# Button Group

Groups related buttons. A **standard** group reacts as one when pressed; a **connected** group joins buttons into a
single control for choosing between options (M3 Expressive's replacement for segmented buttons).

```html
<!-- standard: actions -->
<div class="s4-button-group">
  <button class="s4-button" data-variant="tonal" type="button">Edit</button>
  <button class="s4-button" type="button">Mark Paid</button>
</div>

<!-- connected, single select -->
<div class="s4-button-group" data-connected data-select="single" aria-label="Period">
  <button class="s4-button" data-variant="tonal" type="button" value="week">Week</button>
  <button class="s4-button" data-variant="tonal" type="button" value="month" aria-pressed="true">Month</button>
  <button class="s4-button" data-variant="tonal" type="button" value="year">Year</button>
</div>
```

| Attribute (on the group) | Values | Default |
|---|---|---|
| `data-connected` | buttons 2dp apart, outer corners full, inner corners medium (xs small, l large-increased, xl extra-large); the selected button morphs fully round | standard: 8dp apart |
| `data-select` | `single` (exactly one pressed, radio-like), `multi` (each toggles) | none: plain buttons |
| `data-fit` | `content`: as wide as the labels | connected groups stretch to fill (equal weights) |
| `aria-label` | names the choice ("Period") | — |

Children are `.s4-button` or `.s4-icon-button`; the group follows their `data-size`. Standard groups have the M3
Expressive press interaction: the pressed button widens ~15% while its neighbours give way (fast-spatial spring).

**Behaviour** (`button-group.js`): manages `aria-pressed` for `data-select`, fires `s4-change { value, values, button }`
on the group (`value` is the pressed button's `value` attribute, or the array of values for multi). Connected and
selecting groups are one tab stop (roving tabindex): Arrow keys move focus (RTL aware), Home / End jump, Space / Enter
press; disabled buttons are skipped. Groups get `role="group"`.

**When to use what:** connected + `single` for 2–5 mutually exclusive views or filters (Week / Month / Year);
connected + `multi` for independent options shown together; standard for a set of related actions.

**Do**
- Give each button a `value` and the group an `aria-label`.
- Keep labels short and parallel; use the same variant and size for every button in a group.

**Don't**
- Don't put more than five options in a connected group; use a select or chips.
- Don't mix connected groups with unrelated actions.

**Accessibility:** buttons stay native `<button>`s with `aria-pressed`; one tab stop per group with arrow keys; focus
ring stays above neighbours; forced-colors mode draws borders.

**Tokens:** `--s4-space-2` (gap), `--md-sys-shape-corner-*` (inner, pressed and selected corners),
`--md-sys-motion-spring-fast-spatial` (press and shape morph), plus the button and icon-button tokens.
