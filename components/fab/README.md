# FAB

The floating action button holds the most important action on a screen. M3 Expressive sizes: FAB 56, medium 80,
large 96, each also as an extended FAB with a label.

```html
<button class="s4-fab" type="button" aria-label="Add Bill"><span class="s4-icon" data-icon="add"></span></button>
<button class="s4-fab" data-size="m" data-color="secondary-container" type="button">
  <span class="s4-icon" data-icon="camera"></span><span class="s4-fab-label">Scan Receipt</span>
</button>
<button class="s4-fab" data-fixed type="button"><span class="s4-icon" data-icon="add"></span><span class="s4-fab-label">Add Bill</span></button>
```

| Attribute | Values | Default |
|---|---|---|
| `data-size` | (default) 56 · corner large · icon 24 · label title-medium; `m` 80 · large-increased · 28 · title-large; `l` 96 · extra-large · 36 · headline-small | 56 |
| `data-color` | `primary-container`, `secondary-container`, `tertiary-container`, `primary`, `secondary`, `tertiary` | `primary-container` |
| `.s4-fab-label` | makes it an extended FAB | — |
| `data-collapsed` | folds an extended FAB back to its icon (width animation), e.g. while a list scrolls | — |
| `data-fixed` | pins it 16dp from the bottom end corner, above the safe area, at `--s4-z-fab` | — |
| `aria-label` | required when there's no label | — |

Elevation level 3, level 4 on hover; the shared state layer for hover / focus / press.

**Do**
- Use one FAB per screen, for a constructive action (Add Bill, Scan Receipt, Pay).
- Use the extended FAB when the icon alone isn't obvious.

**Don't**
- Don't use a FAB for minor or destructive actions (Delete, Settings).
- Don't put two FABs on one screen; use a FAB plus regular buttons.

**Accessibility:** native `<button>`, at least 56dp; icon-only FABs need `aria-label`; when collapsed, the label text stays
in the accessibility tree; forced-colors mode draws a border.

**Tokens:** `--s4-size-fab`, `--s4-size-fab-large`, `--s4-shape-fab`, `--s4-shape-fab-large`,
`--md-sys-shape-corner-large-increased`, `--md-sys-elevation-level3/4`, `--md-sys-typescale-title-medium/title-large/headline-small-*`,
`--md-sys-motion-spring-spatial` (collapse), `--s4-z-fab`.
