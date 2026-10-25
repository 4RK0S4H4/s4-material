# Switch

Turns a single setting on or off immediately (Autopay, Remind Me). M3 switch, built on a native checkbox.

```html
<label class="s4-switch"><input type="checkbox" role="switch" checked><span class="s4-switch-track"><span class="s4-switch-handle"></span></span>Autopay</label>
<label class="s4-switch" data-icons>Email Receipts<input type="checkbox" role="switch"><span class="s4-switch-track"><span class="s4-switch-handle"></span></span></label>
```

| Attribute | Meaning |
|---|---|
| `role="switch"` on the input | announces on/off instead of checked |
| `checked` / `disabled` on the input | state |
| `data-icons` on the label | check (on) / close (off) icon in the handle; the off handle grows to 24dp |
| label text before the track | end-aligns the switch (settings rows, with `justify-content: space-between`) |

Track 52×32 (`--s4-space-12 + --s4-space-1` × `--s4-space-8`). Off: surface-container-highest with a 2dp outline border and
a 16dp outline handle. On: primary track, 24dp on-primary handle. Pressed: 28dp. The handle slides and resizes on the
fast-spatial spring; colors on fast-effects. 40dp state layer circle around the handle; 48dp target.

**Do:** use for settings that apply at once; label what is on ("Pay Bills Automatically").
**Don't:** use in a form that needs Save (use a [checkbox](../checkbox/)); don't put "On/Off" in the label.

**Accessibility:** native checkbox with `role="switch"` under the label, so Space toggles and screen readers announce
on/off; focus ring on the track; forced-colors mode uses system colors.

**Tokens:** `--md-sys-color-primary`, `on-primary`, `primary-container`, `surface-container-highest`, `outline`,
`--md-sys-motion-spring-fast-spatial`, `--md-sys-state-*`, `--s4-size-touch-target`.
