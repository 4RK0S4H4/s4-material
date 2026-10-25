# Tabs

Switch between related views of the same content at one level. M3 primary and secondary tabs.

```html
<div class="s4-tabs" role="tablist" aria-label="Bill Status">
  <button class="s4-tab" type="button" role="tab" id="tab-due" aria-controls="panel-due" aria-selected="true">Due</button>
  <button class="s4-tab" type="button" role="tab" id="tab-paid" aria-controls="panel-paid" aria-selected="false">Paid</button>
</div>
<div class="s4-tab-panel" role="tabpanel" id="panel-due" aria-labelledby="tab-due">…</div>
<div class="s4-tab-panel" role="tabpanel" id="panel-paid" aria-labelledby="tab-paid" hidden>…</div>
```

| Attribute | Values | Default |
|---|---|---|
| `data-variant` | `secondary` | primary |
| `data-scrollable` | tabs keep their width; the row scrolls sideways | fixed (tabs share the width) |
| `aria-selected` | `true` on the current tab | first tab |
| `aria-controls` | id of the tab's panel | — |
| icon | `<span class="s4-icon" data-icon="…">` before the label: stacked (64dp) in primary, inline in secondary | — |

**When to use what:** **primary** tabs right under the top app bar to organize the whole screen; **secondary** tabs inside
a content area (a card, a pane) to divide it further. Use **scrollable** for more than about 4 tabs on a phone.

**Behaviour (`tabs.js`):** one indicator slides between tabs on the spatial spring (content width, 3dp, rounded top for
primary; full width, 2dp for secondary). Panels switch with the shared axis pattern: the old panel slides 30px away and
fades out, the new one slides in from the side of the newly selected tab. Keys: Left / Right (wrapping), Home / End,
with automatic activation and a roving tabindex. Fires `s4-change { tab, index, panel }` on the tab list. Missing ids,
roles and `aria-labelledby` are filled in. Without JS each selected tab draws its own indicator.

**Do**
- Use short Title Case labels (one or two words) and keep the tab order stable.
- Put tabs at the top of the content they switch.

**Don't**
- Don't use tabs for a sequence of steps or for actions.
- Don't nest primary tabs inside primary tabs; use secondary tabs.

**Accessibility:** WAI-ARIA tabs pattern; the tab list is one tab stop and panels are focusable. Selected uses color
and the indicator (and a solid icon), not color alone. Inner focus ring so a scrolling row never clips it. Forced colors:
the indicator uses Highlight and the row gets a border.

**Tokens:** `--s4-size-touch-target`, `--md-sys-typescale-title-small-*`, `--md-sys-color-primary`,
`--md-sys-color-on-surface-variant`, `--md-sys-color-surface-variant` (divider), `--s4-motion-pattern-shared-axis-distance`,
`--md-sys-motion-spring-spatial`, `--md-sys-motion-spring-effects`.
