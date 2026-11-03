# 0006: Liquid glass

Status: accepted, frost level pending (Liquid Glass Lab, 2026-11-03)
Builds on [0004](0004-glass.md): same places, same fallbacks, same "text on glass is `on-surface` at AA or better" promise.

## Decisions

| Topic | Decision |
|---|---|
| Material | **Frosted extra liquid.** Each glass shape refracts like a thick slab with a wide, rounded bevel (squircle profile, bezel 28px, thickness 44px, index 1.6): what's behind bends strongly at the rim. Picked "Extra Liquid" (C), with the note: more blur and more frost so colors never make text hard to read. No color split (no rainbow fringes on white). Specular rim lit from the top left, soft shadow. |
| Frost | Pending: light (8px blur, 24% base tint, AA 5.5:1), **frosted (12px, 34%, 7:1, suggested)**, heavy (18px, 46%, 7:1). Asked as "Frost Level" in the lab. |
| Text | **Adaptive tint** (B). The base tint is the floor; wherever what's behind would push text under the target contrast, the tint rises per pixel just enough to reach it. The outer 8px of a shape (always padding, never text or icons) may stay clearer so the bent rim stays visible. |
| Melting | **Melt** (A). Glass shapes within the melt distance fuse (smooth union); menus grow out of their button. |
| Where | **Every glass surface** (A): everything 0004 makes glass becomes liquid. Content stays solid. |
| iPhone | "Smooth and right" (A) on the WebGL engine. |

## How it ships (plan)

- Tokens: `--s4-glass-liquid-*` for bezel, thickness, index, blur, base tint, contrast target, highlight, melt distance.
- Chromium: SVG `backdrop-filter: url()` refraction over any DOM (no melting; per-pixel adaptive tint isn't possible
  in an SVG filter, so it uses the fixed-tint proof from 0004 for its tint instead).
- Safari and Firefox: no SVG filters in `backdrop-filter` yet, so over DOM content they get today's glass (0004) with
  the liquid specular rim and shadow. Over surfaces the app draws (photos, maps, charts, canvas) a WebGL helper gives
  the full effect, as in the lab. Revisit when WebKit ships `backdrop-filter: url()`.
- Fallbacks unchanged: high contrast, reduced transparency, `data-glass="off"` make glass solid; reduced motion turns
  off melting and the nav bar lens.
