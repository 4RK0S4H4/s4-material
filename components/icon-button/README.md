# Icon Button

Runs one action with one icon. M3 Expressive icon buttons: four variants, five sizes, three widths, round or square,
toggleable, with the same press morph as the [button](../button/).

```html
<button class="s4-icon-button" type="button" aria-label="Edit Bill"><span class="s4-icon" data-icon="edit"></span></button>
<button class="s4-icon-button" data-variant="filled" data-size="m" type="button" aria-label="Add Bill"><span class="s4-icon" data-icon="add"></span></button>
<button class="s4-icon-button" data-variant="tonal" data-toggle aria-pressed="false" type="button" aria-label="Remind Me"><span class="s4-icon" data-icon="notifications"></span></button>
<button class="s4-icon-button" data-toggle aria-pressed="false" aria-label="Show Amounts" data-label-on="Hide Amounts" data-icon-on="hidden" type="button"><span class="s4-icon" data-icon="visible"></span></button>
```

| Attribute | Values | Default |
|---|---|---|
| `aria-label` | what the button does, Title Case | required |
| `data-variant` | `standard`, `filled`, `tonal`, `outlined` | `standard` (no container, on-surface-variant icon) |
| `data-size` | `xs` (32), `s` (40), `m` (56), `l` (96), `xl` (136); icons 20 / 24 / 24 / 32 / 40 | `s` |
| `data-width` | `narrow`, `default`, `wide` (e.g. s: 32 / 40 / 52) | `default` |
| `data-shape` | `round`, `square` | `round` |
| `data-toggle` + `aria-pressed` | toggle; `data-icon-on/off` swap the icon, `data-label-on/off` swap the `aria-label` | — |

Toggle colors (M3 Expressive): standard selected = primary icon; filled unselected = surface-container with
on-surface-variant icon, selected = primary / on-primary; tonal unselected = secondary-container, selected = secondary /
on-secondary; outlined selected = inverse-surface. A selected toggle swaps shape (round → square, square → round).
`icon-button.js` flips `aria-pressed` and fires `s4-toggle { pressed }`; inside a selecting [button group](../button-group/)
the group manages it instead.

**When to use what:** **standard** in toolbars, app bars and list rows; **filled** for the one key action in a compact
spot; **tonal** for a strong secondary action; **outlined** next to filled/tonal ones for a quieter alternative.

**Do**
- Always give an `aria-label` that names the action ("Delete Electric Co.", not "Trash").
- Use toggles for on/off states (favorite, bookmark, show amounts) and swap the label with `data-label-on`.

**Don't**
- Don't use an icon button when the icon alone isn't clear; use a [button](../button/) with a label.
- Don't color a per-row delete red.

**Accessibility:** native `<button>`; 48dp touch target at every size; the M3 focus ring; toggles expose `aria-pressed`;
disabled uses M3's 12% / 38%; forced-colors mode draws a border on contained variants.

**Tokens:** `--s4-shape-icon-button`, `--md-sys-shape-corner-*` (square and pressed shapes), `--s4-size-icon-button`,
`--s4-size-button-*`, `--s4-size-icon*`, `--md-sys-motion-spring-fast-spatial` (shape morph), `--md-sys-state-*`.
