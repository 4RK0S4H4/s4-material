# Table

S4 addition (M3 has no current data table spec). Compares rows across columns: bills, payments, invoices. Sorting,
row selection, clickable rows, a sticky header, and a stacked layout on phones so nothing scrolls sideways. Tables are
solid content surfaces, never glass.

```html
<div class="s4-table-wrap" data-sticky>
  <table class="s4-table">
    <caption>October Bills</caption>
    <thead><tr>
      <th scope="col" data-check><label class="s4-checkbox"><input type="checkbox" aria-label="Select All Bills"><span class="s4-checkbox-box"></span></label></th>
      <th scope="col" data-primary aria-sort="none"><button type="button" class="s4-table-sort">Vendor<span class="s4-icon" data-icon="chevron-down"></span></button></th>
      <th scope="col">Status</th>
      <th scope="col" class="num" aria-sort="none"><button type="button" class="s4-table-sort">Amount<span class="s4-icon" data-icon="chevron-down"></span></button></th>
    </tr></thead>
    <tbody>
      <tr tabindex="0">
        <td data-check><label class="s4-checkbox"><input type="checkbox" aria-label="Select Iron Mountain INV-10482"><span class="s4-checkbox-box"></span></label></td>
        <td><a href="/bills/10482">Iron Mountain</a></td>
        <td><span class="s4-status" data-tone="tertiary">Due</span></td>
        <td class="num" data-value="1240">$1,240.00</td>
      </tr>
    </tbody>
    <tfoot><tr><th scope="row" colspan="3">Total</th><td class="num">$1,240.00</td></tr></tfoot>
  </table>
</div>
```

| Attribute / part | Values | Default |
|---|---|---|
| `.s4-table-wrap` | surface-container-low, large corners, scrolls sideways if it must; the container the compact layout measures | — |
| `data-sticky` (wrap or table) | header stays at the top while rows scroll inside the wrap; height from `--s4-table-max-height` | header + 8 rows |
| `th`, `td` | header 56 (title-small, on-surface-variant), rows 52 (body-medium), 16 side padding, tabular figures | — |
| `.num` on `th` / `td` | right-aligned (table.js copies it from the header to the column's cells) | start |
| `data-wrap` on `th` / `td` | let a long column wrap (min 192) | no wrap |
| `th[aria-sort]` + `button.s4-table-sort` | click cycles `ascending` → `descending` → `none` (original order); sorts each tbody by `data-value` or text; `s4-change { type: 'sort', column, label, direction }` | — |
| `data-value` on `td` | the sort key: a number for amounts, an ISO date for dates | the text |
| `th[data-check]`, `td[data-check]` | checkbox column; header box selects all (indeterminate for some); checked rows get secondary-container; `s4-change { type: 'select', rows }` | — |
| `tr[tabindex="0"]` | clickable row: state layer, click or Enter fires `s4-select { row }` and follows the row's first link | — |
| `th[data-primary]` | in the stacked layout, that column's cell is the block's headline | — |
| `data-label` on `td` | column name shown in the stacked layout; table.js copies it from the header; `data-label=""` hides it | header text |
| `tfoot` | totals, title-small | — |

**Compact (the wrap under 600):** each row becomes a block: the primary cell as a headline, then one line per cell with
its column name on the left and the value on the right. The header row becomes a toolbar with select-all and the sort
buttons; plain column names are hidden (each cell carries its own). A selectable row's checkbox sits at the block's top
start.

**When to use what:** a table when people compare values across columns or sort; a [list](../list/) when each item is
read on its own. Keep tables to the columns that matter; put the rest on the detail page.

**Do**
- Right-align amounts and counts (`.num`), and give them `data-value` so they sort as numbers.
- Make one column `data-primary` (usually the name) so stacked rows read well on phones.
- Show status with a [status](../status/) pill (a label and a tone).
- Label every row checkbox with what it selects ("Select Staples INV-10451").

**Don't**
- Don't make a row clickable and also fill it with buttons; one action per row, or a trailing icon button with
  `tabindex` off the row.
- Don't rely on sideways scrolling on phones; the stacked layout is there so you don't need it.
- Don't sort columns where order means nothing (descriptions).

**Accessibility:** a real `<table>` with `<caption>`, `scope`d headers and `aria-sort`, so screen readers announce the
column and sort order. Sorting is a native button in the header. Clickable rows are focusable with an inner focus ring and
open on Enter; the link inside stays the accessible way in. Forced-colors mode draws the wrap's border and outlines
checked rows.

**Tokens:** `--s4-size-table-header`, `--s4-size-table-row`, `--s4-size-touch-target`, `--md-sys-shape-corner-large`,
`--md-sys-color-surface-container-low`, `--md-sys-color-secondary-container`, `--md-sys-color-on-secondary-container`,
`--md-sys-color-outline-variant`, `--md-sys-typescale-title-small-*`, `-body-medium-*`, `-title-medium-*`,
`-label-large-*`, `--md-sys-state-*`, `--md-sys-motion-spring-spatial` (rows slide into their sorted place),
`--md-sys-motion-spring-fast-spatial` (sort arrow).
