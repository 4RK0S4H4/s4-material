# Swatches

S4's seed-color picker, like Android's Wallpaper & style: each swatch previews the palette a seed makes, and picking one
themes the app.

```html
<div class="s4-swatches" data-theme-seed aria-label="Theme Color">
  <button class="s4-swatch" type="button" data-seed="#000000" aria-label="Mono"></button>
  <button class="s4-swatch" type="button" data-seed="#4f46e5" aria-label="Indigo"></button>
  <button class="s4-swatch" type="button" data-seed="#00796b" aria-label="Teal"></button>
</div>
```

| Attribute | Meaning |
|---|---|
| `data-seed` on `.s4-swatch` | the seed color; `#000000` (or empty) is Mono, S4's default monochrome theme (seed `null`) |
| `aria-label` | the color name, Title Case |
| `aria-pressed` | the current one (managed by swatches.js) |
| `data-theme-seed` on `.s4-swatches` | a click calls `S4.theme({ seed, variant: 'vibrant' })` (`data-variant` overrides); the group follows `S4.theme()` through the `s4-theme` event |
| `--s4-swatch-color` | public knob; set from `data-seed` |

48dp circles: a primary half over secondary and tertiary quarters, derived from the seed with CSS relative color syntax
(browsers without it show the plain seed). The selected swatch shrinks inside an on-surface ring with a gap (fast-spatial)
and shows a check badge.

**Behaviour** (`swatches.js`): single choice, `s4-change { seed, swatch }` on the group, one tab stop with arrow keys,
Home and End (roving tabindex).

**Do:** include Mono; name every color; keep 4–10 swatches.
**Don't:** use swatches for arbitrary color input; this picks a theme seed or a category color.

**Accessibility:** native buttons with `aria-pressed` and names; selection shown by ring and check, not color alone;
focus ring; forced-colors mode draws borders and a Highlight outline on the selected swatch.

**Tokens:** `--s4-size-touch-target`, `--md-sys-color-on-surface`, `surface-container-highest`,
`--md-sys-motion-spring-fast-spatial`, `--md-sys-state-*`.
