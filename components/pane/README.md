# Pane

S4 addition. A solid section of a page: a group of settings, a form, or a block on a dashboard. Title, optional
supporting text, then content.

```html
<section class="s4-pane" aria-labelledby="autopay">
  <h2 class="s4-pane-title" id="autopay">Autopay</h2>
  <p class="s4-pane-supporting">Pay recurring bills from your operating account on the due date.</p>
  …
</section>

<section class="s4-pane" data-color="error" aria-labelledby="danger">
  <h2 class="s4-pane-title" id="danger">Delete Workspace</h2>
  <p class="s4-pane-supporting">This deletes every bill, receipt and vendor. You can't undo this.</p>
  <div class="s4-row"><button class="s4-button" data-color="error" type="button">Delete Workspace</button></div>
</section>
```

| Attribute / part | Values | Default |
|---|---|---|
| `data-color` | `lowest` (surface-container-lowest), `high` (surface-container-high), `error` (danger zone: error-container, on-error-container) | surface-container-low |
| `.s4-pane-title` | title-medium | — |
| `.s4-pane-supporting` | body-medium, on-surface-variant, 4 below the title | — |
| `--s4-pane-padding` | override the padding | 24, or 16 under 600 |

Children are stacked 16 apart. Padding follows the space the pane sits in: 24 from the medium window class up, 16 when
compact. That's a container measurement (`cqi` against the nearest container, such as the app's content area, or the
viewport when there is none), so a pane works with or without a container ancestor. The pane is itself an inline-size
container, so lists, tables and grids inside it can adapt to it.

**When to use what:** a **pane** groups related settings or fields under a heading; a [card](../card/) is one item among
many. Use `lowest` or `high` only to separate a pane from a neighbour or a parent of the same color. Use `error` once per
page, last, for destructive settings.

**Do**
- Give every pane a title in Title Case, and use supporting text in sentence case to say what the section is for.
- Use the heading level that fits the page outline (the class sets the look, not the level).

**Don't**
- Don't nest panes of the same color.
- Don't make panes glass; they are content surfaces.
- Don't fill a whole page with `data-color="error"` panes.

**Accessibility:** use `<section aria-labelledby>` so each pane is a named region. The error pane's text uses
on-error-container, which the token build checks at AA. Forced-colors mode draws a real border.

**Tokens:** `--s4-shape-pane`, `--s4-space-4`, `--s4-space-6`, `--s4-breakpoint-medium`,
`--md-sys-color-surface-container-low` / `-lowest` / `-high`, `--md-sys-color-error-container`,
`--md-sys-color-on-error-container`, `--md-sys-typescale-title-medium-*`, `--md-sys-typescale-body-medium-*`.
