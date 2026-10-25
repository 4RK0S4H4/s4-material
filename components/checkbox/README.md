# Checkbox

Picks any number of options, or confirms one thing before submitting. M3 checkbox on a native input.

```html
<label class="s4-checkbox"><input type="checkbox" checked><span class="s4-checkbox-box"></span>Remind Me</label>
<label class="s4-checkbox" data-indeterminate><input type="checkbox"><span class="s4-checkbox-box"></span>All Categories</label>
<label class="s4-checkbox" data-error><input type="checkbox" aria-invalid="true"><span class="s4-checkbox-box"></span>I approve this payment</label>
<!-- bare, in a table cell -->
<label class="s4-checkbox"><input type="checkbox" aria-label="Select Electric Co."><span class="s4-checkbox-box"></span></label>
```

| Attribute | Meaning |
|---|---|
| `checked`, `disabled` on the input | state |
| `input.indeterminate = true`, or `data-indeterminate` on the label | dash mark (checkbox.js sets the property; the first click clears it) |
| `data-error` on the label, or `aria-invalid="true"` on the input | error color |

18dp box, 2dp corners, 2dp on-surface-variant border; checked / indeterminate = primary fill with an on-primary mark that
wipes in on the fast-spatial spring. 40dp circular state layer (on-surface, primary when checked, error in error);
the bare checkbox is a 40dp square with a 48dp hit area.

**Do:** use for multi-select lists, table row selection, and "I agree" confirmations; give bare checkboxes an `aria-label`.
**Don't:** use a checkbox for an instant setting (use a [switch](../switch/)) or for one-of-many (use a [radio](../radio/)).

**Accessibility:** native checkbox (Space toggles, `mixed` announced for indeterminate); focus ring around the box;
forced-colors mode uses system colors.

**Tokens:** `--md-sys-color-primary`, `on-primary`, `on-surface-variant`, `error`, `on-error`,
`--md-sys-shape-corner-extra-small`, `--md-sys-motion-spring-fast-spatial`, `--md-sys-state-*`.
