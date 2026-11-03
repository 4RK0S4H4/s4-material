# 0006: Liquid glass, the Material way

Status: accepted, which raised surfaces pending (Liquid Glass Lab, 2026-11-03, second round)
Builds on [0004](0004-glass.md): same places, same fallbacks, same "text on glass is `on-surface` at AA or better" promise.

## What the owner said

Round 1 picks: Extra Liquid, adaptive tint, melt, every glass surface, smooth on iPhone; "more blur and slightly more frost".
Round 2 picks: Frosted, Liquid refraction, adaptive tint, melt, every glass surface, smooth on iPhone, with the note:
"a mix of Material and liquid glass: surfaces that are raised should get this look, but current liquid glass seems like
Apple's interface copy-pasted. I more just want the light refraction and transparency aspect than the actual liquid
effects, and I don't care about the corner edge highlights." The note overrides the earlier "melt" pick.

## Decisions

| Topic | Decision |
|---|---|
| Direction | **Material first.** M3 shapes, layout and elevation shadows stay. Only the material of raised (glass) surfaces changes: it refracts and is frosted. |
| Refraction | **Liquid** strength (bezel 20px, thickness 24px, index 1.5), with a **soft edge**: the bend eases in from zero at the very edge, so content under the rim joins the content outside it (no seam). A full-width bar bends only along the edge that faces content (bottom of the top app bar, top of the nav bar). |
| Frost | **Frosted**: 12px blur, 34% base tint of `surface-container`, saturation 1.15. |
| Text | **Adaptive tint** with a **7:1** target: the tint rises per pixel only where needed. The outer 8px (always padding) may stay a little clearer. |
| Dropped | Melting shapes, the nav bar lens, specular edge highlights, the glow shadow, floating pill layouts, color split. |
| Where | Every glass surface of 0004 (app bar when scrolled, nav bar, toolbars, menus, sheets, dialogs, rich tooltips). Pending: whether the FAB joins them ("Material With Liquid Glass" question in the lab). |

## How it ships (plan)

- Tokens: `--s4-glass-refraction-*` (bezel, thickness, index), blur 12px, base tint 0.34, contrast target 7.
- Chromium: SVG `backdrop-filter: url()` refraction over any DOM. An SVG filter can't adapt per pixel, so that path uses
  a fixed tint proven by `check-glass.mjs` (as 0004) at the 7:1 target.
- Safari and Firefox: no SVG filters in `backdrop-filter` yet, so over DOM content they get frosted glass at the same
  blur and tint, without the bend. Over surfaces the app draws (photos, maps, charts, canvas) a WebGL helper gives the
  full effect. Revisit when WebKit ships `backdrop-filter: url()` (fix in review).
- Fallbacks unchanged: high contrast, reduced transparency and `data-glass="off"` make glass solid.
