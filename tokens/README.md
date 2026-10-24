# Tokens

The single source of truth for every value in S4 Orion.

```
tokens/
├── src/          W3C Design Tokens (DTCG) JSON: edit these
│   ├── color.*.tokens.json       color roles, light and dark (default monochrome scheme)
│   ├── typography.tokens.json    type scale (M3 roles + emphasized weights), font families
│   ├── shape.tokens.json         corner scale (stock M3 Expressive)
│   ├── spacing.tokens.json       4dp grid, margins, gaps
│   ├── elevation.tokens.json     shadow levels
│   ├── motion.tokens.json        springs (M3 Expressive + calm variants) and transition patterns
│   ├── state.tokens.json         state-layer opacities
│   └── glass.tokens.json         blur, tint opacity, border highlight, saturation, stacking
├── tokens.css    generated: CSS custom properties, light and dark
└── tokens.ts     generated: typed values for React and scripts
```

Rules:

- **Edit `src/`, then run the build.** `tokens.css` and `tokens.ts` carry a "generated, do not edit" header and are rebuilt from `src/`. CI fails if they're out of date.
- **Names follow M3.** CSS variables keep the official names (`--md-sys-color-primary`, `--md-sys-typescale-body-large-size`, `--md-sys-shape-corner-large`, `--md-sys-motion-spring-…`) so M3 knowledge transfers directly. Orion-only tokens use `--s4-…` (glass, layout, z-index).
- **Color is dynamic.** The JSON holds the default monochrome scheme. Any other seed is generated at run time by `m3color.js` (Material Color Utilities), which writes the same role names, so components never change.

The build script and the full token set arrive in Phase 3.
