# Top App Bar

The screen's title, its navigation button and up to three actions. M3 Expressive small, medium and large bars.

```html
<header class="s4-top-app-bar">
  <button class="s4-icon-button" type="button" aria-label="Back"><span class="s4-icon" data-icon="back"></span></button>
  <div class="s4-app-bar-title-group">
    <h1 class="s4-app-bar-title">Iron Mountain</h1>
    <p class="s4-app-bar-subtitle">12 Bills · $14,880.00 This Year</p>
  </div>
  <div class="s4-app-bar-actions">
    <button class="s4-icon-button" type="button" aria-label="Search"><span class="s4-icon" data-icon="search"></span></button>
  </div>
</header>
<header class="s4-top-app-bar" data-size="large">…</header>
```

| Attribute / part | Values | Default |
|---|---|---|
| `data-size` | `medium` (112, 136 with subtitle; headline-medium), `large` (120, 152; display-small) | small (64; title-large) |
| `data-align` | `center` (small only) | start |
| `data-scrolled` | set by `top-app-bar.js` while content is under the bar | — |
| `.s4-app-bar-title-group` | `.s4-app-bar-title` + optional `.s4-app-bar-subtitle` | — |
| `.s4-app-bar-actions` | trailing icon buttons (at most 3; put the rest in a "More Options" menu) | — |
| any other child | the leading slot (navigation icon button) | — |

**When to use what:** **small** for most screens and every detail screen; **medium** or **large** for a top-level
screen where the title deserves weight (Budget, Reports). They collapse into the small bar on scroll.

**Behaviour:** sticky at the top of its scroll container (the window, or the nearest scrolling ancestor). At rest the
bar is `surface`; once content scrolls under it, `data-scrolled` switches it to `surface-container` (and glass.css turns
that into glass). Medium and large stick with a negative `top`, so only the 64dp row stays; the JS slides that row down
as the headline scrolls away, clips and fades the headline, and fades a small copy of the title (`aria-hidden`) into the
row. Changing `.s4-app-bar-title` text updates the copy.

**Do**
- Use Title Case titles; keep them short enough for one line on a phone.
- Put the screen's search behind a Search action or a [search bar](../search/) in the content, not in the title.

**Don't**
- Don't put text buttons and icon buttons together in the actions; use icon buttons with `aria-label`.
- Don't use medium or large on screens that also have tabs directly under the bar.

**Accessibility:** use a real heading (`h1`) for the title. Icon buttons need `aria-label`. The collapsed title copy
is hidden from assistive tech. Pads for the notch with `env(safe-area-inset-*)`.

**Tokens:** `--s4-size-top-app-bar`, `--s4-z-app-bar`, `--md-sys-color-surface` / `-surface-container`,
`--md-sys-typescale-title-large-*`, `-headline-medium-*`, `-display-small-*`, `--md-sys-motion-spring-effects`.
