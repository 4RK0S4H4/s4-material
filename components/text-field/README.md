# Text Field

Lets people enter and edit text. M3 filled and outlined text fields with a floating label, icons, prefix / suffix,
supporting text, counter, error state, select and auto-growing textarea. 56dp tall, tabular figures.

```html
<div class="s4-text-field">
  <span class="s4-text-field-affix" data-prefix>$</span>
  <input id="amount" inputmode="decimal" value="1,240.00">
  <label for="amount">Amount</label>
  <span class="s4-text-field-affix" data-suffix>USD</span>
  <div class="s4-text-field-supporting">Includes tax.</div>
</div>

<div class="s4-text-field" data-variant="outlined">
  <span class="s4-icon" data-icon="search"></span>
  <input id="q" type="search">
  <label for="q">Search Bills</label>
  <button class="s4-icon-button" type="button" aria-label="Clear Search"><span class="s4-icon" data-icon="close"></span></button>
</div>

<div class="s4-text-field" data-error="Enter an amount above $0.00."> … </div>
<div class="s4-text-field"><select id="cat"><option value=""></option><option>Utilities</option></select><label for="cat">Category</label></div>
<div class="s4-text-field" data-counter><textarea id="notes" rows="1" maxlength="120"></textarea><label for="notes">Notes</label></div>
```

| Part / attribute | Meaning |
|---|---|
| `<input id>` / `<select>` / `<textarea>` + `<label for>` | the control and its floating label (body large → body small) |
| `data-variant="outlined"` | outlined; default is filled (surface-container-highest, top corners `--s4-shape-text-field`, 1dp indicator → 2dp primary on focus) |
| `.s4-icon` / `.s4-icon-button` before the control | leading icon (12dp from the edge, 16dp to the text) |
| `.s4-icon` / `.s4-icon-button` after the control | trailing icon or action |
| `.s4-text-field-affix[data-prefix]` / `[data-suffix]` | "$", "kg": shown once the label floats |
| `.s4-text-field-supporting` | helper text, sentence case |
| `data-counter` | "length / maxlength" at the end of the supporting line |
| `data-error="Message"` (or `aria-invalid="true"` on the control) | error color; the message replaces the helper text |
| `disabled` on the control | M3 disabled: 4% container, 38% content |

**Behaviour** (`text-field.js`): adds `placeholder=" "` so the label can float with `:placeholder-shown` (a real
placeholder is shown only while focused); injects the outlined notch; adds a chevron to selects and opens the picker
when the field is clicked; grows textareas; links supporting text with `aria-describedby`; keeps `aria-invalid` and the
error message in sync with `data-error`. Selects float their label when a non-empty option is chosen (`value=""` keeps
it resting); date/time inputs always float.

**The outlined notch** is a real `<fieldset><legend>` drawn behind the control (`.s4-text-field-outline`, `aria-hidden`).
The browser cuts the border around the legend, which holds an invisible copy of the label at body-small, so the gap is
exactly the label's width on any background — glass, images, gradients — with no background patch to match. The legend
width animates open on the same calm spring as the label.

**Do**
- Title Case labels ("Due Date"), sentence-case helper and error text that says how to fix it.
- Use `inputmode="decimal"` and a `$` prefix for amounts; the field already uses tabular figures.

**Don't**
- Don't use the placeholder as the label.
- Don't put helper text and an error in two places; `data-error` replaces the helper text.

**Accessibility:** native controls with real `<label for>`; supporting text is `aria-describedby`; errors set
`aria-invalid`; the active indicator / outline is the focus indication (M3); the whole container is a click target;
forced-colors mode draws real borders.

**Tokens:** `--s4-size-text-field`, `--s4-shape-text-field`, `--md-sys-color-surface-container-highest`,
`--md-sys-typescale-body-large/body-small-*`, `--s4-motion-spring-fast-spatial-calm` (label), `--md-sys-state-*`.
