# Card

Holds content and actions about one subject. M3 cards: elevated, filled and outlined, with optional media, body and
actions. Cards are content surfaces: always solid, never glass.

```html
<article class="s4-card" aria-labelledby="bill-1">
  <div class="s4-card-media"><img src="receipt.jpg" alt=""></div>
  <div class="s4-card-body">
    <h3 class="s4-card-title" id="bill-1">Iron Mountain</h3>
    <p class="s4-card-subhead">Records storage · Due Oct 28</p>
    <p class="s4-card-supporting">Offsite boxes and shredding for the Denver office.</p>
  </div>
  <div class="s4-card-actions">
    <button class="s4-button" data-variant="text" type="button">Details</button>
    <button class="s4-button" type="button">Pay Now</button>
  </div>
</article>

<a class="s4-card" data-variant="outlined" href="/bills/10451">…</a>   <!-- the whole card opens something -->
```

| Attribute / part | Values | Default |
|---|---|---|
| `data-variant` | `elevated` (surface-container-low, level 1), `filled` (surface-container-highest), `outlined` (surface + outline-variant) | `elevated` |
| `.s4-card-media` | image, video or SVG area; takes the card's top corners (bottom corners when last). `--s4-card-media-ratio` sets the aspect ratio | 16 / 9 |
| `.s4-card-body` | 16 padding; `.s4-card-title` (title-medium), `.s4-card-subhead` and `.s4-card-supporting` (body-medium, on-surface-variant) | — |
| `.s4-card-actions` | buttons, end-aligned, 8 apart; pushed to the bottom in a grid of cards | — |
| `a.s4-card`, `button.s4-card` | interactive card: state layer from base; hover raises elevated to level 2, filled and outlined to level 1 | — |
| `disabled` / `aria-disabled="true"` | container at 38%, content on-surface at 38%, outline at 12% | — |

**When to use what:** **elevated** to lift a card off a busy page; **filled** for quiet grouping; **outlined** when cards
sit on a surface of the same color or in dense grids. For a section of settings or a form, use a [pane](../pane/) instead.

**Do**
- Make the whole card a link or button when it opens one thing, and keep other buttons out of it.
- Put the main figure (an amount, a count) in tabular figures.
- Keep a card's actions to two, the main one filled or tonal.

**Don't**
- Don't nest cards, or put a card inside a card-colored pane without changing one of the surfaces.
- Don't put buttons or links inside an interactive card (nested interactive content).
- Don't add glass or blur to cards.

**Accessibility:** a static card is an `<article>` labelled by its title. An interactive card is one native `<a>` or
`<button>`, so it is a single tab stop with the M3 focus ring; its text is its accessible name, so keep it short.
Forced-colors mode draws a real border.

**Tokens:** `--s4-shape-card`, `--md-sys-color-surface-container-low` / `-highest`, `--md-sys-color-surface`,
`--md-sys-color-outline-variant`, `--md-sys-elevation-level0`–`2`, `--md-sys-typescale-title-medium-*`,
`--md-sys-typescale-body-medium-*`, `--md-sys-state-*`, `--md-sys-motion-spring-fast-effects`.
