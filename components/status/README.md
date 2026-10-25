# Status

S4 addition. A small pill that names the state of a thing: a bill, a payment, a sync. The label always says the status
in words; the tone and the optional dot only reinforce it, so status never relies on color alone.

```html
<span class="s4-status">Paid</span>
<span class="s4-status" data-tone="tertiary">Due</span>
<span class="s4-status" data-tone="error" data-dot>Overdue</span>
<span class="s4-status"><span class="s4-icon" data-icon="check"></span>Paid</span>
```

| Attribute | Values | Default |
|---|---|---|
| `data-tone` | `primary`, `secondary`, `tertiary`, `error`: the matching container / on-container roles | neutral: surface-container-high / on-surface-variant |
| `data-dot` | a 6dp leading dot in the text color | — |
| leading `.s4-icon` | a 16dp icon instead of the dot | — |

24 high, 8 side padding, small corners (8), label-medium, tabular figures, no wrapping.

**When to use what:** pick tones by meaning and keep them consistent across an app. For bills: Paid is neutral,
Scheduled is primary, In Review is secondary, Due is tertiary, Overdue and Failed are error. Use one error tone per
meaning; don't escalate with more colors.

**Do**
- Use one or two words in Title Case ("Due", "Payment Failed"); add a date when it helps ("Due Nov 2").
- Put the pill next to the thing it describes (in the row, after the amount).

**Don't**
- Don't make a status clickable; to filter by status, use a filter chip.
- Don't use the error tone for anything that isn't a problem.
- Don't use a badge for status; badges count things.

**Accessibility:** the text is the status, so screen readers read it as is, and it works in grayscale and forced colors
(which draws a border). Container / on-container pairs pass AA in every scheme.

**Tokens:** `--md-sys-color-surface-container-high`, `--md-sys-color-on-surface-variant`,
`--md-sys-color-{primary,secondary,tertiary,error}-container`, `--md-sys-color-on-{primary,secondary,tertiary,error}-container`,
`--md-sys-typescale-label-medium-*`, `--md-sys-shape-corner-small`, `--s4-space-1`, `--s4-space-2`, `--s4-space-6`.
