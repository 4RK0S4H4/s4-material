# Radio Button

Picks exactly one option from a short visible list. M3 radio button on a native input.

```html
<fieldset>
  <legend>Pay With</legend>
  <label class="s4-radio"><input type="radio" name="pay" value="checking" checked><span class="s4-radio-ring"></span>Checking •••• 4021</label>
  <label class="s4-radio"><input type="radio" name="pay" value="card"><span class="s4-radio-ring"></span>Card •••• 8830</label>
</fieldset>
```

| Attribute | Meaning |
|---|---|
| `name`, `value`, `checked`, `disabled` on the input | native radio group |
| `data-error` on the label, or `aria-invalid="true"` | error color for an unanswered required group |

20dp ring with a 2dp stroke (on-surface-variant); selected = primary ring with a 10dp dot that grows in on the
fast-spatial spring. 40dp circular state layer; 48dp hit area. No JS.

**Do:** group with `<fieldset>` + `<legend>` (or `role="radiogroup"` + `aria-label`); keep 2–7 options.
**Don't:** use radios for a single on/off choice, or for long lists (use a select in a [text field](../text-field/)).

**Accessibility:** native radios: Tab into the group, arrow keys move and select; focus ring around the ring;
forced-colors mode uses system colors.

**Tokens:** `--md-sys-color-primary`, `on-surface-variant`, `on-surface`, `error`, `--s4-space-5`,
`--md-sys-motion-spring-fast-spatial`, `--md-sys-state-*`.
