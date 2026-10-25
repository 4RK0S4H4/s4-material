# App Shell

The page frame: navigation, top app bar and content, adapting to the window size class (M3 canonical layout).

```html
<div class="s4-app">
  <nav class="s4-nav-rail" aria-label="Main">…</nav>
  <div class="s4-app-body">
    <header class="s4-top-app-bar">…</header>
    <main class="s4-content">
      <section class="s4-view" data-view="home" data-title="Home">…</section>
      <section class="s4-view" data-view="bills" data-title="Bills" hidden>…</section>
    </main>
  </div>
  <nav class="s4-nav-bar" aria-label="Main">…</nav>
</div>
```

| Part / attribute | Purpose |
|---|---|
| `.s4-app` | Size container named `s4-app`; a grid of rail + body, nav bar underneath. At least the full viewport height. |
| `.s4-nav-rail` | Optional. Shown from 840 (expanded), sticky at the left, full height. |
| `.s4-app-body` | Column holding the top app bar and the content. |
| `.s4-content` | Margins 16 (< 600) / 24 (≥ 600), width capped at `--s4-layout-content-max`, safe-area insets. |
| `.s4-nav-bar` | Optional. Shown under 840, sticky at the bottom. |
| `.s4-view[data-view][data-title]` | Optional sibling destinations. A nav item with the same `data-view` switches to it (shared axis) and sets the top app bar title to `data-title`. |
| `--s4-content-max` | Set on `.s4-app` to change the content cap (e.g. `none` for a full-width table). |
| `--s4-app-inset-bottom` | Read-only: how much of the bottom is covered (nav bar + home indicator). Use it to float a FAB or toolbar above the bar. |
| `.s4-page-header`, `.s4-section`, `.s4-section-title` | Page helpers: a title + actions row, a section with vertical rhythm, a section heading (title-medium, emphasized). |

| Window | Width | Navigation | Margins |
|---|---|---|---|
| Compact | < 600 | Nav bar at the bottom | 16 |
| Medium | 600–839 | Nav bar, items horizontal | 24 |
| Expanded+ | ≥ 840 | Nav rail at the left | 24 |

**Scrolling:** the window scrolls, not an inner box. On phones this keeps the browser's collapsing toolbars, pull to
refresh and scroll-to-top on status bar tap. The top app bar is sticky at the top, the rail sticky at the side, the nav
bar sticky at the bottom. Sticky keeps the nav bar in the page flow, so it never covers the last content and nothing
needs bottom padding. Size classes are container queries on `.s4-app`, so the shell also works inside a frame.

**Behaviour (`app.js`):** the nav bar and rail of one app stay in sync (same index). With views, a destination change
runs the shared axis transition (old view slides 30px toward where you came from and fades; new one slides in from the
side you're heading, spatial spring for movement, effects for fades), scrolls to the top and fires
`s4-change { view, previous }` on `.s4-app`. `S4.app.go(app, 'bills')` switches from code.

**Do**
- Use the same destinations, in the same order, in the nav bar and the rail.
- Put a FAB or floating toolbar at `bottom: calc(var(--s4-app-inset-bottom) + var(--s4-space-4))`.
- Use window scroll; if you need an inner scroller (a split pane), give that pane its own top app bar.

**Don't**
- Don't use `position: fixed` bars inside `.s4-app`; the shell already places them.
- Don't wrap `.s4-app` in another full-height scroll container: the bars are sticky to the window.

**Accessibility:** `main`, `nav` and `header` landmarks; give each `nav` an `aria-label`. Views that aren't shown are
`hidden`, so they leave the accessibility tree. Content and bars respect the notch and home indicator (`viewport-fit=cover`).

**Tokens:** `--s4-layout-margin-compact`, `--s4-layout-margin`, `--s4-layout-content-max`, `--s4-size-nav-bar`,
`--s4-z-navigation`, `--s4-motion-pattern-shared-axis-distance`, `--md-sys-motion-spring-spatial`, `--md-sys-motion-spring-effects`.
