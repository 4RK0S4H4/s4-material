# 0003: Tokens

Status: accepted
Date: 2026-10-24

## Decisions

1. **Format: W3C Design Tokens (DTCG).** `tokens/src/*.tokens.json` uses `$value`, `$type`, `$description`, groups and
   `{alias}` references. Colors use the DTCG color object (`colorSpace`, `components`, `alpha`, `hex`).
2. **Names follow M3.** Paths mirror M3's token names (`md.sys.color.primary` → `--md-sys-color-primary`), so M3 docs,
   tools and knowledge apply directly. Orion-only tokens live under `s4.*` (`--s4-glass-*`, `--s4-shape-button`, `--s4-z-*`).
3. **Modes live on the token** in `$extensions["com.s4.modes"]`: `dark`, `high-contrast`, `dark-high-contrast`,
   `reduced-motion`, `reduced-transparency`. One token holds all its values, so modes can't drift apart.
4. **The build generates every mode block,** each wrapped in `:where()` (zero specificity) inside `@layer s4.tokens`, in a
   fixed order: base → dark → high contrast → dark + high contrast → reduced motion → reduced transparency. Device settings
   apply automatically; `data-theme`, `data-contrast`, `data-motion` and `data-glass` on `<html>` override them. This fixes,
   by construction, the three S4 Material cascade bugs found in the audit: reduced motion lost to Fluid, medium contrast
   beat `m3e`, and the no-blur fallback lost to the dark blocks.
5. **Color is generated, then stored.** `scripts/generate-color.mjs` builds all 49 roles in four modes from the seed in the
   file's generator block (monochrome). Other seeds and medium contrast are generated at run time with the same names.
6. **Springs are stored as physics** (stiffness, damping, duration) and turned into CSS `linear()` easings by the build.
   M3 Expressive durations carry over from S4 Material (375/415/568ms spatial, 153/222/300ms effects). New **calm**
   variants (same stiffness, critically damped) are for container transforms collapsing into their source.
7. **Kept S4 Material values** where they existed: type scale (Compose M3 values), float glass (84% / 82%, blur 32,
   saturate 1.35), fill glass (56% / 64%), M3 elevation shadows, z-index order, state layers. **Changed:** shape is stock
   M3 Expressive (decision 0001); disabled opacities use M3's 12% / 38% (S4 Material mixed 10%, 12% and 38%); spacing
   tokens now exist and are meant to be used.
8. **The build checks itself:** valid types, no unknown or mistyped aliases, no cycles, no duplicate tokens, and WCAG AA
   on 42 color pairs in all four color modes. `npm run check` also fails if generated files are stale, and runs in CI.

## Open for Phase 4
Glass tint for chrome vs overlays, the border highlight (S4 Material used none), the backdrop blooms, and the stacking
limit (currently 2) are provisional until the glass lab.
