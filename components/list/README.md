# List

Rows of the same kind: bills, vendors, accounts, settings. M3 lists with leading and trailing content, one to three
lines, selection, dividers, grouping with subtotals, and the M3 Expressive segmented style. Lists are solid content
surfaces, never glass. Also home of `.s4-avatar`.

```html
<ul class="s4-list">
  <li class="s4-list-subheader">This Week <span class="s4-list-subtotal">$1,629.95</span></li>
  <li>
    <a class="s4-list-item" href="/bills/10482">
      <span class="s4-list-leading"><span class="s4-avatar">IM</span></span>
      <span class="s4-list-content">
        <span class="s4-list-overline">Records Storage</span>
        <span class="s4-list-headline">Iron Mountain</span>
        <span class="s4-list-supporting">Due Oct 28</span>
      </span>
      <span class="s4-list-trailing"><span class="s4-list-amount">$1,240.00</span><span class="s4-status" data-tone="tertiary">Due</span></span>
    </a>
  </li>
</ul>

<!-- selectable: list.js -->
<ul class="s4-list" role="listbox" aria-label="Pay From">
  <li role="none"><div class="s4-list-item" role="option" aria-selected="true" data-value="operating">…</div></li>
</ul>
```

| Attribute / part | Values | Default |
|---|---|---|
| `.s4-list-item` element | `div` (static), `a` / `button` (opens or does something), `label` (toggles the checkbox or switch inside it), `[role=option]` in a listbox | — |
| `.s4-list-leading` | icon (24, on-surface-variant), `.s4-avatar` (40 circle, initials, primary-container), image (56), checkbox | — |
| `.s4-list-content` | `.s4-list-overline` (label-small), `.s4-list-headline` (body-large, one line), `.s4-list-supporting` (body-medium, on-surface-variant) | — |
| `.s4-list-trailing` | supporting text (label-small, tabular), icon, switch, `.s4-list-amount` (body-large, tabular) with a note or status under it | — |
| height | automatic: 56 one line; 72 with supporting text or overline; 88 with both (leading and trailing align to the top) | — |
| `data-lines` (list or item) | `2` (72, supporting text clamped to 1 line), `3` (88, clamped to 2 lines) | automatic |
| `aria-current` / `aria-selected="true"` | on the item (or its `li`): secondary-container, on-secondary-container | — |
| `aria-disabled="true"`, `:disabled`, or a disabled input inside | content at 38% | — |
| `data-dividers` (list) | 1px outline-variant line between items | — |
| `data-style="segmented"` (list) | M3E segmented: items 2 apart on surface-container-low (`--s4-list-segment-color`), extra-small inner corners, large outer corners per group | — |
| `.s4-list-subheader` (an `li`) | title-small, on-surface-variant; starts a group; optional `.s4-list-subtotal` at the end | — |
| `role="listbox"` + `aria-multiselectable` | list.js: roving focus, Up/Down/Home/End, click/Enter/Space selects; `s4-select` on the item, `s4-change { value }` on the list | single |

**When to use what:** a list for scanning items of one kind on any screen size; a [table](../table/) when people compare
several columns. Use **segmented** for settings-style groups on a plain surface; plain lists inside cards and panes.
Group by date or status with subheaders; put the group total in the subheader.

**Do**
- Keep the headline to one line; put detail in supporting text (sentence case).
- Right-align amounts in the trailing slot; they use tabular figures automatically.
- Use `aria-current="page"` for the current item in navigation lists, `aria-selected` only inside a listbox.

**Don't**
- Don't put two interactive controls in one interactive item (a link item with a switch in it).
- Don't mix one-, two- and three-line items in a list without reason; set `data-lines` on the list to even them out.
- Don't show status by color alone; use a [status](../status/) pill with a label.

**Accessibility:** a `<ul>` of real links, buttons or labels needs no script. Interactive items have the shared state
layer and an inner focus ring (so it isn't clipped by a scrolling parent). A `label` item makes the whole row the
checkbox's or switch's label. Listboxes follow the WAI-ARIA listbox pattern. Forced-colors mode outlines the selected item
and segmented items.

**Tokens:** `--s4-size-list-item-one-line` / `-two-line` / `-three-line`, `--s4-shape-list-segment`,
`--s4-shape-list-group`, `--md-sys-color-secondary-container`, `--md-sys-color-on-secondary-container`,
`--md-sys-color-surface-container-low`, `--md-sys-color-primary-container`, `--md-sys-color-outline-variant`,
`--md-sys-typescale-body-large-*`, `-body-medium-*`, `-label-small-*`, `-title-small-*`, `-title-medium-*`,
`--md-sys-state-*`.
