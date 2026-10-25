# 0004: The glass layer

Status: accepted
Date: 2026-10-25 (Glass Lab: material C, edge B, backdrop A, surfaces A)

## Decisions

| Topic | Decision |
|---|---|
| Material | **Very clear**: 60% of `surface-container` over a 16px blur, saturate 1.8. Picked as "very clear (60%)"; a guarantee was added (below) so it can satisfy the brief's "WCAG AA over any background". |
| Guarantee | The backdrop filter compresses what shows through: light `contrast(0.74) brightness(1.1)` lifts blacks to 36/255; dark `brightness(0.8)` dims whites to 204/255. With that, `on-surface` text on glass is ≥ 4.5:1 over a pure black or white backdrop for all 97 schemes tested (monochrome + 24 hues × vibrant, tonal, fidelity, expressive), worst 4.52:1. `scripts/check-glass.mjs` re-proves it on every `npm run check`. |
| Text on glass | Only `on-surface`. Every glass surface redefines `on-surface-variant` as `on-surface`, so secondary text can't fall below AA by accident. |
| Edge | **Hairline**: a 1px light line on the edge that faces content (bottom of the app bar; top of nav bar, sheets, dialogs, menus). White at 50% in light, 12% in dark; none in high contrast. |
| Backdrop | **Flat**: the plain surface role. No blooms or washes. |
| Where | **Chrome and overlays**: top app bar once content scrolls under it, nav bar, modal nav rail, toolbars, menus, dialogs, bottom and side sheets, rich tooltips. Never content. Snackbars and plain tooltips stay solid inverse surfaces. |
| Stacking | At most two glass layers overlap. A third nested glass surface is made solid by CSS. |
| Fallbacks | High contrast, reduced transparency (`prefers-reduced-transparency`, `data-glass="off"`) and browsers without `backdrop-filter` make glass fully opaque (tokens). Medium contrast raises the tint to 80%. Forced colors draw a real border. |

## Why not "very clear" without the guarantee
At 60% with no compression, dark mode can fall to 3.4–3.7:1 for main text over white content, and light mode to under 4.5:1
for some seeds (66% tint would be needed for yellow-green tonal schemes). The compression keeps the clarity you chose and
moves the floor instead of the tint; side by side in the lab the two look nearly identical.

## Note on overlays
The owner noticed little difference between glass and solid overlays in the lab. That's expected: dialogs and sheets sit over
a 32% scrim, so their glass mostly shows a soft, darkened blur. The difference is clearest in menus over colorful content.
